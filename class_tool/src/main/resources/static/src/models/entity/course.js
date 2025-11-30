export default {
    name: 'course',
    title: '课程',
    idField: 'courseId',
    fields: [
        { name: 'courseId', label: '课程ID', type: 'number', readonly: true },
        { name: 'name', label: '课程名称', type: 'string', required: true },
        { name: 'description', label: '描述', type: 'string', inputType: 'textarea' },
        { name: 'icon', label: '图标', type: 'string' },
        { name: 'managerId', label: '管理员ID', type: 'number' }
    ],
    validate(form = {}) {
        const errors = [];
        if (!form.name) errors.push('课程名称为必填项');
        return errors;
    }
};