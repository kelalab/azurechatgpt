import React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import "../kds/dist/css/themes/kela-fonts.min.css";
import "../kds/dist/css/themes/kela.min.css";
import "../kds/dist/css/reset.min.css";
import "../kds/dist/css/global.min.css";
import "../kds/dist/css/components.min.css";
import "../kds/dist/css/utils.min.css";
//import "../kds/dist/esm/index";

import "./index.css";
import Select from "./routes/select";
import Chat from "./routes/chat";
import NewChat from "./routes/newchat";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement!);

const router = createBrowserRouter([
  
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
  {
    path: "/",
    element: <Select />,
  },
]);

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
