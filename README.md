# 💰 FinTrackBuddy - Smart Expense Tracker

A full-stack personal finance management application built with **React, Express.js, PostgreSQL, and Prisma**. FinTrackBuddy helps users manage income, expenses, accounts, categories, and financial analytics through a modern and responsive dashboard.

---

## 📖 Project Overview

**FinTrackBuddy** is a full-stack personal finance management application designed to help users track, manage, analyze, and visualize their daily income and expenses.

The application provides a real-world fintech SaaS-style experience with:

- 🔐 User authentication
- 💰 Income and expense management
- 📊 Financial analytics
- 🏦 Multiple accounts and wallets
- 🗂️ Custom categories
- 📈 Interactive charts
- 🔎 Transaction search and filtering
- 🌙 Dark/Light theme
- 📱 Responsive UI
- 🗄️ PostgreSQL database persistence

The application uses a PostgreSQL database, so user data remains persistent even after refreshing the page. Each user has their own isolated account and financial data.

---

## 🎯 Purpose & Learning Goals

This project was developed to gain practical experience with modern full-stack development technologies.

### Key Learning Areas

- React frontend development
- Express.js backend development
- PostgreSQL database management
- Prisma ORM
- REST API development
- JWT authentication
- Password hashing with bcrypt
- CRUD operations
- Frontend-backend integration
- Context API for state management
- Database schema design
- Data visualization
- Responsive UI/UX
- Authentication and authorization
- Environment variable management

The project demonstrates the complete data flow:

```text
User Input
    ↓
React Frontend
    ↓
Axios / REST API
    ↓
Express.js Backend
    ↓
Prisma ORM
    ↓
PostgreSQL Database
    ↓
Backend Response
    ↓
React UI
```

---

## ✨ Features

### 🔐 Authentication

- User Signup
- User Login
- JWT-based authentication
- Password hashing using bcryptjs
- Protected routes
- Automatic logout when token expires

### 📊 Dashboard

- Total income
- Total expenses
- Remaining balance
- Interactive pie charts
- Interactive bar charts
- Financial overview

### 💸 Expense Management

- Add expenses
- Edit expenses
- Delete expenses
- Expense categories
- Expense dates
- Account association
- Expense descriptions

### 💰 Income Management

- Add income
- Edit income
- Delete income
- Income source
- Income category
- Income date
- Account association

### 📋 Transaction Management

- View all transactions
- Search transactions
- Filter transactions
- Sort transactions
- Pagination
- Transaction history

### 🗂️ Category Management

- Create custom categories
- Category icons
- Category colors
- Expense categories
- Income categories
- Default categories
- Default categories cannot be deleted

### 🏦 Account Management

Users can manage multiple financial accounts such as:

- Bank accounts
- Wallets
- Cash
- Credit cards

The application also tracks the total balance across accounts.

### 📈 Analytics

- Spending trends
- Financial insights
- Savings goals
- Smart recommendations
- Interactive charts

### ⚙️ Settings

- Dark/Light theme
- Currency selection
  - USD
  - EUR
  - GBP
  - INR

- Notification preferences
- CSV export

### 📱 Responsive Design

The application is designed to work across:

- 📱 Mobile
- 📲 Tablet
- 💻 Desktop

---

## 🛠️ Technologies Used

### Frontend

| Technology          | Purpose             |
| ------------------- | ------------------- |
| React 18            | UI Development      |
| Vite                | Frontend Build Tool |
| React Router DOM v6 | Routing             |
| Tailwind CSS        | Styling             |
| Framer Motion       | Animations          |
| Recharts            | Data Visualization  |
| Lucide React        | Icons               |
| Context API         | State Management    |
| Axios               | HTTP Requests       |

### Backend

| Technology | Purpose               |
| ---------- | --------------------- |
| Node.js    | Runtime Environment   |
| Express.js | Backend Framework     |
| Prisma     | ORM                   |
| PostgreSQL | Relational Database   |
| JWT        | Authentication        |
| bcryptjs   | Password Hashing      |
| CORS       | Cross-Origin Requests |
| dotenv     | Environment Variables |

---

## 📁 Project Structure

```text
FinTrackBuddy/
│
├── frontend/
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── layout/
│   │   │   └── charts/
│   │   │
│   │   ├── pages/
│   │   │   ├── Login/
│   │   │   ├── Signup/
│   │   │   ├── Dashboard/
│   │   │   ├── Expenses/
│   │   │   ├── AddIncome/
│   │   │   ├── Transactions/
│   │   │   ├── Analytics/
│   │   │   ├── Categories/
│   │   │   ├── Accounts/
│   │   │   ├── Profile/
│   │   │   └── Settings/
│   │   │
│   │   ├── context/
│   │   │   ├── AuthContext
│   │   │   ├── ThemeContext
│   │   │   ├── CurrencyContext
│   │   │   ├── ExpenseContext
│   │   │   ├── CategoryContext
│   │   │   └── AccountContext
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   └── package.json
│
├── backend/
│   │
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   │
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── expenseController.js
│   │   │   ├── incomeController.js
│   │   │   ├── dashboardController.js
│   │   │   ├── categoryController.js
│   │   │   └── accountController.js
│   │   │
│   │   ├── middleware/
│   │   │   └── authMiddleware.js
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── expenseRoutes.js
│   │   │   ├── incomeRoutes.js
│   │   │   ├── dashboardRoutes.js
│   │   │   ├── categoryRoutes.js
│   │   │   └── accountRoutes.js
│   │   │
│   │   ├── utils/
│   │   │   └── prisma.js
│   │   │
│   │   └── server.js
│   │
│   ├── .env
│   └── package.json
│
└── README.md
```

---

## 🗄️ Database Schema

FinTrackBuddy uses **PostgreSQL** with Prisma ORM.

### Main Tables

```text
User
 │
 ├── Category
 │
 ├── Account
 │
 ├── Expense
 │
 └── Income
```

### User

Stores user account information:

- id
- name
- email
- password
- createdAt
- updatedAt

### Category

Stores income and expense categories:

- id
- name
- icon
- color
- type
- isDefault
- userId

### Account

Stores financial accounts:

- id
- name
- type
- balance
- icon
- color
- isDefault
- userId

Supported account types:

```text
Bank
Wallet
Cash
Credit Card
```

### Expense

Stores expense records:

- id
- title
- amount
- category
- date
- description
- icon
- status
- userId
- accountId

### Income

Stores income records:

- id
- source
- amount
- category
- date
- icon
- status
- userId
- accountId

User-related records are isolated, ensuring that one user cannot access another user's financial data.

---

## 🔌 REST API Endpoints

### Authentication

| Method | Endpoint             | Description      |
| ------ | -------------------- | ---------------- |
| POST   | `/api/auth/register` | Register user    |
| POST   | `/api/auth/login`    | Login user       |
| GET    | `/api/auth/me`       | Get current user |

### Expenses

| Method | Endpoint            | Description    |
| ------ | ------------------- | -------------- |
| GET    | `/api/expenses`     | Get expenses   |
| POST   | `/api/expenses`     | Create expense |
| PUT    | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |

### Income

| Method | Endpoint           | Description   |
| ------ | ------------------ | ------------- |
| GET    | `/api/incomes`     | Get income    |
| POST   | `/api/incomes`     | Create income |
| PUT    | `/api/incomes/:id` | Update income |
| DELETE | `/api/incomes/:id` | Delete income |

### Categories

| Method | Endpoint              | Description     |
| ------ | --------------------- | --------------- |
| GET    | `/api/categories`     | Get categories  |
| POST   | `/api/categories`     | Create category |
| PUT    | `/api/categories/:id` | Update category |
| DELETE | `/api/categories/:id` | Delete category |

### Accounts

| Method | Endpoint            | Description    |
| ------ | ------------------- | -------------- |
| GET    | `/api/accounts`     | Get accounts   |
| POST   | `/api/accounts`     | Create account |
| PUT    | `/api/accounts/:id` | Update account |
| DELETE | `/api/accounts/:id` | Delete account |

### Dashboard

| Method | Endpoint                       | Description            |
| ------ | ------------------------------ | ---------------------- |
| GET    | `/api/dashboard/summary`       | Get financial summary  |
| GET    | `/api/dashboard/expense-stats` | Get expense statistics |

Protected endpoints require:

```http
Authorization: Bearer <JWT_TOKEN>
```

---

# 🚀 Getting Started

## 📋 Prerequisites

Make sure the following are installed:

- Node.js v18 or higher
- PostgreSQL v14 or higher
- npm

---

## 1️⃣ Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd FinTrackBuddy
```

---

## 2️⃣ Create PostgreSQL Database

Login to PostgreSQL:

```bash
psql -U postgres
```

Create the database:

```sql
CREATE DATABASE fintrackbuddy;
```

Exit PostgreSQL:

```sql
\q
```

---

## 3️⃣ Setup Backend

Navigate to the backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

---

## 4️⃣ Configure Environment Variables

Create a `.env` file inside the `backend` folder:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/fintrackbuddy"

JWT_SECRET="your-super-secret-jwt-key"

PORT=5000
```

Replace:

```text
YOUR_PASSWORD
```

with your PostgreSQL password.

---

## 5️⃣ Setup Prisma

Run database migration:

```bash
npx prisma migrate dev --name init
```

Generate Prisma Client:

```bash
npx prisma generate
```

---

## 6️⃣ Start Backend

```bash
npm run dev
```

Backend will run at:

```text
http://localhost:5000
```

---

## 7️⃣ Setup Frontend

Open another terminal and navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Frontend will run at:

```text
http://localhost:5173
```

Open the URL in your browser.

---

# 🔄 Application Data Flow

```text
                    ┌──────────────────┐
                    │      User        │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ React Frontend   │
                    │     Vite         │
                    └────────┬─────────┘
                             │
                         Axios API
                             │
                             ▼
                    ┌──────────────────┐
                    │ Express.js API   │
                    └────────┬─────────┘
                             │
                       JWT Middleware
                             │
                             ▼
                    ┌──────────────────┐
                    │   Controllers    │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  Prisma ORM      │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │   PostgreSQL     │
                    │    Database      │
                    └──────────────────┘
```

---

# 🎯 How to Use

### Step 1 — Create Account

Open the application and create an account using:

- Name
- Email
- Password

### Step 2 — Login

Login using your registered credentials.

### Step 3 — Dashboard

After login, the dashboard displays:

- Total income
- Total expenses
- Current balance
- Expense statistics
- Charts

### Step 4 — Manage Expenses

Navigate to **Expenses** to:

- Add expenses
- Edit expenses
- Delete expenses
- Assign categories
- Select accounts

### Step 5 — Manage Income

Use the **Income** section to add and manage income records.

### Step 6 — Transactions

Use the Transactions page to:

- Search
- Filter
- Sort
- Paginate
- View transaction history

### Step 7 — Categories

Create custom categories with:

- Name
- Icon
- Color
- Type

### Step 8 — Accounts

Add multiple:

- Bank accounts
- Wallets
- Cash accounts
- Credit cards

### Step 9 — Analytics

View spending trends and financial insights.

### Step 10 — Settings

Customize:

- Theme
- Currency
- Notifications
- CSV export

---

# 🎨 Design & UI/UX

FinTrackBuddy follows a modern SaaS-style interface.

### Design Features

- Glassmorphism effects
- Gradient cards
- Smooth animations
- Responsive layouts
- Dark theme
- Light theme
- Modern typography
- Interactive charts
- Skeleton loading states
- Empty states
- Error modals

### UI Libraries

```text
Tailwind CSS
Framer Motion
Lucide React
Recharts
```

The application uses reusable components such as:

```text
Button
Card
Input
Modal
Skeleton
Charts
```

This helps maintain consistent spacing, styling, and UI behavior throughout the application.

---

# 🔐 Security

FinTrackBuddy implements several security mechanisms.

### JWT Authentication

JWT tokens are used for authentication and remain valid for the configured token duration.

### Password Hashing

Passwords are hashed using:

```text
bcryptjs
```

Passwords are never stored as plain text.

### Protected Routes

Authenticated routes are protected using:

```text
authMiddleware
```

The middleware verifies the JWT token before allowing access to protected resources.

### User Data Isolation

Each user's data is associated with their user ID, preventing users from accessing another user's financial records.

### Environment Variables

Sensitive configuration such as:

```text
DATABASE_URL
JWT_SECRET
```

is stored in `.env` rather than committed to Git.

> ⚠️ Never commit your `.env` file to GitHub.

Add this to `.gitignore`:

```gitignore
.env
node_modules/
```

---

# 🧪 Testing Checklist

Before considering the application ready, test the following:

- [ ] User signup
- [ ] User login
- [ ] Invalid login credentials
- [ ] Dashboard totals
- [ ] Add expense
- [ ] Edit expense
- [ ] Delete expense
- [ ] Add income
- [ ] Edit income
- [ ] Delete income
- [ ] Transaction search
- [ ] Transaction filtering
- [ ] Transaction sorting
- [ ] Pagination
- [ ] CSV export
- [ ] Create custom category
- [ ] Update category
- [ ] Delete category
- [ ] Add bank account
- [ ] Update account
- [ ] Delete account
- [ ] Dark/Light theme
- [ ] Currency change
- [ ] Charts update
- [ ] Page refresh data persistence
- [ ] Logout
- [ ] Protected routes

---

# 🚨 Troubleshooting

### Connection Refused

Make sure the backend server is running:

```bash
npm run dev
```

---

### Invalid Credentials

Check:

- Email
- Password
- User exists in the database

You can also inspect the database using Prisma Studio:

```bash
npx prisma studio
```

---

### CORS Error

Check the CORS configuration in:

```text
backend/src/server.js
```

Make sure the frontend origin is correctly configured.

---

### Prisma Database Connection Error

If you see:

```text
P1001: Can't reach database
```

check that:

1. PostgreSQL is running.
2. Database exists.
3. `DATABASE_URL` is correct.
4. PostgreSQL username/password are correct.

---

### Prisma Client Error

Run:

```bash
npx prisma generate
```

---

### Migration Issues

If you need to reset the database during development:

```bash
npx prisma migrate reset
```

> ⚠️ This command deletes the existing database data. Use it carefully.
                 YOUR PROJECT
                     │
             ┌───────┴───────┐
             ▼               ▼
        frontend/         backend/
             │               │
             ▼               ▼
        Dockerfile        Dockerfile
             │               │
             ▼               ▼
      Docker Image       Docker Image
             │               │
             └───────┬───────┘
                     │
                  docker tag
                     │
                     ▼
                Docker Hub
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
     frontend image        backend image
          │                     │
          └──────────┬──────────┘
                     │
              docker compose
                     │
                     ▼
              Another Computer
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
    Frontend      Backend      PostgreSQL
    Container     Container     Container