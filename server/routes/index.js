const { Router } = require("express");
const user = require("./user");
const upload = require("./upload");
const redirect = require("./redirect");
const redirectEs = require("./redirectEs");
const api = require("./api");
require("./project");
require("./deployment");
require("./database");
require("./etl");

const router = new Router();

router.use("/user", user);
router.use("/upload", upload);
router.use("/redirect", redirect);
router.use("/etls", redirectEs);
router.use("/api", api);
router.get("/jupyterLabUrl", (req, res) => res.send(process.env.JUPYTER_LAB || 'http://192.168.0.23:18888/notebook/lab'))
router.get("/dashboardUrl", (req, res) => res.send(process.env.DASHBOARD_URL || 'https://192.168.0.23:16443/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:/proxy/'))

module.exports = router;
