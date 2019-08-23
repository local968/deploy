import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Hint, ProcessLoading } from 'components/Common';
import { observable, toJS } from 'mobx';
import { Popover, Icon, Modal } from 'antd';
import { formatNumber } from '../../../util';
import EN from '../../../constant/en';
import CreateNewVariables from '../../CreateNewVariable';
import Chart from '../../Charts/Chart';
import SimplifiedViewRow from './SimplifiedViewRow';

const histogramIcon =
  'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+DQo8c3ZnIHdpZHRoPSIzNHB4IiBoZWlnaHQ9IjIwcHgiIHZpZXdCb3g9IjAgMCAzNCAyMCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj4NCiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDM5LjEgKDMxNzIwKSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT4NCiAgICA8dGl0bGU+aWNvblZhcmlhYmxlSW1wb3J0YW5jZUJsdWU8L3RpdGxlPg0KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPg0KICAgIDxkZWZzPg0KICAgICAgICA8cmVjdCBpZD0icGF0aC0xIiB4PSIxLjA4NzEzMDMiIHk9IjIiIHdpZHRoPSIzLjI2MTM5MDg5IiBoZWlnaHQ9IjEzIj48L3JlY3Q+DQogICAgICAgIDxtYXNrIGlkPSJtYXNrLTIiIG1hc2tDb250ZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiBtYXNrVW5pdHM9Im9iamVjdEJvdW5kaW5nQm94IiB4PSIwIiB5PSIwIiB3aWR0aD0iMy4yNjEzOTA4OSIgaGVpZ2h0PSIxMyIgZmlsbD0id2hpdGUiPg0KICAgICAgICAgICAgPHVzZSB4bGluazpocmVmPSIjcGF0aC0xIj48L3VzZT4NCiAgICAgICAgPC9tYXNrPg0KICAgICAgICA8cmVjdCBpZD0icGF0aC0zIiB4PSI1LjQzNTY1MTQ4IiB5PSIwIiB3aWR0aD0iMy4yNjEzOTA4OSIgaGVpZ2h0PSIxNSI+PC9yZWN0Pg0KICAgICAgICA8bWFzayBpZD0ibWFzay00IiBtYXNrQ29udGVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgbWFza1VuaXRzPSJvYmplY3RCb3VuZGluZ0JveCIgeD0iMCIgeT0iMCIgd2lkdGg9IjMuMjYxMzkwODkiIGhlaWdodD0iMTUiIGZpbGw9IndoaXRlIj4NCiAgICAgICAgICAgIDx1c2UgeGxpbms6aHJlZj0iI3BhdGgtMyI+PC91c2U+DQogICAgICAgIDwvbWFzaz4NCiAgICAgICAgPHJlY3QgaWQ9InBhdGgtNSIgeD0iMTQuMTMyNjkzOCIgeT0iNSIgd2lkdGg9IjMuMjYxMzkwODkiIGhlaWdodD0iMTAiPjwvcmVjdD4NCiAgICAgICAgPG1hc2sgaWQ9Im1hc2stNiIgbWFza0NvbnRlbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIG1hc2tVbml0cz0ib2JqZWN0Qm91bmRpbmdCb3giIHg9IjAiIHk9IjAiIHdpZHRoPSIzLjI2MTM5MDg5IiBoZWlnaHQ9IjEwIiBmaWxsPSJ3aGl0ZSI+DQogICAgICAgICAgICA8dXNlIHhsaW5rOmhyZWY9IiNwYXRoLTUiPjwvdXNlPg0KICAgICAgICA8L21hc2s+DQogICAgICAgIDxyZWN0IGlkPSJwYXRoLTciIHg9IjE4LjQ4MTIxNSIgeT0iOCIgd2lkdGg9IjMuMjYxMzkwODkiIGhlaWdodD0iNyI+PC9yZWN0Pg0KICAgICAgICA8bWFzayBpZD0ibWFzay04IiBtYXNrQ29udGVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgbWFza1VuaXRzPSJvYmplY3RCb3VuZGluZ0JveCIgeD0iMCIgeT0iMCIgd2lkdGg9IjMuMjYxMzkwODkiIGhlaWdodD0iNyIgZmlsbD0id2hpdGUiPg0KICAgICAgICAgICAgPHVzZSB4bGluazpocmVmPSIjcGF0aC03Ij48L3VzZT4NCiAgICAgICAgPC9tYXNrPg0KICAgICAgICA8cmVjdCBpZD0icGF0aC05IiB4PSIyMi44Mjk3MzYyIiB5PSI4IiB3aWR0aD0iMy4yNjEzOTA4OSIgaGVpZ2h0PSI3Ij48L3JlY3Q+DQogICAgICAgIDxtYXNrIGlkPSJtYXNrLTEwIiBtYXNrQ29udGVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgbWFza1VuaXRzPSJvYmplY3RCb3VuZGluZ0JveCIgeD0iMCIgeT0iMCIgd2lkdGg9IjMuMjYxMzkwODkiIGhlaWdodD0iNyIgZmlsbD0id2hpdGUiPg0KICAgICAgICAgICAgPHVzZSB4bGluazpocmVmPSIjcGF0aC05Ij48L3VzZT4NCiAgICAgICAgPC9tYXNrPg0KICAgICAgICA8cmVjdCBpZD0icGF0aC0xMSIgeD0iMjcuMTc4MjU3NCIgeT0iMTEiIHdpZHRoPSIzLjI2MTM5MDg5IiBoZWlnaHQ9IjQiPjwvcmVjdD4NCiAgICAgICAgPG1hc2sgaWQ9Im1hc2stMTIiIG1hc2tDb250ZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiBtYXNrVW5pdHM9Im9iamVjdEJvdW5kaW5nQm94IiB4PSIwIiB5PSIwIiB3aWR0aD0iMy4yNjEzOTA4OSIgaGVpZ2h0PSI0IiBmaWxsPSJ3aGl0ZSI+DQogICAgICAgICAgICA8dXNlIHhsaW5rOmhyZWY9IiNwYXRoLTExIj48L3VzZT4NCiAgICAgICAgPC9tYXNrPg0KICAgICAgICA8cmVjdCBpZD0icGF0aC0xMyIgeD0iOS43ODQxNzI2NiIgeT0iNSIgd2lkdGg9IjMuMjYxMzkwODkiIGhlaWdodD0iMTAiPjwvcmVjdD4NCiAgICAgICAgPG1hc2sgaWQ9Im1hc2stMTQiIG1hc2tDb250ZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiBtYXNrVW5pdHM9Im9iamVjdEJvdW5kaW5nQm94IiB4PSIwIiB5PSIwIiB3aWR0aD0iMy4yNjEzOTA4OSIgaGVpZ2h0PSIxMCIgZmlsbD0id2hpdGUiPg0KICAgICAgICAgICAgPHVzZSB4bGluazpocmVmPSIjcGF0aC0xMyI+PC91c2U+DQogICAgICAgIDwvbWFzaz4NCiAgICA8L2RlZnM+DQogICAgPGcgaWQ9IjUuTW9kZWxpbmciIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPg0KICAgICAgICA8ZyBpZD0iaWNvblZhcmlhYmxlSW1wb3J0YW5jZUJsdWUiIHN0cm9rZT0iIzQ0OEVFRCI+DQogICAgICAgICAgICA8ZyBpZD0iaWNvblZhcmlhYmxlQmx1ZSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMC4wMDAwMDAsIDMuMDAwMDAwKSI+DQogICAgICAgICAgICAgICAgPHVzZSBpZD0iUmVjdGFuZ2xlIiBtYXNrPSJ1cmwoI21hc2stMikiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0iI0VGRjVGQyIgeGxpbms6aHJlZj0iI3BhdGgtMSI+PC91c2U+DQogICAgICAgICAgICAgICAgPHVzZSBpZD0iUmVjdGFuZ2xlLTIiIG1hc2s9InVybCgjbWFzay00KSIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSIjRUZGNUZDIiB4bGluazpocmVmPSIjcGF0aC0zIj48L3VzZT4NCiAgICAgICAgICAgICAgICA8dXNlIGlkPSJSZWN0YW5nbGUtMi1Db3B5LTIiIG1hc2s9InVybCgjbWFzay02KSIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSIjRUZGNUZDIiB4bGluazpocmVmPSIjcGF0aC01Ij48L3VzZT4NCiAgICAgICAgICAgICAgICA8dXNlIGlkPSJSZWN0YW5nbGUtMi1Db3B5LTMiIG1hc2s9InVybCgjbWFzay04KSIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSIjRUZGNUZDIiB4bGluazpocmVmPSIjcGF0aC03Ij48L3VzZT4NCiAgICAgICAgICAgICAgICA8dXNlIGlkPSJSZWN0YW5nbGUtMi1Db3B5LTQiIG1hc2s9InVybCgjbWFzay0xMCkiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0iI0VGRjVGQyIgeGxpbms6aHJlZj0iI3BhdGgtOSI+PC91c2U+DQogICAgICAgICAgICAgICAgPHVzZSBpZD0iUmVjdGFuZ2xlLTItQ29weS01IiBtYXNrPSJ1cmwoI21hc2stMTIpIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9IiNFRkY1RkMiIHhsaW5rOmhyZWY9IiNwYXRoLTExIj48L3VzZT4NCiAgICAgICAgICAgICAgICA8dXNlIGlkPSJSZWN0YW5nbGUtMi1Db3B5IiBtYXNrPSJ1cmwoI21hc2stMTQpIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9IiNFRkY1RkMiIHhsaW5rOmhyZWY9IiNwYXRoLTEzIj48L3VzZT4NCiAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMC41NDM1NjUxNDgsMTQuNSBMMzMuMTU3NDc0LDE0LjUiIGlkPSJMaW5lIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIj48L3BhdGg+DQogICAgICAgICAgICA8L2c+DQogICAgICAgIDwvZz4NCiAgICA8L2c+DQo8L3N2Zz4=';
interface Interface {
  project: any;
}
@observer
export default class VariableList extends Component<Interface> {
  @observable sort = -1;
  @observable showHistograms = false;
  @observable showCorrelation = false;
  @observable visible = false;
  @observable chartData = {};
  @observable CorrelationMatrixData = {};

  componentDidMount() {
    this.props.project
      .dataView()
      .then(() => this.props.project.preTrainImportance());
  }

  show = () => {
    this.showHistograms = true;
  };

  hide = e => {
    e && e.stopPropagation();
    this.showHistograms = false;
  };

  sortImportance = () => {
    this.sort = this.sort * -1;
  };

  showCorrelationMatrix = () => {
    this.showCorrelation = true;
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

  hideNewVariable = () => {
    this.visible = false;
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

  matrix(data) {
    const { project } = this.props;
    const trainHeader = toJS(project.trainHeader);
    trainHeader.map(itm => {
      const ind = data.data.header.indexOf(itm);
      data.data.header.splice(ind, 1);
      data.data.data.splice(ind, 1);
      data.data.data = data.data.data.map(it => {
        it.splice(ind, 1);
        return it;
      });
    });

    return <Chart data={data} project={project} />;
  }

  render() {
    const { project } = this.props;
    const {
      target,
      colType,
      // targetMap,
      dataViews,
      dataViewsLoading,
      preImportance,
      preImportanceLoading,
      dataHeader,
      addNewVariable2,
      newVariable,
      newType,
      newVariableViews,
      // id,
      informativesLabel,
      trainHeader,
      expression,
      customHeader,
      totalLines,
      dataViewProgress,
      importanceProgress,
      models,
      mapHeader,
      targetUnique,
    } = project;
    const targetUniques = targetUnique || NaN;
    const { graphicList: lists } = models[0];
    const graphicList = JSON.parse(JSON.stringify(lists));
    const targetData =
      colType[target] !== 'Categorical' && dataViews
        ? dataViews[target] || {}
        : {};
    const allVariables = [
      ...dataHeader.filter(h => h !== target),
      ...newVariable,
    ];
    const variableType = { ...newType, ...colType };
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
    const top1 = graphicList.shift();
    const top2 = graphicList.shift();

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
              title={newMapHeader[target]}
            >
              <span>{newMapHeader[target]}</span>
            </div>
            <div className={styles.targetCell} onClick={this.show}>
              <img src={histogramIcon} className={styles.tableImage} alt="" />
              {
                <Popover
                  placement="bottomLeft"
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
                      type="close"
                    />
                  }
                  content={
                    <Chart
                      x_name={newMapHeader[target]}
                      y_name={'count'}
                      data={top1}
                      project={project}
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
              <span>{isNaN(targetUniques) ? 'N/A' : targetUniques}</span>
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
            <Modal
              visible={this.visible}
              footer={null}
              closable={false}
              width={'65%'}
            >
              <CreateNewVariables
                onClose={this.hideNewVariable}
                addNewVariable={addNewVariable2}
                // colType={colType}
                expression={expression}
                open
              />
            </Modal>
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
                title={
                  <Icon
                    style={{
                      float: 'right',
                      height: 23,
                      alignItems: 'center',
                      display: 'flex',
                    }}
                    onClick={this.hideCorrelationMatrix}
                    type="close"
                  />
                }
                content={this.matrix(top2)}
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
              <span>{EN.UnivariantPlot}</span>
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
              <div className={styles.tableReload} onClick={this.reloadTable}>
                <span>
                  <Icon type="reload" theme="outlined" />
                </span>
              </div>
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
                  return (
                    <SimplifiedViewRow
                      mapHeader={newMapHeader}
                      chartDatas={[graphicList.shift(), graphicList.shift()]}
                      key={i}
                      value={h}
                      data={data}
                      // map={map}
                      importance={importance}
                      colType={variableType}
                      project={project}
                      isChecked={checkedVariables.includes(h)}
                      handleCheck={this.handleCheck.bind(null, h)}
                      lines={Math.min(Math.floor(totalLines * 0.95), 1000)}
                      // id={id}
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
