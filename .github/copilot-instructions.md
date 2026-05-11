# Copilot Instructions for Vehicle Insurance System

## Project Overview

Vehicle Insurance System is a full-stack web application (Spring Boot 3.2.2 + React 18) that manages vehicle insurance policies, claims, and customer interactions.

**Architecture:**
- **Backend:** Spring Boot REST API with JWT authentication, MySQL database
- **Frontend:** React + Vite with Tailwind CSS
- **Main Entities:** User, Vehicle, Policy, Claim, InsurancePlan, Ticket (planned)

---

## Key Architecture Patterns

### Entity Relationships
```
User (1) ──→ (N) Vehicle
User (1) ──→ (N) Policy
User (1) ──→ (N) Claim
User (1) ──→ (N) Ticket (planned)

Vehicle (1) ──→ (N) Policy
Policy (1) ──→ (N) Claim
Policy (1) ──→ (N) TicketReply (for issues)
InsurancePlan (1) ──→ (N) Policy
```

### Key Design Decisions

1. **Policy-Vehicle Uniqueness:** One user can have only ONE active policy per vehicle (enforced via unique constraint)
2. **Date Tracking:** All entities track `purchasedAt`/`submittedAt` and relevant dates for audit trails
3. **Pricing Model:** Premium amounts are ONE-TIME payments for entire coverage period, not monthly
4. **File Storage:** PDF documents stored in `backend/uploads/` directory structure
5. **Ticket System:** Separate entity from claims; supports user-admin conversations with history

---

## Development Setup & Build

### Prerequisites
- Java 17 (configured in `backend/pom.xml`)
- MySQL 8.0+
- Node.js 18+
- Maven 3.9+

### Build Commands

**Backend:**
```bash
cd backend
mvn clean install          # Build with dependencies
mvn spring-boot:run        # Run development server (usually port 8080)
```

**Frontend:**
```bash
cd frontend
npm install               # Install dependencies
npm run dev              # Start Vite dev server (usually port 5173)
npm run build            # Production build
```

### Application Properties
- **Backend Config:** `backend/src/main/resources/application.properties`
- **Local Overrides:** `application-local.properties.example` (rename to use)
- **Database:** MySQL connection configured via `spring.datasource.url`

### Database Initialization
- Schema: `database/schema.sql`
- Sample data: `database/sample-data.sql`
- Auto-init via DataSeeder class: `com.vehicleinsurance.config.DataSeeder`

---

## Important Code Patterns & Conventions

### Validation Strategy
- **Backend:** Use Jakarta validation annotations in DTOs and entities
  - `@NotBlank`, `@Email`, `@Size`, `@Pattern` for constraints
  - `@Valid` in controller method parameters
  - GlobalExceptionHandler catches validation errors
- **Frontend:** Mirror validations in React forms before submission
  - Regex patterns must match backend patterns exactly
  - Example: Phone `^[6-9]\d{9}$`, Email `^[^@]+@[^@]+\.(com|in)$`

### Registration Validation (Items 2-5)
```
Full Name:   ^[a-zA-Z ]+$         (letters and spaces only)
Phone:       ^[6-9]\d{9}$         (10 digits, starts with 6-9)
Email:       ^[^@]+@[^@]+\.(com|in)$
Password:    ^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$
             (min 8 chars, uppercase, lowercase, digit, special char)
```

### Repository Methods
- Named query methods follow Spring Data convention: `findBy{Field}`, `findBy{Field1}And{Field2}`
- Example for unique constraint: `findByUserIdAndVehicleId(Long userId, Long vehicleId)`
- Use `Optional<T>` return type for single results

### Service Layer Pattern
```java
// Service methods should:
// 1. Validate input (check business rules)
// 2. Query repositories
// 3. Perform business logic
// 4. Save entities
// 5. Return DTOs (never entities directly to frontend)

// Example: Policy creation must check
// - User exists
// - Vehicle belongs to user
// - No existing policy for this user-vehicle pair
// - Policy is active
```

### DTO Usage
- **Request DTOs:** Used for API input validation (e.g., `RegisterRequest`)
- **Response DTOs:** Always returned from controllers, never raw entities
- Fields map to entity fields but can be subset/transformed
- Timestamp fields formatted as strings in JSON

### Controller Structure
- Path: `@RequestMapping("/api/{resource}")`
- Methods map to REST verbs: `@PostMapping`, `@GetMapping`, `@PutMapping`
- Always use `@Valid` for DTO validation
- Return `ResponseEntity<T>` with appropriate HTTP status
- Example: `POST /api/policies/{policyId}/renew` for renewal

### Authentication & Security
- JWT tokens used: extracted from `Authorization: Bearer {token}` header
- SecurityConfig in `security/` package
- User roles: `ADMIN`, `CUSTOMER` (see Role enum)
- Use `@PreAuthorize("hasRole('CUSTOMER')")` on controller methods
- Current user via `authService.getCurrentUser()`

### Error Handling
- Custom exceptions in `exception/` package
- GlobalExceptionHandler catches all exceptions and returns ApiResponse
- ApiResponse structure: `{status: 200, message: "...", data: {...}}`
- Client expects this JSON structure

### Frontend Patterns
- **API Calls:** Centralized in `src/api/api.js` using axios
- **Authentication:** AuthContext provides `login()`, `logout()`, checks `isAuthenticated`
- **Navigation:** React Router routes in App.jsx
- **Components:** Reusable components in `src/components/`
- **Pages:** Full page components in `src/pages/`
- **Toast Notifications:** Use `react-hot-toast` for user feedback
- **Styling:** Tailwind CSS only (no inline styles)

---

## Common Development Tasks

### Adding a New Entity
1. Create entity class in `backend/src/main/java/com/vehicleinsurance/entity/`
2. Add `@Entity`, `@Table` annotations, use Lombok `@Data`
3. Create Repository interface extending `JpaRepository<T, Long>`
4. Create Request/Response DTOs
5. Create Service class with business logic
6. Create Controller with REST endpoints
7. Update database schema if new table

### Adding Validation
1. **Backend:** Add `@Pattern(regexp="...")` to DTO field
2. **Frontend:** Add regex validation in form onChange handler
3. Test both together - they must match

### Policy Renewal Logic
- Current policy has `startDate` and `endDate`
- Renewal should: `newEndDate = oldEndDate + (oldEndDate - oldStartDate)`
- This doubles the coverage period
- Create new Policy record or update `endDate`? (Check IMPLEMENTATION_PLAN.md)

### Policy PDF Download
- Use iText7 library (to be added to pom.xml)
- Include: policy number, user details, vehicle details, dates, premium
- Generate on-the-fly: `PolicyController` → `PolicyService.generatePolicyPDF()`
- Return `ResponseEntity<byte[]>` with PDF content type

### File Upload Handling
1. Accept `MultipartFile` in controller
2. Validate file type/size
3. Save to `backend/uploads/{entity}/{id}/` directory
4. Store path in entity
5. Return file URL or stored path to frontend
6. Frontend: `<a href={downloadUrl}>` to retrieve

---

## Testing Patterns

### Backend Testing
- Use `@SpringBootTest` for integration tests
- Use `@WebMvcTest` for controller tests
- Test validation rules with valid and invalid inputs
- Test unique constraints via repository
- Example: Verify one-policy-per-vehicle constraint

### Frontend Testing
- Test validation with valid/invalid inputs
- Test form submission with mocked API calls
- Verify error messages displayed
- Test navigation after successful operations

---

## Frontend Component Checklist

When creating new pages/components:
- [ ] Import necessary hooks and components
- [ ] Use Tailwind CSS classes (no inline styles)
- [ ] Add loading state for async operations
- [ ] Show error messages via `toast.error()`
- [ ] Show success messages via `toast.success()`
- [ ] Handle unauthorized access (redirect to login)
- [ ] Responsive design (mobile-first approach)
- [ ] Form validation before submission
- [ ] Disable submit button while loading

---

## Known Issues & TODOs

See `IMPLEMENTATION_PLAN.md` for:
- 12 planned feature enhancements
- Detailed file-by-file changes needed
- Phase-based implementation roadmap
- Dependency additions (iText7 for PDF)
- UI design improvements (Tailwind)

### Current State (Jan 2026)
- ✅ Basic CRUD for policies, claims, insurance plans
- ✅ JWT authentication
- ✅ Role-based access (ADMIN/CUSTOMER)
- ❌ File uploads for documents
- ❌ PDF generation for policies
- ❌ Ticket/support system
- ❌ Policy renewal feature
- ❌ Enhanced validation (phone, password strength)
- ❌ Enhanced UI design

---

## Quick Reference: File Locations

| Feature | Files |
|---------|-------|
| Authentication | `controller/AuthController.java`, `service/AuthService.java`, `security/` |
| Policies | `entity/Policy.java`, `controller/PolicyController.java`, `service/PolicyService.java` |
| Claims | `entity/Claim.java`, `controller/ClaimController.java`, `service/ClaimService.java` |
| Insurance Plans | `entity/InsurancePlan.java`, `controller/InsurancePlanController.java` |
| Users & Vehicles | `entity/User.java`, `entity/Vehicle.java`, `repository/` |
| Frontend Pages | `frontend/src/pages/` |
| Frontend API | `frontend/src/api/api.js` |
| Database | `database/schema.sql`, `database/sample-data.sql` |

---

## Contact & Documentation

- Full implementation plan: See `IMPLEMENTATION_PLAN.md`
- API examples: See `API-EXAMPLES.md`
- Database schema: `database/schema.sql`
- README: `README.md`

