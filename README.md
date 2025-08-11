Heaven Hub - Real Estate Platform
Heaven Hub is a full-stack real estate platform where users can explore, buy, rent, and sell properties. This application features dynamic property listings, secure user authentication, and a responsive design, providing a seamless user experience across devices.

Features
Browse Listings: Users can search for properties based on categories such as rent or sale.
User Authentication: Secure login and registration using JSON Web Tokens (JWT).
Property Management: Registered users can add, update, and delete their property listings.
Responsive Design: Optimized for all devices (mobile, tablet, and desktop) with Tailwind CSS.
Dynamic Listings: Real-time updates to property listings and filtering options for better user experience.

Tech Stack
Frontend: React, Redux, Tailwind CSS
Backend: Node.js, Express
Database: MongoDB
Authentication: JWT (JSON Web Token)
Build Tool: Vite

# Installation
Clone the repository:

git clone https://github.com/abhinash3007/heaven-hub.git
cd heaven-hub
# Install dependencies for both frontend and backend:

# For frontend
cd frontend
npm install

# For backend
cd ../backend
npm install

# Create a .env file in the backend directory with the following variables:

# plaintext
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000

# Additional backend env vars for crime routes and geocoding
MAPBOX_TOKEN=your_mapbox_access_token
NEWSDATA_API_KEY=your_newsdata_api_key

# Frontend .env (in `frontend/.env`)
VITE_MAPBOX_TOKEN=your_mapbox_access_token

Run the backend server:


npm run dev
#Run the frontend (from the frontend directory):

npm run dev
API Endpoints

# Property Listings
GET /api/listing/get?type=rent&limit=4: Get latest properties for rent.

GET /api/listing/get?type=sale&limit=4: Get latest properties for sale.

GET /api/listing/get?offer=true&limit=4: Get properties with special offers.

# Authentication
POST /api/auth/register: Register a new user.

POST /api/auth/login: Login for existing users.
