import { observer } from 'mobx-react';
import React from 'react';
import MultiClassificationDetailCurves from '../../Modeling/Result/AdvancedView/MultiClassificationDetailCurves';
interface Interface {
  project:any
  model:any
  texts:Array<string>
  checked:any
}
const MultiClassificationModelRow = observer((props:Interface)=>{
  const { model, project} = props;
  if (!model.chartData) return null;

  return (
    <div style={{marginTop:-200}}>
      <MultiClassificationDetailCurves
        project={project}
        model={model}
      />
    </div>
  )
});

export default MultiClassificationModelRow;
