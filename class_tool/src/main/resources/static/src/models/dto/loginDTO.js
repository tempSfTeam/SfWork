export default {
    name: 'loginDTO',
    title: 'LoginDTO',
    fields: [
        { name: 'name', label: '用户名', type: 'string', required: true },
        { name: 'password', label: '密码', type: 'string', required: true, inputType: 'password' },
        { name: 'uncheckedCode', label: '验证码（后端字段）', type: 'string' },
        { name: 'uuid', label: '验证码 UUID', type: 'string' }
    ]
};