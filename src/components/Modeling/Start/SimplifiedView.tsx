import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Hint, ProcessLoading } from 'components/Common';
import { observable, toJS } from 'mobx';
import { Icon, Popover } from 'antd';
import histogramIcon from './histogramIcon.svg';
import { formatNumber } from '../../../util';
import request from 'components/Request';
import EN from '../../../constant/en';
import CreateNewVariables from '../../CreateNewVariable';
import SimplifiedViewPlot from './SimplifiedViewPlot';
import SimplifiedViewRow from './SimplifiedViewRow';
import CorrelationPlot from './CorrelationPlot';
import { Show } from '../../Common';
interface Interface {
  project: any;
}
@observer
export default class SimplifiedView extends Component<Interface> {
  @observable sort = -1;
  @observable showHistograms = false;
  @observable showCorrelation = false;
  @observable visible = true;
  @observable chartData = {};
  @observable result = {};
  @observable CorrelationMatrixData = {};

  componentDidMount() {
    this.props.project
      .dataView()
      .then(() => this.props.project.preTrainImportance());
  }

  show = () => {
    const { project = {} } = this.props;
    const { target, colType, etlIndex, rawDataView } = project;

    if (!this.chartData[target]) {
      if (colType[target] === 'Numerical') {
        const {
          max,
          min,
          std_deviation_bounds: { lower, upper },
        } = rawDataView[target];
        const interval = (Math.max(upper, max) - Math.min(lower, min)) / 100;
        request
          .post({
            url: '/graphics/histogram-numerical',
            data: {
              field: target,
              id: etlIndex,
              interval,
            },
          })
          .then(result =>
            this.showback(target, result.data, { min, max, interval }),
          );
      } else {
        const { uniqueValues } = project.dataViews[target];
        request
          .post({
            url: '/graphics/histogram-categorical',
            data: {
              field: target,
              id: etlIndex,
              size: uniqueValues > 8 ? 8 : uniqueValues,
            },
          })
          .then(result => this.showback(target, result.data));
      }
      return;
    }

    this.showHistograms = true;
  };

  showback = (target, result, message?: any) => {
    this.chartData = {
      ...this.chartData,
      [target]: result,
    };
    this.result = {
      ...this.result,
      [target]: message,
    };
    this.showHistograms = true;
  };

  hide = e => {
    e && e.stopPropagation();
    this.showHistograms = false;
  };

  sortImportance = () => {
    this.sort = this.sort * -1;
  };

  // showCorrelationMatrix = () => {
  //   this.showCorrelation = true
  // }

  showCorrelationMatrix = () => {
    const { project } = this.props;

    const colType = toJS(project.colType);
    const trainHeader = toJS(project.trainHeader);
    const dataHeader = toJS(project.dataHeader);

    const fields = Object.entries(colType)
      .filter(itm => itm[1] === 'Numerical')
      .map(itm => itm[0])
      .filter(itm => !trainHeader.includes(itm) && dataHeader.includes(itm));
    request
      .post({
        url: '/graphics/correlation-matrix',
        data: {
          fields,
          id: project.etlIndex,
        },
      })
      .then(CorrelationMatrixData => {
        this.showCorrelation = true;
        let { type } = CorrelationMatrixData;
        CorrelationMatrixData.type = type.map(itm => project.mapHeader[itm]);
        this.CorrelationMatrixData = CorrelationMatrixData;
      });
  };

  hideCorrelationMatrix = e => {
    e && e.stopPropagation();
    this.showCorrelation = false;
  };

  handleCheck = (key, e) => {
    const { trainHeader } = this.props.project;
    const isChecked = e.target.checked;
    if (isChecked) {
      this.props.project.trainHeader = trainHeader.filter(v => v !== key);
    } else {
      if (trainHeader.includes(key)) return;
      this.props.project.trainHeader = [...trainHeader, key];
    }
  };

  showNewVariable = () => {
    this.visible = true;
  };

  hideNewVariable = () => {
    this.visible = false;
    this.reloadTable();
  };

  reloadTable = () => {
    this.props.project
      .dataView()
      .then(() => this.props.project.preTrainImportance());
  };

  handleChange = e => {
    const value = e.target.value;
    const { project } = this.props;
    const {
      informativesLabel,
      dataHeader,
      customHeader,
      newVariable,
      target,
    } = project;
    let filterList = [];
    if (!value) return;
    if (value === 'all') {
      filterList = [...dataHeader, ...newVariable];
    }
    if (value === 'informatives') {
      filterList = informativesLabel;
    }
    if (!isNaN(value) && value < customHeader.length) {
      filterList = customHeader[value];
    }
    project.trainHeader = [...dataHeader, ...newVariable].filter(
      v => !filterList.includes(v) && v !== target,
    );
  };

  renderCell = (value, isNA) => {
    if (isNA) return 'N/A';
    if (isNaN(+value)) return value || 'N/A';
    return formatNumber(value, 2);
  };

  render() {
    const { project } = this.props;
    const {
      mapHeader,
      target,
      colType,
      renameVariable,
      dataViews,
      dataViewsLoading,
      preImportance,
      preImportanceLoading,
      dataHeader,
      addNewVariable2,
      newVariable,
      newType,
      newVariableViews,
      id,
      informativesLabel,
      trainHeader,
      expression,
      customHeader,
      totalLines,
      dataViewProgress,
      importanceProgress,
    } = project;
    const targetUnique = colType[target] === 'Categorical' ? 2 : 'N/A';
    const targetData =
      colType[target] !== 'Categorical' && dataViews
        ? dataViews[target] || {}
        : {};
    const allVariables = [
      ...dataHeader.filter(h => h !== target),
      ...newVariable,
    ];
    const variableType = { ...newType, ...colType };
    Reflect.deleteProperty(variableType, target);
    const newVariableType = { ...colType };
    Reflect.deleteProperty(newVariableType, target);
    const checkedVariables = allVariables.filter(v => !trainHeader.includes(v));
    const key = [allVariables, informativesLabel, ...customHeader]
      .map(v => v.sort().toString())
      .indexOf(checkedVariables.sort().toString());
    const hasNewOne = key === -1;
    const selectValue = hasNewOne
      ? customHeader.length
      : key === 0
      ? 'all'
      : key === 1
      ? 'informatives'
      : key - 2;
    const newMapHeader = {
      ...mapHeader.reduce((prev, v, k) => Object.assign(prev, { [k]: v }), {}),
      ...newVariable.reduce((prev, v) => Object.assign(prev, { [v]: v }), {}),
    };
    return (
      <div
        className={styles.simplified}
        style={{ zIndex: this.visible ? 3 : 1 }}
      >
        <div className={styles.targetTable}>
          <div className={styles.targetHead}>
            <div className={classnames(styles.targetCell, styles.targetName)}>
              <span>{EN.TargetVariable}</span>
            </div>
            <div className={styles.targetCell}>
              <span>{EN.Histogram}</span>
            </div>
            <div className={styles.targetCell}>
              <span>{EN.DataType}</span>
            </div>
            <div className={styles.targetCell}>
              <span>{EN.Mean}</span>
            </div>
            <div className={styles.targetCell}>
              <span>{EN.UniqueValue}</span>
            </div>
            <div className={styles.targetCell}>
              <span>{EN.Min}</span>
            </div>
            <div className={styles.targetCell}>
              <span>{EN.Max}</span>
            </div>
          </div>
          <div className={styles.targetRow}>
            <div
              className={classnames(styles.targetCell, styles.targetName)}
              title={mapHeader[target]}
            >
              <span>{mapHeader[target]}</span>
            </div>
            <div className={styles.targetCell} id={target} onClick={this.show}>
              <img
                src={histogramIcon}
                className={styles.tableImage}
                alt="histogram"
              />
              {
                <Popover
                  placement="bottomLeft"
                  getPopupContainer={() => document.getElementById(target)}
                  visible={this.showHistograms}
                  onVisibleChange={this.hide}
                  trigger="click"
                  title={
                    <Icon
                      style={{
                        float: 'right',
                        height: 23,
                        alignItems: 'center',
                        display: 'flex',
                      }}
                      onClick={this.hide}
                      type="close-circle"
                    />
                  }
                  content={
                    <SimplifiedViewPlot
                      type={colType[target]}
                      target={mapHeader[target]}
                      result={this.result[target]}
                      data={this.chartData[target]}
                      renameVariable={renameVariable}
                    />
                  }
                />
              }
            </div>
            <div className={styles.targetCell}>
              <span>
                {colType[target] === 'Numerical'
                  ? EN.Numerical
                  : EN.Categorical}
              </span>
            </div>
            <div
              className={classnames(styles.targetCell, {
                [styles.none]: colType[target] === 'Categorical',
              })}
              title={this.renderCell(
                targetData.mean,
                colType[target] === 'Categorical',
              )}
            >
              <span>
                {this.renderCell(
                  targetData.mean,
                  colType[target] === 'Categorical',
                )}
              </span>
            </div>
            <div
              className={classnames(styles.targetCell, {
                [styles.none]: colType[target] !== 'Categorical',
              })}
            >
              <span>{targetUnique}</span>
            </div>
            <div
              className={classnames(styles.targetCell, {
                [styles.none]: colType[target] === 'Categorical',
              })}
              title={this.renderCell(
                targetData.min,
                colType[target] === 'Categorical',
              )}
            >
              <span>
                {this.renderCell(
                  targetData.min,
                  colType[target] === 'Categorical',
                )}
              </span>
            </div>
            <div
              className={classnames(styles.targetCell, {
                [styles.none]: colType[target] === 'Categorical',
              })}
              title={this.renderCell(
                targetData.max,
                colType[target] === 'Categorical',
              )}
            >
              <span>
                {this.renderCell(
                  targetData.max,
                  colType[target] === 'Categorical',
                )}
              </span>
            </div>
          </div>
        </div>
        <div className={styles.simplifiedText}>
          <span>{EN.CreateVariableListTip}</span>
        </div>
        <div className={styles.tool}>
          <div className={styles.toolSelect}>
            <div className={styles.toolLabel}>
              <span>{EN.CurrentVariableList}</span>
            </div>
            <select value={selectValue} onChange={this.handleChange}>
              <option value="all">
                {EN.AllVariables} ({allVariables.length})
              </option>
              <option value="informatives">
                {EN.Informatives} ({informativesLabel.length})
              </option>
              {customHeader.map((v, k) => (
                <option key={k} value={k}>
                  {EN.Custom}
                  {k + 1} ({v.length})
                </option>
              ))}
              {hasNewOne && (
                <option value={customHeader.length}>
                  custom_{customHeader.length + 1} ({checkedVariables.length})
                </option>
              )}
            </select>
          </div>
          <div className={styles.newVariable}>
            <Show name="start_CreateANewVariable">
              <div className={styles.toolButton} onClick={this.showNewVariable}>
                <span>{EN.CreateANewVariable}</span>
              </div>
            </Show>
            <CreateNewVariables
              open={this.visible}
              title={EN.CreateANewVariable}
              onClose={this.hideNewVariable}
              addNewVariable={addNewVariable2}
              variables={newVariableType}
              expression={expression}
              mapHeader={newMapHeader}
            />
          </div>
          <div
            className={classnames(styles.toolButton, styles.toolCheck)}
            onClick={this.showCorrelationMatrix}
          >
            {this.showCorrelation && (
              <Popover
                placement="left"
                visible={this.showCorrelation}
                onVisibleChange={this.hideCorrelationMatrix}
                trigger="click"
                content={
                  <CorrelationPlot
                    onClose={this.hideCorrelationMatrix}
                    CorrelationMatrixData={this.CorrelationMatrixData}
                  />
                }
              />
            )}
            <span>{EN.CheckCorrelationMatrix}</span>
          </div>
        </div>
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <div className={classnames(styles.tableTh, styles.tableCheck)} />
            <div className={styles.tableTh}>
              <span>{EN.Name}</span>
            </div>
            <div className={styles.tableTh}>
              <span>{EN.Histogram}</span>
            </div>
            <div className={styles.tableTh}>
              <span>{EN.UnivariantPlots}</span>
            </div>
            <div className={classnames(styles.tableTh, styles.tableImportance)}>
              <div className={styles.tableSort} onClick={this.sortImportance}>
                <span>
                  <Icon
                    type={`arrow-${this.sort === 1 ? 'up' : 'down'}`}
                    theme="outlined"
                  />
                </span>
              </div>
              <span>{EN.Importance}</span>
              <Hint
                themeStyle={{ fontSize: '1rem' }}
                content={EN.AdvancedModelingImportanceTip}
              />
            </div>
            <div className={styles.tableTh}>
              <span>{EN.DataType}</span>
            </div>
            <div className={styles.tableTh}>
              <span>{EN.UniqueValue}</span>
            </div>
            <div className={styles.tableTh}>
              <span>{EN.Mean}</span>
            </div>
            <div className={styles.tableTh}>
              <span>{EN.STD}</span>
            </div>
            <div className={styles.tableTh}>
              <span>{EN.Median}</span>
            </div>
            <div className={styles.tableTh}>
              <span>{EN.Min}</span>
            </div>
            <div className={styles.tableTh}>
              <span>{EN.Max}</span>
            </div>
          </div>
          {dataViewsLoading || preImportanceLoading ? (
            <div className={styles.tableLoading}>
              <Icon type="loading" />
            </div>
          ) : (
            <div className={styles.tableBody}>
              {allVariables
                .sort((a, b) => {
                  return preImportance
                    ? this.sort *
                        ((preImportance[a] || 0) - (preImportance[b] || 0))
                    : 0;
                })
                .map((h, i) => {
                  if (h === target) return null;
                  const data = { ...dataViews, ...newVariableViews }[h] || {};
                  // const map = targetMap || {};
                  const importance = preImportance
                    ? preImportance[h] || 0
                    : 0.01;
                  const isNew = newVariable.includes(h);
                  return (
                    <SimplifiedViewRow
                      key={i}
                      value={h}
                      data={data}
                      // map={map}
                      importance={importance}
                      mapHeader={newMapHeader}
                      colType={variableType}
                      project={project}
                      isChecked={checkedVariables.includes(h)}
                      handleCheck={this.handleCheck.bind(null, h)}
                      lines={Math.min(Math.floor(totalLines * 0.95), 1000)}
                      id={id}
                      isNew={isNew}
                    />
                  );
                })}
            </div>
          )}
        </div>
        {(dataViewsLoading || preImportanceLoading) && (
          <ProcessLoading
            progress={
              dataViewsLoading
                ? dataViewProgress / 2
                : importanceProgress / 2 + 50
            }
            style={{ bottom: '0.25em' }}
          />
        )}
      </div>
    );
  }
}
