import { getOptionLabel, getOptionValue, optionIds, setOptionValue } from "../options";
import { watch } from "../watcher";

const checkboxHandler = (ev: MouseEvent) => {
	const el = ev.target as HTMLInputElement;
	// @ts-ignore
	setOptionValue(el.id, el.checked);
};

export default () =>
	watch("#main", (el, unwatch) => {
		const settings = document.createElement("div");
		settings.style = "margin-top:2em;display:grid;;grid-template-columns:1fr max-content;gap:.5em";
		el.appendChild(settings);

		for (const id of optionIds) {
			const label = <HTMLLabelElement> document.createElement("label");
			label.htmlFor = id;
			label.textContent = getOptionLabel(id);
			const input = <HTMLInputElement> document.createElement("input");
			input.id = id;
			input.type = "checkbox";
			input.checked = getOptionValue(id);
			input.addEventListener("click", checkboxHandler);
			settings.append(label, input);
		}

		unwatch();
	});
