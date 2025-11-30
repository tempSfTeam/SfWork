// HeaderBar (UMD) - 共享顶部横栏，提供 mountHeader(store) 接口
(function () {
    if (!window.Vue) {
        console.error('Vue is required for HeaderBar');
        return;
    }
    const { createApp } = window.Vue;

    const HeaderBar = {
        props: ['store'],
        data() {
            return {
                showAvatarMenu: false,
                // small defaults
                defaultAvatar: 'data:image/svg+xml;utf8,' + encodeURIComponent(
                    `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
                      <rect width="100%" height="100%" rx="8" fill="#f0f6fb"/>
                      <g transform="translate(6,6)" fill="#8aa2c7">
                        <circle cx="16" cy="10" r="7"/>
                        <path d="M0,34 a1,1 0 0,1 32,0" fill="#cfe0f2"/>
                      </g>
                    </svg>`
                ),
                // default logo to avoid empty-src broken image
                defaultLogo: 'data:image/svg+xml;utf8,' + encodeURIComponent(
                    `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect width="100%" height="100%" rx="6" fill="#2b7cff"/><text x="50%" y="50%" fill="#fff" font-size="16" text-anchor="middle" alignment-baseline="middle">S</text></svg>`
                )
            };
        },
        computed: {
            userName() {
                return this.store && this.store.user ? (this.store.user.name || this.store.user) : '';
            },
            avatarSrc() {
                return (this.store && this.store.user && this.store.user.avatar) ? this.store.user.avatar : this.defaultAvatar;
            }
        },
        mounted() {
            // close on outside click
            this._onDocClick = (e) => {
                try {
                    const wrap = this.$el;
                    if (!wrap) return;
                    if (wrap.contains(e.target)) return;
                    this.showAvatarMenu = false;
                } catch (err) {}
            };
            document.addEventListener('click', this._onDocClick);
        },
        beforeUnmount() {
            if (this._onDocClick) document.removeEventListener('click', this._onDocClick);
        },
        methods: {
            goto(path) {
                try { location.hash = '#' + path; } catch (e) {}
            },
            openProfile() {
                this.showAvatarMenu = false;
                this.goto('/profile');
            },
            async logout() {
                try {
                    if (window.UserService && typeof window.UserService.logoutServer === 'function') {
                        await window.UserService.logoutServer();
                    } else if (window.ApiCore && typeof window.ApiCore.get === 'function') {
                        try { await window.ApiCore.get('/user/logout'); } catch(e) {}
                        try { window.ApiCore.setToken(null); } catch(e){}
                    } else {
                        try { localStorage.removeItem('sf_token'); } catch(e) {}
                    }
                } catch (e) {
                    console.warn('HeaderBar.logout error', e);
                } finally {
                    try { if (this.store) this.store.user = null; } catch(e){}
                    this.goto('/login');
                }
            },
            avatarError(e) {
                try { e.target.src = this.defaultAvatar; } catch (err) {}
            },
            toggleMenu(e) {
                this.showAvatarMenu = !this.showAvatarMenu;
            }
        },
        template: `
      <div style="width:100%;background:#fff;border-bottom:1px solid #eef2f7;padding:8px 18px;box-sizing:border-box">
        <div style="max-width:1100px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:12px">
          <div style="display:flex;align-items:center;gap:18px">
            <div @click="goto('/dashboard')" style="display:flex;align-items:center;gap:8px;cursor:pointer">
              <img :src="defaultLogo" style="width:32px;height:32px;border-radius:6px;display:inline-block" />
              <div style="font-weight:600;color:#2b7cff">云课堂</div>
            </div>

            <div style="display:flex;gap:12px;align-items:center">
              <div @click="goto('/dashboard')" style="padding:6px 10px;cursor:pointer">首页</div>
              <div @click="goto('/courses')" style="padding:6px 10px;cursor:pointer">课程</div>
            </div>
          </div>

          <div style="display:flex;align-items:center;gap:12px;position:relative">
            <div style="margin-right:8px;color:#333;font-size:14px">{{ userName }}</div>

            <div style="position:relative;display:inline-block" @mouseenter="showAvatarMenu = true">
              <img :src="avatarSrc" @error="avatarError" @click.stop="toggleMenu" style="width:36px;height:36px;border-radius:50%;cursor:pointer;border:1px solid #e6eefc;padding:2px" />
              <div v-show="showAvatarMenu" @click.stop style="position:absolute;right:0;top:46px;min-width:140px;background:#fff;border:1px solid #e9eef6;border-radius:6px;box-shadow:0 6px 18px rgba(43,124,255,0.08);padding:6px;z-index:60">
                <div style="padding:8px 10px;cursor:pointer" @click="openProfile">个人中心</div>
                <div style="padding:8px 10px;cursor:pointer;color:#d9534f" @click="logout">登出</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
    };

    // mount helper - id 为容器 id，默认 '#shared-header'
    window.mountHeader = function (store, containerId) {
        try {
            containerId = containerId || '#shared-header';
            if (window.__HEADER_MOUNTED__) {
                // already mounted
                return;
            }
            const el = document.querySelector(containerId);
            if (!el) {
                console.warn('mountHeader: container not found', containerId);
                return;
            }
            const app = createApp(HeaderBar, { store: store || (window.__APP_STORE__ || null) });
            app.mount(el);
            window.__HEADER_MOUNTED__ = true;
            window.__HEADER_APP__ = app;
        } catch (e) {
            console.error('mountHeader failed', e);
        }
    };

    window.unmountHeader = function () {
        try {
            if (window.__HEADER_APP__) {
                window.__HEADER_APP__.unmount();
                window.__HEADER_APP__ = null;
            }
            window.__HEADER_MOUNTED__ = false;
        } catch (e) {}
    };

    window.HeaderBarComponent = HeaderBar;
})();