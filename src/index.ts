import { Semaphore } from "./semaphore";

const updateClickHandlers = (forms: Iterable<HTMLFormElement>) => {
	for (const form of forms) {
		form.onsubmit = async (e) => {
			e.preventDefault();
			const count = form.getElementsByTagName("span")[0];
			const button = form.getElementsByTagName("button")[0];
			if (!button.disabled) {
				// Make reactions work instantly
				const oldText = count.innerText;
				button.disabled = true;
				count.innerText = (+oldText + 1).toString();
				const res = await fetch(form.action, { method: "POST" });
				if (!res.ok) {
					button.disabled = false;
					count.innerText = oldText;
				}
			}
		};
	}
};

const parser = new DOMParser();
const postsContainer = document.getElementById("posts")!;

const getPosts = (doc: Document) => doc.querySelectorAll(".post");
const getId = (post: Element) => post.querySelector<HTMLFormElement>(".ctform")!.action.split("/").at(-1);

const semaphore = new Semaphore();

const updateTimeline = async (doc?: Document) => {
	if (!doc) {
		const raw = await fetch("/").then((r) => r.text());
		doc = parser.parseFromString(raw, "text/html");
	}

	let offset = 0;

	// Prepend new posts
	const existingPosts = Array.from(getPosts(document));
	const updatedPosts = Array.from(getPosts(doc));
	const lastCurrentPost = getId(existingPosts[0]);
	if (lastCurrentPost != getId(updatedPosts[0])) {
		const until = updatedPosts.findIndex((p) => getId(p) == lastCurrentPost);

		const newPosts = updatedPosts.slice(0, until);
		postsContainer.prepend(...newPosts);
		// Add click handlers to new posts
		updateClickHandlers(newPosts.map((e) => e.querySelector<HTMLFormElement>(".ctform")!));
		offset = newPosts.length;
	}

	// Update silly counters
	for (let i = 0; i < existingPosts.length; i++) {
		const existingPost = existingPosts[i];
		const updatedPost = updatedPosts[i + offset];
		if (!updatedPost) {
			// Post is rotated out of limit
			existingPost.remove();
			continue;
		}

		for (const klass of [".post-author-display-name", ".post-author-currencies", ".ctform"]) {
			existingPost.querySelector(klass)!.innerHTML = updatedPost.querySelector(klass)!.innerHTML;
		}
	}
};

// Override existing handlers with improved alternative
window.addEventListener(
	"load",
	() => updateClickHandlers(document.getElementsByClassName("ctform") as HTMLCollectionOf<HTMLFormElement>),
);

const interval = 2000;
setTimeout(async function loop() {
	await semaphore.request_(updateTimeline);
	setTimeout(loop, interval);
}, interval);

const token = <HTMLInputElement> document.getElementById("twogeneralstoken")!;
let error: HTMLDivElement | undefined;
const left = <HTMLDivElement> document.getElementById("left-side");
const form = <HTMLFormElement> document.getElementById("new-post");
const submit = form.querySelector<HTMLInputElement>("input[type=submit]")!;
submit.addEventListener("click", async (e) => {
	e.preventDefault();
	submit.disabled = true;

	try {
		await semaphore.acquire_();
		const res = await fetch(form.action, {
			method: "POST",
			body: new FormData(form),
		});

		if (res.ok) {
			const doc = parser.parseFromString(await res.text(), "text/html");
			const url = new URL(res.url);
			// Show error if available
			if (url.searchParams.has("error")) {
				if (!error) {
					error = document.createElement("div");
					error.id = "error";
					left.prepend(error);
				}
				error.innerText = doc.getElementById("error")!.innerText;
				return;
			}
			error = error?.remove() as undefined;

			// Reset form, update posts, update post token
			form.reset();
			updateTimeline(doc);
			token.value = (<HTMLInputElement> doc.getElementById("twogeneralstoken")!).value;
		}
	} finally {
		submit.disabled = false;
		semaphore.release_();
	}
});
