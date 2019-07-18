import request from './request'
import config from '../../../config'

const url = `${config.STRAPI}/dusers`;

const exist = async email=>{
	const had:any = await request.get(`${url}?email=${email}`);
	return !!(had||[]).length;
};

const findByEmail = async email=>{
	const result =  await request.get(`${url}?email=${email}`);
	return result&&result[0];
};

const register = async (res,email,plan,password)=>{
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
			password,
			plan,
			// plan_used:{},
			// drole:'master'
		},
	})
};

const status = (id)=>{
	return request.get(`${url}/${id}`);
};

const login = async (email,password)=>{
	return request.get(`${url}?email=${email}&password=${password}`);
};

const firstLogin = async (email,password,new_password)=>{
	 const user = await request.get(`${url}?email=${email}&update_password=${password}`);
	 if(user[0]){
	 	  return update(user[0].id,{
		    update_password:'',
		    password:new_password,
	    })
	 }
	 return false;
};

const update = async (id,data)=>{
	return request.put({
		url:`${url}/${id}`,
		data,
	});
};

const addUse = async (user_id,type,multi)=>{
	// const user:any = await status(user_id);
	// const {plan_used} = user;
	//
	// plan_used[type] = plan_used[type] || 0 + multi;
	//
	// return update(user_id,{
	// 	plan_used,
	// })
};

module.exports = {
	register,
	status,
	login,
	exist,
	update,
	addUse,
	findByEmail,
	firstLogin,
};
