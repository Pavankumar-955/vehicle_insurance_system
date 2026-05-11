package com.vehicleinsurance.service;

import com.vehicleinsurance.dto.AddReplyRequest;
import com.vehicleinsurance.dto.CreateTicketRequest;
import com.vehicleinsurance.dto.TicketReplyResponse;
import com.vehicleinsurance.dto.TicketResponse;
import com.vehicleinsurance.entity.Ticket;
import com.vehicleinsurance.entity.TicketReply;
import com.vehicleinsurance.entity.User;
import com.vehicleinsurance.exception.BadRequestException;
import com.vehicleinsurance.exception.ResourceNotFoundException;
import com.vehicleinsurance.repository.TicketReplyRepository;
import com.vehicleinsurance.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TicketReplyRepository ticketReplyRepository;
    private final AuthService authService;

    /**
     * Create a new support ticket
     */
    @Transactional
    public TicketResponse createTicket(CreateTicketRequest request) {
        User user = authService.getCurrentUser();

        try {
            Ticket.TicketCategory category = Ticket.TicketCategory.valueOf(request.getCategory().toUpperCase());
            Ticket.TicketPriority priority = Ticket.TicketPriority.valueOf(request.getPriority().toUpperCase());

            Ticket ticket = new Ticket();
            ticket.setTicketNumber(generateTicketNumber());
            ticket.setUser(user);
            ticket.setCategory(category);
            ticket.setSubject(request.getSubject());
            ticket.setDescription(request.getDescription());
            ticket.setPriority(priority);
            ticket.setStatus(Ticket.TicketStatus.OPEN);

            Ticket savedTicket = ticketRepository.save(ticket);
            return mapToResponse(savedTicket);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid category or priority value");
        }
    }

    /**
     * Get all tickets for current user
     */
    @Transactional(readOnly = true)
    public List<TicketResponse> getUserTickets() {
        User user = authService.getCurrentUser();
        List<Ticket> tickets = ticketRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        return tickets.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get all tickets (admin only)
     */
    @Transactional(readOnly = true)
    public List<TicketResponse> getAllTickets() {
        List<Ticket> tickets = ticketRepository.findAllByOrderByCreatedAtDesc();
        return tickets.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get a specific ticket by ID
     */
    @Transactional(readOnly = true)
    public TicketResponse getTicket(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        User currentUser = authService.getCurrentUser();
        boolean isAdmin = currentUser.getRoles().stream()
                .anyMatch(r -> r.getName().name().equals("ROLE_ADMIN"));

        // Users can only view their own tickets, admins can view all
        if (!ticket.getUser().getId().equals(currentUser.getId()) && !isAdmin) {
            throw new BadRequestException("You don't have permission to view this ticket");
        }

        return mapToResponse(ticket);
    }

    /**
     * Add a reply to a ticket
     */
    @Transactional
    public TicketReplyResponse addReply(Long ticketId, AddReplyRequest request) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        User currentUser = authService.getCurrentUser();
        boolean isAdmin = currentUser.getRoles().stream()
                .anyMatch(r -> r.getName().name().equals("ROLE_ADMIN"));

        // Users can only reply to their own tickets, admins can reply to any ticket
        if (!ticket.getUser().getId().equals(currentUser.getId()) && !isAdmin) {
            throw new BadRequestException("You don't have permission to reply to this ticket");
        }

        TicketReply.ReplyType replyType = isAdmin 
                ? TicketReply.ReplyType.ADMIN 
                : TicketReply.ReplyType.CUSTOMER;

        TicketReply reply = new TicketReply();
        reply.setTicket(ticket);
        reply.setUser(currentUser);
        reply.setMessage(request.getMessage());
        reply.setType(replyType);

        TicketReply savedReply = ticketReplyRepository.save(reply);

        // Update ticket's lastReplyAt
        ticket.setLastReplyAt(LocalDateTime.now());
        
        // If admin is replying, change status to IN_PROGRESS if it was OPEN
        if (replyType == TicketReply.ReplyType.ADMIN && ticket.getStatus() == Ticket.TicketStatus.OPEN) {
            ticket.setStatus(Ticket.TicketStatus.IN_PROGRESS);
        }
        // If customer is replying, change status to WAITING_FOR_ADMIN if it was WAITING_FOR_CUSTOMER
        else if (replyType == TicketReply.ReplyType.CUSTOMER && ticket.getStatus() == Ticket.TicketStatus.WAITING_FOR_CUSTOMER) {
            ticket.setStatus(Ticket.TicketStatus.WAITING_FOR_ADMIN);
        }

        ticketRepository.save(ticket);

        return mapReplyToResponse(savedReply);
    }

    /**
     * Update ticket status (admin only)
     */
    @Transactional
    public TicketResponse updateTicketStatus(Long ticketId, String newStatus) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        try {
            Ticket.TicketStatus status = Ticket.TicketStatus.valueOf(newStatus.toUpperCase());
            ticket.setStatus(status);

            if (status == Ticket.TicketStatus.CLOSED || status == Ticket.TicketStatus.RESOLVED) {
                ticket.setClosedAt(LocalDateTime.now());
            }

            Ticket updatedTicket = ticketRepository.save(ticket);
            return mapToResponse(updatedTicket);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid status value");
        }
    }

    /**
     * Close a ticket
     */
    @Transactional
    public TicketResponse closeTicket(Long ticketId) {
        return updateTicketStatus(ticketId, "CLOSED");
    }

    /**
     * Re-open a ticket (customer only - only their own closed/resolved tickets)
     */
    @Transactional
    public TicketResponse reopenTicket(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        User currentUser = authService.getCurrentUser();

        // Verify ticket belongs to current user
        if (!ticket.getUser().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You don't have permission to reopen this ticket");
        }

        // Can only reopen CLOSED or RESOLVED tickets
        if (ticket.getStatus() != Ticket.TicketStatus.CLOSED && ticket.getStatus() != Ticket.TicketStatus.RESOLVED) {
            throw new BadRequestException("Only closed or resolved tickets can be reopened");
        }

        ticket.setStatus(Ticket.TicketStatus.OPEN);
        ticket.setClosedAt(null);

        Ticket updatedTicket = ticketRepository.save(ticket);
        return mapToResponse(updatedTicket);
    }

    /**
     * Get replies for a ticket
     */
    @Transactional(readOnly = true)
    public List<TicketReplyResponse> getTicketReplies(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        User currentUser = authService.getCurrentUser();
        boolean isAdmin = currentUser.getRoles().stream()
                .anyMatch(r -> r.getName().name().equals("ROLE_ADMIN"));

        // Users can only view replies to their own tickets, admins can view all
        if (!ticket.getUser().getId().equals(currentUser.getId()) && !isAdmin) {
            throw new BadRequestException("You don't have permission to view these replies");
        }

        List<TicketReply> replies = ticketReplyRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
        return replies.stream()
                .map(this::mapReplyToResponse)
                .collect(Collectors.toList());
    }

    // ============ Helper Methods ============

    private TicketResponse mapToResponse(Ticket ticket) {
        TicketResponse response = new TicketResponse();
        response.setId(ticket.getId());
        response.setTicketNumber(ticket.getTicketNumber());
        response.setUserFullName(ticket.getUser().getFullName());
        response.setCategory(ticket.getCategory().name());
        response.setSubject(ticket.getSubject());
        response.setDescription(ticket.getDescription());
        response.setPriority(ticket.getPriority().name());
        response.setStatus(ticket.getStatus().name());
        response.setCreatedAt(ticket.getCreatedAt());
        response.setClosedAt(ticket.getClosedAt());
        response.setLastReplyAt(ticket.getLastReplyAt());
        response.setReplyCount(ticket.getReplies() != null ? ticket.getReplies().size() : 0);

        if (ticket.getReplies() != null) {
            response.setReplies(ticket.getReplies().stream()
                    .map(this::mapReplyToResponse)
                    .collect(Collectors.toList()));
        }

        return response;
    }

    private TicketReplyResponse mapReplyToResponse(TicketReply reply) {
        TicketReplyResponse response = new TicketReplyResponse();
        response.setId(reply.getId());
        response.setTicketId(reply.getTicket().getId());
        response.setUserName(reply.getUser().getFullName());
        boolean isAdmin = reply.getUser().getRoles().stream()
                .anyMatch(r -> r.getName().name().equals("ROLE_ADMIN"));
        response.setUserRole(isAdmin ? "ADMIN" : "CUSTOMER");
        response.setMessage(reply.getMessage());
        response.setType(reply.getType().name());
        response.setCreatedAt(reply.getCreatedAt());
        return response;
    }

    private String generateTicketNumber() {
        return "TKT" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
