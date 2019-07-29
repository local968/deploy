import React, { Component } from 'react';
import { Modal } from 'antd';
import { observer } from 'mobx-react';
import styles from './DetailCurves.module.css';
import FitPlotHover from './svg/iconMR-FitPlot-Hover.svg';
import FitPlotNormal from './svg/iconMR-FitPlot-Normal.svg';
import FitPlotSelected from './svg/iconMR-FitPlot-Selected.svg';
import ResidualHover from './svg/iconMR-Residual-Hover.svg';
import ResidualNormal from './svg/iconMR-Residual-Normal.svg';
import ResidualSelected from './svg/iconMR-ResidualPlot-Selected.svg';
import varImpactHover from './svg/icon-variable-impact-linear-hover.svg';
import varImpactSelected from './svg/icon-variable-impact-selected.svg';
import varImpactNormal from './svg/icon-variable-impact-linear-normal.svg';

import VariableImpact from '../../Result/VariableImpact';
import EN from '../../../../constant/en';
import request from '../../../Request';

import { FitPlot, ResidualPlot } from '../../../Charts';
import Thumbnail from './Thumbnail';
import DiagnoseResult from './DiagnoseResult';
import ResidualDiagnose from './ResidualDiagnose';
import Project from 'stores/Project';
import Model from 'stores/Model';

interface RegressionDetailCurvesProps {
  project: Project;
  model: Model;
  mapHeader: StringObject;
}

@observer
class RegressionDetailCurves extends Component<RegressionDetailCurvesProps> {
  state = {
    curve: EN.VariableImpact,
    visible: false,
    diagnoseType: null,
    chartDate: null,
    show: false,
    holdOutChartDate: null,
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

  componentDidMount() {
    this.setChartDate();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isHoldout !== this.props.project.isHoldout) {
      this.setState(
        {
          show: false,
        },
        () => {
          this.setState({
            show: true,
          });
        },
      );
    }
  }

  setChartDate() {
    const { validatePlotData, holdoutPlotData } = this.props.model;

    request
      .post({
        url: '/graphics/list',
        data: [
          {
            name: 'fit-plot',
            data: {
              url: validatePlotData,
            },
          },
          {
            name: 'fit-plot',
            data: {
              url: holdoutPlotData,
            },
          },
        ],
      })
      .then((data:Array<any>) => {
        const [chartDate, holdOutChartDate] = data;
        this.setState({
          chartDate,
          holdOutChartDate,
          show: true,
        });
      });

    // request.post({
    //   url: '/graphics/fit-plot',
    //   data: {
    //     url,
    //   },
    // }).then(chartDate => {
    //   this.setState({
    //     chartDate
    //   })
    // });
  }

  render() {
    const { model, mapHeader, project } = this.props;
    const { isHoldout } = project;
    const {
      curve,
      diagnoseType,
      chartDate,
      show,
      holdOutChartDate,
    } = this.state;
    let curComponent;
    switch (curve) {
      case EN.VariableImpact:
        curComponent = (
          <div style={{ fontSize: 60 }}>
            <VariableImpact model={model} mapHeader={mapHeader} />
          </div>
        );
        break;
      case EN.FitPlot:
        curComponent = (
          <div className={styles.plot} style={{ height: 300, width: 500 }}>
            {show && (
              <FitPlot
                title={EN.FitPlot}
                x_name={EN.Truevalue}
                y_name={EN.Predictvalue}
                chartDate={isHoldout ? holdOutChartDate : chartDate}
              />
            )}
          </div>
        );
        break;
      case EN.ResidualPlot:
        const Plot = show && (
          <ResidualPlot
            title={EN.ResidualPlot}
            // x_name={EN.Truevalue}
            y_name={EN.Predictvalue}
            chartDate={isHoldout ? holdOutChartDate : chartDate}
          />
        );
        curComponent = (
          <div className={styles.plot}>
            {/*<img className={styles.img} src={model.residualPlotPath} alt="residual plot" />*/}
            {/*<ResidualPlot/>*/}
            {chartDate && Plot}
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
                residualplot={model.residualPlotPath}
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
        hoverIcon: ResidualNormal,
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
        <div className={styles.leftPanel} style={{ minWidth: 210 }}>
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
