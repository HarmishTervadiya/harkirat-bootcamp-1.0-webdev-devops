# Appointment Booking System

A slot-based appointment booking system built with Express, TypeScript, Prisma ORM, and PostgreSQL. This system allows service providers to create services, set availability, and manage appointments, while users can browse services and book available time slots.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [API Testing](#api-testing)
- [Database Schema](#database-schema)
- [Business Rules](#business-rules)
- [Project Structure](#project-structure)

---

## Features

- **User Authentication**: JWT-based authentication with role-based access control (USER, SERVICE_PROVIDER)
- **Service Management**: Service providers can create and manage services
- **Availability Management**: Set weekly recurring availability for services
- **Dynamic Slot Generation**: Time slots are generated dynamically based on availability
- **Appointment Booking**: Users can book available slots
- **Provider Schedule**: Service providers can view their daily schedule (Bonus feature)

---

## Tech Stack

- **Runtime**: [Bun](https://bun.sh/)
- **Backend Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: Zod

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Bun** (v1.0 or higher) - [Installation Guide](https://bun.sh/docs/installation)
- **PostgreSQL** (v12 or higher) - Running locally or accessible remotely
- **Git** - For cloning the repository

---

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd super30-appointment-booking
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/pronto_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=3000
```

> **Note**: Replace `username`, `password`, and database name with your PostgreSQL credentials.

### 4. Generate Prisma Client

```bash
bunx prisma generate
```

### 5. Push Database Schema

```bash
bunx prisma db push
```

This will create all necessary tables in your PostgreSQL database.

---

## Configuration

### Environment Variables

| Variable       | Description                              | Example                                    |
| -------------- | ---------------------------------------- | ------------------------------------------ |
| `DATABASE_URL` | PostgreSQL connection string             | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET`   | Secret key for JWT token generation      | `your-secret-key`                          |
| `PORT`         | Server port (optional, defaults to 3000) | `3000`                                     |

---

## Running the Application

### Development Mode

Start the server with auto-reload:

```bash
bun run start
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

### Production Mode

```bash
bun run src/index.ts
```

---

## API Documentation

### Authentication

#### Register a New User

**POST** `/auth/register`

**Request Body:**

```json
{
  "name": "Dr Smith",
  "email": "dr@clinic.com",
  "password": "password123",
  "role": "SERVICE_PROVIDER"
}
```

**Response:** `201 Created`

```json
{
  "message": "User created Successfully with id {userId}"
}
```

---

#### Login

**POST** `/auth/login`

**Request Body:**

```json
{
  "email": "dr@clinic.com",
  "password": "password123"
}
```

**Response:** `200 OK`

```json
{
  "token": "jwt-token"
}
```

---

### Services

#### Create a Service (Service Provider Only)

**POST** `/services`

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "name": "Physiotherapy",
  "type": "MEDICAL",
  "durationMinutes": 30
}
```

**Response:** `201 Created`

```json
{
  "id": "uuid",
  "name": "Physiotherapy",
  "type": "MEDICAL",
  "durationMinutes": 30
}
```

---

#### Set Service Availability (Service Provider Only)

**POST** `/services/:serviceId/availability`

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "dayOfWeek": 4,
  "startTime": "09:00",
  "endTime": "12:00"
}
```

**Response:** `201 Created`

> **Note**: `dayOfWeek` is 0-6 (Sunday-Saturday)

---

#### Get All Services

**GET** `/services?type=MEDICAL`

**Query Parameters:**

- `type` (optional): Filter by service type (MEDICAL, HOUSE_HELP, BEAUTY, FITNESS, EDUCATION, OTHER)

**Response:** `200 OK`

```json
[
  {
    "id": "uuid",
    "name": "Physiotherapy",
    "type": "MEDICAL",
    "durationMinutes": 30,
    "providerName": "Dr Smith"
  }
]
```

---

#### Get Available Slots

**GET** `/services/:serviceId/slots?date=YYYY-MM-DD`

**Query Parameters:**

- `date` (required): Date in YYYY-MM-DD format

**Response:** `200 OK`

```json
{
  "serviceId": "uuid",
  "date": "2026-02-06",
  "slots": [
    {
      "slotId": "uuid_2026-02-06_09:00",
      "startTime": "09:00",
      "endTime": "09:30"
    }
  ]
}
```

---

### Appointments

#### Book an Appointment (User Only)

**POST** `/appointments`

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "slotId": "uuid_2026-02-06_09:00"
}
```

**Response:** `201 Created`

```json
{
  "id": "uuid",
  "slotId": "uuid_2026-02-06_09:00",
  "status": "BOOKED"
}
```

---

#### Get My Appointments (User Only)

**GET** `/appointments/me`

**Headers:**

```
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
[
  {
    "serviceName": "Physiotherapy",
    "type": "MEDICAL",
    "date": "2026-02-06",
    "startTime": "09:00",
    "endTime": "09:30",
    "status": "BOOKED"
  }
]
```

---

### Provider Schedule (Bonus Feature)

#### Get Provider's Daily Schedule (Service Provider Only)

**GET** `/providers/me/schedule?date=YYYY-MM-DD`

**Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `date` (required): Date in YYYY-MM-DD format

**Response:** `200 OK`

```json
{
  "date": "2026-02-06",
  "services": [
    {
      "serviceId": "uuid",
      "serviceName": "Physiotherapy",
      "appointments": [
        {
          "appointmentId": "uuid",
          "userName": "Rahul",
          "startTime": "09:00",
          "endTime": "09:30",
          "status": "BOOKED"
        }
      ]
    }
  ]
}
```

---

## Database Schema

### User

Stores user information with role-based access control.

**Fields:**

- `id`: UUID (Primary Key)
- `name`: String
- `email`: String (Unique)
- `passwordHash`: String
- `role`: Enum (USER, SERVICE_PROVIDER)
- `createdAt`: DateTime
- `updatedAt`: DateTime

---

### Service

Services created by providers with duration and type.

**Fields:**

- `id`: UUID (Primary Key)
- `name`: String
- `type`: Enum (MEDICAL, HOUSE_HELP, BEAUTY, FITNESS, EDUCATION, OTHER)
- `durationMinutes`: Integer
- `providerId`: UUID (Foreign Key → User)
- `createdAt`: DateTime
- `updatedAt`: DateTime

---

### Availability

Weekly recurring availability for services.

**Fields:**

- `id`: UUID (Primary Key)
- `dayOfWeek`: Integer (0-6, Sunday-Saturday)
- `startTime`: String (HH:MM format)
- `endTime`: String (HH:MM format)
- `serviceId`: UUID (Foreign Key → Service)
- `createdAt`: DateTime
- `updatedAt`: DateTime

---

### Appointment

Booked appointments with unique slot identifiers.

**Fields:**

- `id`: UUID (Primary Key)
- `slotId`: String (Unique composite with status)
- `date`: DateTime
- `startTime`: String (HH:MM format)
- `endTime`: String (HH:MM format)
- `status`: Enum (BOOKED, CANCELLED)
- `userId`: UUID (Foreign Key → User)
- `serviceId`: UUID (Foreign Key → Service)
- `createdAt`: DateTime
- `updatedAt`: DateTime

---

## Business Rules

1. **Time Format**: All times must be in HH:MM (24-hour) format, with minutes as 00 or 30
2. **Service Duration**: Must be between 30-120 minutes, in multiples of 30
3. **Dynamic Slots**: Time slots are generated dynamically and never stored in the database
4. **Booking Restrictions**:
   - Users cannot book past time slots
   - Service providers cannot book their own services
5. **Availability Constraints**: Availability periods cannot overlap for the same service on the same day
6. **Unique Bookings**: Each slot can only be booked once (enforced by unique constraint on `slotId` + `status`)

---

## API Testing

This project includes a complete Bruno API collection for testing all endpoints. Bruno is a fast, open-source API client similar to Postman.

### Bruno Collection

The `bruno-api-definations/` folder contains pre-configured API requests for all endpoints:

- **register.bru** - User registration
- **login.bru** - User authentication
- **addService.bru** - Create a new service
- **addServiceAvaiilabitlity.bru** - Set service availability
- **getServices.bru** - Get all services
- **getServicesSlots.bru** - Get available slots for a service
- **bookAppointment.bru** - Book an appointment
- **getUserAppointments.bru** - Get user's appointments
- **providerDailySchedule.bru** - Get provider's daily schedule

### Using Bruno

1. **Install Bruno**: Download from [usebruno.com](https://www.usebruno.com/)
2. **Open Collection**: Open the `bruno-api-definations` folder in Bruno
3. **Configure Environment Variables**: In Bruno, navigate to the environment settings and configure the following variables:

   ```
   baseUrl: http://localhost:3000
   providerAccessToken: <your-provider-jwt-token>
   customerAccessToken: <your-customer-jwt-token>
   ```

   > **Note**: You'll get the access tokens after registering and logging in users with different roles (SERVICE_PROVIDER and USER)

4. **Test Endpoints**: Run the requests in order:
   - First, register users (both SERVICE_PROVIDER and USER roles)
   - Login to get JWT tokens for each role
   - Copy the tokens to the environment variables (`providerAccessToken` and `customerAccessToken`)
   - Use the authenticated requests to test all endpoints

> **Tip**: The Bruno collection includes all necessary headers and example request bodies for easy testing.

---

## Project Structure

```
super30-appointment-booking/
├── src/
│   ├── controller/       # Route controllers
│   ├── middleware/       # Authentication & validation middleware
│   ├── routes/          # API route definitions
│   ├── utils/           # Helper functions
│   ├── config.ts        # Configuration
│   └── index.ts         # Application entry point
├── prisma/
│   └── schema.prisma    # Database schema
├── bruno-api-definations/ # API testing collection
├── .env.example         # Environment variables template
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript configuration
└── README.md           # This file
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is part of the Harkirat Bootcamp 1.0 - WebDev & DevOps curriculum.

---

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running
- Verify DATABASE_URL in `.env` is correct
- Check if the database exists

### Prisma Client Errors

- Run `bunx prisma generate` to regenerate the client
- Ensure schema is pushed with `bunx prisma db push`

### Authentication Errors

- Verify JWT_SECRET is set in `.env`
- Check token format in Authorization header: `Bearer <token>`

---
