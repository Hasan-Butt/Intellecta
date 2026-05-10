package com.intellecta.intellecta_backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "http://localhost:3000")
public class UploadController {

    private final String UPLOAD_DIR = "uploads/images/";

    @PostMapping("/image")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Please select a file to upload."));
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Only image files are supported."));
        }

        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "image.jpg";
            String safeFilename = originalFilename.replaceAll("[^a-zA-Z0-9\\.\\-]", "_");
            String filename = UUID.randomUUID().toString() + "_" + safeFilename;
            
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath);

            // Construct URL mapping based on WebConfig resource handler for /uploads/** -> file:uploads/
            String fileUrl = "http://localhost:8080/uploads/images/" + filename;
            return ResponseEntity.ok(Map.of("url", fileUrl));
            
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to upload image"));
        }
    }
}
