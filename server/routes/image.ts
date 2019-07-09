const { Router } = require('express');

const router = new Router();

const {imgService} = require('../apis/service');


router.get('/:name', async (req, res) => {
	const url =  await imgService.detail(req.params.name);
	return res.send(url);
});

export default router;
