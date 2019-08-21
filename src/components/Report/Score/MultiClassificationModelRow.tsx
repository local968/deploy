import { observer } from 'mobx-react';
import React, { Component } from 'react';
import EN from '../../../constant/en';
import { Radio, Row, Select, Switch, Tooltip } from 'antd';
import styles from './AdvancedView.module.css';
import moment from 'moment';
import { formatNumber } from "../../../util";
import MultiClassificationDetailCurves from '../../Modeling/Result/AdvancedView/MultiClassificationDetailCurves';
import RowCell from './RowCell';
interface Interface {
  project:any
  model:any
  texts:Array<string>
  checked:any
  onClickCheckbox:any
}
@observer
class MultiClassificationModelRow extends Component<Interface>{
  handleM_cro = (e) => {
    this.props.project.upM_cro(e)
  };

  render() {
    const { model, texts, checked, project} = this.props;
    const {isHoldout,measurement,m_cro} = project;
    if (!model.chartData) return null;
    const { modelName,
      score:{holdoutScore,validateScore},
      createTime,
      holdoutChartData,
      chartData,
    } = model;

    const modelScore = isHoldout ? holdoutScore : validateScore;
    const modelChartData = isHoldout ? holdoutChartData : chartData;

    const [t, p] = measurement.split("_");

    const validate = measurement === 'macro_auc' ? chartData.roc_auc.macro : p === 'f1' ? validateScore[`${t}_F1`] : validateScore[`${t}_${p.slice(0, 1).toUpperCase()}`];
    const holdout = measurement === 'macro_auc' ? holdoutChartData.roc_auc.macro : p === 'f1' ? holdoutScore[`${t}_F1`] : holdoutScore[`${t}_${p.slice(0, 1).toUpperCase()}`];
    return (
      <div >
        <Row>
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
              case EN.Time:
                return <RowCell key={2} data={createTime
                  ? moment.unix(createTime).format('YYYY/MM/DD HH:mm')
                  : ''} />;
              case 'Accuracy':
                return <RowCell key={3} data={formatNumber(modelScore.Accuracy.toString())} />;
              case 'Micro-P':
                return <RowCell key={4} data={formatNumber(modelScore.micro_P.toString())} />;
              case 'Micro-R':
                return <RowCell key={5} data={formatNumber(modelScore.micro_R.toString())} />;
              case 'Micro-F1':
                return <RowCell key={6} data={formatNumber(modelScore.micro_F1.toString())} />;
              case 'Micro-AUC':
                return <RowCell key={7} data={formatNumber(modelChartData.roc_auc.micro.toString())} />;
              case 'Macro-P':
                return <RowCell key={8} data={formatNumber(modelScore.macro_P.toString())} />;
              case 'Macro-R':
                return <RowCell key={9} data={formatNumber(modelScore.macro_R.toString())} />;
              case 'Macro-F1':
                return <RowCell key={10} data={formatNumber(modelScore.macro_F1.toString())} />;
              case 'Macro-AUC':
                return <RowCell key={11} data={formatNumber(modelChartData.roc_auc.macro.toString())} />;
              case "MCC":
                return <RowCell key={12} data={formatNumber(modelScore.MCC.toString())} />;
              case "Kappa":
                return <RowCell key={13} data={formatNumber(modelScore.Kappa.toString())} />;
              case "Jaccard":
                return <RowCell key={14} data={formatNumber(modelScore.Jaccard.toString())} />;
              case "HammingLoss":
                return <RowCell key={15} data={formatNumber(modelScore.HammingLoss.toString())} />;
              case EN.Validation:
                return <RowCell key={16} data={formatNumber(validate.toString())} />;
              case EN.Holdout:
                return <RowCell key={17} data={formatNumber(holdout.toString())} />;
              default:
                return null;
            }
          })}
        </Row>
        <div className={styles.tools}>
          <div className={styles.m_croSwitch}>
            <div>
              <Select
                size="large"
                value={m_cro}
                onChange={this.handleM_cro}
                style={{ width: '140px', fontSize: '1rem' }}
                getPopupContainer={el => el.parentElement}
              >
                {['macro','micro'].map((mo:string) => <Option value={mo} key={mo} >{mo}</Option>)}
              </Select>
            </div>
          </div>
          <div className={styles.metricSwitch}>
            <span>{EN.Validation}</span>
            <Switch checked={isHoldout} onChange={() => project.isHoldout = !isHoldout} style={{ backgroundColor: '#1D2B3C' }} />
            <span>{EN.Holdout}</span>
          </div>
        </div>

        <MultiClassificationDetailCurves
          project={project}
          model={model}
        />
      </div>
    )
  }
}
export default MultiClassificationModelRow;
