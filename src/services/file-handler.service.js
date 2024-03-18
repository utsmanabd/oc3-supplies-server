const multer = require('multer');

const uploadXlsx = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            return cb(new Error('Invalid file format'));
        }
        cb(null, true)
    }
})

module.exports = {
    uploadXlsx
}