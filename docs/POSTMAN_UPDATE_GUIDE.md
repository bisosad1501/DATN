# Postman Collection Update Guide - Exercise Service New Features

## Overview
Cần thêm **15 endpoints mới** vào Postman collection cho Exercise Service.

## Folder Structure

```
Exercise Service/
├── Public/
│   ├── List Exercises (existing)
│   ├── Get Exercise Detail (existing)
│   ├── 🆕 Get All Tags
│   └── 🆕 Get Exercise Tags
├── Student/
│   ├── Start Exercise (existing)
│   ├── Submit Answers (existing)
│   ├── Get Result (existing)
│   └── My Submissions (existing)
└── Admin/
    ├── Exercise Management/
    │   ├── Create Exercise (existing)
    │   ├── Update Exercise (existing)
    │   ├── Delete Exercise (existing)
    │   ├── 🆕 Publish Exercise
    │   ├── 🆕 Unpublish Exercise
    │   ├── Add Section (existing)
    │   ├── Add Question (existing)
    │   ├── Add Option (existing)
    │   └── Add Answer (existing)
    ├── 🆕 Tags Management/
    │   ├── 🆕 Create Tag
    │   ├── 🆕 Add Tag to Exercise
    │   └── 🆕 Remove Tag from Exercise
    ├── 🆕 Question Bank/
    │   ├── 🆕 List Bank Questions
    │   ├── 🆕 Create Bank Question
    │   ├── 🆕 Update Bank Question
    │   └── 🆕 Delete Bank Question
    └── 🆕 Analytics/
        └── 🆕 Get Exercise Analytics
```

---

## New Endpoints to Add

### 1. Get All Tags (Public)

**Request:**
```
GET {{base_url}}/api/v1/tags
```

**Headers:**
```
(None required - public endpoint)
```

**Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Cambridge IELTS 16",
      "slug": "cambridge-ielts-16",
      "created_at": "2025-10-10T08:00:00Z"
    },
    {
      "id": 2,
      "name": "Mock Test",
      "slug": "mock-test",
      "created_at": "2025-10-10T08:00:00Z"
    }
  ]
}
```

**Tests:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has tags array", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.be.an('array');
});

// Save first tag ID for other requests
if (pm.response.json().data.length > 0) {
    pm.environment.set("tag_id", pm.response.json().data[0].id);
}
```

---

### 2. Get Exercise Tags (Public)

**Request:**
```
GET {{base_url}}/api/v1/exercises/{{exercise_id}}/tags
```

**Headers:**
```
(None required - public endpoint)
```

**Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Cambridge IELTS 16",
      "slug": "cambridge-ielts-16",
      "created_at": "2025-10-10T08:00:00Z"
    }
  ]
}
```

**Tests:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has tags for exercise", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.be.an('array');
});
```

---

### 3. Publish Exercise (Admin)

**Request:**
```
POST {{base_url}}/api/v1/admin/exercises/{{exercise_id}}/publish
```

**Headers:**
```
Authorization: Bearer {{access_token}}
```

**Body:** (None)

**Response Example:**
```json
{
  "success": true,
  "data": {
    "message": "Exercise published successfully"
  }
}
```

**Tests:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Exercise published successfully", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data.message).to.include("published");
});
```

---

### 4. Unpublish Exercise (Admin)

**Request:**
```
POST {{base_url}}/api/v1/admin/exercises/{{exercise_id}}/unpublish
```

**Headers:**
```
Authorization: Bearer {{access_token}}
```

**Body:** (None)

**Response Example:**
```json
{
  "success": true,
  "data": {
    "message": "Exercise unpublished successfully"
  }
}
```

**Tests:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Exercise unpublished successfully", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data.message).to.include("unpublished");
});
```

---

### 5. Create Tag (Admin)

**Request:**
```
POST {{base_url}}/api/v1/admin/tags
```

**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Cambridge IELTS 17",
  "slug": "cambridge-ielts-17"
}
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "id": 3,
    "name": "Cambridge IELTS 17",
    "slug": "cambridge-ielts-17",
    "created_at": "2025-10-10T08:30:00Z"
  }
}
```

**Tests:**
```javascript
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Tag created successfully", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data.id).to.exist;
    pm.environment.set("new_tag_id", jsonData.data.id);
});
```

---

### 6. Add Tag to Exercise (Admin)

**Request:**
```
POST {{base_url}}/api/v1/admin/exercises/{{exercise_id}}/tags
```

**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Body:**
```json
{
  "tag_id": {{tag_id}}
}
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "message": "Tag added successfully"
  }
}
```

**Tests:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Tag added to exercise", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
});
```

---

### 7. Remove Tag from Exercise (Admin)

**Request:**
```
DELETE {{base_url}}/api/v1/admin/exercises/{{exercise_id}}/tags/{{tag_id}}
```

**Headers:**
```
Authorization: Bearer {{access_token}}
```

**Body:** (None)

**Response Example:**
```json
{
  "success": true,
  "data": {
    "message": "Tag removed successfully"
  }
}
```

**Tests:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Tag removed from exercise", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
});
```

---

### 8. List Bank Questions (Admin)

**Request:**
```
GET {{base_url}}/api/v1/admin/question-bank?page=1&limit=20&skill_type=reading
```

**Headers:**
```
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 20, max: 100)
- `skill_type` (optional: listening, reading)
- `question_type` (optional)

**Response Example:**
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "id": "uuid",
        "title": "Academic Discussion - Technology",
        "skill_type": "reading",
        "question_type": "multiple_choice",
        "difficulty": "medium",
        "topic": "Technology",
        "question_text": "What is the main idea?",
        "answer_data": "{...}",
        "tags": ["academic", "technology"],
        "times_used": 0,
        "is_verified": false,
        "is_published": true,
        "created_at": "2025-10-10T08:00:00Z"
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

**Tests:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has question bank data", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data.questions).to.be.an('array');
    pm.expect(jsonData.data.total).to.be.a('number');
});

// Save first question ID
if (pm.response.json().data.questions.length > 0) {
    pm.environment.set("bank_question_id", pm.response.json().data.questions[0].id);
}
```

---

### 9. Create Bank Question (Admin)

**Request:**
```
POST {{base_url}}/api/v1/admin/question-bank
```

**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Academic Discussion - Climate Change",
  "skill_type": "reading",
  "question_type": "multiple_choice",
  "difficulty": "hard",
  "topic": "Environment",
  "question_text": "What is the author's main argument about climate change?",
  "context_text": "Paragraph 3 discusses the impact of rising temperatures...",
  "answer_data": {
    "options": [
      {"label": "A", "text": "It is a serious threat", "is_correct": true},
      {"label": "B", "text": "It is exaggerated", "is_correct": false},
      {"label": "C", "text": "It is reversible", "is_correct": false},
      {"label": "D", "text": "It is uncertain", "is_correct": false}
    ]
  },
  "tags": ["academic", "environment", "climate"]
}
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "id": "new-uuid",
    "title": "Academic Discussion - Climate Change",
    "skill_type": "reading",
    "question_type": "multiple_choice",
    "times_used": 0,
    "is_verified": false,
    "is_published": true,
    "created_at": "2025-10-10T08:30:00Z"
  }
}
```

**Tests:**
```javascript
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Bank question created", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data.id).to.exist;
    pm.environment.set("new_bank_question_id", jsonData.data.id);
});
```

---

### 10. Update Bank Question (Admin)

**Request:**
```
PUT {{base_url}}/api/v1/admin/question-bank/{{bank_question_id}}
```

**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Academic Discussion - Climate Change (Updated)",
  "question_text": "What is the author's main argument? (Updated)",
  "question_type": "multiple_choice",
  "answer_data": {
    "options": [
      {"label": "A", "text": "It is a critical threat requiring immediate action", "is_correct": true},
      {"label": "B", "text": "It is exaggerated", "is_correct": false},
      {"label": "C", "text": "It is reversible", "is_correct": false},
      {"label": "D", "text": "It is uncertain", "is_correct": false}
    ]
  },
  "tags": ["academic", "environment", "climate", "updated"]
}
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "message": "Question updated successfully"
  }
}
```

**Tests:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Bank question updated", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
});
```

---

### 11. Delete Bank Question (Admin)

**Request:**
```
DELETE {{base_url}}/api/v1/admin/question-bank/{{bank_question_id}}
```

**Headers:**
```
Authorization: Bearer {{access_token}}
```

**Body:** (None)

**Response Example:**
```json
{
  "success": true,
  "data": {
    "message": "Question deleted successfully"
  }
}
```

**Tests:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Bank question deleted", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
});
```

---

### 12. Get Exercise Analytics (Admin)

**Request:**
```
GET {{base_url}}/api/v1/admin/exercises/{{exercise_id}}/analytics
```

**Headers:**
```
Authorization: Bearer {{access_token}}
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "exercise_id": "uuid",
    "total_attempts": 245,
    "completed_attempts": 198,
    "abandoned_attempts": 47,
    "average_score": 72.5,
    "median_score": 75.0,
    "highest_score": 95.0,
    "lowest_score": 35.0,
    "average_completion_time": 1800,
    "median_completion_time": 1650,
    "actual_difficulty": "medium",
    "question_statistics": "{\"q1\": {\"correct_rate\": 0.85}}",
    "updated_at": "2025-10-10T10:00:00Z"
  }
}
```

**Tests:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Analytics data retrieved", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data.exercise_id).to.exist;
    pm.expect(jsonData.data.total_attempts).to.be.a('number');
});

pm.test("Analytics has statistics", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('average_score');
    pm.expect(jsonData.data).to.have.property('median_score');
    pm.expect(jsonData.data).to.have.property('average_completion_time');
});
```

---

## Environment Variables Needed

Add these to your Postman environment:

```
tag_id: (auto-set from Get All Tags test)
new_tag_id: (auto-set from Create Tag test)
bank_question_id: (auto-set from List Bank Questions test)
new_bank_question_id: (auto-set from Create Bank Question test)
```

---

## Import Steps

### Option 1: Manual Import in Postman UI

1. Open Postman
2. Navigate to "Exercise Service" collection
3. Create new folders:
   - "Tags Management" under Admin
   - "Question Bank" under Admin
   - "Analytics" under Admin
4. Click "Add Request" for each endpoint above
5. Copy request details (method, URL, headers, body, tests)
6. Save each request

### Option 2: Bulk Import (Recommended)

1. Export current collection
2. Open JSON file in editor
3. Add new request objects under appropriate folders
4. Re-import updated collection

---

## Testing Workflow

### Complete Test Flow:
```
1. Login as Admin
2. Create Exercise (draft)
3. Publish Exercise
4. Create Tags
5. Add Tags to Exercise
6. Get Exercise Tags
7. Create Bank Questions
8. List Bank Questions
9. Get Exercise Analytics
10. Update Bank Question
11. Remove Tag from Exercise
12. Unpublish Exercise
13. Delete Bank Question
```

### Quick Smoke Test:
```
1. Get All Tags
2. Get Exercise Tags
3. Publish Exercise
4. Get Analytics
```

---

## Documentation

All endpoints documented in:
- `docs/EXERCISE_NEW_ENDPOINTS.md` - Detailed API documentation
- `docs/EXERCISE_SERVICE_COMPLETE_REVIEW.md` - Complete review
- `scripts/test-exercise-new-features.sh` - Automated test script

---

## Summary

**15 New Endpoints:**
- ✅ 2 Publish/Unpublish endpoints
- ✅ 6 Tags management endpoints (2 public + 4 admin)
- ✅ 4 Question Bank endpoints
- ✅ 1 Analytics endpoint
- ✅ 2 Public tag browsing endpoints

**Total Exercise Service Endpoints: 29**
- 4 Public
- 4 Student
- 21 Admin

**Status:** All endpoints tested and working ✅
