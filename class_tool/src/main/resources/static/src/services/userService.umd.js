// window.UserService (UMD) - user related API functions
// 放置路径: src/main/resources/static/src/services/userService.umd.js
(function () {
    if (!window.ApiCore) {
        console.error('ApiCore is required for UserService');
        return;
    }

    const ApiCore = window.ApiCore;

    const UserService = {
        // init with api base if needed
        init(apiBase) {
            if (apiBase) ApiCore.setBaseURL(apiBase);
        },

        // GET /user/getVerifyCode
        async getVerifyCode() {
            try {
                const res = await ApiCore.get('/user/getVerifyCode');
                return res.data;
            } catch (e) {
                console.error('getVerifyCode error', e);
                throw e;
            }
        },

        // POST /user/login  body: { name, password, uncheckedCode?, uuid? }
        async login(body) {
            try {
                const res = await ApiCore.post('/user/login', body);
                // backend returns Msg object: { code, message, data }
                const payload = res.data;
                // ---- token extraction ----
                let token;
                if (payload && payload.data) {
                    const data = payload.data;
                    token = data.token || data.tokenStr || data.stpToken || data.authorization || data.Authorization || data.accessToken || data.access_token;
                }
                // also check response headers for Authorization
                if (!token && res && res.headers) {
                    let h = res.headers.authorization || res.headers.Authorization || res.headers['x-authorization'];
                    if (h) {
                        // header may be "Bearer <token>"
                        if (typeof h === 'string' && h.toLowerCase().startsWith('bearer ')) {
                            token = h.substring(7);
                        } else {
                            token = h;
                        }
                    }
                }
                // if token found, store raw token and ApiCore will attach "Bearer " prefix on requests
                if (token) {
                    ApiCore.setToken(token);
                }
                return payload;
            } catch (e) {
                console.error('login error', e);
                throw e;
            }
        },

        // GET /user/getUserInfo  (if your backend has a different path adjust)
        // This will send Authorization header automatically via ApiCore interceptors
        async getUserInfo() {
            try {
                const res = await ApiCore.get('/user/getUserInfo');
                return res.data;
            } catch (e) {
                console.warn('getUserInfo error', e);
                throw e;
            }
        },

        // Call server logout endpoint then clear token (bind to /user/logout)
        async logoutServer() {
            try {
                // try call backend logout to invalidate server session/token
                await ApiCore.post('/user/logout');
            } catch (e) {
                // ignore server error but still clear local token
                console.warn('logoutServer failed', e);
            } finally {
                try { ApiCore.setToken(null); } catch(e){}
            }
        },

        // Local-only logout (clear token)
        logout() {
            try {
                ApiCore.setToken(null);
            } catch (e) {}
        }
    };

    window.UserService = UserService;
})();