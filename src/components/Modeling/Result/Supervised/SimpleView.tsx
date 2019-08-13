import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router'
import ClassificationResult from './Classification/ClassificationResult';
import RegressionResult from './Regression/RegressionResult';
import MultiClassification from './MultiClassification'
import Model from 'stores/Model';
import Project from 'stores/Project';
const Classification = 'Classification';

interface SimpleViewProps {
  models: Model[],
  project: Project,
  exportReport: (s: string) => () => void,
  sort: {
    key: string,
    value: number
  },
  handleSort: (k: string) => void
}

@observer
class SimpleView extends Component<SimpleViewProps> {
  constructor(props) {
    super(props)
  }
  render() {
    const { models, project, exportReport, sort, handleSort } = this.props;
    const { problemType } = project;
    return problemType === Classification ?
      <ClassificationResult models={models} project={project} exportReport={exportReport} sort={sort} handleSort={handleSort} /> :
      problemType === 'MultiClassification' ?
        <MultiClassification models={models} project={project} exportReport={exportReport} sort={sort} handleSort={handleSort} /> :
        <RegressionResult models={models} project={project} exportReport={exportReport} sort={sort} handleSort={handleSort} />
  }
}

export default withRouter(SimpleView)