# 🏨 Hotel Booking Platform Backend

A full-featured **Hotel Booking Platform** backend API built with Node.js, Express, PostgreSQL, and Prisma. Supports hotel owners listing properties and customers booking rooms.

> 📋 **[View Full Assignment Details →](./task.md)**

---

## ✨ Features

- **JWT Authentication** - Secure signup/login with role-based access
- **Hotel Management** - Owners can create hotels and add rooms
- **Booking System** - Customers can search, book, and cancel reservations
- **Review System** - Leave ratings and reviews for completed stays
- **Data Validation** - Zod schemas ensure request integrity

---

## 🛠️ Tech Stack

| Technology | Purpose            |
| ---------- | ------------------ |
| Bun        | JavaScript runtime |
| Express    | Web framework      |
| PostgreSQL | Database           |
| Prisma     | ORM                |
| JWT        | Authentication     |
| bcrypt     | Password hashing   |
| Zod        | Validation         |

---

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh) (v1.3.6+)
- [PostgreSQL](https://www.postgresql.org/) database

### 1. Clone the Repository

```bash
git clone <repository-url>
cd hotel-management
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/hotel_db"
JWT_SECRET="your-super-secret-key"
```

### 4. Setup Database

```bash
bunx prisma generate
bunx prisma db push
```

### 5. Run the Server

```bash
bun run start
```

Server starts at `http://localhost:3000` 🎉

---

## 📁 Project Structure

```
hotel-management/
├── src/               # Application source code
├── prisma/            # Database schema & migrations
├── generated/         # Prisma generated client
├── .env.example       # Environment template
├── package.json       # Dependencies
└── task.md            # Full assignment specification
```

---

## 🔗 API Endpoints

| Method | Endpoint                   | Description          |
| ------ | -------------------------- | -------------------- |
| POST   | `/api/auth/signup`         | Register new user    |
| POST   | `/api/auth/login`          | Login & get JWT      |
| POST   | `/api/hotels`              | Create hotel (owner) |
| GET    | `/api/hotels`              | Search hotels        |
| GET    | `/api/hotels/:id`          | Get hotel details    |
| POST   | `/api/hotels/:id/rooms`    | Add room (owner)     |
| POST   | `/api/bookings`            | Create booking       |
| GET    | `/api/bookings`            | List user bookings   |
| PUT    | `/api/bookings/:id/cancel` | Cancel booking       |
| POST   | `/api/hotels/:id/reviews`  | Add review           |

---

## 🍴 Fork & Contribute

1. **Fork** this repository
2. Clone your fork: `git clone <your-fork-url>`
3. Follow the [Quick Start](#-quick-start) steps above
4. Create a feature branch: `git checkout -b feature/amazing-feature`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a **Pull Request**

---

## 📝 License

This project is part of the [Harkirat Bootcamp](https://harkirat.classx.co.in/) curriculum.
