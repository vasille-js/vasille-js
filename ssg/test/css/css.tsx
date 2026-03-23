import {
    laptop,
    mobile,
    page,
    prefersDark,
    prefersLight,
    styleSheet,
    tablet,
    setLaptopMaxWidth,
    setMobileMaxWidth,
    setTabletMaxWidth,
} from "steel-frame";

setMobileMaxWidth(200);
setTabletMaxWidth(400);
setLaptopMaxWidth(800);

export default page(async () => {
    <div class={[styles.div]}>Styled</div>;
});

const styles = styleSheet({
    div: {
        width: ["100%", laptop("90%"), tablet("75%"), mobile("50%")],
        color: ["red", prefersDark("blue"), prefersLight("green")],
    },
});
