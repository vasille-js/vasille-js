import { screen } from "vasille-web";

const MainScreen = screen(async props => {
  const x = props.query.x;
});

MainScreen({
  query: { x: ["x"] },
  path: "",
  params: { x: "x" },
  url: "",
  hash: "",
}) satisfies Promise<void>;
