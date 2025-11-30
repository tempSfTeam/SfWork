export default {
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
};