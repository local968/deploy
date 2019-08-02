import request from './request'
import config from '../../../config'

const url = `${config.STRAPI}/images`;

const detail = async name =>{
	const result =  await request.get(`${url}?name=${name}`);
	if(result&&result[0]){
		const {url} =  result[0].url;
		return url;
	}
};

module.exports = {
	detail,
};
