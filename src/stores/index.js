import socketStore from './SocketStore'
import userStore from './UserStore'
import projectStore from './ProjectStore'
import deploymentStore from './DeploymentStore'
import scheduleStore from './ScheduleStore'
import axios from 'axios'

window.axios = axios

export default {
  socketStore,
  userStore,
  projectStore,
  deploymentStore,
  scheduleStore
};

window.stores = {
  socketStore,
  userStore,
  projectStore,
  deploymentStore,
  scheduleStore
};
