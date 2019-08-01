import React, { Component, ReactElement } from 'react';
import { Radio } from 'antd';
import styles from './DetailCurves.module.css';

import nonlinearImg from './svg/img-residual-plot-nonlinear.svg';
import heteroscedasticityImg from './svg/img-residual-plot-heteroscedasticity.svg';
import largeImg from './svg/img-residual-plot-large-y.svg';
import yAxisUnbalancedImg from './svg/img-residual-plot-y-axis-unbalanced.svg';
import outliersImg from './svg/img-residual-plot-outliers.svg';
import xAxisUnbalancedImg from './svg/img-residual-plot-x-axis-unbalanced.svg';
import randomlyImg from './svg/img-residual-plot-randomly.svg';

import EN from '../../../../constant/en';
import { RadioChangeEvent } from 'antd/lib/radio';

interface ResidualDiagnoseProps {
  handleDiagnoseType: (e: RadioChangeEvent) => void,
  diagnoseType: string
  Plot: ReactElement
  residualplot: string
}

class ResidualDiagnose extends Component<ResidualDiagnoseProps> {
  render() {
    const plots = [{
      plot: randomlyImg,
      type: 'random',
      text: EN.RandomlyDistributed
    }, {
      plot: yAxisUnbalancedImg,
      type: 'yUnbalanced',
      text: EN.YaxisUnbalanced
    }, {
      plot: xAxisUnbalancedImg,
      type: 'xUnbalanced',
      text: EN.XaxisUnbalanced
    }, {
      plot: outliersImg,
      type: 'outliers',
      text: EN.Outliers
    }, {
      plot: nonlinearImg,
      type: 'nonlinear',
      text: EN.Nonlinear
    }, {
      plot: heteroscedasticityImg,
      type: 'heteroscedasticity',
      text: EN.Heteroscedasticity
    }, {
      plot: largeImg,
      type: 'largey',
      text: EN.LargeYaxisDataPoints
    }];
    const { diagnoseType } = this.props;
    const RadioGroup = Radio.Group;
    return (
      <div className={styles.residualDiagnose} >
        <div className={styles.plot}>
          {this.props.Plot}
        </div>
        <div className={styles.choosePlot} >
          <div>{EN.Whichplotdoesyourresidual}</div>
          <RadioGroup value={diagnoseType} onChange={this.props.handleDiagnoseType} >
            {plots.map((p, i) => (
              <div className={styles.radioWrapper} key={i}>
                <Radio value={p.type} >{p.text}</Radio>
                <div>
                  <img width={200} src={p.plot} alt='plot' />
                </div>
              </div>
            ))}
          </RadioGroup >
        </div>

      </div>
    );
  }
}

export default ResidualDiagnose
