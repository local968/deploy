import request from './request'
import config from '../../../config'

const url = `${config.STRAPI}/dusers`;

const exist = async email=>{
	const had:any = await request.get(`${url}?email=${email}`);
	return !!(had||[]).length;
};

const findByEmail = async (email,res)=>{
	const result =  await request.get(`${url}?email=${email}`);
	if(!result){
		return res.send({ status: 500, message: 'internal server error.' })
	}
	return result[0];
};

const register = async (res,data)=>{
	const {email=''} = data;
	const had = await exist(email);

	if(had){
		return res.send({
			message: "email exists.",
			status: 400
		});
	}
	return request.post({
		url,
		data,
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

const loginByToken = async (token)=>{
	const result = await request.get(`${url}?token=${token}`);
	return result&&result[0];
};

module.exports = {
	register,
	status,
	login,
	exist,
	update,
	loginByToken,
	findByEmail,
	firstLogin,
};
