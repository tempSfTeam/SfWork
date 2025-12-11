// CourseDetailPage (UMD) - 课程详情页（带课程信息与目录）
// - 进入方式：从 HomePage 或 CoursesPage 点击“进入课程”按钮，传递 courseId（作为 query 或 prop）
// - 页面包含：返回按钮（回到上一个页面 / CoursesPage）、编辑/删除 按钮（UI 占位）
// - 会尝试调用 /course/getDetail?courseId=...（优先使用 window.ApiCore.get，回退到 axios）并带 Authorization: Bearer <token>
// - 新增：编辑课程 modal（调用 /course/update，multipart，带 token）
// - 新增：删除课程 调用 /course/delete (POST JSON { courseId })
// - 新增：课程目录 CRUD：
//     - 新建目录 POST /experiment/add  body { name, courseId }
//     - 编辑目录 POST /experiment/update body { experimentId, name }
//     - 删除目录 POST /experiment/delete body { experimentId }
// - 如果没有 courseId，则展示占位信息（便于先做布局）
// - UMD style 与项目中其他页面一致：最后赋值到 window.CourseDetailPageComponent
(function () {
    const CourseDetailPage = {
        props: ['store'],
        data() {
            return {
                // ... (unchanged data as before)
                loading: false,
                error: null,
                course: {
                    courseId: null,
                    name: '',
                    description: '',
                    icon: '',
                    managerId: null,
                    simpleExperiments: []
                },
                deleting: false,
                editing: false,

                editModalVisible: false,
                editLoading: false,
                editForm: {
                    courseId: null,
                    name: '',
                    description: '',
                    imageFile: null,
                    imageName: '',
                    managerId: null
                },
                managerOptions: [],

                createExperimentModalVisible: false,
                createExperimentLoading: false,
                createExperimentForm: { name: '' },

                editExperimentModalVisible: false,
                editExperimentLoading: false,
                editExperimentForm: { experimentId: null, name: '' },

                deleteExperimentLoadingId: null
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
            },

            // New: whether current user may manage (edit/delete) courses and experiments
            // true if user is 超级管理员 (roleCode 3) or 课程管理员 (roleCode 2)
            canManage() {
                // 1) try store.user first
                const u = (this.store && this.store.user) ? this.store.user : null;
                const check = (user) => {
                    if (!user) return false;
                    // normalized roleCode if present
                    if (user.roleCode !== undefined && user.roleCode !== null) {
                        const rc = Number(user.roleCode);
                        if (rc === 3 || rc === 2) return true;
                    }
                    // try roleName / userRole / role fields
                    const rn = (user.roleName || user.userRole || user.role || '').toString();
                    if (rn === '超级管理员' || rn === '课程管理员') return true;
                    if (String(rn) === '3' || String(rn) === '2') return true;
                    return false;
                };

                if (check(u)) return true;

                // fallback: try localStorage persisted user
                try {
                    const raw = localStorage.getItem('sf_user') || localStorage.getItem('user') || null;
                    if (raw) {
                        const uu = JSON.parse(raw);
                        if (check(uu)) return true;
                    }
                } catch (e) { /* ignore parse errors */ }

                // fallback: global
                try {
                    if (window.__CURRENT_USER__ && check(window.__CURRENT_USER__)) return true;
                } catch (e) {}

                return false;
            }
        },

        created() {
            try { if (window.ApiCore && this.store && this.store.apiBase) window.ApiCore.setBaseURL(this.store.apiBase); } catch (e) {}
            const idFromQuery = (this.$route && this.$route.query && this.$route.query.courseId) ? Number(this.$route.query.courseId) : null;
            const idFromParams = (this.$route && this.$route.params && this.$route.params.courseId) ? Number(this.$route.params.courseId) : null;
            const idFromProp = this.courseId !== undefined ? Number(this.courseId) : null;
            const courseId = idFromQuery || idFromParams || idFromProp || null;
            if (courseId) {
                this.loadCourseDetail(courseId);
            } else {
                this.course = {
                    courseId: null,
                    name: '示例课程名称（未传入 courseId）',
                    description: '这里显示课程简介。若从课程页进入并传入 courseId，将会在此展示 /course/getDetail 返回的数据。',
                    icon: '',
                    managerId: null,
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
                    managerId: (data.managerId !== undefined ? data.managerId : (data.manager && (data.manager.userId || data.manager.id) ? (data.manager.userId || data.manager.id) : null)),
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

            // --- Course edit modal methods (unchanged) ---
            onEditCourse() {
                if (!this.course || !this.course.courseId) {
                    alert('当前课程不可编辑（缺少 courseId）');
                    return;
                }
                // prefill
                this.editForm.courseId = this.course.courseId;
                this.editForm.name = this.course.name || '';
                this.editForm.description = this.course.description || '';
                this.editForm.imageFile = null;
                this.editForm.imageName = '';
                this.editForm.managerId = this.course.managerId || null;
                this.managerOptions = [];

                // load manager options then show modal
                this.loadManagerOptions().then(() => {
                    if ((!this.editForm.managerId || this.editForm.managerId === null) && this.managerOptions.length) {
                        this.editForm.managerId = this.managerOptions[0].userId;
                    }
                    this.editModalVisible = true;
                }).catch(err => {
                    if ((!this.editForm.managerId || this.editForm.managerId === null) && this.managerOptions.length) {
                        this.editForm.managerId = this.managerOptions[0].userId;
                    }
                    this.editModalVisible = true;
                });
            },

            loadManagerOptions() {
                const headers = this._getAuthHeaders();
                const base = (this.store && this.store.apiBase) ? this.store.apiBase.replace(/\/+$/, '') : '';
                const url = (base ? base : '') + '/manage/getAllUser';
                const params = { searchStr: '', current: 1, size: 10, role: 2 };

                if (window.ApiCore && typeof window.ApiCore.get === 'function') {
                    const qs = Object.keys(params).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k])).join('&');
                    return window.ApiCore.get(url + '?' + qs)
                        .then(resp => {
                            const raw = resp && resp.data !== undefined ? resp.data : resp || null;
                            this._populateManagerOptionsFromPayload(raw);
                        })
                        .catch(err => {
                            return this._fetchManagersWithAxios(params, headers);
                        });
                } else {
                    return this._fetchManagersWithAxios(params, headers);
                }
            },

            _fetchManagersWithAxios(params, headers) {
                const base = (this.store && this.store.apiBase) ? this.store.apiBase.replace(/\/+$/, '') : '';
                const url = (base ? base : '') + '/manage/getAllUser';
                if (!window.axios || typeof window.axios.get !== 'function') {
                    this.managerOptions = [];
                    return Promise.resolve();
                }
                return window.axios.get(url, { params: params, headers: headers, withCredentials: true })
                    .then(res => {
                        const raw = res && res.data !== undefined ? res.data : res || null;
                        this._populateManagerOptionsFromPayload(raw);
                    })
                    .catch(err => {
                        console.error('fetch managers failed', err);
                        this.managerOptions = [];
                    });
            },

            _populateManagerOptionsFromPayload(payload) {
                const data = (payload && payload.data !== undefined) ? payload.data : payload;
                let arr = [];
                if (Array.isArray(data)) arr = data;
                else if (Array.isArray(data.records)) arr = data.records;
                else if (Array.isArray(data.list)) arr = data.list;
                else if (Array.isArray(payload)) arr = payload;
                else {
                    for (const k of Object.keys(data || {})) {
                        if (Array.isArray(data[k])) { arr = data[k]; break; }
                    }
                }
                const mapped = (arr || []).map(u => {
                    const id = (u && (u.userId || u.id || u.user_id || u.uid)) || null;
                    const name = (u && (u.name || u.username || u.userName || u.nick || u.realName || u.cnName)) || (u && u.name === undefined ? String(id) : '');
                    return { userId: id, name: name, _raw: u };
                }).filter(x => x.userId !== null && (x.name !== undefined));
                this.managerOptions = mapped;
            },

            onEditImageChange(e) {
                const f = (e.target && e.target.files && e.target.files[0]) ? e.target.files[0] : null;
                if (!f) {
                    this.editForm.imageFile = null;
                    this.editForm.imageName = '';
                    return;
                }
                this.editForm.imageFile = f;
                this.editForm.imageName = f.name || '';
            },

            async submitUpdateCourse() {
                // validation
                if (!this.editForm.name || !this.editForm.name.trim()) { alert('课程名称不能为空'); return; }
                if ((this.editForm.name || '').length > 32) { alert('课程名称不能超过32字符'); return; }
                if (!this.editForm.description || !this.editForm.description.trim()) { alert('课程描述不能为空'); return; }
                if ((this.editForm.description || '').length > 255) { alert('课程描述不能超过255字符'); return; }
                if (!this.editForm.managerId) { alert('请选择课程管理员'); return; }
                if (!this.editForm.courseId) { alert('缺少 courseId'); return; }

                const fd = new FormData();
                if (this.editForm.imageFile) fd.append('image', this.editForm.imageFile);
                fd.append('courseId', Number(this.editForm.courseId));
                fd.append('name', (this.editForm.name || '').trim());
                fd.append('description', (this.editForm.description || '').trim());
                fd.append('managerId', Number(this.editForm.managerId));

                this.editLoading = true;
                const headers = this._getAuthHeaders();
                const base = (this.store && this.store.apiBase) ? this.store.apiBase.replace(/\/+$/, '') : '';
                const url = (base ? base : '') + '/course/update';

                try {
                    let res;
                    if (window.axios && typeof window.axios.post === 'function') {
                        const cfg = { headers: Object.assign({}, headers), withCredentials: true };
                        res = await window.axios.post(url, fd, cfg);
                    } else if (window.ApiCore && typeof window.ApiCore.post === 'function') {
                        res = await window.ApiCore.post('/course/update', fd, { headers: headers, withCredentials: true });
                    } else {
                        throw new Error('No HTTP client available for POST');
                    }
                    console.info('update course ok', res && res.data ? res.data : res);
                    alert('课程更新成功');
                    this.editModalVisible = false;
                    if (this.course && this.course.courseId) await this.loadCourseDetail(this.course.courseId);
                } catch (err) {
                    console.error('update course failed', err);
                    const msg = err && err.response && err.response.data && (err.response.data.msg || err.response.data.message)
                        ? (err.response.data.msg || err.response.data.message)
                        : (err && err.message ? err.message : '网络或服务器错误');
                    alert('更新失败：' + msg);
                } finally {
                    this.editLoading = false;
                }
            },

            async onDeleteCourse() {
                if (!this.course || !this.course.courseId) { alert('当前无可删除的课程'); return; }
                if (!confirm('确定删除该课程吗？')) return;
                this.deleting = true;
                const headers = this._getAuthHeaders();
                const base = (this.store && this.store.apiBase) ? this.store.apiBase.replace(/\/+$/, '') : '';
                const url = (base ? base : '') + '/course/delete';
                const payload = { courseId: Number(this.course.courseId) };

                try {
                    let res;
                    if (window.axios && typeof window.axios.post === 'function') {
                        res = await window.axios.post(url, payload, { headers: Object.assign({ 'Content-Type': 'application/json' }, headers), withCredentials: true });
                    } else if (window.ApiCore && typeof window.ApiCore.post === 'function') {
                        res = await window.ApiCore.post('/course/delete', payload);
                    } else {
                        throw new Error('No HTTP client available for POST');
                    }
                    console.info('delete course ok', res && res.data ? res.data : res);
                    alert('课程已删除');
                    this.goBack();
                } catch (err) {
                    console.error('delete course failed', err);
                    const msg = err && err.response && err.response.data && (err.response.data.msg || err.response.data.message)
                        ? (err.response.data.msg || err.response.data.message)
                        : (err && err.message ? err.message : '网络或服务器错误');
                    alert('删除失败：' + msg);
                } finally {
                    this.deleting = false;
                }
            },

            // --- Experiments (目录) CRUD methods ---

            // open create modal
            openCreateExperimentModal() {
                // 权限校验（如无权限则阻止并提示）
                if (!this.canManage) {
                    alert('没有权限新建课程目录');
                    return;
                }
                if (!this.course || !this.course.courseId) {
                    alert('缺少 courseId，无法新建目录');
                    return;
                }
                this.createExperimentForm = { name: '' };
                this.createExperimentModalVisible = true;
            },

            // submit create experiment -> POST /experiment/add { name, courseId }
            async submitCreateExperiment() {
                const name = (this.createExperimentForm.name || '').trim();
                if (!name) { alert('名称不能为空'); return; }
                if (name.length > 50) { alert('名称长度不能超过50'); return; }
                if (!this.course || !this.course.courseId) { alert('缺少 courseId'); return; }

                const payload = { name: name, courseId: Number(this.course.courseId) };
                this.createExperimentLoading = true;
                const headers = this._getAuthHeaders();
                const base = (this.store && this.store.apiBase) ? this.store.apiBase.replace(/\/+$/, '') : '';
                const url = (base ? base : '') + '/experiment/add';

                try {
                    let res;
                    if (window.axios && typeof window.axios.post === 'function') {
                        res = await window.axios.post(url, payload, { headers: Object.assign({ 'Content-Type': 'application/json' }, headers), withCredentials: true });
                    } else if (window.ApiCore && typeof window.ApiCore.post === 'function') {
                        res = await window.ApiCore.post('/experiment/add', payload);
                    } else {
                        throw new Error('No HTTP client available for POST');
                    }
                    console.info('create experiment ok', res && res.data ? res.data : res);
                    alert('创建成功');
                    this.createExperimentModalVisible = false;
                    // reload course detail to refresh simpleExperiments
                    if (this.course && this.course.courseId) await this.loadCourseDetail(this.course.courseId);
                } catch (err) {
                    console.error('create experiment failed', err);
                    const msg = err && err.response && err.response.data && (err.response.data.msg || err.response.data.message)
                        ? (err.response.data.msg || err.response.data.message)
                        : (err && err.message ? err.message : '网络或服务器错误');
                    alert('创建失败：' + msg);
                } finally {
                    this.createExperimentLoading = false;
                }
            },

            // open edit modal for specific experiment
            openEditExperimentModal(it) {
                if (!it || !it.id && !it.experimentId) return;
                const id = it.experimentId !== undefined ? it.experimentId : (it.id !== undefined ? it.id : null);
                this.editExperimentForm = { experimentId: id, name: it.title || it.name || '' };
                this.editExperimentModalVisible = true;
            },

            // submit update experiment -> POST /experiment/update { experimentId, name }
            async submitUpdateExperiment() {
                const name = (this.editExperimentForm.name || '').trim();
                const experimentId = this.editExperimentForm.experimentId;
                if (!experimentId) { alert('缺少 experimentId'); return; }
                if (!name) { alert('名称不能为空'); return; }
                if (name.length > 50) { alert('名称长度不能超过50'); return; }

                const payload = { experimentId: Number(experimentId), name: name };
                this.editExperimentLoading = true;
                const headers = this._getAuthHeaders();
                const base = (this.store && this.store.apiBase) ? this.store.apiBase.replace(/\/+$/, '') : '';
                const url = (base ? base : '') + '/experiment/update';

                try {
                    let res;
                    if (window.axios && typeof window.axios.post === 'function') {
                        res = await window.axios.post(url, payload, { headers: Object.assign({ 'Content-Type': 'application/json' }, headers), withCredentials: true });
                    } else if (window.ApiCore && typeof window.ApiCore.post === 'function') {
                        res = await window.ApiCore.post('/experiment/update', payload);
                    } else {
                        throw new Error('No HTTP client available for POST');
                    }
                    console.info('update experiment ok', res && res.data ? res.data : res);
                    alert('更新成功');
                    this.editExperimentModalVisible = false;
                    if (this.course && this.course.courseId) await this.loadCourseDetail(this.course.courseId);
                } catch (err) {
                    console.error('update experiment failed', err);
                    const msg = err && err.response && err.response.data && (err.response.data.msg || err.response.data.message)
                        ? (err.response.data.msg || err.response.data.message)
                        : (err && err.message ? err.message : '网络或服务器错误');
                    alert('更新失败：' + msg);
                } finally {
                    this.editExperimentLoading = false;
                }
            },

            // delete experiment -> POST /experiment/delete { experimentId }
            async deleteExperiment(it) {
                if (!it || (!it.id && !it.experimentId)) return;
                const id = it.experimentId !== undefined ? it.experimentId : (it.id !== undefined ? it.id : null);
                if (!id) return;
                if (!confirm('确定删除该目录吗？')) return;
                this.deleteExperimentLoadingId = id;
                const payload = { experimentId: Number(id) };
                const headers = this._getAuthHeaders();
                const base = (this.store && this.store.apiBase) ? this.store.apiBase.replace(/\/+$/, '') : '';
                const url = (base ? base : '') + '/experiment/delete';

                try {
                    let res;
                    if (window.axios && typeof window.axios.post === 'function') {
                        res = await window.axios.post(url, payload, { headers: Object.assign({ 'Content-Type': 'application/json' }, headers), withCredentials: true });
                    } else if (window.ApiCore && typeof window.ApiCore.post === 'function') {
                        res = await window.ApiCore.post('/experiment/delete', payload);
                    } else {
                        throw new Error('No HTTP client available for POST');
                    }
                    console.info('delete experiment ok', res && res.data ? res.data : res);
                    alert('删除成功');
                    if (this.course && this.course.courseId) await this.loadCourseDetail(this.course.courseId);
                } catch (err) {
                    console.error('delete experiment failed', err);
                    const msg = err && err.response && err.response.data && (err.response.data.msg || err.response.data.message)
                        ? (err.response.data.msg || err.response.data.message)
                        : (err && err.message ? err.message : '网络或服务器错误');
                    alert('删除失败：' + msg);
                } finally {
                    this.deleteExperimentLoadingId = null;
                }
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
            <!-- only show edit/delete course to allowed roles -->
            <button v-if="canManage" @click="onEditCourse" :disabled="!course.courseId" style="background:#2b7cff;color:#fff;border:none;padding:8px 12px;border-radius:6px;cursor:pointer">编辑课程</button>
            <button v-if="canManage" @click="onDeleteCourse" :disabled="!course.courseId || deleting" style="background:#ff6b6b;color:#fff;border:none;padding:8px 12px;border-radius:6px;cursor:pointer">{{ deleting ? '删除中...' : '删除课程' }}</button>
          </div>
        </div>

        <div style="margin-top:18px;background:#f7fbff;border-radius:10px;padding:18px;display:flex;gap:18px;align-items:flex-start;min-height:220px">
          <div style="width:320px;flex-shrink:0">
            <img :src="courseIcon" @error="onImgError" style="width:100%;height:100%;object-fit:cover;border-radius:8px;border:8px solid #cfe9ff" />
          </div>

          <div style="flex:1;display:flex;flex-direction:column;gap:12px">
            <div style="font-weight:700;font-size:22px;color:#123">{{ course.name }}</div>
            <div style="color:#444;line-height:1.6;white-space:pre-wrap">{{ course.description }}</div>
            <div style="margin-top:auto;color:#8894a6;font-size:13px">（课程详情来自 /course/getDetail，若未传 courseId 则显示占位内容）</div>
          </div>
        </div>

        <div style="height:18px"></div>
        <div style="border-top:1px solid #eef2f7;margin-top:18px;padding-top:18px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
            <div style="font-weight:600">课程目录</div>
            <div>
              <button v-if="canManage" @click="openCreateExperimentModal" style="background:#2b7cff;color:#fff;border:none;padding:6px 10px;border-radius:6px;cursor:pointer">新建课程目录</button>
            </div>
          </div>

          <div v-if="!course.simpleExperiments || course.simpleExperiments.length === 0" style="padding:18px;background:#fff;border-radius:8px;color:#999">
            暂无目录项
          </div>

          <div v-else style="background:#f0f8ff;border-radius:8px;padding:18px">
            <div v-for="(it, idx) in course.simpleExperiments" :key="it.id || it.experimentId || idx" style="display:flex;align-items:center;justify-content:space-between;padding:10px;border-radius:6px;margin-bottom:8px;background:#e6f6ff">
              <div style="color:#333">{{ (idx+1) + '. ' + (it.title || it.name || it.experimentName || ('目录项 ' + (idx+1))) }}</div>
              <div style="display:flex;gap:8px;align-items:center">
                <button @click="enterExperiment(it)" style="padding:6px 10px;border-radius:6px;border:1px solid #e6eef8;background:#fff;cursor:pointer">进入</button>
                <!-- only show edit/delete experiment to allowed roles -->
                <button v-if="canManage" @click="openEditExperimentModal(it)" style="padding:6px 10px;border-radius:6px;border:none;background:#2b7cff;color:#fff;cursor:pointer">编辑</button>
                <button v-if="canManage" @click="deleteExperiment(it)" :disabled="deleteExperimentLoadingId === (it.experimentId||it.id)" style="padding:6px 10px;border-radius:6px;border:none;background:#ff6b6b;color:#fff;cursor:pointer">{{ deleteExperimentLoadingId === (it.experimentId||it.id) ? '删除中...' : '删除' }}</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Edit Course Modal -->
        <div v-if="editModalVisible" style="position:fixed;left:0;top:0;right:0;bottom:0;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;z-index:2000;">
          <div style="width:520px;background:#fff;border-radius:8px;padding:18px;box-shadow:0 8px 40px rgba(0,0,0,0.12);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
              <div style="font-weight:600">编辑课程</div>
              <button @click="editModalVisible=false" style="background:transparent;border:none;font-size:18px;cursor:pointer">✕</button>
            </div>

            <div style="display:flex;flex-direction:column;gap:10px">
              <div>
                <div style="font-size:12px;color:#666;margin-bottom:6px">名称 <span style="color:#d9534f">*</span></div>
                <input v-model="editForm.name" maxlength="32" placeholder="请输入课程名称（最多32字符）" style="width:100%;padding:8px;border:1px solid #e6eef8;border-radius:6px" />
                <div style="font-size:12px;color:#999;text-align:right">{{ (editForm.name || '').length }}/32</div>
              </div>

              <div>
                <div style="font-size:12px;color:#666;margin-bottom:6px">描述 <span style="color:#d9534f">*</span></div>
                <textarea v-model="editForm.description" maxlength="255" placeholder="请填写课程的描述（最多255字符）" style="width:100%;min-height:100px;padding:8px;border:1px solid #e6eef8;border-radius:6px"></textarea>
                <div style="font-size:12px;color:#999;text-align:right">{{ (editForm.description || '').length }}/255</div>
              </div>

              <div>
                <div style="font-size:12px;color:#666;margin-bottom:6px">图片（选填）</div>
                <input type="file" accept="image/*" @change="onEditImageChange" />
                <div v-if="editForm.imageName" style="font-size:12px;color:#666;margin-top:6px">已选择：{{ editForm.imageName }}</div>
              </div>

              <div>
                <div style="font-size:12px;color:#666;margin-bottom:6px">课程管理员 <span style="color:#d9534f">*</span></div>
                <select v-model.number="editForm.managerId" style="width:100%;padding:8px;border:1px solid #e6eef8;border-radius:6px">
                  <option :value="null">请选择课程管理员</option>
                  <option v-for="u in managerOptions" :key="u.userId" :value="u.userId">{{ u.name }}</option>
                </select>
              </div>

              <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:6px">
                <button @click="editModalVisible=false" style="background:#fff;border:1px solid #ccc;padding:6px 12px;border-radius:6px;cursor:pointer">取 消</button>
                <button @click="submitUpdateCourse" :disabled="editLoading" style="background:#2b7cff;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer">{{ editLoading ? '保存中...' : '确 定' }}</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Create Experiment Modal -->
        <div v-if="createExperimentModalVisible" style="position:fixed;left:0;top:0;right:0;bottom:0;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;z-index:2100;">
          <div style="width:420px;background:#fff;border-radius:8px;padding:18px;box-shadow:0 8px 40px rgba(0,0,0,0.12);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
              <div style="font-weight:600">新建课程目录</div>
              <button @click="createExperimentModalVisible=false" style="background:transparent;border:none;font-size:18px;cursor:pointer">✕</button>
            </div>

            <div>
              <div style="font-size:12px;color:#666;margin-bottom:6px">名称 <span style="color:#d9534f">*</span></div>
              <input v-model="createExperimentForm.name" maxlength="50" placeholder="请输入目录名称（最多50字符）" style="width:100%;padding:8px;border:1px solid #e6eef8;border-radius:6px" />
              <div style="text-align:right;font-size:12px;color:#999">{{ (createExperimentForm.name||'').length }}/50</div>
            </div>

            <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:12px">
              <button @click="createExperimentModalVisible=false" style="background:#fff;border:1px solid #ccc;padding:6px 12px;border-radius:6px;cursor:pointer">取 消</button>
              <button @click="submitCreateExperiment" :disabled="createExperimentLoading" style="background:#2b7cff;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer">{{ createExperimentLoading ? '创建中...' : '创 建' }}</button>
            </div>
          </div>
        </div>

        <!-- Edit Experiment Modal -->
        <div v-if="editExperimentModalVisible" style="position:fixed;left:0;top:0;right:0;bottom:0;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;z-index:2100;">
          <div style="width:420px;background:#fff;border-radius:8px;padding:18px;box-shadow:0 8px 40px rgba(0,0,0,0.12);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
              <div style="font-weight:600">编辑课程目录</div>
              <button @click="editExperimentModalVisible=false" style="background:transparent;border:none;font-size:18px;cursor:pointer">✕</button>
            </div>

            <div>
              <div style="font-size:12px;color:#666;margin-bottom:6px">名称 <span style="color:#d9534f">*</span></div>
              <input v-model="editExperimentForm.name" maxlength="50" placeholder="请输入目录名称（最多50字符）" style="width:100%;padding:8px;border:1px solid #e6eef8;border-radius:6px" />
              <div style="text-align:right;font-size:12px;color:#999">{{ (editExperimentForm.name||'').length }}/50</div>
            </div>

            <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:12px">
              <button @click="editExperimentModalVisible=false" style="background:#fff;border:1px solid #ccc;padding:6px 12px;border-radius:6px;cursor:pointer">取 消</button>
              <button @click="submitUpdateExperiment" :disabled="editExperimentLoading" style="background:#2b7cff;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer">{{ editExperimentLoading ? '保存中...' : '确 定' }}</button>
            </div>
          </div>
        </div>

      </div>
    `
    };

    window.CourseDetailPageComponent = CourseDetailPage;
})();