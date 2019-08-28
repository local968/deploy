import { observer } from 'mobx-react';
import React, { ReactElement } from 'react';
import RegressionDetailCurves from './RegressionDetailCurves';

interface Interface {
  readonly model: any;
  readonly project: any;
}

const RegressionModleRow = observer((props:Interface):ReactElement=>{
  const { model,project } = props;
  return <div>
    <RegressionDetailCurves project={project} model={model} />
  </div>
});

export default RegressionModleRow;
