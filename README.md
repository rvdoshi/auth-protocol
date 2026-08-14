Auth Protocol
A secure authentication system built with Node.js and PostgreSQL that implements modern authentication and authorization practices, including Multi-Factor Authentication (MFA), JWT-based authentication, refresh token rotation, and password recovery mechanisms.
Why this project?
Authentication is a critical component of modern web applications. This project was developed to explore and implement industry-standard security practices while providing a reusable authentication module for future applications.

The project demonstrates how secure authentication workflows can be designed and implemented in a real-world backend application.
What does this project provide?
User Registration
User Login with Password Verification
Multi-Factor Authentication (Email OTP)
JWT Access Token Generation
Secure Refresh Token Rotation
HTTP-Only Cookie-Based Authentication
Account Locking after Multiple Failed Login Attempts
Forgot Password Functionality
Password Reset via Email
Secure Password Hashing using bcrypt
Token Revocation on Logout and Password Reset
Tech Stack
Backend: Node.js, Express.js
Database: PostgreSQL
Authentication: JWT, bcrypt
Email Service: Nodemailer
Environment Management: dotenv
Project Structure
config/

controllers/

queries/

routes/

middlewares/

examples/
Installation
Clone the repository:

git clone <repository-url>

Install dependencies:

npm install

Copy .env.example to .env and fill in the required environment variables.

Start the application:

npm run dev
Environment Variables
See .env.example for the full list. Summary:

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
Future Improvements
OAuth Integration (Google, GitHub)
Rate Limiting
Role-Based Access Control (RBAC)
Audit Logging
Session Management Dashboard
Developed By
Kvartech
License
This project is open-source and available under the MIT License.

