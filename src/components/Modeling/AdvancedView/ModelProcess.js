import React, { Component } from 'react';
import { Popover } from 'antd';
import styles from './ModelProcess.module.css';
import { observer } from 'mobx-react';

@observer
export default class ModelProcess extends Component {
  render() {
    const { modelName, modelProcessFlow: {flow, flowPara} } = this.props.model;
    const processFlow = this.props.model.modelProcessFlow();
    const { report } = this.props;
    const processes = ['Raw Data', 'Data Preprocessing', 'Feature Processing', 'Model Training', 'Prediction'];
    const legends = {
      'Raw Data': false,
      'Data Preprocessing': true,
      'Feature Processing': true,
      'Model Training': true,
      'Ensembled Model': false,
      Prediction: false
    };
    const colors = {
      'Raw Data': 'rgb(243, 242, 242)',
      'Data Preprocessing': '#A2EFFC',
      'Feature Processing': 'rgb(255, 242, 187)',
      'Ensembled Model': 'rgb(229, 233, 252)',
      'Model Training': 'rgb(229, 233, 252)',
      'Prediction': 'rgb(68, 142, 237)'
    };
    if (modelName.startsWith('ensemble')) {
      return (
        <div className={`${styles.modelProcess} ${this.props.className}`}>
          <SubStep modelName={modelName} process="Raw Data" color={colors['Raw Data']} legend={!report && legends['Raw Data']} />
          <Ensemble colors={colors} model={this.props.model} legends={legends} report={report} />
          <Arrow />
          <SubStep modelName={modelName} process="Ensembled Model" color={colors['Ensembled Model']} legend={!report && legends['Ensembled Model']} />
          <SubStep modelName={modelName} hasArrow={false} process="Prediction" color={colors['Prediction']} legend={!report && legends['Prediction']} />
        </div>
      );
    }
    return (
      <div className={`${styles.modelProcess} ${this.props.className}`}>
        {processes.map(p => <SubStep modelName={modelName} processFlow={processFlow} flowPara={flowPara} flow={flow} key={p} hasArrow={p !== 'Prediction'} process={p} color={colors[p]} legend={legends[p]} />)}
      </div>
    );
  }
}

class Ensemble extends Component {
  render() {
    const { model: { dataFlow }, colors, legends, report } = this.props;
    const processes = ['Data Preprocessing', 'Feature Processing', 'Model Training'];
    return (
      <div>
        {dataFlow.map((df, i) => {
          // if (m.modelName === 'ensemble' || modelSetting !== m.modelSetting) return null;
          const subModelFlow = this.props.model.modelProcessFlow(df);
          return (
            <div className={styles.ensembleWrapper} key={i}>
              <div className={styles.ensembleSubstep}>
                {processes.map(p => <SubStep name={subModelFlow.flow['Model Training'][0]} processFlow={subModelFlow} hasArrow={p !== 'Model Training'} key={p} process={p} color={colors[p]} legend={!report && legends[p]} />)}
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
          style={{ backgroundColor: color, color: process === 'Prediction' && 'white' }}
          className={legend ? styles.textWrapperLegend : styles.textWrapper}>
            {process === 'Model Training' ? name : process}
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
