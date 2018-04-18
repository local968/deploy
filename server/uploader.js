const { Router } = require('express');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

const router = new Router();

router.post('/', upload.single('data'), (req, res) => {
  console.log(1112);
  console.log(req.file);
  res.send('ok');
});

module.exports = router;
