import { observable, action, when } from 'mobx';
import axios from 'axios';
import config from 'config';
import socketStore from './SocketStore';

class UserStore {

  @observable status = 'init' // unlogin login
  @observable role = ''
  @observable info = {
    id: '',
    email: ''
  }

  constructor() {
    axios.get(`http://${config.host}:${8080||config.port}/user/status`).then(action(res => {
      if (res.data.status === 200) {
        this.info = res.data.info
        this.role = res.data.info.role
        this.status = 'login'
      } else {
        this.status = 'unlogin'
      }
    }))
    when(() => this.status === 'login', socketStore.connect.bind(socketStore))
  }

  login(params) {
    axios.post(`http://${config.host}:${config.port}/user/login`, params).then(action(res => {
      if (res.data.status === 200) {
        this.info = res.data.info
        this.status = 'login'
      } else {
        alert(res.data.message)
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
}

export default new UserStore()
