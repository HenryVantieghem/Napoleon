'use client';
export default function GlobalError({ error }: { error: Error }) {
  return (
    <html>
      <body className="p-8">
        <h2>Something went wrong.</h2>
        <pre className="mt-2 text-xs opacity-70">{error.message}</pre>
      </body>
    </html>
  );
}


