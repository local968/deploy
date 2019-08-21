import { observer } from 'mobx-react';
import React, { Component } from 'react';
import EN from '../../../constant/en';
import RowCell from './RowCell';
import { Radio, Switch, Tooltip } from 'antd';
import styles from './AdvancedView.module.css';
import moment from 'moment';
import DetailCurves from '../../Modeling/Result/AdvancedView/DetailCurves';
import Row from './Row';
interface Interface {
  model:any
  texts:any
  metric:any
  checked:any
  yes:any
  no:any
  project:any
  onClickCheckbox:any
}
@observer
class ClassificationModelRow extends Component<Interface> {
  state = {
    detail: false
  };
  handleResult = () => {
    this.setState({ detail: !this.state.detail });
  };
  render() {
    const { model, texts, metric, checked, yes, no, project } = this.props;
    if (!model.chartData) return null;
    const { modelName, fitIndex, chartData: { roc }, score } = model;
    return (
      <div >
        <Row onClick={this.handleResult} >
          {texts.map(t => {
            switch (t) {
              case EN.ModelName:
                return (
                  <RowCell key={1} data={<div key={1} >
                    <Radio checked={checked} onClick={this.props.onClickCheckbox} />
                    <Tooltip title={modelName}>
                      <span className={styles.modelName}>{modelName}</span>
                    </Tooltip>
                  </div>}
                  />
                );
              case 'Fbeta':
                return <RowCell key={2} data={model.f1Validation} />;
              case 'Precision':
                return <RowCell key={3} data={model.precisionValidation} />;
              case 'Recall':
                return <RowCell key={4} data={model.recallValidation} />;
              case 'LogLoss':
                return <RowCell key={5} data={roc.LOGLOSS[fitIndex]} />;
              case 'Cutoff Threshold':
                return <RowCell key={6} data={roc.Threshold[fitIndex]} />;
              case 'KS':
                return <RowCell key={7} data={roc.KS[fitIndex]} />;
              case EN.Validation:
                return <RowCell key={8} data={metric === 'auc' ? score.validateScore[metric] : model[metric + 'Validation']} />;
              case EN.Holdout:
                return <RowCell key={9} data={metric === 'auc' ? score.holdoutScore[metric] : model[metric + 'Holdout']} />;
              case EN.Time:
                return <RowCell key={10} data={model.createTime ? moment.unix(model.createTime).format('YYYY/MM/DD HH:mm') : ''} notFormat={true} />;
              default:
                return null
            }
          })}
        </Row>
        <div className={styles.metricSwitch}>
          <span>{EN.Validation}</span>
          <Switch checked={project.isHoldout} onChange={() => project.isHoldout = !project.isHoldout} style={{ backgroundColor: '#1D2B3C' }} />
          <span>{EN.Holdout}</span>
        </div>
        {<DetailCurves
          project={project}
          model={model}
          yes={yes}
          no={no}
        />}
      </div>
    )
  }
}
export default ClassificationModelRow
