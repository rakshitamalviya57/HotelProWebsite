# 🏨 HotelPro: Hotel Management System

HotelPro is a full-stack hotel management web application for room browsing, bookings, guest management and admin operations. It uses a secure JWT-authenticated REST API and a responsive React interface.


## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router, MDB React UI Kit |
| Backend | Node.js, Express |
| Database | MongoDB with Mongoose |
| Auth | JSON Web Tokens, bcryptjs |


## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) (LTS)
- A MongoDB database: local [MongoDB Community Server](https://www.mongodb.com/try/download/community) or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster

### 1. Clone the repository
```bash
git clone https://github.com/rakshitamalviya57/HotelProWebsite.git
cd HotelProWebsite
```

### 2. Set up the backend
```bash
cd server
npm install
```

Create a `.env` file in the `server` folder by copying `.env.example`, then fill in your own values:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=a_long_random_secret_string
PORT=5000
```

Start the API:
```bash
npm run dev
```
You should see `HotelPro API running`.

### 3. Set up the frontend
Open a second terminal:
```bash
cd client
npm install
npm run dev
```
Open the URL shown in the terminal (usually http://localhost:5173).

If your API runs on a different address, create `client/.env`:
```env
VITE_API=http://localhost:5000
```
