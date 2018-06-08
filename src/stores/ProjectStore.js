import db from './db.js';
import { observable, action, computed, autorun, when } from 'mobx';
import Project from './Project.js';
import socketStore from './SocketStore';
import config from '../config.js';
import Approach from './Approach.js';

class ProjectStore{
    @observable project = null;
    @observable approaches =[];
    @observable currentId;
    
    constructor(){
        this.projectTable = db('projects');
        this.initCallback();
    }

    @action
    init(projectId) {
        this.projectId = projectId;
        if(config.database === "tarantool"){
            when(
                () => socketStore.isready,
                () => {
                    socketStore.send("queryProject", {userId: this.userId, projectId: projectId})
                    socketStore.send("queryApproaches", { userId: this.userId, projectId: projectId })
                }
            )
        }else{
            this.projectTable
                .find({userId: this.userId, projectId: projectId})
                .fetch()
                .subscribe( project => {
                    this.project = new Project(this.userId, projectId, project);
                })
        }
    }

    @computed
    get userId() {
        return "devUser";
    }

    @computed
    get currentApproach() {
        return this.approaches.find((approach) => {
            return approach.approachId === this.currentId;
        })
    }

    initCallback() {
        const callback = {
            queryProject : action(data => {
                const project = data.list[0]; 
                this.project = new Project(this.userId, project.projectId, project.args)
            }),
            queryApproaches: action(data => {
                const approaches = data.list;
                if (approaches.length === 0) {
                    approaches.push(null);
                }
                this.approaches = approaches.map(approach => {
                    const approachId = approach ? approach.approachId : 0;
                    const args = approach ? approach.args : null;
                    this.currentId = approachId;
                    return new Approach(this.userId, this.projectId, approachId, args);
                });
            })
        }

        socketStore.addMessageArr(callback);
    }
}

export default new ProjectStore();