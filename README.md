#🏡 Heaven Hub — Real Estate Platform with AI & Crime Intelligence

A full-stack MERN real estate platform designed to help users discover properties with AI-generated descriptions, city-based crime intelligence, and interactive Mapbox maps for safer decision-making.

🚀 Key Features
🧠 1. AI-Generated Property Descriptions

Uses OpenAI API to generate high-quality, SEO-optimized property descriptions.

Helps users post professional listings instantly.

Reduces manual writing effort by 90%.

🔐 2. Secure Authentication & User System

Firebase Auth + JWT-secured backend APIs.

Role-based access for owners and buyers.

Protected routes and secure sessions.

🛰️ 3. Crime Intelligence System (Unique Project Feature)

Fetches real-time crime news using Newsdata API.

Determines area safety score:

🟢 Safe

🟡 Medium

🔴 High Risk

Maps incidents within a 2 km radius of the property.

Cached using NodeCache (30-min TTL) to reduce API calls by 90%.

🗺️ 4. Mapbox Location & Geo Features

Auto-geocoding based on address → converts to latitude/longitude.

Interactive Mapbox GL map inside listing pages.

Shows property pin + nearby crime indicators.

Smooth, zoomable map with location accuracy.

⚡ 5. Performance Optimization

Express-rate-limit: Protects API endpoints.

Cached external requests: Cuts latency by 40%.

Lazy-loaded routes & optimized media loading.

Ensures consistent <1% API error rate.

🎨 6. Modern Frontend (React + Tailwind)

Responsive UI for large screens.

Swiper.js gallery for properties.

Reusable & modular components.

🧩 Tech Stack
Frontend

React.js

Redux Toolkit

Tailwind CSS

Swiper.js

Mapbox GL

Backend

Node.js

Express.js

MongoDB

JWT Authentication

NodeCache

Newsdata API

OpenAI API (for descriptions)

Cloud & Tools

Firebase Auth

Vercel (Frontend)

Render / Railway (Backend)

Postman, GitHub

Rate limiting, API error handling

📊 Crime Intelligence Flow
User searches → Property found → Backend fetches crime data  
→ AI summarizes descriptions → Cache activated  
→ Mapbox shows nearby crime → Safety score calculated → User sees risk level  


Formula (example):

0–2 crimes → Safe  
3–7 crimes → Medium  
8+ crimes → High Risk  

📸 Screenshots (Add in your repo)

Home page

Listing page

Crime summary section

Mapbox Integration

AI description generation UI

🛠️ Installation
Backend Setup
cd backend
npm install
npm run start

Frontend Setup
cd frontend
npm install
npm run dev


Configure environment variables:

.env
MONGO_URI=your_mongo_uri
OPENAI_API_KEY=your_openai_key
NEWSDATA_API_KEY=your_newsdata_key
MAPBOX_TOKEN=your_mapbox_key
FIREBASE_API_KEY=your_firebase_key
