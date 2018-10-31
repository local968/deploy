import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { when } from 'mobx';
import Project from 'components/Project';
import Problem from 'components/Problem';
import Data from 'components/Data';
import Modeling from 'components/Modeling';
import {ProjectLoading} from 'components/Common';
import { message } from 'antd';
import {observable} from 'mobx'

@inject('userStore', 'projectStore', 'routing')
@observer
export default class Main extends Component {
  @observable loading = true

  constructor(props) {
    super(props);
    const { pid } = props.match.params || {};
    this.pid = pid

    when(
      () => props.userStore.status === "login",
      () => props.projectStore.initProject(this.pid).then(init => {
        if(init) return this.loading = false
        this.props.routing.push("/")
        message.error("project is not exist")
      })
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

  render() {
    return <React.Fragment>
      {this.loading ? <ProjectLoading /> : this.getChild()}
    </React.Fragment>
  }
}
