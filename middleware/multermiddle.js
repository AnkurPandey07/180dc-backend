const multer = require('multer')

const storage = multer.diskStorage({
  fileFilter: function (req, file, cb) {
    if (!file.mimetype.match(/jpe|jpg|jpeg|png|gif$i/)) {
      cb(new Error('File not  supported'), false)
    }
    cb(null, true)
  },
  destination: function (req, file, cb) {
    cb(null, 'mentorphotos/')
  },
  filename: function (req, file, cb) {
    const firstName = req.body.firstname
    const lastname = req.body.lastname
    file.fieldname = firstName + lastname
    cb(null, file.fieldname + '.jpg')
  },
})

const upload = multer({ storage: storage })
const type = upload.single('profile_pic')

module.exports = type
