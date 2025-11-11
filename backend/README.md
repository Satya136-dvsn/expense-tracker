# Budget Tracker Backend

A Spring Boot backend application for personal finance tracking with JWT-based authentication and role-based access control.

## Features

- **User Authentication**: JWT-based signup and login system
- **Role-Based Access Control**: User and Admin roles
- **User Profile Management**: Income, savings, and target expenses tracking
- **Secure Password Handling**: BCrypt password encoding
- **RESTful API**: Clean and well-documented endpoints
- **MySQL Database**: Persistent data storage

## Technology Stack

- Java 21
- Spring Boot 3.3.0
- Spring Security
- Spring Data JPA
- MySQL 8.0
- JWT (JSON Web Tokens)
- Maven

## Prerequisites

- Java 21 or higher
- Maven 3.6+
- MySQL 8.0+

## Setup Instructions

### 1. Database Setup

Create a MySQL database:

```sql
CREATE DATABASE budget_tracker;
```

### 2. Configuration

Update the `application.properties` file with your database credentials:

```properties
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### 3. Build and Run

```bash
# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

The application will start on `http://localhost:8080`

## API Endpoints

### Authentication

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### User Profile (Requires Authentication)

- `GET /api/user/profile` - Get current user profile
- `PUT /api/user/profile` - Update current user profile

### Admin Endpoints (Requires Admin Role)

- `GET /api/user/profile/{userId}` - Get user profile by ID
- `PUT /api/user/profile/{userId}` - Update user profile by ID

## Request/Response Examples

### Signup Request

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login Request

```json
{
  "username": "john_doe",
  "password": "password123"
}
```

### Profile Update Request

```json
{
  "monthlyIncome": 5000.00,
  "currentSavings": 10000.00,
  "targetExpenses": 3000.00
}
```

### Auth Response

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "type": "Bearer",
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "role": "USER",
  "monthlyIncome": 5000.00,
  "currentSavings": 10000.00,
  "targetExpenses": 3000.00
}
```

## Security Features

- JWT token-based authentication
- Password encryption using BCrypt
- Role-based authorization
- CORS configuration
- Input validation

## Testing

Run the tests with:

```bash
mvn test
```

## Project Structure

```
src/
├── main/
│   ├── java/com/budgettracker/
│   │   ├── config/          # Configuration classes
│   │   ├── controller/      # REST controllers
│   │   ├── dto/            # Data Transfer Objects
│   │   ├── model/          # Entity classes
│   │   ├── repository/     # Data access layer
│   │   ├── security/       # Security components
│   │   ├── service/        # Business logic
│   │   └── util/          # Utility classes
│   └── resources/
│       └── application.properties
└── test/                   # Test classes
```
