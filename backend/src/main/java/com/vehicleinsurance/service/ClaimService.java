package com.vehicleinsurance.service;

import com.vehicleinsurance.dto.ApproveClaimRequest;
import com.vehicleinsurance.dto.ClaimRequest;
import com.vehicleinsurance.dto.ClaimResponse;
import com.vehicleinsurance.entity.Claim;
import com.vehicleinsurance.entity.Policy;
import com.vehicleinsurance.exception.BadRequestException;
import com.vehicleinsurance.exception.ResourceNotFoundException;
import com.vehicleinsurance.repository.ClaimRepository;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClaimService {

    private final ClaimRepository claimRepository;
    private final AuthService authService;
    private final PolicyService policyService;

    @Transactional
    public ClaimResponse submitClaim(ClaimRequest request) {
        var user = authService.getCurrentUser();
        Policy policy = policyService.getEntity(request.getPolicyId());
        if (!policy.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Policy does not belong to you");
        }
        if (policy.getStatus() != Policy.PolicyStatus.ACTIVE) {
            throw new BadRequestException("Cannot claim on expired or cancelled policy");
        }
        if (policy.getEndDate().isBefore(java.time.LocalDate.now())) {
            throw new BadRequestException("Policy has expired");
        }

        String claimNumber;
        do {
            claimNumber = "CLM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (claimRepository.existsByClaimNumber(claimNumber));

        Claim claim = new Claim();
        claim.setClaimNumber(claimNumber);
        claim.setUser(user);
        claim.setPolicy(policy);
        claim.setClaimDescription(request.getClaimDescription());
        claim.setClaimSettlementType(Claim.SettlementType.valueOf(request.getClaimSettlementType()));
        claim.setStatus(Claim.ClaimStatus.PENDING);

        claim = claimRepository.save(claim);
        return toResponse(claim);
    }

    public List<ClaimResponse> getMyClaims() {
        var user = authService.getCurrentUser();
        return claimRepository.findByUserId(user.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ClaimResponse getClaim(Long id) {
        var user = authService.getCurrentUser();
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim", "id", id));
        if (!claim.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Claim", "id", id);
        }
        return toResponse(claim);
    }

    public List<ClaimResponse> getAllClaimsForAdmin() {
        return claimRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public ClaimResponse approveOrRejectClaim(Long id, ApproveClaimRequest request) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim", "id", id));
        if (claim.getStatus() != Claim.ClaimStatus.PENDING) {
            throw new BadRequestException("Claim is already processed");
        }
        claim.setStatus(request.getStatus());
        claim.setAdminRemark(request.getAdminRemark());
        claim.setResolvedAt(LocalDateTime.now());
        claim = claimRepository.save(claim);
        return toResponse(claim);
    }

    private ClaimResponse toResponse(Claim c) {
        // Default to CASHLESS if settlement type is null (for legacy claims)
        Claim.SettlementType settlementType = c.getClaimSettlementType() != null ? c.getClaimSettlementType() : Claim.SettlementType.CASHLESS;
        
        return new ClaimResponse(
                c.getId(), c.getClaimNumber(), c.getUser().getId(), c.getUser().getFullName(),
                c.getPolicy().getId(), c.getPolicy().getPolicyNumber(), c.getClaimDescription(),
                settlementType, c.getStatus(), c.getAdminRemark(),
                c.getSubmittedAt(), c.getResolvedAt()
        );
    }

    public byte[] generateClaimApprovalCertificate(Long claimId) {
        var user = authService.getCurrentUser();
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim", "id", claimId));
        
        if (!claim.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Claim does not belong to you");
        }
        
        if (claim.getStatus() != Claim.ClaimStatus.APPROVED) {
            throw new BadRequestException("Only approved claims can download approval certificate");
        }
        
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(outputStream);
            PdfDocument pdfDocument = new PdfDocument(writer);
            Document document = new Document(pdfDocument);

            // Header
            document.add(new Paragraph("CLAIM APPROVAL CERTIFICATE")
                    .setFontSize(18)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER));

            document.add(new Paragraph("DriveSafe Insurance")
                    .setFontSize(12)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(20));

            // Certificate Body
            document.add(new Paragraph("This is to certify that the following claim has been APPROVED:")
                    .setFontSize(11)
                    .setMarginBottom(15));

            // Claim Details Table
            Table table = new Table(2);
            table.setWidth(500);
            
            addTableRow(table, "Claim Number:", claim.getClaimNumber());
            addTableRow(table, "Policy Number:", claim.getPolicy().getPolicyNumber());
            addTableRow(table, "Claimant Name:", claim.getUser().getFullName());
            addTableRow(table, "Email:", claim.getUser().getEmail());
            addTableRow(table, "Phone:", claim.getUser().getPhone());
            addTableRow(table, "Claim Description:", claim.getClaimDescription());
            addTableRow(table, "Settlement Type:", claim.getClaimSettlementType().toString());
            addTableRow(table, "Submitted Date:", claim.getSubmittedAt().format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm")));
            addTableRow(table, "Approved Date:", claim.getResolvedAt().format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm")));
            
            if (claim.getAdminRemark() != null && !claim.getAdminRemark().isEmpty()) {
                addTableRow(table, "Admin Remarks:", claim.getAdminRemark());
            }

            document.add(table);

            // Footer
            document.add(new Paragraph()
                    .setMarginTop(30));
            
            document.add(new Paragraph("Your claim has been successfully processed.")
                    .setFontSize(10)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setItalic());
            
            document.add(new Paragraph("For inquiries, please contact our support team.")
                    .setFontSize(10)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setItalic()
                    .setMarginBottom(20));

            document.add(new Paragraph("Generated on: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss")))
                    .setFontSize(9)
                    .setTextAlignment(TextAlignment.CENTER));

            document.close();
            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating claim approval certificate: " + e.getMessage(), e);
        }
    }

    private void addTableRow(Table table, String label, String value) {
        table.addCell(new com.itextpdf.layout.element.Cell().add(new Paragraph(label).setBold()));
        table.addCell(new com.itextpdf.layout.element.Cell().add(new Paragraph(value != null ? value : "—")));
    }
}
