# MERN Stack Project

## Project Overview

This is a MERN Stack (MongoDB, Express.js, React, Node.js) project that provides a full-stack e-commerce (**CookiesMan**) application. You can check the live version here: **CookiesMan**.

## Tech Stack

- **Frontend**: React, Zustand (State Management), TailwindCSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT
- **State Management**: Zustand
- **API Structure**: RESTful
- **Payment Gateway**: Stripe
- **Caching**: Redis (for Best Selling products)

## Features

### Project Features
- **User Authentication**: Secure login and signup using JWT.
- **Responsive Design**: Fully responsive UI for all devices.
- **Dynamic Search**: Users can search for products dynamically.
- **Category-Based Filtering**: Products are categorized for easy browsing.
- **Coupon System**: Users can apply coupons for discounts.
- **Cart Management**: Real-time cart updates and total calculations.
- **Payment Gateway Integration**: Secure online payments for orders.
- **Download PDF Invoice**: Users can download a PDF bill after purchase.

### 1. Landing Page
- Displays two main product categories: **Cookies** and **Chocolates**.
- Users can explore and select a category to view related products.

### 2. Product Listing Page
- Shows a list of products based on the selected category.
- Each product card includes **name, image, price, and an "Add to Cart" button**.

### 3. Cart Management
- Users can add products to their cart by clicking the **"Add to Cart" button**.
- The cart updates dynamically, showing the total number of items.
- Users can access the cart by clicking the cart icon in the navbar.

### 4. Cart Page
- Displays all added cart items along with their quantities and prices.
- Shows a **summary section** on the right with the total amount of all items.
- Includes an **"Apply Coupon"** section for discounts.
- If a valid coupon is applied, the total amount updates accordingly.

### 5. Checkout Process
- Users can proceed to checkout after reviewing their cart.
- Secure payment via **Stripe**.
- Users can download an invoice as a **PDF** after purchase.

## Folder Structure

### Backend
```
backend/
│── Middleware/
│── controllers/
│── lib/
│── models/
│── routes/
│── server.js
```

### Frontend
```
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
Create a `.env` file in both backend and frontend directories and configure necessary variables. Example for backend:

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

**Base URL:** `http://localhost:5000/api`

| Method | Endpoint     | Description           |
| ------ | ------------ | --------------------- |
| GET    | /products    | Fetch all products    |
| POST   | /addItem     | Add product to cart   |
| GET    | /cart        | Get all cart items    |


## Future Enhancements
- **User Profile & Order History**
- **Advanced Filters & Sorting**
- **Wishlist Feature**

### 👨‍💻 Developed by **Abhay Parmar**



