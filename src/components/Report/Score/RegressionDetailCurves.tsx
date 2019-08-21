import { observer } from 'mobx-react';
import React, { Component } from 'react';
import EN from '../../../constant/en';
import { toJS } from 'mobx';
import VariableImpact from '../../Modeling/Result/VariableImpact';
import styles from './AdvancedView.module.css';
import FitPlot from '../../Charts/FitPlot';
import ResidualPlot from '../../Charts/ResidualPlot';
import { Modal } from 'antd';
import ResidualDiagnose from './ResidualDiagnose';
import Thumbnail from './Thumbnail';

interface Interface {
  model:any
  project:any
}

@observer
class RegressionDetailCurves extends Component<Interface> {
  state = {
    curve: EN.VariableImpact,
    visible: false,
    diagnoseType: null,
  };

  handleClick = val => {
    this.setState({ curve: val });
  };

  handleDiagnose = () => {
    this.setState({ visible: true });
  };

  handleDiagnoseType = e => {
    this.setState({ diagnoseType: e.target.value });
  };

  render() {
    const { model, project } = this.props;
    const { curve, diagnoseType } = this.state;
    const { isHoldout } = project;
    const graphicList = toJS(model.graphicList);
    const holdOutChartDate = graphicList.pop();
    const chartDate = graphicList.pop();
    console.log(model, 'mmmmmmmmmmmmmmmmmmmmm', project);
    let curComponent;
    switch (curve) {
      case EN.VariableImpact:
        curComponent = (
          <div style={{ fontSize: 60 }}>
            <VariableImpact mapHeader={project.mapHeader} model={model} />
          </div>
        );
        break;
      case EN.FitPlot:
        curComponent = (
          <div className={styles.plot}>
            {
              <FitPlot
                title={EN.FitPlot}
                // x_name={EN.Truevalue}
                y_name={EN.Predictvalue}
                chartDate={isHoldout ? holdOutChartDate : chartDate}
              />
            }
          </div>
        );
        break;
      case EN.ResidualPlot:
        const Plot = (
          <ResidualPlot
            title={EN.ResidualPlot}
            chartDate={isHoldout ? holdOutChartDate : chartDate}
          />
        );
        curComponent = (
          <div className={styles.plot}>
            {Plot}
            <Modal
              visible={this.state.visible}
              title={EN.ResidualPlotDiagnose}
              width={1200}
              onOk={() => this.setState({ visible: false })}
              onCancel={() => this.setState({ visible: false })}
            >
              <ResidualDiagnose
                handleDiagnoseType={this.handleDiagnoseType}
                diagnoseType={diagnoseType}
                Plot={Plot}
              />
            </Modal>
            <DiagnoseResult
              project={this.props.project}
              handleDiagnose={this.handleDiagnose}
              diagnoseType={diagnoseType}
            />
          </div>
        );
        break;
      default:
        break;
    }
    const thumbnails = [
      {
        text: EN.FitPlot,
        hoverIcon: FitPlotHover,
        normalIcon: FitPlotNormal,
        selectedIcon: FitPlotSelected,
        type: 'fitplot',
      },
      {
        text: EN.ResidualPlot,
        hoverIcon: ResidualHover,
        normalIcon: ResidualNormal,
        selectedIcon: ResidualSelected,
        type: 'residualplot',
      },
      {
        normalIcon: varImpactNormal,
        hoverIcon: varImpactHover,
        selectedIcon: varImpactSelected,
        text: EN.VariableImpact,
      },
    ];
    return (
      <div className={styles.detailCurves}>
        <div className={styles.leftPanel} style={{ minWidth: 160 }}>
          {thumbnails.map((tn, i) => (
            <Thumbnail
              curSelected={curve}
              key={i}
              thumbnail={tn}
              onClick={this.handleClick}
              value={tn.text}
            />
          ))}
        </div>
        <div className={styles.rightPanel}>{curComponent}</div>
      </div>
    );
  }
}
export default RegressionDetailCurves;
