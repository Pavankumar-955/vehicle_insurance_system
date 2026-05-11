# Vehicle Insurance System

A full-stack **Vehicle Insurance** web application with role-based access (Admin & Customer), JWT authentication, and REST API.

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Backend  | Spring Boot 3, Spring Security (JWT), Spring Data JPA |
| Frontend | React 18 (Vite), Tailwind CSS, Axios, React Router    |
| Database | MySQL 8                              |

---

## Prerequisites

- **JDK 17+**
- **Maven 3.6+**
- **Node.js 18+** and **npm**
- **MySQL 8** (running on `localhost:3306`)

---

## 1. Database

- **MySQL 8** must be running on `localhost:3306`.
- Create a database (optional; the app can create it if `createDatabaseIfNotExist=true`):

```sql
CREATE DATABASE IF NOT EXISTS vehicle_insurance_db;
```

**If you see `Access denied for user 'root'@'localhost'`**, your MySQL password is not `root`. Use one of these:

**Option A – Environment variables (PowerShell):**
```powershell
$env:MYSQL_USER="root"
$env:MYSQL_PASSWORD="your_actual_mysql_password"
cd backend; mvn spring-boot:run
```

**Option B – Local properties file:**
```bash
cp backend/src/main/resources/application-local.properties.example backend/src/main/resources/application-local.properties
```
Edit `application-local.properties`, set `spring.datasource.password=your_actual_mysql_password`, then:
```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

---

## 2. Backend (Spring Boot)

```bash
cd backend
mvn spring-boot:run
```

- API: **http://localhost:8080**
- On first run, **DataSeeder** creates:
  - Roles: `ROLE_ADMIN`, `ROLE_CUSTOMER`
  - Admin: `admin@vehicleinsurance.com` / `admin123`
  - Sample insurance plans (Car/Bike, Basic & Comprehensive)

---

## 3. Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

- App: **http://localhost:5173**
- Set `VITE_API_URL=http://localhost:8080` in `.env` if the API is not on 8080.

---

## 4. Run Both

**Terminal 1 – Backend:**

```bash
cd backend && mvn spring-boot:run
```

**Terminal 2 – Frontend:**

```bash
cd frontend && npm install && npm run dev
```

---

## Default Logins

| Role    | Email                         | Password  |
|---------|-------------------------------|-----------|
| Admin   | admin@vehicleinsurance.com    | admin123  |
| Customer| (register via UI)             | (your)    |

---

## Features

### Customer
- Register / Login (JWT)
- Dashboard (vehicles, policies overview)
- Add vehicle (number, type, brand, model, year)
- View and filter insurance plans (Car/Bike)
- Buy policy (select vehicle + plan)
- View active policies
- Submit claim (policy, description, amount)
- View claim status

### Admin
- Admin dashboard (counts: customers, policies, claims, pending claims)
- Create / Update / Delete insurance plans
- View all customers
- View all policies
- Approve or reject claims (with optional remark)
- View reports (policies, claims)

---

## Project Structure

```
vehicle-insurance-system/
├── backend/
│   └── src/main/java/com/vehicleinsurance/
│       ├── config/         # DataSeeder
│       ├── controller/     # Auth, Vehicle, Plan, Policy, Claim, Admin
│       ├── dto/            # Request/Response DTOs
│       ├── entity/         # User, Role, Vehicle, InsurancePlan, Policy, Claim
│       ├── exception/      # GlobalExceptionHandler, ResourceNotFound, BadRequest
│       ├── repository/     # JPA repositories
│       ├── security/       # JWT, UserPrincipal, Filters, SecurityConfig
│       └── service/        # Auth, Vehicle, InsurancePlan, Policy, Claim, Admin
├── frontend/
│   └── src/
│       ├── api/            # Axios instance + API functions
│       ├── components/     # Layout
│       ├── context/       # AuthContext
│       ├── pages/         # Landing, Login, Register, CustomerDashboard, AdminDashboard, InsurancePlans, BuyPolicy, Claims
│       ├── App.jsx
│       └── main.jsx
├── database/
│   ├── schema.sql         # Reference schema
│   └── sample-data.sql    # Optional seed data
├── API-EXAMPLES.md        # Sample requests/responses
└── README.md
```

---

## API Overview

| Method | Endpoint               | Auth   | Description        |
|--------|------------------------|--------|--------------------|
| POST   | /api/auth/register     | No     | Register customer  |
| POST   | /api/auth/login        | No     | Login              |
| GET    | /api/auth/me           | JWT    | Current user       |
| GET    | /api/plans             | No     | List active plans  |
| GET    | /api/vehicles          | JWT    | My vehicles        |
| POST   | /api/vehicles          | JWT    | Add vehicle        |
| POST   | /api/policies/buy      | JWT    | Buy policy         |
| GET    | /api/policies          | JWT    | My policies        |
| POST   | /api/claims            | JWT    | Submit claim       |
| GET    | /api/claims            | JWT    | My claims          |
| GET    | /api/admin/dashboard   | Admin  | Dashboard stats    |
| GET    | /api/admin/plans       | Admin  | All plans          |
| POST   | /api/admin/plans       | Admin  | Create plan        |
| PUT    | /api/admin/plans/{id}  | Admin  | Update plan        |
| DELETE | /api/admin/plans/{id}  | Admin  | Delete plan        |
| GET    | /api/admin/customers   | Admin  | All customers      |
| GET    | /api/admin/policies    | Admin  | All policies       |
| GET    | /api/admin/claims      | Admin  | All claims         |
| PUT    | /api/admin/claims/{id}/status | Admin | Approve/Reject claim |

---

## Sample API

See **API-EXAMPLES.md** for JSON request/response examples.

---

## UI

- **Theme:** Blue/Green/white, Tailwind
- **Components:** Cards, tables, modals, toasts, loading spinners
- **Responsive:** Works on mobile and desktop
- **Protected routes:** Customer vs Admin based on JWT roles

---

## Optional: PDF Download

The “Download Policy (PDF optional)” is not implemented. To add it:

1. Backend: use a library like **iText** or **OpenPDF** to generate PDF from `Policy` and expose e.g. `GET /api/policies/{id}/pdf`.
2. Frontend: call that URL and trigger download (e.g. `window.open` or `axios` with `responseType: 'blob'`).

---

## License

MIT.
