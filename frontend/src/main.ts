import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import axios from "axios";
import authStore from "./stores/authStore";
import router from "./router/routes";

axios.defaults.baseURL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

const app = createApp(App);

authStore.init();

app.use(router);

app.mount("#app");
