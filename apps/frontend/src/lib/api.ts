export const API_URL = "http://localhost:8000/api"

async function request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem("token")
    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }

    const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers })

    if (res.status === 401) {
        // localStorage.removeItem("token")
        // window.location.href = "/login"
        // return
        console.warn("Auth bypass active - ignored 401")
    }

    if (!res.ok) {
        const error = await res.json()
        throw new Error(error.detail || "An error occurred")
    }

    return res.json()
}

export const api = {
    get: (endpoint: string, options: any = {}) => request(endpoint, { method: "GET", ...options }),
    post: (endpoint: string, body: any) => request(endpoint, { method: "POST", body: JSON.stringify(body) }),
    patch: (endpoint: string, body: any) => request(endpoint, { method: "PATCH", body: JSON.stringify(body) }),
    delete: (endpoint: string) => request(endpoint, { method: "DELETE" }),
}
