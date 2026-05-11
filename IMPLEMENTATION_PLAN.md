# Vehicle Insurance System - Enhancement Implementation Plan

## Overview
This document outlines the implementation strategy for 12 feature enhancements to the vehicle insurance system.

---

## Feature Breakdown & Implementation Order

### Phase 1: Data Model & Validation (Items 1-5)

#### Item 1: One Policy Per Vehicle Per User
- **Backend Changes:**
  - Add unique constraint: `@UniqueConstraint(columnNames = {"user_id", "vehicle_id"})` to Policy entity
  - Update PolicyRepository with query method: `findByUserIdAndVehicleId(Long userId, Long vehicleId)`
  - Add validation in PolicyService before creating policy
  
- **Files to Modify:**
  - `backend/src/main/java/com/vehicleinsurance/entity/Policy.java`
  - `backend/src/main/java/com/vehicleinsurance/repository/PolicyRepository.java`
  - `backend/src/main/java/com/vehicleinsurance/service/PolicyService.java`

#### Items 2-5: Registration Validation (Frontend + Backend)

**Backend Validation** (RegisterRequest DTO):
- Full Name: Only alphabets (Pattern: `^[a-zA-Z ]+$`)
- Phone: 10 digits starting with 6-9 (Pattern: `^[6-9]\d{9}$`)
- Email: Standard format with @, .com, or .in (Pattern: `^[^@]+@[^@]+\.(com|in)$`)
- Password: Min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char
  (Pattern: `^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$`)

**Frontend Validation** (Register.jsx):
- Real-time validation with visual feedback
- Error messages displayed inline
- Regex patterns match backend

**Files to Modify:**
- `backend/src/main/java/com/vehicleinsurance/dto/RegisterRequest.java`
- `backend/src/main/java/com/vehicleinsurance/entity/User.java` (update column sizes)
- `frontend/src/pages/Register.jsx`
- `frontend/src/api/api.js`

---

### Phase 2: Policy Date Management & Renewal (Items 6-7)

#### Item 6: Display Expiry & Purchase Dates
- **Current State:** Policy entity already has `startDate`, `endDate`, `purchasedAt`
- **Frontend Updates:**
  - Show dates in CustomerDashboard and AdminDashboard
  - Format: `YYYY-MM-DD` or `DD/MM/YYYY`
  - Display in PolicyResponse DTO
  
**Files to Modify:**
- `backend/src/main/java/com/vehicleinsurance/dto/PolicyResponse.java`
- `frontend/src/pages/CustomerDashboard.jsx`
- `frontend/src/pages/AdminDashboard.jsx`

#### Item 7: Policy Renewal
- **Backend Changes:**
  - Create `RenewPolicyRequest` DTO with policyId
  - Add `renewPolicy(policyId)` method to PolicyService
  - Calculate new endDate = endDate + (endDate - startDate) → double duration
  - Create new Policy record or update existing one
  - Need to decide: new policy record or update endDate?
  
**Recommendation:** Create new Policy record for audit trail
  
**Files to Create/Modify:**
- `backend/src/main/java/com/vehicleinsurance/dto/RenewPolicyRequest.java` (create)
- `backend/src/main/java/com/vehicleinsurance/service/PolicyService.java`
- `backend/src/main/java/com/vehicleinsurance/controller/PolicyController.java`
- `frontend/src/pages/CustomerDashboard.jsx`

---

### Phase 3: Pricing Model Overhaul (Item 8)

#### Item 8: One-Time Payment Instead of Monthly
- **Current Model:** `premiumAmount` in InsurancePlan (monthly)
- **New Model:** Total cost for entire duration displayed upfront
- **Changes:**
  - InsurancePlan: `premiumAmount` = total cost for `coverageMonths`
  - UI shows: "Pay ₹X for Y months coverage" (not monthly)
  - Database: No schema change, semantic change only
  - UI: BuyPolicy.jsx calculates and shows: totalCost = premiumAmount
  
**Files to Modify:**
- `backend/src/main/java/com/vehicleinsurance/dto/InsurancePlanResponse.java`
- `frontend/src/pages/BuyPolicy.jsx`
- `frontend/src/pages/InsurancePlans.jsx`

---

### Phase 4: Support Ticketing System (Item 9)

#### Item 9: Ticket Management System
- **New Entities:**
  - `Ticket.java` - Main ticket entity
  - `TicketReply.java` - Conversation history
  
- **Ticket Entity Fields:**
  ```
  - id (PK)
  - ticketNumber (unique)
  - userId (FK)
  - category (enum: POLICY, CLAIM, OTHER)
  - title
  - description
  - status (enum: OPEN, IN_PROGRESS, CLOSED)
  - createdAt
  - closedAt
  - adminNotes
  ```

- **TicketReply Entity Fields:**
  ```
  - id (PK)
  - ticketId (FK)
  - userId (FK) - who sent it
  - message
  - isAdminReply (boolean)
  - createdAt
  ```

- **Backend:**
  - `TicketRepository.java`
  - `TicketReplyRepository.java`
  - `TicketService.java`
  - `TicketController.java`
  - DTOs: `TicketRequest`, `TicketResponse`, `TicketReplyRequest`, `TicketReplyResponse`

- **Frontend:**
  - `pages/Tickets.jsx` (user view - raise, view, chat)
  - `pages/AdminTickets.jsx` (admin view - list, reply, close)
  - `components/TicketChat.jsx` (conversation UI)

**Files to Create:**
- Backend: 7 files (entities, repository, service, controller, DTOs)
- Frontend: 3 files (pages, components)

---

### Phase 5: Document Management (Items 10-11)

#### Item 10: PDF Upload for Claims
- **Changes to Claim Entity:**
  - Add `documentPath` (String) field
  - Add `documentName` field
  - Add `uploadedAt` field
  
- **File Upload Handling:**
  - Use Spring's `MultipartFile`
  - Store in `backend/uploads/claims/` folder
  - Or use database BLOB (not recommended for PDFs)
  - Return file URL in ClaimResponse
  
- **Backend:**
  - Update `Claim.java` entity
  - Update `ClaimService.java` - add file upload method
  - Update `ClaimController.java` - add multipart endpoint
  - Create file upload utility class
  
- **Frontend:**
  - Update `pages/Claims.jsx` - add file input
  - File validation: `.pdf` only
  - Show uploaded file in admin view

**Files to Modify/Create:**
- `backend/src/main/java/com/vehicleinsurance/entity/Claim.java`
- `backend/src/main/java/com/vehicleinsurance/service/ClaimService.java`
- `backend/src/main/java/com/vehicleinsurance/controller/ClaimController.java`
- `backend/src/main/java/com/vehicleinsurance/util/FileUploadUtil.java` (create)
- `frontend/src/pages/Claims.jsx`

#### Item 11: Policy PDF Download
- **Implementation:**
  - Add `generatePolicyPDF(policyId)` method to PolicyService
  - Use iText7 or Apache PDFBox library
  - Include:
    - Project name (Vehicle Insurance System)
    - Policy name, number
    - User details (name, email, phone)
    - Vehicle details (number, type, brand, model)
    - Policy dates (start, end)
    - Premium amount, payment details
    - Purchase date
  
- **Frontend:**
  - Add "Download Policy PDF" button in policy view
  - Trigger download on click
  
- **Backend Dependency:**
  - Add to pom.xml: `com.itextpdf:itext7-core` or similar

**Files to Modify/Create:**
- `backend/pom.xml` (add PDF library)
- `backend/src/main/java/com/vehicleinsurance/service/PolicyService.java`
- `backend/src/main/java/com/vehicleinsurance/controller/PolicyController.java`
- `backend/src/main/java/com/vehicleinsurance/util/PDFGeneratorUtil.java` (create)
- `frontend/src/pages/CustomerDashboard.jsx`

---

### Phase 6: UI/UX Enhancement (Item 12)

#### Item 12: Tailwind CSS Design Improvements
- **Components to Enhance:**
  1. `Layout.jsx` - Navigation, footer
  2. `Landing.jsx` - Hero section, features
  3. `Login.jsx` - Form styling
  4. `Register.jsx` - Form styling
  5. `InsurancePlans.jsx` - Card layout, plan display
  6. `BuyPolicy.jsx` - Policy purchase form
  7. `CustomerDashboard.jsx` - Policy list, vehicles
  8. `AdminDashboard.jsx` - Stats, policy management
  9. `Claims.jsx` - Claims form, list
  10. New pages - Tickets, AdminTickets

- **Design Improvements:**
  - Modern color scheme (gradients, shadows)
  - Responsive grid layouts
  - Better button states (hover, active, disabled)
  - Form validation indicators
  - Data tables with better styling
  - Modal dialogs for actions
  - Empty states for lists
  - Loading skeletons
  - Success/error message styling

**Files to Modify:**
- All `frontend/src/pages/*.jsx` files
- `frontend/src/components/Layout.jsx`
- `frontend/src/index.css` (Tailwind utilities)

---

## Implementation Strategy

### Phase Order (Recommended):
1. **Phase 1** - Validation & constraints (foundation)
2. **Phase 2** - Policy dates & renewal (core feature)
3. **Phase 3** - Pricing model (customer-facing change)
4. **Phase 4** - Ticket system (new feature, independent)
5. **Phase 5** - Document management (depends on backend setup)
6. **Phase 6** - UI enhancements (last, visible improvements)

### Key Technical Considerations:

1. **Database Migration:**
   - Add new columns for Ticket and TicketReply entities
   - Add unique constraint to Policy (user_id, vehicle_id)
   - Add document fields to Claim

2. **File Upload Storage:**
   - Create `backend/uploads/` directory
   - Configure Spring Boot file upload properties
   - Handle file permissions and cleanup

3. **PDF Generation:**
   - Test PDF library (iText7, PDFBox)
   - Template design for policy PDF
   - Performance considerations for batch generation

4. **Testing:**
   - Unit tests for validation rules
   - Integration tests for unique constraint
   - API endpoint tests for file upload
   - Frontend form validation tests

5. **Frontend State Management:**
   - May need Context for ticket management
   - Form state for multi-step processes

---

## Dependencies to Add

### Backend (pom.xml):
```xml
<!-- PDF Generation -->
<dependency>
    <groupId>com.itextpdf</groupId>
    <artifactId>itext7-core</artifactId>
    <version>7.2.6</version>
</dependency>

<!-- Date/Time improvements (already have Lombok) -->
<!-- File upload (Spring Web covers this) -->
```

### Frontend (package.json):
```json
{
  "react-pdf": "^7.0.0",        // For PDF preview/display
  "pdfkit": "^0.13.0"            // Optional: PDF generation on frontend
}
```

---

## Testing Checklist

- [ ] One policy per vehicle constraint enforced
- [ ] Registration validation works frontend + backend
- [ ] Phone number accepts only 10 digits starting with 6-9
- [ ] Email validation for .com and .in
- [ ] Password strength validation
- [ ] Policy dates displayed correctly
- [ ] Policy renewal creates correct duration
- [ ] Pricing displays one-time payment
- [ ] Ticket creation, reply, and closure working
- [ ] PDF uploads for claims (PDF only)
- [ ] Policy PDF download includes all required details
- [ ] UI responsive on mobile/tablet/desktop
- [ ] All Tailwind classes applied correctly

---

## Estimated File Changes

**Backend:** ~15 files (new entities, services, controllers, DTOs)
**Frontend:** ~10 files (new pages, updated components)
**Configuration:** 2 files (pom.xml, package.json)

**Total Complexity:** High (this is essentially building 3-4 new features)
