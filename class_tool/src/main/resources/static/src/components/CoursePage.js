// CoursesPage (UMD) - 课程页
// - 调用 /courseType/listPreference 获取学习对象
// - 调用 /profession/listPreference 获取课程科目（基于学习对象）
// - 调用 /course/listByProfessionId 获取课程列表（基于 selected subject + searchStr + pagination）
// - 使用 ApiCore 优先，axios 回退
// 修改点：移除“返回课程筛选”按钮；将课程科目（subjects）移到学习对象下方（垂直布局）
(function () {
    const CoursesPage = {
        props: ['store'],
        data() {
            return {
                // loading states
                loadingStudy: false,
                loadingSubjects: false,
                loadingCourses: false,

                // data
                studyObjects: [],    // 学习对象
                subjects: [],        // 课程科目
                courses: [],         // 课程列表

                // selection & search
                selectedStudy: null,
                selectedSubject: null,
                searchQuery: '',

                // pagination for courses
                page: {
                    current: 1,
                    size: 9
                },
                totalCourses: 0,
                noMore: false,

                // visuals
                defaultCourseIcon: 'data:image/svg+xml;utf8,' + encodeURIComponent(
                    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect width="100%" height="100%" fill="#eef2f7"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="20" fill="#9aa7b6">No Image</text></svg>'
                ),

                // data: 在组件 data() 返回对象中加入
                createCourseModalVisible: false,
                createLoading: false,
                createForm: {
                    name: '',
                    description: '',
                    imageFile: null,
                    imageName: '',
                    managerId: null
                },
                managerOptions: [], // { userId, name }
                currentLearningObjectId: null, // 如果页面已经选了学习对象，把该 id 赋值过来
                currentLearningObjectName: '', // UI 显示名称
                currentProfessionId: null, // 课程科目 id（前端界面已选的那个科目 id）
                currentProfessionName: '',
            };
        },
        computed: {
            isSuperAdmin() {
                // 优先使用 this.store.user（如果前端登录时把 user 存在 store）
                const user = (this.store && this.store.user) ? this.store.user : null;
                const checkUser = (u) => {
                    if (!u) return false;
                    // 常见字段兼容：roleName, userRole, role, roleCode
                    const rn = (u.roleName || u.userRole || u.role || '').toString();
                    const rc = (u.roleCode !== undefined && u.roleCode !== null) ? Number(u.roleCode) : null;
                    if (rn === '超级管理员' || rn === 'OPERATIONS' || rn === 'OPERATIONS(3)' ) return true;
                    if (rc === 3) return true; // 你的后端可能把超级管理员表示为 3
                    // 兼容 numeric role stored as string '3'
                    if (String(rn) === '3') return true;
                    return false;
                };

                // first try store
                if (checkUser(user)) return true;

                // fallback: check localStorage (if login persisted there)
                try {
                    const raw = localStorage.getItem('sf_user') || localStorage.getItem('user') || null;
                    if (raw) {
                        const uu = JSON.parse(raw);
                        if (checkUser(uu)) return true;
                    }
                } catch (e) {}

                // fallback: window.__CURRENT_USER__ or similar global
                try {
                    if (window.__CURRENT_USER__ && checkUser(window.__CURRENT_USER__)) return true;
                } catch (e) {}

                return false;
            }
        },
        async created() {
            if (window.ApiCore && this.store && this.store.apiBase) window.ApiCore.setBaseURL(this.store.apiBase);
            if (window.UserService && this.store && this.store.apiBase) window.UserService.init(this.store.apiBase);

            // load study objects on enter
            await this.loadStudyObjects();
        },
        mounted() {
            // mount header for this page
            try { if (window.mountHeader) window.mountHeader(this.store, '#shared-header'); } catch (e) {}
        },
        beforeUnmount() {
            try { if (window.unmountHeader) window.unmountHeader(); } catch (e) {}
        },
        methods: {
            // Generic GET using ApiCore or axios
            async apiGet(path, opts) {
                if (window.ApiCore && typeof window.ApiCore.get === 'function') {
                    return await window.ApiCore.get(path, opts);
                } else if (window.axios) {
                    const base = (this.store && this.store.apiBase) ? this.store.apiBase.replace(/\/+$/, '') : '';
                    const url = (base ? base : '') + path;
                    return await window.axios.get(url, opts);
                } else {
                    throw new Error('No HTTP client available');
                }
            },

            // load study objects (courseType/listPreference)
            async loadStudyObjects() {
                this.loadingStudy = true;
                try {
                    const res = await this.apiGet('/courseType/listPreference');
                    let payload = res;
                    if (res && res.data !== undefined) payload = res.data;
                    let arr = payload && payload.data !== undefined ? payload.data : payload;
                    if (!Array.isArray(arr)) arr = [];
                    this.studyObjects = arr;

                    if (this.studyObjects.length > 0) {
                        // auto select first
                        this.selectedStudy = this.studyObjects[0];
                        const id = this._extractId(this.selectedStudy);
                        await this.loadSubjects(id);
                    } else {
                        this.selectedStudy = null;
                        this.subjects = [];
                        this.selectedSubject = null;
                    }
                } catch (e) {
                    console.error('loadStudyObjects error', e);
                    this.studyObjects = [];
                } finally {
                    this.loadingStudy = false;
                }
            },

            // load subjects for a study object (profession/listPreference)
            async loadSubjects(studyId) {
                this.loadingSubjects = true;
                this.subjects = [];
                this.selectedSubject = null;
                try {
                    const params = studyId != null ? { courseTypeId: studyId } : {};
                    const res = await this.apiGet('/profession/listPreference', { params });
                    let payload = res;
                    if (res && res.data !== undefined) payload = res.data;
                    let arr = payload && payload.data !== undefined ? payload.data : payload;
                    if (!Array.isArray(arr)) arr = [];
                    this.subjects = arr;

                    if (this.subjects.length > 0) {
                        // select first subject by default
                        this.selectedSubject = this.subjects[0];
                        // load courses for selected subject
                        await this.refreshCourses();
                    } else {
                        this.selectedSubject = null;
                        this.courses = [];
                        this.totalCourses = 0;
                        this.noMore = true;
                    }
                } catch (e) {
                    console.error('loadSubjects error', e);
                    this.subjects = [];
                    this.selectedSubject = null;
                } finally {
                    this.loadingSubjects = false;
                }
            },

            // fetch courses by professionId (course/listByProfessionId)
            // if append=true, append results (for pagination), else replace
            async loadCourses(professionId, searchStr, append = false) {
                if (!professionId) {
                    this.courses = [];
                    this.totalCourses = 0;
                    this.noMore = true;
                    return;
                }
                this.loadingCourses = true;
                try {
                    const params = {
                        professionId: professionId,
                        searchStr: searchStr || '',
                        current: this.page.current,
                        size: this.page.size
                    };
                    const res = await this.apiGet('/course/listByProfessionId', { params });
                    let payload = res;
                    if (res && res.data !== undefined) payload = res.data;

                    // Expect backend Msg with data possibly containing list & total
                    // Try common shapes: payload.data.records / payload.data.list / payload.data or direct array
                    let records = [];
                    let total = 0;
                    if (payload && payload.data !== undefined) {
                        const d = payload.data;
                        if (Array.isArray(d)) {
                            records = d;
                            total = d.length;
                        } else if (d.records && Array.isArray(d.records)) {
                            records = d.records;
                            total = d.total || records.length;
                        } else if (d.list && Array.isArray(d.list)) {
                            records = d.list;
                            total = d.total || records.length;
                        } else if (Array.isArray(d.data)) {
                            records = d.data;
                            total = d.total || records.length;
                        } else {
                            // fallback: try d itself as array
                            if (Array.isArray(d)) {
                                records = d;
                                total = d.length;
                            } else {
                                // unknown shape, try payload.data as single item
                                records = Array.isArray(d) ? d : [];
                            }
                        }
                    } else if (Array.isArray(payload)) {
                        records = payload;
                        total = records.length;
                    }

                    if (append) {
                        this.courses = this.courses.concat(records);
                    } else {
                        this.courses = records;
                    }

                    // manage total/noMore if backend gives total
                    if (typeof total === 'number' && total >= 0) {
                        this.totalCourses = total;
                        const fetched = this.courses.length;
                        this.noMore = fetched >= total;
                    } else {
                        // if total unknown, use length heuristic
                        this.noMore = (records.length < this.page.size);
                    }
                } catch (e) {
                    console.error('loadCourses error', e);
                    if (!append) this.courses = [];
                    this.noMore = true;
                } finally {
                    this.loadingCourses = false;
                }
            },

            // refresh (reset page) and load courses for current selectedSubject and searchQuery
            async refreshCourses() {
                this.page.current = 1;
                this.noMore = false;
                if (!this.selectedSubject) {
                    this.courses = [];
                    this.totalCourses = 0;
                    return;
                }
                const professionId = this._extractId(this.selectedSubject);
                await this.loadCourses(professionId, this.searchQuery, false);
            },

            // load next page
            async loadMoreCourses() {
                if (this.noMore || this.loadingCourses) return;
                this.page.current += 1;
                const professionId = this._extractId(this.selectedSubject);
                await this.loadCourses(professionId, this.searchQuery, true);
            },

            // user selects a study object
            async onSelectStudy(s) {
                if (this.selectedStudy === s) return;
                this.selectedStudy = s;
                const id = this._extractId(s);
                // load subjects for the new study object; subjects loader will auto-load courses
                await this.loadSubjects(id);
            },

            // user selects subject
            async onSelectSubject(sub) {
                if (this.selectedSubject === sub) return;
                this.selectedSubject = sub;
                await this.refreshCourses();
            },

            // search action triggers same courses API (searchStr)
            async onSearch() {
                // reset page and fetch
                await this.refreshCourses();
            },

            // helper: extract id from various shapes
            _extractId(obj) {
                if (!obj) return null;
                return obj.id || obj.professionId || obj.professionID || obj.typeId || obj.courseTypeId || obj.value || obj.key || null;
            },

            // image fallback
            onCourseImgError(e) {
                try { e.target.src = this.defaultCourseIcon; } catch (err) {}
            },

            openCreateCourseModal() {
                // Determine selected learning object (study) and subject robustly
                const selCourseType = this.getSelectedCourseType();
                if (selCourseType && selCourseType.id) {
                    this.currentLearningObjectId = selCourseType.id;
                    this.currentLearningObjectName = selCourseType.name || '';
                } else if (this.selectedStudy) {
                    // fallback to selectedStudy used in this component
                    this.currentLearningObjectId = this._extractId(this.selectedStudy);
                    this.currentLearningObjectName = this.selectedStudy.name || this.selectedStudy.title || '';
                } else {
                    this.currentLearningObjectId = null;
                    this.currentLearningObjectName = '';
                }

                const selProfession = this.getSelectedProfession();
                if (selProfession && selProfession.id) {
                    this.currentProfessionId = selProfession.id;
                    this.currentProfessionName = selProfession.name || '';
                } else if (this.selectedSubject) {
                    this.currentProfessionId = this._extractId(this.selectedSubject);
                    this.currentProfessionName = this.selectedSubject.name || this.selectedSubject.title || '';
                } else {
                    this.currentProfessionId = null;
                    this.currentProfessionName = '';
                }

                // reset form
                this.createForm = { name:'', description:'', imageFile:null, imageName:'', managerId:null };
                this.managerOptions = [];

                // Load manager options and auto-select first if available
                this.loadManagerOptions().then(() => {
                    if ((!this.createForm.managerId || this.createForm.managerId === null) && Array.isArray(this.managerOptions) && this.managerOptions.length) {
                        this.createForm.managerId = this.managerOptions[0].userId;
                    }
                }).catch(err => {
                    console.warn('loadManagerOptions error in openCreateCourseModal', err);
                });

                this.createCourseModalVisible = true;
            },


        // Helper: try multiple places to find selected course type (learning object)
            getSelectedCourseType() {
                // 1) direct page variables
                if (this.selectedStudy) return { id: this._extractId(this.selectedStudy), name: this.selectedStudy.name || this.selectedStudy.title || '' };
                // 2) try arrays: studyObjects
                if (Array.isArray(this.studyObjects) && this.studyObjects.length) {
                    // look for active flag if any
                    const active = this.studyObjects.find(x => x._active || x.selected || x.isActive || x.active);
                    if (active) return { id: this._extractId(active), name: active.name || active.title || '' };
                    // fallback to first
                    return { id: this._extractId(this.studyObjects[0]), name: this.studyObjects[0].name || '' };
                }
                return null;
            },

// Helper: try multiple places to find selected profession (course subject)
            getSelectedProfession() {
                if (this.selectedSubject) return { id: this._extractId(this.selectedSubject), name: this.selectedSubject.name || this.selectedSubject.title || '' };
                if (Array.isArray(this.subjects) && this.subjects.length) {
                    const active = this.subjects.find(x => x._active || x.selected || x.isActive || x.active);
                    if (active) return { id: this._extractId(active), name: active.name || active.title || '' };
                    return { id: this._extractId(this.subjects[0]), name: this.subjects[0].name || '' };
                }
                return null;
            },

            closeCreateCourseModal() {
                this.createCourseModalVisible = false;
            },

            onCourseImageChange(e) {
                const f = (e.target && e.target.files && e.target.files[0]) ? e.target.files[0] : null;
                if (!f) {
                    this.createForm.imageFile = null;
                    this.createForm.imageName = '';
                    return;
                }
                this.createForm.imageFile = f;
                this.createForm.imageName = f.name || '';
            },


// Improved loadManagerOptions with more robust parsing and debug logging
            loadManagerOptions() {
                const headers = (typeof this._getAuthHeaders === 'function') ? this._getAuthHeaders() : {};
                const base = (this.store && this.store.apiBase) ? this.store.apiBase.replace(/\/+$/, '') : '';
                const url = (base ? base : '') + '/manage/getAllUser';
                const params = { searchStr: '', current: 1, size: 10, role: 2 };

                // Return a promise so caller can chain
                if (window.ApiCore && typeof window.ApiCore.get === 'function') {
                    const qs = Object.keys(params).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k])).join('&');
                    return window.ApiCore.get(url + '?' + qs)
                        .then(resp => {
                            const raw = resp && resp.data !== undefined ? resp.data : resp || null;
                            // debug raw response
                            try { console.debug('loadManagerOptions ApiCore response:', raw); } catch (e) {}
                            this._populateManagerOptionsFromPayload(raw);
                        })
                        .catch(err => {
                            console.warn('loadManagerOptions ApiCore failed, fallback axios', err);
                            return this._fetchManagerOptionsWithAxios(params, headers);
                        });
                } else {
                    return this._fetchManagerOptionsWithAxios(params, headers);
                }
            },

// Populate managerOptions from a payload (robust)
            _populateManagerOptionsFromPayload(payload) {
                const data = (payload && payload.data !== undefined) ? payload.data : payload;
                // find array
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

                // map with many possible id/name fields
                const mapped = (arr || []).map(u => {
                    const id = (u && (u.userId || u.id || u.user_id || u.uid || u.userId)) || null;
                    const name = (u && (u.name || u.username || u.userName || u.nick || u.realName || u.cnName)) || (u && u.name === undefined ? String(id) : '');
                    return { userId: id, name: name, _raw: u };
                }).filter(x => x.userId !== null && (x.name !== undefined));

                this.managerOptions = mapped;

                // debug
                try { console.debug('managerOptions resolved:', this.managerOptions); } catch (e) {}

                // auto select first if none selected (makes dropdown show value)
                if ((!this.createForm.managerId || this.createForm.managerId === null) && this.managerOptions.length) {
                    this.createForm.managerId = this.managerOptions[0].userId;
                }
            },


            _fetchManagerOptionsWithAxios(params, headers) {
                const base = (this.store && this.store.apiBase) ? this.store.apiBase.replace(/\/+$/, '') : '';
                const url = (base ? base : '') + '/manage/getAllUser';
                if (!window.axios || typeof window.axios.get !== 'function') {
                    console.error('axios is not available for fetching manager options');
                    this.managerOptions = [];
                    return Promise.resolve();
                }
                return window.axios.get(url, { params: params, headers: headers, withCredentials: true })
                    .then(res => {
                        const raw = res && res.data !== undefined ? res.data : res || null;
                        try { console.debug('loadManagerOptions axios response:', raw); } catch (e) {}
                        this._populateManagerOptionsFromPayload(raw);
                    })
                    .catch(err => {
                        console.error('fetch managers failed', err);
                        this.managerOptions = [];
                    });
            },

            _getAuthHeaders() {
                try {
                    if (window.ApiCore && typeof window.ApiCore.getToken === 'function') {
                        const t = window.ApiCore.getToken();
                        if (t) return { Authorization: 'Bearer ' + t };
                    }
                } catch (e) { /* ignore */ }
                try {
                    const t2 = localStorage.getItem('sf_token') || localStorage.getItem('token') || null;
                    if (t2) return { Authorization: 'Bearer ' + t2 };
                } catch (e) { /* ignore */ }
                return {};
            },

// 用到 _getAuthHeaders() 的 submitCreateCourse（替换你原来的实现）
            async submitCreateCourse() {
                // validation (with user notifications)
                if (!this.createForm.name || !this.createForm.name.trim()) { alert('课程名称不能为空'); return; }
                if ((this.createForm.name || '').length > 32) { alert('课程名称不能超过32字符'); return; }
                if (!this.createForm.description || !this.createForm.description.trim()) { alert('课程描述不能为空'); return; }
                if ((this.createForm.description || '').length > 255) { alert('课程描述不能超过255字符'); return; }
                if (!this.createForm.imageFile) { alert('请上传课程封面'); return; }
                if (!this.createForm.managerId) { alert('请选择课程管理员'); return; }

                // get professionId reliably from selectedSubject or currentProfessionId
                let professionId = null;
                if (this.selectedSubject) professionId = this._extractId(this.selectedSubject);
                if (!professionId && this.currentProfessionId) professionId = this.currentProfessionId;
                if (!professionId) {
                    const sp = this.getSelectedProfession();
                    professionId = sp ? sp.id : null;
                }
                professionId = Number(professionId || 0);
                if (!professionId) { alert('当前未选课程科目'); return; }

                // prepare FormData
                const fd = new FormData();
                fd.append('image', this.createForm.imageFile);
                fd.append('name', (this.createForm.name || '').trim());
                fd.append('description', (this.createForm.description || '').trim());
                fd.append('managerId', Number(this.createForm.managerId));
                // append professionIds as repeated param
                fd.append('professionIds', professionId);

                // debug listing of FormData keys (optional)
                try {
                    const entries = [];
                    for (const pair of fd.entries()) {
                        entries.push(pair[0] + ':' + (pair[1] && pair[1].name ? pair[1].name : String(pair[1])));
                    }
                    console.debug('submitCreateCourse FormData keys:', entries);
                } catch (e) {}

                this.createLoading = true;

                // ensure we have Authorization header
                const headers = (typeof this._getAuthHeaders === 'function') ? this._getAuthHeaders() : {};

                // send using axios preferentially because ApiCore.post may not handle FormData in some wrappers
                const base = (this.store && this.store.apiBase) ? this.store.apiBase.replace(/\/+$/, '') : '';
                const url = (base ? base : '') + '/course/add';

                try {
                    let res;
                    if (window.axios && typeof window.axios.post === 'function') {
                        // do not set Content-Type here — browser will set multipart boundary automatically
                        const cfg = { headers: Object.assign({}, headers), withCredentials: true };
                        res = await window.axios.post(url, fd, cfg);
                    } else if (window.ApiCore && typeof window.ApiCore.post === 'function') {
                        // fallback to ApiCore (pass headers explicitly)
                        res = await window.ApiCore.post('/course/add', fd, { headers: headers, withCredentials: true });
                    } else {
                        throw new Error('No HTTP client available for POST');
                    }

                    console.info('create course ok', res && res.data ? res.data : res);
                    alert('课程创建成功');
                    this.createCourseModalVisible = false;
                    if (typeof this.refreshCourses === 'function') await this.refreshCourses();
                } catch (err) {
                    console.error('create course failed', err);
                    const msg = err && err.response && err.response.data && (err.response.data.msg || err.response.data.message)
                        ? (err.response.data.msg || err.response.data.message)
                        : (err && err.message ? err.message : '网络或服务器错误');
                    alert('创建失败：' + msg);
                } finally {
                    this.createLoading = false;
                }
            },

            // 跳转到课程详情页面（与 HomePage 中的 _navigateToCourse 同逻辑）
            navigateToCourse(c) {
                if (!c) return;
                const raw = c.raw || {};
                const id = Number(raw.courseId || raw.id || raw.course_id || raw.courseId) || null;
                const fallbackId = Number(c.id || c.courseId) || null;
                const courseId = id || fallbackId;
                if (!courseId) { alert('无法获取课程ID'); return; }

                // 使用 router 优先
                try {
                    if (this.$router && typeof this.$router.push === 'function') {
                        this.$router.push({ name: 'CourseDetail', query: { courseId: courseId } });
                        return;
                    }
                } catch (e) {}

                // fallback to hash navigation
                try {
                    const prefix = window.location.origin + (window.location.pathname || '');
                    window.location.href = prefix.replace(/\/$/, '') + '#/course-detail?courseId=' + encodeURIComponent(courseId);
                } catch (e) {
                    window.open('/#/course-detail?courseId=' + encodeURIComponent(courseId), '_self');
                }
            }
        },
        template: `
      <div>
        <div id="shared-header"></div>

        <div style="padding:18px;max-width:1200px;margin:0 auto">
          <!-- Search area -->
          <div style="background:#fff;border:1px solid #eef2f7;border-radius:8px;padding:18px;margin-bottom:18px;box-shadow:0 2px 6px rgba(15,30,50,0.02)">
            <div style="display:flex;align-items:center;gap:12px">
              <div style="flex:1;display:flex;align-items:center;gap:8px;border:1px solid #eef2f7;border-radius:8px;padding:8px 12px;background:#fbfdff">
                <input v-model="searchQuery" @keyup.enter="onSearch" placeholder="请输入你要搜索的课程" style="flex:1;border:none;outline:none;font-size:14px;background:transparent" />
                <button @click="onSearch" style="background:#2b7cff;border:none;color:#fff;padding:8px 12px;border-radius:6px;cursor:pointer">搜索</button>
              </div>
            </div>
            
            <!-- 新增课程按钮（只对超级管理员显示） -->
            <div style="display:flex;align-items:center;gap:8px;margin-left:auto">
                <button v-if="isSuperAdmin" @click="openCreateCourseModal"
                    style="background:#2b7cff;color:#fff;border:none;padding:8px 12px;border-radius:6px;cursor:pointer">
                    新增课程
                 </button>
            </div>
            
            <!-- 新增课程 Modal -->
<div v-if="createCourseModalVisible" style="position:fixed;left:0;top:0;right:0;bottom:0;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;z-index:2000;">
  <div style="width:520px;background:#fff;border-radius:8px;padding:18px;box-shadow:0 8px 40px rgba(0,0,0,0.12);">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <div style="font-weight:600">新增课程</div>
      <button @click="closeCreateCourseModal" style="background:transparent;border:none;font-size:18px;cursor:pointer">✕</button>
    </div>

    <div style="font-size:14px;color:#666;margin-bottom:8px">
      <div>学习对象：<span style="color:#333">{{ currentLearningObjectName || '未选择' }}</span></div>
      <div style="margin-top:6px">课程科目：<span style="color:#333">{{ currentProfessionName || '未选择' }}</span></div>
    </div>

    <div style="display:flex;flex-direction:column;gap:10px">
      <div>
        <div style="font-size:12px;color:#666;margin-bottom:6px">名称 <span style="color:#d9534f">*</span></div>
        <input v-model="createForm.name" maxlength="32" placeholder="请输入课程名称（最多32字符）" style="width:100%;padding:8px;border:1px solid #e6eef8;border-radius:6px" />
        <div style="font-size:12px;color:#999;text-align:right">{{ (createForm.name || '').length }}/32</div>
      </div>

      <div>
        <div style="font-size:12px;color:#666;margin-bottom:6px">描述 <span style="color:#d9534f">*</span></div>
        <textarea v-model="createForm.description" maxlength="255" placeholder="请填写课程的描述（最多255字符）" style="width:100%;min-height:100px;padding:8px;border:1px solid #e6eef8;border-radius:6px"></textarea>
        <div style="font-size:12px;color:#999;text-align:right">{{ (createForm.description || '').length }}/255</div>
      </div>

      <div>
        <div style="font-size:12px;color:#666;margin-bottom:6px">课程封面 <span style="color:#d9534f">*</span></div>
        <input type="file" accept="image/*" @change="onCourseImageChange" />
        <div v-if="createForm.imageName" style="font-size:12px;color:#666;margin-top:6px">已选择：{{ createForm.imageName }}</div>
      </div>

      <div>
        <div style="font-size:12px;color:#666;margin-bottom:6px">课程管理员 <span style="color:#d9534f">*</span></div>
        <select v-model.number="createForm.managerId" style="width:100%;padding:8px;border:1px solid #e6eef8;border-radius:6px">
          <option :value="null">请选择课程管理员</option>
          <option v-for="u in managerOptions" :key="u.userId" :value="u.userId">{{ u.name }}</option>
        </select>
        <div style="font-size:12px;color:#8894a6;margin-top:6px">若显示指派用户无管理权限，检查是否关闭了课程管理员角色的课程管理权限</div>
      </div>

      <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:6px">
        <button @click="closeCreateCourseModal" style="background:#fff;border:1px solid #ccc;padding:6px 12px;border-radius:6px;cursor:pointer">取 消</button>
        <button @click="submitCreateCourse" :disabled="createLoading" style="background:#2b7cff;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer">创 建</button>
      </div>
    </div>
  </div>
</div>

            <!-- filters (study first, subjects below) -->
            <div style="margin-top:14px;display:flex;flex-direction:column;gap:12px">
              <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
                <div style="min-width:110px;color:#666;align-self:center">学习对象：</div>
                <div style="display:flex;gap:8px;flex-wrap:wrap">
                  <button v-for="(s, idx) in studyObjects" :key="'s-'+idx" @click="onSelectStudy(s)"
                          :style="{ padding:'8px 14px', borderRadius:'18px', border: selectedStudy===s ? '1px solid #2b7cff' : '1px solid #e6edf8', background: selectedStudy===s ? '#2b7cff' : '#fff', color: selectedStudy===s ? '#fff' : '#333', cursor:'pointer' }">
                    {{ s.name || s.title || s.label || s.value || ('对象' + (idx+1)) }}
                  </button>
                </div>
              </div>

              <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
                <div style="min-width:110px;color:#666;align-self:center">课程科目：</div>
                <div style="display:flex;gap:8px;flex-wrap:wrap">
                  <button v-for="(sub, i) in subjects" :key="'sub-'+i" @click="onSelectSubject(sub)"
                          :style="{ padding:'6px 12px', borderRadius:'6px', border: selectedSubject===sub ? '1px solid #2b7cff' : '1px solid #e6edf8', background: selectedSubject===sub ? '#2b7cff' : '#fff', color: selectedSubject===sub ? '#fff' : '#333', cursor:'pointer' }">
                    {{ sub.name || sub.title || sub.label || sub.value || ('科目' + (i+1)) }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- courses area -->
          <div style="margin-top:12px">
            <h4 style="text-align:center;color:#666;margin-bottom:18px">为你筛选的课程</h4>

            <div v-if="loadingStudy || loadingSubjects || loadingCourses" style="text-align:center;padding:24px;color:#888">加载中...</div>

            <div v-else-if="(!courses || courses.length===0)" style="text-align:center;padding:40px;color:#999">
              <div style="font-size:16px;margin-bottom:8px">暂无课程</div>
              <div style="font-size:13px;color:#bbb">请尝试切换学习对象或课程科目，或修改搜索关键词</div>
            </div>

            <div v-else style="display:grid;grid-template-columns:repeat(3,1fr);gap:18px">
              <div v-for="(c, idx) in courses" :key="'course-'+idx" style="background:#fff;border-radius:8px;border:1px solid #eef2f7;overflow:hidden;display:flex;flex-direction:column">
                <div style="height:160px;overflow:hidden">
                  <img :src="c.icon || defaultCourseIcon" @error="onCourseImgError" style="width:100%;height:160px;object-fit:cover" />
                </div>
                <div style="padding:12px;flex:1;display:flex;flex-direction:column;justify-content:space-between">
                  <div>
                    <div style="font-weight:600;color:#333;margin-bottom:8px">{{ c.name || c.courseName }}</div>
                    <div style="color:#9aa7b6;font-size:13px">浏览量 {{ c.click || c.view || 0 }}</div>
                  </div>
                  <div style="text-align:right;margin-top:12px">
                    <button @click="navigateToCourse(c)" style="padding:8px 12px;border-radius:16px;background:#2b7cff;color:#fff;border:none;cursor:pointer">进入课堂</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- load more -->
            <div v-if="courses && courses.length>0" style="text-align:center;margin-top:18px">
              <button v-if="!noMore" @click="loadMoreCourses" :disabled="loadingCourses" style="padding:10px 14px;border-radius:6px;border:1px solid #e6edf8;background:#fff;cursor:pointer">加载更多</button>
              <div v-else style="color:#999;padding:8px">没有更多课程</div>
            </div>
          </div>
        </div>
      </div>
    `
    };

    window.CoursesPageComponent = CoursesPage;
})();