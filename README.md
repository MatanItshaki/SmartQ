# SmartQ – Intelligent Queue Management System

SmartQ is a fullstack application designed to help businesses manage their appointments efficiently.  
The platform allows business owners to manage services, employees, schedules, and appointments,  
while customers can book, edit, and cancel appointments quickly and easily.

This project is part of a fullstack final assignment and built using Node.js, Express, MongoDB, and React.

---

## Features

### For Business Owners
- Manage services (name, duration, price, category)
- Register employees and assign them to services
- View scheduled appointments
- Prevent double-booking automatically
- Manage business details

### For Clients
- Register/login
- Browse businesses
- Select services
- Book, edit, or cancel appointments

---

## Technologies Used

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- CORS
- dotenv
- Nodemon (development)

### Frontend (planned)
- React
- Axios
- Component-based UI architecture

---

## Project Structure

/backend
├── src
│ ├── models # Mongoose schemas (Business, Client, Service, Employee...)
│ ├── controllers # Business logic for each route
│ ├── routes # API endpoints
│ ├── middleware # Error handling and middlewares
│ ├── config # Database connection
├── app.js # Express setup and middleware registration
├── server.js # Server entry point (starts the API)
└── package.json

/frontend (planned)

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/<user>/<repo>.git
cd SmartQ

### 2. Backend Setup
cd backend
npm install

### 3. Environment variables
NODE_ENV=development
PORT=5000
MONGO_URI=your-mongodb-connection-string
### 4. Start the server

    ## Development mode (auto reload):
    npm run dev
    ##Production mode:
    npm start

    ## API Root Health Check
http://localhost:5000/

SmartQ API is running!

