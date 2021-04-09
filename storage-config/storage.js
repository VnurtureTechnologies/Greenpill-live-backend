const Cloud = require('@google-cloud/storage');
const path = require('path');
const serviceKey = require('../greenpill-live-firebase-admin');

const { Storage } = Cloud;

const storage = new Storage({
    projectId: 'greenpill-live',
    keyFileName: serviceKey
    
})

module.exports = storage;