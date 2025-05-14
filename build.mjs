import * as esbuild from "esbuild";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";

// Sometimes I really hate esbuild.

const metadata = (file) => ({
	name: "metadata",
	setup(build) {
		build.initialOptions.write = false;

		build.onResolve({
			filter: new RegExp(RegExp.escape(build.initialOptions.entryPoints[0])),
		}, (args) => {
			if (args.kind !== "entry-point") return;
			return {
				path: path.resolve(args.resolveDir, args.path),
				watchFiles: [file],
			};
		});

		build.onEnd(async (res) => {
			if (res?.outputFiles > 1) throw new Error("userscript may not emit multiple files");
			const out = res.outputFiles?.[0];
			if (!out?.contents) return;

			const meta = await fs.readFile(file);
			out.contents = Buffer.concat([meta, out.contents]);

			await fs.mkdir(path.dirname(out.path), { recursive: true });
			await fs.writeFile(out.path, out.contents);
		});
	},
});

const serve = (port, location) => ({
	name: "serve",
	setup(build) {
		if (!dev) return;

		let buffer;
		const server = http.createServer((req, res) => {
			if (req.url != location) {
				res.writeHead(307, { location });
				return res.end();
			}

			res.writeHead(200, {
				"content-length": buffer.length,
				"content-type": "text/javascript",
			});
			res.end(buffer);
		});

		server.listen(port, "::1");

		build.onEnd((res) => {
			const out = res.outputFiles?.[0];
			if (!out?.contents) return;
			buffer = out.contents;
		});
	},
});

const dev = process.argv.includes("--dev");

const ctx = await esbuild.context({
	entryPoints: ["./src/index.ts"],
	outfile: "./dist/sillyscript.user.js",
	bundle: true,
	minify: true,
	plugins: [
		metadata("metadata.txt"),
		serve(8080, "/sillyscript.user.js"),
	],
});

if (dev) {
	await ctx.watch();
	console.log(" > \x1b[36mhttp://[::1]:8080/sillyscript.user.js\x1b[39m");
} else {
	await ctx.rebuild();
	await ctx.dispose();
}
