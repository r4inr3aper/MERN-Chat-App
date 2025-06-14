# 💬 MERN Chat App

A **real-time chat application** built with the **MERN stack (MongoDB, Express.js, React.js, Node.js)**.  
Includes user authentication, real-time messaging using **Socket.IO**, and a clean, responsive UI.

---

## 🚀 Features

- 🔐 User registration & login (JWT-based)
- 📧 Real-time messaging with Socket.IO
- 🧑‍🤝‍🧑 One-on-one & group chats
- 📱 Fully responsive frontend using React
- 💬 Typing indicators & online user tracking
- 🔒 Protected routes and session handling
- 📁 MongoDB for chat and user data storage

---

## 🧰 Tech Stack

### 🖥️ Frontend
- React.js
- Axios
- React Router
- Socket.IO Client

### 🌐 Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Socket.IO

---

## 📸 Preview

[Chat UI Preview](./preview.png)

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/r4inr3aper/MERN-Chat-App.git
cd MERN-Chat-App
```
2. Set Up Backend
```bash
cd backend
npm install
```
Create a .env file in the backend/ directory with the following variables:
env
```bash
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```
Then run the backend server:

```bash
npm run dev
```

### 3. Set Up Frontend
```bash
cd ../frontend
npm install
npm start
```
The app will now be running at http://localhost:3000

🧪 Example Credentials
You can register a new user or use dummy credentials:

```bash
Email: testuser@example.com
Password: 123456
```

### 📦 Folder Structure

MERN-Chat-App/
├── backend/        # Node + Express + MongoDB
│   └── controllers/
│   └── models/
│   └── routes/
│   └── config/
├── frontend/       # React frontend
│   └── components/
│   └── pages/
│   └── context/
└── README.md

## 📝 License

This project is open source and available under the [MIT License](LICENSE).
