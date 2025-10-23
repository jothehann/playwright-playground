import { APIRequestContext, APIResponse } from '@playwright/test';

const DEFAULT_BASE_API = 'https://conduit-api.bondaracademy.com/api';

function resolveBaseApi(override?: string) {
    return override || process.env.BASE_API || DEFAULT_BASE_API;
}

export class ApiHelper {
    // Login helper that returns the token string (and sets ACCESS_TOKEN env if desired)
    static async loginAndGetToken(request: APIRequestContext, email: string, password: string, baseApi?: string): Promise<string> {
        const res = await ApiHelper.apiRequest(request, 'POST', '/users/login', { user: { email, password } }, baseApi);
        const body = await res.json();
        const token = body?.user?.token;
        if (token) process.env['ACCESS_TOKEN'] = token;
        return token;
    }

    // Generic request method that routes to the proper HTTP helper
    static async apiRequest(
        request: APIRequestContext,
        method: string,
        path: string,
        data?: any,
        baseApi?: string,
        params?: Record<string, string | number>,
        headers?: Record<string, string>
    ) {
        const m = method.toUpperCase();
        // attach headers only where supported by underlying helpers
        switch (m) {
            case 'GET':
                return ApiHelper.apiGet(request, path, baseApi, params);
            case 'POST':
                if (headers) return request.post(`${resolveBaseApi(baseApi)}${path}`, { data, headers });
                return ApiHelper.apiPost(request, path, data, baseApi);
            case 'PUT':
                if (headers) return request.put(`${resolveBaseApi(baseApi)}${path}`, { data, headers });
                return ApiHelper.apiPut(request, path, data, baseApi);
            case 'PATCH':
                if (headers) return request.patch(`${resolveBaseApi(baseApi)}${path}`, { data, headers });
                // fallback to calling request.patch directly
                return request.patch(`${resolveBaseApi(baseApi)}${path}`, data ? { data } : undefined);
            case 'DELETE':
                if (headers) return request.delete(`${resolveBaseApi(baseApi)}${path}`, { headers });
                return ApiHelper.apiDelete(request, path, baseApi);
            default:
                // For any other methods, try to call the generic request method on the context
                // Build url and options
                const api = resolveBaseApi(baseApi);
                const query = params ? `?${new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]))}` : '';
                const url = `${api}${path}${query}`;
                const opts: any = {};
                if (data) opts.data = data;
                if (headers) opts.headers = headers;
                // @ts-ignore - dynamic method call on APIRequestContext
                if (typeof (request as any)[m.toLowerCase()] === 'function') {
                    return (request as any)[m.toLowerCase()](url, opts);
                }
                // final fallback to request.fetch if available
                // @ts-ignore
                if (typeof (request as any).fetch === 'function') return (request as any).fetch(url, { method: m, ...opts });
                throw new Error(`HTTP method ${m} is not supported by the request context`);
        }
    }

    // Generic convenience methods
    static async apiGet(request: APIRequestContext, path: string, baseApi?: string, params?: Record<string, string | number>) {
        const api = resolveBaseApi(baseApi);
        const query = params ? `?${new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]))}` : '';
        return request.get(`${api}${path}${query}`);
    }

    static async apiPost(request: APIRequestContext, path: string, data?: any, baseApi?: string) {
        const api = resolveBaseApi(baseApi);
        return request.post(`${api}${path}`, data ? { data } : undefined);
    }

    static async apiPut(request: APIRequestContext, path: string, data?: any, baseApi?: string) {
        const api = resolveBaseApi(baseApi);
        return request.put(`${api}${path}`, data ? { data } : undefined);
    }

    static async apiDelete(request: APIRequestContext, path: string, baseApi?: string) {
        const api = resolveBaseApi(baseApi);
        return request.delete(`${api}${path}`);
    }

    // Return auth headers object for a token (token can be passed or read from env)
    static authHeaders(token?: string) {
        const t = token || process.env.ACCESS_TOKEN;
        if (!t) throw new Error('No token available for authenticated request. Provide token or set ACCESS_TOKEN env var.');
        return { Authorization: `Token ${t}` };
    }

    // Authenticated convenience methods that attach Authorization header per-request
    static async apiAuthGet(request: APIRequestContext, path: string, token?: string, baseApi?: string, params?: Record<string, string | number>) {
        const api = resolveBaseApi(baseApi);
        const query = params ? `?${new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]))}` : '';
        return request.get(`${api}${path}${query}`, { headers: ApiHelper.authHeaders(token) });
    }

    static async apiAuthPost(request: APIRequestContext, path: string, data?: any, token?: string, baseApi?: string) {
        const api = resolveBaseApi(baseApi);
        return request.post(`${api}${path}`, data ? { data, headers: ApiHelper.authHeaders(token) } : { headers: ApiHelper.authHeaders(token) });
    }

    static async apiAuthPut(request: APIRequestContext, path: string, data?: any, token?: string, baseApi?: string) {
        const api = resolveBaseApi(baseApi);
        return request.put(`${api}${path}`, data ? { data, headers: ApiHelper.authHeaders(token) } : { headers: ApiHelper.authHeaders(token) });
    }

    static async apiAuthDelete(request: APIRequestContext, path: string, token?: string, baseApi?: string) {
        const api = resolveBaseApi(baseApi);
        return request.delete(`${api}${path}`, { headers: ApiHelper.authHeaders(token) });
    }

    // Short alias names for convenience (http-prefixed to avoid reserved-word collisions)
    static async httpGet(request: APIRequestContext, path: string, baseApi?: string, params?: Record<string, string | number>) {
        return ApiHelper.apiGet(request, path, baseApi, params);
    }

    static async httpPost(request: APIRequestContext, path: string, data?: any, baseApi?: string) {
        return ApiHelper.apiPost(request, path, data, baseApi);
    }

    static async httpPut(request: APIRequestContext, path: string, data?: any, baseApi?: string) {
        return ApiHelper.apiPut(request, path, data, baseApi);
    }

    static async httpDelete(request: APIRequestContext, path: string, baseApi?: string) {
        return ApiHelper.apiDelete(request, path, baseApi);
    }

    // Short aliases for auth variants (http-prefixed)
    static async httpAuthGet(request: APIRequestContext, path: string, token?: string, baseApi?: string, params?: Record<string, string | number>) {
        return ApiHelper.apiAuthGet(request, path, token, baseApi, params);
    }

    static async httpAuthPost(request: APIRequestContext, path: string, data?: any, token?: string, baseApi?: string) {
        return ApiHelper.apiAuthPost(request, path, data, token, baseApi);
    }

    static async httpAuthPut(request: APIRequestContext, path: string, data?: any, token?: string, baseApi?: string) {
        return ApiHelper.apiAuthPut(request, path, data, token, baseApi);
    }

    static async httpAuthDelete(request: APIRequestContext, path: string, token?: string, baseApi?: string) {
        return ApiHelper.apiAuthDelete(request, path, token, baseApi);
    }
}
