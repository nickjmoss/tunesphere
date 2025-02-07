import { createApp, markRaw } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './index.routes.ts';

import './styles/index.scss';

const pinia = createPinia();
pinia.use(({ store }) => {
    store.$router = markRaw(router);
});

// Create App
const app = createApp(App).use(router).use(pinia);

app.config.globalProperties.window = window;
app.config.globalProperties.document = document;
app.mount('#app');
