import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import axios from "axios";

axios.defaults.baseURL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

createApp(App).mount("#app");
