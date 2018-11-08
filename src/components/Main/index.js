import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { when } from 'mobx';
import Project from 'components/Project';
import Problem from 'components/Problem';
import Data from 'components/Data';
import Modeling from 'components/Modeling';
import { ProjectLoading, Confirm } from 'components/Common';
import { message } from 'antd';

@inject('userStore', 'projectStore', 'routing')
@observer
export default class Main extends Component {
  constructor(props) {
    super(props);
    const { pid } = props.match.params || {};
    this.pid = pid

    when(
      () => props.userStore.status === "login",
      () => props.projectStore.initProject(this.pid)
    )
  }

  componentWillMount() {
    when(
      () => this.props.projectStore.project,
      () => this.props.projectStore.inProject(this.pid)
    )
  }

  getChild = () => {
    const { project } = this.props.projectStore;
    const { curStep } = project || {};

    when(
      () => project && !project.exist,
      () => {
        message.warn("project not exist")
        this.props.routing.push("/")
      }
    )

    switch (curStep) {
      case 1:
        return <Problem project={project} />
      case 2:
        return <Data project={project} />
      case 3:
        return <Modeling project={project} />
      case 0:
      default:
        return <Project project={project} />
    }
  }

  exit = () => {
    this.props.routing.push("/")
    this.props.projectStore.outProject()
  }

  render() {
    const { project, conflict, notExit } = this.props.projectStore
    return <React.Fragment>
      {!project ? <ProjectLoading /> : this.getChild()}
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
