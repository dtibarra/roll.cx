
  async function diceResult(requestedRoll) {
    const result = requestedRoll.match(/([0-9]+)?d([0-9]+)/)
    let rollResults = [];
    if (result) {
      // If no number of dice is specified, default to 1
      let numberOfRolls = result[1] ? result[1] : 1;
      for (let i = 0; i < numberOfRolls; i++) {
        rollResults.push((Math.floor(Math.random() * result[2]))+1);
      }
    }
    return rollResults;
  }

  async function serializeResultsForBrowser(results) {
    let stringResponse = "";
    for (const result of results) {
      stringResponse += `${result.roll}: ${result.result.join(' + ')}\n`;
    }
    return stringResponse;
  }
  async function serializeResultsForTerminal(results) {
    let stringResponse = "";
    const resetCode = '\033[0m';
    for (const result of results) {
      stringResponse += `${result.roll}: ${result.result.join(' + ')}\n`;
    }
    return stringResponse;
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

    // roll the bones, store into `results`
    for (const requestedRoll of requestedRolls) {
      const result = await diceResult(requestedRoll);
      if (result) {
        results.push({roll: requestedRoll, result: result});
      }
    }
    let stringResponse = "";
    if (request.headers.get('User-Agent').includes('curl')) {
      stringResponse = await serializeResultsForTerminal(results);
    } else {
      stringResponse = await serializeResultsForBrowser(results);
    }

    // serialize `results` to string
    return new Response(stringResponse);
    } catch (e) {
      return new Response(`${e.message}\n${e.stack}`, { status: 500 });
    }
  }
  