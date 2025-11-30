export default {
    name: 'updatePassDTO',
    title: 'UpdatePassDTO',
    fields: [
        { name: 'oldPassword', label: '旧密码', type: 'string', inputType: 'password', required: true },
        { name: 'newPassword', label: '新密码', type: 'string', inputType: 'password', required: true },
        { name: 'confirmPassword', label: '确认密码', type: 'string', inputType: 'password' }
    ]
};