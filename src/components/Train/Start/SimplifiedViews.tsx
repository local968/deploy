import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Hint, ProcessLoading } from 'components/Common';
import { observable, toJS } from 'mobx';
import {
  Popover,
  Icon,
  Modal,
} from 'antd';
import EN from '../../../constant/en';
import request from 'components/Request';
import CreateNewVariables from '../../CreateNewVariable';
import SimplifiedViewRow from './SimplifiedViewRow'
import CorrelationPlot from './CorrelationPlot'
interface Interface {
  project:any
  dataHeader?:any
  colType?:any
}
@observer
export default class SimplifiedViews extends Component<Interface> {
  @observable sort = -1;
  @observable showHistograms = false;
  @observable showCorrelation = false;
  @observable visible = false;
  @observable CorrelationMatrixData = {};
  @observable weights = {};
  @observable standardType = '';

  componentDidMount() {
    return this.reloadTable();
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
    return this.reloadTable(true);
  };

  reloadTable = async (force = false) => {
    try {
      await this.props.project.dataView();
      await this.props.project.clusterPreTrainImportance(force);
      this.weights = { ...this.props.project.weightsTemp };
      this.standardType = this.props.project.standardTypeTemp;
    } catch (e) {}
  };

  handleChange = e => {
    const value = e.target.value;
    const { project } = this.props;
    const {
      dataHeader,
      customHeader,
      newVariable,
      target,
      informativesLabel,
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

  handleWeight = key => value => {
    const { project } = this.props;
    project.setProperty({
      weightsTemp: {
        ...project.weightsTemp,
        [key]: value,
      },
    });
  };

  handleType = e => {
    const { project } = this.props;
    const value = e.target.value;
    project.setProperty({
      standardTypeTemp: value,
    });
  };

  render() {
    const { project } = this.props;
    const {
      target,
      problemType,
      mapHeader = [],
      standardTypeTemp,
      colType,
      // targetMap,
      dataViews,
      weightsTemp,
      dataViewsLoading,
      informativesLabel,
      preImportance,
      preImportanceLoading,
      dataHeader,
      addNewVariable2,
      newVariable,
      newType,
      newVariableViews,
      // id,
      trainHeader,
      expression,
      customHeader,
      totalLines,
      dataViewProgress,
      importanceProgress,
    } = project;
    const allVariables = [...dataHeader, ...newVariable];
    const variableType = { ...newType, ...colType };
    const newVariableType = { ...colType };
    if (!!target) Reflect.deleteProperty(newVariableType, target);
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
    const allLabel = [...dataHeader, ...newVariable].filter(v => v !== target);
    const before = allLabel.reduce((prev, la) => {
      prev[la] = this.weights[la] || 1;
      return prev;
    }, {});
    const after = allLabel.reduce((prev, la) => {
      prev[la] = weightsTemp[la] || 1;
      return prev;
    }, {});

    const isChange =
      project.hasChanged(before, after) ||
      standardTypeTemp !== this.standardType;

    return (
      <div
        className={styles.simplified}
        style={{ zIndex: this.visible ? 3 : 1 }}
      >
        <div className={styles.chooseScan}>
          <div className={styles.chooseLabel}>
            <span>{EN.ChooseaVariableScalingMethod}:</span>
          </div>
          <div className={styles.chooseBox}>
            <input
              type="radio"
              name="scan"
              value="minMax"
              id="minMax"
              checked={standardTypeTemp === 'minMax'}
              onChange={this.handleType}
            />
            <label htmlFor="minMax">
              {EN.minmaxscale}
              <Hint content={EN.Scaleseachfeaturetothegivenrange} />
            </label>
          </div>
          <div className={styles.chooseBox}>
            <input
              type="radio"
              name="scan"
              value="standard"
              id="standard"
              checked={standardTypeTemp === 'standard'}
              onChange={this.handleType}
            />
            <label htmlFor="standard">
              {EN.standardscale}
              <Hint content={EN.Centereachfeaturetothemean} />
            </label>
          </div>
          <div className={styles.chooseBox}>
            <input
              type="radio"
              name="scan"
              value="robust"
              id="robust"
              checked={standardTypeTemp === 'robust'}
              onChange={this.handleType}
            />
            <label htmlFor="robust">
              {EN.robustscale}
              <Hint content={EN.Centereachfeaturetothemedian} />
            </label>
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
              {problemType === 'Clustering' && (
                <option value="informatives">
                  {EN.Informatives} ({informativesLabel.length})
                </option>
              )}
              {customHeader.map((v, k) => (
                <option key={k} value={k}>
                  {EN.Custom}
                  {k + 1} ({v.length})
                </option>
              ))}
              {hasNewOne && (
                <option value={customHeader.length}>
                  {EN.Custom}
                  {customHeader.length + 1} ({checkedVariables.length})
                </option>
              )}
            </select>
          </div>
          <div className={styles.newVariable}>
            <div className={styles.toolButton} onClick={this.showNewVariable}>
              <span>{EN.CreateANewVariable}</span>
            </div>
            <Modal
              visible={this.visible}
              footer={null}
              closable={false}
              width={'65%'}
            >
              <CreateNewVariables
                onClose={this.hideNewVariable}
                addNewVariable={addNewVariable2}
                colType={newVariableType}
                expression={expression}
                mapHeader={newMapHeader}
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
              <span>
                {EN.Weight}
                <Hint content={EN.Youcangivehigherweightstofeatures} />
              </span>
            </div>
            <div className={styles.tableTh}>
              <span>{EN.Histogram}</span>
            </div>
            {problemType === 'Clustering' && (
              <div
                className={classnames(styles.tableTh, styles.tableImportance)}
              >
                <div className={styles.tableSort} onClick={this.sortImportance}>
                  <span>
                    <Icon
                      type={`arrow-${this.sort === 1 ? 'up' : 'down'}`}
                      theme="outlined"
                    />
                  </span>
                </div>
                <span>{EN.Importance}</span>
                <div
                  className={styles.tableReload}
                  onClick={
                    isChange ? this.reloadTable.bind(null, true) : () => {}
                  }
                >
                  <span style={isChange ? { color: '#448eed' } : {}}>
                    <Icon type="reload" spin={isChange} />
                  </span>
                </div>
                <Hint
                  themeStyle={{ fontSize: '1rem' }}
                  content={EN.AdvancedModelingImportanceTip}
                />
              </div>
            )}
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
                  const data = { ...dataViews, ...newVariableViews }[h] || {};
                  // const map = targetMap || {};
                  const isNew = newVariable.includes(h);
                  const importance = preImportance
                    ? preImportance[h] || 0
                    : 0.01;
                  return (
                    <SimplifiedViewRow
                      key={i}
                      value={h}
                      data={data}
                      // map={map}
                      weight={(weightsTemp || {})[h]}
                      mapHeader={newMapHeader}
                      importance={importance}
                      handleWeight={this.handleWeight(h)}
                      colType={variableType}
                      project={project}
                      isChecked={checkedVariables.includes(h)}
                      handleCheck={this.handleCheck.bind(null, h)}
                      lines={Math.min(Math.floor(totalLines * 0.95), 1000)}
                      // id={id}
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


