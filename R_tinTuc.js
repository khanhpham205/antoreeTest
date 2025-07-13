var express = require('express');
var router = express.Router();
var multer = require("multer");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const C_tintuc = require("../controllers/C_tinTuc");
const { auth, ckKOL, ckAdminlvl1, ckCanAddCD } = require('../middlewares/auth')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!req.body._id) {
      req.body._id = new mongoose.Types.ObjectId();
    }
    const dir = `public/tintuc/${req.body._id}`;
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });


router.get('/', C_tintuc.getTinTuc);
router.get('/byid/:id', C_tintuc.getTinTucById);
router.post(
  "/add",auth,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "file" },
  ]),
  C_tintuc.addTinTuc
);

router.put(
  "/edit/:id",auth,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "file" },
  ]),
  C_tintuc.editTinTuc
);

router.delete('/del/:id', C_tintuc.deleteTinTuc);
module.exports = router;
