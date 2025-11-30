// window.ApiCore - axios wrapper (UMD)
// 放置路径: src/main/resources/static/src/services/api.umd.js
(function () {
    // 依赖全局 axios（index.html 需先引入 axios CDN）
    if (!window.axios) {
        console.error('axios is required for ApiCore');
        return;
    }

    const ApiCore = (function () {
        // 默认 API base（和后端 context-path 对应）
        const DEFAULT_BASE = (window.API_BASE || 'http://localhost:8089/cloudClassroom/api').replace(/\/+$/, '');

        // axios 实例
        const instance = window.axios.create({
            baseURL: DEFAULT_BASE,
            timeout: 15000,
            withCredentials: true
        });

        // 安全读取 localStorage（防止 Tracking Prevention 抛异常）
        function safeGetStorage(key) {
            try {
                return localStorage.getItem(key);
            } catch (e) {
                // 浏览器可能阻止 third-party storage，降级为 undefined
                console.warn('localStorage read blocked:', e && e.message);
                return null;
            }
        }
        function safeSetStorage(key, val) {
            try {
                localStorage.setItem(key, val);
            } catch (e) {
                console.warn('localStorage write blocked:', e && e.message);
            }
        }
        function safeRemoveStorage(key) {
            try {
                localStorage.removeItem(key);
            } catch (e) {
                console.warn('localStorage remove blocked:', e && e.message);
            }
        }

        // attach token if present (uses Bearer <token> format)
        function attachTokenToAxios() {
            const token = safeGetStorage('sf_token'); // raw token
            if (token && instance.defaults) {
                instance.defaults.headers.common['Authorization'] = 'Bearer ' + token;
            }
        }
        attachTokenToAxios();

        // Request interceptor: attach token just before request (in case changed)
        instance.interceptors.request.use(function (config) {
            try {
                const t = safeGetStorage('sf_token');
                if (t) {
                    config.headers = config.headers || {};
                    config.headers['Authorization'] = 'Bearer ' + t;
                }
            } catch (e) { /* ignore */ }
            return config;
        }, function (error) {
            return Promise.reject(error);
        });

        // Response interceptor: uniform error handling
        instance.interceptors.response.use(function (response) {
            // If backend uses {code, message, data} style, normal handling happens in services
            return response;
        }, function (error) {
            // Network / server error
            if (error && error.response) {
                const status = error.response.status;
                // handle auth errors centrally
                if (status === 401 || status === 403) {
                    // emit a global event or call a handler
                    if (window.onApiAuthFailed) {
                        try { window.onApiAuthFailed(status, error.response); } catch (e) {}
                    } else {
                        // default: remove token and reload to login
                        safeRemoveStorage('sf_token');
                        try { delete instance.defaults.headers.common['Authorization']; } catch (e) {}
                        console.warn('Auth failed, token cleared');
                    }
                }
            }
            return Promise.reject(error);
        });

        return {
            instance,
            setBaseURL(url) {
                instance.defaults.baseURL = (url || DEFAULT_BASE).replace(/\/+$/, '');
            },
            // token: raw token string (no "Bearer " prefix). ApiCore will send "Bearer <token>"
            setToken(token) {
                if (token) {
                    safeSetStorage('sf_token', token);
                    instance.defaults.headers = instance.defaults.headers || {};
                    instance.defaults.headers.common = instance.defaults.headers.common || {};
                    instance.defaults.headers.common['Authorization'] = 'Bearer ' + token;
                } else {
                    safeRemoveStorage('sf_token');
                    try {
                        if (instance.defaults && instance.defaults.headers && instance.defaults.headers.common) {
                            delete instance.defaults.headers.common['Authorization'];
                        }
                    } catch (e) {}
                }
            },
            getToken() {
                return safeGetStorage('sf_token');
            },
            get(url, config) { return instance.get(url, config); },
            post(url, data, config) { return instance.post(url, data, config); },
            put(url, data, config) { return instance.put(url, data, config); },
            delete(url, config) { return instance.delete(url, config); },
            axiosInstance: instance
        };
    })();

    window.ApiCore = ApiCore;
})();