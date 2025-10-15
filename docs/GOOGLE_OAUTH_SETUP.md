# 🔐 Google OAuth Setup Guide

## 📋 Current Configuration

### Backend (.env)
```bash
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URL=http://localhost:8080/api/v1/auth/google/callback
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

---

## ⚙️ Google Cloud Console Setup

### 1. Tạo OAuth 2.0 Client

Truy cập: https://console.cloud.google.com/apis/credentials

### 2. Cấu hình Authorized Redirect URIs

Cần thêm **2 redirect URIs**:

#### For Web Flow (Browser redirect):
```
http://localhost:8080/api/v1/auth/google/callback
```
- Đây là endpoint của **API Gateway** (port 8080)
- Google sẽ redirect user về đây sau khi login
- Backend xử lý và redirect về frontend

#### For Mobile/API Flow:
```
http://localhost:3000/auth/google/callback
```
- Đây là endpoint của **Frontend** (port 3000) 
- Dùng cho mobile apps hoặc khi frontend handle callback

### 3. Production URIs (Thêm sau khi deploy)

```
https://api.yourdomain.com/api/v1/auth/google/callback
https://yourdomain.com/auth/google/callback
```

---

## 🔄 OAuth Flows

### Flow 1: Web Flow (Recommended)
```
1. User clicks "Sign in with Google" trên Frontend
2. Frontend gọi: GET /api/v1/auth/google/url
3. Backend trả về Google OAuth URL với redirect_uri=API_GATEWAY
4. Frontend redirect user đến Google
5. User login với Google
6. Google redirect về: http://localhost:8080/api/v1/auth/google/callback?code=xxx
7. Backend (API Gateway → Auth Service) xử lý:
   - Exchange code → tokens
   - Tạo/login user
   - Generate JWT tokens
8. Backend redirect về Frontend với tokens trong URL params
9. Frontend extract tokens và store vào localStorage
```

### Flow 2: Mobile/API Flow (Alternative)
```
1. Mobile app gọi: GET /api/v1/auth/google/url
2. Backend trả về Google OAuth URL
3. Mobile mở URL trong WebView
4. User login, Google redirect với code
5. Mobile capture code từ redirect URL
6. Mobile gọi: POST /api/v1/auth/google/token với code
7. Backend exchange code → JWT tokens
8. Mobile nhận JWT tokens và store
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Failed to process Google login"
**Nguyên nhân:** Redirect URI không khớp với Google Console

**Fix:**
1. Check Google Console có redirect URI này không:
   ```
   http://localhost:8080/api/v1/auth/google/callback
   ```
2. Check `.env` file có đúng không:
   ```bash
   GOOGLE_REDIRECT_URL=http://localhost:8080/api/v1/auth/google/callback
   ```
3. Restart auth-service:
   ```bash
   docker-compose restart auth-service
   ```

### Issue 2: "redirect_uri_mismatch"
**Nguyên nhân:** Google Console chưa có URI hoặc sai format

**Fix:**
1. Vào Google Console
2. Thêm chính xác URI (không được có trailing slash)
3. Đợi vài phút để Google cập nhật
4. Thử lại

### Issue 3: Hydration Error ở Frontend
**Fix:** Đã thêm `suppressHydrationWarning` vào `<body>` tag

---

## ✅ Verify Setup

### 1. Test Google OAuth URL
```bash
curl http://localhost:8080/api/v1/auth/google/url | jq
```

Expected response:
```json
{
  "success": true,
  "data": {
    "url": "https://accounts.google.com/o/oauth2/auth?...",
    "state": "uuid-here"
  }
}
```

### 2. Check Redirect URI trong URL
```bash
curl -s http://localhost:8080/api/v1/auth/google/url | \
  jq -r '.data.url' | \
  grep -o "redirect_uri=[^&]*"
```

Expected output:
```
redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Fapi%2Fv1%2Fauth%2Fgoogle%2Fcallback
```

### 3. Test Full Flow
1. Mở http://localhost:3000/login
2. Click "Sign in with Google"
3. Nên redirect đến Google login page
4. Login với Google account
5. Nên redirect về frontend dashboard

---

## 🔒 Security Notes

### CSRF Protection
- Backend generate random `state` parameter
- Frontend store state trong localStorage
- Backend verify state khi callback

### Token Security
- Access token: 24h expiry
- Refresh token: 7 days expiry
- Tokens stored in httpOnly cookies (recommended) hoặc localStorage

### Production Checklist
- [ ] Thay `GOOGLE_CLIENT_SECRET` trong `.env`
- [ ] Thay `JWT_SECRET` trong `.env`
- [ ] Update redirect URIs trong Google Console với production domains
- [ ] Enable HTTPS cho production
- [ ] Set `APP_ENV=production`
- [ ] Review CORS settings trong API Gateway

---

## 📚 References

- [Google OAuth 2.0 Docs](https://developers.google.com/identity/protocols/oauth2)
- [Backend Auth Handler](services/auth-service/internal/handlers/auth_handler.go)
- [Frontend Auth API](Frontend-IELTSGo/lib/api/auth.ts)
- [Frontend Auth Context](Frontend-IELTSGo/lib/contexts/auth-context.tsx)

---

**Last updated:** October 15, 2025  
**Status:** ✅ Configured & Tested
