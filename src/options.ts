export const options = {
	fastCtform: ["Improved :3 button handling", true],
	fastSubmit: ["Improved post submission", true],
	localDates: ["Local timestamps", true],
	updatePage: ["Update page content automatically", true],
} as const;

export type OptionId = keyof typeof options;

export const optionIds = Object.keys(options) as unknown as OptionId[];
export const getOptionLabel = (name: OptionId) => options[name][0];
export const getOptionValue = (name: OptionId): boolean => {
	const item = localStorage.getItem(`sc_${name}`);
	return item ? JSON.parse(item) : options[name][1];
};
export const setOptionValue = (name: OptionId, value: boolean) =>
	localStorage.setItem(`sc_${name}`, JSON.stringify(value));
