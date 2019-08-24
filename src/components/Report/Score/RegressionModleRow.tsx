import { observer } from 'mobx-react';
import React from 'react';
import RegressionDetailCurves from './RegressionDetailCurves';

interface Interface {
  model: any;
  texts: any;
  metric: any;
  project: any;
}

const RegressionModleRow = observer((props:Interface)=>{
  const { model,project } = props;
  return <div>
    <RegressionDetailCurves project={project} model={model} />
  </div>
});

export default RegressionModleRow;
