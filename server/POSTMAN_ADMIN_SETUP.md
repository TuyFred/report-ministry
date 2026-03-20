# Admin Registration API Documentation

## Create Admin Account via Postman

Since admin accounts cannot be created through the regular registration form, use this API endpoint to create admin users.

### Endpoint
```
POST http://localhost:5000/api/auth/register-admin
```

### Headers
```
Content-Type: application/json
```

### Request Body (JSON)
```json
{
  "fullname": "System Administrator",
  "email": "admin@ministry.com",
  "password": "admin123456",
  "country": "Global",
  "contact": "+1234567890",
  "address": "Ministry Headquarters",
  "adminSecret": "ministry_admin_secret_2025_secure_key"
}
```

### Required Fields
- `fullname` - Full name of the admin
- `email` - Email address (must be unique)
- `password` - Password (minimum 6 characters recommended)
- `country` - Country or region
- `adminSecret` - Secret key for admin registration (from .env file: `ADMIN_SECRET_KEY`)

### Optional Fields
- `contact` - Phone number
- `address` - Physical address

### Success Response (200 OK)
```json
{
  "msg": "Admin account created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "fullname": "System Administrator",
    "email": "admin@ministry.com",
    "role": "admin",
    "country": "Global"
  }
}
```

### Error Responses

**403 Forbidden - Invalid Admin Secret**
```json
{
  "msg": "Unauthorized: Invalid admin secret key"
}
```

**400 Bad Request - User Already Exists**
```json
{
  "msg": "User already exists"
}
```

**500 Internal Server Error**
```json
{
  "msg": "Server Error"
}
```

---

## Important Security Notes

1. **Keep the ADMIN_SECRET_KEY secure** - This is stored in your `.env` file
2. **Never expose this endpoint** in production without additional authentication
3. **Change the default secret key** in production environments
4. **Regular users (leaders and members)** should use the normal registration form at `/register`

---

## Testing in Postman

### Step 1: Open Postman
Create a new request

### Step 2: Configure Request
- Method: `POST`
- URL: `http://localhost:5000/api/auth/register-admin`
- Headers: `Content-Type: application/json`

### Step 3: Add Body
Select "Body" → "raw" → "JSON" and paste the request body above

### Step 4: Send Request
Click "Send" to create the admin account

### Step 5: Save Token (Optional)
Copy the token from the response to use for authenticated requests

---

## After Creating Admin Account

Once the admin account is created, you can:
1. Login through the web interface at `http://localhost:3000/login`
2. Access admin-only features in the dashboard
3. Create additional admin accounts through the admin panel (if implemented)

---

## Environment Variables

Make sure your `.env` file contains:
```
ADMIN_SECRET_KEY=ministry_admin_secret_2025_secure_key
```

**IMPORTANT:** Change this secret key in production!
