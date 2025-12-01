export default {
    name: 'permission',
    title: '权限',
    idField: 'permissionId',
    fields: [
        { name: 'permissionId', label: '权限ID', type: 'number', readonly: true },
        { name: 'permissionCode', label: '权限代码', type: 'string' },
        { name: 'description', label: '描述', type: 'string' },
        { name: 'module', label: '权限对应模块', type: 'string' },
        { name: 'desCN', label: '中文介绍', type: 'string' }
    ]
};