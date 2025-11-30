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
            if (window.ApiCore && this.store && this.store.apiBase) {
                window.ApiCore.setBaseURL(this.store.apiBase);
            }
            if (window.UserService && this.store && this.store.apiBase) {
                window.UserService.init(this.store.apiBase);
            }
            await this.fetchVerifyCode();
        },
        computed: {
            // 计算图片 src：优先支持后端直接返回 data URI (image/png;base64,...)，
            // 否则尝试把 base64 字符串拼成 data URI
            verifyImageSrc() {
                if (!this.verifyMap) return '';
                const v = this.verifyMap;
                // 如果是 ArrayBuffer 直接转换不应该到这里（我们在 fetchVerifyCode 中已转换）
                if (typeof v === 'string') {
                    if (v.startsWith('data:')) return v;
                    return 'data:image/png;base64,' + v;
                }
                if (v && typeof v === 'object') {
                    if (v.image && typeof v.image === 'string') {
                        if (v.image.startsWith('data:')) return v.image;
                        return 'data:image/png;base64,' + v.image;
                    }
                    if (v.img && typeof v.img === 'string') {
                        if (v.img.startsWith('data:')) return v.img;
                        return 'data:image/png;base64,' + v.img;
                    }
                    if (v.base64 && typeof v.base64 === 'string') {
                        return 'data:image/png;base64,' + v.base64;
                    }
                    if (v.data && typeof v.data === 'string') {
                        if (v.data.startsWith('data:')) return v.data;
                        return 'data:image/png;base64,' + v.data;
                    }
                }
                return '';
            }
        },
        methods: {
            // helper: ArrayBuffer -> base64
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
                    // fallback for large buffers
                    let chunk = '';
                    const CHUNK_SIZE = 0x8000;
                    let ret = '';
                    for (let i = 0; i < len; i += CHUNK_SIZE) {
                        chunk = String.fromCharCode.apply(null, bytes.subarray(i, Math.min(i + CHUNK_SIZE, len)));
                        ret += window.btoa(chunk);
                    }
                    return ret;
                }
            },

            async fetchVerifyCode() {
                this.verifyMap = null;
                this.verifyHint = '';
                this.uuid = '';
                console.debug('[LoginPage] fetchVerifyCode start', {
                    hasUserService: !!(window.UserService && window.UserService.getVerifyCode),
                    hasApiCore: !!(window.ApiCore && window.ApiCore.get),
                    hasAxios: !!window.axios
                });

                try {
                    let res;
                    // Preferred: use UserService if available
                    if (window.UserService && typeof window.UserService.getVerifyCode === 'function') {
                        res = await window.UserService.getVerifyCode();
                    } else if (window.ApiCore && typeof window.ApiCore.get === 'function') {
                        // fallback to ApiCore.get; don't force responseType (backend may return JSON or base64)
                        res = await window.ApiCore.get('/user/getVerifyCode');
                    } else if (window.axios) {
                        // as last resort, call axios directly (use store.apiBase if available)
                        const base = (this.store && this.store.apiBase) ? this.store.apiBase.replace(/\/+$/, '') : '';
                        const url = (base ? base : '') + '/user/getVerifyCode';
                        res = await window.axios.get(url);
                    } else {
                        throw new Error('No method to call getVerifyCode (UserService/ApiCore/axios missing)');
                    }

                    console.debug('[LoginPage] getVerifyCode raw response', res);

                    // normalize payload (handle axios response wrapper)
                    let payload = res;
                    if (res && res.data !== undefined) payload = res.data;

                    // If backend returned binary data via axios with responseType=arraybuffer,
                    // axios puts ArrayBuffer in res.data; detect that:
                    if (payload instanceof ArrayBuffer) {
                        // convert to base64 and set as string
                        const b64 = this.arrayBufferToBase64(payload);
                        this.verifyMap = b64;
                        this.verifyHint = '验证码已获取（点击图片可刷新）';
                        // uuid can't be extracted from ArrayBuffer; expect server to provide uuid via header or earlier JSON
                        console.debug('[LoginPage] getVerifyCode: ArrayBuffer -> base64');
                        return;
                    }

                    // payload could be Blob (if some wrapper); convert if needed
                    if (payload && typeof payload === 'object' && payload.data instanceof ArrayBuffer) {
                        const b64 = this.arrayBufferToBase64(payload.data);
                        this.verifyMap = b64;
                        this.verifyHint = '验证码已获取（点击图片可刷新）';
                        return;
                    }

                    // typical case: payload is JSON or base64 string
                    let v = (payload && payload.data !== undefined) ? payload.data : payload;
                    this.verifyMap = v;

                    // try extract uuid if present in commonly used keys
                    if (v && typeof v === 'object') {
                        this.uuid = v.uuid || v.uuidStr || v.id || v.uuid_code || v.codeUuid || this.uuid || '';
                    } else if (payload && payload.uuid) {
                        this.uuid = payload.uuid;
                    } else if (payload && payload.data && payload.data.uuid) {
                        this.uuid = payload.data.uuid;
                    }

                    console.debug('[LoginPage] verifyMap set, uuid=', this.uuid, 'verifyMap=', this.verifyMap);
                    this.verifyHint = '验证码已获取（点击图片可刷新）';
                } catch (e) {
                    this.verifyHint = '获取验证码失败';
                    console.error('[LoginPage] getVerifyCode failed', e);
                }
            },

            async submitLogin() {
                this.message = '';
                if (!this.name || !this.password) {
                    this.message = '请输入用户名和密码';
                    return;
                }
                // 强制要求输入验证码：如果没有输入，阻止调用 login 接口并提示
                if (!this.verifyInput || !this.verifyInput.toString().trim()) {
                    this.message = '请输入验证码';
                    return;
                }

                this.loading = true;
                try {
                    // 使用 loginDTO 风格的 body：{ name, password, uncheckedCode, uuid }
                    const body = {
                        name: this.name,
                        password: this.password,
                        uncheckedCode: this.verifyInput,
                        uuid: this.uuid || undefined
                    };
                    console.debug('[LoginPage] submitLogin body=', body);

                    // call UserService.login (it will set token if returned)
                    const payload = await window.UserService.login(body);
                    console.debug('[LoginPage] login response', payload);

                    if (payload && (payload.code === 0 || payload.code === undefined || payload.code === 200)) {
                        // 登录成功：尝试获取用户信息
                        try {
                            const infoPayload = await window.UserService.getUserInfo();
                            if (infoPayload && infoPayload.data) {
                                this.store.user = infoPayload.data;
                            } else if (infoPayload && infoPayload.code === 0 && infoPayload.data) {
                                this.store.user = infoPayload.data;
                            } else {
                                this.store.user = payload.data || { name: this.name };
                            }
                        } catch (e) {
                            console.warn('getUserInfo failed after login', e);
                            this.store.user = payload.data || { name: this.name };
                        }
                        this.message = '登录成功';
                        this.$router.push('/dashboard');
                    } else {
                        this.message = (payload && (payload.message || payload.msg)) || '登录失败';
                        // 登录失败时刷新验证码，避免一直用同一个 uuid
                        await this.fetchVerifyCode();
                    }
                } catch (e) {
                    console.error('login exception', e);
                    this.message = '登录请求失败: ' + (e.response && e.response.data ? JSON.stringify(e.response.data) : e.message || e);
                    // 登录异常也刷新验证码
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
            <button type="button" @click="$router.push('/dashboard')">跳过（演示）</button>
          </div>

          <div v-if="message" :style="{ color: message.includes('成功') ? 'green' : 'red' }">{{ message }}</div>
        </form>
      </div>
    `
    };

    window.LoginPageComponent = LoginPage;
})();