# Ministry Report System

A full-stack web application designed for Ministry Reporting, built with a modern React frontend and a robust Node.js/Express backend.

## Features
- **Frontend**: React 19, Vite, Tailwind CSS, and React Router for a seamless, responsive user interface.
- **Backend**: Node.js and Express server with robust API routing.
- **Database Architecture**: Supports MySQL/PostgreSQL via Sequelize ORM for secure and scalable data management.
- **File Uploads**: Integrated with `multer` and AWS S3 for robust report attachment handling.
- **PDF & Excel Generation**: Automated generation of reports in PDF (`pdfkit`) and Excel (`exceljs`) formats.
- **Authentication**: Secure JWT-based authentication and role-based access control.

## Project Structure
- `/client` - The Vite + React frontend application
- `/server` - The Node.js + Express backend server
- `/server/uploads` - Local storage for uploaded files (if not using S3)

## Getting Started

### Prerequisites
- Node.js (v18+)
- MySQL or PostgreSQL database
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/TuyFred/report-ministry.git
   cd report-ministry
   ```

2. Setup Backend:
   ```bash
   cd server
   npm install
   # Create a .env file based on environment requirements
   npm run dev
   ```

3. Setup Frontend:
   ```bash
   cd ../client
   npm install
   # Create a .env file if necessary
   npm run dev
   ```

Both the server and client will run concurrently in their respective development modes.

## Tech Stack
- **Client**: React, Vite, Tailwind CSS, Axios, React Icons, Testing Library.
- **Server**: Node.js, Express, Sequelize, Multer, PDFKit, ExcelJS, bcrypt, jsonwebtoken, CORS, dotenv.

## License
ISC
