import { page } from "steel-frame";

export default page(async () => {
    <ul>
        <li>Item 1</li>
        <li>Item 2</li>
    </ul>;
    <ol>
        <li>Item 1</li>
        <li>Item 2</li>
    </ol>;
    <dl>
        <dt>Term 1</dt>
        <dd>Definition 1</dd>
        <dt>Term 2</dt>
        <dd>Definition 2</dd>
    </dl>;
    <ol>
        <li>
            <input type="checkbox" /> Item 1
        </li>
        <li>
            <input type="checkbox" checked /> Item 2
        </li>
    </ol>;
});
