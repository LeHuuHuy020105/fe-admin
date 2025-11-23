import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

document.documentElement.classList.add("light");
createRoot(document.getElementById("root")!).render(<App />);
