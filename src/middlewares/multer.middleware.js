import multer from 'multer'

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './Public/files')
  },
  filename: function (req, file, cb) {
    
    // cb(null, req.user.username + '_' + file.originalname)
    cb(null, file.originalname)
  }
})

export const upload = multer({ 
  storage
})
                          