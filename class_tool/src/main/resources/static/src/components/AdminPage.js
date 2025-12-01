// AdminPage (UMD) - 管理页面（包含“角色权限管理”、“学习对象管理”，新增“课程科目管理”）
// 说明：保持已有模块逻辑不变。新增课程科目管理（/profession/*）
// - 0: /courseType/listAll -> 下拉选择学习对象（复用已有 loadCourseTypes）
// - 1: /profession/add      -> 创建：{ courseTypeId, name }
// - 2: /profession/delete   -> 删除：{ professionId }
// - 3: /profession/update   -> 更新：{ professionId, courseTypeId, name } (完整 DTO)
// - 4: /profession/listByCourseTypeId -> 获取指定学习对象下科目，参数 courseTypeId（GET params）
// 全部请求优先使用 window.ApiCore（若存在），否则回退 axios；axios 请求会带 Authorization: Bearer <token>（从 ApiCore.getToken 或 localStorage.sf_token）
(function () {
    const AdminPage = {
        props: ['store'],
        data() {
            return {
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

                // 角色权限管理状态（保留已有）
                rp_loading: false,
                rp_error: null,
                rp_roles: [],
                rp_perms_by_cat: {},
                rp_cat_order: [],

                // 学习对象管理（courseType）状态（已有）
                ct_loading: false,
                ct_error: null,
                ct_items: [], // { id, name, _raw, _saving }

                // ---- 新增：课程科目管理（profession）状态 ----
                prof_loading: false,
                prof_error: null,
                prof_items: [], // { professionId, courseTypeId, name, _raw, _saving }
                selectedCourseTypeId: null
            };
        },
        computed: {
            roleCode() { return this.store && this.store.user ? this.store.user.roleCode : null; },
            allowed() { return this.roleCode === 2 || this.roleCode === 3; }
        },
        mounted() {
            try { if (window.mountHeader) window.mountHeader(this.store, '#shared-header'); } catch (e) {}
            this.menu.forEach(m => { if (m.key === this.activeTop && m.subs && m.subs.length) this.collapsed[m.key] = true; });
            if (this.activeTop === '角色权限管理') this.loadRolePermissions();
            if (this.activeTop === '学习对象管理') this.loadCourseTypes();
            if (this.activeTop === '课程科目管理') {
                // ensure course types loaded then load professions for default
                this.ensureCourseTypesAndLoadProfessions();
            }
        },
        watch: {
            activeTop(newVal) {
                if (newVal === '角色权限管理') this.loadRolePermissions();
                if (newVal === '学习对象管理') this.loadCourseTypes();
                if (newVal === '课程科目管理') this.ensureCourseTypesAndLoadProfessions();
            }
        },
        methods: {
            // 左侧菜单（保持原样）
            toggleGroup(key) {
                const group = this.menu.find(m => m.key === key); if (!group) return;
                if (!group.subs || group.subs.length === 0) {
                    this.activeTop = key; this.activeSub = '';
                    Object.keys(this.collapsed).forEach(k => { if (k !== key) this.collapsed[k] = false; });
                    return;
                }
                this.collapsed[key] = !this.collapsed[key];
                if (this.collapsed[key]) this.activeTop = key;
                Object.keys(this.collapsed).forEach(k => { if (k !== key) this.collapsed[k] = false; });
            },
            chooseSub(topKey, subKey) { this.activeTop = topKey; this.activeSub = subKey; if (this.collapsed[topKey] === false) this.collapsed[topKey] = true; },
            contentTitle() { const top = this.menu.find(m => m.key === this.activeTop); if (!top) return ''; if (this.activeSub) { const s = (top.subs||[]).find(x=>x.key===this.activeSub); return s ? (top.title + ' - ' + s.title) : top.title; } return top.title; },

            // ---------------- 角色权限管理（保持原实现） ----------------
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

                const payload = [{ permissionId: singlePerm.permissionId, roleIds: Array.isArray(singlePerm.roleIds) ? singlePerm.roleIds.slice(0) : [] }];

                const getToken = () => {
                    try { if (window.ApiCore && typeof window.ApiCore.getToken === 'function') return window.ApiCore.getToken(); } catch (e) {}
                    try { return localStorage.getItem('sf_token') || null; } catch (e) { return null; }
                };
                const token = getToken();
                const headers = {};
                if (token) headers['Authorization'] = 'Bearer ' + token;

                const finalize = (ok) => { singlePerm._saving = false; return ok; };

                if (window.ApiCore && typeof window.ApiCore.post === 'function') {
                    return window.ApiCore.post('/manage/updateRoleToPermission', payload)
                        .then(resp => { console.info('updateRoleToPermission ok (ApiCore)', resp); return finalize(true); })
                        .catch(err => { console.error('updateRoleToPermission failed (ApiCore)', err); singlePerm._saving = false; throw err; });
                }

                if (!window.axios || typeof window.axios.post !== 'function') { singlePerm._saving = false; return Promise.reject(new Error('No HTTP client for POST')); }
                const base = (this.store && this.store.apiBase) ? this.store.apiBase.replace(/\/+$/, '') : '';
                const url = (base ? base : '') + '/manage/updateRoleToPermission';
                return window.axios.post(url, payload, { headers: headers, withCredentials: true })
                    .then(res => { console.info('updateRoleToPermission ok', res && res.data ? res.data : res); return finalize(true); })
                    .catch(err => { console.error('updateRoleToPermission failed', err); singlePerm._saving = false; throw err; });
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
            },

            // ---------------- 学习对象管理（courseType） ----------------
            _getAuthHeaders() {
                try { if (window.ApiCore && typeof window.ApiCore.getToken === 'function') { const t=window.ApiCore.getToken(); if (t) return { Authorization: 'Bearer ' + t }; } } catch(e){}
                try { const t2=localStorage.getItem('sf_token'); if (t2) return { Authorization: 'Bearer ' + t2 }; } catch(e){}
                return {};
            },

            // loadCourseTypes 返回 promise（以便其它模块在加载完后执行）
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
                    this.ct_error = 'No HTTP client available'; this.ct_loading = false; return Promise.reject(new Error('no http client'));
                }
                const base = (this.store && this.store.apiBase) ? this.store.apiBase.replace(/\/+$/, '') : '';
                const url = (base ? base : '') + '/courseType/listAll';
                return window.axios.get(url, { headers: headers, withCredentials: true })
                    .then(res => { const data = res && res.data !== undefined ? res.data : (res || null); this._handleCourseTypesResponse(data); })
                    .catch(err => { this.ct_error = '请求失败'; console.error(err); });
            },

            _handleCourseTypesResponse(payload) {
                if (!payload) { this.ct_error = '无返回数据'; return; }
                if (payload.code !== undefined && payload.code !== null && payload.code !== 200 && payload.code !== 0) {
                    this.ct_error = payload.message || payload.msg || ('错误代码 ' + payload.code); return;
                }
                const data = payload.data !== undefined ? payload.data : payload;
                if (!data) { this.ct_error = '返回 data 为空'; return; }

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
                doPost().then(res => { console.info('createCourseType ok', res && res.data ? res.data : res); this.loadCourseTypes(); }).catch(err => { console.error('createCourseType failed', err); alert('创建失败'); });
            },

            editCourseType(item) {
                if (!item) return; const newName = prompt('编辑学习对象名称：', item.name || ''); if (newName === null) return; const trimmed = (newName || '').trim(); if (!trimmed) { alert('名称不能为空'); return; }
                const payload = { courseTypeId: item.id, name: trimmed }; const headers = this._getAuthHeaders();
                const doPost = () => { if (window.ApiCore && typeof window.ApiCore.post === 'function') return window.ApiCore.post('/courseType/update', payload); if (!window.axios || typeof window.axios.post !== 'function') return Promise.reject(new Error('no http client')); const base = (this.store && this.store.apiBase) ? this.store.apiBase.replace(/\/+$/, '') : ''; const url = (base ? base : '') + '/courseType/update'; return window.axios.post(url, payload, { headers: headers, withCredentials: true }); };
                item._saving = true; doPost().then(res => { console.info('editCourseType ok', res && res.data ? res.data : res); item.name = trimmed; }).catch(err => { console.error('editCourseType failed', err); alert('更新失败'); }).finally(() => { item._saving = false; });
            },

            deleteCourseType(item) {
                if (!item) return; if (!confirm('确定删除学习对象 "' + (item.name || '') + '" 吗？')) return;
                const payload = { courseTypeId: item.id }; const headers = this._getAuthHeaders();
                const doPost = () => { if (window.ApiCore && typeof window.ApiCore.post === 'function') return window.ApiCore.post('/courseType/delete', payload); if (!window.axios || typeof window.axios.post !== 'function') return Promise.reject(new Error('no http client')); const base = (this.store && this.store.apiBase) ? this.store.apiBase.replace(/\/+$/, '') : ''; const url = (base ? base : '') + '/courseType/delete'; return window.axios.post(url, payload, { headers: headers, withCredentials: true }); };
                item._saving = true; doPost().then(res => { console.info('deleteCourseType ok', res && res.data ? res.data : res); this.ct_items = this.ct_items.filter(x => x.id !== item.id); }).catch(err => { console.error('deleteCourseType failed', err); alert('删除失败'); }).finally(() => { item._saving = false; });
            },

            // Ensure course types are loaded then set selectedCourseTypeId and load professions for it
            ensureCourseTypesAndLoadProfessions() {
                const already = (this.ct_items && this.ct_items.length);
                this.loadCourseTypes().then(() => {
                    // if no selection, choose first
                    if (!this.selectedCourseTypeId && this.ct_items && this.ct_items.length) {
                        this.selectedCourseTypeId = this.ct_items[0].id;
                    }
                    // if still null, nothing to load
                    if (this.selectedCourseTypeId) this.loadProfessions(this.selectedCourseTypeId);
                }).catch(() => {
                    // even on failure, try to load professions if selection exists
                    if (this.selectedCourseTypeId) this.loadProfessions(this.selectedCourseTypeId);
                });
                // if already had ct_items, immediately ensure load
                if (already && !this.selectedCourseTypeId && this.ct_items.length) {
                    this.selectedCourseTypeId = this.ct_items[0].id;
                    this.loadProfessions(this.selectedCourseTypeId);
                }
            },

            // ---------------- 课程科目管理（profession）接口实现 ----------------
            // listByCourseTypeId -> GET /profession/listByCourseTypeId?courseTypeId=#
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
                    // ApiCore may accept query param string
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
                    .then(res => {
                        const data = res && res.data !== undefined ? res.data : (res || null);
                        this._handleProfessionsResponse(data);
                    })
                    .catch(err => { this.prof_error = '请求失败'; console.error(err); });
            },

            _handleProfessionsResponse(payload) {
                if (!payload) { this.prof_error = '无返回数据'; return; }
                if (payload.code !== undefined && payload.code !== null && payload.code !== 200 && payload.code !== 0) {
                    this.prof_error = payload.message || payload.msg || ('错误代码 ' + payload.code); return;
                }
                const data = payload.data !== undefined ? payload.data : payload;
                if (!data) { this.prof_error = '返回 data 为空'; return; }

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

            // add -> /profession/add (payload: { courseTypeId, name })
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
                        // reload list
                        this.loadProfessions(this.selectedCourseTypeId);
                    })
                    .catch(err => {
                        console.error('createProfession failed', err);
                        alert('创建失败');
                    })
                    .finally(() => { this.prof_loading = false; });
            },

            // update -> /profession/update (payload: ProfessionDTO)
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

            // delete -> /profession/delete (payload: { professionId })
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
                  <div @click="toggleGroup(m.key)"
                       :style="{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 10px',borderRadius:'6px',cursor:'pointer',background: (activeTop===m.key && (!m.subs||m.subs.length===0)) ? '#f0f6ff' : (m.key===activeTop ? '#f7fbff' : 'transparent') , border: (activeTop===m.key ? '1px solid rgba(43,124,255,0.08)' : '1px solid transparent') }">
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
                    <div v-for="sub in m.subs" :key="sub.key"
                         @click="chooseSub(m.key, sub.key)"
                         :style="{padding:'8px 10px',borderRadius:'6px',cursor:'pointer',background: (activeTop===m.key && activeSub===sub.key) ? '#eaf4ff' : 'transparent', color: (activeTop===m.key && activeSub===sub.key) ? '#2b7cff' : '#333', border: (activeTop===m.key && activeSub===sub.key) ? '1px solid rgba(43,124,255,0.12)' : '1px solid transparent'}">
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