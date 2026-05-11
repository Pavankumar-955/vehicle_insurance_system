package com.vehicleinsurance.service;

import com.vehicleinsurance.dto.DocumentResponse;
import com.vehicleinsurance.entity.Document;
import com.vehicleinsurance.entity.User;
import com.vehicleinsurance.exception.BadRequestException;
import com.vehicleinsurance.exception.ResourceNotFoundException;
import com.vehicleinsurance.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final AuthService authService;

    @Value("${file.upload.dir:backend/uploads}")
    private String uploadDir;

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final String[] ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"};

    /**
     * Save uploaded document
     */
    @Transactional
    public DocumentResponse uploadDocument(MultipartFile file, Document.DocumentType documentType,
                                          Long relatedEntityId, Document.RelatedEntityType relatedEntityType) {
        User user = authService.getCurrentUser();

        // Validate file
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("File size exceeds 10MB limit");
        }

        if (!isAllowedFile(file.getOriginalFilename())) {
            throw new BadRequestException("File type not allowed");
        }

        try {
            // Create directory structure
            String userDir = uploadDir + File.separator + "user_" + user.getId();
            Path userPath = Paths.get(userDir);
            Files.createDirectories(userPath);

            // Generate unique filename
            String originalName = file.getOriginalFilename();
            String extension = originalName.substring(originalName.lastIndexOf("."));
            String uniqueFileName = UUID.randomUUID().toString() + extension;
            Path filePath = userPath.resolve(uniqueFileName);

            // Save file
            Files.write(filePath, file.getBytes());

            // Save document record
            Document document = new Document();
            document.setUser(user);
            document.setDocumentType(documentType);
            document.setFileName(originalName);
            document.setFilePath(filePath.toString());
            document.setFileSize(file.getSize());
            document.setMimeType(file.getContentType());
            document.setRelatedEntityId(relatedEntityId);
            document.setRelatedEntityType(relatedEntityType);
            document.setActive(true);

            Document savedDocument = documentRepository.save(document);
            return mapToResponse(savedDocument);
        } catch (IOException e) {
            throw new BadRequestException("Error uploading file: " + e.getMessage());
        }
    }

    /**
     * Download document
     */
    @Transactional(readOnly = true)
    public byte[] downloadDocument(Long documentId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

        User currentUser = authService.getCurrentUser();
        boolean isAdmin = currentUser.getRoles().stream()
                .anyMatch(r -> r.getName().name().equals("ROLE_ADMIN"));
        
        if (!document.getUser().getId().equals(currentUser.getId()) && !isAdmin) {
            throw new BadRequestException("Permission denied");
        }

        try {
            return Files.readAllBytes(Paths.get(document.getFilePath()));
        } catch (IOException e) {
            throw new BadRequestException("Error downloading file: " + e.getMessage());
        }
    }

    /**
     * Get all documents for current user
     */
    @Transactional(readOnly = true)
    public List<DocumentResponse> getUserDocuments() {
        User user = authService.getCurrentUser();
        List<Document> documents = documentRepository.findByUserIdAndActiveOrderByUploadedAtDesc(user.getId(), true);
        return documents.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get documents by entity (policy, claim, ticket)
     */
    @Transactional(readOnly = true)
    public List<DocumentResponse> getDocumentsByEntity(Long entityId, Document.RelatedEntityType entityType) {
        List<Document> documents = documentRepository.findByRelatedEntityIdAndRelatedEntityType(entityId, entityType);
        return documents.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Delete document
     */
    @Transactional
    public void deleteDocument(Long documentId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

        User currentUser = authService.getCurrentUser();
        boolean isAdmin = currentUser.getRoles().stream()
                .anyMatch(r -> r.getName().name().equals("ROLE_ADMIN"));
        
        if (!document.getUser().getId().equals(currentUser.getId()) && !isAdmin) {
            throw new BadRequestException("Permission denied");
        }

        try {
            // Delete file
            Files.deleteIfExists(Paths.get(document.getFilePath()));
            // Delete record
            document.setActive(false);
            documentRepository.save(document);
        } catch (IOException e) {
            throw new BadRequestException("Error deleting file: " + e.getMessage());
        }
    }

    private DocumentResponse mapToResponse(Document document) {
        DocumentResponse response = new DocumentResponse();
        response.setId(document.getId());
        response.setDocumentType(document.getDocumentType().name());
        response.setFileName(document.getFileName());
        response.setFilePath(document.getFilePath());
        response.setFileSize(document.getFileSize());
        response.setMimeType(document.getMimeType());
        response.setRelatedEntityId(document.getRelatedEntityId());
        response.setRelatedEntityType(document.getRelatedEntityType() != null ? document.getRelatedEntityType().name() : null);
        response.setUploadedAt(document.getUploadedAt());
        response.setActive(document.getActive());
        return response;
    }

    private boolean isAllowedFile(String filename) {
        if (filename == null) return false;
        String lowerName = filename.toLowerCase();
        for (String ext : ALLOWED_EXTENSIONS) {
            if (lowerName.endsWith(ext)) {
                return true;
            }
        }
        return false;
    }
}
