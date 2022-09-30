/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npx wrangler dev src/index.js` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npx wrangler publish src/index.js --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

//Event listener https://developers.cloudflare.com/workers/runtime-apis/add-event-listener/
addEventListener("fetch", (event) => {
  event.respondWith(
    handleRequest(event.request).catch(
      (err) => new Response(err.stack, { status: 500 })
    )
  );
});

//Roll the type and number of dice according to the roll request string
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
// Serialize for browsers
async function serializeResultsForBrowser(results) {
  let stringResponse = "";
  for (const result of results) {
    stringResponse += `${result.roll}: ${result.result.join(' + ')}`;
    stringResponse += ` = ${result.result.reduce((a, b) => a + b, 0)}`;
    stringResponse += `\n`;
  }
  return stringResponse.replace(/\n$/g, '');
}
// Serialize for terminals
async function serializeResultsForTerminal(results) {
  let stringResponse = "";
  for (const result of results) {
    stringResponse += '\033[33m' + `${result.roll}` + '\033[39m:\033[35m ' + `${result.result.join(' + ')}` + '\033[39m';
    stringResponse += ' = \033[32m' + `${result.result.reduce((a, b) => a + b, 0)}` + '\033[39m';
    stringResponse += `\n`;
  }
  return stringResponse.replace(/\n$/g, '');
}
// Serialize for JSON
async function serializeResultsForJSON(results) {
  return JSON.stringify(results);
}

// handle the dice rolling based on the raw roll string (path, with the leading '/' removed)
async function handleDiceRoll(request, rawRoll) {
  const requestedRolls = rawRoll.split(',');
  let results = []

  // roll the bones, store into `results`
  for (const requestedRoll of requestedRolls) {
    const result = await diceResult(requestedRoll);
    if (result) {
      results.push({roll: requestedRoll, result: result});
    }
  }
  let stringResponse = "";
  const maybeUserAgentHeader = request.headers.get('User-Agent');
  const maybeContentTypeHeader = request.headers.get('Content-Type');
  if (maybeContentTypeHeader && maybeContentTypeHeader.includes('application/json')) {
    stringResponse = await serializeResultsForJSON(results);
  } else if (maybeUserAgentHeader && maybeUserAgentHeader.includes('curl')) {
    stringResponse = await serializeResultsForTerminal(results);
  } else {
    stringResponse = await serializeResultsForBrowser(results);
  }

  // serialize `results` to string
  return new Response(stringResponse);
}

// url router
async function handleRequest(request) {
  const { pathname } = new URL(request.url);
  const pathMatch = pathname.match(/^\/([a-z0-9].+)/)
  if (pathMatch) {
    return handleDiceRoll(request, pathMatch[1]);
  } else {
    return handleHomePage(request);
  }
}
// home page
async function handleHomePage(request) {
  return new Response(`
<!DOCTYPE html>
<html lang="en">

<head>
    <title>Roll.cx</title>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/light.min.css"></head>
<style>
.row {
  display: flex;
  flex-wrap: wrap;
  align-items: right;
  justify-content: space-between;
}</style>

<body>
    <div class="row">
        <a href="https://github.com/dtibarra/roll.cx" target="_blank" rel="noopener">
        <svg height="32" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="32" data-view-component="true" class="octicon octicon-mark-github v-align-middle">
            <path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
        </svg>
        </a>
    </div>

    <h1>Roll.cx: A Simple Dice Roller</h1>
    <p>Roll.cx is a simple dice roller. You can use it like so:</p>
    <pre><code>$ curl roll.cx/d20
d20: 1</code></pre>

    <p>If you want to rull multiple die at once, you can do something like this:</p>
    <pre><code>$ curl roll.cx/2d20,1d6
2d20: 12 + 9 = 21
1d6: 1</code></pre>
    <p>If you want something a little more machine readable, try passing a different content type:</p>
    <pre><code>$ curl -H "Content-Type: application/json" roll.cx/3d20,2d6,1d12
[{"roll":"3d20","result":[4,18,14]},{"roll":"2d6","result":[5,4]},{"roll":"1d12","result":[1]}]</code></pre>
<footer>Made by <a href="https://twitter.com/dtibarra">@dtibarra</a></footer>
</body>

</html>
  `, {
    headers: {
      'content-type': 'text/html;charset=UTF-8',
    },
  });
}
