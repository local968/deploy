import React from 'react';
import { inject, observer } from 'mobx-react';
import { Route, Switch } from 'react-router-dom';
import { when, autorun } from 'mobx';
import Project from 'components/Project';
import Problem from 'components/Problem';
import Data from 'components/Data';
import Modeling from 'components/Modeling';
import { ProcessLoading, Confirm } from 'components/Common';
import { message } from 'antd';
import styles from './styles.module.css';

import { StoreProvider } from 'easy-peasy'
import newStores from 'stores/new'
import Info from 'components/Info';
import Train from 'components/Train';

interface MainProps {
  userStore: any,
  projectStore: any,
  routing: any,
  match: any
}

function Main(props: MainProps) {
  const { userStore, projectStore, routing, match } = props
  const { project, conflict, notExit } = projectStore;

  React.useEffect(() => {
    const { pid = null } = match.params || {};
    let step = -1
    let _autorun: any = null
    when(
      () => project,
      () => projectStore.inProject(pid)
    )
    when(
      () => userStore.status === "login",
      () => projectStore.initProject(pid).then((init: boolean) => {
        if (!init) {
          message.error("Sorry but you don't have the authority for entering this project.")
          routing.push("/")
        }
        _autorun = autorun(() => {
          if (!project) return
          const { curStep = 0, id = '', problemType = '' } = project || {};
          if (curStep === step) return
          step = curStep
          const isUnsupervised = ['Clustering', 'Outlier'].includes(problemType)
          console.log(isUnsupervised, problemType)
          let url = ''
          switch (curStep) {
            case 1:
              url = `/project/${id}/problem`
              break
            case 2:
              url = `/project/${id}/${isUnsupervised ? 'info' : 'data'}`
              break
            case 3:
              url = `/project/${id}/${isUnsupervised ? 'train' : 'modeling'}`
              break
            case 0:
              url = `/project/${id}/project`
              break
            default:
          }
          if (!url) routing.push('/')
          if (!routing.location.pathname.startsWith(`/project/${id}`)) return
          if (routing.location.pathname.includes(url)) return
          return routing.push(url)
        })
        when(
          () => project && !project.exist,
          () => {
            message.warn("project not exist")
            routing.push("/")
          }
        )
      })
    )
    return () => {
      _autorun && _autorun()
    }
  })

  const exit = () => {
    routing.push("/")
    projectStore.outProject()
  }

  return <React.Fragment>
    <div className={styles.header}>
      {project && project.name && <div className={styles.projectName}>
        <span className={styles.label}>Project: </span>
        <span className={styles.value}> {project.name}</span>
      </div>}
      {!!project && !!project.fileNames.length && <div className={styles.dataset}>
        <span className={styles.label}>Dataset: </span>
        <span className={styles.value}> {project.fileNames.toString()}</span>
      </div>}
    </div>
    {!project ? <ProcessLoading style={{ position: 'fixed' }} /> : <Switch>
      <Route path="/project/:id/problem" component={Problem} />
      <Route path="/project/:id/data" component={Data} />
      <Route path="/project/:id/modeling" component={Modeling} />
      <Route path="/project/:id/project" component={Project} />
      <StoreProvider store={newStores}>
        <Route path="/project/:id/info" component={Info} />
        <Route path="/project/:id/train" component={Train} />
      </StoreProvider>
    </Switch>}
    {<Confirm
      width="6em"
      title={`You have been kicked out`}
      visible={conflict}
      onClose={exit}
      onConfirm={notExit}
      closeByMask={false}
      showClose={false}
      confirmText="Go Back to the Project"
      closeText="Go to Home Page"
      content={"You have been kicked out of the project by another user."} />}
  </React.Fragment>
}

export default inject('userStore', 'projectStore', 'routing')(observer(Main))