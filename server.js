const WebSocket = require('ws');

const PORT = process.env.PORT || 3000;
const wss = new WebSocket.Server({ port: PORT });

// Store all active connections
const clients = new Set();

// Store drawing history
let drawingHistory = [];

wss.on('connection', (ws) => {
  console.log('New client connected');
  clients.add(ws);
  
  // Send existing drawing history to new clients
  if (drawingHistory.length > 0) {
    ws.send(JSON.stringify({
      type: 'history',
      data: drawingHistory
    }));
  }

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      // Store drawing actions in history
      if (data.type === 'draw') {
        drawingHistory.push(data);
      }
      
      // Broadcast to all other clients
      clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });
});

console.log(`WebSocket server running on port ${PORT}`);