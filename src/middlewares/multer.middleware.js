import multer from 'multer'

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './Public/files')
  },
  filename: function (req, file, cb) {
    // const userFile = req.files.files 
    // req.user.userFiles = req.files.files
    cb(null, file.originalname + '-' + req.user.username + '-' + (new Date()).valueOf())
    // cb(null, file.originalname)
  }
})

export const upload = multer({ 
  storage
})
                          