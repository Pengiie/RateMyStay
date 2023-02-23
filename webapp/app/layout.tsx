import { AppType } from "next/app";
import "./styles/globals.css";
import { TRPCClientProvider } from "./trpc";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <TRPCClientProvider>
            <html className="font-display text-secondary-900">
                <head>
                    <title>My App</title>
                </head>
                <body>{children}</body>
            </html>
        </TRPCClientProvider>
    );
}
