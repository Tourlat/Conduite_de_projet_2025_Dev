import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import axios from "axios";
import authStore from "./stores/authStore";
import router from "./router/routes";

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons'


library.add(faAngleLeft)

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


const app = createApp(App).component('font-awesome-icon', FontAwesomeIcon);


app.use(router);

app.mount("#app");
authStore.init();
