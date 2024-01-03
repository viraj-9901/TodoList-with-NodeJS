import multer from 'multer'
import fs from 'fs'

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const path = `./Public/files/${req.user._id}`
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }
    console.log(req.body);
    cb(null, path)
  },
  filename: function (req, file, cb) {
    console.log(req.body);
    cb(null, file.originalname + '-' + (new Date()).valueOf())
  }
})

export const upload = multer({ 
  storage
})
                          