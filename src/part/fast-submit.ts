import { watch } from "../watcher";

const errors = new Map([
	["1", "sketch too large!"],
	["2", "failed to upload sketch!"],
	["3", "no content!"],
	["4", "content too long!!"],
]);

const parser = new DOMParser();

export default () =>
	watch("#new-post", (el, unwatch) => {
		const form = el as HTMLFormElement;
		const input = <HTMLInputElement> document.getElementById("content");
		input.addEventListener("keydown", (ev) => {
			if (!(ev.key === "Enter" && (ev.metaKey || ev.ctrlKey))) return;
			form.requestSubmit();
		});

		form.addEventListener("submit", async (ev) => {
			ev.preventDefault();
			const body = new FormData(form);
			for (const el of form.elements) el.setAttribute("disabled", "");

			try {
				const res = await fetch(form.action, {
					method: "POST",
					body,
				});

				if (res.ok) {
					const url = new URL(res.url);
					if (url.searchParams.has("error")) {
						// quick path
						const id = url.searchParams.get("error")!;
						const msg = errors.get(id)
							?? parser.parseFromString(await res.text(), "text/html")
								.getElementById("error")!.innerText;
						return alert(msg);
					}

					form.reset();
					setTimeout(() => input.focus());
				} else {
					console.log("failed to send post", res);
					alert(`failed to send post, ${res.status} ${res.statusText}`);
				}
			} finally {
				for (const el of form.elements) el.removeAttribute("disabled");
			}
		});

		unwatch();
	});
