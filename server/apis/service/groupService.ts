import request from './request'
import config from '../../../config'

const url = `${config.STRAPI}/groups`;

const findByName = async name=>{
	const result = await request.get(`${url}`,{name});
	return result&&result[0];
};

const create = async name=>{
  await request.post({
    url,
    data:{name},
  })
};

module.exports = {
	findByName,
  create,
};
