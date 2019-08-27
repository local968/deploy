import { observer } from 'mobx-react';
import React, { ReactElement } from 'react';
import DetailCurves from '../../Modeling/Result/AdvancedView/DetailCurves';
interface Interface {
  readonly model:any
  readonly yes:any
  readonly no:any
  readonly project:any
}
const ClassificationModelRow = observer((props:Interface):ReactElement=>{
  const { model, yes, no, project } = props;
  if (!model.chartData) return null;
  return <DetailCurves
    project={project}
    model={model}
    yes={yes}
    no={no}
  />
});

export default ClassificationModelRow
