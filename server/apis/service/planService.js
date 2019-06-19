const request = require('./request');
const config = require('config');

const url = `${config.STRAPI}/plans`;

const list = ()=>{
	return request.get(`${url}`);
};

const detail = id =>{
	return request.get(`${url}/${id}`);
};

module.exports = {
	list,
	detail,
};
