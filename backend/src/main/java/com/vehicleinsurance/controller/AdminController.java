package com.vehicleinsurance.controller;

import com.vehicleinsurance.dto.*;
import com.vehicleinsurance.service.AdminService;
import com.vehicleinsurance.service.ClaimService;
import com.vehicleinsurance.service.PolicyService;
import com.vehicleinsurance.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final PolicyService policyService;
    private final ClaimService claimService;
    private final TicketService ticketService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/customers")
    public ResponseEntity<List<UserResponse>> getAllCustomers() {
        return ResponseEntity.ok(adminService.getAllCustomers());
    }

    @GetMapping("/policies")
    public ResponseEntity<List<PolicyResponse>> getAllPolicies() {
        return ResponseEntity.ok(policyService.getAllPoliciesForAdmin());
    }

    @GetMapping("/claims")
    public ResponseEntity<List<ClaimResponse>> getAllClaims() {
        return ResponseEntity.ok(claimService.getAllClaimsForAdmin());
    }

    @PutMapping("/claims/{id}/status")
    public ResponseEntity<ClaimResponse> approveOrRejectClaim(@PathVariable Long id,
                                                              @Valid @RequestBody ApproveClaimRequest request) {
        if (request.getStatus() == com.vehicleinsurance.entity.Claim.ClaimStatus.PENDING) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(claimService.approveOrRejectClaim(id, request));
    }

    // ============ TICKET MANAGEMENT ============

    @GetMapping("/tickets")
    public ResponseEntity<List<TicketResponse>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    @GetMapping("/tickets/{id}")
    public ResponseEntity<TicketResponse> getTicket(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicket(id));
    }

    @GetMapping("/tickets/{id}/replies")
    public ResponseEntity<List<TicketReplyResponse>> getTicketReplies(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketReplies(id));
    }

    @PostMapping("/tickets/{id}/replies")
    public ResponseEntity<TicketReplyResponse> addTicketReply(@PathVariable Long id,
                                                              @Valid @RequestBody AddReplyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.addReply(id, request));
    }

    @PutMapping("/tickets/{id}/status")
    public ResponseEntity<TicketResponse> updateTicketStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, status));
    }

    // Policy Cancellation Requests
    @GetMapping("/policy-cancellation-requests")
    public ResponseEntity<List<PolicyCancellationRequestResponse>> getAllCancellationRequests() {
        return ResponseEntity.ok(policyService.getAllCancellationRequestsForAdmin());
    }

    @GetMapping("/policy-cancellation-requests/pending")
    public ResponseEntity<List<PolicyCancellationRequestResponse>> getPendingCancellationRequests() {
        return ResponseEntity.ok(policyService.getPendingCancellationRequestsForAdmin());
    }

    @PostMapping("/policy-cancellation-requests/{id}/approve")
    public ResponseEntity<PolicyCancellationRequestResponse> approveCancellation(@PathVariable Long id,
                                                                                  @RequestBody Map<String, String> body) {
        String adminRemarks = body.getOrDefault("adminRemarks", "");
        return ResponseEntity.ok(policyService.approveCancellation(id, adminRemarks));
    }

    @PostMapping("/policy-cancellation-requests/{id}/reject")
    public ResponseEntity<PolicyCancellationRequestResponse> rejectCancellation(@PathVariable Long id,
                                                                                 @RequestBody Map<String, String> body) {
        String adminRemarks = body.getOrDefault("adminRemarks", "");
        return ResponseEntity.ok(policyService.rejectCancellation(id, adminRemarks));
    }
}
