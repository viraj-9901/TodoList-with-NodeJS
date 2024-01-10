import multer from 'multer'
import fs from 'fs'
import { handleError } from '../utils/ApiError.js'

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const path = `./Public/files/${req.user._id}`

    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }
    cb(null, path)
  },
  filename: function (req, file, cb) {
    console.log(file);
    cb(null, file.originalname + '-' + (new Date()).valueOf())
  }
})

export const upload = multer({ 
  storage
})
                          