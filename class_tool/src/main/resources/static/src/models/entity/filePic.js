export default {
    name: 'filePic',
    title: '文件图片',
    idField: 'id',
    fields: [
        { name: 'id', label: 'ID', type: 'number', readonly: true },
        { name: 'filePicName', label: '图片名', type: 'string' },
        { name: 'fileId', label: '文件ID', type: 'number' },
        { name: 'fileName', label: '文件名', type: 'string' }
    ]
};