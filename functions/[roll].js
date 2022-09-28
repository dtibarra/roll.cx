
  async function diceResult(roll) {
    const { pathname } = new URL(request.url);
    const result = pathname.match(/d([0-9]+)/)
    if (result) {
      return (Math.floor(Math.random() * result[1]))+1;
    }
  }

  export async function onRequest(context) {
    try{
    // Contents of context object
    const {
      request, // same as existing Worker API
      env, // same as existing Worker API
      params, // if filename includes [id] or [[path]]
      waitUntil, // same as ctx.waitUntil in existing Worker API
      next, // used for middleware or to fetch assets
      data, // arbitrary space for passing data between middlewares
    } = context;

    const requestedRolls = params.roll.split(',');
    let results = []

    // roll the bones
    for (const requestedRoll of requestedRolls) {
      const result = await diceResult(requestedRoll);
      if (result) {
        results.push({roll: requestedRoll, result: result});
      }
    }

    // serialize to string

    let stringResponse = "";
    for (const result of results) {
      stringResponse += `${result.roll}: ${result.result}\n`;
    }

    return new Response(stringResponse);
    } catch (e) {
      return new Response(`${e.message}\n${e.stack}`, { status: 500 });
    }
  }
  