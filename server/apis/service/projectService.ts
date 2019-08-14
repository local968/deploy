import request from './request'
import config from '../../../config'

const add = async (duser,project_id)=>{
  const url = `${config.STRAPI}/projects`;
  return request.post({
    url,
    data:{
      duser,
      project_id,
    },
  })
};

const list = async (user_id)=>{
  const url = `${config.STRAPI}/r2/project/${user_id}`;
  return request.get(url)
};

const findId = async project_id=>{
  const url = `${config.STRAPI}/projects?project_id=${project_id}`;
  const project = await request.get(url);
  return project[0]&&project[0].id;
};

const remove = async (project_id)=>{
  const id = await findId(project_id);
  const url = `${config.STRAPI}/projects/${id}`;
  return request.delete(url)
};

module.exports = {
  add,
  list,
  remove,
};
