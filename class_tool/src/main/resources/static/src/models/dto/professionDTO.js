export default {
    name: 'professionDTO',
    title: 'ProfessionDTO',
    fields: [
        { name: 'professionId', label: '专业ID', type: 'number' },
        { name: 'name', label: '专业名称', type: 'string', required: true },
        { name: 'courseTypeId', label: '课程类型ID', type: 'number' }
    ]
};