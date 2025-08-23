# 🚀 OnCompile: Online Code Compiler & Editor

A powerful, modern, web-based **code editor and compiler** supporting 10+ programming languages, real-time execution, and user authentication — all in one sleek monorepo.

---

## ✨ Features

### 🔧 Multi-Language Support
- Supports **JavaScript, Python, C++, Java, TypeScript, Rust, Go, C, R, Swift**
- Language-specific **default templates**
- Smart file extension detection for downloads

### 💻 Advanced Code Editor
- Integrated **Monaco Editor** 
- Syntax highlighting, auto-completion, IntelliSense
- **Light/Dark mode** support
- Customizable: font size, word wrap, line numbers, etc.

### ⚡ Real-time Code Execution
- **Judge0 API** integration for reliable, remote code execution
- Asynchronous execution with real-time polling

### 🔐 User Authentication
- Integrated with **Clerk**
- Secure login
- Session persistence and protected routes for save/edit/delete/share

### 💾 Code Management
- **Save, Load, Edit, Delete** code snippets (authenticated users)
- **Download** files with smart file extensions (authenticated users)
- **Shareable links** for public access (authenticated users)

### 🔍 Coming Soon
- **Smart Input Detection** (for `input()` in Python, `scanf()` in C, etc.)

---

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- React Router v6
- Monaco Editor
- Tailwind CSS + Shadcn/ui
- React Resizable Panels

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM (with PostgreSQL or any supported DB)
- Clerk (authentication)
- Judge0 API (code execution)

### Dev Tools
- ESLint + Prettier
- Yarn / npm
- TSC (TypeScript compiler)



## 🗂️ Monorepo Structure

```sh
online-code-compiler/
│
├── frontend/ → Vite + React + Tailwind + Monaco Editor
│
├── backend/ → Node.js + Express + Prisma + Clerk
│
├── package.json 
│
└── README.md
```

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/nitesh2920/oncompile.git
cd onCompile
```

## 2. Install dependencies
### Frontend
```bash
cd frontend
npm install
```
### backend
```bash
cd backend
npm install
```
### 3. Environment variables
### frontend/.env
```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
VITE_API_URL=http://localhost:5000 (on which your backend running)

```
### backend/ .env
```sh
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/yourdb
CLERK_SECRET_KEY=sk_test_your_key_here

```
### 4. Primsa setup
```
# Navigate to backend
cd backend

# Push schema to DB
npx prisma db push

# (Optional) generate client
npx prisma generate
```

### 5. Run local server (from root)
```bash
npm run dev
```



