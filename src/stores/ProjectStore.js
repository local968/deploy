import { observable, action, when, autorun, computed } from "mobx";
import socketStore from "./SocketStore";
import Project from "./Project";

class ProjectStore {
  @observable loading = true;
  @observable watchList = false;
  @observable watch = [];
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

  constructor() {
    this.watchProjectList();
    when(
      () => this.watchList,
      () => this.queryProjectList()
    )
    autorun(() => this.watch.forEach(pid => {
      socketStore.ready().then(api => {
        api.watchProject({ id: pid }).then(watch => {
          if (watch.status !== 200) {
            return alert(watch.message)
          }
          api.on(watch.id, data => {
            console.log(data, "watch")
          })
        })
      })
    }))
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
          api.on(watch.id, data => {
            console.log(data, "watchlist")
          })
        }
      })
    })
  }

  @action
  queryProjectList = () => {
    this.loading = true;
    socketStore.ready().then(api => {
      api.queryProjectList(this.toolsOption).then(result => {
        const { status, message, list, count } = result
        if (status !== 200) {
          this.loading = false;
          return alert(message)
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
        this.list.push(new Project(id + ""))
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
          alert(message)
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
      when(
        () => !this.loading,
        () => {
          console.log([...this.list])
          if (!this.list.length) return resolve(false)
          this.currentId = id
          const project = this.list.find(row => {
            return row.id === id
          })
          if (project) {
            !this.watch.includes(id) && this.watch.push(id)
            project.queryProject()
            project.initModels()
            return resolve(true)
          } else {
            return resolve(false)
          }
        })
    }
    )
  }
}

export default new ProjectStore()
