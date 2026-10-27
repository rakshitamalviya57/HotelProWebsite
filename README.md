# HotelPro (MERN)
## Run
1. Start MongoDB locally (or use Atlas).
2. Backend: `cd server && cp .env.example .env && npm install && npm run dev`  (http://localhost:5000)
3. Frontend: `cd client && npm install && npm run dev`  (http://localhost:5173)
Set `VITE_API` in client/.env if the API is not on localhost:5000.

## API
POST /SignUp, /Login · GET /rooms · POST /rooms (admin) · POST /book · GET /mybookings · POST /cancelbooking · GET /allbookings (admin) · GET /users (admin)
