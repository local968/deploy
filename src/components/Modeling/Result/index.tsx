import Supervised from './Supervised'
import UnSupervised from './UnSupervised'
import { observer } from 'mobx-react';
import Project from 'stores/Project';
import React from 'react';



interface ResultProps {
  project: Project,
  resetSide: () => void
}

const Result = (props: ResultProps) => {
  const { resetSide, project } = props
  const { problemType } = project
  const isUnsupervised = ['Clustering', 'Outlier'].includes(problemType);
  return isUnsupervised ? <UnSupervised resetSide={resetSide} /> : <Supervised resetSide={resetSide} />
}

export default observer(Result)