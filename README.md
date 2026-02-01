# Nam Tindivanam - Rural Groceries Platform

A multi-vendor grocery delivery platform built for rural areas of Tindivanam, Tamil Nadu.

## Overview

Nam Tindivanam consists of **2 separate web applications**:

1. **Customer App** - For customers to browse, search, and order groceries
2. **Shop Owner App** - For shop owners to manage their shops, products, and orders (includes Admin features)

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **State Management**: Zustand
- **Icons**: Lucide React

## Project Structure

```
Namthindivanam/
├── customer-app/           # Customer-facing app
│   ├── app/               # Next.js app router pages
│   ├── components/        # React components
│   ├── hooks/             # Custom hooks (useAuth, useCart)
│   ├── lib/               # Firebase config & Firestore helpers
│   ├── types/             # TypeScript types
│   └── public/            # Static assets (logo)
│
├── shop-owner-app/         # Shop owner & admin app
│   ├── app/               # Next.js app router pages
│   │   └── admin/         # Admin-only routes
│   ├── components/        # React components
│   ├── hooks/             # Custom hooks (useAuth, useOrders, useIsAdmin)
│   ├── lib/               # Firebase config & Firestore helpers
│   ├── types/             # TypeScript types
│   └── public/            # Static assets (logo, notification sound)
│
└── README.md
```

## Features

### Customer App
- User registration/login with phone number
- Search products across all shops
- Browse by category (Vegetables, Groceries, Dairy, Snacks)
- View shops selling specific products
- Add to cart with single-shop restriction
- Checkout with COD payment
- Order tracking and history
- Profile management

### Shop Owner App
- Shop registration (pending admin approval)
- Dashboard with real-time stats
- **Real-time order notifications with sound alerts**
- Order management (Accept, Pack, Deliver, Reject)
- Product management (Add, Edit, Delete, Stock toggle)
- Image upload for products
- Analytics and revenue tracking
- Shop settings (hours, delivery charge, radius)

### Admin Features (Inside Shop Owner App)
- Platform-wide dashboard
- Approve/Reject/Suspend shops
- Set commission rates per shop
- View all customers
- View all platform orders
- Platform analytics

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase project with Firestore, Auth, and Storage enabled

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/gramamservices-santhosh/Thindivanam-Rural.git
cd Thindivanam-Rural
```

2. **Install Customer App dependencies**
```bash
cd customer-app
npm install
```

3. **Install Shop Owner App dependencies**
```bash
cd ../shop-owner-app
npm install
```

### Environment Variables

Both apps use the same Firebase config. Create `.env.local` in each app folder:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### Running Locally

**Customer App:**
```bash
cd customer-app
npm run dev
# Opens at http://localhost:3000
```

**Shop Owner App:**
```bash
cd shop-owner-app
npm run dev
# Opens at http://localhost:3001
```

## Firebase Setup

### Firestore Collections

- `users` - Customer accounts
- `shops` - Shop profiles (includes isAdmin flag)
- `products` - Shop inventory
- `orders` - Order records
- `reviews` - Customer reviews

### Setting Up Admin

To make a shop owner an admin:

1. Register as a shop owner
2. Go to Firebase Console → Firestore
3. Find the shop document in `shops` collection
4. Set `isAdmin: true` and `status: "active"`

### Firestore Security Rules

Add these rules to your Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    match /shops/{shopId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == shopId ||
        get(/databases/$(database)/documents/shops/$(request.auth.uid)).data.isAdmin == true;
    }

    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    match /orders/{orderId} {
      allow read, write: if request.auth != null;
    }

    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth != null;
    }
  }
}
```

## Deployment

### Deploy to Vercel

**Customer App:**
```bash
cd customer-app
vercel --prod
# Result: namtindivanam.vercel.app
```

**Shop Owner App:**
```bash
cd shop-owner-app
vercel --prod
# Result: namtindivanam-shop.vercel.app
```

## Brand Colors

- **Brand Gradient**: Green (#10b981) to Orange (#f97316)
- **Customer App**: Purple (#667eea) to Indigo (#764ba2)
- **Shop Owner App**: Green (#27ae60) to Dark Green (#229954)

## Key Features Explained

### Single-Shop Cart
Customers can only order from one shop at a time. If they try to add items from a different shop, they're prompted to clear their cart first.

### Real-time Order Notifications
Shop owners receive instant notifications with sound when new orders arrive. The dashboard shows a pulsing alert with order details.

### Admin Approval Flow
New shop registrations are set to "pending" status. The admin must approve them before they become active and visible to customers.

### Commission Tracking
Each order calculates commission based on the shop's commission rate. Admin can track total and pending commission amounts.

## Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ for Tindivanam by Nam Tindivanam Team
