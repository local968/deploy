import { observer } from 'mobx-react';
import React from 'react';
import EN from '../../../constant/en';
import {  Switch } from 'antd';
import styles from './AdvancedView.module.css';
import DetailCurves from '../../Modeling/Result/AdvancedView/DetailCurves';
interface Interface {
  model:any
  yes:any
  no:any
  project:any
}
const ClassificationModelRow = observer((props:Interface)=>{
  const { model, yes, no, project } = props;
  if (!model.chartData) return null;
  return (
    <div >
      <div className={styles.metricSwitch}>
        <span>{EN.Validation}</span>
        <Switch checked={project.isHoldout} onChange={() => project.isHoldout = !project.isHoldout} style={{ backgroundColor: '#1D2B3C' }} />
        <span>{EN.Holdout}</span>
      </div>
      <DetailCurves
        project={project}
        model={model}
        yes={yes}
        no={no}
      />
    </div>
  )
});

export default ClassificationModelRow
