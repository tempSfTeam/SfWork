export default {
    name: 'courseDTO',
    title: 'CourseDTO',
    fields: [
        { name: 'courseId', label: '课程ID', type: 'number' },
        { name: 'name', label: '课程名称', type: 'string', required: true },
        { name: 'description', label: '描述', type: 'string', inputType: 'textarea' },
        { name: 'icon', label: '图标URL', type: 'string' },
        { name: 'managerId', label: '管理员ID', type: 'number' },
        { name: 'professionIds', label: '专业IDs', type: 'array', placeholder: 'JSON数组或逗号分隔' }
    ]
};