// CourseDetailPage (UMD) - 课程详情页（带课程信息与目录）
// - 进入方式：从 HomePage 或 CoursesPage 点击“进入课程”按钮，传递 courseId（作为 query 或 prop）
// - 页面包含：返回按钮（回到上一个页面 / CoursesPage）、编辑/删除 按钮（UI 占位）
// - 会尝试调用 /course/getDetail?courseId=...（优先使用 window.ApiCore.get，回退到 axios）并带 Authorization: Bearer <token>
// - 如果没有 courseId，则展示占位信息（便于先做布局）
// - UMD style 与项目中其他页面一致：最后赋值到 window.CourseDetailPageComponent
(function () {
    const CourseDetailPage = {
        props: ['store'],
        data() {
            return {
                loading: false,
                error: null,
                // course detail shape (fill from /course/getDetail)
                course: {
                    courseId: null,
                    name: '',
                    description: '',
                    icon: '', // course image url
                    simpleExperiments: [] // 目录项数组，元素包含 { id, title, ... }
                },
                // UI states
                deleting: false,
                editing: false
            };
        },
        computed: {
            // helper to show course image fallback
            courseIcon() {
                return this.course && this.course.icon ? this.course.icon : (this.defaultIcon || '');
            },
            defaultIcon() {
                return 'data:image/svg+xml;utf8,' + encodeURIComponent(
                    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260"><rect width="100%" height="100%" fill="#eef2f7"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="20" fill="#9aa7b6">No Image</text></svg>'
                );
            }
        },
        created() {
            try { if (window.ApiCore && this.store && this.store.apiBase) window.ApiCore.setBaseURL(this.store.apiBase); } catch (e) {}
            // Attempt to read courseId from route query (if using vue-router) or from prop
            const idFromQuery = (this.$route && this.$route.query && this.$route.query.courseId) ? Number(this.$route.query.courseId) : null;
            const idFromParams = (this.$route && this.$route.params && this.$route.params.courseId) ? Number(this.$route.params.courseId) : null;
            const idFromProp = this.courseId !== undefined ? Number(this.courseId) : null;
            const courseId = idFromQuery || idFromParams || idFromProp || null;
            if (courseId) {
                this.loadCourseDetail(courseId);
            } else {
                // No id - keep placeholder course to show layout
                this.course = {
                    courseId: null,
                    name: '示例课程名称（未传入 courseId）',
                    description: '这里显示课程简介。若从课程页进入并传入 courseId，将会在此展示 /course/getDetail 返回的数据。',
                    icon: '',
                    simpleExperiments: [
                        { id: 1, title: '第一节：示例章节' },
                        { id: 2, title: '第二节：示例章节' },
                        { id: 3, title: '第三节：示例章节' }
                    ]
                };
            }
        },
        methods: {
            // get Authorization header (compatible with other pages)
            _getAuthHeaders() {
                try {
                    if (window.ApiCore && typeof window.ApiCore.getToken === 'function') {
                        const t = window.ApiCore.getToken();
                        if (t) return { Authorization: 'Bearer ' + t };
                    }
                } catch (e) {}
                try {
                    const t2 = localStorage.getItem('sf_token') || localStorage.getItem('token') || null;
                    if (t2) return { Authorization: 'Bearer ' + t2 };
                } catch (e) {}
                return {};
            },

            // Generic GET using ApiCore or axios (returns promise)
            apiGet(path, opts) {
                if (window.ApiCore && typeof window.ApiCore.get === 'function') {
                    // ApiCore.get may accept url or path; use full path as in other pages
                    return window.ApiCore.get(path, opts);
                } else if (window.axios && typeof window.axios.get === 'function') {
                    const base = (this.store && this.store.apiBase) ? this.store.apiBase.replace(/\/+$/, '') : '';
                    const url = (base ? base : '') + path;
                    return window.axios.get(url, opts);
                } else {
                    return Promise.reject(new Error('No HTTP client available'));
                }
            },

            // Load course detail by calling /course/getDetail?courseId=...
            loadCourseDetail(courseId) {
                if (!courseId) {
                    this.error = '缺少 courseId';
                    return Promise.resolve();
                }
                this.loading = true;
                this.error = null;
                const headers = this._getAuthHeaders();
                const base = (this.store && this.store.apiBase) ? this.store.apiBase.replace(/\/+$/, '') : '';
                const url = (base ? base : '') + '/course/getDetail';
                // Build query string because ApiCore.get in this project often used with url+qs
                const qs = '?courseId=' + encodeURIComponent(courseId);
                if (window.ApiCore && typeof window.ApiCore.get === 'function') {
                    return window.ApiCore.get(url + qs)
                        .then(resp => {
                            const data = resp && resp.data !== undefined ? resp.data : (resp || null);
                            this._handleDetailResponse(data);
                        })
                        .catch(err => {
                            console.warn('/course/getDetail ApiCore failed, fallback to axios', err);
                            return this._fetchCourseDetailWithAxios(courseId, headers);
                        })
                        .finally(() => { this.loading = false; });
                } else {
                    return this._fetchCourseDetailWithAxios(courseId, headers).finally(()=>{ this.loading = false; });
                }
            },

            _fetchCourseDetailWithAxios(courseId, headers) {
                if (!window.axios || typeof window.axios.get !== 'function') {
                    this.error = 'No HTTP client';
                    return Promise.reject(new Error('no http client'));
                }
                const base = (this.store && this.store.apiBase) ? this.store.apiBase.replace(/\/+$/, '') : '';
                const url = (base ? base : '') + '/course/getDetail';
                return window.axios.get(url, { params: { courseId: Number(courseId) }, headers: headers, withCredentials: true })
                    .then(res => {
                        const data = res && res.data !== undefined ? res.data : (res || null);
                        this._handleDetailResponse(data);
                    })
                    .catch(err => {
                        console.error('_fetchCourseDetailWithAxios failed', err);
                        this.error = '获取课程详情失败';
                    });
            },

            _handleDetailResponse(payload) {
                if (!payload) {
                    this.error = '无返回数据';
                    return;
                }
                // If standard wrapper { code, msg, data }
                if (payload.code !== undefined && payload.code !== null && payload.code !== 200 && payload.code !== 0) {
                    this.error = payload.message || payload.msg || ('错误代码 ' + payload.code);
                    return;
                }
                // unwrap
                const data = payload.data !== undefined ? payload.data : payload;
                if (!data) {
                    this.error = '返回 data 为空';
                    return;
                }
                // Map returned fields into this.course
                this.course = {
                    courseId: data.courseId !== undefined ? data.courseId : (data.id !== undefined ? data.id : null),
                    name: data.name || data.courseName || data.title || '',
                    description: data.description || data.desCN || data.summary || '',
                    icon: data.icon || data.cover || data.image || '',
                    simpleExperiments: Array.isArray(data.simpleExperiments) ? data.simpleExperiments : (Array.isArray(data.simpleExperiment) ? data.simpleExperiment : [])
                };
            },

            // Back button behavior: try router.back, else history.back
            goBack() {
                try {
                    if (this.$router && typeof this.$router.back === 'function') {
                        this.$router.back();
                        return;
                    }
                } catch (e) {}
                try { window.history.back(); } catch (e) {}
            },

            // Placeholder edit action (UI only)
            onEditCourse() {
                // for now show an alert; later you can open edit modal or route to edit page
                alert('编辑课程（占位）');
            },

            // Placeholder delete action (UI only)
            onDeleteCourse() {
                if (!confirm('确认删除该课程吗？（此操作为占位示例）')) return;
                this.deleting = true;
                // simulate delay
                setTimeout(() => {
                    this.deleting = false;
                    alert('已删除（示例）');
                    // after delete go back
                    this.goBack();
                }, 800);
            },

            // Enter experiment / chapter - placeholder
            enterExperiment(it) {
                alert('进入目录项：' + (it && (it.title || it.name || it.id) ));
            },

            // image fallback handler
            onImgError(e) {
                try { e.target.src = this.defaultIcon; } catch (err) {}
            }
        },

        template: `
      <div style="padding:18px;max-width:1200px;margin:0 auto">
        <div id="shared-header"></div>

        <div style="margin-top:12px;display:flex;align-items:center;gap:12px">
          <button @click="goBack" style="background:#2b7cff;color:#fff;border:none;padding:8px 12px;border-radius:6px;cursor:pointer">返回</button>
          <div style="margin-left:auto;display:flex;gap:8px">
            <button @click="onEditCourse" :disabled="!course.courseId" style="background:#2b7cff;color:#fff;border:none;padding:8px 12px;border-radius:6px;cursor:pointer">编辑课程</button>
            <button @click="onDeleteCourse" :disabled="!course.courseId || deleting" style="background:#ff6b6b;color:#fff;border:none;padding:8px 12px;border-radius:6px;cursor:pointer">{{ deleting ? '删除中...' : '删除课程' }}</button>
          </div>
        </div>

        <div style="margin-top:18px;background:#f7fbff;border-radius:10px;padding:18px;display:flex;gap:18px;align-items:flex-start;min-height:220px">
          <div style="width:320px;flex-shrink:0">
            <img :src="courseIcon" @error="onImgError" style="width:100%;height:100%;object-fit:cover;border-radius:8px;border:8px solid #cfe9ff" />
          </div>

          <div style="flex:1;display:flex;flex-direction:column;gap:12px">
            <div style="font-weight:700;font-size:22px;color:#123">{{ course.name }}</div>
            <div style="color:#444;line-height:1.6;white-space:pre-wrap">{{ course.description }}</div>
           
          </div>
        </div>

        <div style="height:18px"></div>
        <div style="border-top:1px solid #eef2f7;margin-top:18px;padding-top:18px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
            <div style="font-weight:600">课程目录</div>
            <div>
              <button style="background:#2b7cff;color:#fff;border:none;padding:6px 10px;border-radius:6px;cursor:pointer">新建课程目录</button>
            </div>
          </div>

          <div v-if="!course.simpleExperiments || course.simpleExperiments.length === 0" style="padding:18px;background:#fff;border-radius:8px;color:#999">
            暂无目录项
          </div>

          <div v-else style="background:#f0f8ff;border-radius:8px;padding:18px">
            <div v-for="(it, idx) in course.simpleExperiments" :key="it.id || idx" style="display:flex;align-items:center;justify-content:space-between;padding:10px;border-radius:6px;margin-bottom:8px;background:#e6f6ff">
              <div style="color:#333">{{ (idx+1) + '. ' + (it.title || it.name || ('目录项 ' + (idx+1))) }}</div>
              <div style="display:flex;gap:8px;align-items:center">
                <button @click="enterExperiment(it)" style="padding:6px 10px;border-radius:6px;border:1px solid #e6eef8;background:#fff;cursor:pointer">进入</button>
                <button style="padding:6px 10px;border-radius:6px;border:none;background:#2b7cff;color:#fff;cursor:pointer">编辑</button>
                <button style="padding:6px 10px;border-radius:6px;border:none;background:#ff6b6b;color:#fff;cursor:pointer">删除</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
    };

    window.CourseDetailPageComponent = CourseDetailPage;
})();