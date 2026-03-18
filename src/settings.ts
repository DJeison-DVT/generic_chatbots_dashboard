const apiBaseUrl = import.meta.env.VITE_REACT_APP_API_URL;

const normalizedBase = (apiBaseUrl.startsWith('http') ? apiBaseUrl : `https://${apiBaseUrl}`).replace(/\/+$/, '');

const settings = {
	apiUrl: normalizedBase,
	tokenName: import.meta.env.VITE_REACT_APP_TOKEN_NAME,
	bucketURL: import.meta.env.VITE_REACT_APP_BUCKET_URL,
};

export default settings;
