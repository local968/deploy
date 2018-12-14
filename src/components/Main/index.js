import React, { Component } from 'react';
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

@inject('userStore', 'projectStore', 'routing')
@observer
export default class Main extends Component {
  constructor(props) {
    super(props);
    const { pid } = props.match.params || {};
    this.pid = pid
    this.step = -1
  }

  componentDidMount() {
    when(
      () => this.props.userStore.status === "login",
      () => this.props.projectStore.initProject(this.pid).then(init => {
        if (!init) {
          message.error("Sorry but you don't have the authority for entering this project.")
          this.props.routing.push("/")
        }
        autorun(() => {
          const { projectStore: { project }, routing } = this.props;
          const { curStep } = project || {};
          if (curStep === this.step) return
          this.step = curStep
          let url = ''
          switch (curStep) {
            case 1:
              url = `/project/${project.id}/problem`
              break
            case 2:
              url = `/project/${project.id}/data`
              break
            case 3:
              url = `/project/${project.id}/modeling`
              break
            case 0:
              url = `/project/${project.id}/project`
              break
            default:
          }
          if (!url) routing.push('/')
          if (routing.location.pathname.includes(url)) return
          return routing.push(url)
        })
        when(
          () => this.props.projectStore.project && !this.props.projectStore.project.exist,
          () => {
            message.warn("project not exist")
            this.props.routing.push("/")
          }
        )
      })
    )
  }

  componentWillMount() {
    when(
      () => this.props.projectStore.project,
      () => this.props.projectStore.inProject(this.pid)
    )
  }

  exit = () => {
    this.props.routing.push("/")
    this.props.projectStore.outProject()
  }

  render() {
    const { project, conflict, notExit } = this.props.projectStore
    return <React.Fragment>
        <div className={styles.header}>
          {project && project.name && <div className={styles.projectName}>
            <span className={styles.label}>Project: </span>
            <span className={styles.value}> {project.name}</span>
          </div>}
          {project && project.fileNames && <div className={styles.dataset}>
            <span className={styles.label}>Dataset: </span>
            <span className={styles.value}> {project.fileNames.toString()}</span>
          </div>}
        </div>
        {!project ? <ProcessLoading /> : <Switch>
          <Route path="/project/:id/problem" component={Problem} />
          <Route path="/project/:id/data" component={Data} />
          <Route path="/project/:id/modeling" component={Modeling} />
          <Route path="/project/:id/project" component={Project} />
        </Switch>}
        {<Confirm
          width="6em"
          title={`You have been kicked out`}
          visible={conflict}
          onClose={this.exit}
          onConfirm={notExit}
          closeByMask={false}
          showClose={false}
          confirmText="Go Back to the Project"
          closeText="Go to Home Page"
          content={"You have been kicked out of the project by another user."} />}
      </React.Fragment>
  }
}
