export default {
    name: 'courseVO',
    title: 'CourseVO',
    fields: [
        { name: 'courseId', label: '课程ID', type: 'number' },
        { name: 'name', label: '课程名', type: 'string' },
        { name: 'icon', label: '图标', type: 'string' },
        { name: 'professionIdsStr', label: '专业IDs 字符串', type: 'string' },
        { name: 'professionIds', label: '专业IDs', type: 'array' },
        { name: 'description', label: '描述', type: 'string' },
        { name: 'simpleExperiments', label: '实验列表', type: 'array' },
        { name: 'click', label: '点击量', type: 'number' }
    ]
};