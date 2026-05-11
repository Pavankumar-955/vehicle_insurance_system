package com.vehicleinsurance.controller;

import com.vehicleinsurance.dto.AddReplyRequest;
import com.vehicleinsurance.dto.CreateTicketRequest;
import com.vehicleinsurance.dto.TicketResponse;
import com.vehicleinsurance.dto.TicketReplyResponse;
import com.vehicleinsurance.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    /**
     * Create a new support ticket
     */
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<TicketResponse> createTicket(@Valid @RequestBody CreateTicketRequest request) {
        TicketResponse response = ticketService.createTicket(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get all tickets for current user
     */
    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<TicketResponse>> getUserTickets() {
        List<TicketResponse> tickets = ticketService.getUserTickets();
        return ResponseEntity.ok(tickets);
    }

    /**
     * Get all tickets (admin only)
     */
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TicketResponse>> getAllTickets() {
        List<TicketResponse> tickets = ticketService.getAllTickets();
        return ResponseEntity.ok(tickets);
    }

    /**
     * Get a specific ticket by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<TicketResponse> getTicket(@PathVariable Long id) {
        TicketResponse ticket = ticketService.getTicket(id);
        return ResponseEntity.ok(ticket);
    }

    /**
     * Add a reply to a ticket
     */
    @PostMapping("/{id}/replies")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<TicketReplyResponse> addReply(@PathVariable Long id, @Valid @RequestBody AddReplyRequest request) {
        var reply = ticketService.addReply(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(reply);
    }

    /**
     * Update ticket status (admin only)
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TicketResponse> updateTicketStatus(@PathVariable Long id, @RequestParam String status) {
        TicketResponse updatedTicket = ticketService.updateTicketStatus(id, status);
        return ResponseEntity.ok(updatedTicket);
    }

    /**
     * Close a ticket
     */
    @PutMapping("/{id}/close")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<TicketResponse> closeTicket(@PathVariable Long id) {
        TicketResponse closedTicket = ticketService.closeTicket(id);
        return ResponseEntity.ok(closedTicket);
    }

    /**
     * Re-open a ticket (customer only)
     */
    @PutMapping("/{id}/reopen")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<TicketResponse> reopenTicket(@PathVariable Long id) {
        TicketResponse reopenedTicket = ticketService.reopenTicket(id);
        return ResponseEntity.ok(reopenedTicket);
    }

    /**
     * Get replies for a ticket
     */
    @GetMapping("/{id}/replies")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<List<TicketReplyResponse>> getTicketReplies(@PathVariable Long id) {
        var replies = ticketService.getTicketReplies(id);
        return ResponseEntity.ok(replies);
    }
}
