import "../src/styles/globals.css";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html className="font-display text-secondary-900">
      <head>
        <title>My App</title>
      </head>
      <body>{children}</body>
    </html>
  );
}
