# 🏨 Anuthama Villa - Premium Hotel Management System

![Anuthama Villa](frontend/src/assets/anuthavilla.jpg)

Anuthama Villa is a state-of-the-art, full-stack Hotel Management System designed to provide a seamless experience for guests, staff, and administrators. Built with a modern tech stack, it streamlines operations from room bookings to food ordering and internal task management.

---

## 🚀 Key Features

### 👤 Guest Experience
- **Secure Authentication**: Firebase-powered Login, Signup, and Password Recovery with OTP verification.
- **Room Booking**: Interactive interface to browse and book luxury rooms with real-time availability.
- **Fine Dining**: Full-featured food ordering system with a digital menu, cart, and order tracking.
- **Event Reservations**: Easy booking for halls and event spaces.
- **Personalized Profile**: Manage profile details, view booking history, and provide feedback.
- **AI Concierge**: Integrated chatbot for instant assistance and queries.

### 🛠️ Administrative & Staff Power
- **Intuitive Dashboards**: Dedicated views for Admins and Staff to monitor operations.
- **Inventory Management**: Real-time tracking of hotel supplies and stock.
- **Task Management**: Assign and track cleaning, maintenance, and service tasks.
- **Order Processing**: Manage incoming food and service orders efficiently.
- **User Management**: Control over user roles (Admin, Staff, Guest) and permissions.
- **Reviews & Feedback**: Monitor and respond to guest reviews and feedback.

---

## 🛠️ Technology Stack

### **Frontend**
- **React (Vite)**: High-performance UI framework.
- **Tailwind CSS**: Modern styling with utility-first classes.
- **Framer Motion**: Smooth animations and premium micro-interactions.
- **Firebase Auth**: Secure client-side authentication.
- **Lucide & React Icons**: Sleek and consistent iconography.
- **Axios & Socket.io-client**: Real-time data fetching and communication.

### **Backend**
- **Node.js & Express**: Scalable and robust server-side architecture.
- **MongoDB (Mongoose)**: Efficient NoSQL database management.
- **Firebase Admin SDK**: Secure server-side verification and user management.
- **Cloudinary**: Cloud-based image and media management.
- **Socket.io**: Real-time notifications and chat functionality.
- **Multer**: Middleware for high-performance file uploads.
- **Nodemailer**: Automated email notifications and OTP delivery.

---

### **5. Password Reset Configuration**
To make the "Forgot Password" feature work:
1. Enable **Email/Password** in Firebase Authentication.
2. Under the **Templates** tab in Firebase Authentication, customize the **Password Reset** email.
3. Ensure your domain (e.g., `localhost`) is added to **Authorized Domains** in Firebase Settings.

---

## 📂 Project Structure

```bash
hotel-Management/
├── frontend/             # React application (Vite)
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── layouts/      # Navbars, Footers, Sidebars
│   │   ├── pages/        # Main application views
│   │   ├── firebaseConfig.js
│   │   └── App.jsx       # Routing and main entry
│   └── tailwind.config.js
├── backend/              # Node.js Express server
│   ├── src/
│   │   ├── models/       # MongoDB Schemas
│   │   ├── routes/       # API Endpoints
│   │   ├── config/       # DB & Firebase configurations
│   │   └── controllers/  # Business logic (if separated)
│   ├── index.js          # Server entry point
│   └── cron.js           # Scheduled tasks
└── serviceAccountKey.json # Firebase Admin credentials
```

---

## ⚙️ Setup & Installation

### **Prerequisites**
- Node.js (v18+)
- MongoDB Atlas account or local MongoDB instance
- Firebase Project (enabled Auth)
- Cloudinary Account

### **1. Clone the Repository**
```bash
git clone https://github.com/Rishi-Rishikesh/Hotel_Management_System.git
cd Hotel_Management_System
```

### **2. Backend Setup**
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` directory:
```env
PORT=4000
MONGODB_URI=your_mongodb_connection_string
FIREBASE_PROJECT_ID=your_project_id
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
FRONTEND_URL=http://localhost:5173
```
Add your `serviceAccountKey.json` to the `backend/` root.

### **3. Frontend Setup**
```bash
cd ../frontend
npm install
```
Create a `.env` file in the `frontend/` directory:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### **4. Run the Application**
**Start Backend:**
```bash
cd backend
npm start # or node index.js
```
**Start Frontend:**
```bash
cd frontend
npm run dev
```

---

## 📜 License
This project is licensed under the ISC License.

---

*Built with ❤️ for Anuthama Villa.*
