# Auth Service Error Codes Documentation

This document provides comprehensive information about all error codes returned by the Auth Service, including HTTP status codes, error messages, and resolution steps.

## Error Response Format

All error responses follow this consistent structure:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "additional": "context information"
    }
  }
}
```

## HTTP Status Codes

| Status Code | Description | Usage |
|------------|-------------|-------|
| 200 | OK | Successful operation |
| 201 | Created | Resource created successfully (register) |
| 400 | Bad Request | Validation errors, malformed requests |
| 401 | Unauthorized | Authentication failures, invalid tokens |
| 403 | Forbidden | Account locked, inactive |
| 423 | Locked | Account is locked (alternative to 403) |
| 500 | Internal Server Error | Unexpected server errors |

---

## Error Codes by Category

### 1. Validation Errors (HTTP 400)

#### VALIDATION_ERROR
- **Message**: "Invalid request format" or field-specific validation message
- **Cause**: Request body fails validation rules (required fields, format, length)
- **Examples**:
  - Empty required fields
  - Invalid email format
  - Password too short (min 8 characters)
  - Missing required fields
- **Resolution**: Check request body against API specification
- **Sample Response**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Key: 'RegisterRequest.Email' Error:Field validation for 'Email' failed on the 'email' tag",
    "details": {
      "error": "detailed validation error"
    }
  }
}
```

#### INVALID_EMAIL
- **Message**: "Invalid email format"
- **Cause**: Email does not match regex pattern `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
- **Resolution**: Provide valid email address
- **Sample Response**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_EMAIL",
    "message": "Invalid email format"
  }
}
```

#### WEAK_PASSWORD
- **Message**: "Password must be at least 8 characters long"
- **Cause**: Password length < 8 characters
- **Resolution**: Use password with minimum 8 characters
- **Sample Response**:
```json
{
  "success": false,
  "error": {
    "code": "WEAK_PASSWORD",
    "message": "Password must be at least 8 characters long"
  }
}
```

#### EMAIL_EXISTS
- **Message**: "Email already registered"
- **Cause**: Attempting to register with an email that already exists in the database
- **Resolution**: Use different email or login with existing account
- **Sample Response**:
```json
{
  "success": false,
  "error": {
    "code": "EMAIL_EXISTS",
    "message": "Email already registered"
  }
}
```

#### PHONE_EXISTS
- **Message**: "Phone number already registered"
- **Cause**: Attempting to register with a phone number that already exists
- **Resolution**: Use different phone number or omit phone field
- **Sample Response**:
```json
{
  "success": false,
  "error": {
    "code": "PHONE_EXISTS",
    "message": "Phone number already registered"
  }
}
```

---

### 2. Authentication Errors (HTTP 401)

#### INVALID_CREDENTIALS
- **Message**: "Invalid email or password"
- **Cause**: 
  - Email not found in database
  - Password does not match stored hash
- **Resolution**: Verify email and password are correct
- **Sample Response**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

#### NO_TOKEN
- **Message**: "Authorization header required"
- **Cause**: Request missing `Authorization: Bearer <token>` header
- **Resolution**: Include valid access token in Authorization header
- **Sample Response**:
```json
{
  "success": false,
  "error": {
    "code": "NO_TOKEN",
    "message": "Authorization header required"
  }
}
```

#### INVALID_TOKEN
- **Message**: "Invalid or expired access token" or "Invalid or expired refresh token"
- **Cause**: 
  - Token is malformed
  - Token has expired
  - Token signature is invalid
  - Token has been revoked
- **Resolution**: Obtain new token via login or refresh
- **Sample Response**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Invalid or expired access token"
  }
}
```

#### UNAUTHORIZED
- **Message**: "User not authenticated"
- **Cause**: 
  - No valid session found
  - User context not available
  - Required authentication missing
- **Resolution**: Login to obtain valid session
- **Sample Response**:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "User not authenticated"
  }
}
```

---

### 3. Authorization Errors (HTTP 403)

#### ACCOUNT_INACTIVE
- **Message**: "Account is not active"
- **Cause**: User account `is_active` flag is set to false
- **Resolution**: Contact administrator to activate account
- **Sample Response**:
```json
{
  "success": false,
  "error": {
    "code": "ACCOUNT_INACTIVE",
    "message": "Account is not active"
  }
}
```

---

### 4. Account Locked Errors (HTTP 423)

#### ACCOUNT_LOCKED
- **Message**: "Account is locked due to multiple failed login attempts. Please try again later."
- **Cause**: 
  - Too many failed login attempts
  - Account locked until `locked_until` timestamp
- **Resolution**: Wait until lock expires or contact administrator
- **Sample Response**:
```json
{
  "success": false,
  "error": {
    "code": "ACCOUNT_LOCKED",
    "message": "Account is locked due to multiple failed login attempts. Please try again later."
  }
}
```

---

### 5. Internal Server Errors (HTTP 500)

#### INTERNAL_ERROR
- **Message**: Various internal error messages
- **Cause**: 
  - Database connection failures
  - Unexpected server errors
  - Service unavailable
- **Resolution**: Retry request, check service health, contact administrator
- **Sample Response**:
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Failed to register user. Please try again later.",
    "details": {
      "error": "database connection error"
    }
  }
}
```

---

## Error Handling by Endpoint

### POST /api/v1/auth/register

| Error Code | HTTP Status | Trigger |
|-----------|-------------|---------|
| VALIDATION_ERROR | 400 | Invalid input format |
| INVALID_EMAIL | 400 | Email format invalid |
| WEAK_PASSWORD | 400 | Password < 8 characters |
| EMAIL_EXISTS | 400 | Email already registered |
| PHONE_EXISTS | 400 | Phone already registered |
| INTERNAL_ERROR | 500 | Database/server error |

### POST /api/v1/auth/login

| Error Code | HTTP Status | Trigger |
|-----------|-------------|---------|
| VALIDATION_ERROR | 400 | Empty email/password |
| INVALID_CREDENTIALS | 401 | Wrong email/password |
| ACCOUNT_INACTIVE | 403 | Account not active |
| ACCOUNT_LOCKED | 423 | Too many failed attempts |
| INTERNAL_ERROR | 500 | Database/server error |

### GET /api/v1/auth/validate

| Error Code | HTTP Status | Trigger |
|-----------|-------------|---------|
| NO_TOKEN | 401 | Missing Authorization header |
| INVALID_TOKEN | 401 | Invalid/expired token |
| UNAUTHORIZED | 401 | User not found |

### POST /api/v1/auth/refresh

| Error Code | HTTP Status | Trigger |
|-----------|-------------|---------|
| VALIDATION_ERROR | 400 | Missing refresh_token |
| INVALID_TOKEN | 401 | Invalid/expired refresh token |
| UNAUTHORIZED | 401 | User not found |
| INTERNAL_ERROR | 500 | Token generation failed |

### POST /api/v1/auth/change-password

| Error Code | HTTP Status | Trigger |
|-----------|-------------|---------|
| VALIDATION_ERROR | 400 | Invalid input |
| UNAUTHORIZED | 401 | Not authenticated |
| INVALID_CREDENTIALS | 401 | Wrong old password |
| WEAK_PASSWORD | 400 | New password too weak |
| INTERNAL_ERROR | 500 | Database error |

### POST /api/v1/auth/logout

| Error Code | HTTP Status | Trigger |
|-----------|-------------|---------|
| VALIDATION_ERROR | 400 | Missing refresh_token |
| UNAUTHORIZED | 401 | Not authenticated |
| INTERNAL_ERROR | 500 | Token revocation failed |

---

## Security Considerations

### Failed Login Attempts
- After 5 failed login attempts, account is locked for 15 minutes
- `failed_login_attempts` counter increments on each failed login
- Counter resets to 0 on successful login
- `locked_until` timestamp tracks lock expiration

### Password Requirements
- Minimum 8 characters (enforced in validation)
- Stored using bcrypt hashing (cost factor 10)
- Plain passwords never stored or logged

### Token Management
- Access tokens expire in 24 hours (configurable)
- Refresh tokens expire in 7 days (configurable)
- Tokens stored in Redis for blacklist/validation
- Logout invalidates both access and refresh tokens

### Email Validation
- Regex pattern: `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
- Case-insensitive comparison
- Trims whitespace

### Audit Logging
- All authentication events logged to `audit_logs` table
- Includes: user_id, action, IP address, user agent, timestamp
- Failed attempts logged with reason

---

## Testing Error Scenarios

### Using cURL

```bash
# Invalid email format
curl -X POST http://localhost:8081/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"not-an-email","password":"Test@123","role":"student"}'

# Weak password
curl -X POST http://localhost:8081/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123","role":"student"}'

# Duplicate email
curl -X POST http://localhost:8081/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"existing@test.com","password":"Test@123456","role":"student"}'

# Invalid credentials
curl -X POST http://localhost:8081/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"WrongPassword"}'

# No token
curl -X GET http://localhost:8081/api/v1/auth/validate

# Invalid token
curl -X GET http://localhost:8081/api/v1/auth/validate \
  -H "Authorization: Bearer invalid_token"
```

### Using Postman

Import the collection `postman/IELTS_Platform_API.postman_collection.json` which includes:
- "Auth Service" folder with success scenarios
- "Auth Service - Error Cases" folder with all failure scenarios
- Automated test scripts for validation
- Environment variable management

---

## Troubleshooting Guide

### "Account is locked" error
**Problem**: User sees ACCOUNT_LOCKED after multiple failed logins  
**Solution**: 
1. Wait 15 minutes for automatic unlock
2. Or admin can manually reset via database:
   ```sql
   UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE email = 'user@example.com';
   ```

### "Email already registered" error
**Problem**: Cannot register with desired email  
**Solution**:
1. Try logging in instead
2. Use password reset if forgotten
3. Contact admin to check account status

### "Invalid or expired token" error
**Problem**: API calls fail with token error  
**Solution**:
1. Check token expiration in JWT payload
2. Use refresh token to get new access token
3. Login again if refresh token also expired

### "Authorization header required" error
**Problem**: Protected endpoints return NO_TOKEN  
**Solution**:
1. Add header: `Authorization: Bearer <access_token>`
2. Verify token format (must include "Bearer " prefix)
3. Ensure token is not empty

---

## Migration Notes

### From Previous Version
- Phone unique constraint now allows multiple NULL values
- Error codes standardized (EMAIL_EXISTS, PHONE_EXISTS, INVALID_EMAIL, etc.)
- All errors include consistent JSON structure
- HTTP status codes properly mapped to error types
- Detailed logging added for debugging

### Database Schema
```sql
-- Phone unique constraint (allows NULL)
CREATE UNIQUE INDEX users_phone_unique ON users(phone) 
WHERE phone IS NOT NULL AND deleted_at IS NULL;
```

---

## Support

For issues not covered in this documentation:
1. Check service logs: `docker-compose logs auth-service`
2. Review audit logs in database
3. Run health check: `GET /health`
4. Contact development team

Last Updated: 2024-06-08  
Service Version: 1.0.0
