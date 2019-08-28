import React, { useEffect, useState } from 'react';
import { Modal } from 'antd';
import { observer } from 'mobx-react';
import styles from './DetailCurves.module.css';
import FitPlotHover from './svg/iconMR-FitPlot-Hover.svg';
import FitPlotNormal from './svg/iconMR-FitPlot-Normal.svg';
import FitPlotSelected from './svg/iconMR-FitPlot-Selected.svg';
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

interface Interface {
  project: Project;
  model: Model;
  mapHeader: StringObject;
}

function RegressionDetailCurves(props:Interface) {
    const { model, mapHeader, project } = props;
    const { isHoldout } = project;
    const [curve,upCurve] = useState(EN.VariableImpact);
    const [visible,upVisible] = useState(false);
    const [diagnoseType,upDiagnoseType] = useState(null);
    const [chartDate,upChartDate] = useState(null);
    const [show,upShow] = useState(false);
    const [holdOutChartDate,upHoldOutChartDate] = useState(null);

    useEffect(()=>{
      const { validatePlotData, holdoutPlotData } = model;
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
          upChartDate(chartDate);
          upHoldOutChartDate(holdOutChartDate);
          upShow(true);
        });
    },[]);

    useEffect(()=>{
      upShow(false);
      upShow(true);
    },[isHoldout]);

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
            chartDate={isHoldout ? holdOutChartDate : chartDate}
          />
        );
        const sPlot = show && (
          <ResidualPlot
            title={EN.ResidualPlot}
            chartDate={isHoldout ? holdOutChartDate : chartDate}
            width = {350}
            height = {280}
          />
        );
        curComponent = (
          <div className={styles.plot}>
            {chartDate && Plot}
            <Modal
              visible={visible}
              title={EN.ResidualPlotDiagnose}
              width={1200}
              onOk={() => upVisible(false)}
              onCancel={() => upVisible(false)}
              zIndex={100000}
            >
              <ResidualDiagnose
                handleDiagnoseType={e=>upDiagnoseType(e.target.value)}
                diagnoseType={diagnoseType}
                Plot={sPlot}
                residualplot={model.residualPlotPath}
              />
            </Modal>
            <DiagnoseResult
              project={project}
              handleDiagnose={()=>upVisible(true)}
              diagnoseType={diagnoseType}
            />
          </div>
        );
        break;
      default:
        break;
    }
    return (
      <div className={styles.detailCurves}>
        <div className={styles.leftPanel} style={{ minWidth: 210 }}>
          {thumbnails.map((tn, i) => (
            <Thumbnail
              curSelected={curve}
              key={i}
              thumbnail={tn}
              onClick={upCurve}
              value={tn.text}
            />
          ))}
        </div>
        <div className={styles.rightPanel}>{curComponent}</div>
      </div>
    );
}

export default observer(RegressionDetailCurves);
