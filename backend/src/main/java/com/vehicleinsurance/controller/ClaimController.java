package com.vehicleinsurance.controller;

import com.vehicleinsurance.dto.ClaimRequest;
import com.vehicleinsurance.dto.ClaimResponse;
import com.vehicleinsurance.service.ClaimService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/claims")
@RequiredArgsConstructor
public class ClaimController {

    private final ClaimService claimService;

    @PostMapping
    public ResponseEntity<ClaimResponse> submitClaim(@Valid @RequestBody ClaimRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(claimService.submitClaim(request));
    }

    @GetMapping
    public ResponseEntity<List<ClaimResponse>> getMyClaims() {
        return ResponseEntity.ok(claimService.getMyClaims());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClaimResponse> getClaim(@PathVariable Long id) {
        return ResponseEntity.ok(claimService.getClaim(id));
    }

    @GetMapping("/{id}/approval-certificate")
    public ResponseEntity<byte[]> downloadClaimApprovalCertificate(@PathVariable Long id) {
        byte[] pdfContent = claimService.generateClaimApprovalCertificate(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"claim-approval-certificate.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfContent);
    }
}
