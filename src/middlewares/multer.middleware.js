import multer from 'multer'
import fs from 'fs'
import { handleError } from '../utils/ApiError.js'

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("req.route.path: ", req.route.path);
    let path
    if(req.route.path === '/:username/uploadProfile'){
       path = `./Public/files/${req.user._id}/profile`
    } else {
       path = `./Public/files/${req.user._id}/files`
    }


    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }

    cb(null, path)
  },
  filename: function (req, file, cb) {    
    cb(null, file.originalname + '-' + (new Date()).valueOf())
  }
})

export const upload = multer({ 
  storage
})
                          