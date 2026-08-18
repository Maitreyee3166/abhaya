
# Abhaya – Women Safety Platform

Abhaya is a web-based Women Safety Platform designed to provide emergency assistance, SOS alerts, live location tracking, incident reporting, police coordination, and AI-based assistance.

The platform connects Users, Police Officers, and Administrators to help manage emergency situations efficiently.


🏗️ Technology Stack

Frontend

HTML5
CSS3
JavaScript
Bootstrap
EJS
Font Awesome

Backend

Node.js
Express.js
Database
MongoDB
MongoDB Atlas
Mongoose

Authentication & Security

JWT
bcryptjs
Express Session
Cookie Parser
Role-Based Authorization
Real-Time Communication
Socket.IO

APIs & Services

Google Maps
Google Gemini AI
Cloudinary


## Project Structure

FINALPROJECT/
│
├── app/
│   ├── config/
│   ├── controller/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── validation/
│
├── node_modules/
│
├── public/
│   
│
├── views/
│   ├── admin/
│   ├── chat/
│   ├── common/
│   ├── police/
│   ├── user/
│   ├── index.ejs
|   └── contact.ejs
|
|
├── adminSeed.js
├── app.js
├── package.json
├── package-lock.json
├── .env
└── README.md



## Features

👩 User Module

User Registration & Login
JWT-based Authentication
Profile Management
Role-based Access
Emergency Contact Management
SOS Emergency Button
SOS History
Case Chat
Incident Reporting
Evidence Submission
Live Location Sharing

🚨 SOS Emergency Module

One-tap SOS
Emergency Alert Generation
Live GPS Location
SOS Case Creation
Police Assignment
Emergency Notifications
SOS Status Tracking
Case Resolution

👮 Police Module

Police Login
Police Dashboard
View Assigned SOS Cases
Accept/Reject Assigned Cases
View Victim Information
View SOS Location
Communicate through Case Chat
Update Case Status
Add Action Taken and Notes
Resolve Cases

📍 Location & Navigation

GPS Location Detection
Latitude & Longitude
Reverse Geocoding
Live Location Sharing
Location History
Nearby Police Stations
Google Maps Integration

🤖 AI Assistant

Abhaya also provides an AI Assistant that helps users with questions related to the website and its available features.

The AI Assistant can provide guidance about:

Using the SOS feature
Reporting incidents
Managing emergency contacts
Using live location
Understanding website features
Navigating different modules

The AI Assistant is intended to provide information about the Abhaya platform and should not replace emergency services or professional assistance.

💬 Case Chat

Real-time communication
User/Police case-based chat
Socket.IO integration
Message notifications
Case-specific conversations 


Abhaya is an educational/project-based safety platform intended to demonstrate emergency communication, location tracking, case management, and safety-related functionality.

