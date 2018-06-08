import db from './db.js';
import { observable, action, computed, autorun, when } from 'mobx';
import Approach from './Approach.js';
import socketStore from './SocketStore';
import config from '../config.js'

export default class Project {
    @observable description;

    observedKeys = [
        'description'
    ];

    constructor(userId, projectId, project = null) {
        this.userId = userId;
        this.projectId = projectId;
        this.id = `${this.userId}-${this.projectId}`;
        if (config.database === "tarantool") {
            this.initCallback();
        }
        this.projectTable = db('projects');
        this.approachesTable = db('approaches');
        if (!project) {
            this.createProject();
        } else {
            Object.assign(this, project);
        }
    }

    @action
    createProject() {
        const now = new Date();
        const dateFormat = `${now.getMonth() + 1}.${now.getDate()}.${now.getFullYear()}`;

        const item = {
            id: this.id,
            userId: this.userId,
            projectId: this.projectId,
            date: dateFormat,
            name: `project ${new Date().toLocaleString()}`,
            industries: null,
            businessFunctions: null,
            createdAt: +now,
            updatedAt: +now
        };
        const initObservedKeys = {};
        this.observedKeys.forEach(k => {
            initObservedKeys[k] = this[k];
        });
        Object.assign(this, item, initObservedKeys);
        if (config.database === "tarantool") {
            when(
                () => socketStore.isready,
                () => {
                    socketStore.send("changeProject", { userId: this.userId, projectId: this.projectId, args: item })
                }
            )
        } else {
            this.projectTable.store(item);
        }
    }

    initCallback() {
        const callback = {
            changeProject: data => {
                console.log(data)
            }
        }

        socketStore.addMessageArr(callback);
    }

    updateProject(item) {
        const data = { id: this.id, ...item };

        if(config.database === "tarantool"){
            when(
                () => socketStore.isready,
                () => {
                    socketStore.send("changeProject", {userId: this.userId, projectId: this.projectId, args: data})
                }
            )
        }else{
            this.approachesTable.update(data);
        }
        Object.assign(this, data);
    }
}