/* eslint-disable @typescript-eslint/no-explicit-any */
import {toast} from "sonner";

interface RequestOptions {
    method?: string
    url: string
    body?: object
    headers?: object
    params?: URLSearchParams
    suppressErrors?: number[]
}

export async function makeRequest<T = any>(params: RequestOptions): Promise<{ status: number; data: T | null }> {
    params.suppressErrors = params.suppressErrors || [];
    let url = params.url;

    if (params.params) {
        url += "?" + params.params.toString();
    }

    const r = await fetch(url, {
        method: params.method || "GET",
        body: params.body ? JSON.stringify(params.body) : undefined,
        headers: {
            ...(params.body ? { "Content-Type": "application/json" } : {}),
            ...(params.headers ? params.headers : {}),
        },
        credentials: "include", // ensures cookies are sent
    });

    if (r.status !== 200 && !params.suppressErrors.includes(r.status) && r.status !== 500) {
        let data: any
        try {
            data = await r.json();
        } catch {
            data = null;
        }
        toast.error("Error " + r.status, {description: data?.error || "An error occurred"});
        return { status: r.status, data: data as unknown as T };
    }

    if (r.status === 500) {
        let data: any;

        try {
            data = await r.json();
        } catch {
            data = null;
        }

        const description =
            typeof data === "object" && data !== null && "error" in data
                ? (data.error as string)
                : typeof data === "string"
                    ? data
                    : "Unexpected server error";

        toast.error("Error 500", { description });

        return { status: r.status, data: data as T };
    }

    let data: T | null;
    try {
        data = await r.json();
    } catch {
        data = null;
    }

    return { status: r.status, data };
}
