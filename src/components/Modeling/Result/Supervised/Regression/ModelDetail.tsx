import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { observable } from 'mobx';
import styles from '../styles.module.css';
import { Tooltip } from 'antd';
import EN from '../../../../../constant/en';
import { formatNumber } from '../../../../../util';
import moment from 'moment';
import Variable from '../../Variable.svg';
import Process from '../../Process.svg';
import VariableImpact from '../../VariableImpact';
import MPF from '../../MPF';
import classnames from 'classnames'

interface Interface {
  model:any
  onSelect:any
  isRecommend:any
  exportReport:any
  isSelect:any
  mapHeader:any
  project:any
}

@observer
export default class ModelDetail extends Component<Interface>{
  @observable type = '';
  @observable visible = false;

  toggleImpact(type) {
    if (!this.visible) {
      //本来是关着的
      this.type = type;
      this.visible = true;
      return;
    }
    if (this.type === type) {
      this.visible = false;
    } else {
      this.type = type;
    }
  }

  render() {
    const {
      model,
      onSelect,
      isRecommend,
      exportReport,
      isSelect,
      mapHeader,
      project,
    } = this.props;
    return (
      <div className={styles.rowBox}>
        <Tooltip
          placement="left"
          title={isRecommend ? EN.Recommended : EN.Selected}
          visible={isSelect || isRecommend}
          overlayClassName={styles.recommendLabel}
          autoAdjustOverflow={false}
          arrowPointAtCenter={true}
          getPopupContainer={el => el.parentElement}
        >
          <div className={styles.rowData}>
            <div className={styles.modelSelect}>
              <input
                type="radio"
                name="modelSelect"
                checked={isSelect}
                onChange={onSelect.bind(null, model)}
              />
            </div>
            <div className={classnames(styles.cell, styles.name)}>
              <Tooltip title={model.modelName}>{model.modelName}</Tooltip>
            </div>
            <div className={styles.cell}>
              <span>{formatNumber(model.score.validateScore.rmse)}</span>
            </div>
            <div className={styles.cell}>
              <span>{formatNumber(model.score.validateScore.r2)}</span>
            </div>
            <div className={styles.cell}>
              <span>{formatNumber(model.executeSpeed) + EN.Rowss}</span>
            </div>
            <div className={styles.cell}>
              <span>
                {model.createTime
                  ? moment.unix(model.createTime).format('YYYY/MM/DD HH:mm')
                  : ''}
              </span>
            </div>
            <div className={classnames(styles.cell, styles.compute)}>
              <img src={Variable} alt="" />
              <span onClick={this.toggleImpact.bind(this, 'impact')}>
                {EN.Compute}
              </span>
            </div>
            <div className={classnames(styles.cell, styles.compute)}>
              <img src={Process} alt="" />
              <span onClick={this.toggleImpact.bind(this, 'process')}>
                {EN.Compute}
              </span>
            </div>
            <div className={classnames(styles.cell, styles.compute)}>
              <span onClick={exportReport}>{EN.Export}</span>
            </div>
          </div>
        </Tooltip>
        {this.visible && this.type === 'impact' && (
          <VariableImpact model={model} mapHeader={mapHeader} />
        )}
        {this.visible && this.type === 'process' && (
          <MPF project={project} model={model} />
        )}
      </div>
    );
  }
}
