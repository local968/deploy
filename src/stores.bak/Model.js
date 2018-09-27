import { observable, action } from 'mobx';

export default class Model {
    @observable score;
    @observable backend;
    @observable featureImportance;
    @observable recommend = false;
    @observable executeSpeed = 0;
    @observable name = "";
    @observable predicted = [];
    @observable modelInsightsData = null;
    @observable fitIndex = 0;

    constructor(userId, projectId, model, name) {
        this.userId = userId;
        this.projectId = projectId;
        this.id = name;
        Object.assign(this, model);
    }

    @action
	setData(type, obj) {
        this[type] = Object.assign({}, {...this[type]}, obj)
    }
    
    setProperty(data) {
		if (typeof data !== 'object') {
			return false;
		}
		if (Array.isArray(data)) {
			return false;
		}
		delete data.userId;
		delete data.projectId;
		for (let key in data) {
			if (typeof data[key] === 'function') {
				delete data[key];
				continue;
			}
		}
		Object.assign(this, data)
    }
    @action
    setFitIndex(index) {
        this.fitIndex = index;
    }
    updateModel(data) {
        Object.assign(this, data);
    }
}