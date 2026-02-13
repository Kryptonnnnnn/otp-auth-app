# 🔐 OTP Authentication Web App

A minimal full-stack OTP-based authentication system built using **React (Vite)** and **Node.js (Express)**.

This project demonstrates secure OTP login flow, attempt limiting, temporary blocking, and protected routes — implemented within a 2–3 hour challenge scope.

---

## 🚀 Tech Stack

### Frontend
- React 18 (Vite)
- React Router v6
- Axios
- CSS (custom styling)
- LocalStorage for session persistence

### Backend
- Node.js
- Express
- JSON Web Token (JWT)
- In-memory OTP store (Map)


## 🏗 Architecture Overview

- React frontend communicates with Express backend via REST APIs.
- OTPs are generated server-side and stored temporarily in memory.
- Backend enforces:
  - OTP expiration
  - Maximum 3 attempts
  - 10-minute block
- JWT token issued on successful verification.
- Protected routes validate JWT on every request.

---

## 🔄 Authentication Flow

flowchart TD

A[User enters Email/Phone] --> B[POST /auth/request-otp]
B --> C{Is User Blocked?}

C -- Yes --> D[Return 403 + Remaining Time]
C -- No --> E[Generate OTP]

E --> F[Store OTP + Expiry + Attempts]
F --> G[User enters OTP]
G --> H[POST /auth/verify-otp]

H --> I{OTP Valid?}

I -- No --> J{Attempts < 3?}
J -- Yes --> K[Return Error]
J -- No --> L[Block User 10 Minutes]

I -- Yes --> M[Generate JWT Token]
M --> N[Redirect to /welcome]

N --> O[GET /auth/me]
O --> P[Return User Info]


🔐 Security Features

OTP expires in 5 minutes
Maximum 3 invalid attempts
User blocked for 10 minutes
Block time displayed as live countdown
Backend enforces blocking (not frontend)
JWT protected routes
Logout clears token and history
Identifier masking (email/phone)

🧠 Assumptions

Users are auto-created (no database required)
OTP delivery is mocked via console log
In-memory store used for simplicity
Server restart resets OTP data
No external rate limiter implemented

📂 Project Structure
otp-auth-app/
│
├── backend/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── api.js
│   │   ├── main.jsx
│   │   └── styles.css
│   └── package.json
│
└── README.md


🛠 How to Run Locally

1️⃣ Clone Repository
git clone <https://github.com/Kryptonnnnnn/otp-auth-app>
cd otp-auth-app

2️⃣ Run Backend
cd backend
npm install
node server.js
Server runs on:
http://localhost:5000

3️⃣ Run Frontend
Open new terminal:

cd frontend
npm install
npm run dev
Frontend runs on:

http://localhost:5173


🧪 Test Flow

Enter valid email or 10-digit phone
Check backend console for OTP
Enter OTP
Test:
Wrong OTP 3 times → blocked
Refresh page → still blocked
Countdown visible
Logout clears session

📌 API Endpoints

POST /auth/request-otp
Request OTP
Body:
{
  "identifier": "email_or_phone"
}
POST /auth/verify-otp
Verify OTP
{
  "identifier": "email_or_phone",
  "otp": "123456"
}
GET /auth/me
Get authenticated user

Headers:
Authorization: Bearer <token>


🎯 What This Demonstrates

Clean architecture reasoning
Secure OTP validation
Proper state management
Backend-driven security
Route protection
UX improvements (countdown, masking, loading state)
Clear documentation



