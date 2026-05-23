import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import VERIS from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <VERIS />
  </StrictMode>
);
