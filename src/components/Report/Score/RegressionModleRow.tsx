import { observer } from 'mobx-react';
import React, { Component } from 'react';
import EN from '../../../constant/en';
import RowCell from './RowCell';
import { Radio, Tooltip } from 'antd';
import styles from './AdvancedView.module.css';
import moment from 'moment';
import RegressionDetailCurves from './RegressionDetailCurves';
import Row from './Row';

interface Interface {
  model: any;
  texts: any;
  metric: any;
  checked: any;
  project: any;
  onClickCheckbox:any
}

@observer
class RegressionModleRow extends Component<Interface> {
  state = {
    detail: false,
  };
  handleResult(){
    this.setState({ detail: !this.state.detail });
  }

  render() {
    const { model, texts, metric, checked, project } = this.props;
    const { score, modelName, reason } = model;
    const { validate, holdout } = reason || {} as any;

    return (
      <div>
        <Row onClick={this.handleResult}>
          {texts.map(t => {
            switch (t) {
              case EN.ModelName:
                return (
                  <RowCell
                    key={1}
                    data={
                      <div key={1}>
                        <Radio
                          checked={checked}
                          onClick={this.props.onClickCheckbox}
                        />
                        <Tooltip title={modelName}>
                          <span className={styles.modelName}>
                            {modelName}
                          </span>
                        </Tooltip>
                      </div>
                    }
                  />
                );
              case 'Normalized RMSE':
                return (
                  <RowCell
                    key={10}
                    data={score.validateScore.nrmse}
                    title={
                      score.validateScore.nrmse === 'null'
                        ? (validate || {}).nrmse
                        : ''
                    }
                  />
                );
              case 'RMSE':
                return (
                  <RowCell
                    key={2}
                    data={score.validateScore.rmse}
                    title={
                      score.validateScore.rmse === 'null'
                        ? (validate || {}).rmse
                        : ''
                    }
                  />
                );
              case 'MSLE':
                return (
                  <RowCell
                    key={11}
                    data={score.validateScore.msle}
                    title={
                      score.validateScore.msle === 'null'
                        ? (validate || {}).msle
                        : ''
                    }
                  />
                );
              case 'RMSLE':
                return (
                  <RowCell
                    key={9}
                    data={score.validateScore.rmsle}
                    title={
                      score.validateScore.rmsle === 'null'
                        ? (validate || {}).rmsle
                        : ''
                    }
                  />
                );
              case 'MSE':
                return (
                  <RowCell
                    key={3}
                    data={score.validateScore.mse}
                    title={
                      score.validateScore.mse === 'null'
                        ? (validate || {}).mse
                        : ''
                    }
                  />
                );
              case 'MAE':
                return (
                  <RowCell
                    key={4}
                    data={score.validateScore.mae}
                    title={
                      score.validateScore.mae === 'null'
                        ? (validate || {}).mae
                        : ''
                    }
                  />
                );
              case 'R2':
                return (
                  <RowCell
                    key={5}
                    data={score.validateScore.r2}
                    title={
                      score.validateScore.r2 === 'null'
                        ? (validate || {}).r2
                        : ''
                    }
                  />
                );
              case 'AdjustR2':
                return (
                  <RowCell
                    key={8}
                    data={score.validateScore.adjustR2}
                    title={
                      score.validateScore.adjustR2 === 'null'
                        ? (validate || {}).adjustR2
                        : ''
                    }
                  />
                );
              case EN.Validation:
                return (
                  <RowCell
                    key={6}
                    data={score.validateScore[metric]}
                    title={
                      score.validateScore[metric] === 'null'
                        ? (validate || {})[metric]
                        : ''
                    }
                  />
                );
              case EN.Holdout:
                return (
                  <RowCell
                    key={7}
                    data={score.holdoutScore[metric]}
                    title={
                      score.holdoutScore[metric] === 'null'
                        ? (holdout || {})[metric]
                        : ''
                    }
                  />
                );
              case EN.Time:
                return (
                  <RowCell
                    key={12}
                    data={
                      model.createTime
                        ? moment
                            .unix(model.createTime)
                            .format('YYYY/MM/DD HH:mm')
                        : ''
                    }
                    notFormat={true}
                  />
                );
              default:
                return null;
            }
          })}
        </Row>
        <RegressionDetailCurves project={project} model={model} />
      </div>
    );
  }
}
export default RegressionModleRow;
