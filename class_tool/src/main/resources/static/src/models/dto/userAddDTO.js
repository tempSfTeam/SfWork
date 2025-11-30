export default {
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
};