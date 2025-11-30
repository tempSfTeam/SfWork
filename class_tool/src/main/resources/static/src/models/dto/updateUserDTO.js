export default {
    name: 'updateUserDTO',
    title: 'UpdateUserDTO',
    fields: [
        { name: 'userId', label: '用户ID', type: 'number', readonly: true },
        { name: 'name', label: '用户名', type: 'string' },
        { name: 'phone', label: '电话', type: 'string' },
        { name: 'email', label: '邮箱', type: 'string' },
        { name: 'avatar', label: '头像', type: 'string' }
    ]
};