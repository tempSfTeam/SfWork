export default {
    name: 'experimentInfoVO',
    title: 'ExperimentInfoVO',
    idField: 'experimentId',
    fields: [
        { name: 'experimentId', label: '实验ID', type: 'number' },
        { name: 'name', label: '实验名', type: 'string' },
        { name: 'courseId', label: '课程ID', type: 'number' },
        { name: 'courseName', label: '课程名', type: 'string' },
        { name: 'courseDescription', label: '课程描述', type: 'string' },
        { name: 'courseIcon', label: '课程图标', type: 'string' }
    ]
};