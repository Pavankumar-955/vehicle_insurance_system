package com.vehicleinsurance.controller;

import com.vehicleinsurance.dto.DocumentResponse;
import com.vehicleinsurance.entity.Document;
import com.vehicleinsurance.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    /**
     * Upload a document
     */
    @PostMapping("/upload")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<DocumentResponse> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("documentType") String documentType,
            @RequestParam(value = "relatedEntityId", required = false) Long relatedEntityId,
            @RequestParam(value = "relatedEntityType", required = false) String relatedEntityType) {

        Document.DocumentType docType = Document.DocumentType.valueOf(documentType.toUpperCase());
        Document.RelatedEntityType entityType = null;

        if (relatedEntityType != null) {
            entityType = Document.RelatedEntityType.valueOf(relatedEntityType.toUpperCase());
        }

        DocumentResponse response = documentService.uploadDocument(file, docType, relatedEntityId, entityType);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Download a document
     */
    @GetMapping("/{id}/download")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable Long id) {
        byte[] fileContent = documentService.downloadDocument(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"document.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(fileContent);
    }

    /**
     * Get all documents for current user
     */
    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<DocumentResponse>> getUserDocuments() {
        List<DocumentResponse> documents = documentService.getUserDocuments();
        return ResponseEntity.ok(documents);
    }

    /**
     * Get documents by entity
     */
    @GetMapping("/entity/{entityId}")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<List<DocumentResponse>> getDocumentsByEntity(
            @PathVariable Long entityId,
            @RequestParam String entityType) {

        Document.RelatedEntityType type = Document.RelatedEntityType.valueOf(entityType.toUpperCase());
        List<DocumentResponse> documents = documentService.getDocumentsByEntity(entityId, type);
        return ResponseEntity.ok(documents);
    }

    /**
     * Delete a document
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        documentService.deleteDocument(id);
        return ResponseEntity.ok().build();
    }
}
