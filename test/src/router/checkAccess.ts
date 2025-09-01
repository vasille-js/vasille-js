export default function checkAccess(path: string) {
  return path !== "/private";
}
