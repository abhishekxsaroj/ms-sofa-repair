import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import App from "./App";
import { loadAnalytics } from "./lib/analytics";
import "./index.css";

gsap.registerPlugin(ScrollTrigger);
loadAnalytics();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
