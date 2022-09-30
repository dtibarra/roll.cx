const { unstable_dev } = require("wrangler");

describe("Worker", () => {
	let worker;

	beforeAll(async () => {
		worker = await unstable_dev(
			"src/index.js",
			{},
			{ disableExperimentalWarning: true }
		);
	});

	afterAll(async () => {
		await worker.stop();
	});
	it("should return a 200 status code for a dice roll", async () => {
		const response = await worker.fetch("/d20");
		expect(response.status).toBe(200);
	});
	it("should return an expected format for a d20 roll", async () => {
		const response = await worker.fetch("/d20");
		const result = await response.text();
		expect(result).toMatch(/^d20: [0-9]+$/);
	});

	it("should return home page", async () => {
		const resp = await worker.fetch();
		if (resp) {
			const text = await resp.text();
			expect(text).toMatchInlineSnapshot(`
"
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
  "
`);
		}
	});
});
