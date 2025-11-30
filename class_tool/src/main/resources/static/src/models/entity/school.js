export default {
    name: 'school',
    title: '学校',
    idField: 'schoolId',
    fields: [
        { name: 'schoolId', label: '学校ID', type: 'number', readonly: true },
        { name: 'name', label: '学校名称', type: 'string', required: true }
    ],
    validate(form = {}) {
        const errs = [];
        if (!form.name) errs.push('学校名称为必填项');
        return errs;
    }
};