import { observable, action, when } from 'mobx';
import axios from 'axios';
import config from 'config';
import socketStore from './SocketStore';
// import testData from './classification.json'
// import testData from './regression.json'
// import testData from './test.json'

class UserStore {

  @observable status = 'init'; // unlogin login
  @observable info = {
    id: '',
    email: '',
    role:{} as any,
    level:0,
  };
  @observable tabKey = '1';
  @observable videoKey = '1';
  @observable isWatchVideo = true;
  @observable isCheck = false;
  @observable planList = [];
  @observable labUrl = '';
  @observable dashUrl= '';

  @action change = (name) => (val) => {
    this[name] = val;
  };

  constructor() {
    // window.r2Report = testData

    if ((window as any).r2Report) {
      this.status = 'unlogin'
      return
    }
    this.getStatus();

    when(() => this.status === 'login', socketStore.connect.bind(socketStore))
  }

  getStatus(){
    axios.get(`/user/status`).then(action((res: any) => {
      if (res.data.status === 200&&res.data.info.role) {
        this.info = res.data.info;
        if(res.data.info.role.project === false&&location.pathname==='/'){
          location.href = '/deploy'
        }
        if(res.data.info.role.JupyterLab !== false){
          axios.get('/jupyterLabUrl')
            .then(({ data }) => this.labUrl = data)
        }
        if(res.data.info.role.Dashboard !== false){
          axios.get('/dashboardUrl')
            .then(({ data }) => this.dashUrl = data)
        }
        this.status = 'login'
      } else {
        this.status = 'unlogin'
      }
    }));
  }

  login(params, props=null) {
    return axios.post(`/user/login`, params)
  }

  register(params) {
    axios.post(`/user/register`, params).then(action((res: any) => {
      if (res.data.status === 200) {
        this.info = res.data.info;
        this.status = 'login';
        this.getStatus();
      } else {
        alert(res.data.message)
      }
    }))
  }

  getPlanList() {
    axios.get(`//${config.host}:${config.port}/user/plans`).then(action((res: any) => {
      if (res.data.status === 200) {
        this.planList = res.data.info;
      } else {
        alert(res.data.message)
      }
    }))
  }

  logout() {
    axios.delete(`/user/logout`).then(action((res: any) => {
      if (res.data.status === 200) {
        this.status = 'unlogin';
        this.labUrl = '';
        this.dashUrl= '';
        window.location.reload()
      } else {
        alert(res.data.message)
      }
    }))
  }

  resetPassword(code, password) {
    return axios.put(`/user/resetpassword`, { code, password })
  }

  forgetPassword(email) {
    return axios.post(`/user/forgetpassword`, { email })
  }

  changePassword(current, newPassword) {
    return axios.put(`/user/changepassword`, { current, newPassword })
  }
}

export { UserStore }

export default new UserStore()
