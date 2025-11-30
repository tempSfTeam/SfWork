export default {
    name: 'role',
    title: '角色',
    idField: 'roleId',
    fields: [
        { name: 'roleId', label: '角色ID', type: 'number', readonly: true },
        { name: 'roleName', label: '角色名', type: 'string', required: true }
    ]
};