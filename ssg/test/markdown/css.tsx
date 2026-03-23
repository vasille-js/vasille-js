import { page, styleSheet } from "steel-frame";

export default page(async () => {
    <div class={styles.div}>Test</div>;
});

const styles = styleSheet({
    div: {
        color: "red",
    },
});
