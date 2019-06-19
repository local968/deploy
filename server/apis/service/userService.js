const request = require('./request');
const config = require('config');

const url = `${config.STRAPI}/dusers`;

const exist = async email=>{
	const had = await request.get(`${url}?email=${email}`);
	return !!had.length;
};

const register = async (res,email,level,plan_id,password,create_time)=>{
	const had = await exist(email);
	
	if(had){
		return res.send({
			message: "email exists.",
			status: 400
		});
	}
	
	return request.post({
		url,
		data:{
			email,
			level,
			password,
			create_time,
			plan_id,
		},
	})
};

const status = (id)=>{
	return request.get(`${url}/${id}`);
};

const login = async (email,password)=>{
	return request.get(`${url}?email=${email}&password=${password}`);
};

const update = async (id,data)=>{
	return request.put({
		url:`${url}/${id}`,
		data,
	});
};

module.exports = {
	register,
	status,
	login,
	exist,
	update
};
