// @ts-check
import * as esbuild from "esbuild";

const meta = `
// ==UserScript==
// @name        sillypost userscript
// @description automatic timeline updating, and more soon:tm:
// @version     0.1.8
// @match       https://sillypost.net/
// @homepageURL https://github.com/redstonekasi/sillypost
// @downloadURL https://things.k6.tf/sillypost.user.js
// ==/UserScript==
`.trim();

const dev = process.argv.includes("--dev");
const out = "./dist/sillypost.user.js";

const ctx = await esbuild.context({
	entryPoints: ["./src/index.ts"],
	outfile: out,
	minify: true,
	bundle: true,
	loader: { ".css": "text" },
	legalComments: "none",
	banner: { js: meta },
	logLevel: "info",
});

if (dev) {
	await ctx.watch();
	await ctx.serve({
		host: "::1",
		port: 8080,
	});
} else {
	await ctx.rebuild();
	await ctx.dispose();
}
