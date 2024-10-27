import { Mount, Slot, compose } from "vasille-dx";

const Component1 = compose((p: { slot: () => void }) => {
    const c1 = 3;
    let v1 = 2;

    function upd() {
        v1 += c1;
    }

    // <div class={["23"]} onclick={upd}>sdsdf</div>
    const a = <Slot model={p.slot} />;

    <>
        {a}
        <Component2>
            {n => {
                // "as"
                <Mount bind={true}></Mount>;
            }}
        </Component2>
    </>;
});

// const test = Composed<

const Component2 = compose((p: { slot: (x: number) => void }) => {
    const c1 = 3;
    let v1 = 2;

    function upd() {
        v1 += c1;
    }

    <Component1>23e2</Component1>;
    // <div class={["23"]} onclick={upd}>sdsdf</div>
    // <Slot model={p.slot} args={[2]}/>
    // <Component3></Component3>
});

const Component3 = compose(() => {
    // <div ></div>
    <input node:value="23" />;
});
