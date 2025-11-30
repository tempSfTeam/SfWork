// window.Models - UMD aggregate of entity/dto/vo/bean models
// 放置于: src/main/resources/static/src/models/models-umd.js
(function () {
    const Models = {
        entity: {
            Classe: {
                name: 'classe',
                title: '班级',
                idField: 'classeId',
                fields: [
                    { name: 'classeId', label: '班级ID', type: 'number', readonly: true },
                    { name: 'name', label: '班级名称', type: 'string', required: true },
                    { name: 'schoolId', label: '学校ID', type: 'number', required: true },
                    { name: 'grade', label: '年级', type: 'string' }
                ]
            },
            ClasseToCourse: {
                name: 'classeToCourse',
                title: 'ClasseToCourse',
                idField: 'id',
                fields: [
                    { name: 'id', label: 'ID', type: 'number', readonly: true },
                    { name: 'classeId', label: '班级ID', type: 'number', required: true },
                    { name: 'courseId', label: '课程ID', type: 'number', required: true }
                ]
            },
            Course: {
                name: 'course',
                title: '课程',
                idField: 'courseId',
                fields: [
                    { name: 'courseId', label: '课程ID', type: 'number', readonly: true },
                    { name: 'name', label: '课程名称', type: 'string', required: true },
                    { name: 'description', label: '描述', type: 'string', inputType: 'textarea' },
                    { name: 'icon', label: '图标', type: 'string' },
                    { name: 'managerId', label: '管理员ID', type: 'number' }
                ]
            },
            CourseToProfession: {
                name: 'courseToProfession',
                title: 'CourseToProfession',
                idField: 'id',
                fields: [
                    { name: 'id', label: 'ID', type: 'number', readonly: true },
                    { name: 'courseId', label: '课程ID', type: 'number', required: true },
                    { name: 'professionId', label: '专业ID', type: 'number', required: true }
                ]
            },
            CourseType: {
                name: 'courseType',
                title: '课程分类',
                idField: 'courseTypeId',
                fields: [
                    { name: 'courseTypeId', label: '类型ID', type: 'number', readonly: true },
                    { name: 'name', label: '名称', type: 'string', required: true },
                    { name: 'sort', label: '排序', type: 'number' }
                ]
            },
            Experiment: {
                name: 'experiment',
                title: '实验',
                idField: 'experimentId',
                fields: [
                    { name: 'experimentId', label: '实验ID', type: 'number', readonly: true },
                    { name: 'name', label: '实验名', type: 'string', required: true },
                    { name: 'courseId', label: '课程ID', type: 'number', required: true },
                    { name: 'description', label: '描述', type: 'string' }
                ]
            },
            File: {
                name: 'file',
                title: '文件',
                idField: 'fileId',
                fields: [
                    { name: 'fileId', label: '文件ID', type: 'number', readonly: true },
                    { name: 'fileName', label: '文件名', type: 'string', required: true },
                    { name: 'fileType', label: '文件类型', type: 'number' },
                    { name: 'resourceType', label: '资源类型', type: 'number' },
                    { name: 'experimentId', label: '实验ID', type: 'number' },
                    { name: 'view', label: '浏览量', type: 'number' }
                ]
            },
            FilePic: {
                name: 'filePic',
                title: '文件图片',
                idField: 'id',
                fields: [
                    { name: 'id', label: 'ID', type: 'number', readonly: true },
                    { name: 'filePicName', label: '图片名', type: 'string' },
                    { name: 'fileId', label: '文件ID', type: 'number' },
                    { name: 'fileName', label: '文件名', type: 'string' }
                ]
            },
            Permission: {
                name: 'permission',
                title: '权限',
                idField: 'permissionId',
                fields: [
                    { name: 'permissionId', label: '权限ID', type: 'number', readonly: true },
                    { name: 'permissionCode', label: '权限代码', type: 'string' },
                    { name: 'description', label: '描述', type: 'string' }
                ]
            },
            Profession: {
                name: 'profession',
                title: '专业',
                idField: 'professionId',
                fields: [
                    { name: 'professionId', label: '专业ID', type: 'number', readonly: true },
                    { name: 'name', label: '专业名', type: 'string', required: true },
                    { name: 'courseTypeId', label: '课程类型ID', type: 'number' },
                    { name: 'sort', label: '排序', type: 'number' }
                ]
            },
            Role: {
                name: 'role',
                title: '角色',
                idField: 'roleId',
                fields: [
                    { name: 'roleId', label: '角色ID', type: 'number', readonly: true },
                    { name: 'roleName', label: '角色名', type: 'string', required: true }
                ]
            },
            RoleToPermission: {
                name: 'roleToPermission',
                title: '角色-权限 关联',
                idField: 'id',
                fields: [
                    { name: 'id', label: 'ID', type: 'number', readonly: true },
                    { name: 'roleId', label: '角色ID', type: 'number', required: true },
                    { name: 'permissionId', label: '权限ID', type: 'number', required: true }
                ]
            },
            School: {
                name: 'school',
                title: '学校',
                idField: 'schoolId',
                fields: [
                    { name: 'schoolId', label: '学校ID', type: 'number', readonly: true },
                    { name: 'name', label: '学校名称', type: 'string', required: true }
                ]
            },
            User: {
                name: 'user',
                title: '用户',
                idField: 'userId',
                fields: [
                    { name: 'userId', label: '用户ID', type: 'number', readonly: true },
                    { name: 'name', label: '用户名', type: 'string', required: true },
                    { name: 'password', label: '密码', type: 'string', inputType: 'password' },
                    { name: 'avatar', label: '头像', type: 'string' },
                    { name: 'phone', label: '电话', type: 'string' },
                    { name: 'email', label: '邮箱', type: 'string' },
                    { name: 'role', label: '角色ID', type: 'number' },
                    { name: 'schoolId', label: '学校ID', type: 'number' },
                    { name: 'classId', label: '班级ID', type: 'number' },
                    { name: 'createTime', label: '创建时间', type: 'string' }
                ]
            },
            UserToCourse: {
                name: 'userToCourse',
                title: '用户-课程 关系',
                idField: 'id',
                fields: [
                    { name: 'id', label: 'ID', type: 'number', readonly: true },
                    { name: 'userId', label: '用户ID', type: 'number', required: true },
                    { name: 'courseId', label: '课程ID', type: 'number', required: true }
                ]
            }
        },

        dto: {
            loginDTO: {
                name: 'loginDTO',
                title: 'LoginDTO',
                fields: [
                    { name: 'name', label: '用户名', type: 'string', required: true },
                    { name: 'password', label: '密码', type: 'string', required: true, inputType: 'password' },
                    { name: 'uncheckedCode', label: '验证码', type: 'string' },
                    { name: 'uuid', label: '验证码 UUID', type: 'string' }
                ]
            },
            sortDTO: {
                name: 'sortDTO',
                title: 'SortDTO',
                fields: [
                    { name: 'targetId', label: '目标ID', type: 'number', required: true },
                    { name: 'newSort', label: '新顺序', type: 'number', required: true }
                ]
            },
            courseDTO: {
                name: 'courseDTO',
                title: 'CourseDTO',
                fields: [
                    { name: 'courseId', label: '课程ID', type: 'number' },
                    { name: 'name', label: '课程名称', type: 'string', required: true },
                    { name: 'description', label: '描述', type: 'string' },
                    { name: 'icon', label: '图标URL', type: 'string' },
                    { name: 'managerId', label: '管理员ID', type: 'number' },
                    { name: 'professionIds', label: '专业IDs', type: 'array' }
                ]
            },
            courseTypeDTO: {
                name: 'courseTypeDTO',
                title: 'CourseTypeDTO',
                fields: [
                    { name: 'courseTypeId', label: '课程类型ID', type: 'number' },
                    { name: 'name', label: '名称', type: 'string', required: true }
                ]
            },
            userAddDTO: {
                name: 'userAddDTO',
                title: 'UserAddDTO',
                fields: [
                    { name: 'name', label: '用户名', type: 'string', required: true },
                    { name: 'password', label: '初始密码', type: 'string', required: true, inputType: 'password' },
                    { name: 'phone', label: '电话', type: 'string' },
                    { name: 'email', label: '邮箱', type: 'string' },
                    { name: 'role', label: '角色ID', type: 'number', required: true },
                    { name: 'schoolId', label: '学校ID', type: 'number' },
                    { name: 'classId', label: '班级ID', type: 'number' }
                ]
            },
            schoolDTO: {
                name: 'schoolDTO',
                title: 'SchoolDTO',
                fields: [
                    { name: 'schoolId', label: '学校ID', type: 'number' },
                    { name: 'name', label: '学校名称', type: 'string', required: true }
                ]
            },
            classeDTO: {
                name: 'classeDTO',
                title: 'ClasseDTO',
                fields: [
                    { name: 'classeId', label: '班级ID', type: 'number' },
                    { name: 'name', label: '班级名称', type: 'string', required: true },
                    { name: 'schoolId', label: '学校ID', type: 'number', required: true },
                    { name: 'grade', label: '年级', type: 'string' }
                ]
            },
            professionDTO: {
                name: 'professionDTO',
                title: 'ProfessionDTO',
                fields: [
                    { name: 'professionId', label: '专业ID', type: 'number' },
                    { name: 'name', label: '专业名称', type: 'string', required: true },
                    { name: 'courseTypeId', label: '课程类型ID', type: 'number' }
                ]
            },
            updatePassDTO: {
                name: 'updatePassDTO',
                title: 'UpdatePassDTO',
                fields: [
                    { name: 'oldPassword', label: '旧密码', type: 'string', inputType: 'password', required: true },
                    { name: 'newPassword', label: '新密码', type: 'string', inputType: 'password', required: true },
                    { name: 'confirmPassword', label: '确认密码', type: 'string', inputType: 'password' }
                ]
            },
            updateUserDTO: {
                name: 'updateUserDTO',
                title: 'UpdateUserDTO',
                fields: [
                    { name: 'userId', label: '用户ID', type: 'number', readonly: true },
                    { name: 'name', label: '用户名', type: 'string' },
                    { name: 'phone', label: '电话', type: 'string' },
                    { name: 'email', label: '邮箱', type: 'string' },
                    { name: 'avatar', label: '头像', type: 'string' }
                ]
            },
            classeToCourseDTO: {
                name: 'classeToCourseDTO',
                title: 'ClasseToCourseDTO',
                fields: [
                    { name: 'classeId', label: '班级ID', type: 'number', required: true },
                    { name: 'courseId', label: '课程ID', type: 'number', required: true }
                ]
            },
            userToCourseDTO: {
                name: 'userToCourseDTO',
                title: 'UserToCourseDTO',
                fields: [
                    { name: 'userId', label: '用户ID', type: 'number', required: true },
                    { name: 'courseId', label: '课程ID', type: 'number', required: true }
                ]
            },
            courseToProfessionDTO: {
                name: 'courseToProfessionDTO',
                title: 'CourseToProfessionDTO',
                fields: [
                    { name: 'id', label: 'ID', type: 'number' },
                    { name: 'courseId', label: '课程ID', type: 'number' },
                    { name: 'professionId', label: '专业ID', type: 'number' }
                ]
            },
            userQueryDTO: {
                name: 'userQueryDTO',
                title: 'UserQueryDTO',
                fields: [
                    { name: 'userId', label: '用户ID', type: 'number' },
                    { name: 'role', label: '角色', type: 'number' }
                ]
            }
        },

        vo: {
            userVO: {
                name: 'userVO',
                title: 'UserVO',
                fields: [
                    { name: 'name', label: '用户名', type: 'string' },
                    { name: 'avatar', label: '头像', type: 'string' },
                    { name: 'phone', label: '电话', type: 'string' },
                    { name: 'email', label: '邮箱', type: 'string' },
                    { name: 'userRole', label: '角色字符串', type: 'string' },
                    { name: 'schoolId', label: '学校ID', type: 'number' },
                    { name: 'classId', label: '班级ID', type: 'number' }
                ]
            },
            signInInfo: {
                name: 'signInInfo',
                title: 'SignInInfo',
                fields: [
                    { name: 'token', label: 'token', type: 'string' },
                    { name: 'userRole', label: '用户角色字符串', type: 'string' },
                    { name: 'permissionList', label: '权限列表 (map)', type: 'object' }
                ]
            },
            courseVO: {
                name: 'courseVO',
                title: 'CourseVO',
                fields: [
                    { name: 'courseId', label: '课程ID', type: 'number' },
                    { name: 'name', label: '课程名', type: 'string' },
                    { name: 'icon', label: '图标', type: 'string' },
                    { name: 'professionIdsStr', label: '专业IDs 字符串', type: 'string' },
                    { name: 'professionIds', label: '专业IDs', type: 'array' },
                    { name: 'description', label: '描述', type: 'string' },
                    { name: 'simpleExperiments', label: '实验列表', type: 'array' },
                    { name: 'click', label: '点击量', type: 'number' }
                ]
            },
            courseAllowanceVO: {
                name: 'courseAllowanceVO',
                title: 'CourseAllowanceVO',
                fields: [
                    { name: 'userId', label: '用户ID', type: 'number' },
                    { name: 'userName', label: '用户名', type: 'string' },
                    { name: 'simpleCourseVOList', label: '课程列表', type: 'array' }
                ]
            },
            simpleCourseVO: {
                name: 'simpleCourseVO',
                title: 'SimpleCourseVO',
                fields: [
                    { name: 'courseId', label: '课程ID', type: 'number' },
                    { name: 'courseName', label: '课程名', type: 'string' }
                ]
            },
            experimentInfoVO: {
                name: 'experimentInfoVO',
                title: 'ExperimentInfoVO',
                fields: [
                    { name: 'experimentId', label: '实验ID', type: 'number' },
                    { name: 'name', label: '实验名', type: 'string' },
                    { name: 'courseId', label: '课程ID', type: 'number' },
                    { name: 'courseName', label: '课程名', type: 'string' },
                    { name: 'courseDescription', label: '课程描述', type: 'string' },
                    { name: 'courseIcon', label: '课程图标', type: 'string' }
                ]
            },
            courseConnectionVO: {
                name: 'courseConnectionVO',
                title: 'CourseConnectionVO',
                fields: [
                    { name: 'courseId', label: '课程ID', type: 'number' },
                    { name: 'courseName', label: '课程名', type: 'string' },
                    { name: 'icon', label: '图标', type: 'string' },
                    { name: 'SimpleProfessionVOList', label: '专业列表', type: 'array' }
                ]
            },
            simpleProfessionVO: {
                name: 'simpleProfessionVO',
                title: 'SimpleProfessionVO',
                fields: [
                    { name: 'professionId', label: '专业ID', type: 'number' },
                    { name: 'professionName', label: '专业名', type: 'string' }
                ]
            },
            popularCourseVO: {
                name: 'popularCourseVO',
                title: 'PopularCourseVO',
                fields: [
                    { name: 'courseId', label: '课程ID', type: 'number' },
                    { name: 'name', label: '课程名', type: 'string' },
                    { name: 'icon', label: '图标', type: 'string' },
                    { name: 'click', label: '点击量', type: 'number' }
                ]
            },
            simpleExperiment: {
                name: 'simpleExperiment',
                title: 'SimpleExperiment',
                fields: [
                    { name: 'experimentId', label: '实验ID', type: 'number' },
                    { name: 'name', label: '实验名', type: 'string' }
                ]
            }
        },

        bean: {
            msg: {
                name: 'msg',
                title: '统一返回 Msg',
                fields: [
                    { name: 'code', label: '状态码', type: 'number' },
                    { name: 'message', label: '消息', type: 'string' },
                    { name: 'data', label: '数据', type: 'any' },
                    { name: 'other', label: '其它', type: 'any' }
                ]
            },
            userData: {
                name: 'userData',
                title: 'UserData (session)',
                fields: [
                    { name: 'userId', label: '用户ID', type: 'number' },
                    { name: 'name', label: '用户名', type: 'string' },
                    { name: 'role', label: '角色ID', type: 'number' }
                ]
            }
        }
    };

    // Expose globally
    window.Models = Models;
})();