#  CookiesMan – MERN Stack E-Commerce App

## Project Overview

**CookiesMan** is a full-featured e-commerce platform built using the **MERN Stack** (MongoDB, Express.js, React, Node.js). It offers a smooth shopping experience, secure authentication, premium subscriptions, coupon discounts, real-time cart updates, and PDF invoice generation.

🔗 **Live Demo**: [cookiesman.me](https://cookiesman.me)

---

## 🛠 Tech Stack

* **Frontend**: React, Zustand, TailwindCSS
* **Backend**: Node.js, Express.js
* **Database**: MongoDB, Redis (`cookiesman-redis`)
* **Authentication**: JWT, Google OAuth
* **Bot Protection**: Google reCAPTCHA
* **State Management**: Zustand
* **API Type**: RESTful
* **Payment Gateway**: Stripe (Products & 1-Year Premium Plan)
* **Email Service**: Resend API
* **PDF Generation**: PDFKit

---

## ✨ Features

### 🧩 Core Features

* Secure user **authentication (JWT)** and **Google login**
* **Google reCAPTCHA** for bot protection
* **Responsive design** for mobile, tablet, and desktop
* **Dynamic product search**
* **Category-based filtering** (Cookies, Chocolates)
* **Real-time cart management**
* **Coupon system** for discounts
* **Secure payments via Stripe**
* **Downloadable PDF invoice** post-purchase
* **1-Year Premium Subscription** for exclusive benefits

---

## 🛒 Pages & Functionality

### 1. Landing Page

* Showcases Cookies and Chocolates categories in a visually appealing layout.

* Includes a hero banner with promotional offers and featured collections.

* Highlights Best Selling Products section using Redis cache for performance.

* Allows users to quickly navigate to product categories with call-to-action buttons.

* Displays customer testimonials and reviews for social proof.

* Contains a subscription prompt for users to join the 1-Year Premium Plan.

* Offers a search bar to begin shopping instantly.

### 2. Product Listing Page

* Displays products based on selected category.
* Each card includes image, name, price, and **"Add to Cart"**.

### 3. Cart Management

* Add/remove products dynamically.
* Real-time total calculation and quantity updates.
* **Apply Coupon** to get instant discounts.

### 4. Checkout Page

* Stripe payment integration.
* Option to **subscribe to a 1-Year Premium Plan**.
* **PDF invoice download** after successful purchase.

---

## 📁 Folder Structure

### Backend

```
backend/
│—— Middleware/
│—— controllers/
│—— lib/
│—— models/
│—— routes/
│—— server.js
```

### Frontend

```
frontend/
│—— public/
│—— src/
│   ├—— assets/
│   ├—— components/
│   ├—— lib/
│   ├—— pages/
│   ├—— stores/
│   ├—— App.css
│   ├—— App.jsx
│   ├—— index.css
│   └—— main.js
```

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/abhay-maxah/E-Commerce.git
cd E-Commerce
```

### 2. Install Dependencies

#### Backend

```bash
npm install
```

#### Frontend

```bash
cd frontend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in both the **backend** and **frontend** directories.

#### Backend `.env` Example

```
PORT=5000
MONGO_URI=your_mongo_uri
UPSTASH_REDIS_URL=your_redis_url  # Redis DB: cookiesman-redis

ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

# Cloudinary for image upload
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe payment (1-year subscription)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_YEARLY_LINK=your_stripe_checkout_url
STRIPE_PRICE_ID=your_stripe_price_id

CLIENT_URL=http://localhost:5173

# Google Auth & reCAPTCHA
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CAPTCH_SITE_KEY=your_site_key
GOOGLE_CAPTCH_SECRET=your_captcha_secret

# Email service
RESEND_API_KEY=your_resend_api_key

NODE_ENV=development
```

---

### 4. Run the Project

#### Backend

```bash
nodemon start
```

#### Frontend

```bash
cd frontend
npm run dev
```

---

## 🔌 API Endpoints

**Base URL:** `http://localhost:5000/api`

| Method | Endpoint      | Description                |
| ------ | ------------- | -------------------------- |
| GET    | /products     | Fetch all products         |
| POST   | /addItem      | Add product to cart        |
| GET    | /cart         | Get all cart items         |
| POST   | /subscribe    | Start yearly premium plan  |
| POST   | /apply-coupon | Apply a coupon to the cart |

---

## 📦 Future Enhancements

* 🗒 User Profile & Order History
* 📊 Advanced Filters & Sorting
* ❤️ Wishlist Feature
* 🔔 Email Notifications & Order Updates

---

### 👨‍💻 Developed by **Abhay Parmar**
