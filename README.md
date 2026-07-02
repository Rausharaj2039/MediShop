# MediShop - Medical Shop Management System

A premium, responsive pharmacy-themed SaaS dashboard for medical shops, featuring multi-tenant data isolation, optical character recognition (OCR) invoice scanning, smart auto-suggest, and expiry tracking metrics. Built using React.js, Express.js, Tailwind CSS, and SQLite.

---

## 🚀 Key Features

1. **Multi-Tenant SQLite Data Separation**
   - Centralized authentication records (emails, hashed passwords, credentials) are stored globally inside `backend/data/medishop.db`.
   - Each registered user receives an isolated SQLite database file (`backend/data/medishop_user_<id>.db`). Product catalogs, inventories, stock counts, and transactions are completely isolated from other users.
   
2. **Clinical White-Blue-Green UI Layout**
   - Clean sticky Top Navbar featuring a mobile drawer menu toggler, smart query search bar, and profile logout handles.
   - Clean responsive grids, custom delete confirmation modal dialog overlays, and slide-in toast portal warnings.

3. **Validated Medicine Catalog CRUD**
   - Complete inventory management allowing admins and users to Add, View, Edit, and Delete medicines.
   - Restocked medicines automatically uppercase their names and are retrieved from databases in NOCASE alphabetical order.
   - Optional parameters (Company Name, Batch Number, Purchase Price, and Expirations) default to SQL `NULL` and can be edited or cleared successfully.

4. **Smart Medicine Autocomplete Search**
   - Real-time suggestions panel embedded in the top navbar query field. Tapping a suggestion opens the product details popup card directly, highlighting matching search text.

5. **OCR Bill Scanner (Tesseract.js Integration)**
   - Upload invoice images or load sample invoice templates. The Tesseract engine analyzes text layouts, extracts lines, and parses details (Name, Qty, Batch, Prices, Expiry Dates) into an editable grid. Confirming imports synchronizes parsed items directly into the user's SQLite database.

6. **Expiry Timelines Management**
   - Color-coded indicators grouping stock into Safe (🟢 > 90d), Warning (🟡 60-90d), Critical (🟠 30-59d), and Expired/Urgent (🔴 < 30d or already expired) categories with custom badges.

7. **Admin Access & Password Console (Admin Only)**
   - Logging in with `admin@medishop.local` grants access to the **User Accounts Directory** tab.
   - The admin can view all registered accounts, reveal database password hashes (eye reveal buttons), update user passwords, or delete accounts (which safely unlinks and unbinds their isolated SQLite files).

---

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, Tailwind CSS, React Router DOM, Tesseract.js
- **Backend**: Node.js, Express.js, Node.js SQLite (`node:sqlite` DatabaseSync module), BCrypt.js, JWT (jsonwebtoken)

---

## 📦 Getting Started & Local Installation

Follow these steps to set up and run the project locally.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm (Node Package Manager)

### Step 1: Install Dependencies
Run the install command inside both directories:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Configure Environment Variables
Inside `backend/config/config.env`, set up your port and keys (already configured for default local runs):
```env
PORT=5001
JWT_SECRET=replace_with_a_secure_secret
ADMIN_EMAIL=admin@medishop.local
ADMIN_PASSWORD=Admin@123
```

### Step 3: Start Development Servers
Run the dev servers concurrently:

```bash
# Start backend API (from backend/ directory)
cd backend
npm run dev

# Start frontend Vite server (from frontend/ directory in another shell window)
cd frontend
npm run dev
```

- **API Endpoint Health**: [http://localhost:5001/api/health](http://localhost:5001/api/health)
- **Frontend Dashboard App**: [http://localhost:5173/](http://localhost:5173/)

### Step 4: Login Credentials
- **Admin Login**:
  - Email: `admin@medishop.local`
  - Password: `Admin@123`
- **Standard User Registration**:
  - Click "Create an account" on the login page to register. Any registered account other than the admin email receives standard user authorization constraints and is allocated an empty isolated database to build their own pharmacy catalogue.

---

## 📂 Project Directory Structure

```
├── backend/
│   ├── config/          # Environment configuration (config.env)
│   ├── data/            # SQLite medishop.db and isolated user database files (.db)
│   ├── middleware/      # JWT protection and admin guards
│   ├── models/          # User and Product DatabaseSync query models
│   ├── routes/          # Express API route endpoints
│   ├── utils/           # Database seed scripts
│   ├── server.js        # Main Express server boot
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Layout shell, private guards, autocomplete search
│   │   ├── context/     # Auth Context and slide-in Toast Context Portals
│   │   ├── pages/       # Dashboard, Products Catalog, Expiry Page, Bill Scanner, Users Directory, Login/Signup
│   │   ├── App.jsx      # React router pages registration
│   │   └── main.jsx     # App entry wrapping Toast and Auth Providers
│   └── package.json
│
└── README.md            # Installation instructions
```
