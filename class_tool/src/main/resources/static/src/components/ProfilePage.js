// ProfilePage (UMD) - 个人中心（按需挂载共享 HeaderBar）
(function () {
    const ProfilePage = {
        props: ['store'],
        data() {
            return {
                active: 'info',
                loading: false,
                message: '',
                user: null,
                form: { phone:'', email:'' },
                passForm: { oldPassword:'', newPassword:'', confirmPassword:'' }
            };
        },
        async created() {
            if (this.store && this.store.user) this.user = this.store.user;
            else if (window.UserService && typeof window.UserService.getUserInfo === 'function') {
                try {
                    const payload = await window.UserService.getUserInfo();
                    if (payload && payload.data) this.user = payload.data;
                    else if (payload && payload.code===0 && payload.data) this.user = payload.data;
                } catch(e) { console.warn(e); }
            }
            if (this.user) { this.form.phone = this.user.phone || ''; this.form.email = this.user.email || ''; }
        },
        mounted() {
            try { if (window.mountHeader) window.mountHeader(this.store, '#shared-header'); } catch(e) {}
        },
        beforeUnmount() {
            try { if (window.unmountHeader) window.unmountHeader(); } catch(e) {}
        },
        computed: {
            avatarSrc() { if (this.user && this.user.avatar) return this.user.avatar; return 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="100%" height="100%" fill="#f0f6fb"/><circle cx="48" cy="36" r="20" fill="#8aa2c7"/></svg>'); },
            identityDisplay() { if (!this.user) return '未知'; return this.user.userRole || this.user.role || '未知'; }
        },
        methods: {
            choose(tab){ this.active = tab; this.message=''; },
            async apiPost(url, body) { if (window.ApiCore && typeof window.ApiCore.post==='function') { const res=await window.ApiCore.post(url, body); return res && res.data!==undefined ? res.data : res; } else if (window.axios) { const base=(this.store && this.store.apiBase)?this.store.apiBase.replace(/\/+$/,''):''; const full=(base?base:'')+url; const res=await window.axios.post(full, body); return res && res.data!==undefined ? res.data : res; } else throw new Error('No HTTP client'); },
            async saveInfo(){ try{ this.message=''; if(!this.form.phone && !this.form.email){ this.message='请至少填写手机号或邮箱'; return; } this.loading=true; const body={ phone:this.form.phone||undefined, email:this.form.email||undefined }; const payload=await this.apiPost('/user/updateInfo', body); if(payload && (payload.code===0 || payload.success===true)){ this.message = payload.message||'保存成功'; if(payload.data) this.user = Object.assign({}, this.user||{}, payload.data); else { this.user = this.user || {}; this.user.phone=this.form.phone; this.user.email=this.form.email; } try{ if(this.store) this.store.user = this.user; }catch(e){} } else { this.message = (payload && (payload.message||payload.msg)) || '保存失败'; } } catch(e){ console.error(e); this.message='保存请求失败'; } finally{ this.loading=false; } },
            async changePassword(){ try{ this.message=''; if(!this.passForm.oldPassword || !this.passForm.newPassword || !this.passForm.confirmPassword){ this.message='请填写完整密码信息'; return; } if(this.passForm.newPassword !== this.passForm.confirmPassword){ this.message='两次输入的新密码不一致'; return; } this.loading=true; const body = { oldPassword:this.passForm.oldPassword, newPassword:this.passForm.newPassword, confirmPassword:this.passForm.confirmPassword }; const payload = await this.apiPost('/user/updatePassword', body); if(payload && (payload.code===0 || payload.success===true)){ this.message = payload.message || '修改密码成功'; this.passForm.oldPassword = this.passForm.newPassword = this.passForm.confirmPassword = ''; } else { this.message = (payload && (payload.message||payload.msg)) || '修改失败'; } } catch(e){ console.error(e); this.message='修改请求失败'; } finally{ this.loading=false; } }
        },
        template: `
      <div>
        <div id="shared-header"></div>

        <div style="display:flex;max-width:1100px;margin:18px auto;gap:18px;font-family:system-ui,-apple-system,'Segoe UI',Roboto,Arial,Helvetica,sans-serif">
          <div style="width:200px;background:#fff;border:1px solid #eef2f7;border-radius:6px;overflow:hidden">
            <div style="padding:12px;border-bottom:1px solid #f4f6f8;font-weight:600">个人信息</div>
            <div style="display:flex;flex-direction:column;padding:8px">
              <div @click="choose('info')" :style="{padding:'8px',cursor:'pointer',background: active==='info' ? '#f0f6ff' : 'transparent',borderRadius:'6px'}">个人信息</div>
              <div @click="choose('pass')" :style="{padding:'8px',cursor:'pointer',background: active==='pass' ? '#f0f6ff' : 'transparent',borderRadius:'6px',marginTop:'8px'}">更改密码</div>
            </div>
          </div>

          <div style="flex:1;background:#fff;border:1px solid #eef2f7;border-radius:6px;padding:24px">
            <div v-if="active==='info'">
              <div style="display:flex;align-items:center;justify-content:space-between">
                <h3 style="margin:0">个人信息</h3>
                
              </div>

              <div style="max-width:540px;margin:20px auto">
                <div style="display:flex;justify-content:center;margin-bottom:12px">
                  <img :src="avatarSrc" style="width:96px;height:96px;border-radius:8px;object-fit:cover" />
                </div>

                <div style="display:grid;grid-template-columns:120px 1fr;column-gap:18px;row-gap:12px;align-items:center">
                  <div style="color:#666;font-size:14px">身份：</div><div style="font-weight:600;color:#333;font-size:14px">{{ identityDisplay }}</div>
                  <div style="color:#666;font-size:14px">账号：</div><div style="font-weight:600;color:#333;font-size:14px">{{ user && user.name ? user.name : '' }}</div>
                  <div style="color:#666;font-size:14px">手机号：</div><div><input v-model="form.phone" placeholder="手机号" style="width:100%;box-sizing:border-box;padding:8px;border-radius:6px;border:1px solid #dcdfe6" /></div>
                  <div style="color:#666;font-size:14px">邮箱：</div><div><input v-model="form.email" placeholder="邮箱" style="width:100%;box-sizing:border-box;padding:8px;border-radius:6px;border:1px solid #dcdfe6" /></div>
                  <div></div><div style="text-align:center;margin-top:8px"><button @click="saveInfo" :disabled="loading" style="padding:8px 14px;background:#2b7cff;color:#fff;border:none;border-radius:6px;cursor:pointer">提交</button></div>
                </div>
              </div>

              <div v-if="message" style="max-width:540px;margin:12px auto 0;color:#d9534f;text-align:center">{{ message }}</div>
            </div>

            <div v-else>
              <div style="display:flex;align-items:center;justify-content:space-between">
                <h3 style="margin:0">更改密码</h3>
                
              </div>

              <div style="max-width:540px;margin:20px auto;display:grid;grid-template-columns:120px 1fr;column-gap:18px;row-gap:12px;align-items:center">
                <div style="color:#666;font-size:14px">原密码：</div><div><input v-model="passForm.oldPassword" type="password" placeholder="填写原密码" style="width:100%;box-sizing:border-box;padding:8px;border-radius:6px;border:1px solid #dcdfe6" /></div>
                <div style="color:#666;font-size:14px">新密码：</div><div><input v-model="passForm.newPassword" type="password" placeholder="6-18位,包含大小写字母，允许特殊字符" style="width:100%;box-sizing:border-box;padding:8px;border-radius:6px;border:1px solid #dcdfe6" /></div>
                <div style="color:#666;font-size:14px">再次确认：</div><div><input v-model="passForm.confirmPassword" type="password" placeholder="再次填写新密码" style="width:100%;box-sizing:border-box;padding:8px;border-radius:6px;border:1px solid #dcdfe6" /></div>
                <div></div><div style="text-align:center;margin-top:8px"><button @click="changePassword" :disabled="loading" style="padding:8px 14px;background:#2b7cff;color:#fff;border:none;border-radius:6px;cursor:pointer">提交</button></div>
              </div>

              <div v-if="message" style="max-width:540px;margin:12px auto 0;color:#d9534f;text-align:center">{{ message }}</div>
            </div>
          </div>
        </div>
      </div>
    `
    };

    window.ProfilePageComponent = ProfilePage;
})();