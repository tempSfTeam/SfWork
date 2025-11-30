// HomePage (UMD) - 使用共享 HeaderBar（按需挂载）
(function () {
    const HomePage = {
        props: ['store'],
        data() {
            return {
                courses: [],
                loading: false,
                error: '',
                defaultCourseIcon: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect width="100%" height="100%" fill="#eef2f7"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="20" fill="#9aa7b6">No Image</text></svg>`),
                defaultAvatar: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect width="100%" height="100%" rx="8" fill="#f0f6fb"/></svg>`)
            };
        },
        created() {
            if (window.ApiCore && this.store && this.store.apiBase) window.ApiCore.setBaseURL(this.store.apiBase);
            if (window.UserService && this.store && this.store.apiBase) window.UserService.init(this.store.apiBase);
            this.fetchPopularCourses();
        },
        mounted() {
            // 按需挂载 header；确保 HeaderBar.js 已加载（index.html 中已引入）
            try {
                if (window.mountHeader) window.mountHeader(this.store, '#shared-header');
            } catch (e) { console.warn('HomePage mountHeader failed', e); }
        },
        beforeUnmount() {
            try {
                if (window.unmountHeader) window.unmountHeader();
            } catch (e) {}
        },
        methods: {
            async fetchPopularCourses() {
                this.loading = true;
                this.error = '';
                try {
                    let res;
                    if (window.ApiCore && typeof window.ApiCore.get === 'function') {
                        res = await window.ApiCore.get('/course/listPopularCourse', { params: { number: 8 } });
                    } else if (window.axios) {
                        const base = (this.store && this.store.apiBase) ? this.store.apiBase.replace(/\/+$/, '') : '';
                        const url = (base ? base : '') + '/course/listPopularCourse';
                        res = await window.axios.get(url, { params: { number: 8 } });
                    } else {
                        throw new Error('No HTTP client');
                    }
                    let payload = res && res.data !== undefined ? res.data : res;
                    let arr = payload && payload.data !== undefined ? payload.data : payload;
                    if (!Array.isArray(arr)) arr = [];
                    this.courses = arr.slice(0, 8).map(item => ({ name: item.name || item.courseName, icon: item.icon || item.courseIcon || '', click: item.click || item.view || 0, raw: item }));
                } catch (e) {
                    console.error(e);
                    this.error = '无法加载热门课程';
                    this.courses = [];
                } finally {
                    this.loading = false;
                }
            },
            onImgError(e) { try { e.target.src = this.defaultCourseIcon; } catch (err) {} },
            enterCourse(c) { alert('进入课程: ' + (c.name || '')); }
        },
        template: `
      <div>
        <!-- shared header mount point -->
        <div id="shared-header"></div>

        <!-- hero -->
        <div style="background:#fafafa;padding:18px"><div style="max-width:1100px;margin:0 auto"><div style="height:220px;background-image:url('https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=60');background-size:cover;border-radius:4px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:28px;font-weight:600;text-shadow:0 2px 8px rgba(0,0,0,0.4)">即刻在线，成就未来</div></div></div>

        <!-- content -->
        <div style="max-width:1100px;margin:28px auto">
          <h3 style="text-align:center;margin-bottom:18px">热门课程</h3>
          <div v-if="loading" style="text-align:center">加载中...</div>
          <div v-if="error" style="color:red;text-align:center">{{ error }}</div>
          <div v-if="courses && courses.length>0" style="display:grid;grid-template-columns:repeat(4,1fr);gap:18px">
            <div v-for="(c, idx) in courses" :key="idx" style="background:#fff;border-radius:8px;overflow:hidden;border:1px solid #eef2f7;display:flex;flex-direction:column;height:170px">
              <div style="flex:0 0 90px;overflow:hidden"><img :src="c.icon || defaultCourseIcon" @error="onImgError" style="width:100%;height:90px;object-fit:cover" /></div>
              <div style="flex:1;padding:12px;display:flex;flex-direction:column;justify-content:space-between">
                <div style="font-weight:600;color:#333;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">{{ c.name }}</div>
                <div style="display:flex;justify-content:space-between;align-items:center"><div style="color:#9aa7b6;font-size:13px">浏览量 {{ c.click }}</div><button @click="enterCourse(c)" style="background:#2b7cff;color:#fff;border:none;padding:6px 10px;border-radius:18px;cursor:pointer">进入课程</button></div>
              </div>
            </div>
          </div>
          <div v-if="!loading && (!courses || courses.length===0)" style="text-align:center;color:#777">暂无热门课程</div>
        </div>
      </div>
    `
    };

    window.HomePageComponent = HomePage;
})();