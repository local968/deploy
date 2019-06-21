const {Router} = require("express");
const user = require("./user");
const upload = require("./upload");
const redirect = require("./redirect");
const redirectEs = require("./redirectEs");
const redirectUpload = require("./redirectUpload");
const api = require("./api");
const image = require("./image");
require("./project");
require("./deployment");
require("./database");
require("./etl");

const router = new Router();

router.use("/user", user);
router.use("/upload", upload);
router.use("/redirect", redirect);
router.use("/etls", redirectEs);
router.use("/uploads", redirectUpload);
router.use("/api", api);
router.use("/image", image);
router.get("/jupyterLabUrl", (req, res) => res.send(process.env.JUPYTER_LAB || 'http://192.168.0.23:18888/notebook/lab'))

module.exports = router;
