# Frontend

This directory contains the Next.js frontend application for the Lost & Found System.

## Table of Contents
- [Features](#features)
- [Setup](#setup)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Installation](#installation)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)

## Features
- User Authentication (Sign-in, Sign-up, Protected Routes)
- Lost and Found Report Submission
- Displaying Lost and Found Reports
- Real-time Dashboard Updates (via WebSockets)

## Setup

### Prerequisites
- Node.js (v18 or higher)
- npm (Node package manager)
- A running backend API (see [Backend README](../backend/README.md) for setup instructions).

### Environment Variables

Create a `.env.local` file in the `frontend/` directory with the following variable:

```
NEXT_PUBLIC_BACKEND_API_URL="http://localhost:8000" # Or your deployed backend API URL
```

### Installation

1.  **Navigate to the `frontend` directory:**
    ```bash
    cd frontend
    ```

2.  **Install Node.js dependencies:**
    ```bash
    npm install
    ```

## Running the Application

To run the Next.js development server, navigate to the `frontend` directory and execute:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Project Structure

-   `app/`: Contains Next.js pages and API routes.
-   `components/`: Reusable React components.
-   `lib/`: Utility functions and authentication context.
-   `public/`: Static assets.
-   `styles/`: Global styles.
