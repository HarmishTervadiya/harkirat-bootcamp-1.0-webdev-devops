# Course Selling API – Coding Assignment

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run dev
```

**Tools Allowed:** Google, official documentation, Stack Overflow (**no AI tools**)

---

## Prerequisites

- TypeScript
- Express
- Zod
- Prisma (basic models, primary keys, **1:many relationships only**)
- JWT Authentication
- Bun runtime
- PostgreSQL

---

## Project Overview

Build a RESTful API for a **course selling platform** where:

- Users can sign up and log in
- Instructors can create courses
- Each course can have multiple lessons
- Users can purchase courses

**Only 1:many relationships are allowed**

---

## Setup Instructions

1. Initialize a new Bun project with TypeScript

```jsx
bun init
```

1. Install dependencies:
    
    ```bash
    bun add express zod jsonwebtoken bcrypt
    bun add -d @types/express @types/jsonwebtoken @types/bcrypt prisma
    ```
    
2. Initialize Prisma

```jsx
bun add -d prisma @types/pg
bun add @prisma/client @prisma/adapter-pg pg

bunx prisma init
```

1. Create db.ts at root

```jsx
import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
```

```jsx
const adapter = new PrismaPg({
connectionString: process.env.DATABASE_URL!,
});
```

```jsx
export const prisma = new PrismaClient({
adapter,
});
```

1. Create a `.env` file:
    
    ```
    DATABASE_URL=postgresql://...
    JWT_SECRET=supersecret
    ```
    

---

## Part 1: Database Design (Prisma)

Design the Prisma schema with the following models.

---

### User Model

- `id` (String, UUID, Primary Key)
- `email` (String, unique)
- `password` (String)
- `name` (String)
- `role` (Enum: STUDENT, INSTRUCTOR)
- `createdAt` (DateTime)

---

### Course Model

- `id` (String, UUID, Primary Key)
- `title` (String)
- `description` (String, optional)
- `price` (Int)
- `instructorId` (String, Foreign Key → User)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

---

### Lesson Model

- `id` (String, UUID, Primary Key)
- `title` (String)
- `content` (String)
- `courseId` (String, Foreign Key → Course)
- `createdAt` (DateTime)

---

### Purchase Model

- `id` (String, UUID, Primary Key)
- `userId` (String, Foreign Key → User)
- `courseId` (String, Foreign Key → Course)
- `createdAt` (DateTime)

---

### Relationships (Strict)

- User **has many** Courses (Instructor)
- Course **has many** Lessons
- User **has many** Purchases
- Course **has many** Purchases

🚫 No many-to-many tables allowed

---

### Tasks

- Define Prisma schema
- Run migrations
- Generate Prisma Client

---

## Part 2: Validation (Zod)

Create Zod schemas for validating request bodies.

### Required Schemas

1. **SignupSchema**
    - email
    - password (min 6 chars)
    - name
    - role
2. **LoginSchema**
    - email
    - password
3. **CreateCourseSchema**
    - title
    - description
    - price
4. **CreateLessonSchema**
    - title
    - content
    - courseId
5. **PurchaseCourseSchema**
    - courseId

---

## Part 3: Authentication (JWT)

### Requirements

- Implement JWT-based authentication
- Passwords must be hashed using bcrypt
- Create `authMiddleware` that:
    - Reads token from `Authorization` header
    - Verifies JWT
    - Attaches `userId` and `role` to `req`

---

## Part 4: API Endpoints

### Auth Endpoints

- `POST /auth/signup` – Register a user
- `POST /auth/login` – Login and return JWT

---

### Course Endpoints

- `POST /courses`
    - Only INSTRUCTOR can create courses
- `GET /courses`
    - Public endpoint
- `GET /courses/:id`
    - Get course with all lessons
- `PATCH /courses/:id`
    - Only course instructor
- `DELETE /courses/:id`
    - Only course instructor

---

### Lesson Endpoints

- `POST /lessons`
    - Only instructor of the course
- `GET /courses/:courseId/lessons`
    - Public

---

### Purchase Endpoints

- `POST /purchases`
    - Student purchases a course
- `GET /users/:id/purchases`
    - Get all purchased courses of a user

---

## Part 5: Authorization Rules

- Students **cannot** create courses or lessons
- Instructors **cannot** purchase courses
- Only the course instructor can:
    - Update course
    - Delete course
    - Add lessons

---

## Part 6: Advanced Features (Choose Any 2)

### Option A: Global Error Middleware

Standard error response format:

```json
{
"error":"Invalid request",
"statusCode":400,
"timestamp":"2024-01-22T10:30:00Z"
}

```

---

### Option B: Pagination

Add pagination to:

- `GET /courses`
- `GET /users/:id/purchases`

```
?page=1&limit=10

```

Response format:

```json
{
"data":[],
"total":40,
"page":1,
"limit":10
}

```

---

### Option C: Course Revenue Stats

Endpoint:

```
GET /courses/:id/stats

```

Returns:

- Total purchases
- Total revenue
- Course price

---

### Option D: Middleware-based Role Guard

Create reusable middleware:

```tsx
requireRole("INSTRUCTOR")

```

---

### Bonus (Optional)

- Use enum types in Prisma
- Use transaction while purchasing a course
- Prevent duplicate purchases

---

**Good luck**