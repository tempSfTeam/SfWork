export default {
    name: 'roleToPermission',
    title: '角色-权限 关联',
    idField: 'id',
    fields: [
        { name: 'id', label: 'ID', type: 'number', readonly: true },
        { name: 'roleId', label: '角色ID', type: 'number', required: true },
        { name: 'permissionId', label: '权限ID', type: 'number', required: true }
    ]
};