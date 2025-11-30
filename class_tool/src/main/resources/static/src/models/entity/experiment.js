export default {
    name: 'experiment',
    title: '实验',
    idField: 'experimentId',
    fields: [
        { name: 'experimentId', label: '实验ID', type: 'number', readonly: true },
        { name: 'name', label: '实验名', type: 'string', required: true },
        { name: 'courseId', label: '课程ID', type: 'number', required: true },
        { name: 'description', label: '描述', type: 'string' }
    ]
};