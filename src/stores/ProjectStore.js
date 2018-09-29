import { observable, action } from "mobx";
import socketStore from "./SocketStore";

class ProjectStore {
  @observable loading = false;

  @observable list = [];

  constructor() {
    this.queryProjects();
  }

  @action
  queryProjects = () => {
    this.loading = true;
    socketStore.ready().then(api => {
      console.log(api)
    })
  }
}

export default new ProjectStore()
