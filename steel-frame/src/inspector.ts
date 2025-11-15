import {
    Inspector as InspectorInterface,
    ProtocolComponent,
    ProtocolComponentError,
    ProtocolCustomModel,
    ProtocolDependency,
    ProtocolExecutionPosition,
    ProtocolExpression,
    ProtocolExpressionError,
    ProtocolExpressionUpdate,
    ProtocolModel,
    ProtocolModelUpdate,
    ProtocolNode,
    ProtocolParent,
    ProtocolPosition,
    ProtocolReference,
    ProtocolReferenceError,
    ProtocolReferenceUpdate,
    ProtocolState,
    ProtocolStore,
    ProtocolTag,
    ProtocolDevValue,
    ProtocolRouterActionCall,
    ProtocolRouterStateChange,
    ProtocolRouterTargetResult,
    ProtocolRoutes,
    ProtocolSlotError,
} from "vasille/dev";

export class Inspector implements InspectorInterface {
    private socket: WebSocket | null = null;
    private queue: [string, object][] = [];
    private connected: boolean = false;
    private ignore: boolean = false;

    public constructor() {
        this.tryToConnect(7373);
    }

    public addContextState(state: ProtocolState): void {
        this.send(this.addContextState.name, state);
    }

    public createComponent(comp: ProtocolComponent): void {
        this.send(this.createComponent.name, comp);
    }

    public createCustomModel(model: ProtocolCustomModel): void {
        this.send(this.createCustomModel.name, model);
    }

    public createModel(model: ProtocolModel): void {
        this.send(this.createModel.name, model);
    }

    public createNode(node: ProtocolNode): void {
        this.send(this.createNode.name, node);
    }

    public createStore(store: ProtocolStore): void {
        this.send(this.createStore.name, store);
    }

    public createTag(tag: ProtocolTag): void {
        this.send(this.createTag.name, tag);
    }

    public destroy(id: number): void {
        this.send(this.destroy.name, { id });
    }

    public idToPosition(pos: ProtocolPosition): void {
        this.send(this.idToPosition.name, pos);
    }

    public linkDependency(dep: ProtocolDependency): void {
        this.send(this.linkDependency.name, dep);
    }

    public newExpression(expr: ProtocolExpression): void {
        this.send(this.newExpression.name, expr);
    }

    public newReference(ref: ProtocolReference): void {
        this.send(this.newReference.name, ref);
    }

    public registerDevValue(value: ProtocolDevValue): void {
        this.send(this.registerDevValue.name, value);
    }

    public registerExecutionPosition(pos: ProtocolExecutionPosition): void {
        this.send(this.registerExecutionPosition.name, pos);
    }

    public registeredRoutes(routes: ProtocolRoutes): void {
        this.send(this.registeredRoutes.name, routes);
    }

    public reportComponentError(error: ProtocolComponentError): void {
        this.send(this.reportComponentError.name, error);
    }

    public reportComponentSlotError(error: ProtocolSlotError): void {
        this.send(this.reportComponentSlotError.name, error);
    }

    public reportExpressionCalculationError(error: ProtocolExpressionError): void {
        this.send(this.reportExpressionCalculationError.name, error);
    }

    public reportExpressionSyncError(error: ProtocolReferenceError): void {
        this.send(this.reportExpressionSyncError.name, error);
    }

    public reportReferenceError(error: ProtocolReferenceError): void {
        this.send(this.reportReferenceError.name, error);
    }

    public routerActionCall(call: ProtocolRouterActionCall): void {
        this.send(this.routerActionCall.name, call);
    }

    public routerStateChange(change: ProtocolRouterStateChange): void {
        this.send(this.routerStateChange.name, change);
    }

    public routerTargetResult(data: ProtocolRouterTargetResult): void {
        this.send(this.routerTargetResult.name, data);
    }

    public setElementParent(parent: ProtocolParent): void {
        this.send(this.setElementParent.name, parent);
    }

    public unlinkDependency(dep: ProtocolDependency): void {
        this.send(this.unlinkDependency.name, dep);
    }

    public updateExpression(update: ProtocolExpressionUpdate): void {
        this.send(this.updateExpression.name, update);
    }

    public updateModel(update: ProtocolModelUpdate): void {
        this.send(this.updateModel.name, update);
    }

    public updateReference(update: ProtocolReferenceUpdate): void {
        this.send(this.updateReference.name, update);
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
