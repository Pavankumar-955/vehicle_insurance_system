package com.vehicleinsurance.service;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.vehicleinsurance.entity.Policy;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class PdfGenerationService {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd MMM yyyy");
    private static final String COMPANY_NAME = "DriveSafe Insurance";

    /**
     * Format policy status for display
     */
    private String formatPolicyStatus(Policy.PolicyStatus status) {
        if (status == Policy.PolicyStatus.ACTIVE) {
            return "Active";
        } else if (status == Policy.PolicyStatus.EXPIRED) {
            return "Expired";
        } else if (status == Policy.PolicyStatus.CANCELLED) {
            return "Cancelled";
        }
        return status.name();
    }

    /**
     * Format policy type for display
     */
    private String formatPolicyType(Policy.PolicyType type) {
        if (type == Policy.PolicyType.COMPREHENSIVE) {
            return "Comprehensive";
        } else if (type == Policy.PolicyType.THIRD_PARTY) {
            return "Third Party";
        }
        return type.name();
    }

    /**
     * Generate PDF for a policy
     */
    public byte[] generatePolicyPdf(Policy policy) {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(outputStream);
            PdfDocument pdfDocument = new PdfDocument(writer);
            Document document = new Document(pdfDocument);

            // Header
            document.add(new Paragraph(COMPANY_NAME)
                    .setFontSize(20)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER));

            document.add(new Paragraph("Insurance Policy Document")
                    .setFontSize(14)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(20));

            // Policy Details Section
            document.add(new Paragraph("Policy Details")
                    .setFontSize(12)
                    .setBold()
                    .setMarginTop(10)
                    .setMarginBottom(10));

            Table policyTable = new Table(2);
            policyTable.setWidth(500);

            addTableRow(policyTable, "Policy Number:", policy.getPolicyNumber());
            addTableRow(policyTable, "Policy Status:", formatPolicyStatus(policy.getStatus()));
            addTableRow(policyTable, "Policy Type:", formatPolicyType(policy.getPolicyType()));
            addTableRow(policyTable, "Purchase Date:", policy.getPurchasedAt().format(DATE_FORMAT));
            addTableRow(policyTable, "Coverage Start:", policy.getStartDate().format(DATE_FORMAT));
            addTableRow(policyTable, "Coverage End:", policy.getEndDate().format(DATE_FORMAT));
            addTableRow(policyTable, "Premium Amount:", "₹" + String.format("%.2f", policy.getPremiumAmount()));

            document.add(policyTable);

            // Customer Details Section
            document.add(new Paragraph("Customer Information")
                    .setFontSize(12)
                    .setBold()
                    .setMarginTop(20)
                    .setMarginBottom(10));

            Table customerTable = new Table(2);
            customerTable.setWidth(500);

            addTableRow(customerTable, "Full Name:", policy.getUser().getFullName());
            addTableRow(customerTable, "Email:", policy.getUser().getEmail());
            addTableRow(customerTable, "Phone:", policy.getUser().getPhone());

            document.add(customerTable);

            // Vehicle Details Section
            document.add(new Paragraph("Insured Vehicle")
                    .setFontSize(12)
                    .setBold()
                    .setMarginTop(20)
                    .setMarginBottom(10));

            Table vehicleTable = new Table(2);
            vehicleTable.setWidth(500);

            addTableRow(vehicleTable, "Vehicle Number:", policy.getVehicle().getVehicleNumber());
            addTableRow(vehicleTable, "Vehicle Type:", policy.getVehicle().getVehicleType().name());
            addTableRow(vehicleTable, "Brand:", policy.getVehicle().getBrand());
            addTableRow(vehicleTable, "Model:", policy.getVehicle().getModel());
            addTableRow(vehicleTable, "Year:", String.valueOf(policy.getVehicle().getManufacturingYear()));

            document.add(vehicleTable);

            // Policy Type Details Section
            document.add(new Paragraph("Coverage Type")
                    .setFontSize(12)
                    .setBold()
                    .setMarginTop(20)
                    .setMarginBottom(10));

            Table coverageTable = new Table(2);
            coverageTable.setWidth(500);

            String coverageDescription = formatPolicyType(policy.getPolicyType()).equals("Comprehensive") 
                ? "Full coverage including damage, theft, third-party liability, and natural calamities"
                : "Third-party liability coverage only";

            addTableRow(coverageTable, "Coverage Type:", formatPolicyType(policy.getPolicyType()));
            addTableRow(coverageTable, "Details:", coverageDescription);

            document.add(coverageTable);

            // Footer
            document.add(new Paragraph()
                    .setMarginTop(40));

            document.add(new Paragraph("This is an electronically generated document. No signature is required.")
                    .setFontSize(10)
                    .setItalic()
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginTop(20));

            document.add(new Paragraph("Generated on: " + java.time.LocalDateTime.now().format(DATE_FORMAT))
                    .setFontSize(9)
                    .setTextAlignment(TextAlignment.CENTER));

            document.close();
            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF: " + e.getMessage(), e);
        }
    }

    /**
     * Generate claim receipt PDF
     */
    public byte[] generateClaimReceiptPdf(String claimNumber, String policyNumber, String description, String amount) {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(outputStream);
            PdfDocument pdfDocument = new PdfDocument(writer);
            Document document = new Document(pdfDocument);

            // Header
            document.add(new Paragraph(COMPANY_NAME)
                    .setFontSize(20)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER));

            document.add(new Paragraph("Claim Receipt")
                    .setFontSize(14)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(20));

            // Claim Details
            document.add(new Paragraph("Claim Information")
                    .setFontSize(12)
                    .setBold()
                    .setMarginBottom(10));

            Table table = new Table(2);
            table.setWidth(500);

            addTableRow(table, "Claim Number:", claimNumber);
            addTableRow(table, "Policy Number:", policyNumber);
            addTableRow(table, "Description:", description);
            addTableRow(table, "Claim Amount:", "₹" + amount);
            addTableRow(table, "Submission Date:", java.time.LocalDate.now().format(DATE_FORMAT));

            document.add(table);

            document.add(new Paragraph()
                    .setMarginTop(40));

            document.add(new Paragraph("Thank you for submitting your claim. We will review it within 7 business days.")
                    .setFontSize(10)
                    .setTextAlignment(TextAlignment.CENTER));

            document.close();
            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating claim receipt: " + e.getMessage(), e);
        }
    }

    private void addTableRow(Table table, String label, String value) {
        Cell labelCell = new Cell().add(new Paragraph(label).setBold());
        Cell valueCell = new Cell().add(new Paragraph(value != null ? value : "-"));
        table.addCell(labelCell);
        table.addCell(valueCell);
    }
}
