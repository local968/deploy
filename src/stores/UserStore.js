import { observable, action } from 'mobx';

const axios = require('axios')

class UserStore {

  @observable status = 'init' // unlogin login
  @observable info = {
    id: '',
    email: ''
  }

  constructor() {
    axios.get('/user/status').then(action(res => {
      if (res.data.status === 200) {
        this.info = res.data.info
        this.status = 'login'
      } else {
        this.status = 'unlogin'
      }
    }))
  }

  login(params) {
    axios.post('/user/login', params).then(action(res => {
      if (res.data.status === 200) {
        this.info = res.data.info
        this.status = 'login'
      } else {
        alert(res.data.message)
      }
    }))
  }

  register(params) {
    axios.post('/user/register', params).then(action(res => {
      if (res.data.status === 200) {
        this.info = res.data.info
        this.status = 'login'
      } else {
        alert(res.data.message)
      }
    }))
  }

  logout() {
    axios.delete('/user/logout').then(action(res => {
      if (res.data.status === 200) {
        this.status = 'unlogin'
      } else {
        alert(res.data.message)
      }
    }))
  }
}

export default new UserStore()
