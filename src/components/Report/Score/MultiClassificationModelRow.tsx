import { observer } from 'mobx-react';
import React, { ReactElement } from 'react';
import MultiClassificationDetailCurves from '../../Modeling/Result/AdvancedView/MultiClassificationDetailCurves';
interface Interface {
  readonly project:any
  readonly model:any
}
const MultiClassificationModelRow = observer((props:Interface):ReactElement=>{
  const { model, project} = props;
  if (!model.chartData) return null;

  return (
    <div>
      <MultiClassificationDetailCurves
        project={project}
        model={model}
      />
    </div>
  )
});

export default MultiClassificationModelRow;
