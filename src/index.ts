import { defineOptionalPart, definePart, executeAllParts } from "./part";
import fastCtform from "./part/fast-ctform";
import fastSubmit from "./part/fast-submit";
import localDates from "./part/local-dates";
import settings from "./part/settings";
import updatePage from "./part/update-page";
import * as r from "./routes";

// All pages that have posts in them
const WITH_POSTS = [
	r.INDEX,
	r.OWN_PROFILE,
	r.USER_PROFILE,
	r.GROUP_FEED,
];

defineOptionalPart("fastCtform", fastCtform, WITH_POSTS);
defineOptionalPart("localDates", localDates, WITH_POSTS);
defineOptionalPart("fastSubmit", fastSubmit, [r.INDEX, r.GROUP_FEED]);
defineOptionalPart("updatePage", updatePage, [r.GLOBAL]);

definePart(settings, [r.SETTINGS]);

executeAllParts();
