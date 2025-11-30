export default {
    name: 'signInInfo',
    title: 'SignInInfo',
    fields: [
        { name: 'token', label: 'token', type: 'string' },
        { name: 'userRole', label: '用户角色字符串', type: 'string' },
        { name: 'permissionList', label: '权限列表 (map)', type: 'object' }
    ]
};