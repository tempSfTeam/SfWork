// LoginPage (UMD) - 使用 window.UserService（已存在）进行 login & getUserInfo
// 美化：居中卡片、整洁样式、可访问按钮、错误提示展示
(function () {
    const LoginPage = {
        props: ['store'],
        data() {
            return {
                name: '',
                password: '',
                verifyInput: '',
                verifyMap: null,
                verifyHint: '',
                loading: false,
                message: '',
                uuid: ''
            };
        },
        async created() {
            // 初始化 Api/UserService base（若有）
            if (window.ApiCore && this.store && this.store.apiBase) {
                window.ApiCore.setBaseURL(this.store.apiBase);
            }
            if (window.UserService && this.store && this.store.apiBase) {
                window.UserService.init(this.store.apiBase);
            }
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
            async fetchVerifyCode() {
                this.verifyMap = null;
                this.verifyHint = '';
                this.uuid = '';
                try {
                    // Prefer UserService if available
                    let res;
                    if (window.UserService && typeof window.UserService.getVerifyCode === 'function') {
                        res = await window.UserService.getVerifyCode();
                    } else if (window.ApiCore && typeof window.ApiCore.get === 'function') {
                        res = await window.ApiCore.get('/user/getVerifyCode');
                    } else if (window.axios) {
                        const base = (this.store && this.store.apiBase) ? this.store.apiBase.replace(/\/+$/, '') : '';
                        const url = (base ? base : '') + '/user/getVerifyCode';
                        res = await window.axios.get(url);
                    } else {
                        throw new Error('No HTTP client available for getVerifyCode');
                    }

                    let payload = res;
                    if (res && res.data !== undefined) payload = res.data;

                    // extract actual verify object or string
                    let v = payload && payload.data !== undefined ? payload.data : payload;
                    this.verifyMap = v;

                    // try extract uuid
                    if (v && (v.uuid || v.uuidStr || v.id)) {
                        this.uuid = v.uuid || v.uuidStr || v.id;
                    } else if (payload && payload.uuid) {
                        this.uuid = payload.uuid;
                    }

                    this.verifyHint = '验证码已获取（点击图片可刷新）';
                } catch (e) {
                    this.verifyHint = '获取验证码失败';
                    console.error('getVerifyCode failed', e);
                }
            },

            async submitLogin() {
                this.message = '';
                if (!this.name || !this.password) {
                    this.message = '请输入用户名和密码';
                    return;
                }
                // require verify input
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
                    const payload = await window.UserService.login(body);
                    if (payload && (payload.code === 0 || payload.code === undefined || payload.code === 200)) {
                        // attempt getUserInfo
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
                        // redirect to dashboard
                        this.$router.push('/dashboard');
                    } else {
                        this.message = (payload && (payload.message || payload.msg)) || '登录失败';
                        await this.fetchVerifyCode();
                    }
                } catch (e) {
                    console.error('login exception', e);
                    this.message = '登录请求失败';
                    await this.fetchVerifyCode();
                } finally {
                    this.loading = false;
                }
            }
        },
        template: `
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f5f7fb;padding:24px;box-sizing:border-box">
        <div style="width:420px;background:#fff;border-radius:10px;box-shadow:0 8px 24px rgba(14,30,37,0.08);padding:28px;box-sizing:border-box">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px">
            <div style="width:44px;height:44px;border-radius:8px;background:#2b7cff;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:18px">云</div>
            <div>
              <div style="font-size:18px;font-weight:700;color:#222">系统登录</div>
              <div style="font-size:12px;color:#8a98a6">请输入你的账号信息以登录</div>
            </div>
          </div>

          <form @submit.prevent="submitLogin" style="display:flex;flex-direction:column;gap:14px">
            <div>
              <label style="display:block;font-size:13px;color:#5b6770;margin-bottom:6px">用户名</label>
              <input v-model="name" placeholder="用户名" style="width:100%;padding:10px;border-radius:6px;border:1px solid #e3e8ef;box-sizing:border-box;font-size:14px" />
            </div>

            <div>
              <label style="display:block;font-size:13px;color:#5b6770;margin-bottom:6px">密码</label>
              <input v-model="password" type="password" placeholder="密码" style="width:100%;padding:10px;border-radius:6px;border:1px solid #e3e8ef;box-sizing:border-box;font-size:14px" />
            </div>

            <div>
              <label style="display:block;font-size:13px;color:#5b6770;margin-bottom:8px">验证码</label>
              <div style="display:flex;gap:10px;align-items:center">
                <input v-model="verifyInput" placeholder="验证码" style="flex:1;padding:10px;border-radius:6px;border:1px solid #e3e8ef;box-sizing:border-box;font-size:14px" />
                <button type="button" @click="fetchVerifyCode" style="padding:10px 12px;border-radius:6px;border:1px solid #d6dee8;background:#fff;cursor:pointer">刷新验证码</button>
              </div>

              <div v-if="verifyImageSrc" style="margin-top:12px;display:flex;align-items:center;gap:12px">
                <div style="font-size:12px;color:#8894a6">点击图片可刷新：</div>
                <img :src="verifyImageSrc" alt="验证码" @click="fetchVerifyCode" style="height:60px;cursor:pointer;border:1px solid #eee;padding:6px;border-radius:6px;background:#fff" />
              </div>

              <div v-else-if="verifyMap" style="margin-top:12px">
                <pre style="max-height:120px;overflow:auto;background:#fafbfd;padding:8px;border-radius:6px;border:1px solid #eef2f7">{{ verifyMap }}</pre>
              </div>

              <div style="margin-top:8px;color:#8a98a6;font-size:12px">{{ verifyHint }}</div>
            </div>

            <div style="display:flex;align-items:center;justify-content:flex-end;gap:12px">
              <button type="submit" :disabled="loading" style="padding:10px 12px;border-radius:6px;border:none;background:#2b7cff;color:#fff;font-weight:600;cursor:pointer">
                {{ loading ? '登录中...' : '登录' }}
              </button>
            </div>

            <div v-if="message" :style="{ color: message.includes('成功') ? 'green' : 'red', fontSize: '13px' }">{{ message }}</div>
          </form>
        </div>
      </div>
    `
    };

    window.LoginPageComponent = LoginPage;
})();