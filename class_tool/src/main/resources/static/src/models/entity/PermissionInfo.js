export default {
    name: 'permissionInfo',
    title: 'PermissionInfo',
    fields: [
        { name: 'roleId', label: '角色id', type: 'number' },
        // 嵌套 permission 对象（按仓库风格仅在 schema 中声明字段名称）
        { name: 'permissionId', label: '权限id', type: 'number' },
        { name: 'module', label: '权限对应模块', type: 'string' },
        { name: 'description', label: '权限对应英文介绍', type: 'string' },
        { name: 'desCN', label: '权限对应中文介绍', type: 'string' }
    ]
};