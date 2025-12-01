// AdminPage (UMD) - 管理页面（包含：单个学校管理 /school/*，学习对象管理 /courseType/*，课程科目管理 /profession/*，角色权限管理 /manage/*）
// 说明：所有接口优先使用 window.ApiCore（若存在），否则回退到 window.axios，axios 请求会携带 Authorization: Bearer <token>（从 ApiCore.getToken 或 localStorage.sf_token）
// 要求：不要破坏原有模块（学习对象/课程科目/角色权限）的行为；新增 单个学校管理（listAll/add/update/delete）
(function () {
    const AdminPage = {
        props: ['store'],
        data() {
            return {
                // 左侧菜单与路由状态
                collapsed: {
                    school: false,
                    classes: false,
                    users: false,
                    '授予课程': false,
                    '学习对象管理': false,
                    '课程科目管理': false,
                    '角色权限管理': false
                },
                activeTop: 'school',
                activeSub: 'singleSchool',
                menu: [
                    { key: 'school', title: '学校管理', icon: '🏫', subs: [{ key: 'singleSchool', title: '单个学校管理' }, { key: 'bulkSchool', title: '批量新增学校' }] },
                    { key: 'classes', title: '班级管理', icon: '🎒', subs: [{ key: 'singleClass', title: '单个班级管理' }, { key: 'bulkClass', title: '批量新增班级' }] },
                    { key: 'users', title: '用户管理', icon: '👤', subs: [{ key: 'singleUser', title: '单个用户管理' }, { key: 'bulkUser', title: '批量新增用户' }] },
                    { key: '授予课程', title: '授予课程', icon: '📚', subs: [{ key: 'grantSingle', title: '授予单个课程' }, { key: 'grantBulk', title: '批量授予课程' }] },
                    { key: '学习对象管理', title: '学习对象管理', icon: '🧭', subs: [] },
                    { key: '课程科目管理', title: '课程科目管理', icon: '≡', subs: [] },
                    { key: '角色权限管理', title: '角色权限管理', icon: '🔒', subs: [] }
                ],

                // --- 学校管理（/school/*）
                sch_loading: false,
                sch_error: null,
                sch_items: [], // { schoolId, name, _raw, _saving }
                sch_search: '',

                // 添加到 data() 返回对象中（与 sch_* 在一起）
                cl_loading: false,
                cl_error: null,
                cl_items: [],              // 列表数据
                cl_selectedSchoolId: null, // 下拉选中的学校 id
                cl_searchStr: '',          // 搜索班级名
                cl_gradeFilter: '',        // 年级筛选
                cl_modalVisible: false,    // 创建班级 modal 是否可见
                cl_form: {                 // modal 表单
                    schoolId: null,
                    name: '',
                    grade: ''
                },
                cl_autoFilterDebounce: null,

                user_loading: false,
                user_error: null,
                user_items: [],         // 列表项 (每项包含 userId, username, phone, email, role, classeId, schoolId, _raw, _saving)
                user_search: '',        // 搜索关键词（用户名或账号）
                user_roleFilter: '',    // 角色筛选（例如: 'STUDENT','TEACHER' 等）
                user_modalVisible: false,
                user_form: {
                    userId: null,
                    name: '',
                    password: '', // 创建时必填，编辑时可空或省略
                    phone: '',
                    email: '',
                    classeId: null,
                    schoolId: null,
                    role: '', // 与后端角色标识对应
                    schoolNumber: '' // 新增：工号/学号（字符串，必填）
                },
                user_editMode: false,// modal 是新增还是编辑
                user_class_options: [], // [{ id, name }] — 班级下拉用于用户 modal（由 /classe/listAllBySchoolId 填充）
                user_current: 1,   // 当前页
                user_size: 10,     // 每页条数
                user_total: 0,      // 总条数（来自后端）

                grant_role: 0,                // 选择角色：学生0 教师1 课程管理员2（默认 0）
                grant_searchType: '',         // 可传给后端的 searchType（可选，UI 可扩展）
                grant_searchStr: '',          // 搜索字符串
                grant_loading: false,
                grant_error: null,
                grant_items: [],              // user-course list, 每项 { user: {...}, simpleCourseVOList: [...] }
                grant_course_list: [],        // /course/getSimpleCourseVO 返回的简要课程列表，用于下拉选择添加课程
                grant_current: 1,
                grant_size: 10,
                grant_total: 0,

                // --- 学习对象管理（courseType）
                ct_loading: false,
                ct_error: null,
                ct_items: [], // { id, name, _raw, _saving }

                // --- 课程科目管理（profession）
                prof_loading: false,
                prof_error: null,
                prof_items: [], // { professionId, courseTypeId, name, _raw, _saving }
                selectedCourseTypeId: null,

                // --- 角色权限管理状态
                rp_loading: false,
                rp_error: null,
                rp_roles: [],
                rp_perms_by_cat: {},
                rp_cat_order: []
            };
        },
        computed: {
            roleCode() { return this.store && this.store.user ? this.store.user.roleCode : null; },
            allowed() { return this.roleCode === 2 || this.roleCode === 3; },
            userFormValid() {
                if (!this.user_form) return false;
                const hasName = (this.user_form.username || '').trim().length > 0;
                const hasRole = (this.user_form.role !== '' && this.user_form.role !== null && this.user_form.role !== undefined);
                const hasSchoolNumber = (this.user_form.schoolNumber || '').trim().length > 0;
                if (this.user_editMode) {
                    // 编辑时也要求工号/学号必填
                    return hasName && !!hasRole && hasSchoolNumber;
                } else {
                    const hasPassword = (this.user_form.password || '').trim().length > 0;
                    return hasName && hasPassword && !!hasRole && hasSchoolNumber;
                }
            }
        },
        mounted() {
            try { if (window.mountHeader) window.mountHeader(this.store, '#shared-header'); } catch (e) {}
            // 默认展开 activeTop 所在组（若有子项）
            this.menu.forEach(m => { if (m.key === this.activeTop && m.subs && m.subs.length) this.collapsed[m.key] = true; });

            // 初次根据 activeTop/sub 加载数据
            if (this.activeTop === 'school' && this.activeSub === 'singleSchool') this.loadSchools(this.sch_search);
            if (this.activeTop === '学习对象管理') this.loadCourseTypes();
            if (this.activeTop === '课程科目管理') this.ensureCourseTypesAndLoadProfessions();
            if (this.activeTop === '角色权限管理') this.loadRolePermissions();
            if (this.activeTop === '授予课程' && this.activeSub === 'grantSingle') {
                // 先加载课程下拉（SimpleCourseVO）
                this.loadSimpleCourses();
                // 然后加载用户-课程映射列表（默认页）
                this.loadUserCourseAllowances(this.grant_role, this.grant_current || 1, this.grant_size || 10, this.grant_searchType, this.grant_searchStr);
            }
        },
        watch: {
            activeTop(newVal) {
                if (newVal === 'school' && this.activeSub === 'singleSchool') this.loadSchools(this.sch_search);
                if (newVal === '学习对象管理') this.loadCourseTypes();
                if (newVal === '课程科目管理') this.ensureCourseTypesAndLoadProfessions();
                if (newVal === '角色权限管理') this.loadRolePermissions();
            },
            activeSub(newVal) {
                if (this.activeTop === 'school' && newVal === 'singleSchool') this.loadSchools(this.sch_search);
            },
            cl_selectedSchoolId(newVal, oldVal) {
                if (newVal && newVal !== oldVal) {
                    this.loadClasses(newVal, this.cl_searchStr, this.cl_gradeFilter);
                }
            },
            cl_searchStr(newVal) {
                if (this.cl_autoFilterDebounce) clearTimeout(this.cl_autoFilterDebounce);
                this.cl_autoFilterDebounce = setTimeout(() => {
                    if (this.cl_selectedSchoolId) this.loadClasses(this.cl_selectedSchoolId, this.cl_searchStr, this.cl_gradeFilter);
                }, 350);
            },
            cl_gradeFilter(newVal) {
                if (this.cl_autoFilterDebounce) clearTimeout(this.cl_autoFilterDebounce);
                this.cl_autoFilterDebounce = setTimeout(() => {
                    if (this.cl_selectedSchoolId) this.loadClasses(this.cl_selectedSchoolId, this.cl_searchStr, this.cl_gradeFilter);
                }, 350);
            }
        },
        methods: {
            // 左侧菜单行为
            // 替换原来的 toggleGroup 与 chooseSub
            toggleGroup(key) {
                const group = this.menu.find(m => m.key === key);
                if (!group) return;

                if (!group.subs || group.subs.length === 0) {
                    this.activeTop = key;
                    this.activeSub = '';
                    Object.keys(this.collapsed).forEach(k => { if (k !== key) this.collapsed[k] = false; });
                    return;
                }

                const willOpen = !this.collapsed[key];
                this.collapsed[key] = willOpen;

                if (willOpen) {
                    this.activeTop = key;
                    const firstSub = group.subs[0];
                    if (firstSub && firstSub.key) {
                        this.activeSub = firstSub.key;

                        // existing behaviors for specific groups
                        if (key === 'classes' && this.activeSub === 'singleClass') this.ensureSchoolsAndLoadClasses();
                        if (key === '学习对象管理') this.loadCourseTypes();
                        if (key === '课程科目管理') this.ensureCourseTypesAndLoadProfessions();
                        if (key === '角色权限管理') this.loadRolePermissions();

                        // NEW: when opening 授予课程 group and the first sub is grantSingle, ensure courses loaded and load the list
                        if (key === '授予课程' && this.activeSub === 'grantSingle') {
                            this.ensureGrantCoursesLoaded()
                                .then(() => {
                                    this.loadUserCourseAllowances(this.grant_role, this.grant_current || 1, this.grant_size || 10, this.grant_searchType, this.grant_searchStr);
                                })
                                .catch(() => {
                                    // even if course list failed, still try to load the allowances
                                    this.loadUserCourseAllowances(this.grant_role, this.grant_current || 1, this.grant_size || 10, this.grant_searchType, this.grant_searchStr);
                                });
                        }
                    }
                } else {
                    this.activeSub = '';
                }

                Object.keys(this.collapsed).forEach(k => { if (k !== key) this.collapsed[k] = false; });
            },

// ADD this helper method into methods (near other grant methods)
            ensureGrantCoursesLoaded() {
                // If already loaded, resolve immediately
                if (Array.isArray(this.grant_course_list) && this.grant_course_list.length > 0) {
                    return Promise.resolve(this.grant_course_list);
                }
                // Otherwise call loadSimpleCourses (it returns a Promise)
                try {
                    return Promise.resolve(this.loadSimpleCourses()).then(() => {
                        return this.grant_course_list || [];
                    }).catch(err => {
                        console.warn('ensureGrantCoursesLoaded failed', err);
                        return [];
                    });
                } catch (e) {
                    console.warn('ensureGrantCoursesLoaded exception', e);
                    return Promise.resolve([]);
                }
            },

            chooseSub(topKey, subKey) {
                this.activeTop = topKey;
                this.activeSub = subKey;
                if (this.collapsed[topKey] === false) this.collapsed[topKey] = true;

                if (topKey === 'classes' && subKey === 'singleClass') {
                    this.ensureSchoolsAndLoadClasses();
                } else if (topKey === '学习对象管理') {
                    this.loadCourseTypes();
                } else if (topKey === '课程科目管理') {
                    this.ensureCourseTypesAndLoadProfessions();
                } else if (topKey === '角色权限管理') {
                    this.loadRolePermissions();
                } else if (topKey === '授予课程' && subKey === 'grantSingle') {
                    this.ensureGrantCoursesLoaded().then(() => {
                        this.loadUserCourseAllowances(this.grant_role, this.grant_current || 1, this.grant_size || 10, this.grant_searchType, this.grant_searchStr);
                    }).catch(() => {
                        this.loadUserCourseAllowances(this.grant_role, this.grant_current || 1, this.grant_size || 10, this.grant_searchType, this.grant_searchStr);
                    });
                }
            },
            contentTitle() { const top = this.menu.find(m => m.key === this.activeTop); if (!top) return ''; if (this.activeSub) { const s = (top.subs||[]).find(x=>x.key===this.activeSub); return s ? (top.title + ' - ' + s.title) : top.title; } return top.title; },

            // Helper: get headers with token if axios fallback is used
            _getAuthHeaders() {
                try { if (window.ApiCore && typeof window.ApiCore.getToken === 'function') { const t = window.ApiCore.getToken(); if (t) return { Authorization: 'Bearer ' + t }; } } catch (e) {}
                try { const t2 = localStorage.getItem('sf_token'); if (t2) return { Authorization: 'Bearer ' + t2 }; } catch (e) {}
                return {};
            },

            // ------------------------------------------------------------------
            // ===================== 学校管理 /school/* ============================
            // ------------------------------------------------------------------

            // listAll: GET /school/listAll?size=-1&searchStr=...
            loadSchools(searchStr) {
                this.sch_search = searchStr !== undefined ? searchStr : (this.sch_search || '');
                if (this.sch_loading) return;
                this.sch_loading = true;
                this.sch_error = null;
                this.sch_items = [];

                const headers = this._getAuthHeaders();
                const params = { size: -1, searchStr: this.sch_search || '' };

                const handleFail = (err) => {
                    console.error('loadSchools failed', err);
                    this.sch_error = '获取学校列表失败';
                    this.sch_loading = false;
                };

                if (window.ApiCore && typeof window.ApiCore.get === 'function') {
                    return window.ApiCore.get('/school/listAll?size=-1&searchStr=' + encodeURIComponent(params.searchStr))
                        .then(resp => {
                            const data = resp && resp.data !== undefined ? resp.data : (resp || null);
                            this._handleSchoolsResponse(data);
                        })
                        .catch(err => {
                            console.warn('ApiCore.get /school/listAll failed, fallback to axios', err);
                            return this._fetchSchoolsWithAxios(params, headers).catch(handleFail);
                        })
                        .finally(() => { this.sch_loading = false; });
                } else {
                    return this._fetchSchoolsWithAxios(params, headers).then(()=>{ this.sch_loading=false; }).catch(handleFail);
                }
            },

            // Replace the existing _fetchSchoolsWithAxios and _handleSchoolsResponse with these

            _fetchSchoolsWithAxios(params, headers) {
                if (!window.axios || typeof window.axios.get !== 'function') {
                    this.sch_error = 'No HTTP client available';
                    this.sch_loading = false;
                    return Promise.reject(new Error('no http client'));
                }
                const base = (this.store && this.store.apiBase) ? this.store.apiBase.replace(/\/+$/, '') : '';
                const url = (base ? base : '') + '/school/listAll';
                return window.axios.get(url, { params: params, headers: headers, withCredentials: true })
                    .then(res => {
                        // Log the raw response to help debugging
                        try { console.debug('/school/listAll response', res); } catch (e) {}
                        const data = res && res.data !== undefined ? res.data : (res || null);
                        this._handleSchoolsResponse(data);
                    })
                    .catch(err => { this.sch_error = '请求失败'; console.error(err); });
            },

            _handleSchoolsResponse(payload) {
                // Debug print payload shape
                try { console.debug('handleSchoolsResponse payload:', payload); } catch (e) {}

                if (!payload) { this.sch_error = '无返回数据'; this.sch_items = []; return; }

                // If API returns wrapper { code, msg, data }
                if (payload.code !== undefined && payload.code !== null && payload.code !== 200 && payload.code !== 0) {
                    // non-success code
                    this.sch_error = payload.message || payload.msg || ('错误代码 ' + payload.code);
                    this.sch_items = [];
                    return;
                }

                // Unwrap candidate containers to find the actual array of schools
                let candidate = payload;
                // prefer payload.data when exists
                if (payload.data !== undefined && payload.data !== null) candidate = payload.data;

                // helper to find first array in object
                const findFirstArray = (obj) => {
                    if (!obj) return null;
                    if (Array.isArray(obj)) return obj;
                    // common fields: list, rows, records, data
                    if (Array.isArray(obj.list)) return obj.list;
                    if (Array.isArray(obj.rows)) return obj.rows;
                    if (Array.isArray(obj.records)) return obj.records;
                    if (Array.isArray(obj.data)) return obj.data;
                    // also support page.records or page.list
                    if (obj.page && Array.isArray(obj.page.records)) return obj.page.records;
                    if (obj.page && Array.isArray(obj.page.list)) return obj.page.list;
                    // fallback: scan properties for first array
                    for (const k of Object.keys(obj)) {
                        if (Array.isArray(obj[k])) return obj[k];
                    }
                    return null;
                };

                const arr = findFirstArray(candidate) || [];
                // If arr is empty but candidate itself is an array, use it
                const finalArr = Array.isArray(candidate) ? candidate : arr;

                if (!finalArr || finalArr.length === 0) {
                    // No items found — keep sch_items empty but expose payload for debugging
                    this.sch_items = [];
                    // also set sch_error to empty so UI shows content instead of error
                    // keep debug info in console
                    try { console.warn('No array of schools found in payload. Payload keys:', Object.keys(payload)); } catch (e) {}
                    return;
                }

                // Map to normalized shape
                this.sch_items = finalArr.map(s => ({
                    schoolId: s.schoolId !== undefined ? s.schoolId : (s.id !== undefined ? s.id : (s.school_id !== undefined ? s.school_id : null)),
                    name: s.name || s.schoolName || s.cnName || s.school_name || '',
                    _raw: s,
                    _saving: false
                }));

                try { console.debug('sch_items set:', this.sch_items); } catch (e) {}
            },

            // add -> POST /school/add (SchoolDTO)
            createSchool() {
                const name = prompt('请输入学校名称：');
                if (!name || !name.trim()) return;
                const payload = { schoolId: null, name: name.trim() };
                const headers = this._getAuthHeaders();

                const doPost = () => {
                    if (window.ApiCore && typeof window.ApiCore.post === 'function') return window.ApiCore.post('/school/add', payload);
                    if (!window.axios || typeof window.axios.post !== 'function') return Promise.reject(new Error('no http client'));
                    const base = (this.store && this.store.apiBase) ? this.store.apiBase.replace(/\/+$/, '') : '';
                    const url = (base ? base : '') + '/school/add';
                    return window.axios.post(url, payload, { headers: headers, withCredentials: true });
                };

                this.sch_loading = true;
                doPost()
                    .then(res => {
                        console.info('createSchool ok', res && res.data ? res.data : res);
                        this.loadSchools(this.sch_search);
                    })
                    .catch(err => {
                        console.error('createSchool failed', err);
                        alert('创建学校失败');
                    })
                    .finally(() => { this.sch_loading = false; });
            },

            // update -> POST /school/update (SchoolDTO)
            editSchool(item) {
                if (!item) return;
                const newName = prompt('编辑学校名称：', item.name || '');
                if (newName === null) return;
                const trimmed = (newName || '').trim();
                if (!trimmed) { alert('名称不能为空'); return; }

                const payload = { schoolId: item.schoolId, name: trimmed };
                const headers = this._getAuthHeaders();

                const doPost = () => {
                    if (window.ApiCore && typeof window.ApiCore.post === 'function') return window.ApiCore.post('/school/update', payload);
                    if (!window.axios || typeof window.axios.post !== 'function') return Promise.reject(new Error('no http client'));
                    const base = (this.store && this.store.apiBase) ? this.store.apiBase.replace(/\/+$/, '') : '';
                    const url = (base ? base : '') + '/school/update';
                    return window.axios.post(url, payload, { headers: headers, withCredentials: true });
                };

                item._saving = true;
                doPost()
                    .then(res => {
                        console.info('editSchool ok', res && res.data ? res.data : res);
                        item.name = trimmed;
                    })
                    .catch(err => {
                        console.error('editSchool failed', err);
                        alert('更新学校失败');
                    })
                    .finally(() => { item._saving = false; });
            },

            // delete -> POST /school/delete (SchoolDTO)
            deleteSchool(item) {
                if (!item) return;
                if (!confirm('确定删除学校 "' + (item.name || '') + '" 吗？')) return;
                const payload = { schoolId: item.schoolId };
                const headers = this._getAuthHeaders();

                const doPost = () => {
                    if (window.ApiCore && typeof window.ApiCore.post === 'function') return window.ApiCore.post('/school/delete', payload);
                    if (!window.axios || typeof window.axios.post !== 'function') return Promise.reject(new Error('no http client'));
                    const base = (this.store && this.store.apiBase) ? this.store.apiBase.replace(/\/+$/, '') : '';
                    const url = (base ? base : '') + '/school/delete';
                    return window.axios.post(url, payload, { headers: headers, withCredentials: true });
                };

                item._saving = true;
                doPost()
                    .then(res => {
                        console.info('deleteSchool ok', res && res.data ? res.data : res);
                        this.sch_items = this.sch_items.filter(s => s.schoolId !== item.schoolId);
                    })
                    .catch(err => {
                        console.error('deleteSchool failed', err);
                        alert('删除失败');
                    })
                    .finally(() => { item._saving = false; });
            },

            // ------------------------------------------------------------------
            // ===================== 班级（classe） =========================
            // ------------------------------------------------------------------
            // 新增班级相关方法（确保这些方法只在文件中出现一次）

// 确保学校已加载后使用首个学校加载班级
            ensureSchoolsAndLoadClasses() {
                const already = (this.sch_items && this.sch_items.length);
                // loadSchools 返回 Promise（如你实现），因此用 then
                this.loadSchools().then(() => {
                    if (!this.cl_selectedSchoolId && this.sch_items && this.sch_items.length) {
                        this.cl_selectedSchoolId = this.sch_items[0].schoolId;
                    }
                    if (this.cl_selectedSchoolId) this.loadClasses(this.cl_selectedSchoolId, this.cl_searchStr, this.cl_gradeFilter);
                }).catch(() => {
                    if (this.cl_selectedSchoolId) this.loadClasses(this.cl_selectedSchoolId, this.cl_searchStr, this.cl_gradeFilter);
                });

                if (already && !this.cl_selectedSchoolId && this.sch_items.length) {
                    this.cl_selectedSchoolId = this.sch_items[0].schoolId;
                    this.loadClasses(this.cl_selectedSchoolId, this.cl_searchStr, this.cl_gradeFilter);
                }
            },

// 加载班级（GET /classe/listAllBySchoolId）
            loadClasses(schoolId, searchStr, grade) {
                if (!schoolId) { this.cl_items = []; return; }
                this.cl_loading = true;
                this.cl_error = null;
                this.cl_items = [];

                const headers = this._getAuthHeaders();
                const params = { current: 1, size: -1, searchStr: searchStr || '', schoolId: schoolId, grade: grade || '' };

                const base = (this.store && this.store.apiBase) ? this.store.apiBase.replace(/\/+$/, '') : '';
                const url = (base ? base : '') + '/classe/listAllBySchoolId';

                const handleFail = (err) => {
                    console.error('loadClasses error', err);
                    this.cl_error = '获取班级失败';
                    this.cl_loading = false;
                };

                if (window.ApiCore && typeof window.ApiCore.get === 'function') {
                    return window.ApiCore.get(url + '?current=1&size=-1&searchStr=' + encodeURIComponent(params.searchStr) + '&schoolId=' + encodeURIComponent(params.schoolId) + (params.grade ? ('&grade=' + encodeURIComponent(params.grade)) : ''))
                        .then(resp => {
                            const data = resp && resp.data !== undefined ? resp.data : (resp || null);
                            this._handleClassesResponse(data);
                        })
                        .catch(err => {
                            console.warn('ApiCore.get /classe/listAllBySchoolId failed, fallback to axios', err);
                            return this._fetchClassesWithAxios(params, headers).catch(handleFail);
                        })
                        .finally(() => { this.cl_loading = false; });
                } else {
                    return this._fetchClassesWithAxios(params, headers).then(()=>{ this.cl_loading=false; }).catch(handleFail);
                }
            },

            _fetchClassesWithAxios(params, headers) {
                if (!window.axios || typeof window.axios.get !== 'function') {
                    this.cl_error = 'No HTTP client available';
                    this.cl_loading = false;
                    return Promise.reject(new Error('no http client'));
                }
                const base = (this.store && this.store.apiBase) ? this.store.apiBase.replace(/\/+$/, '') : '';
                const url = (base ? base : '') + '/classe/listAllBySchoolId';
                return window.axios.get(url, { params: params, headers: headers, withCredentials: true })
                    .then(res => {
                        try { console.debug('/classe/listAllBySchoolId response', res); } catch (e) {}
                        const data = res && res.data !== undefined ? res.data : (res || null);
                        this._handleClassesResponse(data);
                    })
                    .catch(err => { this.cl_error = '请求失败'; console.error(err); });
            },

            _handleClassesResponse(payload) {
                try { console.debug('handleClassesResponse payload:', payload); } catch (e) {}

                if (!payload) { this.cl_error = '无返回数据'; this.cl_items = []; return; }
                if (payload.code !== undefined && payload.code !== null && payload.code !== 200 && payload.code !== 0) {
                    this.cl_error = payload.message || payload.msg || ('错误代码 ' + payload.code);
                    this.cl_items = []; return;
                }

                let candidate = payload;
                if (payload.data !== undefined && payload.data !== null) candidate = payload.data;

                // 支持 data.list / data.records / rows / list / data 等常见容器
                const findFirstArray = (obj) => {
                    if (!obj) return null;
                    if (Array.isArray(obj)) return obj;
                    if (Array.isArray(obj.list)) return obj.list;
                    if (Array.isArray(obj.rows)) return obj.rows;
                    if (Array.isArray(obj.records)) return obj.records;
                    if (Array.isArray(obj.data)) return obj.data;
                    if (obj.page && Array.isArray(obj.page.records)) return obj.page.records;
                    if (obj.page && Array.isArray(obj.page.list)) return obj.page.list;
                    for (const k of Object.keys(obj)) { if (Array.isArray(obj[k])) return obj[k]; }
                    return null;
                };

                const arr = findFirstArray(candidate) || [];
                const finalArr = Array.isArray(candidate) ? candidate : arr;

                if (!finalArr || finalArr.length === 0) {
                    this.cl_items = [];
                    try { console.warn('No array of classes found in payload. Payload keys:', Object.keys(payload)); } catch (e) {}
                    return;
                }

                this.cl_items = finalArr.map(c => ({
                    classeId: c.classeId !== undefined ? c.classeId : (c.id !== undefined ? c.id : null),
                    name: c.name || c.classeName || '',
                    schoolId: c.schoolId !== undefined ? c.schoolId : (c.school_id !== undefined ? c.school_id : null),
                    grade: c.grade || c.gradeName || '',
                    _raw: c,
                    _saving: false
                }));

                try { console.debug('cl_items set:', this.cl_items); } catch (e) {}
            },

// 打开创建 modal（下拉从 sch_items 填充）
            openCreateClassModal() {
                this.loadSchools().then(() => {
                    if (!this.cl_form.schoolId && this.sch_items && this.sch_items.length) this.cl_form.schoolId = this.sch_items[0].schoolId;
                    this.cl_form.name = '';
                    this.cl_form.grade = this.cl_gradeFilter || '';
                    this.cl_modalVisible = true;
                }).catch(() => {
                    if (!this.cl_form.schoolId && this.sch_items && this.sch_items.length) this.cl_form.schoolId = this.sch_items[0].schoolId;
                    this.cl_modalVisible = true;
                });
            },
            closeCreateClassModal() { this.cl_modalVisible = false; },

            submitCreateClassModal() {
                if (!this.cl_form.schoolId) { alert('请先选择学校'); return; }
                const name = (this.cl_form.name || '').trim();
                const grade = (this.cl_form.grade || '').trim();
                if (!name) { alert('班级名称不能为空'); return; }

                const payload = { name: name, schoolId: this.cl_form.schoolId, grade: grade };
                const headers = this._getAuthHeaders();

                const doPost = () => {
                    if (window.ApiCore && typeof window.ApiCore.post === 'function') return window.ApiCore.post('/classe/add', payload);
                    if (!window.axios || typeof window.axios.post !== 'function') return Promise.reject(new Error('no http client'));
                    const base = (this.store && this.store.apiBase) ? this.store.apiBase.replace(/\/+$/, '') : '';
                    const url = (base ? base : '') + '/classe/add';
                    return window.axios.post(url, payload, { headers: headers, withCredentials: true });
                };

                this.cl_loading = true;
                doPost()
                    .then(res => {
                        console.info('createClass ok', res && res.data ? res.data : res);
                        this.cl_modalVisible = false;
                        const loadSchool = this.cl_selectedSchoolId || this.cl_form.schoolId;
                        this.cl_form.name = '';
                        this.cl_form.grade = '';
                        this.loadClasses(loadSchool, this.cl_searchStr, this.cl_gradeFilter);
                    })
                    .catch(err => {
                        console.error('createClass failed', err);
                        alert('创建班级失败');
                    })
                    .finally(() => { this.cl_loading = false; });
            },

// 编辑（保持 prompt 风格，或你可改为 modal）
            editClass(item) {
                if (!item) return;
                const newName = prompt('编辑班级名称：', item.name || '');
                if (newName === null) return;
                const newGrade = prompt('编辑班级年级：', item.grade || '');
                if (newGrade === null) return;
                const trimmedName = (newName || '').trim();
                const trimmedGrade = (newGrade || '').trim();
                if (!trimmedName) { alert('名称不能为空'); return; }

                const payload = {
                    classeId: item.classeId,
                    name: trimmedName,
                    schoolId: item.schoolId || this.cl_selectedSchoolId,
                    grade: trimmedGrade
                };
                const headers = this._getAuthHeaders();

                const doPost = () => {
                    if (window.ApiCore && typeof window.ApiCore.post === 'function') return window.ApiCore.post('/classe/update', payload);
                    if (!window.axios || typeof window.axios.post !== 'function') return Promise.reject(new Error('no http client'));
                    const base = (this.store && this.store.apiBase) ? this.store.apiBase.replace(/\/+$/, '') : '';
                    const url = (base ? base : '') + '/classe/update';
                    return window.axios.post(url, payload, { headers: headers, withCredentials: true });
                };

                item._saving = true;
                doPost()
                    .then(res => {
                        console.info('editClass ok', res && res.data ? res.data : res);
                        item.name = trimmedName;
                        item.grade = trimmedGrade;
                    })
                    .catch(err => {
                        console.error('editClass failed', err);
                        alert('更新失败');
                    })
                    .finally(() => { item._saving = false; });
            },

// 删除
            deleteClass(item) {
                if (!item) return;
                if (!confirm('确定删除班级 "' + (item.name || '') + '" 吗？')) return;
                const payload = { classeId: item.classeId };
                const headers = this._getAuthHeaders();

                const doPost = () => {
                    if (window.ApiCore && typeof window.ApiCore.post === 'function') return window.ApiCore.post('/classe/delete', payload);
                    if (!window.axios || typeof window.axios.post !== 'function') return Promise.reject(new Error('no http client'));
                    const base = (this.store && this.store.apiBase) ? this.store.apiBase.replace(/\/+$/, '') : '';
                    const url = (base ? base : '') + '/classe/delete';
                    return window.axios.post(url, payload, { headers: headers, withCredentials: true });
                };

                item._saving = true;
                doPost()
                    .then(res => {
                        console.info('deleteClass ok', res && res.data ? res.data : res);
                        this.cl_items = this.cl_items.filter(c => c.classeId !== item.classeId);
                    })
                    .catch(err => {
                        console.error('deleteClass failed', err);
                        alert('删除失败');
                    })
                    .finally(() => { item._saving = false; });
            },

            // ------------------------------------------------------------------
            // ===================== 用户（user） =========================
            // ------------------------------------------------------------------
// ----------------- 用户管理 /manage/* -----------------

// 加载用户列表（支持 search 与 role 过滤）
            loadUsers(searchStr, role, current, size) {
                // 更新本地筛选条件
                this.user_search = searchStr !== undefined ? searchStr : (this.user_search || '');
                if (role !== undefined) this.user_roleFilter = role;

                // 支持传入 page/size，否则用 state
                this.user_current = (current !== undefined && current !== null) ? Number(current) : (this.user_current || 1);
                this.user_size = (size !== undefined && size !== null) ? Number(size) : (this.user_size || 10);

                if (this.user_loading) return;
                this.user_loading = true;
                this.user_error = null;
                this.user_items = [];

                const headers = this._getAuthHeaders();
                const base = (this.store && this.store.apiBase) ? this.store.apiBase.replace(/\/+$/, '') : '';
                const url = (base ? base : '') + '/manage/getAllUser';

                // Build params and include role only when it's a valid number
                const params = { searchStr: this.user_search || '', current: this.user_current, size: this.user_size };
                if (this.user_roleFilter !== '' && this.user_roleFilter !== null && this.user_roleFilter !== undefined) {
                    const maybeNum = Number(this.user_roleFilter);
                    if (!Number.isNaN(maybeNum)) params.role = maybeNum;
                }

                if (window.ApiCore && typeof window.ApiCore.get === 'function') {
                    const qs = Object.keys(params).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k])).join('&');
                    return window.ApiCore.get(url + '?' + qs)
                        .then(resp => {
                            const data = resp && resp.data !== undefined ? resp.data : (resp || null);
                            this._handleUsersResponse(data);
                        })
                        .catch(err => {
                            console.warn('ApiCore.get /manage/getAllUser failed, fallback to axios', err);
                            return this._fetchUsersWithAxios(params, headers);
                        })
                        .finally(() => { this.user_loading = false; });
                } else {
                    return this._fetchUsersWithAxios(params, headers)
                        .then(() => { this.user_loading = false; })
                        .catch(err => { this.user_error = '请求失败'; this.user_loading = false; console.error(err); });
                }
            },

// axios helper unchanged except it uses params passed in
            _fetchUsersWithAxios(params, headers) {
                if (!window.axios || typeof window.axios.get !== 'function') { this.user_error='No HTTP client'; this.user_loading=false; return Promise.reject(new Error('no http client')); }
                const base = (this.store && this.store.apiBase) ? this.store.apiBase.replace(/\/+$/, '') : '';
                const url = (base ? base : '') + '/manage/getAllUser';
                return window.axios.get(url, { params: params, headers: headers, withCredentials: true })
                    .then(res => {
                        const data = res && res.data !== undefined ? res.data : (res || null);
                        this._handleUsersResponse(data);
                    })
                    .catch(err => { this.user_error='请求失败'; console.error(err); });
            },

// 处理响应并尝试解析 total（兼容多种后端包装）
            _handleUsersResponse(payload) {
                if (!payload) { this.user_error = '无返回数据'; this.user_items = []; this.user_total = 0; return; }
                if (payload.code !== undefined && payload.code !== null && payload.code !== 200 && payload.code !== 0) {
                    this.user_error = payload.message || payload.msg || ('错误代码 ' + payload.code);
                    this.user_items = []; this.user_total = 0; return;
                }

                // 可能的数据容器
                const data = payload.data !== undefined ? payload.data : payload;

                // 提取数组（records/list/data/直接数组）
                let arr = [];
                if (Array.isArray(data)) arr = data;
                else if (Array.isArray(data.records)) arr = data.records;
                else if (Array.isArray(data.list)) arr = data.list;
                else if (Array.isArray(data.data)) arr = data.data;
                else {
                    for (const k of Object.keys(data || {})) { if (Array.isArray(data[k])) { arr = data[k]; break; } }
                }

                // 提取 total（常见位置）
                let total = 0;
                if (data.total !== undefined && Number.isFinite(Number(data.total))) total = Number(data.total);
                else if (data.page && (data.page.total !== undefined)) total = Number(data.page.total);
                else if (payload.total !== undefined) total = Number(payload.total);
                else if (payload.data && payload.data.total !== undefined) total = Number(payload.data.total);

                this.user_items = arr.map(u => ({
                    userId: u.userId !== undefined ? u.userId : (u.id || u.user_id || null),
                    username: u.username || u.name || u.userName || '',
                    phone: u.phone || u.mobile || '',
                    email: u.email || u.mail || '',
                    role: (u.role !== undefined ? u.role : (u.roleName || u.userRole || '')),
                    classeId: u.classeId || u.classId || null,
                    schoolId: u.schoolId || u.school_id || null,
                    _raw: u,
                    _saving: false
                }));

                this.user_total = Number.isFinite(Number(total)) ? Number(total) : (this.user_items.length || 0);
            },

// 分页控制方法（供 UI 调用）
            onUserPageChange(newPage) {
                const page = Number(newPage) || 1;
                this.loadUsers(this.user_search, this.user_roleFilter, page, this.user_size);
            },
            onUserSizeChange(newSize) {
                const size = Number(newSize) || 10;
                this.loadUsers(this.user_search, this.user_roleFilter, 1, size);
            },
            // Add this method
            loadClassesForUserModal(schoolId) {
                // if no schoolId, clear options
                if (!schoolId) { this.user_class_options = []; return Promise.resolve(); }
                const headers = this._getAuthHeaders();
                const base = (this.store && this.store.apiBase) ? this.store.apiBase.replace(/\/+$/, '') : '';
                const url = (base ? base : '') + '/classe/listAllBySchoolId';
                const params = { current: 1, size: -1, searchStr: '', schoolId: schoolId }; // <-- include searchStr: ''

                if (window.ApiCore && typeof window.ApiCore.get === 'function') {
                    return window.ApiCore.get(url + '?current=1&size=-1&searchStr=' + encodeURIComponent(params.searchStr) + '&schoolId=' + encodeURIComponent(schoolId))
                        .then(resp => {
                            const data = resp && resp.data !== undefined ? resp.data : (resp || null);
                            // extract array similar to _handleClassesResponse but produce minimal list
                            let candidate = data !== undefined && data.data !== undefined ? data.data : data;
                            let arr = [];
                            if (Array.isArray(candidate)) arr = candidate;
                            else if (Array.isArray(candidate.list)) arr = candidate.list;
                            else if (Array.isArray(candidate.records)) arr = candidate.records;
                            else if (candidate.page && Array.isArray(candidate.page.records)) arr = candidate.page.records;
                            else {
                                for (const k of Object.keys(candidate || {})) { if (Array.isArray(candidate[k])) { arr = candidate[k]; break; } }
                            }
                            this.user_class_options = arr.map(c => ({ id: c.classeId !== undefined ? c.classeId : (c.id || null), name: c.name || c.classeName || String(c.classeId || c.id || '') }));
                        })
                        .catch(err => {
                            console.warn('loadClassesForUserModal ApiCore failed', err);
                            return this._fetchClassesForUserModalWithAxios(params, headers);
                        });
                } else {
                    return this._fetchClassesForUserModalWithAxios(params, headers);
                }
            },

            _fetchClassesForUserModalWithAxios(params, headers) {
                if (!window.axios || typeof window.axios.get !== 'function') { this.user_class_options = []; return Promise.reject(new Error('no http client')); }
                const base = (this.store && this.store.apiBase) ? this.store.apiBase.replace(/\/+$/, '') : '';
                const url = (base ? base : '') + '/classe/listAllBySchoolId';
                return window.axios.get(url, { params: params, headers: headers, withCredentials: true })
                    .then(res => {
                        const data = res && res.data !== undefined ? res.data : (res || null);
                        let candidate = data !== undefined && data.data !== undefined ? data.data : data;
                        let arr = [];
                        if (Array.isArray(candidate)) arr = candidate;
                        else if (Array.isArray(candidate.list)) arr = candidate.list;
                        else if (Array.isArray(candidate.records)) arr = candidate.records;
                        else if (candidate.page && Array.isArray(candidate.page.records)) arr = candidate.page.records;
                        else {
                            for (const k of Object.keys(candidate || {})) { if (Array.isArray(candidate[k])) { arr = candidate[k]; break; } }
                        }
                        this.user_class_options = arr.map(c => ({ id: c.classeId !== undefined ? c.classeId : (c.id || null), name: c.name || c.classeName || String(c.classeId || c.id || '') }));
                    })
                    .catch(err => { console.error('fetch classes for modal failed', err); this.user_class_options = []; });
            },


// open create modal
            openCreateUserModal() {
                // ensure school and class lists available for dropdowns if needed
                this.loadSchools(); // optional: ensures sch_items populated
                this.user_form = { userId: null, username: '', password: '', phone: '', email: '', classeId: null, schoolId: null, role: '' };
                this.user_editMode = false;
                this.user_modalVisible = true;
                this.user_modalVisible = true;
                this.user_form.schoolId = this.user_form.schoolId || (this.sch_items && this.sch_items.length ? this.sch_items[0].schoolId : null);
                if (this.user_form.schoolId) this.loadClassesForUserModal(this.user_form.schoolId);
            },

// open edit modal (prefill form)
            openEditUserModal(item) {
                if (!item) return;
                this.loadSchools(); // ensure school list if you want to change school
                this.user_form = {
                    userId: item.userId,
                    username: item.username || '',
                    password: '', // leave empty so backend knows not to change
                    phone: item.phone || '',
                    email: item.email || '',
                    classeId: item.classeId || null,
                    schoolId: item.schoolId || null,
                    role: item.role || ''
                };
                this.user_editMode = true;
                this.user_modalVisible = true;
                this.user_modalVisible = true;
                if (this.user_form.schoolId) this.loadClassesForUserModal(this.user_form.schoolId);
            },

            closeUserModal() {
                this.user_modalVisible = false;
            },

// submit create or update
            submitUserModal() {
                const headers = this._getAuthHeaders();

                // 基本必填校验
                if (!this.user_form.username || !this.user_form.username.trim()) {
                    alert('用户名不能为空');
                    return;
                }

                // 工号/学号 必填
                if (!this.user_form.schoolNumber || !this.user_form.schoolNumber.trim()) {
                    alert('工号/学号不能为空');
                    return;
                }

                // 角色必填（允许为数字 0）
                const rawRole = this.user_form.role;
                if (rawRole === '' || rawRole === null || rawRole === undefined) {
                    alert('请选择角色');
                    return;
                }
                const roleValue = Number(rawRole);
                if (Number.isNaN(roleValue)) {
                    alert('角色值无效');
                    return;
                }

                // 创建时密码必填
                if (!this.user_editMode) {
                    if (!this.user_form.password || !this.user_form.password.trim()) {
                        alert('密码不能为空');
                        return;
                    }
                }

                // 规范 classeId / schoolId（如果为空则传 null）
                const classeIdValue = (this.user_form.classeId === '' || this.user_form.classeId === null || this.user_form.classeId === undefined) ? null : Number(this.user_form.classeId);
                const schoolIdValue = (this.user_form.schoolId === '' || this.user_form.schoolId === null || this.user_form.schoolId === undefined) ? null : Number(this.user_form.schoolId);

                // schoolNumber 作为字符串传给后端
                const schoolNumberValue = (this.user_form.schoolNumber || '').trim();

                if (!this.user_editMode) {
                    // create -> POST /manage/addUser
                    const payload = {
                        name: this.user_form.username.trim(), // 后端期望字段 name
                        password: this.user_form.password,
                        phone: this.user_form.phone || '',
                        email: this.user_form.email || '',
                        classeId: classeIdValue,
                        schoolId: schoolIdValue,
                        role: roleValue,
                        schoolNumber: schoolNumberValue // 新增字段
                    };

                    const doPost = () => {
                        if (window.ApiCore && typeof window.ApiCore.post === 'function') return window.ApiCore.post('/manage/addUser', payload);
                        if (!window.axios || typeof window.axios.post !== 'function') return Promise.reject(new Error('no http client'));
                        const base = (this.store && this.store.apiBase) ? this.store.apiBase.replace(/\/+$/, '') : '';
                        const url = (base ? base : '') + '/manage/addUser';
                        return window.axios.post(url, payload, { headers: headers, withCredentials: true });
                    };

                    this.user_loading = true;
                    doPost()
                        .then(res => {
                            console.info('addUser ok', res && res.data ? res.data : res);
                            this.user_modalVisible = false;
                            this.loadUsers(this.user_search, this.user_roleFilter);
                        })
                        .catch(err => {
                            console.error('addUser failed', err);
                            alert('新增用户失败');
                        })
                        .finally(() => { this.user_loading = false; });
                } else {
                    // update -> POST /manage/updateInfo
                    const payload = {
                        userId: this.user_form.userId,
                        name: this.user_form.username.trim(),
                        // 如果 password 为空则不传（后端保持原密码）
                        password: (this.user_form.password && this.user_form.password.trim()) ? this.user_form.password : undefined,
                        phone: this.user_form.phone || '',
                        email: this.user_form.email || '',
                        classeId: classeIdValue,
                        schoolId: schoolIdValue,
                        role: roleValue,
                        schoolNumber: schoolNumberValue // 新增字段
                    };
                    // 移除 undefined 字段（避免发送 password: undefined）
                    if (payload.password === undefined) delete payload.password;

                    const doPost = () => {
                        if (window.ApiCore && typeof window.ApiCore.post === 'function') return window.ApiCore.post('/manage/updateInfo', payload);
                        if (!window.axios || typeof window.axios.post !== 'function') return Promise.reject(new Error('no http client'));
                        const base = (this.store && this.store.apiBase) ? this.store.apiBase.replace(/\/+$/, '') : '';
                        const url = (base ? base : '') + '/manage/updateInfo';
                        return window.axios.post(url, payload, { headers: headers, withCredentials: true });
                    };

                    this.user_loading = true;
                    doPost()
                        .then(res => {
                            console.info('updateInfo ok', res && res.data ? res.data : res);
                            this.user_modalVisible = false;
                            this.loadUsers(this.user_search, this.user_roleFilter);
                        })
                        .catch(err => {
                            console.error('updateInfo failed', err);
                            alert('更新用户失败');
                        })
                        .finally(() => { this.user_loading = false; });
                }
            },

// delete user -> /manage/removeUser (POST { userId })
            deleteUser(item) {
                if (!item) return;
                if (!confirm('确定删除用户 "' + (item.username || '') + '" 吗？')) return;
                const payload = { userId: item.userId };
                const headers = this._getAuthHeaders();
                const doPost = () => {
                    if (window.ApiCore && typeof window.ApiCore.post === 'function') return window.ApiCore.post('/manage/removeUser', payload);
                    if (!window.axios || typeof window.axios.post !== 'function') return Promise.reject(new Error('no http client'));
                    const base = (this.store && this.store.apiBase) ? this.store.apiBase.replace(/\/+$/, '') : '';
                    const url = (base ? base : '') + '/manage/removeUser';
                    return window.axios.post(url, payload, { headers: headers, withCredentials: true });
                };
                item._saving = true;
                doPost().then(res => { console.info('removeUser ok', res && res.data ? res.data : res); this.user_items = this.user_items.filter(u => u.userId !== item.userId); })
                    .catch(err => { console.error('removeUser failed', err); alert('删除失败'); })
                    .finally(() => { item._saving = false; });
            },

            // ------------------------------------------------------------------
            // ===================== 授予课程模块（ClasseToCourse） =========================
            // ------------------------------------------------------------------
            // ---------------- 授予单个课程模块 ----------------

        // 1) 进入页面时加载简略课程供下拉选择（GET /course/getSimpleCourseVO）
            loadSimpleCourses() {
                this.grant_loading = true;
                this.grant_error = null;
                const headers = this._getAuthHeaders();
                const base = (this.store && this.store.apiBase) ? this.store.apiBase.replace(/\/+$/, '') : '';
                const url = (base ? base : '') + '/course/getSimpleCourseVO';

                const handleResult = (dataPayload) => {
                    // dataPayload may be array or object with list/data/simpleCourseVOList etc.
                    let candidate = dataPayload !== undefined && dataPayload.data !== undefined ? dataPayload.data : dataPayload;
                    // if candidate is object and has typical field simpleCourseVOList / list / records, prefer them
                    let arr = [];
                    if (Array.isArray(candidate)) arr = candidate;
                    else if (Array.isArray(candidate.simpleCourseVOList)) arr = candidate.simpleCourseVOList;
                    else if (Array.isArray(candidate.list)) arr = candidate.list;
                    else if (Array.isArray(candidate.records)) arr = candidate.records;
                    else {
                        // scan properties for first array
                        for (const k of Object.keys(candidate || {})) {
                            if (Array.isArray(candidate[k])) { arr = candidate[k]; break; }
                        }
                    }

                    // Normalise each course item to { id, name }
                    this.grant_course_list = (arr || []).map(c => {
                        const id = c.id !== undefined ? c.id : (c.courseId !== undefined ? c.courseId : (c.simpleId !== undefined ? c.simpleId : null));
                        const name = c.name || c.title || c.courseName || c.cnName || '';
                        return { id: id, name: name, _raw: c };
                    });

                    // debug
                    try { console.debug('grant_course_list', this.grant_course_list); } catch (e) {}
                };

                if (window.ApiCore && typeof window.ApiCore.get === 'function') {
                    return window.ApiCore.get(url)
                        .then(resp => {
                            const data = resp && resp.data !== undefined ? resp.data : (resp || null);
                            handleResult(data);
                        })
                        .catch(err => { console.error('loadSimpleCourses failed', err); this.grant_error = '获取课程失败'; })
                        .finally(()=>{ this.grant_loading = false; });
                } else {
                    return window.axios.get(url, { headers: headers, withCredentials: true })
                        .then(res => {
                            const data = res && res.data !== undefined ? res.data : (res || null);
                            handleResult(data);
                        })
                        .catch(err => { console.error('loadSimpleCourses axios failed', err); this.grant_error = '获取课程失败'; })
                        .finally(()=>{ this.grant_loading = false; });
                }
            },

// 2) 加载用户及他们已有课程列表（GET /course/getAllUserCourseAllowance）
// 参数: role (Integer 必填，0/1)，searchType, searchStr；带分页 current/size
            loadUserCourseAllowances(role, current, size, searchType, searchStr) {
                this.grant_loading = true;
                this.grant_error = null;
                this.grant_items = [];
                const headers = this._getAuthHeaders();
                const base = (this.store && this.store.apiBase) ? this.store.apiBase.replace(/\/+$/, '') : '';
                const url = (base ? base : '') + '/course/getAllUserCourseAllowance';

                // normalize
                this.grant_role = (role !== undefined && role !== null) ? Number(role) : this.grant_role;
                this.grant_current = current !== undefined ? Number(current) : (this.grant_current || 1);
                this.grant_size = size !== undefined ? Number(size) : (this.grant_size || 10);
                this.grant_searchType = (searchType !== undefined) ? searchType : this.grant_searchType;
                this.grant_searchStr = (searchStr !== undefined) ? searchStr : this.grant_searchStr;

                const params = { current: this.grant_current, size: this.grant_size, role: this.grant_role, searchType: this.grant_searchType || '', searchStr: this.grant_searchStr || '' };

                if (window.ApiCore && typeof window.ApiCore.get === 'function') {
                    const qs = Object.keys(params).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k])).join('&');
                    return window.ApiCore.get(url + '?' + qs)
                        .then(resp => {
                            const data = resp && resp.data !== undefined ? resp.data : (resp || null);
                            this._handleGrantResponse(data);
                        })
                        .catch(err => { console.error('getAllUserCourseAllowance ApiCore failed', err); this.grant_error='获取失败'; })
                        .finally(()=>{ this.grant_loading = false; });
                } else {
                    return window.axios.get(url, { params: params, headers: headers, withCredentials: true })
                        .then(res => {
                            const data = res && res.data !== undefined ? res.data : (res || null);
                            this._handleGrantResponse(data);
                        })
                        .catch(err => { console.error('getAllUserCourseAllowance axios failed', err); this.grant_error='获取失败'; })
                        .finally(()=>{ this.grant_loading = false; });
                }
            },

// 3) 解析 getAllUserCourseAllowance 返回并写入 grant_items
            _handleGrantResponse(payload) {
                if (!payload) { this.grant_error = '无返回数据'; this.grant_items = []; this.grant_total = 0; return; }
                if (payload.code !== undefined && payload.code !== null && payload.code !== 200 && payload.code !== 0) {
                    this.grant_error = payload.message || payload.msg || ('错误代码 ' + payload.code);
                    this.grant_items = []; this.grant_total = 0; return;
                }
                const data = payload.data !== undefined ? payload.data : payload;

                // find array of users (common locations)
                let arr = [];
                if (Array.isArray(data.records)) arr = data.records;
                else if (Array.isArray(data.list)) arr = data.list;
                else if (Array.isArray(data.data)) arr = data.data;
                else if (Array.isArray(data)) arr = data;
                else {
                    for (const k of Object.keys(data || {})) { if (Array.isArray(data[k])) { arr = data[k]; break; } }
                }

                // total extraction
                let total = 0;
                if (data.total !== undefined) total = Number(data.total);
                else if (data.page && data.page.total !== undefined) total = Number(data.page.total);
                else if (payload.total !== undefined) total = Number(payload.total);

                // map and normalise simpleCourseVOList entries
                this.grant_items = (arr || []).map(u => {
                    // u might be { user: {...}, simpleCourseVOList: [...] } or a flat user object with a list field
                    const userObj = u.user || u;
                    let rawList = Array.isArray(u.simpleCourseVOList) ? u.simpleCourseVOList
                        : Array.isArray(u.courseList) ? u.courseList
                            : Array.isArray(userObj.simpleCourseVOList) ? userObj.simpleCourseVOList
                                : [];
                    const simpleCourseVOList = (rawList || []).map(c => {
                        const id = c.id !== undefined ? c.id : (c.courseId !== undefined ? c.courseId : (c.simpleId !== undefined ? c.simpleId : null));
                        const name = c.name || c.title || c.courseName || c.cnName || '';
                        return { id: id, name: name, _raw: c };
                    });
                    return {
                        user: userObj,
                        simpleCourseVOList: simpleCourseVOList,
                        _selectedCourseToAdd: null,
                        _saving: false
                    };
                });

                this.grant_total = Number.isFinite(Number(total)) ? Number(total) : (this.grant_items.length || 0);
                try { console.debug('grant_items', this.grant_items); } catch (e) {}
            },

// 替换 AdminPage.js 中的 addCourseToUser 和 removeCourseFromUser 方法为下面实现

            addCourseToUser(it, courseId) {
                if (!it || !it.user || !courseId) return;
                const user = it.user;
                const userId = user.userId !== undefined ? user.userId : (user.id !== undefined ? user.id : (user.user_id !== undefined ? user.user_id : null));
                if (!userId) { alert('无法识别用户ID'); return; }

                it._saving = true;
                console.debug('insertUserToCourse payload', { userId, courseId: Number(courseId) });

                const payload = { userId: userId, courseId: Number(courseId) };
                const headers = this._getAuthHeaders();

                const doPost = () => {
                    if (window.ApiCore && typeof window.ApiCore.post === 'function') return window.ApiCore.post('/manage/insertUserToCourse', payload);
                    if (!window.axios || typeof window.axios.post !== 'function') return Promise.reject(new Error('no http client'));
                    const base = (this.store && this.store.apiBase) ? this.store.apiBase.replace(/\/+$/, '') : '';
                    const url = (base ? base : '') + '/manage/insertUserToCourse';
                    return window.axios.post(url, payload, { headers: headers, withCredentials: true });
                };

                doPost()
                    .then(res => {
                        console.info('insertUserToCourse ok', res && res.data ? res.data : res);
                        it._selectedCourseToAdd = null;
                        this.loadUserCourseAllowances(this.grant_role, this.grant_current, this.grant_size, this.grant_searchType, this.grant_searchStr);
                    })
                    .catch(err => {
                        console.error('insertUserToCourse failed', err);
                        const msg = err && err.response && err.response.data && (err.response.data.msg || err.response.data.message) ? (err.response.data.msg || err.response.data.message) : (err && err.message ? err.message : '网络或服务器错误');
                        alert('授课失败：' + msg);
                    })
                    .finally(() => {
                        it._saving = false;
                    });
            },

            removeCourseFromUser(it, courseId) {
                if (!it || !it.user || !courseId) return;
                if (!confirm('确定移除该课程吗？')) return;
                const user = it.user;
                const userId = user.userId !== undefined ? user.userId : (user.id !== undefined ? user.id : (user.user_id !== undefined ? user.user_id : null));
                if (!userId) { alert('无法识别用户ID'); return; }

                it._saving = true;
                console.debug('deleteUserToCourse payload', { userId, courseId: Number(courseId) });

                const payload = { userId: userId, courseId: Number(courseId) };
                const headers = this._getAuthHeaders();

                const doPost = () => {
                    if (window.ApiCore && typeof window.ApiCore.post === 'function') return window.ApiCore.post('/manage/deleteUserToCourse', payload);
                    if (!window.axios || typeof window.axios.post !== 'function') return Promise.reject(new Error('no http client'));
                    const base = (this.store && this.store.apiBase) ? this.store.apiBase.replace(/\/+$/, '') : '';
                    const url = (base ? base : '') + '/manage/deleteUserToCourse';
                    return window.axios.post(url, payload, { headers: headers, withCredentials: true });
                };

                doPost()
                    .then(res => {
                        console.info('deleteUserToCourse ok', res && res.data ? res.data : res);
                        this.loadUserCourseAllowances(this.grant_role, this.grant_current, this.grant_size, this.grant_searchType, this.grant_searchStr);
                    })
                    .catch(err => {
                        console.error('deleteUserToCourse failed', err);
                        const msg = err && err.response && err.response.data && (err.response.data.msg || err.response.data.message) ? (err.response.data.msg || err.response.data.message) : (err && err.message ? err.message : '网络或服务器错误');
                        alert('删除失败：' + msg);
                    })
                    .finally(() => {
                        it._saving = false;
                    });
            },

// 6) 简易分页 handlers for grant module
            onGrantPageChange(newPage) {
                const page = Number(newPage) || 1;
                this.loadUserCourseAllowances(this.grant_role, page, this.grant_size, this.grant_searchType, this.grant_searchStr);
            },
            onGrantSizeChange(newSize) {
                const size = Number(newSize) || 10;
                this.loadUserCourseAllowances(this.grant_role, 1, size, this.grant_searchType, this.grant_searchStr);
            },


            // ------------------------------------------------------------------
            // ===================== 学习对象（courseType） =========================
            // ------------------------------------------------------------------
            loadCourseTypes() {
                if (this.ct_loading) return Promise.resolve();
                this.ct_loading = true;
                this.ct_error = null;
                this.ct_items = [];

                const headers = this._getAuthHeaders();

                const handleError = (err) => {
                    console.error('loadCourseTypes error', err);
                    this.ct_error = '获取学习对象失败';
                    this.ct_loading = false;
                };

                if (window.ApiCore && typeof window.ApiCore.get === 'function') {
                    return window.ApiCore.get('/courseType/listAll')
                        .then(resp => {
                            const data = resp && resp.data !== undefined ? resp.data : (resp || null);
                            this._handleCourseTypesResponse(data);
                        })
                        .catch(err => {
                            console.warn('ApiCore.get /courseType/listAll failed, fallback to axios', err);
                            return this._fetchCourseTypesWithAxios(headers).catch(handleError);
                        })
                        .finally(() => { this.ct_loading = false; });
                } else {
                    return this._fetchCourseTypesWithAxios(headers).then(()=>{ this.ct_loading=false; }).catch(handleError);
                }
            },

            _fetchCourseTypesWithAxios(headers) {
                if (!window.axios || typeof window.axios.get !== 'function') {
                    this.ct_error = 'No HTTP client available';
                    this.ct_loading = false;
                    return Promise.reject(new Error('no http client'));
                }
                const base = (this.store && this.store.apiBase) ? this.store.apiBase.replace(/\/+$/, '') : '';
                const url = (base ? base : '') + '/courseType/listAll';
                return window.axios.get(url, { headers: headers, withCredentials: true })
                    .then(res => {
                        const data = res && res.data !== undefined ? res.data : (res || null);
                        this._handleCourseTypesResponse(data);
                    })
                    .catch(err => { this.ct_error = '请求失败'; console.error(err); });
            },

            _handleCourseTypesResponse(payload) {
                if (!payload) { this.ct_error = '无返回数据'; return; }
                if (payload.code !== undefined && payload.code !== null && payload.code !== 200 && payload.code !== 0) {
                    this.ct_error = payload.message || payload.msg || ('错误代码 ' + payload.code); return;
                }
                const data = payload.data !== undefined ? payload.data : payload;
                if (!data) { this.ct_items = []; return; }

                if (Array.isArray(data)) {
                    this.ct_items = data.map(it => ({ id: it.id !== undefined ? it.id : (it.courseTypeId || it.typeId || null), name: it.name || it.typeName || it.cnName || it.desCN || '', _raw: it, _saving: false }));
                } else if (Array.isArray(data.list)) {
                    this.ct_items = data.list.map(it => ({ id: it.id !== undefined ? it.id : (it.courseTypeId || it.typeId || null), name: it.name || it.typeName || it.cnName || it.desCN || '', _raw: it, _saving: false }));
                } else {
                    this.ct_items = [];
                }
            },

            createCourseType() {
                const name = prompt('请输入学习对象名称（示例：小学、初中）'); if (!name || !name.trim()) return;
                const payload = { name: name.trim() }; const headers = this._getAuthHeaders();
                const doPost = () => { if (window.ApiCore && typeof window.ApiCore.post === 'function') return window.ApiCore.post('/courseType/add', payload); if (!window.axios || typeof window.axios.post !== 'function') return Promise.reject(new Error('no http client')); const base = (this.store && this.store.apiBase) ? this.store.apiBase.replace(/\/+$/, '') : ''; const url = (base ? base : '') + '/courseType/add'; return window.axios.post(url, payload, { headers: headers, withCredentials: true }); };
                this.ct_loading = true;
                doPost().then(res => { console.info('createCourseType ok', res && res.data ? res.data : res); this.loadCourseTypes(); }).catch(err => { console.error('createCourseType failed', err); alert('创建失败'); }).finally(()=>{ this.ct_loading=false; });
            },

            editCourseType(item) {
                if (!item) return; const newName = prompt('编辑学习对象名称：', item.name || ''); if (newName === null) return; const trimmed = (newName || '').trim(); if (!trimmed) { alert('名称不能为空'); return; }
                const payload = { courseTypeId: item.id, name: trimmed }; const headers = this._getAuthHeaders();
                const doPost = () => { if (window.ApiCore && typeof window.ApiCore.post === 'function') return window.ApiCore.post('/courseType/update', payload); if (!window.axios || typeof window.axios.post !== 'function') return Promise.reject(new Error('no http client')); const base = (this.store && this.store.apiBase) ? this.store.apiBase.replace(/\/+$/, '') : ''; const url = (base ? base : '') + '/courseType/update'; return window.axios.post(url, payload, { headers: headers, withCredentials: true }); };
                item._saving = true; doPost().then(res => { console.info('editCourseType ok', res && res.data ? res.data : res); item.name = trimmed; }).catch(err => { console.error('editCourseType failed', err); alert('更新失败'); }).finally(()=>{ item._saving=false; });
            },

            deleteCourseType(item) {
                if (!item) return; if (!confirm('确定删除学习对象 "' + (item.name || '') + '" 吗？')) return; const payload = { courseTypeId: item.id }; const headers = this._getAuthHeaders();
                const doPost = () => { if (window.ApiCore && typeof window.ApiCore.post === 'function') return window.ApiCore.post('/courseType/delete', payload); if (!window.axios || typeof window.axios.post !== 'function') return Promise.reject(new Error('no http client')); const base = (this.store && this.store.apiBase) ? this.store.apiBase.replace(/\/+$/, '') : ''; const url = (base ? base : '') + '/courseType/delete'; return window.axios.post(url, payload, { headers: headers, withCredentials: true }); };
                item._saving = true; doPost().then(res => { console.info('deleteCourseType ok', res && res.data ? res.data : res); this.ct_items = this.ct_items.filter(x => x.id !== item.id); }).catch(err => { console.error('deleteCourseType failed', err); alert('删除失败'); }).finally(()=>{ item._saving=false; });
            },

            // ------------------------------------------------------------------
            // ===================== 课程科目管理 /profession ======================
            // ------------------------------------------------------------------
            ensureCourseTypesAndLoadProfessions() {
                const already = (this.ct_items && this.ct_items.length);
                this.loadCourseTypes().then(() => {
                    if (!this.selectedCourseTypeId && this.ct_items && this.ct_items.length) {
                        this.selectedCourseTypeId = this.ct_items[0].id;
                    }
                    if (this.selectedCourseTypeId) this.loadProfessions(this.selectedCourseTypeId);
                }).catch(() => {
                    if (this.selectedCourseTypeId) this.loadProfessions(this.selectedCourseTypeId);
                });
                if (already && !this.selectedCourseTypeId && this.ct_items.length) {
                    this.selectedCourseTypeId = this.ct_items[0].id;
                    this.loadProfessions(this.selectedCourseTypeId);
                }
            },

            loadProfessions(courseTypeId) {
                if (!courseTypeId) { this.prof_items = []; return Promise.resolve(); }
                this.prof_loading = true;
                this.prof_error = null;
                this.prof_items = [];

                const headers = this._getAuthHeaders();

                const handleFail = (err) => {
                    console.error('loadProfessions error', err);
                    this.prof_error = '获取课程科目失败';
                    this.prof_loading = false;
                };

                const base = (this.store && this.store.apiBase) ? this.store.apiBase.replace(/\/+$/, '') : '';
                const url = (base ? base : '') + '/profession/listByCourseTypeId';

                if (window.ApiCore && typeof window.ApiCore.get === 'function') {
                    return window.ApiCore.get(url + '?courseTypeId=' + encodeURIComponent(courseTypeId))
                        .then(resp => {
                            const data = resp && resp.data !== undefined ? resp.data : (resp || null);
                            this._handleProfessionsResponse(data);
                        })
                        .catch(err => {
                            console.warn('ApiCore.get /profession/listByCourseTypeId failed, fallback to axios', err);
                            return this._fetchProfessionsWithAxios(courseTypeId, headers).catch(handleFail);
                        })
                        .finally(() => { this.prof_loading = false; });
                } else {
                    return this._fetchProfessionsWithAxios(courseTypeId, headers).then(()=>{ this.prof_loading=false; }).catch(handleFail);
                }
            },

            _fetchProfessionsWithAxios(courseTypeId, headers) {
                if (!window.axios || typeof window.axios.get !== 'function') {
                    this.prof_error = 'No HTTP client available';
                    this.prof_loading = false;
                    return Promise.reject(new Error('no http client'));
                }
                const base = (this.store && this.store.apiBase) ? this.store.apiBase.replace(/\/+$/, '') : '';
                const url = (base ? base : '') + '/profession/listByCourseTypeId';
                return window.axios.get(url, { params: { courseTypeId: courseTypeId }, headers: headers, withCredentials: true })
                    .then(res => { const data = res && res.data !== undefined ? res.data : (res || null); this._handleProfessionsResponse(data); })
                    .catch(err => { this.prof_error = '请求失败'; console.error(err); });
            },

            _handleProfessionsResponse(payload) {
                if (!payload) { this.prof_error = '无返回数据'; return; }
                if (payload.code !== undefined && payload.code !== null && payload.code !== 200 && payload.code !== 0) {
                    this.prof_error = payload.message || payload.msg || ('错误代码 ' + payload.code); return;
                }
                const data = payload.data !== undefined ? payload.data : payload;
                if (!data) { this.prof_items = []; return; }

                let arr = [];
                if (Array.isArray(data)) arr = data;
                else if (Array.isArray(data.list)) arr = data.list;
                else if (Array.isArray(data.data)) arr = data.data;
                else arr = [];

                this.prof_items = arr.map(it => ({
                    professionId: it.professionId !== undefined ? it.professionId : (it.id || null),
                    courseTypeId: it.courseTypeId !== undefined ? it.courseTypeId : (it.courseType || null),
                    name: it.name || it.title || it.desCN || '',
                    _raw: it,
                    _saving: false
                }));
            },

            createProfession() {
                if (!this.selectedCourseTypeId) { alert('请先选择学习对象'); return; }
                const name = prompt('请输入课程科目名称（示例：编程入门）');
                if (!name || !name.trim()) return;
                const payload = { courseTypeId: this.selectedCourseTypeId, name: name.trim() };
                const headers = this._getAuthHeaders();

                const doPost = () => {
                    if (window.ApiCore && typeof window.ApiCore.post === 'function') return window.ApiCore.post('/profession/add', payload);
                    if (!window.axios || typeof window.axios.post !== 'function') return Promise.reject(new Error('no http client'));
                    const base = (this.store && this.store.apiBase) ? this.store.apiBase.replace(/\/+$/, '') : '';
                    const url = (base ? base : '') + '/profession/add';
                    return window.axios.post(url, payload, { headers: headers, withCredentials: true });
                };

                this.prof_loading = true;
                doPost()
                    .then(res => {
                        console.info('createProfession ok', res && res.data ? res.data : res);
                        this.loadProfessions(this.selectedCourseTypeId);
                    })
                    .catch(err => {
                        console.error('createProfession failed', err);
                        alert('创建失败');
                    })
                    .finally(() => { this.prof_loading = false; });
            },

            editProfession(item) {
                if (!item) return;
                const newName = prompt('编辑课程科目名称：', item.name || '');
                if (newName === null) return;
                const trimmed = (newName || '').trim();
                if (!trimmed) { alert('名称不能为空'); return; }

                const payload = {
                    professionId: item.professionId,
                    courseTypeId: item.courseTypeId || this.selectedCourseTypeId,
                    name: trimmed
                };
                const headers = this._getAuthHeaders();

                const doPost = () => {
                    if (window.ApiCore && typeof window.ApiCore.post === 'function') return window.ApiCore.post('/profession/update', payload);
                    if (!window.axios || typeof window.axios.post !== 'function') return Promise.reject(new Error('no http client'));
                    const base = (this.store && this.store.apiBase) ? this.store.apiBase.replace(/\/+$/, '') : '';
                    const url = (base ? base : '') + '/profession/update';
                    return window.axios.post(url, payload, { headers: headers, withCredentials: true });
                };

                item._saving = true;
                doPost()
                    .then(res => {
                        console.info('editProfession ok', res && res.data ? res.data : res);
                        item.name = trimmed;
                        item.courseTypeId = payload.courseTypeId;
                    })
                    .catch(err => {
                        console.error('editProfession failed', err);
                        alert('更新失败');
                    })
                    .finally(() => { item._saving = false; });
            },

            deleteProfession(item) {
                if (!item) return;
                if (!confirm('确定删除课程科目 "' + (item.name || '') + '" 吗？')) return;
                const payload = { professionId: item.professionId };
                const headers = this._getAuthHeaders();

                const doPost = () => {
                    if (window.ApiCore && typeof window.ApiCore.post === 'function') return window.ApiCore.post('/profession/delete', payload);
                    if (!window.axios || typeof window.axios.post !== 'function') return Promise.reject(new Error('no http client'));
                    const base = (this.store && this.store.apiBase) ? this.store.apiBase.replace(/\/+$/, '') : '';
                    const url = (base ? base : '') + '/profession/delete';
                    return window.axios.post(url, payload, { headers: headers, withCredentials: true });
                };

                item._saving = true;
                doPost()
                    .then(res => {
                        console.info('deleteProfession ok', res && res.data ? res.data : res);
                        this.prof_items = this.prof_items.filter(x => x.professionId !== item.professionId);
                    })
                    .catch(err => {
                        console.error('deleteProfession failed', err);
                        alert('删除失败');
                    })
                    .finally(() => { item._saving = false; });
            },

            // ------------------------------------------------------------------
            // ===================== 角色权限管理 /manage/* =======================
            // ------------------------------------------------------------------
            loadRolePermissions() {
                if (this.rp_loading) return;
                this.rp_loading = true;
                this.rp_error = null;
                this.rp_roles = [];
                this.rp_perms_by_cat = {};
                this.rp_cat_order = [];

                const getToken = () => {
                    try { if (window.ApiCore && typeof window.ApiCore.getToken === 'function') return window.ApiCore.getToken(); } catch (e) {}
                    try { return localStorage.getItem('sf_token') || null; } catch (e) { return null; }
                };
                const token = getToken();
                const headers = {};
                if (token) headers['Authorization'] = 'Bearer ' + token;

                const handleFail = (err) => {
                    console.warn('fetch role perms failed', err);
                    this.rp_error = '请求角色权限失败';
                    this.rp_loading = false;
                };

                if (window.ApiCore && typeof window.ApiCore.get === 'function') {
                    window.ApiCore.get('/manage/listRoleToPermission')
                        .then(resp => {
                            const data = resp && resp.data !== undefined ? resp.data : (resp || null);
                            this.handleRolePermResponse(data);
                        })
                        .catch(err => {
                            console.warn('ApiCore.get failed, fallback to axios', err);
                            this.fetchRolePermWithAxios(headers).catch(handleFail);
                        })
                        .finally(() => { this.rp_loading = false; });
                } else {
                    this.fetchRolePermWithAxios(headers).then(()=>{ this.rp_loading=false; }).catch(handleFail);
                }
            },

            fetchRolePermWithAxios(headers) {
                if (!window.axios || typeof window.axios.get !== 'function') {
                    this.rp_error = 'No HTTP client available';
                    this.rp_loading = false;
                    return Promise.reject(new Error('no http client'));
                }
                const base = (this.store && this.store.apiBase) ? this.store.apiBase.replace(/\/+$/, '') : '';
                const url = (base ? base : '') + '/manage/listRoleToPermission';
                return window.axios.get(url, { headers: headers, withCredentials: true })
                    .then(res => {
                        const data = res && res.data !== undefined ? res.data : (res || null);
                        this.handleRolePermResponse(data);
                    })
                    .catch(err => { this.rp_error = '请求失败'; console.error(err); });
            },

            handleRolePermResponse(payload) {
                if (!payload) { this.rp_error = '无返回数据'; return; }
                if (payload.code !== undefined && payload.code !== null && payload.code !== 200 && payload.code !== 0) {
                    this.rp_error = payload.message || payload.msg || ('错误代码 ' + payload.code);
                    return;
                }
                let data = payload.data !== undefined ? payload.data : payload;
                if (!data) { this.rp_error = '返回 data 为空'; return; }

                const rolesFromPayload = payload.roles || data.roles || payload.roleList || data.roleList || null;
                if (Array.isArray(rolesFromPayload) && rolesFromPayload.length) {
                    this.rp_roles = rolesFromPayload.map(r => ({ id: r.id !== undefined ? r.id : r.roleId, name: r.name || r.roleName || r.title || r.role || ('角色' + (r.id||'')) }));
                } else if (this.store && this.store.roles && Array.isArray(this.store.roles) && this.store.roles.length) {
                    this.rp_roles = this.store.roles.map(r => ({ id: r.id, name: r.name || r.roleName || r.title }));
                } else if (window.__APP_ROLES__ && Array.isArray(window.__APP_ROLES__)) {
                    this.rp_roles = window.__APP_ROLES__.map(r => ({ id: r.id, name: r.name }));
                } else {
                    this.rp_roles = [{ id: 2, name: '课程管理员' }, { id: 1, name: '教师' }, { id: 0, name: '学生' }];
                }

                if (typeof data === 'object' && !Array.isArray(data)) {
                    const keys = Object.keys(data).filter(k => Array.isArray(data[k]));
                    this.rp_cat_order = keys;
                    const bycat = {};
                    keys.forEach(k => {
                        bycat[k] = (data[k] || []).map(p => ({
                            permissionId: p.permissionId !== undefined ? p.permissionId : (p.id || null),
                            roleIds: Array.isArray(p.roleIds) ? p.roleIds.slice(0) : (Array.isArray(p.roles) ? p.roles.slice(0) : []),
                            desCN: p.desCN || p.description || p.name || p.title || (p.permission && p.permission.name) || '',
                            _raw: p,
                            _saving: false
                        }));
                    });
                    this.rp_perms_by_cat = bycat;
                } else {
                    this.rp_cat_order = ['default'];
                    this.rp_perms_by_cat = { default: Array.isArray(data) ? data.map(p => ({ permissionId: p.permissionId||p.id, roleIds: Array.isArray(p.roleIds)?p.roleIds:[], desCN: p.desCN||p.name||'', _raw:p, _saving:false })) : [] };
                }
            },

            persistPermissionChange(singlePerm) {
                if (!singlePerm) return Promise.reject(new Error('invalid permission'));
                if (singlePerm._saving) { return Promise.resolve(); }
                singlePerm._saving = true;

                const payload = [
                    {
                        permissionId: singlePerm.permissionId,
                        roleIds: Array.isArray(singlePerm.roleIds) ? singlePerm.roleIds.slice(0) : []
                    }
                ];

                const getToken = () => {
                    try { if (window.ApiCore && typeof window.ApiCore.getToken === 'function') return window.ApiCore.getToken(); } catch (e) {}
                    try { return localStorage.getItem('sf_token') || null; } catch (e) { return null; }
                };
                const token = getToken();
                const headers = {};
                if (token) headers['Authorization'] = 'Bearer ' + token;

                const finalize = (ok) => {
                    singlePerm._saving = false;
                    return ok;
                };

                if (window.ApiCore && typeof window.ApiCore.post === 'function') {
                    return window.ApiCore.post('/manage/updateRoleToPermission', payload)
                        .then(resp => {
                            console.info('updateRoleToPermission ok (ApiCore)', resp);
                            return finalize(true);
                        })
                        .catch(err => {
                            console.error('updateRoleToPermission failed (ApiCore)', err);
                            singlePerm._saving = false;
                            throw err;
                        });
                }

                if (!window.axios || typeof window.axios.post !== 'function') {
                    singlePerm._saving = false;
                    return Promise.reject(new Error('No HTTP client for POST'));
                }
                const base = (this.store && this.store.apiBase) ? this.store.apiBase.replace(/\/+$/, '') : '';
                const url = (base ? base : '') + '/manage/updateRoleToPermission';
                return window.axios.post(url, payload, { headers: headers, withCredentials: true })
                    .then(res => {
                        console.info('updateRoleToPermission ok', res && res.data ? res.data : res);
                        return finalize(true);
                    })
                    .catch(err => {
                        console.error('updateRoleToPermission failed', err);
                        singlePerm._saving = false;
                        throw err;
                    });
            },

            toggleAssign(permObj, roleIndex) {
                try {
                    const role = this.rp_roles[roleIndex];
                    if (!role) return;
                    const id = role.id;
                    const old = Array.isArray(permObj.roleIds) ? permObj.roleIds.slice(0) : [];
                    if (!permObj.roleIds) permObj.roleIds = [];
                    const idx = permObj.roleIds.indexOf(id);
                    if (idx === -1) permObj.roleIds.push(id);
                    else permObj.roleIds.splice(idx, 1);

                    this.persistPermissionChange(permObj)
                        .then(() => {})
                        .catch(() => {
                            permObj.roleIds = old;
                            alert('权限更新失败，已回滚');
                        });
                } catch (e) {
                    console.warn('toggleAssign error', e);
                }
            }
        },

        template: `
      <div>
        <div id="shared-header"></div>

        <div style="display:flex;max-width:1200px;margin:18px auto;gap:18px">
          <!-- 左侧菜单 -->
          <aside style="width:220px">
            <div style="background:#fff;border:1px solid #eef2f7;border-radius:6px;padding:12px;overflow:hidden">
              <div style="font-weight:600;padding:8px 6px;color:#2b7cff">管理</div>
              <div style="margin-top:6px;display:flex;flex-direction:column;gap:6px">
                <div v-for="(m, idx) in menu" :key="m.key">
                  <div @click="toggleGroup(m.key)" :style="{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 10px',borderRadius:'6px',cursor:'pointer',background: (activeTop===m.key && (!m.subs||m.subs.length===0)) ? '#f0f6ff' : (m.key===activeTop ? '#f7fbff' : 'transparent') , border: (activeTop===m.key ? '1px solid rgba(43,124,255,0.08)' : '1px solid transparent') }">
                    <div style="display:flex;align-items:center;gap:10px">
                      <div style="width:22px;text-align:center;font-size:16px;color:#2b7cff">{{ m.icon }}</div>
                      <div style="color:#333">{{ m.title }}</div>
                    </div>
                    <div v-if="m.subs && m.subs.length" style="font-size:12px;color:#8a98a6">
                      <svg v-if="collapsed[m.key]" width="14" height="14" viewBox="0 0 24 24"><path fill="#8894a6" d="M7 10l5 5 5-5z"/></svg>
                      <svg v-else width="14" height="14" viewBox="0 0 24 24"><path fill="#8894a6" d="M7 14l5-5 5 5z"/></svg>
                    </div>
                  </div>

                  <div v-if="m.subs && m.subs.length && collapsed[m.key]" style="display:flex;flex-direction:column;margin-top:6px;margin-left:32px;gap:6px">
                    <div v-for="sub in m.subs" :key="sub.key" @click="chooseSub(m.key, sub.key)" :style="{padding:'8px 10px',borderRadius:'6px',cursor:'pointer',background: (activeTop===m.key && activeSub===sub.key) ? '#eaf4ff' : 'transparent', color: (activeTop===m.key && activeSub===sub.key) ? '#2b7cff' : '#333', border: (activeTop===m.key && activeSub===sub.key) ? '1px solid rgba(43,124,255,0.12)' : '1px solid transparent'}">
                      {{ sub.title }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <!-- 右侧内容区 -->
          <div style="flex:1;background:#fff;border:1px solid #eef2f7;border-radius:6px;padding:18px;min-height:540px">
            <div v-if="!allowed" style="text-align:center;color:#d9534f;padding:40px">你没有权限访问此页面 (需要课程管理员或超级管理员)</div>

            <div v-else>
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px">
                <h3 style="margin:0">{{ contentTitle() || '管理面板' }}</h3>
                <div style="color:#8894a6;font-size:13px">角色：{{ store.user ? (store.user.roleName || store.user.userRole || '') : '' }}</div>
              </div>

              <!-- 单个学校管理 -->
              <div v-if="activeTop === 'school' && activeSub === 'singleSchool'">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;gap:12px">
                  <div style="display:flex;gap:8px;align-items:center">
                    <input v-model="sch_search" @keyup.enter="loadSchools(sch_search)" placeholder="搜索学校" style="padding:6px 10px;border:1px solid #e6eef8;border-radius:6px" />
                    <button @click="loadSchools(sch_search)" style="background:#2b7cff;color:#fff;border:none;padding:8px 12px;border-radius:6px;cursor:pointer">搜索</button>
                  </div>
                  <div style="display:flex;align-items:center;gap:8px">
                    <button @click="createSchool" style="background:#2b7cff;color:#fff;border:none;padding:8px 12px;border-radius:6px;cursor:pointer">创建学校</button>
                    <div style="color:#8894a6;font-size:13px">数据来自 /school/*（listAll/add/update/delete）</div>
                  </div>
                </div>

                <div v-if="sch_loading" style="padding:24px;text-align:center;color:#666">加载中…</div>
                <div v-else-if="sch_error" style="padding:24px;color:#d9534f">{{ sch_error }}</div>

                <div v-else>
                  <div v-if="!sch_items || sch_items.length === 0" style="padding:28px;text-align:center;color:#9aa6b2">
                    <div style="font-size:14px">No data</div>
                  </div>

                  <div v-else>
                    <table style="width:100%;border-collapse:collapse">
                      <thead>
                        <tr style="background:#fafafa;border-bottom:1px solid #eef2f7">
                          <th style="text-align:left;padding:12px 16px">学校名称</th>
                          <th style="text-align:center;padding:12px 16px;width:160px">管理</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="s in sch_items" :key="s.schoolId" style="border-bottom:1px solid #f2f6fa">
                          <td style="padding:12px 16px;color:#333">{{ s.name }}</td>
                          <td style="text-align:center;padding:10px 12px">
                            <button @click="editSchool(s)" :disabled="s._saving" style="background:#2b7cff;color:#fff;border:none;padding:6px 10px;border-radius:6px;cursor:pointer;margin-right:8px">编辑</button>
                            <button @click="deleteSchool(s)" :disabled="s._saving" style="background:#ff6b6b;color:#fff;border:none;padding:6px 10px;border-radius:6px;cursor:pointer">删除</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

<!-- 班级管理 -->
<div v-else-if="activeTop === 'classes' && activeSub === 'singleClass'">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
    <select v-model="cl_selectedSchoolId" @change="loadClasses(cl_selectedSchoolId, cl_searchStr, cl_gradeFilter)" style="padding:6px 10px;border:1px solid #e6eef8;border-radius:6px">
      <option v-for="s in sch_items" :key="s.schoolId" :value="s.schoolId">{{ s.name }}</option>
    </select>

    <input v-model="cl_searchStr" placeholder="班级名称" style="padding:6px 10px;border:1px solid #e6eef8;border-radius:6px" />
    <input v-model="cl_gradeFilter" placeholder="年级" style="padding:6px 10px;border:1px solid #e6eef8;border-radius:6px;width:120px" />
    <button @click="loadClasses(cl_selectedSchoolId, cl_searchStr, cl_gradeFilter)" style="background:#2b7cff;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer">筛选</button>
    <button @click="openCreateClassModal" style="background:#2b7cff;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer">创建单个班级</button>
    <div style="color:#8894a6;font-size:13px">学校来自 /school/listAll，班级接口在 /classe/*</div>
  </div>

  <div v-if="cl_loading" style="padding:24px;text-align:center;color:#666">加载中…</div>
  <div v-else-if="cl_error" style="padding:24px;color:#d9534f">{{ cl_error }}</div>

  <div v-else>
    <div v-if="!cl_items || cl_items.length === 0" style="padding:28px;text-align:center;color:#9aa6b2">
      <div style="font-size:14px">No data</div>
    </div>

    <div v-else>
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="background:#fafafa;border-bottom:1px solid #eef2f7">
            <th style="text-align:left;padding:12px 16px">班级名称</th>
            <th style="text-align:left;padding:12px 16px">年级</th>
            <th style="text-align:center;padding:12px 16px;width:160px">管理</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in cl_items" :key="c.classeId" style="border-bottom:1px solid #f2f6fa">
            <td style="padding:12px 16px;color:#333">{{ c.name }}</td>
            <td style="padding:12px 16px;color:#333">{{ c.grade }}</td>
            <td style="text-align:center;padding:10px 12px">
              <button @click="editClass(c)" :disabled="c._saving" style="background:#2b7cff;color:#fff;border:none;padding:6px 10px;border-radius:6px;cursor:pointer;margin-right:8px">编辑</button>
              <button @click="deleteClass(c)" :disabled="c._saving" style="background:#ff6b6b;color:#fff;border:none;padding:6px 10px;border-radius:6px;cursor:pointer">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>

              <!-- 插入到 template 中 users 子项的位置（替换原有或添加） -->
<div v-else-if="activeTop === 'users' && activeSub === 'singleUser'">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
    <button @click="openCreateUserModal" style="background:#2b7cff;color:#fff;border:none;padding:8px 12px;border-radius:6px;cursor:pointer">创建单个用户</button>

<select v-model="user_roleFilter" @change="onUserPageChange(1)" style="padding:6px 10px;border:1px solid #e6eef8;border-radius:6px">
  <!-- Removed the '全部' option per request -->
  <option value="3">超级管理员</option>
  <option value="2">课程管理员</option>
  <option value="1">教师</option>
  <option value="0">学生</option>
  <option value="4">二级管理员</option>
</select>

    <input v-model="user_search" @keyup.enter="loadUsers(user_search, user_roleFilter)" placeholder="用户名称或账号" style="padding:6px 10px;border:1px solid #e6eef8;border-radius:6px" />
<button @click="onUserPageChange(1)" style="background:#2b7cff;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer">搜索</button>
    <div style="color:#8894a6;font-size:13px;margin-left:auto">数据来自 /manage/getAllUser, /manage/addUser, /manage/removeUser, /manage/updateInfo</div>
  </div>

  <div v-if="user_loading" style="padding:24px;text-align:center;color:#666">加载中…</div>
  <div v-else-if="user_error" style="padding:24px;color:#d9534f">{{ user_error }}</div>

  <div v-else>
    <div v-if="!user_items || user_items.length === 0" style="padding:28px;text-align:center;color:#9aa6b2"><div style="font-size:14px">No data</div></div>
    <div v-else>
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="background:#fafafa;border-bottom:1px solid #eef2f7">
            <th style="text-align:left;padding:12px 16px">账号/ID</th>
            <th style="text-align:left;padding:12px 16px">用户名</th>
            <th style="text-align:left;padding:12px 16px">邮箱</th>
            <th style="text-align:left;padding:12px 16px">手机号</th>
            <th style="text-align:left;padding:12px 16px">角色</th>
            <th style="text-align:left;padding:12px 16px">班级id</th>
            <th style="text-align:left;padding:12px 16px">学校id</th>
            <th style="text-align:center;padding:12px 16px;width:160px">管理</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in user_items" :key="u.userId" style="border-bottom:1px solid #f2f6fa">
            <td style="padding:12px 16px;color:#333">{{ u.userId }}</td>
            <td style="padding:12px 16px;color:#333">{{ u.username }}</td>
            <td style="padding:12px 16px;color:#333">{{ u.email }}</td>
            <td style="padding:12px 16px;color:#333">{{ u.phone }}</td>
            <td style="padding:12px 16px;color:#333">{{ u.role }}</td>
            <td style="padding:12px 16px;color:#333">{{ u.classeId }}</td>
            <td style="padding:12px 16px;color:#333">{{ u.schoolId }}</td>
            <td style="text-align:center;padding:10px 12px">
              <button @click="openEditUserModal(u)" :disabled="u._saving" style="background:#2b7cff;color:#fff;border:none;padding:6px 10px;border-radius:6px;cursor:pointer;margin-right:8px">编辑</button>
              <button @click="deleteUser(u)" :disabled="u._saving" style="background:#ff6b6b;color:#fff;border:none;padding:6px 10px;border-radius:6px;cursor:pointer">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
          <div style="display:flex;align-items:center;justify-content:flex-end;gap:12px;margin-top:12px">
  <div style="display:flex;align-items:center;gap:6px;color:#666">
    <button @click="onUserPageChange(user_current - 1)" :disabled="user_current <= 1" style="padding:6px 10px;border:1px solid #e6eef8;border-radius:6px;background:#fff;cursor:pointer">上一页</button>
    <div>第 {{ user_current }} / {{ Math.max(1, Math.ceil(user_total / user_size)) }} 页</div>
    <button @click="onUserPageChange(user_current + 1)" :disabled="user_current >= Math.ceil(user_total / user_size)" style="padding:6px 10px;border:1px solid #e6eef8;border-radius:6px;background:#fff;cursor:pointer">下一页</button>
  </div>

  <div style="display:flex;align-items:center;gap:8px">
    <div style="font-size:12px;color:#666">每页</div>
    <select v-model.number="user_size" @change="onUserSizeChange(user_size)" style="padding:6px;border:1px solid #e6eef8;border-radius:6px">
      <option :value="5">5</option>
      <option :value="10">10</option>
      <option :value="20">20</option>
      <option :value="50">50</option>
    </select>
    <div style="font-size:12px;color:#8894a6">共 {{ user_total }} 条</div>
  </div>
</div>
    </div>
  </div>
</div>

<!-- 用户管理 -->
<div v-if="user_modalVisible" style="position:fixed;left:0;top:0;right:0;bottom:0;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;z-index:2000">
  <div style="width:480px;background:#fff;border-radius:8px;padding:18px;box-shadow:0 8px 40px rgba(0,0,0,0.12);">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <div style="font-weight:600">{{ user_editMode ? '编辑用户' : '新增用户' }}</div>
      <button @click="closeUserModal" style="background:transparent;border:none;font-size:18px;cursor:pointer">✕</button>
    </div>

    <div style="display:flex;flex-direction:column;gap:10px">
      <div>
        <div style="font-size:12px;color:#666;margin-bottom:6px">用户名</div>
        <input v-model="user_form.username" placeholder="请输入用户名" style="width:100%;padding:8px;border:1px solid #e6eef8;border-radius:6px" />
      </div>
      
      <div>
         <div style="font-size:12px;color:#666;margin-bottom:6px">工号/学号</div>
         <input v-model="user_form.schoolNumber" placeholder="请输入工号或学号" style="width:100%;padding:8px;border:1px solid #e6eef8;border-radius:6px" />
      </div>

      <div v-if="!user_editMode">
        <div style="font-size:12px;color:#666;margin-bottom:6px">密码</div>
        <input v-model="user_form.password" type="password" placeholder="请输入密码(6-18位)" style="width:100%;padding:8px;border:1px solid #e6eef8;border-radius:6px" />
      </div>

      <div style="display:flex;gap:8px">
        <div style="flex:1">
          <div style="font-size:12px;color:#666;margin-bottom:6px">手机号</div>
          <input v-model="user_form.phone" placeholder="请输入手机号" style="width:100%;padding:8px;border:1px solid #e6eef8;border-radius:6px" />
        </div>
        <div style="flex:1">
          <div style="font-size:12px;color:#666;margin-bottom:6px">邮箱</div>
          <input v-model="user_form.email" placeholder="请输入邮箱" style="width:100%;padding:8px;border:1px solid #e6eef8;border-radius:6px" />
        </div>
      </div>

      <div style="display:flex;gap:8px">
        <div style="flex:1">
          <div style="font-size:12px;color:#666;margin-bottom:6px">班级 id</div>
          <select v-model="user_form.classeId" style="width:100%;padding:8px;border:1px solid #e6eef8;border-radius:6px">
            <option :value="null">请选择班级（可选）</option>
            <option v-for="c in user_class_options" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
<div style="flex:1">
  <div style="font-size:12px;color:#666;margin-bottom:6px">学校 id</div>
  <select
    v-model="user_form.schoolId"
    @change="loadClassesForUserModal(user_form.schoolId)"
    style="width:100%;padding:8px;border:1px solid #e6eef8;border-radius:6px;background:#fff"
  >
    <option :value="null">请选择学校（可选）</option>
    <option v-for="s in sch_items" :key="s.schoolId" :value="s.schoolId">{{ s.name }}</option>
  </select>
</div>
      </div>

      <div>
        <div style="font-size:12px;color:#666;margin-bottom:6px">角色</div>
        <select v-model="user_form.role" style="width:100%;padding:8px;border:1px solid #e6eef8;border-radius:6px">
          <option value="">请选择角色</option>
          <option value="0">学生</option>
          <option value="1">教师</option>
          <option value="2">课程管理员</option>
          <option value="3">超级管理员</option>
          <option value="4">二级管理员</option>
        </select>
      </div>

      <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:6px">
        <button @click="closeUserModal" style="background:#fff;border:1px solid #ccc;padding:6px 12px;border-radius:6px;cursor:pointer">取消</button>
        <button @click="submitUserModal" :disabled="user_loading" style="background:#2b7cff;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer">确认</button>
      </div>
    </div>
    
  </div>
</div>


<!-- 授予单个课程 模块 -->
<div v-else-if="activeTop === '授予课程' && activeSub === 'grantSingle'">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
    <!-- 固定三项下拉：学生0 教师1 课程管理员2（UI 显示中文，但传数字） -->
    <select v-model.number="grant_role" @change="loadUserCourseAllowances(grant_role,1,grant_size,grant_searchType,grant_searchStr)" style="padding:6px 10px;border:1px solid #e6eef8;border-radius:6px;">
      <option :value="0">学生</option>
      <option :value="1">教师</option>
      <option :value="2">课程管理员</option>
    </select>

    <select v-model="grant_searchType" style="padding:6px 10px;border:1px solid #e6eef8;border-radius:6px">
      <option :value="">全部类型</option>
      <option :value="1">按用户名</option>
      <option :value="2">按课程名</option>
    </select>

    <input v-model="grant_searchStr" placeholder="搜索" style="padding:6px 10px;border:1px solid #e6eef8;border-radius:6px" />
    <button @click="loadUserCourseAllowances(grant_role,1,grant_size,grant_searchType,grant_searchStr)" style="background:#2b7cff;color:#fff;border:none;padding:6px 12px;border-radius:6px">搜索</button>
    <div style="color:#8894a6;font-size:13px;margin-left:auto">数据来源：/course/getAllUserCourseAllowance & /course/getSimpleCourseVO</div>
  </div>

  <div v-if="grant_loading" style="padding:24px;text-align:center;color:#666">加载中…</div>
  <div v-else-if="grant_error" style="padding:24px;color:#d9534f">{{ grant_error }}</div>

  <div v-else>
    <div v-if="!grant_items || grant_items.length === 0" style="padding:28px;text-align:center;color:#9aa6b2"><div style="font-size:14px">No data</div></div>
    <div v-else style="display:flex;flex-direction:column;gap:12px">
      <div v-for="(it, idx) in grant_items" :key="(it.user && (it.user.userId||it.user.id)) || idx" style="background:#fff;border:1px solid #f2f6fa;border-radius:6px;padding:12px">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div style="font-weight:600">{{ it.user && (it.user.username || it.user.name || it.user.userName) }}</div>
          <div style="display:flex;align-items:center;gap:8px">
            <!-- 下拉选择可添加课程（选项来源于 grant_course_list） -->
<select
  v-model.number="it._selectedCourseToAdd"
  @focus="ensureGrantCoursesLoaded()"
  @click="ensureGrantCoursesLoaded()"
  style="padding:6px;border:1px solid #e6eef8;border-radius:6px"
>
  <option :value="null">点击授予课程</option>
  <option v-for="c in grant_course_list" :key="c.id" :value="c.id">{{ c.name }}</option>
</select>
            <button @click="addCourseToUser(it, it._selectedCourseToAdd)" :disabled="!it._selectedCourseToAdd || it._saving" style="background:#2b7cff;color:#fff;border:none;padding:6px 10px;border-radius:6px">授予</button>
          </div>
        </div>

        <!-- 已有课程以 tag/chips 显示，带删除 x -->
        <div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:6px">
          <span v-for="c in it.simpleCourseVOList" :key="c.id" style="display:inline-flex;align-items:center;background:#f4f9ff;border:1px solid #d7ebff;padding:6px 8px;border-radius:6px">
            <span style="margin-right:8px">{{ c.name || c.courseName || c.title }}</span>
            <button @click="removeCourseFromUser(it, c.id)" :disabled="it._saving" style="background:transparent;border:none;color:#888;cursor:pointer;padding:0 4px">✕</button>
          </span>
        </div>
      </div>

      <!-- 分页（复用 grant module 的分页状态） -->
      <div style="display:flex;align-items:center;justify-content:flex-end;gap:12px;margin-top:12px">
        <button @click="onGrantPageChange(grant_current - 1)" :disabled="grant_current <= 1" style="padding:6px 10px;border:1px solid #e6eef8;border-radius:6px;background:#fff;cursor:pointer">上一页</button>
        <div>第 {{ grant_current }} / {{ Math.max(1, Math.ceil(grant_total / grant_size)) }} 页</div>
        <button @click="onGrantPageChange(grant_current + 1)" :disabled="grant_current >= Math.ceil(grant_total / grant_size)" style="padding:6px 10px;border:1px solid #e6eef8;border-radius:6px;background:#fff;cursor:pointer">下一页</button>
      </div>
    </div>
  </div>
</div>

              <!-- 学习对象管理 -->
              <div v-if="activeTop === '学习对象管理'">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
                  <button @click="createCourseType" style="background:#2b7cff;color:#fff;border:none;padding:8px 12px;border-radius:6px;cursor:pointer">创建学习对象</button>
                  <div style="color:#8894a6;font-size:13px">数据来自 /courseType/*（listAll/add/update/delete）</div>
                </div>

                <div v-if="ct_loading" style="padding:24px;text-align:center;color:#666">加载中…</div>
                <div v-else-if="ct_error" style="padding:24px;color:#d9534f">{{ ct_error }}</div>

                <div v-else>
                  <div v-if="!ct_items || ct_items.length === 0" style="padding:28px;text-align:center;color:#9aa6b2">
                    <div style="font-size:14px">No data</div>
                  </div>

                  <div v-else>
                    <table style="width:100%;border-collapse:collapse">
                      <thead>
                        <tr style="background:#fafafa;border-bottom:1px solid #eef2f7">
                          <th style="text-align:left;padding:12px 16px">学习对象</th>
                          <th style="text-align:center;padding:12px 16px;width:160px">管理</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="item in ct_items" :key="item.id" style="border-bottom:1px solid #f2f6fa">
                          <td style="padding:12px 16px;color:#333">{{ item.name }}</td>
                          <td style="text-align:center;padding:10px 12px">
                            <button @click="editCourseType(item)" :disabled="item._saving" style="background:#2b7cff;color:#fff;border:none;padding:6px 10px;border-radius:6px;cursor:pointer;margin-right:8px">编辑</button>
                            <button @click="deleteCourseType(item)" :disabled="item._saving" style="background:#ff6b6b;color:#fff;border:none;padding:6px 10px;border-radius:6px;cursor:pointer">删除</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <!-- 课程科目管理 -->
              <div v-else-if="activeTop === '课程科目管理'">
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
                  <select v-model="selectedCourseTypeId" @change="loadProfessions(selectedCourseTypeId)" style="padding:6px 10px;border:1px solid #e6eef8;border-radius:6px">
                    <option v-for="ct in ct_items" :key="ct.id" :value="ct.id">{{ ct.name }}</option>
                  </select>
                  <button @click="createProfession" style="background:#2b7cff;color:#fff;border:none;padding:8px 12px;border-radius:6px;cursor:pointer">创建课程科目</button>
                  <div style="color:#8894a6;font-size:13px">学习对象来自 /courseType/listAll，科目接口在 /profession/*</div>
                </div>

                <div v-if="prof_loading" style="padding:24px;text-align:center;color:#666">加载中…</div>
                <div v-else-if="prof_error" style="padding:24px;color:#d9534f">{{ prof_error }}</div>

                <div v-else>
                  <div v-if="!prof_items || prof_items.length === 0" style="padding:28px;text-align:center;color:#9aa6b2">
                    <div style="font-size:14px">No data</div>
                  </div>

                  <div v-else>
                    <table style="width:100%;border-collapse:collapse">
                      <thead>
                        <tr style="background:#fafafa;border-bottom:1px solid #eef2f7">
                          <th style="text-align:left;padding:12px 16px">课程科目</th>
                          <th style="text-align:center;padding:12px 16px;width:160px">管理</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="item in prof_items" :key="item.professionId" style="border-bottom:1px solid #f2f6fa">
                          <td style="padding:12px 16px;color:#333">{{ item.name }}</td>
                          <td style="text-align:center;padding:10px 12px">
                            <button @click="editProfession(item)" :disabled="item._saving" style="background:#2b7cff;color:#fff;border:none;padding:6px 10px;border-radius:6px;cursor:pointer;margin-right:8px">编辑</button>
                            <button @click="deleteProfession(item)" :disabled="item._saving" style="background:#ff6b6b;color:#fff;border:none;padding:6px 10px;border-radius:6px;cursor:pointer">删除</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <!-- 角色权限管理 -->
              <div v-else-if="activeTop === '角色权限管理'">
                <div style="margin-bottom:12px;display:flex;align-items:center;justify-content:space-between">
                  <div style="font-weight:600">角色权限管理</div>
                  <div style="color:#8894a6;font-size:13px">自动加载 /manage/listRoleToPermission</div>
                </div>

                <div v-if="rp_loading" style="padding:24px;text-align:center;color:#666">加载中…</div>
                <div v-else-if="rp_error" style="padding:24px;color:#d9534f">{{ rp_error }}</div>
                <div v-else>
                  <div v-if="!rp_cat_order || rp_cat_order.length === 0" style="padding:28px;text-align:center;color:#9aa6b2">
                    <div style="font-size:14px">No data</div>
                  </div>

                  <div v-else>
                    <div v-for="catKey in rp_cat_order" :key="catKey" style="margin-bottom:18px;border:1px solid #f2f6fa;border-radius:6px;overflow:hidden;background:#fff">
                      <div style="padding:10px 16px;border-bottom:1px solid #f6f8fa;background:#fafafa;font-weight:600">{{ catKey }}</div>
                      <div style="overflow:auto">
                        <table style="width:100%;border-collapse:collapse">
                          <thead>
                            <tr style="background:#fff;border-bottom:1px solid #eef2f7">
                              <th style="text-align:left;padding:12px 16px;border-right:1px solid #fff">权限</th>
                              <th v-for="(r,ri) in rp_roles" :key="r.id" style="text-align:center;padding:12px 16px;border-left:1px solid #fff">{{ r.name }}</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="(perm, pi) in rp_perms_by_cat[catKey]" :key="perm.permissionId || pi" style="border-bottom:1px solid #f7fafc">
                              <td style="padding:12px 16px;color:#333">{{ perm.desCN || ('权限 ' + (perm.permissionId||'')) }}</td>
                              <td v-for="(r,ri) in rp_roles" :key="perm.permissionId + '-' + r.id" style="text-align:center;padding:10px 12px">
                                <input type="checkbox" :disabled="perm._saving" :checked="(Array.isArray(perm.roleIds) && perm.roleIds.indexOf(r.id) !== -1)" @change.prevent.stop="toggleAssign(perm, ri)" />
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  <div style="margin-top:18px;text-align:right;color:#8894a6;font-size:13px">
                    数据来源：/manage/listRoleToPermission
                  </div>
                </div>
              </div>
              
              <!-- Create Class Modal: 放置在 template 末尾（在主内容结尾前） -->
<div v-if="cl_modalVisible" style="position:fixed;left:0;top:0;right:0;bottom:0;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;z-index:2000">
  <div style="width:420px;background:#fff;border-radius:8px;padding:18px;box-shadow:0 8px 40px rgba(0,0,0,0.12);">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <div style="font-weight:600">新增班级</div>
      <button @click="closeCreateClassModal" style="background:transparent;border:none;font-size:18px;cursor:pointer">✕</button>
    </div>

    <div style="display:flex;flex-direction:column;gap:10px">
      <div>
        <div style="font-size:12px;color:#666;margin-bottom:6px">学校</div>
        <select v-model="cl_form.schoolId" style="width:100%;padding:8px;border:1px solid #e6eef8;border-radius:6px">
          <option v-for="s in sch_items" :key="s.schoolId" :value="s.schoolId">{{ s.name }}</option>
        </select>
      </div>

      <div>
        <div style="font-size:12px;color:#666;margin-bottom:6px">班级名称</div>
        <input v-model="cl_form.name" placeholder="请输入班级名称（示例：1班）" style="width:100%;padding:8px;border:1px solid #e6eef8;border-radius:6px" />
      </div>

      <div>
        <div style="font-size:12px;color:#666;margin-bottom:6px">年级</div>
        <input v-model="cl_form.grade" placeholder="请输入年级（示例：1 / 高一 / 2023）" style="width:100%;padding:8px;border:1px solid #e6eef8;border-radius:6px" />
      </div>

      <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:6px">
        <button @click="closeCreateClassModal" style="background:#fff;border:1px solid #ccc;padding:6px 12px;border-radius:6px;cursor:pointer">取消</button>
        <button @click="submitCreateClassModal" :disabled="cl_loading" style="background:#2b7cff;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer">确认</button>
      </div>
    </div>
  </div>
</div>

              <!-- 其他模块占位 -->
              <div v-else>
                <div style="padding:12px;border:1px dashed #eef2f7;border-radius:6px;background:#fbfdff">
                  <p style="margin:0;color:#666">这里是 <strong>{{ contentTitle() || '管理' }}</strong> 的占位内容区域。根据左侧选择替换为具体功能组件或表格。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
    };

    window.AdminPageComponent = AdminPage;
})();