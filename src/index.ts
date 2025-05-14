import { definePart, executeAllParts } from "./part";
import fastCtform from "./part/fast-ctform";
import fastSubmit from "./part/fast-submit";
import localDates from "./part/local-dates";
import updatePage from "./part/update-page";
import * as r from "./routes";

// All pages that have posts in them
const WITH_POSTS = [
	r.INDEX,
	r.OWN_PROFILE,
	r.USER_PROFILE,
	r.GROUP_FEED,
];

definePart(WITH_POSTS, fastCtform);
definePart(WITH_POSTS, localDates);
definePart([r.INDEX, r.GROUP_FEED], fastSubmit);
definePart([r.GLOBAL], updatePage);

executeAllParts();
