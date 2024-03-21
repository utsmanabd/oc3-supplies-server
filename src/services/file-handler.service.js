const multer = require('multer');
const api = require('../tools/common')

const uploadXlsx = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            return cb(new Error('Invalid file format'));
        }
        cb(null, true)
    }
})

const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return api.error(res, err.message, 400)
    }
    if (err) {
        return api.error(res, err.message, 500)
    }
    next()
}

module.exports = {
    uploadXlsx,
    handleUploadError
}