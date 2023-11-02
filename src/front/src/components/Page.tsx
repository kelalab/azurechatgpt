import type { PropsWithChildren } from "react";

const Page = ({ children }: PropsWithChildren) => {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <title></title>
        <meta
          name="description"
          content="Test app built with Bun, Elysia & React"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="/public/index.css" />
      </head>
      <body>{children}</body>
    </html>
  );
};

export default Page;
