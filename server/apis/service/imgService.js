const request = require('./request');
const config = require('config');

const url = `${config.STRAPI}/images`;

const detail = async name =>{
	// const _name = name.substring(0,name.lastIndexOf('.'));
	const result =  await request.get(`${url}?name=${name}`);
	if(result&&result[0]){
		const {url} =  result[0].url;
		// return await request.get(`${config.STRAPI}/${url}`);
		return url;
	}
};

module.exports = {
	detail,
};
