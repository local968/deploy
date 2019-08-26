import { observer } from 'mobx-react';
import React, { useState } from 'react';
import { formatNumber } from '../../../../util';
import styles from './styles.module.css';
import histogramIcon from './histogramIcon.svg';
import { Icon, Popover } from 'antd';
import SimplifiedViewPlot from './SimplifiedViewPlot';
import univariantIcon from './univariantIcon.svg';
import ScatterPlot from './ScatterPlot';
import EN from '../../../../constant/en';
import request from 'components/Request';
import classnames from 'classnames';
import SimplePlot from './SimplePlot';

interface Interface {
  data: any;
  colType: any;
  importance: any;
  value: any;
  project: any;
  isChecked: any;
  handleCheck: any;
  id: any;
  lines: any;
  isNew: any;
  mapHeader: any;
}

const SimplifiedViewRow = observer((props: Interface) => {
  const {
    value,
    project: {
      colType,
      etlIndex,
      dataViews,
      mapHeader,
      target,
      problemType,
      histgramPlots,
      univariatePlots,
      histgramPlot,
      univariatePlot,
      renameVariable,
    },
    isNew,
    data: _data,
    lines,
    isChecked,
    handleCheck,
    importance,
  } = props;

  const [histograms, upHistograms] = useState(false);
  const [univariant, upUnivariant] = useState(false);
  const [chartData, upChartData] = useState({});
  const [result, upResult] = useState({});
  const [scatterData, upScatterData] = useState({});

  function showHistograms() {
    if (isNew) {
      return upHistograms(true);
    }
    if (!chartData[value]) {
      const data: any = {
        field: value,
        id: etlIndex,
      };
      if (colType[value] === 'Numerical') {
        const {
          max,
          min,
          std_deviation_bounds: { lower, upper },
        } = dataViews[value];
        data.interval = (Math.max(upper, max) - Math.min(lower, min)) / 100;

        request
          .post({
            url: '/graphics/histogram-numerical',
            data,
          })
          .then((result: any) =>
            showback(result.data, value, {
              min,
              max,
              interval: data.interval,
            }),
          );
      } else {
        const { uniqueValues } = dataViews[value];
        data.size = uniqueValues;
        request
          .post({
            url: '/graphics/histogram-categorical',
            data,
          })
          .then((result: any) => showback(result.data, value));
      }
    } else {
      upHistograms(true);
    }
  }

  function showback(result, value: any, message?: any) {
    upChartData({
      ...chartData,
      [value]: result,
    });
    upResult({
      ...result,
      [value]: message,
    });
    upHistograms(true);
  }

  function showbackUnivariant(result, x, y, type) {
    upScatterData({
      ...scatterData,
      [value]: {
        ...result,
      },
      [`${value}-msg`]: {
        x,
        y,
        type,
      },
    });
    upUnivariant(true);
  }

  function showUnivariant() {
    if (isNew) {
      const type = colType[value];

      upScatterData({
        ...scatterData,
        [`${value}-msg`]: {
          y: mapHeader[target],
          x: value,
          type,
        },
      });
      return upUnivariant(true);
    }

    if (!scatterData[value]) {
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
              showbackUnivariant(
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
              showbackUnivariant(
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
        const data: any = {
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
              upScatterData({
                ...scatterData,
                [value]: {
                  ...result,
                },
                [`${value}-msg`]: {
                  type,
                  x: mapHeader[value],
                },
              });
              upUnivariant(true);
            });
        } else {
          data.uniqueValues = _data.uniqueValues;
          request
            .post({
              url: '/graphics/classification-categorical',
              data,
            })
            .then(result => {
              upScatterData({
                ...scatterData,
                [value]: {
                  ...result,
                },
                [`${value}-msg`]: {
                  type,
                  x: mapHeader[value],
                },
              });
              upUnivariant(true);
            });
        }
      }
      return;
    }
    upUnivariant(true);
  }

  function renderCell(value, isNA) {
    if (isNA) return 'N/A';
    if (isNaN(+value)) return value || 'N/A';
    return formatNumber(value, 2);
  }

  const valueType =
    colType[value] === 'Numerical' ? 'Numerical' : 'Categorical';
  const isRaw = colType[value] === 'Raw';
  const unique =
    (isRaw && `${lines}+`) ||
    (valueType === 'Numerical' && 'N/A') ||
    _data.uniqueValues;

  if (!histgramPlots[value] || !univariatePlots[value]) {
    histgramPlot(value);
    univariatePlot(value);
  }

  return (
    <div className={styles.tableRow}>
      <div className={classnames(styles.tableTd, styles.tableCheck)}>
        <input type="checkbox" checked={isChecked} onChange={handleCheck} />
      </div>
      <div className={styles.tableTd} title={mapHeader[value] || value}>
        <span>{mapHeader[value] || value}</span>
      </div>
      <div
        className={classnames(styles.tableTd, {
          [styles.notAllow]: isRaw,
        })}
        id={'Histograms' + value}
        onClick={showHistograms}
      >
        <img
          src={histogramIcon}
          className={styles.tableImage}
          alt="histogram"
        />
        {!isRaw && histograms ? (
          <Popover
            placement="rightTop"
            visible={!isRaw && histograms}
            onVisibleChange={() => upHistograms(false)}
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
                onClick={() => upHistograms(false)}
                type="close"
              />
            }
            content={
              <SimplePlot isNew={isNew} path={histgramPlots[value]}>
                <SimplifiedViewPlot
                  type={colType[value]}
                  value={mapHeader[value]}
                  result={result[value]}
                  data={chartData[value]}
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
        onClick={showUnivariant}
      >
        <img
          src={univariantIcon}
          className={styles.tableImage}
          alt="univariant"
        />
        {!isRaw && univariant ? (
          <Popover
            placement="rightTop"
            overlayClassName="popovers"
            visible={!isRaw && univariant}
            onVisibleChange={() => upUnivariant(false)}
            trigger="click"
            title={
              <Icon
                style={{
                  float: 'right',
                  height: 23,
                  alignItems: 'center',
                  display: 'flex',
                }}
                onClick={() => upUnivariant(false)}
                type="close"
              />
            }
            content={
              <SimplePlot isNew={isNew} path={univariatePlots[value]}>
                <ScatterPlot
                  type={problemType}
                  data={scatterData[value]}
                  message={scatterData[`${value}-msg`]}
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
        <span>{valueType === 'Numerical' ? EN.Numerical : EN.Categorical}</span>
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
        title={renderCell(_data.mean, valueType === 'Categorical')}
      >
        <span>{renderCell(_data.mean, valueType === 'Categorical')}</span>
      </div>
      <div
        className={classnames(styles.tableTd, {
          [styles.none]: valueType === 'Categorical',
        })}
        title={renderCell(_data.std, valueType === 'Categorical')}
      >
        <span>{renderCell(_data.std, valueType === 'Categorical')}</span>
      </div>
      <div
        className={classnames(styles.tableTd, {
          [styles.none]: valueType === 'Categorical',
        })}
        title={renderCell(_data.median, valueType === 'Categorical')}
      >
        <span>{renderCell(_data.median, valueType === 'Categorical')}</span>
      </div>
      <div
        className={classnames(styles.tableTd, {
          [styles.none]: valueType === 'Categorical',
        })}
        title={renderCell(_data.min, valueType === 'Categorical')}
      >
        <span>{renderCell(_data.min, valueType === 'Categorical')}</span>
      </div>
      <div
        className={classnames(styles.tableTd, {
          [styles.none]: valueType === 'Categorical',
        })}
        title={renderCell(_data.max, valueType === 'Categorical')}
      >
        <span>{renderCell(_data.max, valueType === 'Categorical')}</span>
      </div>
    </div>
  );
});
export default SimplifiedViewRow;
