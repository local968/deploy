import { observable, action, computed, when } from 'mobx';
import Project from './Project.js'
import socketStore from './SocketStore';
import { message } from 'antd';
// import config from '../config.js';

class UserStore {
    @observable isLoad = true;
    @observable isInit = true;
    @observable user = {};
    @observable projects = [];
    @observable userSetting = {};
    @observable toolsOption = {
        perPage: 10,
        currentPage: 1,
        keywords: '',
        sort: 'createdDate',
    }
    @observable hasToken = !!window.localStorage.getItem("deploy2-token");

    sortFunction = {
        createdDate: (a, b) => a.createdAt < b.createdAt ? 1 : -1,
        updatedDate: (a, b) => a.updatedAt < b.updatedAt ? 1 : -1,
        progressUp: (a, b) => a.curStep > b.curStep ? 1 : -1,
        progressDown: (a, b) => a.curStep < b.curStep ? 1 : -1,
        aToz: (a, b) => a.name.toUpperCase() > b.name.toUpperCase() ? 1 : -1,
        zToa: (a, b) => a.name.toUpperCase() < b.name.toUpperCase() ? 1 : -1
    };

    constructor() {
        this.initCallback();
        // if (config.auth === "local") {
        //     this.isLoad =false;
        //     this.hasToken = true;
        //     this.initProjects();
        // }

        if (!this.userId && this.hasToken) {
            when(
                () => socketStore.isready,
                () => this.tryLoginByToken()
            )
        } else {
            this.isInit = false
        }
    }

    @computed
    get total() {
        return this.projects.length;
    }

    @computed
    get userId() {
        // if (config.auth === "local") return 'devUser'
        return this.user ? this.user.email : "";
    }

    @computed
    get sortProjects() {
        const { perPage, currentPage, keywords, sort } = this.toolsOption;
        let result = [...this.projects];
        // console.log(result)
        result = result.filter(row => {
            return row && row.name && row.name.includes(keywords);
        })
        result = result.sort(this.sortFunction[sort])
        const start = (currentPage - 1) * perPage;
        return result.slice(start, start + perPage);
    }

    @action
    initProjects() {
        this.isLoad = true;
        when(
            () => socketStore.isready,
            () => socketStore.send("queryProjects")
        )
    }

    @action
    changeOption(k, v) {
        this.toolsOption[k] = v;
    }

    @action
    addProject() {
        const projectId = this.getNextId();
        this.userSetting.projectId = projectId + 1;
        this.projects.push(new Project(this.userId, projectId.toString()));
    }

    @action
    deleteProjects(ids) {
        this.projects = this.projects.filter(project => !ids.includes(project.projectId))
        when(
            () => socketStore.isready,
            () => socketStore.send("deleteProjects", { ids })
        )
    }

    getNextId() {
        if (this.userSetting.projectId) {
            return this.userSetting.projectId;
        }
        let maxId = 0;
        for (let project of this.projects) {
            maxId = project.projectId > maxId ? project.projectId : maxId;
        }
        return maxId + 1;
    }

    initCallback() {
        const callback = {
            queryProjects: data => {
                const projects = data.list;
                this.userSetting = data.setting || {};
                this.projects = projects.map(project => {
                    return new Project(this.userId, project.projectId.toString(), project.args);
                });
                this.isLoad = false;
                this.isInit = false;
            },
            login: data => {
                const { status, err, user } = data;
                if (status !== 200) {
                    this.clearToken();
                    this.isInit = false;
                    this.isLoad = false;
                    return message.error(err);
                }
                this.user = user;
                this.setCache(user)
                this.initProjects();
            },
            register: data => {
                const { status, err, user } = data;
                if (status !== 200) {
                    this.clearToken();
                    this.isLoad = false;
                    return message.error(err);
                }
                this.user = user;
                this.setCache(user)
                this.initProjects();
            }
        }

        socketStore.addMessageArr(callback);
    }

    tryLoginByToken() {
        let token = window.localStorage.getItem("deploy2-token");
        this.login({ token });
    }

    setCache(user) {
        this.hasToken = true;
        window.localStorage.setItem("deploy2-token", user.id);
        window.localStorage.setItem("deploy2-email", user.email)
    }

    clearToken() {
        this.hasToken = false;
        window.localStorage.removeItem("deploy2-token");
    }

    login(data) {
        this.isLoad = true;
        when(
            () => socketStore.isready,
            () => {
                socketStore.send("login", data)
            }
        )
    }

    register(data) {
        this.isLoad = true;
        when(
            () => socketStore.isready,
            () => {
                socketStore.send("register", data)
            }
        )
    }

    logout() {
        when(
            () => socketStore.isready && this.userId,
            () => {
                socketStore.send("logout")
                this.clearToken();
                this.user = null;
            }
        )
    }
}

export default new UserStore();