import db from './db.js';
import { observable, action, computed, autorun, when } from 'mobx';
import Project from './Project.js'
import config from '../config.js'
import socketStore from './SocketStore';

class UserStore{
    @observable projects = [];
    @observable userSetting = {};
    @observable toolsOption = {
        perPage: 10,
        currentPage: 1,
        keywords: '',
        sort: 'createdDate',
    }
    sortFunction = {
        createdDate: (a, b) => a.createdAt < b.createdAt ? 1 : -1,
        updatedDate: (a, b) => a.updatedAt < b.updatedAt ? 1 : -1,
        progressUp: (a, b) => a.curStep > b.curStep ? 1 : -1,
        progressDown: (a, b) => a.curStep < b.curStep ? 1 : -1,
        aToz: (a, b) => a.name.toUpperCase() > b.name.toUpperCase() ? 1 : -1,
        zToa: (a, b) => a.name.toUpperCase() < b.name.toUpperCase() ? 1 : -1
    };

    constructor(){
        if(config.database === "tarantool"){
            this.initCallback();
            
            when(
                () => socketStore.isready,
                () => this.initProjects()
            )
        }else{
            this.initProjects()
        }

        this.projectTable = db('projects');
        this.userSettingTable = db('userSetting');
        this.startWatch();
    }

    @computed
    get total() {
        return this.projects.length;
    }

    @computed
    get userId() {
        return "devUser"
    }

    @computed
    get sortProjects() {
        const {perPage, currentPage, keywords, sort} = this.toolsOption;
        let result = [...this.projects];
        // console.log(result)
        result = result.filter(row => {
            return row&&row.name.includes(keywords);
        })
        result = result.sort(this.sortFunction[sort])
        const start = (currentPage - 1) * perPage;
        return result.slice(start,start + perPage);
    }

    @action
    initProjects() {
        if(config.database === "tarantool"){
            when(
                () => socketStore.isready,
                () => socketStore.send("queryProjects", {userId: this.userId})
            )
        }else{
            this.projectTable
            .findAll({userId: this.userId})
            .fetch()
            .subscribe( projects => {
                this.projects = projects.map(project => {
                    return new Project(this.userId, project.projectId, project);
                });
            })
        }
        
    }
    
    @action
    changeOption(k, v) {
        this.toolsOption[k] = v;
    }

    @action
    addProject() {
        const projectId = this.userSetting.nextProjectId || this.getNextId();
        this.projects.push(new Project(this.userId, projectId));
        Object.assign(this.userSetting, { nextProjectId: projectId + 1 });
        this.userSettingTable.update(this.userSetting);
    }

    getNextId() {
        let maxId = 0;
        for(let project of this.projects){
            maxId = project.projectId > maxId ? project.projectId : maxId;
        }
        return maxId + 1;
    }

    startWatch() {
        this.projectTable
        .findAll({userId: this.userId})
        .watch({rawChanges: true})
        .subscribe(data => {
            const {new_val, type, old_val} = data;
            // if (type === 'state') {
            //     if (data.state === 'synced') {
            //         this.loaded = true;
            //     } else {
            //         console.warn(`Unknown state ${data.state}`);
            //     }
            // }
            if (type === 'change') {
                const changedProject = this.projects.find(p => {
                    return p.userId === new_val.userId && p.projectId === new_val.projectId;
                });
                if (changedProject) {
                    this.projects.remove(changedProject);
                }
                this.projects.push(new Project(this.userId, new_val.projectId, new_val));
            }
            if (type === 'add') {
                const addedProject = this.projects.find(p => {
                    return p.userId === new_val.userId && p.projectId === new_val.projectId;
                });
                if (!addedProject) {
                    this.projects.push(new Project(this.userId, new_val.projectId, new_val));
                }
            }
            if (type === 'remove') {
                const removedProject = this.projects.find(p => {
                    return p.userId === old_val.userId && p.projectId === old_val.projectId;
                });
                if (removedProject) {
                    removedProject.destroy();
                    this.projects.remove(removedProject);
                }
            }
        })

        this.userSettingTable
        .find({userId: this.userId})
        .watch()
        .subscribe(data => {
            if (!data) {
                this.userSetting = {
                    userId: this.userId,
                    nextProjectId: this.getNextId()
                }
                this.userSettingTable.upsert(this.userSetting);
            } else {
                Object.assign(this.userSetting, data);
            }
        });
    }

    initCallback() {
        const callback = {
            queryProjects : data => {
                const projects = data.list;
                this.projects = projects.map(project => {
                    return new Project(this.userId, project.projectId, project.args);
                });
            }
        }

        socketStore.addMessageArr(callback);
    }
}

export default new UserStore();