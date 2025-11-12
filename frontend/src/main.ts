import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import axios from "axios";
import authStore from "./stores/authStore";
import router from "./router/routes";

axios.defaults.baseURL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401 ) {
      const data = error.response.data;
      if (data && data.error === "TokenExpired") {
        authStore.logout();
        router.push('/auth');
      }
    }
    return Promise.reject(error);
  }
);


const app = createApp(App);


app.use(router);

app.mount("#app");
authStore.init();
