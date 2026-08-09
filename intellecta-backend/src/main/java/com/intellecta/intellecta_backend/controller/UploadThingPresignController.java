package com.intellecta.intellecta_backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/api/uploadthing")
public class UploadThingPresignController {

    @Value("${uploadthing.token:}")
    private String uploadThingToken;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Proxies the presign request to UploadThing. 
     * This hides the Secret Key from the browser and avoids UploadThing's Origin block.
     * 
     * Body: {
     *   "files": [{ "name": "...", "size": 1234, "type": "image/png" }]
     * }
     */
    @PostMapping("/presign")
    public ResponseEntity<String> presign(@RequestBody Map<String, Object> body) {
        if (uploadThingToken == null || uploadThingToken.isBlank()) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\":\"UPLOADTHING_TOKEN is not configured on the server\"}");
        }

        String apiKey = extractApiKey(uploadThingToken);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-uploadthing-api-key", apiKey);
        headers.set("x-uploadthing-version", "6.4.0");

        // Add acl and contentDisposition which UploadThing expects
        body.put("acl", "public-read");
        body.put("contentDisposition", "inline");

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                    "https://api.uploadthing.com/v6/uploadFiles",
                    request,
                    String.class
            );
            return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    private String extractApiKey(String token) {
        try {
            // If token contains a dot or hyphen, it might be the base64url JSON
            String base64 = token.replace("-", "+").replace("_", "/");
            byte[] decoded = java.util.Base64.getDecoder().decode(base64);
            String json = new String(decoded);
            // Quick extraction to avoid adding Jackson dependency if not needed
            // {"apiKey":"sk_live_...", "appId":"..."}
            int keyStart = json.indexOf("\"apiKey\":\"") + 10;
            int keyEnd = json.indexOf("\"", keyStart);
            if (keyStart > 9 && keyEnd > keyStart) {
                return json.substring(keyStart, keyEnd);
            }
        } catch (Exception ignored) {}
        // Fallback: assume the token IS the api key
        return token;
    }
}
