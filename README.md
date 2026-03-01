# Notes Creator UI

Frontend application for the Notes Creator project. Built with Next.js, React, and Tailwind CSS.

## Features

- **Intuitive Interface**: Easy-to-use playground for pasting URLs and generating notes.
- **Support for YouTube & Blogs**: Specialized handling for different content types.
- **Firebase Authentication**: Secure user login and registration.
- **Lottie Animations**: Premium, interactive UI elements.
- **Real-time Status Updates**: Track the progress of your note generation jobs.

## Tech Stack

- **Framework**: Next.js
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **AI Integration**: Client-side Gemini SDK (optional/configured)
- **Animations**: Lottie-React

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

1. **Clone the repository** (if not already done).
2. **Install dependencies**:
   ```bash
   npm install
   ```

### Configuration

1. Create a `.env.local` file in the root directory:
   ```bash
   touch .env.local
   ```
2. Copy the contents of `.env.example` and fill in your values:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   GEMINI_API_KEY=your_gemini_api_key
   ```

### Running the App

Run the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `src/app`: Page components and routing.
- `src/components`: Reusable UI components.
- `src/services`: API and Firebase service logic.
- `public/`: Static assets and Lottie animations.
