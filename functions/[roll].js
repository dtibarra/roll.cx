/*addEventListener("fetch", (event) => {
    event.respondWith(
      handleRequest(event.request).catch(
        (err) => new Response(err.stack, { status: 500 })
      )
    );
  });
  
  
  async function handleRequest(request) {
    const { pathname } = new URL(request.url);
    const result = pathname.match(/d([0-9]+)/)
    if (result) {
      return new Response((Math.floor(Math.random() * result[1]))+1); 
    }
  }
  */
  export async function onRequest(context) {
    // Contents of context object
    const {
      request, // same as existing Worker API
      env, // same as existing Worker API
      params, // if filename includes [id] or [[path]]
      waitUntil, // same as ctx.waitUntil in existing Worker API
      next, // used for middleware or to fetch assets
      data, // arbitrary space for passing data between middlewares
    } = context;
  
    return new Response("Hello, world: " + params.roll);
  }
  