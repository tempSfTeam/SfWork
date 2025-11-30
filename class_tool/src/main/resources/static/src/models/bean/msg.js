export default {
    name: 'msg',
    title: '统一返回 Msg',
    fields: [
        { name: 'code', label: '状态码', type: 'number', readonly: true },
        { name: 'message', label: '消息', type: 'string', readonly: true },
        { name: 'data', label: '数据', type: 'any', readonly: true },
        { name: 'other', label: '其它', type: 'any', readonly: true }
    ]
};