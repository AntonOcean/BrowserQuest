# Running BrowserQuest with npm 11.3.0 and Node.js v22.14.0

This document explains how to run BrowserQuest with modern versions of Node.js.

## Prerequisites

- Node.js v22.14.0
- npm 11.3.0

## Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/bq-v3.git
   cd bq-v3
   ```

2. Install dependencies:
   ```
   npm install
   ```

## Running the Game

### Method 1: Run Game Server and Client Separately

1. Start the game server:
   ```
   npm start
   ```

2. In a new terminal window, start the client server:
   ```
   npm run client
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:8080/
   ```

### Method 2: Run Game Server Only (Modern Browsers)

1. Start the game server:
   ```
   npm start
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:8000/client/
   ```

## Troubleshooting

If you encounter any issues:

1. Make sure all dependencies are installed correctly
2. Check console logs for errors
3. Ensure ports 8000 and 8080 are not being used by other applications
4. Make sure you have appropriate file permissions

## Modifications Made for Compatibility

Several changes were made to make BrowserQuest work with modern Node.js:

1. Updated dependencies to modern versions
2. Replaced deprecated WebSocket server with modern alternatives
3. Fixed deprecated API calls (e.g., path.exists -> fs.existsSync)
4. Added helper scripts for easier startup

## License

BrowserQuest is licensed under MPL 2.0. Content is licensed under CC-BY-SA 3.0.
See the LICENSE file for details. 