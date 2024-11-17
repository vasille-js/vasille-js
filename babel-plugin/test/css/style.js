import { webStyleSheet } from "vasille-css";
export const styles = webStyleSheet({
  c1: [".{}{margin:0px;padding:10px 5px;display:block}"],
  c2: [".{}:hover{margin:0px;padding:10px 5px;display:block}"],
  c3: ["@media (max-width: 1000px){.{}:active{margin:0px;padding:10px 5px;display:block}}"],
  c4: [[1, ".{}{margin:10px}"], [2, ".{}{margin:20px}"], [3, ".{}{margin:40px}"]],
  c5: [[1, ".{}{padding:10px 5px}"], [2, ".{}{padding:10px 5px}"], [3, ".{}{padding:50px 45px}"]],
  c6: [[4, ".{}{color:#222}"], [5, ".{}{color:#fff}"]],
  c7: [".{}{background:#fff}", ".dark .{}{background:#000}"],
  c8: ["body.red .{}{color:#f00}", "body.green .{}{color:#0f0}", "body.blue .{}{color:#00f}"],
  c9: [".{}{display:block;display:flex}"]
});