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
import PredictedProgress from './PredictedProgress'
import Model from 'stores/Model';
import Project from 'stores/Project';
import ModelInterpretation from '../ModelInterpretation';
const icon_check = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAACb0lEQVQ4EZWUT0gVURTGv3PvaCpli3CRqAThJloUBUUSbWphmE9fuGjRfyNqU5pmuHoRGJo+2wRBENGmhWmvCHXlKgrJVUVQFoT6jDCCzDR5M+fEmfduOITxmsWcmfN98ztnzr1cAoBDidkSu46PW5ibIBRqLp9LwG1L80t3RhLV86SQgvWSIqZtAnkBIMgHAsCCsIuE3i/++Fnn2bUSA9PuIPC3py5XfcwTEtri3TMVUoCJ4tLiM8aAtoDozf9ClDTUUTEDwTiErnkhWkQ0NnV9LvOL/B1GYML8KjcmsAe8HmitTOsoCGSzoNwHmUKpMTC3hVYh5NIqZxgtAB7orARYjoBSbeWp2sTk2L8xWVVXSp8IMEKyGAGp4Az5wJyHQL8ioPruqZ3WMxcMjFUTgwPDcmOwvfJVvD+9H4x6EK1hxoh2H4KIrAj+7shVWRkbe6evgtEOg2fEsmyI7sf7Zx99+/7utPNFOnrSUTUB4KgTNcZ6pvZ6xrsCBI2DLZXDmtPOPc8bKy2pfgoRXbWvEZCaahOTpQ6k87LWNgEYH7yUhaimBeO96YeepSM+Mtc9tgsR0OG+6YNC5q6adYBNyemaQAAx8svB/0RDGQKKHrdueq65yMYzy95LAZ8g4VNC0jw3/+GLEA8T075Y36c9DtLQM7UZkJgPGXC5bEdE4RYc6Nw4B2DUibk4Gk/O3rNSOKoDRiABEdUBKCPhIuc1DHkLka3ZKi4djUOt5WdZcIwYBSBsECOdgfB5PXYa+mbOqTvvY0RnlvH9ZG5lw0rx/nQzMd0KwBfDX3IHmzC6or1E34T5wEqQqrFk+qT4svAbFCEGfyvY0IsAAAAASUVORK5CYII=';

interface Interface {
  model: Model
  onSelect: (m: Model) => void
  isSelect: boolean
  isRecommend: boolean
  text: string
  exportReport: () => void
  mapHeader: StringObject
  project: Project
}
@observer
export default class ModelDetail extends Component<Interface> {
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
      isSelect,
      isRecommend,
      text,
      exportReport,
      mapHeader,
      project,
    } = this.props;
    const {linearData=false,treeData=false,modelName} = model as any;

    const _check = linearData||treeData;

    return (
      <div className={styles.rowBox}>
        <Tooltip
          placement="left"
          title={isRecommend ? text : EN.Selected}
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
            <div className={classnames(styles.cell, styles.predict)}>
              <PredictedProgress
                predicted={model.predicted[0]}
                width={1.5}
                height={0.2}
                type={'success'}
                failType={'fail'}
              />
              <div className={styles.space} />
              <PredictedProgress
                predicted={model.predicted[1]}
                width={1.5}
                height={0.2}
                type={'predicted'}
                failType={'failPredicted'}
              />
            </div>
            <div className={styles.cell}>
              <span>{formatNumber(model.accValidation.toString())}</span>
            </div>
            <div className={styles.cell}>
              <span>{formatNumber(model.score.validateScore.auc.toString())}</span>
            </div>
            <div className={styles.cell}>
              <span>{formatNumber(model.executeSpeed.toString()) + EN.Rowss}</span>
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
            <div className={classnames(styles.cell, styles.compute,_check?'':styles.disable)}>
                <img src={icon_check} alt="" style={{width:15}} />
                <span onClick={_check&&this.toggleImpact.bind(this, 'check')}>
                {EN.check}
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
        {/* <div className={classnames(styles.cell, styles.compute)}><span>Compute</span></div> */}
        {this.visible && this.type === 'impact' && (
          <VariableImpact model={model} mapHeader={mapHeader} />
        )}
        {this.visible && this.type === 'process' && (
          <MPF modelId={model.id} project={project} model={model} />
        )}
        {this.visible && this.type === 'check' && <ModelInterpretation treeData={treeData} linearData={linearData} modelName={modelName}/>}

      </div>
    );
  }
}
