export default {
    name: 'classeToCourse',
    title: 'ClasseToCourse',
    idField: 'id',
    fields: [
        { name: 'id', label: 'ID', type: 'number', readonly: true },
        { name: 'classeId', label: '班级ID', type: 'number', required: true },
        { name: 'courseId', label: '课程ID', type: 'number', required: true }
    ]
};