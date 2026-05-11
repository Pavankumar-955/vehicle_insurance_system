package com.vehicleinsurance.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private DocumentType documentType; //  

    @NotBlank
    @Column(nullable = false, length = 255)
    private String fileName;

    @Column(nullable = false, length = 500)
    private String filePath; // Path where the file is stored

    @Column(nullable = false)
    private Long fileSize; // Size of the file in bytes

    @NotBlank
    @Column(nullable = false, length = 50)
    private String mimeType; // MIME type of the document

    // Reference to related entity (policy, claim, or ticket)
    private Long relatedEntityId;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private RelatedEntityType relatedEntityType;

    @Column(nullable = false, updatable = false)
    private LocalDateTime uploadedAt = LocalDateTime.now();

    @Column(nullable = false)
    private Boolean active = true;

    public enum DocumentType {
        POLICY_PDF,
        CLAIM_ATTACHMENT,
        IDENTITY_PROOF,
        VEHICLE_REGISTRATION,
        RECEIPT,
        TICKET_ATTACHMENT,
        OTHER
    }

    public enum RelatedEntityType {
        POLICY,
        CLAIM,
        TICKET
    }
}
