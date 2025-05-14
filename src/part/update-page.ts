import morph from "micromorph";
import { watch } from "../watcher";

const parser = new DOMParser();

const ids = [
	"navbar",
	"header-right", // header stats
	"sillymarket-area", // home
	// directory/leaderboard/groups
	"directory",
	"directory-pagination",
	// mail
	"incoming",
	"mail-pagination",
	"stats", // skillboard
];

const id = (el: HTMLElement) => (el.getElementsByClassName("ctform")[0] as HTMLFormElement).action.split("/").at(-1);

let currentPosts: HTMLElement | null;
let elements: HTMLElement[];

function reconcilePosts(doc: Document) {
	const updatedPosts = doc.getElementById("posts");
	if (currentPosts && updatedPosts) {
		const lastPost = <HTMLElement> currentPosts.children[0];
		if (!lastPost) return;
		const lastId = id(lastPost);

		const n: HTMLElement[] = [];
		for (const post of updatedPosts.children as HTMLCollectionOf<HTMLElement>) {
			if (id(post) == lastId) break;
			n.push(post);
		}

		if (n.length) {
			currentPosts.prepend(...n);
			console.debug("[update-page]", "new posts", n.length, n);
		}

		for (let i = 0; i < currentPosts.children.length; i++) {
			const current = currentPosts.children[i + n.length];
			const updated = updatedPosts.children[i];
			if (!updated) continue;

			const [currentCt] = current.getElementsByClassName("post-author-colonthree") as HTMLCollectionOf<HTMLElement>;
			const [updatedCt] = updated.getElementsByClassName("post-author-colonthree") as HTMLCollectionOf<HTMLElement>;

			if ("scIgnore" in currentCt.dataset) {
				delete currentCt.dataset.scIgnore;
				continue;
			}

			if (currentCt.textContent !== updatedCt.textContent) {
				currentCt.textContent = updatedCt.textContent;
			}
		}
	}
}

async function update() {
	const doc = await fetch(location.href)
		.then((r) => r.text())
		.then((t) => parser.parseFromString(t, "text/html"));

	// Posts can't be part of this since they're influenced by local-dates
	await Promise.all(elements.map((el) =>
		morph(el, doc.getElementById(el.id)!)
			.catch((e) => console.warn("[update-page] failed to patch", el, e))
	));

	// Manual reconciliation for posts
	reconcilePosts(doc);
	setTimeout(update, 2000);
}

export default () =>
	watch("body", (_, unwatch) => {
		elements = ids.map((i) => document.getElementById(i))
			.filter((e) => e !== null);
		currentPosts = document.getElementById("posts");

		setTimeout(update, 2000);

		unwatch();
	});
