# Vasille

![Vasille.js logo](https://gitlab.com/vasille-js/vasille-js/-/raw/v2/img/logo.png)

Библиотека ядра `Vasille` - `безопасное`, `быстрое` и `мощное` front-end решение.

[![build](https://gitlab.com/vasille-js/vasille-js/badges/v2/pipeline.svg)](https://gitlab.com/vasille-js/vasille-js)
[![npm](https://img.shields.io/npm/v/vasille?style=flat-square)](https://www.npmjs.com/package/vasille)

## Содержание

* [Installation](#installation)
* [How SAFE is Vasille](#how-safe-is-vasille)
* [How FAST is Vasille](#how-fast-is-vasille)
* [How POWERFUL is Vasille](#how-powerful-is-vasille)
* [How to use Vasille](#how-to-use-vasille)
* [Best Practices](#best-practices)


<hr>

## Установка

```
npm install vasille --save
```

### CDN

```html
Версия ES2015
<script src="https://unpkg.com/vasille"></script>
Веррсия ES5 для обратной совместиости со старыми браузерами
<script src="https://unpkg.com/vasille/cdn/es5.js"></script>
```

### Примеры для быстрого старта
* Пример на JavaScript
* Пример на TypeScript
* Пример на Flow.js

### Поддерка Flow.js
Добавьте следующую строку в разделе `[libs]` файла `.flowconfig`.
```
node_modules/vasille/flow-typed
```

<hr>

## На сколько БЕЗОПАСЕН Vasille

Безопасность вашей приложений обепечивается 
* `100%` покрытием юнит-тестами кода `vasille`;
  Каждая функция, каждое вьетвление работает как задумано.
* `строгая типизация` поднимет безопасность вашего javascript/typescript кода
до уровня C++.
Все сущности библиотеки ядра `vasille` строго типизированные, включая:
  * поля и свойства.
  * computed свойства (параметры функции и результат).
  * методы.
  * события (отправка и обработка).
  * события и операции DOM (атрибуты, стики, и т.д.).
  * слота компонентов.
  * ссылкик дочерных элементах.
* Отсуствия скрытых операции и польный контроль над всего.
* Отсуствие асинхроного кода, когда строка кода выполнена, DOM и модель данных уже синхронизированы.

## На сколько БЫСТРЫЙ Vasille

Тестовый проект бы реализован использую следующие фрейворки:
* Angular /
  [Попробуй начальную версия](https://vasille-js.gitlab.io/project-x32/angular/) /
  [Попробуй оптимизиванную версию](https://vasille-js.gitlab.io/project-x32-if/angular/).
* React /
  [Попробуй начальную версия](https://vasille-js.gitlab.io/project-x32/react/) /
  [Попробуй оптимизиванную версию](https://vasille-js.gitlab.io/project-x32-if/react/).
* Vue 2 /
  [Попробуй начальную версия](https://vasille-js.gitlab.io/project-x32/vue-2/) /
  [Попробуй оптимизиванную версию](https://vasille-js.gitlab.io/project-x32-if/vue-2/).
* Vue 3 /
  [Попробуй начальную версия](https://vasille-js.gitlab.io/project-x32/vue-3/) /
  [Попробуй оптимизиванную версию](https://vasille-js.gitlab.io/project-x32-if/vue-3/).
* Svelte /
  [Попробуй начальную версия](https://vasille-js.gitlab.io/project-x32/svelte/) /
  [Попробуй оптимизиванную версию](https://vasille-js.gitlab.io/project-x32-if/svelte/).
* Vasille /
  [Попробуй начальную версия](https://vasille-js.gitlab.io/project-x32/vasille-js/) /
  [Попробуй оптимизиванную версию](https://vasille-js.gitlab.io/project-x32-if/vasille-js/).

Результаты тестирования проеонтрированы на графиках 1 и 2. 
Результаты тестирования предоставлены в FPS (кадры в секунду), расчитано по формуле `1000 / ft`,
где `ft` средняя врея кадра из 20. Все значения абсолютные. Выше - лучше.

Начальная версия обновляет всю страницу целиком каждый кадр. 
В связи с большой слонжости модели данных, получаем плохие результаты в Angular, React, Vue & Svelte.

Оптимизируванная версия отключает неактуальный контент (которого не видно на экране),
что упрощает модель данных. Angular и Svelte получили результаты сопостовимы с Vasille.
React и Vue продолжает быть медлеными, особенно в начале теста.

**Выводы:** Обновления модели данный в Vasille произходит очень быстро
и её высокая сложность не замедляет приложение.

<hr>

&nbsp;

График 1: Начальная версия

![results 1](https://gitlab.com/vasille-js/vasille-js/-/raw/v2/img/scores-wo.png)

<hr>

&nbsp;

График 2: Оптимизированная версия

![results 2](https://gitlab.com/vasille-js/vasille-js/-/raw/v2/img/scores-o.png)

<hr>

## На скольк МОЩНЫЙ Vasille

Секрет `Vasille` в хорошую декомпозицию задач. Библотека ядра содержит
эффективый модуль обновления модели данных и движок генерации DOM основан на него.

<hr>

### Модуль обновления данных

Модуль обновления данных используется для описания модели данных. Модель может содержать
самобоновляющийся даныые, односторонные данные. Цепочку обновления данных можно управлять в ручную.

![Reactivity Module](https://gitlab.com/vasille-js/vasille-js/-/raw/v2/img/reactive.png)

* `Destroyable` - сущности имеющая настраиваемый деструктор.
* `IValue<T>` общий интерфейс контейнера данных, представляющий:
  * `get $` получить вложенные данные.
  * `set $` вручную обновить данные, обновляя всё что от неё зависит.
  * `disable` приостановливает цепочку обновления данных.
  * `enable` возовновяет цепочку обновеления данных, обновляя всё что от неё зависит.
* `Reference<T>` содежит ссылку на значение типа `T`.
* `Mirror<T>` синхронизирует своё значение с дригим контейнером, используется для одностороную передачи данных.
* `Pointer<T>` - тоже самое что и `Mirror`, с возможностю переключения между контейнерами.
* `Expression<ReturnType, Args...>` - самообновляющайся значение.
* `Reactive` - множенствнный контейнер, с возможностью отправлять/получать сигналы.

<hr>

### Движок Генерации DOM

Движок Генерации DOM использутся для создания виртуального DOM из фрагментов,
который будет самостоятельно создавать и обновлять модель данных страницы.

![DOM Generation Engine](https://gitlab.com/vasille-js/vasille-js/-/raw/v2/img/nodes.png)

* `Fragment` - узел виртуального DOM.
* `TextNode` создаёт `Text` узел.
* `INode` содержит `Element` узел.
* `Tag` создаёт `Element` узел.
* `Extension` содержит уже созданный `Element` узел.
* `Component` содержить `Element` узел, созданный доченим узлом типа `Tag`.
* `AppNode` - корень под-приложений `Vasille`, используется для создания супер-приложениах.
* `App` - корень супер-приложений `Vasille`.
* `DebugNode` создаёт `Comment` узел, полезен при отладки.
* `Watch` персоздаёт дерево при обновления данных модели.
* `RepeatNode` создаёт множенство дочерных узлов используя один и тоже код.
* `Repeater` создаёт повторно дочерных элементов `n` раз.
* `BaseView` - view в контексте MVC (Model-View-Controller).
* `ObjectView` строит дерева под каждое значение `ObjectModel`.
* `MapView` строит дерева под каждое значение `MapModel`.
* `SetView` строит дерева под каждое значение `SetModel`.
* `ArrayView` строит дерева под каждое значение `ArrayModel` соблюдая последовательность.
* `InterceptorNode` используется для объядинения сигнала и приёмники дочерных элементов 
без содания интерсептеров в ручную.

## Как использовать Vasille

Есть несколько способов, большенство из них в разработки:
* [ООП - Готов](https://gitlab.com/vasille-js/vasille-js/-/blob/v2/pages/OOP-API.md)
* [Процедурный подход - в разработки](https://gitlab.com/vasille-js/vasille-js/-/blob/v2/pages/Procedural-API.md)
* [Шаблоный подход - в разработки](https://gitlab.com/vasille-js/vasille-js/-/blob/v2/pages/API.md)

## Лучшие практики

* [Множенственные контейнеры](https://gitlab.com/vasille-js/vasille-practices/-/blob/main/practices/reactive-object.ts)
* [Приложения](https://gitlab.com/vasille-js/vasille-practices/-/blob/main/practices/application.ts)
* [Супер-приложения](https://gitlab.com/vasille-js/vasille-practices/-/blob/main/practices/application-in-application.ts)
* [Передача сигналов](https://gitlab.com/vasille-js/vasille-practices/-/blob/main/practices/signaling.ts)
* [Односторонные данные](https://gitlab.com/vasille-js/vasille-practices/-/blob/main/practices/forward-only.ts)
* [Абсолютные, относительные и автоматизированные значения](https://gitlab.com/vasille-js/vasille-practices/-/blob/main/practices/auto-value.ts)
* [Перехват сигналов](https://gitlab.com/vasille-js/vasille-practices/-/blob/main/practices/singaling-intercepting.ts)
* [Отладка](https://gitlab.com/vasille-js/vasille-practices/-/blob/main/practices/debugging.ts)
* [Fragment против Component](https://gitlab.com/vasille-js/vasille-practices/-/blob/main/practices/fragment-component.ts)
* [Ресширения](https://gitlab.com/vasille-js/vasille-practices/-/blob/main/practices/extension.ts)
* [Model-View-Controller](https://gitlab.com/vasille-js/vasille-practices/-/blob/main/practices/model-view-controller.ts)

## Вопросы

If you have questions, fell free to contact the maintainer of project:

* [Author's Email](mailto:lixcode@vivaldi.net)
* [Project Discord Server](https://discord.gg/SNcXNZxz)
* [Author's Telegram](https://t.me/lixcode)
* [Author's VK](https://vk.com/lixcode)

