
const API_BASE =
    import.meta.env.VITE_API_URL || "http://localhost:8080";

// Backend API endpoints
export const endpoints = {
    register: "/api/auth/register",
    login: "/api/auth/login",
    me: "/api/auth/me",

    categories: "/api/categories",
    transactions: "/api/transactions",
    budgets: "/api/budgets",
    dashboard: "/api/dashboard"
};

// JWT token storage
const TOKEN_KEY = "bf_token";

export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
    if (token) {
        localStorage.setItem(TOKEN_KEY, token);
    } else {
        localStorage.removeItem(TOKEN_KEY);
    }
}

// Common API function
export async function api(path, options = {}) {
    const token = getToken();

    const headers = {
        ...(options.body !== undefined
            ? { "Content-Type": "application/json" }
            : {}),
        ...(options.headers || {})
    };

    // Attach JWT for authenticated requests
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${path}`, {
        method: options.method || "GET",
        headers,
        ...(options.body !== undefined
            ? {
                body:
                    typeof options.body === "string"
                        ? options.body
                        : JSON.stringify(options.body)
            }
            : {})
    });

    // Read the response safely
    const responseText = await response.text();

    let data = null;

    if (responseText) {
        try {
            data = JSON.parse(responseText);
        } catch {
            data = responseText;
        }
    }

    // Handle API errors
    if (!response.ok) {
        const message =
            (data &&
                typeof data === "object" &&
                (data.message || data.error)) ||
            `HTTP ${response.status}`;

        throw new Error(message);
    }

    return data;
}

// Convert API responses to arrays
export function listOf(value, key) {
    if (Array.isArray(value)) {
        return value;
    }

    if (key && Array.isArray(value?.[key])) {
        return value[key];
    }

    if (Array.isArray(value?.content)) {
        return value.content;
    }

    if (Array.isArray(value?.data)) {
        return value.data;
    }

    return [];
}

// Format money in Indian Rupees
export function money(value) {
    const amount = Number(value) || 0;

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// Get today's date in YYYY-MM-DD format
export function today() {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}
