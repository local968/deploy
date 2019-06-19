const request = require('./request');
const config = require('config');

const url = `${config.STRAPI}/plans`;

const list = async ()=>{
	const _list = await request.get(`${url}`);
	return _list.sort((a,b)=>a.level-b.level)
};

const detail = async id =>{
	const result =  request.get(`${url}/${id}`);
	if(!result.id){
		const _list = await list();
		return _list[0];
	}
};

const restriction = async ()=>{
	const _list = await list();
	const result = {
		userProjectRestriction:[],
		userConcurrentRestriction:[],
		userDeployRestriction:[],
		userModelingRestriction:[],
		userStorageRestriction:[],
	};
	_list.forEach(itm=>{
		result.userProjectRestriction.push(itm.user_project_restriction);
		result.userConcurrentRestriction.push(itm.user_concurrent_restriction);
		result.userDeployRestriction.push(itm.user_deploy_restriction);
		result.userModelingRestriction.push(itm.user_modeling_restriction);
		result.userStorageRestriction.push(itm.user_storage_restriction);
	});
	return result;
};

module.exports = {
	list,
	detail,
	restriction,
};
