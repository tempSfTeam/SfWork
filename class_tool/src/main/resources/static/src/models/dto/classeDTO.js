export default {
    name: 'classeDTO',
    title: 'ClasseDTO',
    fields: [
        { name: 'classeId', label: '班级ID', type: 'number' },
        { name: 'name', label: '班级名称', type: 'string', required: true },
        { name: 'schoolId', label: '学校ID', type: 'number', required: true },
        { name: 'grade', label: '年级', type: 'string' }
    ]
};