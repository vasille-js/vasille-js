import {Executor, InstantExecutor, TimeoutExecutor} from "../../src";
import {page} from "../page";


it('Executor', function () {
    const ex = new Executor;
    const el = page.window.document.body;
    const error = "not-overwritten";

    expect(() => ex.addClass(el, '')).toThrow(error);
    expect(() => ex.removeClass(el, '')).toThrow(error);
    expect(() => ex.setAttribute(el, '', '')).toThrow(error);
    expect(() => ex.removeAttribute(el, '')).toThrow(error);
    expect(() => ex.setStyle(el, '', '')).toThrow(error);
    expect(() => ex.insertBefore(el, el)).toThrow(error);
    expect(() => ex.appendChild(el, el)).toThrow(error);
    expect(() => ex.callCallback(() => {console.log(0)})).toThrow(error);
});

it('InstantExecutor', function () {
    const ex = new InstantExecutor;
    const el = page.window.document.body;

    ex.addClass(el, 'test');
    expect(el.className).toBe('test');

    ex.removeClass(el, 'test');
    expect(el.className).toBe('');

    ex.setAttribute(el, 'data-test', 'test');
    expect(el.dataset.test).toBe('test');

    ex.removeAttribute(el, 'data-test');
    expect(el.dataset.test).toBeUndefined();

    ex.setStyle(el, 'display', 'none');
    expect(el.style.display).toBe('none');

    const n1 = new page.window.Text('1');
    const n2 = new page.window.Text('2');

    el.innerHTML = '';
    ex.appendChild(el, n2);
    expect(el.innerHTML.trim()).toBe('2');

    expect(() => ex.insertBefore(n1, n2)).toThrow("internal-error");

    ex.insertBefore(n2, n1);
    expect(el.innerHTML).toBe('12');

    let i = 0;
    ex.callCallback(() => {
        i = 1;
    });
    expect(i).toBe(1);
});

it('TimeoutExecutor', function (done) {
    const ex = new TimeoutExecutor;
    const el = page.window.document.body;

    ex.addClass(el, 'test');
    expect(el.className).toBe('');

    setTimeout(() => {
        expect(el.className).toBe('test');

        ex.removeClass(el, 'test');
        expect(el.className).toBe('test');

        setTimeout(() => {
            expect(el.className).toBe('')
        }, 0);
    }, 0);


    ex.setAttribute(el, 'data-test', 'test');
    expect(el.dataset.test).toBeUndefined();

    setTimeout(() => {
        expect(el.dataset.test).toBe('test');

        ex.removeAttribute(el, 'data-test');
        expect(el.dataset.test).toBe('test');

        setTimeout(() => {
            expect(el.dataset.test).toBeUndefined();
        }, 0);
    }, 0);


    ex.setStyle(el, 'display', 'none');
    setTimeout(() => {
        expect(el.style.display).toBe('none');
    }, 0);

    const n1 = new page.window.Text('1');
    const n2 = new page.window.Text('2');

    el.innerHTML = '';
    ex.appendChild(el, n2);

    setTimeout(() => {
        expect(el.innerHTML.trim()).toBe('2');

        ex.insertBefore(n2, n1);
        setTimeout(() => {
            expect(el.innerHTML).toBe('12');
        }, 0);
    }, 0);


    let i = 0;
    ex.callCallback(() => {
        i = 1;
    });
    expect(i).toBe(0);

    setTimeout(() => {
        expect(i).toBe(1);
    });

    setTimeout(() => {
        setTimeout(() => {
            setTimeout(() => {
                done();
            }, 0);
        }, 0);
    }, 0);
});
