const { Router } = require('express');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

const router = new Router();

router.post('/', upload.single('data'), (req, res) => {
  console.log(req.file);
});

module.exports = router;
