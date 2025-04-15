/**
 * BrowserQuest Client Server
 * This is a simple HTTP server to serve the client files
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

const server = http.createServer((request, response) => {
  console.log(`${new Date().toISOString()} - ${request.method} ${request.url}`);
  
  // Parse URL path
  let urlPath = request.url;
  
  // Default page is index.html
  if (urlPath === '/' || urlPath === '') {
    urlPath = '/index.html';
  }
  
  // Determine file path based on URL
  let filePath;
  
  // Special case for shared directory
  if (urlPath.startsWith('/shared/')) {
    // Use project root for shared resources
    filePath = '.' + urlPath;
  } else {
    // Use client directory for other resources
    filePath = path.join('./client', urlPath);
  }
  
  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(`File not found: ${filePath}`);
      response.writeHead(404);
      response.end('File not found');
      return;
    }
    
    // Get file extension and content type
    const extname = path.extname(filePath);
    let contentType = MIME_TYPES[extname] || 'application/octet-stream';
    
    // Read and serve the file
    fs.readFile(filePath, (error, content) => {
      if (error) {
        console.error(`Error reading file: ${error.code}`);
        response.writeHead(500);
        response.end('Server Error: ' + error.code);
      } else {
        response.writeHead(200, { 'Content-Type': contentType });
        response.end(content, 'utf-8');
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`Client server running at http://localhost:${PORT}/`);
  console.log('To play the game, open your browser and navigate to:');
  console.log(`http://localhost:${PORT}/`);
}); 