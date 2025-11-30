export default {
    name: 'courseToProfession',
    title: 'CourseToProfession',
    idField: 'id',
    fields: [
        { name: 'id', label: 'ID', type: 'number', readonly: true },
        { name: 'courseId', label: '课程ID', type: 'number', required: true },
        { name: 'professionId', label: '专业ID', type: 'number', required: true }
    ]
};