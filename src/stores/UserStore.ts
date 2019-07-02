import { observable, action, when } from 'mobx';
import axios from 'axios';
import config from 'config';
import socketStore from './SocketStore';
// import testData from './classification.json'
// import testData from './regression.json'
// import testData from './test.json'

class UserStore {

  @observable status = 'init' // unlogin login
  @observable info = {
    id: '',
    email: '',
    level: ''
  }
  @observable tabKey = '1';
  @observable videoKey = '1';
  @observable isWatchVideo = true;
  @observable isCheck = false;

  @action change = (name) => (val) => {
    this[name] = val;
  }

  constructor() {
    // window.r2Report = testData

    if ((window as any).r2Report) {
      this.status = 'unlogin'
      return
    }

    axios.get(`http://${config.host}:${config.port}/user/status`).then(action(res => {
      if (res.data.status === 200) {
        this.info = res.data.info
        this.status = 'login'
      } else {
        this.status = 'unlogin'
      }
    }))
    when(() => this.status === 'login', socketStore.connect.bind(socketStore))
  }

  login(params, props=null) {
    axios.post(`http://${config.host}:${config.port}/user/login`, params).then(action(res => {
      if (res.data.status === 200) {
        this.info = res.data.info
        this.status = 'login'
        props && props.history.push({
          pathname: '/support', state: {
            key
              : 'loginTo'
          }
        })
      } else {
        alert(res.data.message || 'Login failure')
      }
    }))
  }

  register(params) {
    axios.post(`http://${config.host}:${config.port}/user/register`, params).then(action(res => {
      if (res.data.status === 200) {
        this.info = res.data.info
        this.status = 'login'
      } else {
        alert(res.data.message)
      }
    }))
  }

  logout() {
    axios.delete(`http://${config.host}:${config.port}/user/logout`).then(action(res => {
      if (res.data.status === 200) {
        this.status = 'unlogin'
        window.location.reload()
      } else {
        alert(res.data.message)
      }
    }))
  }

  resetPassword(code, password) {
    return axios.put(`http://${config.host}:${config.port}/user/resetpassword`, { code, password })
  }

  forgetPassword(email) {
    return axios.post(`http://${config.host}:${config.port}/user/forgetpassword`, { email })
  }

  changePassword(current, newPassword) {
    return axios.put(`http://${config.host}:${config.port}/user/changepassword`, { current, newPassword })
  }
}

export { UserStore }

export default new UserStore()
