// LoginPage (UMD) - 使用 window.UserService（已存在）进行 login & getUserInfo
(function () {
    const LoginPage = {
        props: ['store'],
        data() {
            return {
                name: '',
                password: '',
                verifyInput: '',
                verifyMap: null,   // 保存后端返回的验证码数据对象或 base64 字符串
                verifyHint: '',
                loading: false,
                message: '',
                uuid: ''          // 每次 getVerifyCode 返回的 uuid，要随 login 一起发
            };
        },
        async created() {
            // 初始化 Api/UserService base
            console.debug('[LoginPage] created hook run');
            if (window.ApiCore && this.store && this.store.apiBase) {
                window.ApiCore.setBaseURL(this.store.apiBase);
            }
            if (window.UserService && this.store && this.store.apiBase) {
                window.UserService.init(this.store.apiBase);
            }
            // expose instance for debugging
            try { window.__LOGIN_PAGE__ = this; } catch (e) {}
            await this.fetchVerifyCode();
        },
        computed: {
            verifyImageSrc() {
                if (!this.verifyMap) return '';
                const v = this.verifyMap;
                if (typeof v === 'string') {
                    if (v.startsWith('data:')) return v;
                    return 'data:image/png;base64,' + v;
                }
                if (v && typeof v === 'object') {
                    if (typeof v.image === 'string') {
                        return v.image.startsWith('data:') ? v.image : 'data:image/png;base64,' + v.image;
                    }
                    if (typeof v.img === 'string') {
                        return v.img.startsWith('data:') ? v.img : 'data:image/png;base64,' + v.img;
                    }
                    if (typeof v.base64 === 'string') {
                        return 'data:image/png;base64,' + v.base64;
                    }
                    if (typeof v.data === 'string') {
                        return v.data.startsWith('data:') ? v.data : 'data:image/png;base64,' + v.data;
                    }
                }
                return '';
            }
        },
        methods: {
            arrayBufferToBase64(buffer) {
                let binary = '';
                const bytes = new Uint8Array(buffer);
                const len = bytes.byteLength;
                for (let i = 0; i < len; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }
                try {
                    return window.btoa(binary);
                } catch (e) {
                    // chunked fallback
                    let chunk = '';
                    const CHUNK = 0x8000;
                    let ret = '';
                    for (let i = 0; i < len; i += CHUNK) {
                        chunk = String.fromCharCode.apply(null, bytes.subarray(i, Math.min(i + CHUNK, len)));
                        ret += window.btoa(chunk);
                    }
                    return ret;
                }
            },

            // 强化的 fetchVerifyCode：有多个 fallback，并大量日志，暴露实例便于排错
            async fetchVerifyCode() {
                this.verifyMap = null;
                this.verifyHint = '';
                this.uuid = '';
                console.debug('[LoginPage] fetchVerifyCode start', {
                    hasUserService: !!(window.UserService && typeof window.UserService.getVerifyCode === 'function'),
                    hasApiCore: !!(window.ApiCore && typeof window.ApiCore.get === 'function'),
                    hasAxios: !!window.axios,
                    storeApiBase: this.store && this.store.apiBase
                });

                try {
                    let res;
                    // 1) 首先尝试 UserService.getVerifyCode()
                    if (window.UserService && typeof window.UserService.getVerifyCode === 'function') {
                        try {
                            res = await window.UserService.getVerifyCode();
                            console.debug('[LoginPage] userService.getVerifyCode returned', res);
                        } catch (e) {
                            console.warn('[LoginPage] UserService.getVerifyCode failed, will fallback', e);
                            res = undefined;
                        }
                    }

                    // 2) 如果没有结果，再尝试 ApiCore.get
                    if (res === undefined && window.ApiCore && typeof window.ApiCore.get === 'function') {
                        try {
                            res = await window.ApiCore.get('/user/getVerifyCode');
                            console.debug('[LoginPage] ApiCore.get returned', res);
                        } catch (e) {
                            console.warn('[LoginPage] ApiCore.get failed, will fallback', e);
                            res = undefined;
                        }
                    }

                    // 3) 最后直接用 axios（拼接 store.apiBase）
                    if (res === undefined && window.axios) {
                        try {
                            const base = (this.store && this.store.apiBase) ? this.store.apiBase.replace(/\/+$/, '') : '';
                            const url = (base ? base : '') + '/user/getVerifyCode';
                            console.debug('[LoginPage] axios fallback url=', url);
                            res = await window.axios.get(url, { responseType: 'json' });
                            console.debug('[LoginPage] axios.get returned', res);
                        } catch (e) {
                            console.warn('[LoginPage] axios.get fallback failed', e);
                            throw e; // no more fallback
                        }
                    }

                    if (!res) {
                        throw new Error('No response from getVerifyCode (no UserService/ApiCore/axios succeeded)');
                    }

                    // normalize response: axios returns object with data; UserService may return payload directly
                    let payload = res;
                    if (res && res.data !== undefined) payload = res.data;

                    // If binary ArrayBuffer returned (res.data is arraybuffer handled earlier), handle it
                    if (payload instanceof ArrayBuffer) {
                        const b64 = this.arrayBufferToBase64(payload);
                        this.verifyMap = b64;
                        this.verifyHint = '验证码已获取（点击图片可刷新）';
                        console.debug('[LoginPage] getVerifyCode: payload is ArrayBuffer');
                        return;
                    }

                    // If payload.data is ArrayBuffer (some wrappers)
                    if (payload && payload.data instanceof ArrayBuffer) {
                        const b64 = this.arrayBufferToBase64(payload.data);
                        this.verifyMap = b64;
                        this.verifyHint = '验证码已获取（点击图片可刷新）';
                        console.debug('[LoginPage] getVerifyCode: payload.data is ArrayBuffer');
                        return;
                    }

                    // 普通 JSON / string 情形
                    let v = (payload && payload.data !== undefined) ? payload.data : payload;
                    this.verifyMap = v;

                    // extract uuid from common keys
                    if (v && typeof v === 'object') {
                        this.uuid = v.uuid || v.uuidStr || v.id || v.uuid_code || v.codeUuid || '';
                    } else if (payload && payload.uuid) {
                        this.uuid = payload.uuid;
                    } else if (payload && payload.data && payload.data.uuid) {
                        this.uuid = payload.data.uuid;
                    }

                    console.debug('[LoginPage] verifyMap set, uuid=', this.uuid, 'verifyMap=', this.verifyMap);
                    this.verifyHint = '验证码已获取（点击图片可刷新）';
                } catch (err) {
                    this.verifyHint = '获取验证码失败';
                    console.error('[LoginPage] fetchVerifyCode error', err);
                }
            },

            async submitLogin() {
                this.message = '';
                if (!this.name || !this.password) {
                    this.message = '请输入用户名和密码';
                    return;
                }
                if (!this.verifyInput || !this.verifyInput.toString().trim()) {
                    this.message = '请输入验证码';
                    return;
                }

                this.loading = true;
                try {
                    const body = {
                        name: this.name,
                        password: this.password,
                        uncheckedCode: this.verifyInput,
                        uuid: this.uuid || undefined
                    };
                    console.debug('[LoginPage] submitLogin body=', body);
                    const payload = await window.UserService.login(body);
                    console.debug('[LoginPage] login payload=', payload);
                    if (payload && (payload.code === 0 || payload.code === undefined || payload.code === 200)) {
                        // 成功后调用 getUserInfo 并把用户存入 store.user（使用 UserService.getUserInfo）
                        try {
                            const infoPayload = await window.UserService.getUserInfo();
                            console.debug('[LoginPage] getUserInfo payload=', infoPayload);
                            let userObj = null;
                            if (infoPayload && infoPayload.data) userObj = infoPayload.data;
                            else if (infoPayload && infoPayload.code === 0 && infoPayload.data) userObj = infoPayload.data;
                            else userObj = payload.data || { name: this.name };

                            // 将用户对象存入 store.user（可以包含 token 信息）
                            // 同时将已保存到 ApiCore/localStorage 的 token 放进 store.user.token 以便页面层访问
                            this.store.user = userObj || {};
                            try {
                                if (window.ApiCore && typeof window.ApiCore.getToken === 'function') {
                                    const tok = window.ApiCore.getToken();
                                    if (tok) this.store.user.token = tok;
                                }
                            } catch (e) {}
                        } catch (e) {
                            console.warn('[LoginPage] getUserInfo failed after login', e);
                            this.store.user = payload.data || { name: this.name };
                            try {
                                if (window.ApiCore && typeof window.ApiCore.getToken === 'function') {
                                    const tok = window.ApiCore.getToken();
                                    if (tok) this.store.user.token = tok;
                                }
                            } catch (e) {}
                        }
                        this.message = '登录成功';
                        this.$router.push('/dashboard');
                    } else {
                        this.message = (payload && (payload.message || payload.msg)) || '登录失败';
                        await this.fetchVerifyCode();
                    }
                } catch (e) {
                    console.error('[LoginPage] login exception', e);
                    this.message = '登录请求失败: ' + (e.response && e.response.data ? JSON.stringify(e.response.data) : e.message || e);
                    await this.fetchVerifyCode();
                } finally {
                    this.loading = false;
                }
            }
        },
        template: `
      <div class="card">
        <h2 class="center">系统登录</h2>

        <form @submit.prevent="submitLogin" style="display:flex;flex-direction:column;gap:12px">
          <label>用户名
            <input v-model="name" placeholder="用户名" />
          </label>

          <label>密码
            <input v-model="password" type="password" placeholder="密码" />
          </label>

          <div>
            <div style="display:flex;gap:8px;align-items:center">
              <input v-model="verifyInput" placeholder="验证码" />
              <button type="button" @click="fetchVerifyCode" style="width:150px">刷新验证码</button>
            </div>

            <div v-if="verifyImageSrc" style="margin-top:8px;display:flex;align-items:center;gap:12px">
              <div class="muted">点击图片可刷新：</div>
              <img :src="verifyImageSrc" alt="验证码" style="height:60px;cursor:pointer;border:1px solid #ddd;padding:4px;border-radius:6px" @click="fetchVerifyCode" />
            </div>

            <div v-else-if="verifyMap" style="margin-top:8px">
              <div class="muted">验证码返回（调试视图，后端未返回可识别图片）：</div>
              <pre>{{ verifyMap }}</pre>
            </div>

            <div v-if="verifyHint" class="muted" style="margin-top:6px">{{ verifyHint }}</div>
          </div>

          <div style="display:flex;gap:8px">
            <button type="submit" :disabled="loading">{{ loading ? '登录中...' : '登录' }}</button>
          </div>

          <div v-if="message" :style="{ color: message.includes('成功') ? 'green' : 'red' }">{{ message }}</div>
        </form>
      </div>
    `
    };

    window.LoginPageComponent = LoginPage;
})();