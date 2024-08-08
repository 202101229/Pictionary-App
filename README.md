# Pictionary App

**Version:** 1.0.0  
**Author:** Dipak Dabhi

## Description

This is a real-time Pictionary App developed for the Winter of Code 6.0 (WoC 6.0). The app allows users to engage in live canvas drawing and chat with each other, providing a fun and interactive way to enjoy the classic game of Pictionary online.

## Features

- **Real-Time Drawing**: Users can draw on a shared canvas in real-time.
- **Live Chat**: Players can chat with each other while playing.
- **User Authentication**: Secure user login with bcrypt and cookie-based sessions.
- **Multiplayer Support**: Play with friends or random players online.
- **Random Word Generation**: The app generates random words for users to draw, ensuring endless fun.
- **Responsive Design**: Works seamlessly across various devices.

## Installation

### Prerequisites

- Node.js
- npm (Node Package Manager)
- MongoDB (For database)

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/202101229/Pictionary-App.git
   cd Pictionary-app

2. Install the dependencies:
   ```bash
   npm install
  
3. Create a .env file in the root directory and add the following environment variables:
   ```bash
   PORT=3000
   Mongourl = "your mongodb cluster or local databse url.(ex. 'mongodb://127.0.0.1:27017/DB_Name')"
   
4. Start the application:
   ```bash
   node app.js
   
5. Visit http://localhost:3000 in your browser to start playing!

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **WebSockets**: Socket.IO for real-time communication
- **Security**: Bcrypt for password hashing
- **Environment Variables**: Dotenv for managing environment variables


## Contact

For any inquiries, please reach out to 202101229@daiict.ac.in.


