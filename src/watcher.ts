type WatcherCallback = (element: HTMLElement, unwatch: () => void) => unknown;
// selector, callback
type Watcher = [string, WatcherCallback, () => void];
const watchers = new Set<Watcher>();

export function watch(selector: string, callback: WatcherCallback) {
	let entry: Watcher;
	const unwatch = () => watchers.delete(entry);

	entry = [selector, callback, unwatch];
	watchers.add(entry);

	for (const el of document.querySelectorAll(selector)) {
		if (el instanceof HTMLElement) callback(el, unwatch);
	}

	return unwatch;
}

new MutationObserver((records) => {
	for (const record of records) {
		const target = record.target;
		if (!(target instanceof HTMLElement)) continue;
		for (const watcher of watchers) {
			if (target.matches(watcher[0])) {
				watcher[1](target, watcher[2]);
			}
			for (const el of target.querySelectorAll(watcher[0])) {
				if (el instanceof HTMLElement) watcher[1](el, watcher[2]);
			}
		}
	}
}).observe(document.documentElement, {
	subtree: true,
	childList: true,
});
