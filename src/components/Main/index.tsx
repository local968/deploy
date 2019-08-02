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
import EN from '../../constant/en';
interface MainProps {
  userStore: any,
  projectStore: any,
  routing: any,
  match: any
}

function Main(props: MainProps) {
  const { userStore, projectStore, routing, match } = props
  const { project, conflict, notExit } = projectStore;

  const { pid = null } = match.params || {};
  let step = -1
  let _autorun: any = null
  when(
    () => userStore.status === "login",
    () => projectStore.initProject(pid).then((init: boolean) => {
      if (!init) {
        message.error("Sorry but you don't have the authority for entering this project.")
        routing.push("/")
      }
      _autorun = autorun(() => {
        if (!project || !project.init) return
        const { curStep = 0, id = '' } = project || {};
        if (curStep === step) return
        step = curStep
        let url = ''
        switch (curStep) {
          case 1:
            url = `/project/${id}/problem`
            break
          case 2:
            url = `/project/${id}/data`
            break
          case 3:
            url = `/project/${id}/modeling`
            break
          case 0:
            url = `/project/${id}/project`
            break
          default:
        }
        if (!url) return routing.push('/')
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

  React.useEffect(() => {
    return () => {
      _autorun && _autorun()
    }
  }, [])

  const exit = () => {
    routing.push("/")
    projectStore.outProject()
  }
  if (!project || !project.init || project.loadModel) return <ProcessLoading style={{ position: 'fixed' }} />

  return <React.Fragment>
    <div className={styles.header}>
      {project && project.name && <div className={styles.projectName}>
        <span className={styles.label}>{EN.Project}: </span>
        <span className={styles.value}> {project.name}</span>
      </div>}
      {!!project && !!project.fileName && <div className={styles.dataset}>
        <span className={styles.label}>{EN.Dataset}: </span>
        <span className={styles.value}> {project.fileName}</span>
      </div>}
    </div>
    {!project ? <ProcessLoading style={{ position: 'fixed' }} /> : <Switch>
      <Route path="/project/:id/problem" component={(props) => <Problem {...props} />} />
      <Route path="/project/:id/data" component={(props) => <Data {...props} />} />
      <Route path="/project/:id/modeling" component={(props) => <Modeling {...props} />} />
      <Route path="/project/:id/project" component={(props) => <Project {...props} />} />
    </Switch>}
    {<Confirm
      width="6em"
      title={EN.Youhavebeenkickedout}
      visible={conflict}
      onClose={exit}
      onConfirm={notExit}
      closeByMask={false}
      showClose={false}
      confirmText={EN.GoBacktotheProject}
      closeText={EN.GotoHomePage}
      content={EN.Youhavebeenkickedoutof} />}
  </React.Fragment>
}

export default inject('userStore', 'projectStore', 'routing')(observer(Main))
