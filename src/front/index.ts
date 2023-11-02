import { Elysia } from "elysia";
import { html } from "@elysiajs/html";
import { staticPlugin } from "@elysiajs/static";
import { createElement } from "react";
import { renderToReadableStream } from "react-dom/server";
import App from "./src/App";
const port = 8080;
const backend_url = "http://127.0.0.1:8000";

await Bun.build({
  entrypoints: ["./src/index.tsx"],
  outdir: "./public",
});

new Elysia()
  .use(html())
  .use(staticPlugin())
  .post("/message", async (req) => {
    console.log("/message", req.query["message"]);
    const response = await fetch(
      `${backend_url}/message?message=${req.query["message"]}`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      }
    );
    const json = await response.json();
    return json;
  })
  .get("/", async () => {
    console.log("root handler");
    const app = createElement(App);

    // render the app component to a readable stream
    const stream = await renderToReadableStream(app, {
      bootstrapScripts: ["/public/index.js"],
    });

    // output the stream as the response
    return new Response(stream, {
      headers: { "Content-Type": "text/html" },
    });
  })
  .listen(port);
