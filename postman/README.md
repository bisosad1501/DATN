# Postman Collection - IELTS Learning Platform

## 📦 Files
- `IELTS_Platform_API.postman_collection.json` - Complete API collection with automated scripts
- `IELTS_Platform_Local.postman_environment.json` - Local environment variables

## 🚀 Quick Start

### 1. Import Collection
1. Open Postman
2. Click **Import** button
3. Select both files:
   - `IELTS_Platform_API.postman_collection.json`
   - `IELTS_Platform_Local.postman_environment.json`

### 2. Select Environment
1. Click environment dropdown (top right)
2. Select **"IELTS Platform - Local"**

### 3. Run Tests
1. Start with **Health Check** to verify service is running
2. Run **Register Student** to create test account
3. Use **Login** to get fresh tokens
4. Test other endpoints with auto-managed tokens

## 🤖 Automated Features

### 1. Automatic Token Management
```javascript
// Pre-request script automatically:
- Checks if access token is expired
- Refreshes token if expires in < 5 minutes
- Updates environment variables
- No manual intervention needed
```

### 2. Auto-Save Tokens
All authentication endpoints automatically save tokens to environment:
- `access_token` - JWT access token
- `refresh_token` - JWT refresh token
- `token_expiry` - Token expiration timestamp
- `user_id` - Current user ID

### 3. Test Automation
Every request includes automatic tests:
- Response time validation (< 2000ms)
- Content-Type verification
- Status code checks
- Response structure validation

### 4. Dynamic Test Data
Registration endpoints auto-generate random emails:
```javascript
student_1234@test.com
instructor_5678@test.com
```

## 📋 Collection Structure

### Auth Service (8 endpoints)
1. **Health Check** - Verify service status
2. **Register Student** - Create student account
3. **Register Instructor** - Create instructor account
4. **Login** - Authenticate user
5. **Validate Token** - Verify JWT token
6. **Refresh Token** - Get new access token
7. **Change Password** - Update password
8. **Logout** - Invalidate refresh token

## 🔧 Environment Variables

### Base Configuration
- `base_url` - API base URL (default: http://localhost:8081)

### Authentication
- `access_token` - Current JWT access token
- `refresh_token` - Current refresh token
- `token_expiry` - Token expiration ISO timestamp
- `user_id` - Current user UUID

### Test Accounts
- `test_student_email` - Auto-generated student email
- `test_student_password` - Student password
- `test_instructor_email` - Auto-generated instructor email
- `test_instructor_password` - Instructor password
- `instructor_access_token` - Instructor JWT token
- `instructor_refresh_token` - Instructor refresh token

## 🧪 Testing Workflows

### Complete Registration Flow
```
1. Register Student (201 Created)
   → Auto-saves: access_token, refresh_token, user_id
2. Validate Token (200 OK)
   → Verifies token is valid
3. Change Password (200 OK)
   → Updates password
4. Logout (200 OK)
   → Clears all tokens
```

### Token Refresh Flow
```
1. Login (200 OK)
   → Saves tokens with expiry
2. Wait or manually expire token
3. Any authenticated request
   → Pre-request script auto-refreshes token
4. Request proceeds with fresh token
```

### Multi-User Testing
```
1. Register Student
   → Saves to: access_token, user_id
2. Register Instructor
   → Saves to: instructor_access_token
3. Test student endpoints with access_token
4. Test instructor endpoints with instructor_access_token
```

## 📊 Test Assertions

### Common Tests (All Requests)
```javascript
✓ Response time is less than 2000ms
✓ Response has JSON content type
```

### Registration Tests
```javascript
✓ Status code is 201
✓ Response contains user_id
✓ Response contains access_token
✓ Response contains refresh_token
✓ Role matches requested role
```

### Login Tests
```javascript
✓ Status code is 200
✓ Tokens are present and valid
✓ Environment variables updated
```

### Validation Tests
```javascript
✓ Token is valid
✓ User data is present
✓ Role information correct
```

## 🔐 Security Notes

1. **Token Expiry**: Access tokens expire in 15 minutes by default
2. **Refresh Tokens**: Valid for 7 days
3. **Auto-Refresh**: Triggers 5 minutes before expiry
4. **Logout**: Revokes refresh token immediately
5. **Secrets**: Tokens stored as secret type in environment

## 📝 Scripts Explanation

### Pre-Request Script (Collection Level)
```javascript
// Runs before EVERY request
// Checks token expiry
// Auto-refreshes if needed
// Updates environment variables
```

### Test Script (Collection Level)
```javascript
// Runs after EVERY response
// Validates response time
// Validates content type
// Can be overridden at request level
```

### Request-Specific Scripts
Each endpoint has custom tests for:
- Expected status codes
- Response data structure
- Business logic validation
- Environment variable management

## 🎯 Next Steps

### Add More Services
As new microservices are implemented, add folders:
- User Service
- Course Service
- Exercise Service
- AI Service
- Notification Service

### Environment Setup
Create additional environments:
- `IELTS Platform - Dev` (port 8081)
- `IELTS Platform - Staging` (staging URL)
- `IELTS Platform - Production` (prod URL)

### CI/CD Integration
```bash
# Run collection with Newman CLI
newman run IELTS_Platform_API.postman_collection.json \
  -e IELTS_Platform_Local.postman_environment.json \
  --reporters cli,json
```

## 🐛 Troubleshooting

### Token Not Refreshing
- Check `refresh_token` exists in environment
- Verify `token_expiry` format is ISO 8601
- Check console logs for errors

### 401 Unauthorized
- Run **Login** to get fresh tokens
- Check token hasn't been revoked (logout)
- Verify environment is selected

### Random Emails Not Generating
- Check pre-request script is enabled
- Verify JavaScript console for errors
- Manually set email if needed

## 📖 References
- [Postman Documentation](https://learning.postman.com/)
- [JWT Best Practices](https://jwt.io/introduction)
- [Collection Scripts](https://learning.postman.com/docs/writing-scripts/intro-to-scripts/)
