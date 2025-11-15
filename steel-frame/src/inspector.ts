import { EarlyInspector } from "vasille-jsx/dev";

export class Inspector extends EarlyInspector {
    private socket: WebSocket | null = null;
    private connected: boolean = false;
    private ignore: boolean = false;

    public constructor() {
        super();
        this.tryToConnect(7373);
    }

    protected send(name: string, data: object) {
        if (this.socket && this.connected && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify([name, data]));
        } else if (!this.ignore) {
            this.queue.push([name, data]);
        }
    }

    private tryToConnect(port: number) {
        if (port >= 7383) {
            this.ignore = true;
            this.queue = [];
            return;
        }

        const socket = new WebSocket(`ws://localhost:${port}`);

        socket.onopen = () => {
            this.connected = true;

            for (const item in this.queue) {
                socket.send(JSON.stringify(item));
            }
            this.queue = [];
        };
        socket.onclose = () => {
            this.connected = false;
            this.tryToConnect(port + 1);
        };

        this.socket = socket;
    }
}
