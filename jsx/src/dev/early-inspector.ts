import {
    Inspector,
    ProtocolComponent,
    ProtocolCustomModel,
    ProtocolExecutionPosition,
    ProtocolExpression,
    ProtocolExpressionError,
    ProtocolExpressionUpdate,
    ProtocolModel,
    ProtocolModelUpdate,
    ProtocolNode,
    ProtocolParent,
    ProtocolReference,
    ProtocolReferenceError,
    ProtocolReferenceUpdate,
    ProtocolState,
    ProtocolStore,
    ProtocolTag,
    ProtocolRouterActionCall,
    ProtocolRouterStateChange,
    ProtocolRouterTargetResult,
    ProtocolRoutes,
    ProtocolSlotError,
    ProtocolFunctionCall,
    ProtocolFunctionResult,
    ProtocolFunctionError,
    ProtocolEventTrigger,
    ProtocolComposeTime,
    ProtocolError,
    DestroyData,
} from "vasille/dev";

export abstract class AbstractInspector implements Inspector {
    public addContextState(state: ProtocolState): void {
        this.send(this.addContextState.name, state);
    }

    public composeTime(time: ProtocolComposeTime): void {
        this.send(this.composeTime.name, time);
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

    public destroy(data: DestroyData): void {
        this.send(this.destroy.name, data);
    }

    public eventTrigger(call: ProtocolEventTrigger) {
        this.send(this.eventTrigger.name, call);
    }

    public functionCall(call: ProtocolFunctionCall): void {
        this.send(this.functionCall.name, call);
    }

    public functionReturn(result: ProtocolFunctionResult): void {
        this.send(this.functionReturn.name, result);
    }

    public functionThrows(error: ProtocolFunctionError): void {
        this.send(this.functionThrows.name, error);
    }

    public newExpression(expr: ProtocolExpression): void {
        this.send(this.newExpression.name, expr);
    }

    public newReference(ref: ProtocolReference): void {
        this.send(this.newReference.name, ref);
    }

    public registerExecutionPosition(pos: ProtocolExecutionPosition): void {
        this.send(this.registerExecutionPosition.name, pos);
    }

    public registeredRoutes(routes: ProtocolRoutes): void {
        this.send(this.registeredRoutes.name, routes);
    }

    public reportComponentError(error: ProtocolError): void {
        this.send(this.reportComponentError.name, error);
    }

    public reportComponentSlotError(error: ProtocolSlotError): void {
        this.send(this.reportComponentSlotError.name, error);
    }

    public reportError(err: ProtocolError) {
        this.send(this.reportError.name, err);
    }

    public reportExpressionCalculationError(error: ProtocolExpressionError): void {
        this.send(this.reportExpressionCalculationError.name, error);
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

    public updateExpression(update: ProtocolExpressionUpdate): void {
        this.send(this.updateExpression.name, update);
    }

    public updateModel(update: ProtocolModelUpdate): void {
        this.send(this.updateModel.name, update);
    }

    public updateReference(update: ProtocolReferenceUpdate): void {
        this.send(this.updateReference.name, update);
    }

    protected abstract send(name: string, data: object): void;
}

export class EarlyInspector extends AbstractInspector {
    protected inspector: Inspector | undefined;
    protected queue: [string, object][] = [];

    public connect(inspector: Inspector) {
        this.inspector = inspector;

        for (const item of this.queue) {
            inspector[item[0]](item[1]);
        }
        this.queue = [];
    }

    protected send(name: string, data: object) {
        if (this.inspector) {
            this.inspector[name](data);
        } else {
            this.queue.push([name, data]);
        }
    }
}

export const earlyInspector = new EarlyInspector();
