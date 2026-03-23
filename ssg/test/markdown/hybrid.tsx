import { page } from "steel-frame";

export default page(async () => {
    <h1>Heading</h1>;
    <h2>
        <span style="color: red">Heading</span>
    </h2>;
    <h3>Heading</h3>;
    <h4>Heading</h4>;
    <br />;
    <h5>Heading</h5>;
    <br />;
    <h6>Heading</h6>;
    <input type="text" value={"Hello"} />;
});
