// AdminPage (UMD) - 管理页面框架（权限受限：仅课程管理员/超级管理员可见）
// 简单骨架：左侧菜单，右侧内容区；内部组件/模块会根据 user.roleCode 控制显示
(function () {
    const AdminPage = {
        props: ['store'],
        data() {
            return {
                activeMenu: 'school', // 示例菜单
            };
        },
        mounted() {
            try { if (window.mountHeader) window.mountHeader(this.store, '#shared-header'); } catch (e) {}
        },
        beforeUnmount() {
            try { if (window.unmountHeader) window.unmountHeader(); } catch (e) {}
        },
        computed: {
            roleCode() {
                return this.store && this.store.user ? this.store.user.roleCode : null;
            },
            roleName() {
                return this.store && this.store.user ? this.store.user.roleName : null;
            },
            allowed() {
                // Only allow access if roleCode is 2 or 3
                return this.roleCode === 2 || this.roleCode === 3;
            }
        },
        methods: {
            choose(m) { this.activeMenu = m; }
        },
        template: `
      <div>
        <div id="shared-header"></div>

        <div style="display:flex;max-width:1200px;margin:18px auto;gap:18px">
          <div style="width:220px;background:#fff;border:1px solid #eef2f7;border-radius:6px;padding:12px">
            <div style="font-weight:600;padding:8px 0">管理</div>
            <div style="display:flex;flex-direction:column;gap:6px;margin-top:8px">
              <div @click="choose('school')" :style="{padding:'8px',cursor:'pointer',background: activeMenu==='school' ? '#f0f6ff' : 'transparent',borderRadius:'6px'}">学校管理</div>
              <div @click="choose('users')" :style="{padding:'8px',cursor:'pointer',background: activeMenu==='users' ? '#f0f6ff' : 'transparent',borderRadius:'6px'}">用户管理</div>
              <div @click="choose('roles')" :style="{padding:'8px',cursor:'pointer',background: activeMenu==='roles' ? '#f0f6ff' : 'transparent',borderRadius:'6px'}">角色权限</div>
            </div>
          </div>

          <div style="flex:1;background:#fff;border:1px solid #eef2f7;border-radius:6px;padding:18px">
            <div v-if="!allowed" style="text-align:center;color:#d9534f;padding:40px">
              你没有权限访问此页面 (需要课程管理员或超级管理员)
            </div>

            <div v-else>
              <h3 style="margin-top:0">管理面板 - {{ roleName || '' }}</h3>
              <div v-if="activeMenu==='school'">
                <p>学校管理模块（占位）</p>
              </div>
              <div v-else-if="activeMenu==='users'">
                <p>用户管理模块（占位）</p>
              </div>
              <div v-else-if="activeMenu==='roles'">
                <p>角色权限模块（占位）</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
    };

    window.AdminPageComponent = AdminPage;
})();