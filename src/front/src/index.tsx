import React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import "./index.css";
import App from "./App";
import Select from "./routes/select";
import Chat from "./routes/chat";
import NewChat from "./routes/newchat";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement!);

const router = createBrowserRouter([
  {
    path: "/",
    element: <Select />,
  },
  {
    path: "select",
    element: <Select />,
  },
  {
    path: "chat/new",
    element: <NewChat />,
  },
  {
    path: "chat/:chatid",
    element: <Chat />,
  },
]);

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
