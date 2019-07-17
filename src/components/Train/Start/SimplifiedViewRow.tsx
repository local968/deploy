import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { observable } from 'mobx';
import { formatNumber } from '../../../util';
import styles from './styles.module.css';
import { Icon, InputNumber, Popover } from 'antd';
import histogramIcon from './histogramIcon.svg';
import SimplifiedViewPlot from './SimplifiedViewPlot';
import EN from '../../../constant/en';
import request from 'components/Request'
import classnames from 'classnames'
import SimplePlot from './SimplePlot'

interface SimplifiedViewRowInterface {
  value: any
  project: any
  isNew: any
  data:any
  colType:any
  weight:any
  isChecked:any
  handleCheck:any
  lines:any
  handleWeight:any
  mapHeader:any
  importance:any
}
@observer
export default class SimplifiedViewRow extends Component<
  SimplifiedViewRowInterface
> {
  @observable histograms = false;
  @observable univariant = false;
  @observable chartData = {};
  @observable result = {};

  showHistograms = () => {
    const { value, project, isNew } = this.props;
    const { rawDataView } = project;
    if (isNew) {
      return (this.histograms = true);
    }
    if (!this.chartData[value]) {
      const data:any = {
        field: value,
        id: project.etlIndex,
      };
      if (project.colType[value] === 'Numerical') {
        const {
          max,
          min,
          std_deviation_bounds: { lower, upper },
        } = rawDataView[value];
        data.interval = (Math.max(upper, max) - Math.min(lower, min)) / 100;
        request
          .post({
            url: '/graphics/histogram-numerical',
            data,
          })
          .then((result:any) =>
            this.showback(result.data, value, {
              min,
              max,
              interval: data.interval,
            }),
          );
      } else {
        const { uniqueValues } = project.dataViews[value];
        data.size = uniqueValues;
        request
          .post({
            url: '/graphics/histogram-categorical',
            data,
          })
          .then((result:any) => this.showback(result.data, value));
      }
    } else {
      this.histograms = true;
    }
  };
  showback = (result, value, message?:any) => {
    this.chartData = {
      ...this.chartData,
      [value]: result,
    };
    this.result = {
      ...this.result,
      [value]: message,
    };
    this.histograms = true;
  };

  hideHistograms = e => {
    e && e.stopPropagation();
    this.histograms = false;
  };

  renderCell = (value, isNA) => {
    if (isNA) return 'N/A';
    if (isNaN(+value)) return value || 'N/A';
    return formatNumber(value, 2);
  };

  render() {
    const {
      data,
      colType,
      weight,
      value,
      project,
      isChecked,
      handleCheck,
      lines,
      handleWeight,
      isNew,
      mapHeader,
      importance,
    } = this.props;
    const { histgramPlots, histgramPlot, problemType } = project;
    const valueType =
      colType[value] === 'Numerical' ? 'Numerical' : 'Categorical';
    const isRaw = colType[value] === 'Raw';
    const unique =
      (isRaw && `${lines}+`) ||
      (valueType === 'Numerical' && 'N/A') ||
      data.uniqueValues;
    return (
      <div className={styles.tableRow}>
        <div className={classnames(styles.tableTd, styles.tableCheck)}>
          <input type="checkbox" checked={isChecked} onChange={handleCheck} />
        </div>
        <div className={styles.tableTd} title={mapHeader[value]}>
          <span>{mapHeader[value]}</span>
        </div>
        <div className={styles.tableTd} style={{ borderColor: 'transparent' }}>
          <InputNumber
            value={weight || 1}
            max={99.9}
            min={0.1}
            step={0.1}
            precision={1}
            onChange={handleWeight}
          />
        </div>
        <div
          className={classnames(styles.tableTd, {
            [styles.notAllow]: isRaw,
          })}
          id={'Histograms' + value}
          onClick={this.showHistograms.bind(this, value)}
        >
          <img
            src={histogramIcon}
            className={styles.tableImage}
            alt="histogram"
          />
          {!isRaw && this.histograms ? (
            <Popover
              placement="rightTop"
              visible={!isRaw && this.histograms}
              overlayClassName="popovers"
              onVisibleChange={this.hideHistograms}
              trigger="click"
              title={
                <Icon
                  style={{
                    float: 'right',
                    height: 23,
                    alignItems: 'center',
                    display: 'flex',
                  }}
                  onClick={this.hideHistograms}
                  type="close"
                />
              }
              content={
                <SimplePlot
                  isNew={isNew}
                  path={histgramPlots[value]}
                  getPath={histgramPlot.bind(null, value)}
                >
                  <SimplifiedViewPlot
                    type={colType[value]}
                    value={mapHeader[value]}
                    result={this.result[value]}
                    data={this.chartData[value]}
                  />
                </SimplePlot>
              }
            />
          ) : null}
        </div>
        {problemType === 'Clustering' && (
          <div className={classnames(styles.tableTd, styles.tableImportance)}>
            <div
              className={styles.preImpotance}
              title={formatNumber(importance, 3)}
            >
              <div
                className={styles.preImpotanceActive}
                style={{ width: importance * 100 + '%' }}
              />
            </div>
          </div>
        )}
        <div className={styles.tableTd} title={valueType}>
          <span>
            {valueType === 'Numerical' ? EN.Numerical : EN.Categorical}
          </span>
        </div>
        <div
          className={classnames(styles.tableTd, {
            [styles.none]: valueType !== 'Categorical',
          })}
          title={unique}
        >
          <span>{unique}</span>
        </div>
        <div
          className={classnames(styles.tableTd, {
            [styles.none]: valueType === 'Categorical',
          })}
          title={this.renderCell(data.mean, valueType === 'Categorical')}
        >
          <span>{this.renderCell(data.mean, valueType === 'Categorical')}</span>
        </div>
        <div
          className={classnames(styles.tableTd, {
            [styles.none]: valueType === 'Categorical',
          })}
          title={this.renderCell(data.std, valueType === 'Categorical')}
        >
          <span>{this.renderCell(data.std, valueType === 'Categorical')}</span>
        </div>
        <div
          className={classnames(styles.tableTd, {
            [styles.none]: valueType === 'Categorical',
          })}
          title={this.renderCell(data.median, valueType === 'Categorical')}
        >
          <span>
            {this.renderCell(data.median, valueType === 'Categorical')}
          </span>
        </div>
        <div
          className={classnames(styles.tableTd, {
            [styles.none]: valueType === 'Categorical',
          })}
          title={this.renderCell(data.min, valueType === 'Categorical')}
        >
          <span>{this.renderCell(data.min, valueType === 'Categorical')}</span>
        </div>
        <div
          className={classnames(styles.tableTd, {
            [styles.none]: valueType === 'Categorical',
          })}
          title={this.renderCell(data.max, valueType === 'Categorical')}
        >
          <span>{this.renderCell(data.max, valueType === 'Categorical')}</span>
        </div>
      </div>
    );
  }
}
