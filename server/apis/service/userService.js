const request = require('./request');
const config = require('config');

const url = `${config.STRAPI}/dusers`;

const exist = async email=>{
	const had = await request.get(`${url}?email=${email}`);
	return !!had.length;
};

const register = async (res,email,plan,password,create_time)=>{
	const had = await exist(email);
	
	if(had){
		return res.send({
			message: "email exists.",
			status: 400
		});
	}
	
	console.log({
		url,
		data:{
			email,
			// level:plan.level,
			password,
			create_time,
			plan_id:plan.id,
		},
	});
	
	return request.post({
		url,
		data:{
			email,
			// level:plan.level,
			password,
			create_time,
			plan_id:plan.id,
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

const addUse = async (user_id,type,multi)=>{
	const {plan} = await status(user_id);
	
	plan[type] = plan[type] || 0 + multi;
	
	return update(user_id,{
		plan,
	})
};

module.exports = {
	register,
	status,
	login,
	exist,
	update
};
