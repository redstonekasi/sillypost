import { watch } from "../watcher";

export default () =>
	watch(".ctform", (el) => {
		const form = <HTMLFormElement> el;
		const [btn] = form.getElementsByTagName("button");
		const [span] = form.getElementsByTagName("span");

		// TODO: pause update-page until this submit is done, otherwise it might update in between
		form.addEventListener("submit", async (ev) => {
			ev.stopImmediatePropagation();
			ev.preventDefault();
			if (btn.disabled) return;
			btn.disabled = true;

			const original = span.innerText;
			span.innerText = (+original + 1).toString();
			const res = await fetch(form.action, { method: "POST" });
			if (!res.ok) {
				span.innerText = original;
				btn.disabled = false;
			}
		});
	});
