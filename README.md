# Peter Art - Artwork E-commerce Website

A modern, mobile-first artwork e-commerce platform with admin panel, user authentication, and comprehensive features.

## Features

### Authentication
- Email/Password login
- Google OAuth login
- Proper error handling and user feedback
- Session persistence

### Admin Panel
- Dashboard with statistics
- Add/Edit/Delete artworks
- Upload multiple images (2-3) per artwork
- View all orders with status management
- View all registered users
- Order status tracking (Pending, Delivered, Left)

### User Features
- Browse all artworks
- Search functionality
- Wishlist artworks
- Place orders (Cash on Delivery or Online Payment)
- View order history
- Like, comment, and share artworks
- Responsive mobile-first design

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Firebase Configuration**
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication (Email/Password and Google)
   - Create a Firestore database
   - Enable Storage for image uploads
   - Copy your Firebase config and add it to `.env.local`:
     ```
     NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
     NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
     ```

3. **Firestore Security Rules**
   Set up your Firestore security rules:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read: if request.auth != null;
         allow write: if request.auth != null;
       }
     }
   }
   ```

4. **Storage Rules**
   Set up your Storage security rules:
   ```
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /artworks/{allPaths=**} {
         allow read: if request.auth != null;
         allow write: if request.auth != null;
       }
     }
   }
   ```

5. **Admin Email**
   - Update the admin email in `lib/auth.js` (line 7) to your desired admin email
   - Or create a user with email `admin@peterart.com` in Firebase Authentication

6. **Logo Image**
   - Place your logo image at `public/logoo.png`

7. **Run the Development Server**
   ```bash
   npm run dev
   ```

8. **Open Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Admin Access

- Default admin email: `admin@peterart.com`
- You can change this in `lib/auth.js`
- To create an admin user:
  1. Create a user in Firebase Authentication with the admin email
  2. The system will automatically detect admin status based on the email

## User Registration

- **Google OAuth**: Users can sign in with Google, and accounts are created automatically
- **Email/Password**: Users must be created in Firebase Authentication Console first
  - Go to Firebase Console > Authentication > Users
  - Click "Add user" and create an account
  - Users can then sign in with their email and password

## Tech Stack

- **Next.js 14** - React framework
- **Firebase** - Authentication, Database, Storage
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety
- **React Icons** - Icons
- **React Hot Toast** - Notifications

## Project Structure

```
├── app/
│   ├── admin/          # Admin panel pages
│   ├── user/           # User pages
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home/login page
│   └── globals.css     # Global styles
├── components/
│   ├── AdminDashboard.tsx
│   ├── LoginPage.tsx
│   ├── LogoutButton.tsx
│   └── UserDashboard.tsx
├── lib/
│   ├── auth.js         # Authentication functions
│   ├── artworks.js     # Artwork CRUD operations
│   ├── orders.js       # Order management
│   ├── wishlist.js     # Wishlist functionality
│   ├── comments.js     # Comments and likes
│   └── users.js        # User management
└── firebase.config.js  # Firebase configuration
```

## Mobile-First Design

The website is designed with a mobile-first approach, ensuring optimal experience on mobile devices while maintaining functionality on desktop.

## Color Scheme

The website uses a neon bright theme with:
- Neon Pink (#ff00ff)
- Neon Purple (#9d00ff)
- Neon Orange (#ff6b00)
- Dark backgrounds (#0a0a0a, #1a1a1a)

## License

MIT

