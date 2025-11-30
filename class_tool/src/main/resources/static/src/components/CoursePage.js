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
                )
            };
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
                    <button style="padding:8px 12px;border-radius:16px;background:#2b7cff;color:#fff;border:none;cursor:pointer">进入课堂</button>
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