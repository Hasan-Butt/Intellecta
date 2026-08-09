package com.intellecta.intellecta_backend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/uploadthing")
public class UploadThingPresignController {

    @Value("${uploadthing.token:}")
    private String uploadThingToken;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Proxies the presign request to UploadThing's /v7/prepareUpload endpoint.
     * This hides the Secret Key from the browser and avoids UploadThing's Origin block.
     *
     * Accepts the frontend's existing { files: [{ name, size, type }] } shape,
     * flattens it to the root-level { fileName, fileSize, fileType } shape
     * UploadThing v7 actually expects, then reshapes UploadThing's
     * { url, key } response back into { presignedUrl, key, fileUrl } so the
     * frontend's existing parsing logic keeps working unchanged.
     */
    @PostMapping("/presign")
    public ResponseEntity<String> presign(@RequestBody Map<String, Object> body) {
        if (uploadThingToken == null || uploadThingToken.isBlank()) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\":\"UPLOADTHING_TOKEN is not configured on the server\"}");
        }

        DecodedToken decoded = decodeToken(uploadThingToken);

        // --- Flatten the incoming { files: [...] } shape to root-level fields ---
        Object filesObj = body.get("files");
        if (!(filesObj instanceof List<?> files) || files.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("{\"error\":\"Request body must include a non-empty 'files' array\"}");
        }
        // Only the first file is used — UploadThing's /v7/prepareUpload handles one file per call
        @SuppressWarnings("unchecked")
        Map<String, Object> file = (Map<String, Object>) files.get(0);

        Map<String, Object> upstreamBody = Map.of(
                "fileName", file.get("name"),
                "fileSize", file.get("size"),
                "fileType", file.get("type")
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-uploadthing-api-key", decoded.apiKey());

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(upstreamBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                    "https://api.uploadthing.com/v7/prepareUpload",
                    request,
                    String.class
            );

            JsonNode upstream = objectMapper.readTree(response.getBody());
            String url = upstream.path("url").asText(null);
            String key = upstream.path("key").asText(null);

            if (url == null || key == null) {
                // Pass the raw upstream body through so the real error is visible
                return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
            }

            String fileUrl = "https://" + decoded.appId() + ".ufs.sh/f/" + key;

            Map<String, Object> reshaped = Map.of(
                    "presignedUrl", url,
                    "key", key,
                    "fileUrl", fileUrl
            );
            return ResponseEntity.ok(objectMapper.writeValueAsString(reshaped));

        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    private record DecodedToken(String apiKey, String appId) {}

    private DecodedToken decodeToken(String token) {
        try {
            String base64 = token.replace("-", "+").replace("_", "/");
            byte[] decodedBytes = Base64.getDecoder().decode(base64);
            JsonNode json = objectMapper.readTree(decodedBytes);
            String apiKey = json.path("apiKey").asText(token);
            String appId = json.path("appId").asText(null);
            return new DecodedToken(apiKey, appId);
        } catch (Exception e) {
            // Fallback: assume the token itself is the raw API key (appId unknown)
            return new DecodedToken(token, null);
        }
    }
}
