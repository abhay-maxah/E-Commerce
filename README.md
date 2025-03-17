# MERN Stack Project

## Project Overview
This is a **MERN Stack** (MongoDB, Express.js, React, Node.js) project that provides a full-stack e-commerce(Cookies Man) application. You can check the live version here: [Cookies Man](https://e-commerce-e9wg.onrender.com/).

## Tech Stack
- **Frontend:** React, Zustand (State Management), TailwindCSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JWT
- **State Management:** Zustand
- **API Structure:** RESTful
- **Payment Gateway:** Stripe
- **Caching:** Redis (for featured products)

## Folder Structure
```
backend/
│── Middleware/
│── controllers/
│── lib/
│── models/
│── routes/
│── server.js
│
frontend/
│── public/
│── src/
│   ├── assets/
│   ├── components/
│   ├── lib/
│   ├── pages/
│   ├── stores/
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   ├── main.js
```

## Installation & Setup

### 1. Clone the Repository
```sh
git clone https://github.com/abhay-maxah/E-Commerce.git
cd E-Commerce
```

### 2. Install Dependencies
#### Backend
```sh
npm install
```
#### Frontend
```sh
cd frontend
npm install
```

### 3. Environment Variables
Create a `.env` file in both **backend** and **frontend** directories and configure necessary variables. Example for backend:
```
PORT=5000
MONGO_URI=your_mongo_uri

UPSTASH_REDIS_URL=your_redis_url

ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

STRIPE_SECRET_KEY=your_stripe_secret_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 4. Run the Project
#### Backend
```sh
nodemon start
```
#### Frontend
```sh
cd frontend
npm run dev
```

## API Documentation
- **Base URL:** `http://localhost:5000/api`

## Project Built By
Abhay Parmar

