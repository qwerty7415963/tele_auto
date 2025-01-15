export async function loadRoutes() {
    const routeFiles = [
        'user',
        // Add more route names here
    ];

    const routes = [];
    
    for (const file of routeFiles) {
        const module = await import(`../routes/${file}.js`);
        routes.push({
            path: `/${file}`,
            router: new module.default()
        });
    }
    
    return routes;
}