export default {
    name: 'userToCourse',
    title: '用户-课程 关系',
    idField: 'id',
    fields: [
        { name: 'id', label: 'ID', type: 'number', readonly: true },
        { name: 'userId', label: '用户ID', type: 'number', required: true },
        { name: 'courseId', label: '课程ID', type: 'number', required: true }
    ]
};