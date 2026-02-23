# Steel Frame Kit Context

Value from parent-to-child components can be passed down using context
to elude prop drilling.

## Get Started

A context can be created using the `context` function:
```typescript jsx
// create context
const fullname = context((name: string, surname: string) => {
    return {name, surname};
});
// share context
const Parent = component(() => {
    const shared = share(fullname, "John", "Doe");
    
    <Child />;
});
// use context
const Child = component(() => {
    const {name, surname} = receive(fullname);
    
    return <div>{name} {surname}</div>;
});
```

## Which value can be shared?

Whithout creating a custom context, dependencies can be shared.
A dependency can be a string or a class object.

Example of sharing a string:
```typescript jsx
// share string
const Parent = component(() => {
    const name = share("name", "John");
    const surname = share("surname", "Doe");
    
    <Child />;
});
// use context
const Child = component(() => {
    const name = receive("name");
    const surname = receive("surname");
    
    return <div>{name} {surname}</div>;
});
```

Example of sharing a class object:
```typescript jsx
// use abstract class to share an interface
abstract class Person {
    abstract getName(): string;
    abstract getSurname(): string;
}
// implement interface
class JohnDoe extends Person {
    getName() {
        return "John";
    }
    getSurname() {
        return "Doe";
    }
}
// share dependency
const Parent = component(() => {
    const shared = share(Person, new JohnDoe());

    <Child />;
});
// use context
const Child = component(() => {
    const person = receive(Person);

    return <div>{person.getName()} {person.getSurname()}</div>;
});
```

## One more thing

You can use `impute` function to provide default values and avoid errors.

The next example shows how to use `impute` to get the current nesting level:
```typescript jsx
const nestingLevel = context((n: number) => n);

const Nested = component(() => {
    const level = impute(nestingLevel, 0);
    const shared = share(nestingLevel, level + 1);
    
    <If $condition={level < 10}>
        Nesting level is {level}.
        <Nested />
    </If>;
});
```

When the nestingLevel is missing, it is initialized with `0`. After is incremented by `1`.
So the first created `Nested` component will have `level = 0` & `shared = 1`.
The component is recursive and will be created 10 times.
The lass `Nested` component will have `level = 9` & `shared = 10`.
