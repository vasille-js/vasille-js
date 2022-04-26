import {IValue} from "../core/ivalue";

export function merge (main : Record<string, any>, ...targets : Record<string, any>[]) {
    function refactorClass (obj : Record<string, any>) {
        if (Array.isArray(obj.class)) {
            const out : {$: any[]} & Record<string, any> = {
                $: []
            };

            obj.forEach(item => {
                if (item instanceof IValue) {
                    out.$.push(item);
                }
                else if (typeof item === 'string') {
                    out[item] = true;
                }
                else if (typeof item === 'object') {
                    Object.assign(out, item);
                }
            });

            obj.class = out;
        }
    }

    refactorClass(main);

    targets.forEach(target => {
        Reflect.ownKeys(target).forEach((prop : string) => {
            if (!Reflect.has(main, prop)) {
                main[prop] = target[prop];
            }
            else if (typeof main[prop] === 'object' && typeof target[prop] === 'object') {
                if (prop === 'class') {
                    refactorClass(target);
                }
                if (prop === '$' && Array.isArray(main[prop]) && Array.isArray(target[prop])) {
                    main.$.push(...target.$);
                }
                else {
                    merge(main[prop], target[prop]);
                }
            }
        });
    });
}
