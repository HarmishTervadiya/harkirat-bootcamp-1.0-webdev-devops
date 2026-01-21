# **Contest Platform Backend Assignment**

- **(4.5/10 diificulty)**

**Time Limit:** 2–3 Hours

**Mode:** HTTP REST APIs only

**Evaluation:** Automated test cases will be run against your backend

---

## **Tech Stack (PREFERED)**

- Node.js, Express, PostgreSQL, JWT (Authentication), bcrypt (Password hashing), Zod

---

## **Objective**

Build a **Contest Platform** backend where:

- **Creators** create contests with MCQ & DSA questions
- **Contestees** participate and submit answers
- All APIs follow **strict contracts** so automated tests can validate them

---

## **User Roles**

| Role | Description |
| --- | --- |
| `creator` | Creates contests, questions, problems |
| `contestee` | Participates in contests |

---

## **Core Rules (Hard Rules)**

1. One contest can have multiple MCQs and multiple DSA problems
2. Creators **cannot** submit to their own contests
3. Submissions allowed **only during contest time**
4. Hidden test cases must **never** be exposed to contestees
5. JWT required for **all APIs except signup/login**
6. Responses must match the format **exactly**

---

# **Database Schema (PostgreSQL)**

### **users**

```jsx
CREATE TABLE users (
    id,
    name,
    email,
    password,
    role //('creator', 'contestee'),
    created_at
);
```

### **contests**

```jsx
CREATE TABLE contests (
    id,
    title,
    description,
    creator_id,
    start_time,
    end_time,
    created_at
);
```

### **mcq_questions**

```jsx
CREATE TABLE mcq_questions (
    id,
    contest_id,
    question_text,
    options //JSONB ??,
    correct_option_index,
    points //default 1,
    created_at
);
```

### **dsa_problems**

```jsx
CREATE TABLE dsa_problems (
    id,
    contest_id,
    title,
    description,
    tags // JSONB ??,
    points //default 100,
    time_limit // default 2000,
    memory_limit // deafult 256,
    created_at
);
```

### **test_cases**

```jsx
CREATE TABLE test_cases (
    id,
    problem_id,
    input,
    expected_output,
    is_hidden //default false,
    created_at
);
```

### **mcq_submissions**

```jsx
CREATE TABLE mcq_submissions (
    id,
    user_id,
    question_id,
    selected_option_index,
    is_correct ,
    points_earned // default 0,
    submitted_at,
    UNIQUE(user_id, question_id)
);
```

### **dsa_submissions**

```jsx
CREATE TABLE dsa_submissions (
    id,
    user_id,
    problem_id,
    code TEXT NOT NULL,
    language VARCHAR(50),
    status VARCHAR(50),
    points_earned // default 0,
    test_cases_passed // default 0,
    total_test_cases // default 0,
    execution_time INTEGER,
    submitted_at
);
```

---

# **Global API Rules**

### **Auth Header**
```
Authorization: Bearer <JWT_TOKEN>
```

### **Response Format (STRICT)**

**Success Response:**

```jsx
{
  "success": true,
  "data": {},
  "error": null
}
```

**Error Response:**

```jsx
{
  "success": false,
  "data": null,
  "error": "ERROR_CODE"
}
```

- **No extra keys allowed**
- **No nested error objects**
- **Error must be a string code, not an object**

---

# **API Endpoints (10 Total)**

---

## **1. POST /api/auth/signup**

Register a new user (creator or contestee)

### **Request Body**

```jsx
{
  "name": "Rahul Gujjar",
  "email": "rahul@example.com",
  "password": "rahul123",
  "role": "contestee"
}
```

### **Success Response** – `201 Created`

```jsx
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Rahul Gujjar",
    "email": "rahul@example.com",
    "role": "contestee"
  },
  "error": null
}
```

- If no role is given then default is contestee

### **Error Responses**

**400 Bad Request** – Invalid schema

```jsx
{
  "success": false,
  "data": null,
  "error": "INVALID_REQUEST"
}
```

**400 Bad Request** – Email exists

```jsx
{
  "success": false,
  "data": null,
  "error": "EMAIL_ALREADY_EXISTS"
}
```

---

## **2. POST /api/auth/login**

Login and receive JWT token

### **Request Body**

```jsx
{
  "email": "rahul@example.com",
  "password": "rahul123"
}
```

### **Success Response** – `200 OK`

```jsx
{
  "success": true,
  "data": {
    "token": "JWT_TOKEN"
  },
  "error": null
}
```

### **Error Responses**

**400 Bad Request** – Invalid schema

```jsx
{
  "success": false,
  "data": null,
  "error": "INVALID_REQUEST"
}
```

**401 Unauthorized** – Wrong credentials

```jsx
{
  "success": false,
  "data": null,
  "error": "INVALID_CREDENTIALS"
}
```

---

## **3. POST /api/contests** – *(Creator Only)*

Create a new contest

**Headers:** `Authorization: Bearer <token>`

### **Request Body**

```jsx
{
  "title": "Weekly Contest",
  "description": "MCQ + DSA",
  "startTime": "2026-01-20T10:00:00Z",
  "endTime": "2026-01-20T12:00:00Z"
}
```

### **Success Response** – `201 Created`

```jsx
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Weekly Contest",
    "description": "MCQ + DSA",
    "creatorId": 1,
    "startTime": "2026-01-20T10:00:00Z",
    "endTime": "2026-01-20T12:00:00Z"
  },
  "error": null
}
```

### **Error Responses**

**401 Unauthorized**

```jsx
{
  "success": false,
  "data": null,
  "error": "UNAUTHORIZED"
}
```

**403 Forbidden** – Not a creator

```jsx
{
  "success": false,
  "data": null,
  "error": "FORBIDDEN"
}
```

**400 Bad Request** – Invalid schema

json

```jsx
{
  "success": false,
  "data": null,
  "error": "INVALID_REQUEST"
}
```

---

## **4. GET /api/contests/:contestId**

Get contest details with all MCQs and DSA problems

**Headers:** `Authorization: Bearer <token>`

### **Success Response** – `200 OK`

```jsx
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Weekly Contest",
    "description": "MCQ + DSA",
    "startTime": "2026-01-20T10:00:00Z",
    "endTime": "2026-01-20T12:00:00Z",
    "creatorId": 1,
    "mcqs": [
      {
        "id": 10,
        "questionText": "Binary search complexity?",
        "options": ["O(n)", "O(log n)"],
        "points": 1
      }
    ],
    "dsaProblems": [
      {
        "id": 20,
        "title": "Two Sum",
        "description": "Find two numbers that add up to target",
        "tags": ["array"],
        "points": 100,
        "timeLimit": 2000,
        "memoryLimit": 256
      }
    ]
  },
  "error": null
}
```

**NOTE:** `correctOptionIndex` is **NOT** inclded in MCQs for contestees

### **Error Responses**

**401 Unauthorized**

```jsx
{
  "success": false,
  "data": null,
  "error": "UNAUTHORIZED"
}
```

**404 Not Found**

```jsx
{
  "success": false,
  "data": null,
  "error": "CONTEST_NOT_FOUND"
}
```

---

## **5. POST /api/contests/:contestId/mcq** – *(Creator Only)*

Add MCQ question to a contest

**Headers:** `Authorization: Bearer <token>`

### **Request Body**

```jsx
{
  "questionText": "Binary search complexity?",
  "options": ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
  "correctOptionIndex": 1,
  "points": 1
}
```

### **Success Response** – `201 Created`

```jsx
{
  "success": true,
  "data": {
    "id": 10,
    "contestId": 1
  },
  "error": null
}
```

### **Error Responses**

**401 Unauthorized**

```jsx
{
  "success": false,
  "data": null,
  "error": "UNAUTHORIZED"
}
```

**403 Forbidden** – Not a creator

```jsx
{
  "success": false,
  "data": null,
  "error": "FORBIDDEN"
}
```

**400 Bad Request** – Invalid schema

```jsx
{
  "success": false,
  "data": null,
  "error": "INVALID_REQUEST"
}
```

**404 Not Found** – Contest not found

```jsx
{
  "success": false,
  "data": null,
  "error": "CONTEST_NOT_FOUND"
}
```

---

## **6. POST /api/contests/:contestId/mcq/:questionId/submit** – *(Contestee Only)*

Submit answer for an MCQ question

**Headers:** `Authorization: Bearer <token>`

### **Request Body**

```jsx
{
  "selectedOptionIndex": 1
}
```

### **Success Response** – `201 Created`

```jsx
{
  "success": true,
  "data": {
    "isCorrect": true,
    "pointsEarned": 1
  },
  "error": null
}
```

### **Error Responses**

**401 Unauthorized**

```jsx
{
  "success": false,
  "data": null,
  "error": "UNAUTHORIZED"
}
```

**403 Forbidden** – Creator trying to submit to own contest

```jsx
{
  "success": false,
  "data": null,
  "error": "FORBIDDEN"
}
```

**400 Bad Request** – Already submitted

```jsx
{
  "success": false,
  "data": null,
  "error": "ALREADY_SUBMITTED"
}
```

**400 Bad Request** – Contest not active

```jsx
{
  "success": false,
  "data": null,
  "error": "CONTEST_NOT_ACTIVE"
}
```

**400 Bad Request** – Invalid schema

```jsx
{
  "success": false,
  "data": null,
  "error": "INVALID_REQUEST"
}
```

**404 Not Found** – Question not found

```jsx
{
  "success": false,
  "data": null,
  "error": "QUESTION_NOT_FOUND"
}
```

---

## **7. POST /api/contests/:contestId/dsa** – *(Creator Only)*

Add DSA problem to a contest

**Headers:** `Authorization: Bearer <token>`

### **Request Body**

```jsx
{
  "title": "Two Sum",
  "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
  "tags": ["array", "hash-table"],
  "points": 100,
  "timeLimit": 2000,
  "memoryLimit": 256,
  "testCases": [
    {
      "input": "2\n4 9\n2 7 11 15\n3 6\n3 2 4",
      "expectedOutput": "0 1\n1 2",
      "isHidden": false
    },
    {
      "input": "3\n2 6\n3 3\n5 10\n1 4 5 6 9\n4 8\n2 2 2 2",
      "expectedOutput": "0 1\n0 2\n1 3",
      "isHidden": true
    }
  ]
}

//Below is brief about the input:
Input format:
2                    ← number of test cases
4 9                  ← test case 1: n=4, target=9
2 7 11 15           ← array elements
3 6                  ← test case 2: n=3, target=6
3 2 4               ← array elements

Output format:
0 1                  ← answer for test case 1
1 2                  ← answer for test case 2
```

**NOTE:** Test cases are provided during problem creation itself

### **Success Response** – `201 Created`

```jsx
{
  "success": true,
  "data": {
    "id": 20,
    "contestId": 1
  },
  "error": null
}
```

### **Error Responses**

**401 Unauthorized**

```jsx
{
  "success": false,
  "data": null,
  "error": "UNAUTHORIZED"
}
```

**403 Forbidden** – Not a creator

```jsx
{
  "success": false,
  "data": null,
  "error": "FORBIDDEN"
}
```

**400 Bad Request** – Invalid schema

```jsx
{
  "success": false,
  "data": null,
  "error": "INVALID_REQUEST"
}
```

**404 Not Found** – Contest not found

```jsx
{
  "success": false,
  "data": null,
  "error": "CONTEST_NOT_FOUND"
}
```

---

## **8. GET /api/problems/:problemId**

Get DSA problem details with visible test cases only

**Headers:** `Authorization: Bearer <token>`

### **Success Response** – `200 OK`

```jsx
{
  "success": true,
  "data": {
    "id": 20,
    "contestId": 1,
    "title": "Two Sum",
    "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    "tags": ["array", "hash-table"],
    "points": 100,
    "timeLimit": 2000,
    "memoryLimit": 256,
    "visibleTestCases": [
      {
        "input": "2\n4 9\n2 7 11 15\n3 6\n3 2 4",
        "expectedOutput": "0 1\n1 2"
      }
    ]
  },
  "error": null
}
```

**CRITICAL:** Hidden test cases must **NEVER** be returned

### **Error Responses**

**401 Unauthorized**

```jsx
{
  "success": false,
  "data": null,
  "error": "UNAUTHORIZED"
}
```

**404 Not Found**

```jsx
{
  "success": false,
  "data": null,
  "error": "PROBLEM_NOT_FOUND"
}
```

---

## **9. POST /api/problems/:problemId/submit** – *(Contestee Only)*

Submit code solution for a DSA problem

**Headers:** `Authorization: Bearer <token>`

### **Request Body**

```jsx
{
  "code": "function twoSum(nums, target) { /* solution */ }",
  "language": "javascript"
}
```

**NOTE:** You can use Judge0, exec, Docker, or any method to execute code. We only care about the response format.

### **Success Response** – `201 Created`

**Case 1: All test cases passed**

```jsx
{
  "success": true,
  "data": {
    "status": "accepted",
    "pointsEarned": 100,
    "testCasesPassed": 5,
    "totalTestCases": 5
  },
  "error": null
}
```

**Case 2: Some test cases failed**

```jsx
{
  "success": true,
  "data": {
    "status": "wrong_answer",
    "pointsEarned": 60,
    "testCasesPassed": 3,
    "totalTestCases": 5
  },
  "error": null
}
```

**Case 3: Time limit exceeded**

```jsx
{
  "success": true,
  "data": {
    "status": "time_limit_exceeded",
    "pointsEarned": 0,
    "testCasesPassed": 0,
    "totalTestCases": 5
  },
  "error": null
}
```

**Case 4: Runtime error**

```jsx
{
  "success": true,
  "data": {
    "status": "runtime_error",
    "pointsEarned": 0,
    "testCasesPassed": 0,
    "totalTestCases": 5
  },
  "error": null
}
```

**Possible status values:**

- `"accepted"`
- `"wrong_answer"`
- `"time_limit_exceeded"`
- `"runtime_error"`

**Points Calculation:**

javascript

```jsx
pointsEarned = Math.floor((testCasesPassed / totalTestCases) * problemPoints)
```

### **Error Responses**

**401 Unauthorized**

```jsx
{
  "success": false,
  "data": null,
  "error": "UNAUTHORIZED"
}
```

**403 Forbidden** – Creator trying to submit to own contest

```jsx
{
  "success": false,
  "data": null,
  "error": "FORBIDDEN"
}
```

**400 Bad Request** – Contest not active

```jsx
{
  "success": false,
  "data": null,
  "error": "CONTEST_NOT_ACTIVE"
}
```

**400 Bad Request** – Invalid schema

```jsx
{
  "success": false,
  "data": null,
  "error": "INVALID_REQUEST"
}
```

**404 Not Found**

```jsx
{
  "success": false,
  "data": null,
  "error": "PROBLEM_NOT_FOUND"
}
```

---

## **10. GET /api/contests/:contestId/leaderboard**

Get contest leaderboard with user rankings

**Headers:** `Authorization: Bearer <token>`

### **Success Response** – `200 OK`

```jsx
{
  "success": true,
  "data": [
    {
      "userId": 2,
      "name": "Simran",
      "totalPoints": 250,
      "rank": 1
    },
    {
      "userId": 3,
      "name": "Anmo",
      "totalPoints": 180,
      "rank": 2
    },
    {
      "userId": 4,
      "name": "Rahul Gujjar",
      "totalPoints": 180,
      "rank": 2
    }
  ],
  "error": null
}
```

**Leaderboard Calculation Rules:**

1. Sum all MCQ points earned by the user
2. For each DSA problem, take the **maximum** points earned across all submissions
3. Total = MCQ points + sum of best DSA submissions
4. Sort by total points (descending)
5. Assign ranks (users with same points get same rank)

### **Error Responses**

**401 Unauthorized**

```jsx
{
  "success": false,
  "data": null,
  "error": "UNAUTHORIZED"
}
```

**404 Not Found**

```jsx
{
  "success": false,
  "data": null,
  "error": "CONTEST_NOT_FOUND"
}
```

---

# **Implementation Guidelines**

## **Code Execution for DSA Problems**

You have **complete freedom** in how you execute code:

1. **Judge0 API** – Use external service
2. **Child Process (exec)** – Run code locally
3. **Docker Containers** – Isolated execution
4. **Mock Evaluation** – Random pass/fail for testing

**We only care that:**

- Request/response format matches exactly
- Points calculation is correct: `Math.floor((passed / total) * points)`
- Status values are one of: `accepted`, `wrong_answer`, `time_limit_exceeded`, `runtime_error`

---

**To prepare for testing:**

- Ensure all responses match the format **exactly**
- No extra fields in responses
- Error must be a string, not an object
- All timestamps in ISO 8601 format
- JSONB fields properly serialized

---

# **Critical Reminders**

**Response Format (Non-Negotiable):**

```jsx
{
  "success": true/false,
  "data": {} or null,
  "error": "ERROR_CODE" or null
}
```

- **Error Codes Must Be Strings:**

```jsx
//CORRECT
{ "success": false, "data": null, "error": "INVALID_REQUEST" }

//WRONG
{ "success": false, "data": null, "error": { "message": "Invalid" } }
```

---

**Good luck!** 

TEST CASE: https://github.com/rahul-MyGit/contest-test