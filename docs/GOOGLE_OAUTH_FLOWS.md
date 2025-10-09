# Google OAuth Authentication Flows

Hệ thống hỗ trợ **2 flows** cho cả Web và Mobile App.

---

## 🌐 Flow 1: Web Application (Browser-based)

**Sử dụng cho**: Web frontend với browser redirect

### Các Bước:

```
1. User click "Login with Google"
   ↓
2. Frontend redirect đến: GET /api/v1/auth/google
   ↓
3. Backend redirect user đến Google OAuth
   ↓
4. User đăng nhập Google
   ↓
5. Google redirect về: GET /api/v1/auth/google/callback?code=xxx
   ↓
6. Backend exchange code → Trả về tokens
```

### Endpoints:

#### 1. Initiate OAuth (Redirect)
```http
GET /api/v1/auth/google
```
**Response**: 302 Redirect đến Google OAuth

#### 2. Handle Callback
```http
GET /api/v1/auth/google/callback?code=xxx&state=yyy
```
**Response**: JSON với tokens
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@gmail.com",
      "full_name": "User Name"
    },
    "tokens": {
      "access_token": "eyJhbGc...",
      "refresh_token": "eyJhbGc...",
      "expires_in": 3600
    }
  }
}
```

---

## 📱 Flow 2: Mobile/API Application (Token-based)

**Sử dụng cho**: Mobile apps (iOS/Android), Desktop apps, hoặc SPA không có backend

### Các Bước:

```
1. Mobile app gọi API để lấy OAuth URL
   ↓
2. App mở URL trong WebView hoặc Safari/Chrome
   ↓
3. User đăng nhập Google
   ↓
4. Google redirect về callback URL với code
   ↓
5. App capture code từ redirect URL
   ↓
6. App gửi code về backend để exchange
   ↓
7. Backend trả về tokens
```

### Endpoints:

#### 1. Get OAuth URL
```http
GET /api/v1/auth/google/url
```

**Response**:
```json
{
  "success": true,
  "data": {
    "url": "https://accounts.google.com/o/oauth2/auth?client_id=...",
    "state": "random-uuid-for-csrf-protection"
  }
}
```

**Mobile Implementation**:
```swift
// iOS Example
let response = await fetch("http://api.example.com/api/v1/auth/google/url")
let oauthURL = response.data.url

// Open in Safari View Controller or WebView
let safariVC = SFSafariViewController(url: URL(string: oauthURL)!)
present(safariVC, animated: true)
```

```kotlin
// Android Example
val response = apiClient.getGoogleOAuthURL()
val oauthURL = response.data.url

// Open in Custom Tab
val intent = CustomTabsIntent.Builder().build()
intent.launchUrl(context, Uri.parse(oauthURL))
```

#### 2. Exchange Code for Tokens
```http
POST /api/v1/auth/google/token
Content-Type: application/json

{
  "code": "4/0AVGzR1Ap9R0p...",
  "state": "6c0554e2-15c7-464b-89b1-30f14429631f"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@gmail.com",
      "full_name": "User Name",
      "is_new": false
    },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires_in": 3600
    }
  }
}
```

**Mobile Implementation - Capture Code**:

```swift
// iOS - Handle redirect URL
func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    guard let url = URLContexts.first?.url else { return }
    
    // Extract code from URL
    if let components = URLComponents(url: url, resolvingAgainstBaseURL: true),
       let code = components.queryItems?.first(where: { $0.name == "code" })?.value {
        
        // Send code to backend
        exchangeCodeForTokens(code: code)
    }
}
```

```kotlin
// Android - Handle redirect in Activity
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    
    // Handle redirect
    intent?.data?.let { uri ->
        val code = uri.getQueryParameter("code")
        val state = uri.getQueryParameter("state")
        
        // Send code to backend
        exchangeCodeForTokens(code, state)
    }
}
```

---

## 🔐 Error Handling

### Common Errors:

#### 1. Invalid/Expired Code
```json
{
  "success": false,
  "error": {
    "code": "EXCHANGE_FAILED",
    "message": "Failed to exchange authorization code. Code may be expired or invalid."
  }
}
```
**Giải pháp**: OAuth codes chỉ có hiệu lực 5-10 phút và chỉ dùng 1 lần. Yêu cầu user login lại.

#### 2. Invalid State (CSRF Protection)
```json
{
  "success": false,
  "error": {
    "code": "INVALID_STATE",
    "message": "Invalid state parameter"
  }
}
```
**Giải pháp**: State không khớp. Đảm bảo gửi đúng state từ bước 1.

#### 3. User Info Failed
```json
{
  "success": false,
  "error": {
    "code": "USER_INFO_FAILED",
    "message": "Failed to get user information from Google"
  }
}
```
**Giải pháp**: Kiểm tra Google OAuth credentials và scopes.

---

## 🛠️ Configuration

### Environment Variables:
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URL=http://localhost:8081/api/v1/auth/google/callback
```

### Google OAuth Scopes:
- `https://www.googleapis.com/auth/userinfo.email` - User email
- `https://www.googleapis.com/auth/userinfo.profile` - User profile (name, picture)

---

## 📝 Testing

### Test với Postman (Mobile Flow):

1. **Get OAuth URL**:
   ```
   GET {{base_url}}/api/v1/auth/google/url
   ```

2. **Copy URL từ response** → Mở trong browser

3. **Đăng nhập Google**

4. **Sau khi redirect**, copy `code` từ URL:
   ```
   http://localhost:8081/api/v1/auth/google/callback?code=4/0AVGzR1...&state=xxx
   ```

5. **Exchange code**:
   ```
   POST {{base_url}}/api/v1/auth/google/token
   {
     "code": "4/0AVGzR1...",
     "state": "xxx"
   }
   ```

### Test với Browser (Web Flow):

1. Mở browser: `http://localhost:8081/api/v1/auth/google`

2. Đăng nhập Google

3. Nhận tokens ở response

---

## 📊 So Sánh 2 Flows

| Tính năng | Web Flow | Mobile Flow |
|-----------|----------|-------------|
| **Redirect** | Backend redirect | App handle URL |
| **State verification** | Via cookie | Via request body |
| **Best for** | Web browsers | Mobile apps, API clients |
| **Endpoints** | `/google` + `/callback` | `/google/url` + `/google/token` |
| **Complexity** | Đơn giản | Phức tạp hơn |

---

## ✅ Checklist Implementation

### Backend (✅ Đã hoàn thành):
- [x] GET `/api/v1/auth/google/url` - Get OAuth URL
- [x] GET `/api/v1/auth/google` - Web redirect
- [x] GET `/api/v1/auth/google/callback` - Handle callback
- [x] POST `/api/v1/auth/google/token` - Exchange code (Mobile)

### Frontend Web (Cần implement):
- [ ] Button "Login with Google"
- [ ] Redirect đến `/api/v1/auth/google`
- [ ] Handle callback và lưu tokens

### Mobile App (Cần implement):
- [ ] Call API `/api/v1/auth/google/url`
- [ ] Open URL in WebView/Browser
- [ ] Capture redirect URL với code
- [ ] Call API `/api/v1/auth/google/token` với code
- [ ] Store tokens securely (Keychain/KeyStore)

---

## 🔗 Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [OAuth 2.0 for Mobile & Desktop Apps](https://developers.google.com/identity/protocols/oauth2/native-app)
- [RFC 6749 - OAuth 2.0 Authorization Framework](https://tools.ietf.org/html/rfc6749)
