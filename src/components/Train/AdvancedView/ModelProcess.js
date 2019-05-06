import React, { Component } from 'react';
import { Popover } from 'antd';
import styles from './ModelProcess.module.css';
import { observer } from 'mobx-react';
import EN from '../../../constant/en';

@observer
export default class ModelProcess extends Component {
  render() {
    const { name, modelProcessFlow: {flow, flowPara} } = this.props.model;
    const processFlow = this.props.model.modelProcessFlow();
    const { report } = this.props;
    const processes = [EN.RawData, EN.DataPreprocessing, EN.FeaturePreprocessing, EN.ModelTraining, EN.Prediction];
    const legends = {
      [EN.RawData]: false,
      [EN.DataPreprocessing]: true,
      [EN.FeaturePreprocessing]: true,
      [EN.ModelTraining]: true,
      'Ensembled Model': false,
      [EN.Prediction]: false
    };
    const colors = {
      [EN.RawData]: 'rgb(243, 242, 242)',
      [EN.DataPreprocessing]: '#A2EFFC',
      [EN.FeaturePreprocessing]: 'rgb(255, 242, 187)',
      [EN.ModelTraining]: 'rgb(229, 233, 252)',
      'Model Training': 'rgb(229, 233, 252)',
      [EN.Prediction]: 'rgb(68, 142, 237)'
    };
    if (name.startsWith('ensemble')) {
      return (
        <div className={`${styles.modelProcess} ${this.props.className}`}>
          <SubStep name={name} process={EN.RawData} color={colors[EN.RawData]} legend={!report && legends[EN.RawData]} />
          <Ensemble colors={colors} model={this.props.model} legends={legends} report={report} />
          <Arrow />
          <SubStep name={name} process="Ensembled Model" color={colors['Ensembled Model']} legend={!report && legends['Ensembled Model']} />
          <SubStep name={name} hasArrow={false} process={EN.Prediction} color={colors[EN.Prediction]} legend={!report && legends[EN.Prediction]} />
        </div>
      );
    }
    return (
      <div className={`${styles.modelProcess} ${this.props.className}`}>
        {processes.map(p => <SubStep name={name} processFlow={processFlow} flowPara={flowPara} flow={flow} key={p} hasArrow={p !== EN.Prediction} process={p} color={colors[p]} legend={legends[p]} />)}
      </div>
    );
  }
}

class Ensemble extends Component {
  render() {
    const { model: { dataFlow }, colors, legends, report } = this.props;
    const processes = [EN.DataPreprocessing, EN.FeaturePreprocessing, EN.ModelTraining];
    return (
      <div>
        {dataFlow.map((df, i) => {
          // if (m.name === 'ensemble' || modelSetting !== m.modelSetting) return null;
          const subModelFlow = this.props.model.modelProcessFlow(df);
          return (
            <div className={styles.ensembleWrapper} key={i}>
              <div className={styles.ensembleSubstep}>
                {processes.map(p => <SubStep name={subModelFlow.flow[EN.ModelTraining][0]} processFlow={subModelFlow} hasArrow={p !== EN.ModelTraining} key={p} process={p} color={colors[p]} legend={!report && legends[p]} />)}
              </div>
              {/* <div className={styles.weight} >{m.weight}</div> */}
            </div>
          );
        })}
      </div>
    );
  }
}

@observer
class SubStep extends Component {
  state = {
    visible: false
  }
  static defaultProps = {
    hasArrow: true
  }
  handleClick = () => {
    this.setState({ visible: true });
  }
  render() {
    const { hasArrow, process, color, legend, name, processFlow = {} } = this.props;
    const {flow = {}, flowPara = {}} = processFlow;
    const nonDisplay = new Set(['select_percentile_classification', 'none', 'no_preprocessing', 'select_rates']);
    const popoverContent = legend && (
      <div>
        {flow && flow[process].map(f => {
          if (!flowPara[f]) return null;
          return (
            <div className={styles.processPopoverWrapper} key={f}>
              <h4 className={styles.item}>{f}</h4>
              {Object.entries(flowPara[f]).map(item => {
                if (nonDisplay.has(item[1])) return null;
                return <div key={item[1]} className={styles.param}>{item[0]}: {item[1]}</div>;
              })}
            </div>
          );
        })}
      </div>
    );
    return (
      <div className={styles.subStep} >
        <div
          style={{ backgroundColor: color, color: process === EN.Prediction && 'white' }}
          className={legend ? styles.textWrapperLegend : styles.textWrapper}>
            {process === EN.ModelTraining ? name : process}
        </div>
        {legend &&
          <Popover
            content={popoverContent}
            trigger="click"
          >
            <div onClick={this.handleClick} className={styles.popoverLegend}>
              <i className="fa fa-caret-right fa-2x" aria-hidden="true" style={{ verticalAlign: 'middle' }}></i>
            </div>
          </Popover>
        }
        {hasArrow && <Arrow />}
      </div>
    );
  }
}

class Arrow extends Component {
  render() {
    return (
      <div className={styles.arrow}>
        <div className={styles.circle}></div>
        <div className={styles.line}></div>
        <div className={styles.triangle}></div>
      </div>
    );
  }
}
