/**
 * BrowserQuest Starter Script
 * This script starts the BrowserQuest server
 */

const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Start server
console.log('Starting BrowserQuest server...');
const server = spawn('node', ['server/js/main.js'], { 
  stdio: 'inherit'
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
});

// Determine client URL
const PORT = 8000;
const getLocalIp = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if ('IPv4' === iface.family && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
};

const LOCAL_IP = getLocalIp();

console.log(`
==========================================================
BrowserQuest server is running!

To play the game, open your browser and navigate to:
http://${LOCAL_IP}:${PORT}/client/

Or if accessing locally:
http://localhost:${PORT}/client/
==========================================================
`);

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nShutting down BrowserQuest server...');
  server.kill();
  process.exit(0);
}); 