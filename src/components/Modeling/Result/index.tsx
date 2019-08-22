import Supervised from './Supervised'
import UnSupervised from './UnSupervised'
import Association from './Association'
import { observer } from 'mobx-react';
import Project from 'stores/Project';
import React from 'react';

interface ResultProps {
  project: Project,
  resetSide: () => void
}

const Result = (props: ResultProps) => {
  const { resetSide, project } = props;
  const { problemType } = project;
  const isAssociation = problemType === 'Association';
  const isUnsupervised = ['Clustering', 'Outlier'].includes(problemType);
  if (isAssociation) return <Association project={project} />
  return isUnsupervised ? <UnSupervised resetSide={resetSide} /> : <Supervised resetSide={resetSide} />
}

export default observer(Result)
