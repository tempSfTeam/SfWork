export default {
    name: 'file',
    title: '文件',
    idField: 'fileId',
    fields: [
        { name: 'fileId', label: '文件ID', type: 'number', readonly: true },
        { name: 'fileName', label: '文件名', type: 'string', required: true },
        { name: 'fileType', label: '文件类型', type: 'number' },
        { name: 'resourceType', label: '资源类型', type: 'number' },
        { name: 'experimentId', label: '实验ID', type: 'number' },
        { name: 'view', label: '浏览量', type: 'number' }
    ]
};