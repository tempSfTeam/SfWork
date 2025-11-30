export default {
    name: 'courseType',
    title: '课程分类',
    idField: 'courseTypeId',
    fields: [
        { name: 'courseTypeId', label: '类型ID', type: 'number', readonly: true },
        { name: 'name', label: '名称', type: 'string', required: true },
        { name: 'sort', label: '排序', type: 'number' }
    ]
};