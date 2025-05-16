import { watch } from "../watcher";

const utcRegex = /(\d{4})-(\d{2})-(\d{2}) \(UTC(\d{2}):(\d{2})\)/;
const formatter = new Intl.DateTimeFormat(undefined, {
	dateStyle: "short",
	timeStyle: "short",
});

export default () =>
	watch(".post-date", (el) => {
		const match = el.textContent?.match(utcRegex);
		if (!match) return;
		const [, year, month, day, hour, minute] = match;
		const date = Date.UTC(+year, +month - 1, +day, +hour, +minute);
		el.textContent = formatter.format(date);
	});
