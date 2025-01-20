export async function loadRoutes() {
  const routeFiles = [
    'news',
    // Add more route names here
  ]

  const routes = []

  for (const file of routeFiles) {
    const module = await import(`../routes/${file}/${file}.js`)
    routes.push({
      path: `/${file}`,
      router: new module.default(),
    })
  }

  return routes
}
