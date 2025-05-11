class Semaphore {
	private queue_: Function[] = [];
	private lock_ = false;

	acquire(): Promise<void> {
		if (!this.lock_) {
			this.lock_ = true;
			return Promise.resolve();
		} else {
			return new Promise((resolve) => this.queue_.push(resolve));
		}
	}

	release(): void {
		const resolve = this.queue_.shift();

		if (resolve) {
			setTimeout(resolve, 0);
		} else {
			this.lock_ = false;
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

export { Semaphore };
