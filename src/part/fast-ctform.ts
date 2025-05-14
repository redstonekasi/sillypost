import { watch } from "../watcher";

export default () =>
	watch(".ctform", (el) => {
		const form = <HTMLFormElement> el;
		const [btn] = form.getElementsByTagName("button");
		const [span] = form.getElementsByTagName("span");

		form.addEventListener("submit", async (ev) => {
			ev.stopImmediatePropagation();
			ev.preventDefault();
			if (btn.disabled) return;
			btn.disabled = true;

			const original = span.innerText;
			span.innerText = (+original + 1).toString();
			span.dataset.scIgnore = "meow";
			const res = await fetch(form.action, { method: "POST" });
			if (!res.ok) {
				span.innerText = original;
				btn.disabled = false;
			}
		});
	});
