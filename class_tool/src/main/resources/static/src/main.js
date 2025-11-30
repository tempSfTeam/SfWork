// main.js (UMD global) - with router guard and global auth handler
// Updated: added /courses route (CoursesPageComponent) and kept header mount per-page (no global mount)
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

    // Ensure ApiCore/UserService know the base early (if present)
    if (window.ApiCore) {
        window.ApiCore.setBaseURL(store.apiBase);
    }
    if (window.UserService) {
        window.UserService.init(store.apiBase);
    }

    // Global auth-failed handler (called by ApiCore when it sees 401/403)
    window.onApiAuthFailed = function (status, resp) {
        try {
            if (window.UserService && typeof window.UserService.logout === 'function') {
                window.UserService.logout();
            }
        } catch (e) {}
        store.user = null;
        // Redirect to login route
        location.hash = '#/login';
    };

    // Pages (UMD global components expected to be loaded before this script runs)
    const LoginPage = window.LoginPageComponent || { template: '<div>Login component missing</div>' };
    const HomePage = window.HomePageComponent || { template: '<div>Home component missing</div>' };
    const ProfilePage = window.ProfilePageComponent || { template: '<div>Profile component missing</div>' };
    const CoursesPage = window.CoursesPageComponent || { template: '<div>Courses component missing</div>' };

    const routes = [
        { path: '/', redirect: '/login' },
        { path: '/login', component: LoginPage, props: { store } },

        // Authenticated routes
        { path: '/dashboard', component: HomePage, props: { store }, meta: { requiresAuth: true } },
        { path: '/profile', component: ProfilePage, props: { store }, meta: { requiresAuth: true } },
        { path: '/courses', component: CoursesPage, props: { store }, meta: { requiresAuth: true } }
    ];

    const router = createRouter({
        history: createWebHashHistory(),
        routes
    });

    // Router guard: if route requires auth, check store.user or token
    router.beforeEach((to, from, next) => {
        if (to.meta && to.meta.requiresAuth) {
            // already have user in store -> proceed
            if (store.user) return next();

            // try token from ApiCore
            const token = window.ApiCore ? window.ApiCore.getToken() : null;
            if (!token) {
                // no token, redirect to login
                return next('/login');
            }

            // try fetch user info
            if (window.UserService && typeof window.UserService.getUserInfo === 'function') {
                window.UserService.getUserInfo()
                    .then(payload => {
                        if (payload && payload.data) {
                            store.user = payload.data;
                            // copy token into store.user for convenience
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
                            // cannot get user, redirect
                            next('/login');
                        }
                    })
                    .catch(err => {
                        console.warn('router.beforeEach: getUserInfo failed', err);
                        next('/login');
                    });
            } else {
                // no user service, redirect to login
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

    // Expose store globally for debugging
    window.__APP_STORE__ = store;
    console.info('App started. API base =', store.apiBase);

    // NOTE:
    // - HeaderBar is mounted on-demand by pages that need it (HomePage, CoursesPage, ProfilePage).
    // - Do not mount the header globally here to keep LoginPage clean.
})();