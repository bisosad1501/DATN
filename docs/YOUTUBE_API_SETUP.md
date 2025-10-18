# YouTube API Setup Guide

## Lấy YouTube Data API v3 Key

### Bước 1: Tạo Project trong Google Cloud Console

1. Truy cập: https://console.cloud.google.com/
2. Đăng nhập bằng Google Account
3. Click **"Select a project"** → **"NEW PROJECT"**
4. Tên project: `IELTS Platform` hoặc bất kỳ
5. Click **"CREATE"**

### Bước 2: Enable YouTube Data API v3

1. Vào **"APIs & Services"** → **"Library"**
2. Search: `YouTube Data API v3`
3. Click vào result đầu tiên
4. Click **"ENABLE"**

### Bước 3: Tạo API Key

1. Vào **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** → **"API key"**
3. API key sẽ được tạo ngay lập tức
4. **Copy API key** và lưu lại

### Bước 4: Restrict API Key (Bảo mật)

1. Click vào API key vừa tạo
2. **Application restrictions:**
   - Chọn: `HTTP referrers (websites)` nếu dùng từ frontend
   - Chọn: `IP addresses` nếu dùng từ backend server
   - Hoặc: `None` để test (không khuyến nghị production)

3. **API restrictions:**
   - Chọn: `Restrict key`
   - Tích chọn: `YouTube Data API v3`

4. Click **"SAVE"**

### Bước 5: Add vào Environment Variables

```bash
# .env file
YOUTUBE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Bước 6: Test API Key

```bash
# Test lấy video duration
VIDEO_ID="eW4AM1539-g"
API_KEY="your_api_key_here"

curl "https://www.googleapis.com/youtube/v3/videos?id=${VIDEO_ID}&part=contentDetails&key=${API_KEY}"
```

Response mẫu:
```json
{
  "items": [
    {
      "contentDetails": {
        "duration": "PT1H20M23S"
      }
    }
  ]
}
```

## Quota & Limits

- **Free tier:** 10,000 units/day
- **1 video info request:** 1 unit
- **Đủ cho:** ~10,000 videos/day

## API Key vs OAuth 2.0

| Feature | API Key | OAuth 2.0 |
|---------|---------|-----------|
| Public data | ✅ Yes | ✅ Yes |
| User data | ❌ No | ✅ Yes |
| Setup | Easy | Complex |
| Best for | Video info, search | Upload, comments |

**Recommendation:** Dùng API Key cho việc lấy video duration (public data).

## Security Best Practices

1. ✅ **Restrict API key** theo domain/IP
2. ✅ **Không commit** API key vào Git
3. ✅ **Dùng environment variables**
4. ✅ **Monitor quota** usage trong Console
5. ❌ **Không hardcode** API key trong code

## Troubleshooting

### Error: "The request cannot be completed because you have exceeded your quota"
- **Solution:** Đợi đến ngày mới (reset lúc 12:00 AM PST) hoặc request quota tăng

### Error: "API key not valid"
- **Check:** API key đã enable YouTube Data API v3 chưa
- **Check:** Copy đúng toàn bộ key (không có space)

### Error: "Access Not Configured"
- **Solution:** Enable YouTube Data API v3 trong Console

## Alternative: YouTube oEmbed API (No API Key)

Nếu không muốn dùng API key, có thể dùng oEmbed:

```bash
curl "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=eW4AM1539-g&format=json"
```

**Nhược điểm:** Không trả về duration, chỉ có title, thumbnail, author.

## Rate Limiting

- **Quota reset:** Daily tại 12:00 AM PST
- **Best practice:** Cache video info trong database
- **Implementation:** Chỉ call API khi thêm video mới, không call mỗi lần render
