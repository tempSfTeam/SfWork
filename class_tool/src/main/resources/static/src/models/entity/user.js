export default {
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
};