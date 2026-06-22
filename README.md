# Auth Protocol

A secure authentication system built with Node.js and PostgreSQL that implements modern authentication and authorization practices, including Multi-Factor Authentication (MFA), JWT-based authentication, refresh token rotation, and password recovery mechanisms.

## Why this project?

Authentication is a critical component of modern web applications. This project was developed to explore and implement industry-standard security practices while providing a reusable authentication module for future applications.

The project demonstrates how secure authentication workflows can be designed and implemented in a real-world backend application.

## What does this project provide?

* User Registration
* User Login with Password Verification
* Multi-Factor Authentication (Email OTP)
* JWT Access Token Generation
* Secure Refresh Token Rotation
* HTTP-Only Cookie-Based Authentication
* Account Locking after Multiple Failed Login Attempts
* Forgot Password Functionality
* Password Reset via Email
* Secure Password Hashing using bcrypt
* Token Revocation on Logout and Password Reset

## Tech Stack

* **Backend:** Node.js, Express.js
* **Database:** PostgreSQL
* **Authentication:** JWT, bcrypt
* **Email Service:** Nodemailer
* **Environment Management:** dotenv

## Project Structure

```text
config/
controllers/
queries/
routes/
middlewares/
examples/
```

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file and add the required environment variables.

4. Start the application:

```bash
npm run dev
```

## Environment Variables

Example:

```env
PORT=
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=

MAIL_USER=
MAIL_PASS=
```

## Future Improvements

* OAuth Integration (Google, GitHub)
* Rate Limiting
* Role-Based Access Control (RBAC)
* Audit Logging
* Session Management Dashboard

## Developed By

**Vanshi Gala**

## License

This project is open-source and available under the MIT License.
