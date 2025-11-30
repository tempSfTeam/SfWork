export default {
    name: 'profession',
    title: '专业',
    idField: 'professionId',
    fields: [
        { name: 'professionId', label: '专业ID', type: 'number', readonly: true },
        { name: 'name', label: '专业名', type: 'string', required: true },
        { name: 'courseTypeId', label: '课程类型ID', type: 'number' },
        { name: 'sort', label: '排序', type: 'number' }
    ]
};