# API Examples

Base URL: `http://localhost:8080`

---

## 1. Register (Customer)

**POST** `/api/auth/register`

**Request:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "john123",
  "phone": "9876543210"
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "id": 2,
  "email": "john@example.com",
  "fullName": "John Doe",
  "roles": ["ROLE_CUSTOMER"]
}
```

---

## 2. Login

**POST** `/api/auth/login`

**Request:**
```json
{
  "email": "admin@vehicleinsurance.com",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "id": 1,
  "email": "admin@vehicleinsurance.com",
  "fullName": "System Admin",
  "roles": ["ROLE_ADMIN"]
}
```

---

## 3. Get Insurance Plans (Public)

**GET** `/api/plans`  
**GET** `/api/plans?vehicleType=CAR`

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Basic Car",
    "description": "Essential coverage for cars. 12 months.",
    "premiumAmount": 5000.00,
    "coverageMonths": 12,
    "applicableVehicleType": "CAR",
    "active": true
  }
]
```

---

## 4. Add Vehicle (Customer, JWT)

**POST** `/api/vehicles`  
**Header:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "vehicleNumber": "MH12AB1234",
  "vehicleType": "CAR",
  "brand": "Toyota",
  "model": "Innova",
  "manufacturingYear": 2022
}
```

**Response (201):**
```json
{
  "id": 1,
  "vehicleNumber": "MH12AB1234",
  "vehicleType": "CAR",
  "brand": "Toyota",
  "model": "Innova",
  "manufacturingYear": 2022
}
```

---

## 5. Buy Policy (Customer, JWT)

**POST** `/api/policies/buy`  
**Header:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "vehicleId": 1,
  "insurancePlanId": 1
}
```

**Response (201):**
```json
{
  "id": 1,
  "policyNumber": "POL-A1B2C3D4",
  "userId": 2,
  "userFullName": "John Doe",
  "vehicleId": 1,
  "vehicleNumber": "MH12AB1234",
  "insurancePlanId": 1,
  "insurancePlanName": "Basic Car",
  "premiumAmount": 5000.00,
  "startDate": "2025-01-27",
  "endDate": "2026-01-27",
  "status": "ACTIVE",
  "purchasedAt": "2025-01-27T10:30:00"
}
```

---

## 6. Submit Claim (Customer, JWT)

**POST** `/api/claims`  
**Header:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "policyId": 1,
  "claimDescription": "Rear bumper damage in parking",
  "claimAmount": 15000.50
}
```

**Response (201):**
```json
{
  "id": 1,
  "claimNumber": "CLM-X9Y8Z7W6",
  "userId": 2,
  "userFullName": "John Doe",
  "policyId": 1,
  "policyNumber": "POL-A1B2C3D4",
  "claimDescription": "Rear bumper damage in parking",
  "claimAmount": 15000.50,
  "status": "PENDING",
  "adminRemark": null,
  "submittedAt": "2025-01-27T11:00:00",
  "resolvedAt": null
}
```

---

## 7. Admin – Get All Claims

**GET** `/api/admin/claims`  
**Header:** `Authorization: Bearer <admin_token>`

**Response (200):** Array of `ClaimResponse` objects.

---

## 8. Admin – Approve/Reject Claim

**PUT** `/api/admin/claims/{id}/status`  
**Header:** `Authorization: Bearer <admin_token>`

**Request:**
```json
{
  "status": "APPROVED",
  "adminRemark": "Verified. Approved for payment."
}
```
`status` must be `APPROVED` or `REJECTED`.

---

## Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

Validation errors:

```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "email": "Invalid email format",
    "password": "Password must be at least 6 characters"
  }
}
```
