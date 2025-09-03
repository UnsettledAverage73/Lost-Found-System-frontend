# 🌐 Lost & Found System - Frontend

Welcome to the user-facing part of the Lost & Found System! This Next.js application provides a modern and responsive interface for reporting and finding lost items or people.

## ✨ Features

-   **🔐 User Authentication:** Seamless sign-in and sign-up flows with protected routes.
-   **📝 Report Submission:** Easy-to-use forms for submitting both lost and found reports.
-   **📊 Dynamic Report Display:** View all lost and found reports with filtering capabilities.
-   **⚡ Real-time Dashboard:** Instant updates on new reports and matches via WebSockets.

## 🛠️ Setup

### Prerequisites

Ensure you have the following installed on your system:

-   **Node.js (v18 or higher)**
-   **npm** (Node package manager, usually comes with Node.js)
-   **A Running Backend API:** This frontend relies on the backend API. Please refer to the [Backend README](../backend/README.md) for detailed setup and running instructions.

### Environment Variables

Create a `.env.local` file in the `frontend/` directory with the following variable. This tells your frontend where to find the backend API.

```dotenv
NEXT_PUBLIC_BACKEND_API_URL="http://localhost:8000" # Or the URL of your deployed backend API
```

### Installation

Follow these steps to get the frontend up and running:

1.  **Navigate to the `frontend` directory:**
    ```bash
    cd frontend
    ```

2.  **Install the Node.js dependencies:**
    ```bash
    npm install
    ```

## 🚀 Running the Application

To start the Next.js development server, navigate to the `frontend` directory and execute:

```bash
npm run dev
```

The frontend application will open in your browser at `http://localhost:3000`.

## 📁 Project Structure

-   `app/`: Contains the main Next.js pages, layouts, and server actions.
-   `components/`: Reusable UI components used throughout the application.
-   `lib/`: Utility functions, authentication context, and helper modules.
-   `public/`: Static assets such as images and fonts.
-   `styles/`: Global CSS styles and Tailwind CSS configurations.
