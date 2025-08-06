import { Slot, view } from "vasille-web";

interface SubProps {
  slot?: () => void;
  slot1?: (props: { x: number }) => void;
  slot2?: (props: { x: number }) => void;
}

export let control:
  | {
      setX(x: number): void;
    }
  | undefined = undefined;

export const xes: number[] = [];

const SubComponent = view(({ slot, slot1, slot2 }: SubProps) => {
  let x = 0;

  if (slot1) {
    control = {
      setX(_x: number) {
        x = _x;
      },
    };
  }

  <Slot model={slot} />;
  <Slot model={slot1} x={x}>
    <div>slot 1 default</div>
  </Slot>;
  <Slot model={slot2} x={3} />;
});

export const Component = view(() => {
  <div>
    <SubComponent />
  </div>;
  <div>
    <SubComponent>
      <div>child</div>
    </SubComponent>
  </div>;
  <div>
    <SubComponent
      slot1={({ x }) => {
        xes.push(x);
        <div>child{x}</div>;
      }}
    />
  </div>;
  <div>
    <SubComponent
      slot2={({ x }) => {
        xes.push(x);
        <div>child{x}</div>;
      }}
    />
  </div>;
});
