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

    constructor(userId, projectId, model) {
        this.userId = userId;
        this.projectId = projectId;
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
}