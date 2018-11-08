import socketStore from './SocketStore'
import userStore from './UserStore'
import projectStore from './ProjectStore'
import deploymentStore from './DeploymentStore'
import scheduleStore from './ScheduleStore'
import orderStore from './OrderStore'

export default {
  socketStore,
  userStore,
  projectStore,
  deploymentStore,
  scheduleStore,
  orderStore
};

window.stores = {
  socketStore,
  userStore,
  projectStore,
  deploymentStore,
  scheduleStore,
  orderStore
};
