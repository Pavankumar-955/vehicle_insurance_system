package com.vehicleinsurance.repository;

import com.vehicleinsurance.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByUserIdOrderByUploadedAtDesc(Long userId);

    List<Document> findByDocumentType(Document.DocumentType documentType);

    List<Document> findByRelatedEntityIdAndRelatedEntityType(Long relatedEntityId, Document.RelatedEntityType relatedEntityType);

    Optional<Document> findByFilePathAndUserId(String filePath, Long userId);

    List<Document> findByUserIdAndActiveOrderByUploadedAtDesc(Long userId, Boolean active);

    // Delete all documents related to an entity (e.g., claims)
    void deleteByRelatedEntityIdAndRelatedEntityType(Long relatedEntityId, Document.RelatedEntityType relatedEntityType);
}
