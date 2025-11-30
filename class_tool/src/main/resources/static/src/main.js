// main.js (UMD global) - with router guard and global auth handler
(function () {
    if (!window.Vue || !window.VueRouter) {
        console.error('Vue and VueRouter are required');
        return;
    }
    const { createApp, reactive } = window.Vue;
    const { createRouter, createWebHashHistory } = window.VueRouter;

    const store = reactive({
        apiBase: window.API_BASE || 'http://localhost:8089/cloudClassroom/api',
        user: null
    });

    if (window.ApiCore) {
        window.ApiCore.setBaseURL(store.apiBase);
    }
    if (window.UserService) {
        window.UserService.init(store.apiBase);
    }

    window.onApiAuthFailed = function (status, resp) {
        try {
            if (window.UserService && typeof window.UserService.logout === 'function') {
                window.UserService.logout();
            }
        } catch (e) {}
        store.user = null;
        location.hash = '#/login';
    };

    const LoginPage = window.LoginPageComponent || { template: '<div>Login component missing</div>' };
    const HomePage = window.HomePageComponent || { template: '<div>Home component missing</div>' };
    const ProfilePage = window.ProfilePageComponent || { template: '<div>Profile component missing</div>' };

    const routes = [
        { path: '/', redirect: '/login' },
        { path: '/login', component: LoginPage, props: { store } },
        { path: '/dashboard', component: HomePage, props: { store }, meta: { requiresAuth: true } },
        { path: '/profile', component: ProfilePage, props: { store }, meta: { requiresAuth: true } }
    ];

    const router = createRouter({
        history: createWebHashHistory(),
        routes
    });

    router.beforeEach((to, from, next) => {
        if (to.meta && to.meta.requiresAuth) {
            if (store.user) return next();
            const token = window.ApiCore ? window.ApiCore.getToken() : null;
            if (!token) return next('/login');
            if (window.UserService && typeof window.UserService.getUserInfo === 'function') {
                window.UserService.getUserInfo()
                    .then(payload => {
                        if (payload && payload.data) {
                            store.user = payload.data;
                            try {
                                const t = window.ApiCore.getToken();
                                if (t) store.user.token = t;
                            } catch (e) {}
                            next();
                        } else if (payload && payload.code === 0 && payload.data) {
                            store.user = payload.data;
                            try {
                                const t = window.ApiCore.getToken();
                                if (t) store.user.token = t;
                            } catch (e) {}
                            next();
                        } else {
                            next('/login');
                        }
                    })
                    .catch(err => {
                        console.warn('router.beforeEach: getUserInfo failed', err);
                        next('/login');
                    });
            } else {
                next('/login');
            }
        } else {
            next();
        }
    });

    const app = createApp({ template: '<router-view />' });
    app.provide('store', store);
    app.use(router);
    app.mount('#app');

    // Expose store for debugging
    window.__APP_STORE__ = store;
    console.info('App started. API base =', store.apiBase);

    // NOTE: 不再在这里自动 mountHeader，改为各页面按需挂载。
})();