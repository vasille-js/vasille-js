# Vasille CL 2.1 : Data | Declarative | Functional

Сначала была data, потом программист создал весь мир...

## Концепция DDF

Концепция DDF (Data | Declarative | Functional) предлагает структурировать компоненты следующим образом:
* Data - Описать входные данные.
* Declarative - Декларировать манипуляции над данными.
* Functional - Описать процесс композиции компонента использую функциональное программирование.

Посмотрим концепция DDF на примере программы `Hello World`:

```typescript
// Файл App.ts
import {app, Options, text} from "vasille";

// Описание входных данных
interface InputData extends Options {
    name: string
}

// Декларируем корневой компонент
export default app<InputData>(({name}: InputData) => {

    // Функционально декларируем содержимое
    text(`Hello, ${name}!`);
});

// Файл main.ts
import App from './App.js';

// Создаём инстанс нашего компонента, который является кормен приложений
App(document.body, {
    name: "World"
});
```

Функция `app` создаёт специальную абстракцию, которая позволяет создать инстанс компонента,
в данном случае компонент корневой, по этому при создании инстанса нужно указать точка монтирования,
а не только входные данные.

## Обновление компонента

**Декларированный конструктор** компонента вызывается лишь раз для каждого инстанса.
Если необходимо обновить данные на экран необходимо декларировать возможность изменить данные,
посмотрим также на примере:

```typescript
import {ref, setValue, text} from "vasille";


// В этот раз ободеймся без входных данных

export default app(() => {
    // все внутренные данные должны быть константами
    // helloText будет ссыкой на ячейку данных содержащее текст "Hello, World!"
    const helloText = ref("Hello, World!");

    // отправлям данные на экран по ссылке
    text(helloText);

    // компонент готов, запланируем изменения данных через 10 секунд
    setTimeout(() => {
        setValue(helloText, "The world say hello to you too.")
    });
})
```

Через 10 секунд после создание инстанса компонента текст будет изменён. Также программа может 
реагировать на ввод пользователя, разбираем на простом примере "Счётчик кликов":

```typescript
import {expr, setValue, tag, valueOf} from "vasille";

export default app(() => {
    // Декларируем буффер для количество кликов
    const count = ref(0);
    // Декларируем текст для отображения на экран 
    // Текст будет обновлён автоматически при изменения count
    const screenText = expr(count => `Clicked ${count} times.`, count);

    // Декларируем функцию изменения состояния
    function increase() {
        // Установим новое значение, равна текущей плюс 1
        setValue(count, valueOf(count) + 1);
    }

    // Декларируем кнопку
    tag("button", {
        // перечисляем обработчики события
        events: {
            // указываем что при клике надо вызвать increase
            click: increase
        }
    }, () => {
        // Декларируем текст внутри кнопки
        text(screenText);
    });
})
```

## Межкомпонентное передача данных

Ссылки можно передать из одного компонента в другом обеспечивая двухстороннюю синхронизацию данных.

Посмотрим следующую задачу:
* Создать 2 кнопки со счётчиком (кнопки оформить в виде компонента)
* Показать сумму счётчиков в родительском компоненте
* Добавить 3 кнопку, которая будет сбросить оба счётчика
* Использовать чистую магию

```typescript
// Button.ts
import {component, IValue, Options, setValue, text} from "vasille";

interface Input extends Options {
    count: IValue<number>
}

// Тут `app` не подходит, используем функцию `component`
export default component<Input>(({count}) => {
    const screenText = expr(count => `Clicked ${count} times.`, count);

    // остальное как в предедущем примере
});

// Parent.ts
import Button from './Button';
import {app, expr, ref, setValue, tag, text} from "vasille";

export default app(() => {
    // Данные
    const a = ref(0);
    const b = ref(0);
    const sumText = expr((a, b) => `${a} + ${b} = ${a + b}`, a, b);

    // Манипуляции
    function reset() {
        setValue(a, 0);
        setValue(b, 0);
    }

    // HTML
    // В первую кнопку передаём ссылка a
    Button({count: a});
    // Во вторую - ссылка b
    Button({count: b});
    // Отображем текст суммы на экран
    text(sumText);
    // Добавляем кнопку сброса
    tag("button", {
        events: {
            click: reset
        }
    }, () => {
        text("Reset");
    });
})
```

## Жизненный цикл компонента

Жизненный цикл компонента как такого не существует. Но функцию композиции можно делить на 3 части:
* created - там где инициализируем данные
* mounting - там где декларируем что нужно монтировать
* mounted - код в самом конце, там можно взаимодействовать с декларированных элементами

Но если компонент использует данные которых нужно отчистить, можно написать ещё одну функцию для этого:

```typescript
import {Options} from "vasille";

// Описываем данные которым будем передать между фунциями
interface Output {
    cityMap: Map<number, string>;
}

export default app<Options, Output>(() => {
    const map = new Map;
    
    // ..
    
    // используем return чтобы передать данные во вторую функцию 
    return {
        cityMap: map
    }
}, ({ cityMap }) => {
    // Отчистим память
    cityMap.clear();
});
```

## Нелинейный поток (nonlinear flow)

Можно использовать if и for как операторы контроля потока, но как была указана раньше
функция вызывается лишь раз. Для декларирования возможные изменения потока во время жизни компонента
присутствует специальный набор функции:
* `v.if` - декларирует условную развязку в стиле оператор `if`
* `v.else` - декларирует альтернативную развязку пред едущему оператору `if`
* `v.elif` - декларирует условную альтернативную развязку пред едущему оператору `if`
* `v.for` - декларирует итерацию моделях данных (map, array, set, object)

Посмотрим на примере простую `if` развязку:

```typescript
import {ref, text, v} from "vasille";

export default app(() => {
    const bool = ref(false);
    // ..

    v.if(bool, () => {
        text("It's true!");
    });
});
```

К неё же добавил `else` развязку:
```typescript
import {ref, text, v} from "vasille";

export default app(() => {
    const bool = ref(false);
    // ..

    v.if(bool, () => {
        text("It's true!");
    });
    v.else(() => {
        text('It\'s false');
    });
});
```

А теперь посмотрим более продвинутый пример:
```typescript
import {expr, ref, text, v} from "vasille";

export default app(() => {
    const int = ref(1);
    // ..

    v.if(expr(int => int == 1, int), () => {
        text("It's one!");
    });
    v.elif(expr(int => int == 2, int), () => {
        text("It's two!")
    });
    v.else(() => {
        text('It\'s not one or two (');
    });
});
```

А теперь создадим список на основе массива данных:

```typescript
import {ArrayModel, tag, v} from "vasille";

export default app(() => {
    // тут объязательно нужны не просто данные, а именно модели: ArrayModel, SetModel, MapModel, ObjectModel
    const arr = new ArrayModel(["one", "two", "three"]);

    tag("ul", {}, () => {
        v.for(arr, value => {
            tag("li", {}, () => text(value));
        });
    });
});
```

Каждая модель имеет одинаковый публичный интерфейс, как у встроенных контейнеров, разница в том что у моделей
есть специальные возможность узнать об обновления данных внутри (они магические).
