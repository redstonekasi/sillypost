export class Semaphore {
	private queue: Function[] = [];
	private lock = false;

	acquire(): Promise<void> {
		if (!this.lock) {
			this.lock = true;
			return Promise.resolve();
		} else {
			return new Promise((resolve) => this.queue.push(resolve));
		}
	}

	release(): void {
		const resolve = this.queue.shift();

		if (resolve) {
			setTimeout(resolve, 0);
		} else {
			this.lock = false;
		}
	}

	async request<T>(fn: Function): Promise<T> {
		try {
			await this.acquire();
			return await fn();
		} finally {
			this.release();
		}
	}
}
