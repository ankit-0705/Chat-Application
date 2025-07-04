# 💬 MERN Chat Application

A full-stack **real-time chat app** built with the **MERN stack** and **Socket.IO**. Users can **register**, **log in**, and **chat instantly** in real time. Styled beautifully with **TailwindCSS** and **DaisyUI**, this application offers smooth user experience, secure communication, and modern design.


## 🛠️ Tech Stack

### 🔹 Frontend
- ⚛️ **React (Vite)**
- 💨 **TailwindCSS**
- 🎨 **DaisyUI**
- 🔗 **Axios**
- 🌐 **Socket.IO Client**
- 🧭 **React Router DOM**
- 🌍 **Context API** for global auth state

### 🔸 Backend
- 🟢 **Node.js**
- 🚀 **Express.js**
- 🧩 **MongoDB** (via Mongoose)
- 🔐 **JWT Authentication**
- 🧂 **Bcrypt** for password hashing
- 📦 **dotenv** for environment config
- 🔌 **Socket.IO Server**

---

## ✨ Features

- ✅ **User Registration & Login**
- 🔐 **JWT-based Authentication**
- 💬 **Real-time Chat via WebSockets (Socket.IO)**
- 📜 **Persistent Conversations** stored in MongoDB
- 📱 **Responsive UI** using TailwindCSS + DaisyUI
- 🚫 **Protected Routes** with auth middleware
- 🧼 Clean & modular folder structure

---

## 📁 Folder Structure

chat-app/
│
├── backend/
│ ├── controllers/
│ ├── models/
│ ├── routes/
│ ├── middleware/
│ ├── socket/
│ └── server.js
│
├── frontend/
│ ├── public/
│ ├── src/
│ │ ├── components/
│ │ ├── context/
│ │ ├── pages/
│ │ ├── routes/
│ │ ├── App.jsx
│ │ └── main.jsx
│
├── .env
├── package.json
└── README.md

🧠 Learning Concepts
Real-time data communication with WebSockets

State sharing across components using Context API

Secure REST APIs with JWT

Responsive UI using TailwindCSS

🤝 Contribution
Pull requests are welcome! For major changes, please open an issue first to discuss.

