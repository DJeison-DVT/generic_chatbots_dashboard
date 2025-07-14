const apiBaseUrl = import.meta.env.VITE_REACT_APP_API_URL;

const settings = {
	apiUrl: apiBaseUrl.startsWith('http') ? apiBaseUrl : `https://${apiBaseUrl}`,
	participationsURL: 'api/participations/',
	tokenName: import.meta.env.VITE_REACT_APP_TOKEN_NAME,
	bucketURL: import.meta.env.VITE_REACT_APP_BUCKET_URL,
};

export default settings;
