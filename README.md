# VentureMind AI – AI Entrepreneur Trainer & Simulator

A full-stack web application designed to help aspiring founders validate startup ideas, understand market opportunities, simulate finances, and pitch to virtual AI investors.

---

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, React Router v6, Recharts
- **Backend**: Node.js, Express.js (ES Modules)
- **Database**: NeonDB / MySQL(Connection Pooling with `mysql2/promise`)
- **Validation**: Zod
- **Security**: JWT & Bcrypt (12 salt rounds)
- **AI Engine**: Google Gemini API

---

## Directory Structure
```text
├── client/                     # React + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/         # Navbar, ProtectedRoute, Layout
│   │   ├── context/            # AuthContext (JWT state)
│   │   ├── pages/              # LoginPage, RegisterPage, DashboardPage
│   │   └── services/           # Axios instance & Auth API client
├── server/                     # Node.js + Express Backend
│   ├── schema.sql              # MySQL DDL with 10 tables, indexes & foreign keys
│   ├── src/
│   │   ├── config/             # DB pool, environment variables
│   │   ├── controllers/        # Auth and Startup controllers
│   │   ├── middleware/         # JWT auth, Zod validation, Centralized Error Handler
│   │   ├── models/             # User and Startup data access layer
│   │   ├── routes/             # Auth and Startup route endpoints
│   │   ├── validators/         # Zod request validation schemas
│   │   ├── server.js           # Server entry point
│   │   └── testIntegration.js  # Automated E2E verification script
```

---

## How to Run

### 1. Database Setup
Ensure MySQL is running locally. The server automatically connects and runs `schema.sql` on startup to initialize `venturemind_db` and all 10 tables.

Edit `server/.env` if you need to adjust database credentials:
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=venturemind_db
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

### 2. Start the Backend Server
```bash
cd server
npm run dev
```
The server will start at `http://localhost:5000`.

### 3. Start the Frontend Client
```bash
cd client
npm run dev
```
The client will start at `http://localhost:5173`.

### 4. Run Verification Tests
```bash
# Run comprehensive email OTP verification and access control test
npm run test:requirements

# Or run baseline auth & startup test
npm run test:integration
```
