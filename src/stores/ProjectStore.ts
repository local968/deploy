import { observable, action, when, computed, autorun } from "mobx";
import socketStore from "./SocketStore";
import Project from "./Project";
import Model from './Model'
import uuid from "uuid";
import moment from 'moment'
import { message as antdMessage } from 'antd'

export interface ToolsOption {
  current: number,
  limit: number,
  offset: number,
  sort: string,
}

export interface WatchResult {
  status: number,
  id: string,
  result: Partial<Project>,
  model: Model,
  modelResult: Partial<Model>
}

class ProjectStore {
  @observable loading: boolean = true;
  @observable init: boolean = false;
  @observable isOnline: boolean = true;
  @observable watchList: boolean = false;
  @observable currentId: string = "";

  @observable list: Project[] = [];
  @observable total: number = 0;
  @observable keywords: string = '';
  @observable toolsOption: ToolsOption = {
    current: 1,
    limit: 10,
    offset: 0,
    sort: 'createTime',
  };
  @observable broadcastId: string = "";
  @observable conflict: boolean = false;
  @observable stopFilter: boolean = false;
  oldfiltedModels: Model[] | null = null;
  newfiltedModels: Model[] | null = null;

  @action
  changeStopFilter = (stopFilter: boolean) => {
    this.stopFilter = stopFilter;
    if (!stopFilter) {
      this.oldfiltedModels = this.newfiltedModels
    }
  };

  @action
  changeNewfiltedModels = (models: Model[]) => {
    this.newfiltedModels = models
  };

  @action
  changeOldfiltedModels = (models: Model[]) => {
    this.oldfiltedModels = models
  };


  constructor() {
    if ((window as any).r2Report) {
      const list = (window as any).r2Report
      this.list = list.map((row: Project) => {
        const project = new Project(row.id + "", { ...row, ...{ isAbort: false } })
        project.models.forEach(m => project.setModel(m))
        return project
      })
      return;
    }
    this.initWatch()
    this.initReload()
    autorun(() => {
      if (this.project) {
        this.project.clean();
        this.queryProjectList();
        this.project.initProject()
      }
    })
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
    if (this.project) this.project.clean();
  }

  @computed
  get sortList() {
    const sort = this.toolsOption.sort
    return this.list.filter(p => p.visiable).sort((a, b) => {
      return Reflect.get(b, sort) - Reflect.get(a, sort)
    }).slice(0, this.toolsOption.limit)
  }

  @computed
  get project() {
    return this.currentId ? this.list.find(row => row.id === this.currentId) : null
  }

  @action
  changeOption = (k: string, v: string | number) => {
    if (!isNaN(+(v.toString()))) {
      v = parseInt(v.toString(), 10)
    }
    Reflect.set(this.toolsOption, k, v)
    // this.toolsOption[k] = v;
    this.queryProjectList()
  }

  @action
  changePage = (page: number) => {
    const { current, limit } = this.toolsOption
    if (current === page) return;
    const offset = (page - 1) * limit
    Object.assign(this.toolsOption, { offset: offset, current: page })
    this.queryProjectList()
  }

  @action
  watchProjectList = () => {
    socketStore.ready().then(api => {
      api.watchProjectList().then((watch: { status: number, id?: string }) => {
        if (watch.status === 200) {
          this.watchList = true
          this.init = true
          api.on(watch.id, (data: WatchResult) => {
            const { status, id, result, model, modelResult } = data
            if (status === 200) {
              const project = this.list.find(p => p.id === id)
              if (!project) {
                if (!result) return
                if (!result.host) return
                this.queryProjectList()
              } else {
                if (result) project.setProperty(result)
                if (model) project.setModel(model)
                if (modelResult) project.setModelField(modelResult)
              }
            }
          })
          api.on("inProject", (data: { id: string, broadcastId: string }) => {
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
      return api.queryProjectList(this.toolsOption).then((result: { status: number, message: string, list: Project[], count: number }) => {
        const { status, message, list, count } = result
        if (status !== 200) {
          this.loading = false;
          return antdMessage.error(message)
        }
        let newList = list.map(row => new Project(row.id + "", row))
        if (this.currentId) {
          const current = this.project
          newList = newList.filter(p => p.id !== current.id)
          if (newList.length === list.length) {
            current.visiable = false
          } else {
            current.visiable = true
          }
          newList.push(current)
        }
        this.list = [...newList]
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
      return api.addProject().then((result: { status: number, message: string, id: string }) => {
        const { status, message, id } = result
        if (status !== 200) {
          this.loading = false;
          return { error: message }
        }
        this.list.push(new Project(id + "", { createTime: moment().unix(), updateTime: moment().unix(), visiable: false }))
        this.loading = false;
        return { id }
      })
    })
  }

  @action
  deleteProjects = (ids: string[]) => {
    if (this.loading) return
    this.loading = true;
    return socketStore.ready().then(api => {
      return api.deleteProjects({ ids }).then((result: { status: number, message: string }) => {
        const { status, message } = result
        this.loading = false;
        if (status !== 200) {
          return antdMessage.error(message)
          // return { error: message }
        }
        return this.queryProjectList()
        // this.list = this.list.filter(i => {
        //   return !ids.includes(i.id)
        // })
        // return this.queryProjectList()
      })
    })
  }

  @action
  initProject = (id: string) => {
    return new Promise(resolve => {
      if (this.currentId === id) return resolve(true)
      if (this.list.length) {
        const project = this.list.find(row => {
          return row.id === id
        })
        if (project) {
          project.initProject()
          project.initModels()
          this.currentId = id
          return resolve(true)
        }
      }
      socketStore.ready().then(api => {
        api.checkProject({ id }).then((result: { status: number, data: Project }) => {
          const { status, data } = result
          if (status !== 200) {
            return resolve(false)
          }
          const hiddenProject = new Project(id + '', { ...data, visiable: false })
          this.list.push(hiddenProject)
          hiddenProject.initProject()
          hiddenProject.initModels()
          this.currentId = id
          resolve(true)
        })
      })
      //   when(
      //     () => !this.loading && !this.isInit,
      //     () => {
      //       if (!this.list.length) return resolve(false)
      //       const project = this.list.find(row => {
      //         return row.id === id
      //       })
      //       if (project) {
      //         project.initProject()
      //         project.initModels()
      //         this.currentId = id
      //         return resolve(true)
      //       } else {
      //         return resolve(false)
      //       }
      //     })
    })
  }

  @action
  inProject = (id: string) => {
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
    if (this.currentId) {
      const projectIndex = this.list.findIndex(p => p.id === this.currentId)
      //重新初始化 
      this.list[projectIndex] = new Project(this.currentId, {
        id: this.list[projectIndex].id,
        fileName: this.list[projectIndex].fileName,
        createTime: this.list[projectIndex].createTime,
        updateTime: this.list[projectIndex].updateTime,
        name: this.list[projectIndex].name,
      })
    }
    this.currentId = ''
  }
}

export { ProjectStore }

export default new ProjectStore()
