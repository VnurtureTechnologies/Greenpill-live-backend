const Cloud = require('@google-cloud/storage');
const path = require('path');
const serviceKey = require('./firebase-storage-key.json');

const { Storage } = Cloud;
const storage = new Storage({
    keyFileName: serviceKey,
    projectId: 'greenpill-live'
})

module.exports = storage;