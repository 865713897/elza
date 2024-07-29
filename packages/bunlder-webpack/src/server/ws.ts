import { WebSocketServer } from 'ws';

export function createWebSocketServer(server: any) {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (req, socket, head) => {
    if (req.headers['sec-websocket-protocol'] === 'elza-hmr') {
      wss.handleUpgrade(req, socket as any, head, (ws: any) => {
        wss.emit('connection', ws, req);
      });
    }
  });

  wss.on('connection', (socket) => {
    socket.send(JSON.stringify({ type: 'connected' }));
  });

  wss.on('error', (err: Error) => {
    console.log(err, 'err');
  });

  return {
    send(message: string) {
      wss.clients.forEach((client) => {
        client.send(message);
      });
    },
    wss,
    close() {
      wss.close();
    },
  };
}
