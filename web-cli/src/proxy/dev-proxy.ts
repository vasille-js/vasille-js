import { WebSocketServer } from "ws";

export function startProxyServer() {
    const ideServer = new WebSocketServer({ port: 7372 });
    const appServer = new WebSocketServer({ port: 7374 });

    ideServer.on('connection', function connection(ws) {
        ws.on('message', function message(data) {
            appServer.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(data.toString());
                }
            });
        });
    });

    appServer.on("connection", function connection(ws) {
        ws.on("message", function message(data) {
            ideServer.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(data.toString());
                }
            });
        });
    })

    console.log("Proxy server activated");
}
