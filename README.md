# Chat

 Chat is a full-stack, real-time chat application. It allows users to register, log in, join a default "Global Chat", communicate in direct messages or custom rooms, share files via AWS S3, and utilize Google Gemini AI for smart reply generation and message autocompletion.

This project demonstrates advanced websocket communication, secure authentication, external cloud storage integration, and AI-assisted UX paradigms.

## Features

- **Real-Time Websockets:** Instant messaging across multiple rooms without page reloads using Socket.IO.
- **AI Integration:** Google Gemini integration for smart replies and autocomplete.
- **Cloud Storage:** Secure file uploads backed by AWS S3.
- **Cron Jobs:** Automated database archival running daily at midnight to maintain performance.
- **Premium UI:** Glassmorphism-inspired design with a unified routing interface using Vanilla JS.

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MySQL, Sequelize ORM
- **Real-Time:** Socket.IO
- **Storage:** AWS S3
- **AI:** Google Gemini API
- **Frontend:** HTML, CSS, Vanilla JavaScript

## Project Structure

- `app.js`: Application entry point (Server, Express, Sockets)
- `models/`: Database schema definitions (Sequelize)
- `controllers/`: Request handlers (Business Logic)
- `routes/`: Express route definitions
- `middleware/`: Authentication and validation layers
- `sockets/`: Socket.io event handlers
- `services/`: External API integrations (AWS S3, Gemini)
- `jobs/`: Scheduled cron jobs
- `utils/`: Shared utilities (DB connection)
- `public/`: Static frontend assets (CSS, Vanilla JS)
- `views/`: HTML files served to the client

## Setup and Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Group-Chat
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env` file in the root directory and add the necessary environment variables:
   ```env
   PORT=3000
   DB_HOST=your_database_host
   DB_USER=your_database_user
   DB_PASS=your_database_password
   DB_NAME=your_database_name
   JWT_SECRET=your_jwt_secret
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=your_aws_region
   AWS_S3_BUCKET_NAME=your_bucket_name
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Run the application:**
   ```bash
   npm start
   ```
   Or for development mode (if `nodemon` is configured):
   ```bash
   npm run dev
   ```

## Architecture Highlights

- **Authentication:** JWT-based authentication for HTTP API and Socket.IO connections.
- **Data Archival:** Scheduled jobs move old messages to an archive table to keep the active database lean.
- **MVC Pattern:** The codebase follows a clean Model-View-Controller architecture.

For detailed internal documentation, please refer to `TECHNICAL_DOCUMENTATION.md`.
