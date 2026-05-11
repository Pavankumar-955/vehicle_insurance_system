package com.vehicleinsurance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketReplyResponse {

    private Long id;
    private Long ticketId;
    private String userName;
    private String userRole;
    private String message;
    private String type;
    private LocalDateTime createdAt;
}
