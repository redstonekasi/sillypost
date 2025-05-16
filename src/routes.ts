export type Route = RegExp;

function compileRoute(source: string) {
	const normalized = source.replace(/\/+(\/|$)/g, "$1");
	const regex = new RegExp(`^${
		normalized
			.replace(/(\/)?:(\w+)/g, "(?:$1(?:[^/]+?))") // param
			.replace(/(\/)?\*/g, "($1.*)?") // wildcard
	}/*$`);
	return regex;
}

export const GLOBAL = compileRoute("/*");

export const INDEX = compileRoute("/");
export const OWN_PROFILE = compileRoute("/profile");
export const USER_PROFILE = compileRoute("/user/:user");
export const GROUP_FEED = compileRoute("/group/:group/feed");
export const SETTINGS = compileRoute("/settings");
