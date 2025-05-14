type PartExecutor = () => unknown;
const registered = new Map<RegExp, Set<PartExecutor>>();
export function definePart(routes: RegExp[], execute: PartExecutor) {
	for (const route of routes) {
		let ex = registered.get(route);
		if (!ex) {
			ex = new Set();
			registered.set(route, ex);
		}
		ex.add(execute);
	}
}

export function executeAllParts() {
	for (const [route, loaders] of registered) {
		const matches = location.pathname.match(route);
		if (!matches) continue;
		for (const execute of loaders) {
			execute();
		}
	}
}
