import { observable, action, when, computed } from "mobx";
import socketStore from "./SocketStore";
import Project from "./Project";
import uuid from "uuid";
import moment from 'moment'
import { message as antdMessage } from 'antd'

class ProjectStore {
  @observable loading = true;
  @observable init = false;
  @observable isOnline = true
  @observable watchList = false;
  @observable currentId = "";

  @observable list = [];
  @observable total = 0;
  @observable keywords = '';
  @observable toolsOption = {
    current: 1,
    limit: 10,
    offset: 0,
    sort: 'createTime',
  }
  @observable broadcastId = "";
  @observable conflict = false

  constructor() {
    this.initWatch()
    this.initReload()
  }

  initReload = () => {
    socketStore.ready().then(api => {
      api.on('offline', this.offline)
      api.on('online', this.initWatch)
    })
  }

  initWatch = () => {
    this.isOnline = true
    if (this.init) return
    this.watchProjectList();
    when(
      () => this.watchList,
      () => {
        this.queryProjectList().then(() => {
          if (this.project) {
            this.project.initProject()
            this.project.initModels()
          }
        })
      }
    )
  }

  offline = () => {
    this.watchList = false;
    this.init = false
    this.isOnline = false
  }

  @computed
  get sortList() {
    const sort = this.toolsOption.sort
    return this.list.sort((a, b) => {
      return b[sort] - a[sort]
    }).slice(0, this.toolsOption.limit)
  }

  @computed
  get project() {
    return this.currentId ? this.list.find(row => row.id === this.currentId) : null
  }

  @action
  changeOption = (k, v) => {
    if (!isNaN(v)) {
      v = parseInt(v, 10)
    }
    this.toolsOption[k] = v;
    this.queryProjectList()
  }

  @action
  changePage = page => {
    const { current, limit } = this.toolsOption
    if (current === page) return;
    const offset = (page - 1) * limit
    Object.assign(this.toolsOption, { offset: offset, current: page })
    this.queryProjectList()
  }

  @action
  watchProjectList = () => {
    socketStore.ready().then(api => {
      api.watchProjectList().then(watch => {
        if (watch.status === 200) {
          this.watchList = true
          this.init = true
          api.on(watch.id, data => {
            const { status, id, result, model } = data
            if (status === 200) {
              const project = this.list.find(p => p.id === id)
              if (!project) {
                if (!result.host) return
                if (this.toolsOption.current === 1) this.list.push(new Project(id + "", { createTime: moment().unix(), updateTime: moment().unix() }))
              } else {
                if (result) project.setProperty(result)
                if (model) project.setModel(model)
              }
            }
          })
          api.on("inProject", data => {
            const { id, broadcastId } = data
            if (broadcastId === this.broadcastId) return
            if (id !== this.currentId) return
            this.showConflict()
          })
        }
      })
    })
  }

  @action
  queryProjectList = () => {
    this.loading = true;
    return socketStore.ready().then(api => {
      return api.queryProjectList(this.toolsOption).then(result => {
        const { status, message, list, count } = result
        if (status !== 200) {
          this.loading = false;
          return antdMessage.error(message)
        }
        this.list = list.map(row => new Project(row.id + "", row))
        this.total = count
        this.loading = false;
      })
    })
  }

  @action
  addProject = () => {
    if (this.loading) return
    this.loading = true;
    return socketStore.ready().then(api => {
      return api.addProject().then(result => {
        const { status, message, id } = result
        if (status !== 200) {
          this.loading = false;
          return { error: message }
        }
        // if (this.toolsOption.current === 1) this.list.push(new Project(id + "", { createTime: moment().unix(), updateTime: moment().unix() }))
        this.loading = false;
        return { id }
      })
    })
  }

  @action
  deleteProjects = ids => {
    if (this.loading) return
    this.loading = true;
    return socketStore.ready().then(api => {
      return api.deleteProjects({ ids }).then(result => {
        const { status, message } = result
        this.loading = false;
        if (status !== 200) {
          return antdMessage.error(message)
          // return { error: message }
        }
        this.list = this.list.filter(i => {
          return !ids.includes(i.id)
        })
        // return this.queryProjectList()
      })
    })
  }

  @action
  initProject = id => {
    return new Promise(resolve => {
      if (this.currentId === id) return resolve(true)
      when(
        () => !this.loading && !this.isInit,
        () => {
          if (!this.list.length) return resolve(false)
          const project = this.list.find(row => {
            return row.id === id
          })
          if (project) {
            project.initProject()
            project.initModels()
            this.currentId = id
            return resolve(true)
          } else {
            return resolve(false)
          }
        })
    }
    )
  }

  @action
  inProject = id => {
    return socketStore.ready().then(api => {
      this.broadcastId = uuid.v4()
      return api.inProject({ id, broadcastId: this.broadcastId })
    })
  }

  @action
  outProject = () => {
    this.currentId = ""
    this.conflict = false
  }

  @action
  showConflict = () => {
    this.conflict = true
  }

  @action
  notExit = () => {
    this.conflict = false
    this.inProject(this.currentId)
  }

  @action
  clean = () => {
    if (this.currentId) this.project.clean()
    this.currentId = ''
  }
}

export default new ProjectStore()
