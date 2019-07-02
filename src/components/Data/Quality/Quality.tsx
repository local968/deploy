import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { observable } from 'mobx';
import VariableIssue from './VariableIssue'
import TargetIssue from './TargetIssue'
import { ProjectStore } from 'stores/ProjectStore';

interface DataQualityProps {
  projectStore: ProjectStore
}

class DataQuality extends Component<DataQualityProps> {
  @observable step = 1

  changeTab = value => {
    this.step = value
  }

  render() {
    // const { project } = this.props.projectStore;
    return this.step !== 1 ? <VariableIssue
      project={this.props.projectStore.project}
      changeTab={this.changeTab.bind(null, 1)} />
      : <TargetIssue
      project={this.props.projectStore.project}
      changeTab={this.changeTab.bind(null, 2)} />
  }
}

export default inject('projectStore')(observer(DataQuality))
