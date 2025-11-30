export default {
    name: 'courseConnectionVO',
    title: 'CourseConnectionVO',
    fields: [
        { name: 'courseId', label: '课程ID', type: 'number' },
        { name: 'courseName', label: '课程名', type: 'string' },
        { name: 'icon', label: '图标', type: 'string' },
        { name: 'SimpleProfessionVOList', label: '专业列表', type: 'array' }
    ]
};