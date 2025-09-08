export const API_BASE_URL = 'http://127.0.0.1:8000';

async function handleResponse<T>(res: Response): Promise<T> {
	if (!res.ok) {
		const text = await res.text();
		throw new Error(text || `HTTP ${res.status}`);
	}
	return res.json() as Promise<T>;
}

export const api = {
	get: async <T>(path: string) => handleResponse<T>(await fetch(`${API_BASE_URL}${path}`)),
	post: async <T>(path: string, body: unknown) => handleResponse<T>(await fetch(`${API_BASE_URL}${path}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	}))
};


