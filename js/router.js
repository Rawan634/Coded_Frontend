// Hash router: #/teacher/cgv → the view registered for "/teacher/cgv".
const routes = new Map();

export function registerRoute(path, render) {
  routes.set(path, render);
}

export function currentPath() {
  return window.location.hash.slice(1).split("?")[0] || "/";
}

export function navigate(path) {
  window.location.hash = path.startsWith("#") ? path : `#${path}`;
}

export function renderRoute() {
  const render = routes.get(currentPath()) || routes.get("/");
  return render();
}

export function startRouter(render) {
  window.addEventListener("hashchange", () => { render(); window.scrollTo(0, 0); });
  render();
}
