import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { observable } from 'mobx';
import { formatNumber } from '../../../util';
import styles from './styles.module.css';
import histogramIcon from './histogramIcon.svg';
import { Icon, Popover } from 'antd';
import SimplifiedViewPlot from './SimplifiedViewPlot';
import univariantIcon from './univariantIcon.svg';
import ScatterPlot from './ScatterPlot';
import EN from '../../../constant/en';
import request from 'components/Request'
import classnames from 'classnames'
import SimplePlot from './SimplePlot'

interface Interface {
  data:any
  colType:any
  importance:any
  value:any
  project:any
  isChecked:any
  handleCheck:any
  id:any
  lines:any
  isNew:any
  mapHeader:any
}

@observer
export default class SimplifiedViewRow extends Component<Interface> {
  @observable histograms = false;
  @observable univariant = false;
  @observable chartData = {};
  @observable result = {};
  @observable scatterData = {};

  showHistograms = () => {
    const { value, project, isNew } = this.props;
    const { colType, etlIndex, rawDataView } = project;
    if (isNew) {
      return this.histograms = true;
    }
    if (!this.chartData[value]) {
      const data:any = {
        field: value,
        id: etlIndex,
      };
      if (colType[value] === 'Numerical') {
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
          .then(result =>
            this.showback(result.data, value, {
              min,
              max,
              interval: data.interval,
            }),
          );
      } else {
        const { uniqueValues } = project.dataViews[value];
        data.size = uniqueValues > 8 ? 8 : uniqueValues;
        request
          .post({
            url: '/graphics/histogram-categorical',
            data,
          })
          .then(result => this.showback(result.data, value));
      }
    } else {
      this.histograms = true;
    }
  };
  showback = (result, value:any, message?:any) => {
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

  showUnivariant = async () => {
    const { value, project, isNew, data: _data, colType } = this.props;
    const { mapHeader, target, problemType, etlIndex } = project;
    if (isNew) {
      const type = colType[value];

      this.scatterData = {
        ...this.scatterData,
        [`${value}-msg`]: {
          y: mapHeader[target],
          x: value,
          type,
        },
      };
      return (this.univariant = true);
    }

    if (!this.scatterData[value]) {
      const type = colType[value];
      if (problemType === 'Regression') {
        if (type === 'Numerical') {
          //散点图
          request
            .post({
              url: '/graphics/regression-numerical',
              data: {
                y: target,
                x: value,
                id: etlIndex,
              },
            })
            .then(result =>
              this.showbackUnivariant(
                result,
                mapHeader[value],
                mapHeader[target],
                'Numerical',
              ),
            );
        } else {
          //回归-分类 箱线图
          request
            .post({
              url: '/graphics/regression-categorical',
              data: {
                target,
                value,
                id: etlIndex,
              },
            })
            .then(result =>
              this.showbackUnivariant(
                result,
                mapHeader[value],
                mapHeader[target],
                'Categorical',
              ),
            );
        }
        // _result
      } else {
        //Univariant
        const { min, max } = _data;
        const data = {
          target,
          value,
          id: etlIndex,
          interval: Math.floor((max - min) / 10) || 1,
        };
        if (type === 'Numerical') {
          request
            .post({
              url: '/graphics/classification-numerical',
              data,
            })
            .then(result => {
              this.scatterData = {
                ...this.scatterData,
                [value]: {
                  ...result,
                },
                [`${value}-msg`]: {
                  type,
                  x: mapHeader[value],
                },
              };
              this.univariant = true;
            });
        } else {
          //?
          request
            .post({
              url: '/graphics/classification-categorical',
              data,
            })
            .then(result => {
              this.scatterData = {
                ...this.scatterData,
                [value]: {
                  ...result,
                },
                [`${value}-msg`]: {
                  type,
                  x: mapHeader[value],
                },
              };
              this.univariant = true;
            });
        }
      }
      return;
    }
    this.univariant = true;
  };

  showbackUnivariant = (result, x, y, type) => {
    const { value } = this.props;
    this.scatterData = {
      ...this.scatterData,
      [value]: {
        ...result,
      },
      [`${value}-msg`]: {
        x,
        y,
        type,
      },
    };
    this.univariant = true;
  };

  hideHistograms = e => {
    e && e.stopPropagation();
    this.histograms = false;
  };

  hideUnivariant = e => {
    e && e.stopPropagation();
    this.univariant = false;
  };

  renderCell = (value, isNA) => {
    if (isNA) return 'N/A';
    if (isNaN(+value)) return value || 'N/A';
    return formatNumber(value, 2);
  };

  render() {
    const {
      data = {},
      importance,
      colType,
      value,
      project,
      isChecked,
      handleCheck,
      lines,
      isNew,
      mapHeader,

    } = this.props;
    const {
      univariatePlots,
      histgramPlots,
      univariatePlot,
      histgramPlot,
      renameVariable,
    } = project;
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
        <div
          className={classnames(styles.tableTd, {
            [styles.notAllow]: isRaw,
          })}
          id={'Histograms' + value}
          onClick={this.showHistograms}
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
              onVisibleChange={this.hideHistograms}
              overlayClassName="popovers"
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
                  type="close-circle"
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
                    target={mapHeader[value]}
                    result={this.result[value]}
                    data={this.chartData[value]}
                  />
                </SimplePlot>
              }
            />
          ) : null}
        </div>
        <div
          className={classnames(styles.tableTd, {
            [styles.notAllow]: isRaw,
          })}
          id={'Univariant' + value}
          onClick={this.showUnivariant}
        >
          <img
            src={univariantIcon}
            className={styles.tableImage}
            alt="univariant"
          />
          {!isRaw && this.univariant ? (
            <Popover
              placement="rightTop"
              overlayClassName="popovers"
              visible={!isRaw && this.univariant}
              onVisibleChange={this.hideUnivariant}
              trigger="click"
              title={
                <Icon
                  style={{
                    float: 'right',
                    height: 23,
                    alignItems: 'center',
                    display: 'flex',
                  }}
                  onClick={this.hideUnivariant}
                  type="close-circle"
                />
              }
              content={
                <SimplePlot
                  isNew={isNew}
                  path={univariatePlots[value]}
                  getPath={univariatePlot.bind(null, value)}
                >
                  <ScatterPlot
                    type={project.problemType}
                    data={this.scatterData[value]}
                    message={this.scatterData[`${value}-msg`]}
                    colType={colType[value]}
                    renameVariable={renameVariable}
                  />
                </SimplePlot>
              }
            />
          ) : null}
        </div>
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
        <div
          className={styles.tableTd}
          title={valueType === 'Numerical' ? EN.Numerical : EN.Categorical}
        >
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
