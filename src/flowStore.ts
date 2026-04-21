const STORAGE_KEY = 'selected_flow';

export const flowStore = {
	getSelectedFlow(): string | null {
		return localStorage.getItem(STORAGE_KEY);
	},

	setSelectedFlow(flowName: string) {
		localStorage.setItem(STORAGE_KEY, flowName);
	},

	clear() {
		localStorage.removeItem(STORAGE_KEY);
	},
};
