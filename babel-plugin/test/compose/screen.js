import { screen } from "vasille-web";
const MainScreen = screen(async (Vasille, props) => {
  const x = props.query.x;
}, "MainScreen");
MainScreen({
  query: {
    x: ["x"]
  },
  path: "",
  params: {
    x: "x"
  },
  url: "",
  hash: ""
});
