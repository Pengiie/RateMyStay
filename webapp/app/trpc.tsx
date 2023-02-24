"use client";

import { createTRPCProxyClient } from "@trpc/client";
import { inferRouterOutputs } from "@trpc/server";
import { createTRPCReact, httpBatchLink, loggerLink } from "@trpc/react-query";
import { useState } from "react";
import type { AppRouter } from "../src/server/api/root";
import superjson from "superjson";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const getBaseUrl = () => {
    if (typeof window !== "undefined") return ""; // browser should use relative url
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
    return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

export const trpc = createTRPCReact<AppRouter>({
    
});

export const trpcClient = createTRPCProxyClient<AppRouter>({
    transformer: superjson,
    links: [
        httpBatchLink({
            url: `${getBaseUrl()}/api/trpc`,
        })
    ]
})

export const TRPCClientProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [queryClient] = useState(() => new QueryClient());
    const [trpcClient] = useState(() => 
        trpc.createClient({
            transformer: superjson,
            links: [
                loggerLink({
                  enabled: (opts) =>
                    process.env.NODE_ENV === "development" ||
                    (opts.direction === "down" && opts.result instanceof Error),
                }),
                httpBatchLink({
                  url: `${getBaseUrl()}/api/trpc`,
                }),
              ],
        })
    );
    return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </trpc.Provider>
    );
};

export type RouterOutput = inferRouterOutputs<AppRouter>;