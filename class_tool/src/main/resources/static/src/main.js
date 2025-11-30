// main.js (UMD global) - with router guard and global auth handler
(function () {
    // require window.Vue and window.VueRouter
    if (!window.Vue || !window.VueRouter) {
        console.error('Vue and VueRouter are required');
        return;
    }
    const { createApp, reactive } = window.Vue;
    const { createRouter, createWebHashHistory } = window.VueRouter;

    // global store
    const store = reactive({
        apiBase: window.API_BASE || 'http://localhost:8089/cloudClassroom/api',
        user: null
    });

    // Make ApiCore/UserService aware of base
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
        // If using hash routing, set location.hash
        location.hash = '#/login';
    };

    // Define routes (you can add more views later)
    const LoginPage = window.LoginPageComponent || { template: '<div>Login component missing</div>' };
    const Dashboard = {
        props: ['store'],
        template: `
      <div style="max-width:1100px;margin:24px auto">
        <div class="card">
          <h3>仪表盘（示例）</h3>
          <p class="muted">当前用户：{{ store.user ? (store.user.name || store.user) : '未登录' }}</p>
          <p>这里会逐步显示实体列表与操作。</p>
          <div style="margin-top:12px">
            <button @click="logout">登出</button>
          </div>
        </div>
      </div>
    `,
        methods: {
            logout() {
                try {
                    if (window.UserService) window.UserService.logout();
                } catch (e) {}
                store.user = null;
                this.$router.push('/login');
            }
        }
    };

    const routes = [
        { path: '/', redirect: '/login' },
        { path: '/login', component: LoginPage, props: { store } },
        { path: '/dashboard', component: Dashboard, props: { store }, meta: { requiresAuth: true } }
    ];

    const router = createRouter({
        history: createWebHashHistory(),
        routes
    });

    // Router guard: if route requires auth, check store.user or token
    router.beforeEach((to, from, next) => {
        if (to.meta && to.meta.requiresAuth) {
            // if we already have user in store, proceed
            if (store.user) return next();
            // else try to get user by token (call getUserInfo)
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
                            next();
                        } else if (payload && payload.code === 0 && payload.data) {
                            store.user = payload.data;
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
                // no user service, redirect
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

    // Expose store globally for debugging (optional)
    window.__APP_STORE__ = store;
    console.info('App started. API base =', store.apiBase);
})();