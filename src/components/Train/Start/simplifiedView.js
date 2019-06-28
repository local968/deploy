import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Hint, ProcessLoading } from 'components/Common';
import { observable, toJS } from 'mobx';
import { Popover, message as antdMessage, Icon, Table, InputNumber, Modal } from 'antd';
import histogramIcon from './histogramIcon.svg';
import FUNCTIONS from './functions';
import { formatNumber } from 'util'
import EN from '../../../constant/en';
import request from 'components/Request'
import CreateNewVariables from '../../CreateNewVariable'
import {
  HS,
  HistogramCategorical,
  CorrelationMatrixs,
} from '../../Charts';

@observer
export default class SimplifiedView extends Component {
  @observable sort = -1
  @observable showHistograms = false
  @observable showCorrelation = false
  @observable visible = false;
  @observable CorrelationMatrixData = {};


  componentDidMount() {
    this.props.project.dataView().then(() => {
      this.props.project.clusterPreTrainImportance()
    })
  }

  componentDidMount() {
    this.props.project.dataView().then(() => {
      this.props.project.clusterPreTrainImportance()
    })
  }

  getCorrelationMatrix = () => {
    this.props.project.correlationMatrix()
  }

  show = () => {
    this.showHistograms = true
  }

  hide = e => {
    e && e.stopPropagation();
    this.showHistograms = false
  }

  sortImportance = () => {
    this.sort = this.sort * -1
  }

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
      .filter(itm => !trainHeader.includes(itm)&&dataHeader.includes(itm));
    request.post({
      url: '/graphics/correlation-matrix',
      data: {
        fields,
        id: project.etlIndex,
      },
    }).then((CorrelationMatrixData) => {
      this.showCorrelation = true;
      let { type } = CorrelationMatrixData;
      CorrelationMatrixData.type = type.map(itm => project.mapHeader[itm]);
      this.CorrelationMatrixData = CorrelationMatrixData;
    });
  };

  hideCorrelationMatrix = e => {
    e && e.stopPropagation();
    this.showCorrelation = false
  }

  handleCheck = (key, e) => {
    const { trainHeader } = this.props.project
    const isChecked = e.target.checked
    if (isChecked) {
      this.props.project.trainHeader = trainHeader.filter(v => v !== key)
    } else {
      if (trainHeader.includes(key)) return
      this.props.project.trainHeader = [...trainHeader, key]
    }
  }

  showNewVariable = () => {
    this.visible = true
  }

  hideNewVariable = () => {
    this.visible = false
    this.reloadTable()
  }

  reloadTable = () => {
    this.props.project.dataView().then(() => {
      this.props.project.clusterPreTrainImportance()
    })
  };

  handleChange = e => {
    const value = e.target.value
    const { project } = this.props
    const { dataHeader, customHeader, newVariable, target, informativesLabel } = project
    let filterList = []
    if (!value) return
    if (value === 'all') {
      filterList = [...dataHeader, ...newVariable]
    }
    if (value === 'informatives') {
      filterList = informativesLabel
    }
    if (!isNaN(value) && value < customHeader.length) {
      filterList = customHeader[value]
    }
    project.trainHeader = [...dataHeader, ...newVariable].filter(v => !filterList.includes(v) && v !== target)
  }

  handleWeight = key => value => {
    const { project } = this.props
    project.setProperty({
      weightsTemp: {
        ...project.weightsTemp,
        [key]: value
      }
    })
  }

  renderCell = (value, isNA) => {
    if (isNA) return 'N/A'
    if (isNaN(+(value))) return value || 'N/A'
    return formatNumber(value, 2)
  }

  handleType = (e) => {
    const { project } = this.props
    const value = e.target.value;
    project.setProperty({
      standardTypeTemp: value
    })
  }

  render() {
    const { project } = this.props;
    const { problemType, mapHeader = [], standardTypeTemp, colType, targetMap, dataViews, weightsTemp, dataViewsLoading, informativesLabel, preImportance, preImportanceLoading, histgramPlots, dataHeader, addNewVariable2, newVariable, newType, newVariableViews, id, trainHeader, expression, customHeader, totalLines, dataViewProgress, importanceProgress } = project;
    const allVariables = [...dataHeader, ...newVariable]
    const variableType = { ...newType, ...colType }
    const checkedVariables = allVariables.filter(v => !trainHeader.includes(v))
    const key = [allVariables, informativesLabel, ...customHeader].map(v => v.sort().toString()).indexOf(checkedVariables.sort().toString())
    const hasNewOne = key === -1
    const selectValue = hasNewOne ? customHeader.length : (key === 0 ? 'all' : (key === 1 ? 'informatives' : key - 2))
    const newMapHeader = { ...mapHeader.reduce((prev, v, k) => Object.assign(prev, { [k]: v }), {}), ...newVariable.reduce((prev, v) => Object.assign(prev, { [v]: v }), {}) }
    return <div className={styles.simplified} style={{ zIndex: this.visible ? 3 : 1 }}>
      <div className={styles.chooseScan}>
        <div className={styles.chooseLabel}><span>{EN.ChooseaVariableScalingMethod}:</span></div>
        <div className={styles.chooseBox}>
          <input type='radio' name='scan' value='minMax' id='minMax' checked={standardTypeTemp === 'minMax'}
            onChange={this.handleType} />
          <label htmlFor='minMax'>{EN.minmaxscale}<Hint content={EN.Scaleseachfeaturetothegivenrange} /></label>
        </div>
        <div className={styles.chooseBox}>
          <input type='radio' name='scan' value='standard' id='standard' checked={standardTypeTemp === 'standard'}
            onChange={this.handleType} />
          <label htmlFor='standard'>{EN.standardscale}<Hint content={EN.Centereachfeaturetothemean} /></label>
        </div>
        <div className={styles.chooseBox}>
          <input type='radio' name='scan' value='robust' id='robust' checked={standardTypeTemp === 'robust'}
            onChange={this.handleType} />
          <label htmlFor='robust'>{EN.robustscale}<Hint content={EN.Centereachfeaturetothemedian} /></label>
        </div>
      </div>
      <div className={styles.simplifiedText}><span>{EN.CreateVariableListTip}</span></div>
      <div className={styles.tool}>
        <div className={styles.toolSelect}>
          <div className={styles.toolLabel}><span>{EN.CurrentVariableList}</span></div>
          <select value={selectValue} onChange={this.handleChange}>
            <option value='all'>{EN.AllVariables} ({allVariables.length})</option>
            {problemType === 'Clustering' && <option value='informatives'>{EN.Informatives} ({informativesLabel.length})</option>}
            {customHeader.map((v, k) => <option key={k} value={k}>{EN.Custom}{k + 1} ({v.length})</option>)}
            {hasNewOne && <option
              value={customHeader.length}>{EN.Custom}{customHeader.length + 1} ({checkedVariables.length})</option>}
          </select>
        </div>
        <div className={styles.newVariable}>
          <div className={styles.toolButton} onClick={this.showNewVariable}>
            <span>{EN.CreateANewVariable}</span>
          </div>
          <Modal visible={this.visible} footer={null} closable={false} width={'65%'}>
            <CreateNewVariables onClose={this.hideNewVariable}
              addNewVariable={addNewVariable2} colType={colType} expression={expression} mapHeader={newMapHeader} />
          </Modal>
        </div>
        <div className={classnames(styles.toolButton, styles.toolCheck)} onClick={this.showCorrelationMatrix}>
          {this.showCorrelation && <Popover placement='left'
            visible={this.showCorrelation}
            onVisibleChange={this.hideCorrelationMatrix}
            trigger="click"
            content={<CorrelationPlot onClose={this.hideCorrelationMatrix}
              CorrelationMatrixData={this.CorrelationMatrixData}
            />} />}
          <span>{EN.CheckCorrelationMatrix}</span>
        </div>
      </div>
      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <div className={classnames(styles.tableTh, styles.tableCheck)} />
          <div className={styles.tableTh}><span>{EN.Name}</span></div>
          <div className={styles.tableTh}><span>{EN.Weight}<Hint content={EN.Youcangivehigherweightstofeatures} /></span></div>
          <div className={styles.tableTh}><span>{EN.Histogram}</span></div>
          {problemType === 'Clustering' && <div className={classnames(styles.tableTh, styles.tableImportance)}>
            <div className={styles.tableSort} onClick={this.sortImportance}><span><Icon
              type={`arrow-${this.sort === 1 ? 'up' : 'down'}`} theme="outlined" /></span></div>
            <span>{EN.Importance}</span>
            <div className={styles.tableReload} onClick={this.reloadTable}><span><Icon type="reload" /></span></div>
            <Hint themeStyle={{ fontSize: '1rem' }} content={EN.AdvancedModelingImportanceTip} />
          </div>}
          <div className={styles.tableTh}><span>{EN.DataType}</span></div>
          <div className={styles.tableTh}><span>{EN.UniqueValue}</span></div>
          <div className={styles.tableTh}><span>{EN.Mean}</span></div>
          <div className={styles.tableTh}><span>{EN.STD}</span></div>
          <div className={styles.tableTh}><span>{EN.Median}</span></div>
          <div className={styles.tableTh}><span>{EN.Min}</span></div>
          <div className={styles.tableTh}><span>{EN.Max}</span></div>
        </div>
        {(dataViewsLoading || preImportanceLoading) ?
          <div className={styles.tableLoading}>
            <Icon type="loading" />
          </div> :
          <div className={styles.tableBody}>
            {allVariables.sort((a, b) => {
              return preImportance ? this.sort * ((preImportance[a] || 0) - (preImportance[b] || 0)) : 0
            }).map((h, i) => {
              const data = { ...dataViews, ...newVariableViews }[h] || {}
              const map = targetMap || {};
              const isNew = newVariable.includes(h)
              const importance = preImportance ? (preImportance[h] || 0) : 0.01;
              return <SimplifiedViewRow key={i} value={h} data={data} map={map} weight={(weightsTemp || {})[h]} mapHeader={newMapHeader} importance={importance}
                handleWeight={this.handleWeight(h)} colType={variableType} project={project}
                isChecked={checkedVariables.includes(h)}
                handleCheck={this.handleCheck.bind(null, h)}
                lines={Math.min(Math.floor(totalLines * 0.95), 1000)} id={id} isNew={isNew} />
            })}
          </div>}
      </div>
      {(dataViewsLoading || preImportanceLoading) &&
        <ProcessLoading progress={dataViewsLoading ? (dataViewProgress / 2) : (importanceProgress / 2 + 50)}
          style={{ bottom: '0.25em' }} />}
    </div>
  }
}

@observer
class SimplifiedViewRow extends Component {
  @observable histograms = false;
  @observable univariant = false;
  @observable chartData = {};
  @observable result = {};

  showHistograms = () => {
    const { value, project, isNew } = this.props;
    const { stats } = project;
    if (isNew) {
      // const newUrl = histgramPlots[value]
      this.histograms = true
      // newUrl do something
      return;
    }
    // this.histograms = true
    if (!this.chartData[value]) {
      const data = {
        field: value,
        id: project.etlIndex,
      };
      if (project.colType[value] === "Numerical") {
        // const { min, max } = project.dataViews[value];
        // data.interval = (max - min) / 100;
        const { max, min, std_deviation_bounds: { lower, upper } } = stats[value].originalStats;
        data.interval = (Math.max(upper, max) - Math.min(lower, min)) / 100;
        request.post({
          url: '/graphics/histogram-numerical',
          data,
        }).then((result) => this.showback(result.data, value, { min, max, interval: data.interval }));
      } else {
        // console.log(project.dataViews[value])
        const { uniqueValues } = project.dataViews[value];
        data.size = uniqueValues > 8 ? 8 : uniqueValues;
        request.post({
          url: '/graphics/histogram-categorical',
          data,
        }).then((result) => this.showback(result.data, value));
      }
    } else {
      this.histograms = true;
    }

  };
  showback = (result, value, message) => {
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
    this.histograms = false
  }

  renderCell = (value, isNA) => {
    if (isNA) return 'N/A'
    if (isNaN(+(value))) return value || 'N/A'
    return formatNumber(value, 2)
  }

  render() {
    const { data, colType, weight, value, project, isChecked, handleCheck, id, lines, handleWeight, isNew, mapHeader, importance } = this.props;
    const { histgramPlots, histgramPlot, problemType } = project
    const valueType = colType[value] === 'Numerical' ? 'Numerical' : 'Categorical'
    const isRaw = colType[value] === 'Raw'
    const unique = (isRaw && `${lines}+`) || (valueType === 'Numerical' && 'N/A') || data.uniqueValues
    return <div className={styles.tableRow}>
      <div className={classnames(styles.tableTd, styles.tableCheck)}><input type='checkbox' checked={isChecked}
        onChange={handleCheck} /></div>
      <div className={styles.tableTd} title={mapHeader[value]}><span>{mapHeader[value]}</span></div>
      <div className={styles.tableTd} style={{ borderColor: 'transparent' }}>
        <InputNumber value={weight || 1} max={99.9} min={0.1} step={0.1} precision={1} onChange={handleWeight} />
      </div>
      <div className={classnames(styles.tableTd, {
        [styles.notAllow]: isRaw
      })}
        id={'Histograms' + value}
        onClick={this.showHistograms.bind(this, value)}>
        <img src={histogramIcon} className={styles.tableImage} alt='histogram' />
        {(!isRaw && this.histograms) ? <Popover placement='rightTop'
          visible={!isRaw && this.histograms}
          overlayClassName='popovers'
          onVisibleChange={this.hideHistograms}
          trigger="click"
          content={<SimplePlot isNew={isNew} path={histgramPlots[value]} getPath={histgramPlot.bind(null, value)}>
            <SimplifiedViewPlot onClose={this.hide}
              type={colType[value]}
              value={mapHeader[value]}
              result={this.result[value]}
              data={this.chartData[value]} />
          </SimplePlot>} /> : null}
      </div>
      {problemType === 'Clustering' && <div className={classnames(styles.tableTd, styles.tableImportance)}>
        <div className={styles.preImpotance}>
          <div className={styles.preImpotanceActive} style={{ width: (importance * 100) + '%' }} />
        </div>
      </div>}
      <div className={styles.tableTd} title={valueType}>
        <span>{valueType === 'Numerical' ? EN.Numerical : EN.Categorical}</span></div>
      <div className={classnames(styles.tableTd, {
        [styles.none]: valueType !== 'Categorical'
      })} title={unique}><span>{unique}</span></div>
      <div className={classnames(styles.tableTd, {
        [styles.none]: valueType === 'Categorical'
      })} title={this.renderCell(data.mean, valueType === 'Categorical')}>
        <span>{this.renderCell(data.mean, valueType === 'Categorical')}</span>
      </div>
      <div className={classnames(styles.tableTd, {
        [styles.none]: valueType === 'Categorical'
      })} title={this.renderCell(data.std, valueType === 'Categorical')}>
        <span>{this.renderCell(data.std, valueType === 'Categorical')}</span>
      </div>
      <div className={classnames(styles.tableTd, {
        [styles.none]: valueType === 'Categorical'
      })} title={this.renderCell(data.median, valueType === 'Categorical')}>
        <span>{this.renderCell(data.median, valueType === 'Categorical')}</span>
      </div>
      <div className={classnames(styles.tableTd, {
        [styles.none]: valueType === 'Categorical'
      })} title={this.renderCell(data.min, valueType === 'Categorical')}>
        <span>{this.renderCell(data.min, valueType === 'Categorical')}</span>
      </div>
      <div className={classnames(styles.tableTd, {
        [styles.none]: valueType === 'Categorical'
      })} title={this.renderCell(data.max, valueType === 'Categorical')}>
        <span>{this.renderCell(data.max, valueType === 'Categorical')}</span>
      </div>
    </div>
  }
}

@observer
class SimplePlot extends Component {
  @observable visible = false;
  @observable result = {};
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.getData()
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.path !== this.props.path) {
      this.getData(nextProps)
    }
  }

  getData(props = this.props) {
    const { getPath, path, isNew } = props;
    if (isNew && !path) getPath();
    if (!isNew) {
      return this.visible = true;
    }
    if (isNew && path) {
      request.post({
        url: '/graphics/new',
        data: {
          url: path,
        }
      }).then((res) => {
        this.result = res;
        this.visible = true;
      })
    }
  }

  render() {
    const { children, path, isNew } = this.props;
    if (!this.visible) return null;
    if (!isNew) {
      return children
    }
    const cloneEl = el => React.cloneElement(el, { ...this.result });
    return Array.isArray(children) ? children.map(cloneEl) : cloneEl(children)
  }
}

// @observer
// class CorrelationPlot extends Component {
//   constructor(props) {
//     super(props)
//     if (!props.fetch) props.getPath()
//   }
//   render() {
//     const { data, header, onClose } = this.props;
//     return (
//       <div className={styles.correlationPlot} >
//         <div onClick={onClose} className={styles.plotClose}><span>X</span></div>
//         {data ? <CorrelationMatrix header={header} data={data} /> : <div className={styles.plotLoad}><Spin size="large" /></div>}
//       </div>
//     )
//   }
// }

@observer
class CorrelationPlot extends Component {
  render() {
    const { onClose, CorrelationMatrixData } = this.props;
    const { type, value } = CorrelationMatrixData;
    return (
      <div className={styles.correlationPlot}>
        <div
          onClick={onClose}
          style={{ zIndex: 5 }}
          className={styles.plotClose}><span>X</span></div>
        <CorrelationMatrixs
          value={value}
          type={type}
        />
      </div>
    )
  }
}

@observer
class SimplifiedViewPlot extends Component {

  render() {
    const { type, style, data, value, result } = this.props;
    if (type === 'Raw') return null;
    if (type === 'Numerical') {
      return <div className={styles.plot} style={{
        width: 600,
        height: 500,
        flexDirection: 'column',
      }}>
        {/*<div onClick={onClose} className={styles.plotClose}><span>X</span></div>*/}
        <HS
          x_name={value}
          y_name={'count'}
          title={`Feature:${value}`}
          data={data}
          result={result}
        />
      </div>
    }
    return <div className={styles.plot} style={style}>
      {/*<div onClick={onClose} className={styles.plotClose}><span>X</span></div>*/}
      <HistogramCategorical
        x_name={value}
        y_name={'count'}
        title={`Feature:${value}`}
        data={data}
      />
    </div>
  }
}

@observer
class CreateNewVariable extends Component {
  constructor(props) {
    super(props)
    this.fxRef = React.createRef();
  }

  @observable hintStatus = false
  @observable hints = []
  @observable exp = ''
  @observable name = ''
  @observable showFunction = {}
  @observable active = 0
  //光标结束位置
  @observable inputPosition = 0
  @observable myFunction = {}
  @observable loading = false
  @observable isIn = false
  @observable showTips = false

  hideHint = () => {
    this.hintStatus = false
    this.showTips = false
    this.showFunction = {}
    this.active = 0
    this.hints = []
    document.onmousedown = () => {
    }
  }

  handleChange = e => {
    this.exp = e.target.value
  }

  changeHints = () => {
    const startIndex = this.getStartIndex()
    const functionStr = this.exp.slice(0, startIndex)
    const functionList = [...FUNCTIONS.base, ...FUNCTIONS.senior]
    const hasFunction = functionList.find(v => functionStr.includes(v.value.slice(0, -1)))
    const hasConcat = functionList.filter(v => functionStr.includes(v.value.slice(0, -1))).find(v => v.value === "Concat()")
    this.myFunction = [...FUNCTIONS.senior].reverse().find(v => functionStr.includes(v.value.slice(0, -1))) || {}
    let exp = this.exp.slice(startIndex, this.inputPosition).trim()
    const { dataHeader, colType } = this.props
    let valueList = [...dataHeader]
    if (!hasConcat) valueList = valueList.filter(v => colType[v] === "Numerical")
    let filterFunctions = []
    if (exp.startsWith("@")) {
      exp = exp.slice(1).trim()
      if (!exp) return this.hints = valueList.map(v => {
        return {
          label: v,
          value: "@" + v
        }
      })
    } else {
      filterFunctions = [...FUNCTIONS.base]
      if (!hasFunction) filterFunctions = FUNCTIONS.senior.filter(v => v.value.toLowerCase().includes(exp.toLowerCase())).concat(filterFunctions)
    }
    const filterValues = valueList.filter(_v => _v.includes(exp.toLowerCase())).map(item => {
      return {
        label: item,
        value: "@" + item
      }
    })
    this.hints = [...filterFunctions, ...filterValues]
    this.showFunction = !this.hints.length ? {} : this.hints[0]
    return
  }

  getStartIndex = () => {
    const exp = this.exp.slice(0, this.inputPosition)
    let start = exp.length
    const endStr = ["+", "-", "*", "/", "(", ","]
    for (; start > 0; start--) {
      if (endStr.includes(exp[start])) {
        start++
        break
      }
    }
    return start
  }

  handleSelect = (value, isFunciton) => {
    // this.exp = value
    const startIndex = this.getStartIndex()
    this.exp = this.exp.slice(0, startIndex) + value + this.exp.slice(this.inputPosition)
    this.fxRef.current.focus()
    setTimeout(() => {
      this.inputPosition = (this.exp.slice(0, startIndex) + value).length + (isFunciton ? -1 : 0)
      this.fxRef.current.setSelectionRange(this.inputPosition, this.inputPosition)
    }, 0);

    window.ref = this.fxRef.current
  }

  onKeyDown = e => {
    // enter
    if (e.keyCode === 13) {
      if (!this.hints.length) return
      const selectValue = this.hints[this.active]
      if (!selectValue) return
      this.handleSelect(selectValue.value, !!selectValue.syntax)
      return
    }
    // up
    if (e.keyCode === 38) {
      e.preventDefault()
      if (this.active === 0) return
      this.active--
      this.showFunction = this.hints[this.active]
    }
    // down
    if (e.keyCode === 40) {
      e.preventDefault()
      if (this.active === this.hints.length - 1) return
      this.active++
      this.showFunction = this.hints[this.active]
    }
  }

  onSelect = () => {
    this.inputPosition = this.fxRef.current.selectionEnd
    this.changeHints()
    this.hintStatus = true
    this.isIn = true
    document.onmousedown = e => {
      let dom = e.target;
      let isIn = false
      while (dom) {
        if (dom.className === styles.newVariableFx) {
          isIn = true;
          break
        }
        dom = dom.parentNode
      }
      if (!isIn) this.hideHint()
      this.isIn = isIn
    }
  }

  showSyntax = n => {
    this.active = n
    this.showFunction = this.hints[this.active]
    this.showTips = false
  }

  //点击确认按钮
  handleAdd = () => {
    let { name, exp, props: { expression } } = this
    name = name.trim()
    if (!name) return antdMessage.error(EN.Nameisempty)
    if (expression.hasOwnProperty(name)) return antdMessage.error(`${EN.Newvariable} ${name} ${EN.Isexist}`)
    if (name.includes("_")) return antdMessage.error(EN.Namecannotcontain)
    const checked = this.checkExp(exp)
    if (!checked.isPass) return antdMessage.error(checked.message)
    if (!checked.num) return antdMessage.error(EN.Expressionisempty)
    const { num, type } = checked
    const nameArray = []
    if (num === 1) {
      nameArray.push("r2_" + name)
    } else {
      for (let n = 0; n < num; n++) {
        nameArray.push(`r2_${name}_${n + 1}`)
      }
    }
    this.loading = true
    this.props.addNewVariable(name, nameArray, exp, type).then(result => {
      this.loading = false
      if (!result) return
      this.props.onClose()
      this.name = ''
      this.exp = ''
      this.myFunction = {}
      this.hideHint()
    })
  }

  // 转化括号
  formatBracket = _expression => {
    let expression = _expression
    const bracketExps = []
    let num = 0

    while (true) {
      // 查询第一个)
      const end = expression.indexOf(")") + 1
      if (end === 0) break;
      if (num > 9) return { isPass: false, message: EN.Toomanyfunctions }
      // 查询截取表达式最后一个(
      const start = expression.lastIndexOf("(", end)
      if (start === -1) return { isPass: false, message: EN.Unexpectedtoken }
      const exp = expression.slice(start + 1, end - 1)
      bracketExps.push(exp)
      //转化(...)为$?
      expression = expression.slice(0, start) + "$" + num + expression.slice(end)
      num++
    }

    return {
      expression,
      bracketExps
    }
  }

  // 校验基本表达式
  checkSimpleExp = (expression, bracketExps) => {
    if (!expression) return { isPass: false, message: EN.Emptyexpression }
    const baseOptReg = new RegExp(/[+\-*/]/)
    // 根据+-*/切割表达式
    const array = expression.split(baseOptReg)
    let num = 1
    let isVariable = false
    let expType = ''
    const typeArray = []
    for (let item of array) {
      //Categorical
      let type = 'Numerical'
      item = item.trim()
      if (!item) return { isPass: false, message: EN.Errorexpression }
      //判断是否是数字
      if (isNaN(item)) {
        // 判断是否含有转化的()表达式
        if (item.includes("$")) {
          const index = item.indexOf("$")
          // 截取函数名称
          const functionName = item.slice(0, index).trim()
          let bracketNum = item.slice(index + 1, index + 2).trim()
          if (!bracketNum || isNaN(bracketNum)) return { isPass: false, message: EN.Errorexpression }
          try {
            bracketNum = parseInt(bracketNum, 10)
          } catch (e) {
            return { isPass: false, message: EN.Errorexpression }
          }
          const other = item.slice(index + 2).trim()
          if (other) return { isPass: false, message: `${EN.Unexpectedidentifier} ${other}` }
          // 校验参数
          const fnResult = this.checkParams(functionName, bracketExps, bracketNum)
          if (!fnResult.isPass) return fnResult
          num += fnResult.num - 1
          isVariable = fnResult.isVariable
          type = fnResult.type
        }
        // 判断是否为选择的参数
        if (item.startsWith("@")) {
          item = item.slice(1)
          const { dataHeader, colType } = this.props
          if (!item || !dataHeader.includes(item)) return { isPass: false, message: `${EN.Unknownvariable} ${item}` }
          isVariable = true
          type = colType[item] === 'Numerical' ? 'Numerical' : 'Categorical'
        }
      }
      typeArray.push(type)
    }
    if (typeArray.length > 1) {
      const index = typeArray.indexOf('Categorical')
      if (index !== -1) return { isPass: false, message: `${EN.Errorexpression}: ${array[index]}` }
      expType = 'Numerical'
    } else {
      expType = typeArray[0]
    }
    return { isPass: true, message: EN.OK, num, isVariable, type: expType }
  }

  // 校验表达式参数
  checkParams = (functionName, bracketExps, bracketNum) => {
    const exps = bracketExps[bracketNum]
    if (!exps) return { isPass: false, message: EN.Emptyparameter }
    // 根据, 分割参数
    const expArray = exps.split(",")
    // 不是函数, 则参数只能为1个
    if (!functionName && expArray.length > 1) return { isPass: false, message: `${EN.Unexpectedidentifier} ${exps}` }
    const isBaseFn = FUNCTIONS.base.find(fn => fn.value === functionName + "()")
    const isSeniorFn = FUNCTIONS.senior.find(fn => fn.value === functionName + "()")
    const currentFn = isBaseFn || isSeniorFn
    // 判断函数参数个数限制
    if (currentFn.params && currentFn.params !== expArray.length) return {
      isPass: false,
      message: `${EN.Function} ${functionName} must have ${currentFn.params} params`
    }
    let numOfParam = 0
    let isVariable1 = false
    let num = 1
    let fnType = ''
    const params = []

    for (const exp of expArray) {
      // 校验表达式
      const expChecked = this.checkSimpleExp(exp.trim(), bracketExps)
      if (!expChecked.isPass) return expChecked
      const { isVariable, num, type } = expChecked
      if (isVariable) numOfParam++
      // 报存参数类型
      params.push({
        isVariable,
        num,
        exp,
        type
      })
    }

    if (isSeniorFn) {
      // 校验高级函数参数
      const seniorResult = this.checkSeniorParams(currentFn, params, numOfParam)
      if (!seniorResult.isPass) return seniorResult
      isVariable1 = true
      num += seniorResult.num - 1
      fnType = seniorResult.type
    } else if (isBaseFn) {
      // 校验一般函数参数
      if (currentFn.value === 'eq()') {
        fnType = 'Categorical'
      } else {
        fnType = 'Numerical'
      }
    } else {
      // 校验非函数参数
      for (let param of params) {
        if (param.type !== 'Numerical') return { isPass: false, message: EN.ParametersmustbeNumerical }
      }
      fnType = 'Numerical'
    }
    for (let param of params) {
      num += param.num - 1
      isVariable1 = isVariable1 || param.isVariable
    }
    return { isPass: true, message: `ok`, num, isVariable: isVariable1, type: fnType }
  }

  // 校验高级表达式参数
  checkSeniorParams = (senior, params, numOfParam) => {
    let num = 0
    let type = ''

    // 截取列名参数
    const paramList = params.slice(0, numOfParam)
    if (senior.value !== 'Concat()') {
      for (let param of paramList) {
        if (param.type !== 'Numerical') return {
          isPass: false,
          message: `${EN.Function} ${senior.value.slice(0, -2)} ${EN.ParametersmustbeNumerical}`
        }
      }
    }
    // 截取非列名参数
    const numList = params.slice(numOfParam)
    switch (senior.value) {
      case "Concat()":
        type = 'Categorical'
        if (numOfParam < 1) return {
          isPass: false,
          message: `${EN.Function}: ${senior.value.slice(0, -2)} ${EN.Parameterserror}`
        }
        const concatResults = numList.map(num => {
          let n = num.exp
          if (isNaN(n) || n.includes(".")) return { isPass: false, message: `${n} ${EN.Mustbeinteger}` }
          try {
            n = parseInt(n, 10)
          } catch (e) {
            return { isPass: false, message: `${n} ${EN.Mustbeinteger}` }
          }
          if (n < 2) return { isPass: false, message: `${n} ${EN.Mustgreaterthan} 1` }
          if (n > numOfParam) return { isPass: false, message: `${n} ${EN.Mustlessthan} ${numOfParam + 1}` }
          return {
            isPass: true,
            message: EN.OK,
            num: this.factorial(numOfParam) / this.factorial(n) / this.factorial(numOfParam - n)
          }
        })
        for (let numResult of concatResults) {
          if (!numResult.isPass) return numResult
          num += numResult.num
        }
        break;
      case "Diff()":
        type = 'Numerical'
        const diffResults = numList.map(num => {
          let n = num.exp
          if (isNaN(n) || n.includes(".")) return { isPass: false, message: `${n} ${EN.Mustbeinteger}` }
          try {
            n = parseInt(n, 10)
          } catch (e) {
            return { isPass: false, message: `${n} ${EN.Mustbeinteger}` }
          }
          return { isPass: true, message: EN.OK, num: numOfParam }
        })
        for (let numResult of diffResults) {
          if (!numResult.isPass) return numResult
          num += numResult.num
        }
        break;
      case "Accumulate()":
        type = 'Numerical'
        num = numOfParam
        break;
      case "Quantile_bin()":
        type = 'Categorical'
        const quantileBinArray = ["0", "1"]
        const [b, type1, type2] = numList
        if (isNaN(b.exp) || b.exp.includes(".")) return { isPass: false, message: `${b.exp} ${EN.Mustbeinteger}` }
        if (!quantileBinArray.includes(type1.exp.trim())) return {
          isPass: false,
          message: `${type1.exp} ${EN.Isnotsupported}`
        }
        if (type2 && !quantileBinArray.includes(type2.exp.trim())) return {
          isPass: false,
          message: `${type2.exp} ${EN.Isnotsupported}`
        }
        num = numOfParam * (type2 ? 2 : 1)
        break;
      case "Custom_Quantile_bin()":
        type = 'Categorical'
        const numResults = numList.map(num => {
          let n = num.exp
          const str = n.trim()
          const first = str.slice(0, 1)
          const last = str.slice(-1)
          if (first !== "[" || last !== "]") return { isPass: false, message: `${EN.Unexpectedidentifier} ${n}` }
          const array = str.slice(1, -1).split("|")
          for (let item of array) {
            if (!item || isNaN(item.trim())) return { isPass: false, message: `${item} ${EN.Mustbenumbe}` }
          }
          return { isPass: true, message: EN.OK, num: 1 }
        })
        for (let numResult of numResults) {
          if (!numResult.isPass) return numResult
          num += numResult.num
        }
        break;
      default:
        break;
    }
    if (num < 1) return { isPass: false, message: `${EN.Function}: ${senior.value.slice(0, -2)} ${EN.Parameterserror}` }
    return { isPass: true, message: EN.OK, num, type }
  }

  // 校验总表达式
  checkExp = _expression => {
    if (!_expression) return { isPass: true, message: EN.OK, num: 0 }
    if (_expression.includes("$")) return { isPass: false, message: EN.Unexpectedtoken$ }

    const { bracketExps, expression } = this.formatBracket(_expression)
    const { isPass, message, num, type } = this.checkSimpleExp(expression, bracketExps)
    return { isPass, message, num, type }
  }

  // 计算阶乘
  factorial = (n) => {
    if (n < 2) return 1
    return n * this.factorial(n - 1)
  }

  handleNameChange = e => {
    const value = e.target.value.trim()
    this.name = value
  }

  deleteFx = () => {
    this.exp = ''
    this.fxRef.current.focus()
  }

  showAll = () => {
    const isSenior = FUNCTIONS.senior.map(v => v.syntax).includes(this.showFunction.syntax)
    if (isSenior) this.showTips = true
  }

  render() {
    const { onClose } = this.props
    const functionList = [...FUNCTIONS.base, ...FUNCTIONS.senior]
    const functionSyntax = functionList.find(v => v.syntax === this.myFunction.syntax)
    const hintFunctionSyntax = functionList.find(v => v.syntax === this.showFunction.syntax)
    const hintIsSenior = FUNCTIONS.senior.includes(hintFunctionSyntax)

    return <div className={styles.newVariableBlock}>
      <div className={styles.newVariableRow}>
        <div className={styles.newVariableName}>
          <input className={styles.newVariableInput} placeholder={EN.NAME} value={this.name}
            onChange={this.handleNameChange} />
        </div>
        <span>=</span>
        <div className={styles.newVariableFx}>
          <input className={styles.newVariableInput} placeholder={EN.FX} ref={this.fxRef} value={this.exp}
            onChange={this.handleChange} onKeyDown={this.onKeyDown} onSelect={this.onSelect} />
          {this.isIn && <div className={styles.newVariableEmpty} onClick={this.deleteFx}><span>X</span></div>}
          {this.hintStatus && <div className={styles.newVariableHintList}>
            {this.hints.map((v, k) => {
              return <div key={k} className={classnames(styles.newVariableHint, {
                [styles.activeHint]: this.active === k
              })} onClick={this.handleSelect.bind(null, v.value, !!v.syntax)}
                onMouseOver={this.showSyntax.bind(null, k)}>
                <span>{v.label}</span>
              </div>
            })}
          </div>}
          {!!hintFunctionSyntax && (this.showTips ?
            <FunctionTips value={hintFunctionSyntax.value} /> :
            <div className={styles.newVariableHintSyntax}>
              <span>{hintFunctionSyntax.syntax}</span>
              {hintIsSenior && <button onClick={this.showAll}><span>{EN.Tips}</span></button>}
            </div>)}
          {!!functionSyntax && <div className={styles.newVariableSyntax}
            style={(this.hintStatus && !!this.hints.length) ? { right: '100%' } : null}>
            <span>{functionSyntax.syntax}</span></div>}
        </div>
      </div>
      <div className={styles.newVariableRow}>
        <button className={classnames(styles.newVariableButton, styles.newVariableAdd, {
          [styles.disable]: this.loading
        })} onClick={this.loading ? null : this.handleAdd}>
          <span>{this.loading ? <Icon type="loading" theme="outlined" /> : EN.ADD}</span>
        </button>
        <button className={classnames(styles.newVariableButton, styles.newVariableCancel)} onClick={onClose}>
          <span>{EN.Cancel}</span>
        </button>
      </div>
    </div>
  }
}

class FunctionTips extends Component {
  Concat() {
    return <div className={styles.funcTips}>
      <div className={styles.funcTipsName}><span>{EN.Concat}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Concatfunctionallowsyou}</span></div>
      <div className={styles.funcTipsTitle}><span>{EN.Syntax}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Concatvar1}</span></div>
      <div className={styles.funcTipsTitle}><span>{EN.Input}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Var1var2var3}<br />
        {EN.Numberofvariables}</span></div>
      <div className={styles.funcTipsTitle}><span>{EN.Output}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Categoricalvariables}</span></div>
      <div className={styles.funcTipsTitle}><span>{EN.Examples}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Concatcolor}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Output}</span></div>
      <div className={styles.funcTipsContent}>
        <Table
          bordered={true}
          defaultExpandAllRows={true}
          pagination={false}
          size="small"
          dataSource={[
            { key: '1', 1: 'red_nature', 2: 'red_small', 3: 'nature_small' },
            { key: '2', 1: 'blue_sports', 2: 'blue_medium', 3: 'sports_medium' }
          ]}
          columns={[{
            title: 'color_theme',
            dataIndex: 1,
            key: 1,
            className: styles.funcTipsCol
          }, {
            title: 'color_size',
            dataIndex: 2,
            key: 2,
            className: styles.funcTipsCol
          }, {
            title: 'theme_size',
            dataIndex: 3,
            key: 3,
            className: styles.funcTipsCol
          }]} />
      </div>
      <div className={styles.funcTipsContent}><span>{EN.Concatolor3}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Output}</span></div>
      <div className={styles.funcTipsContent}>
        <Table
          bordered={true}
          defaultExpandAllRows={true}
          pagination={false}
          size="small"
          dataSource={[
            { key: '1', 1: 'red_nature_small' },
            { key: '2', 1: 'blue_sports_medium' }
          ]}
          columns={[{
            title: 'color_theme_size',
            dataIndex: 1,
            key: 1,
            className: styles.funcTipsCol
          }]} />
      </div>
      <div className={styles.funcTipsContent}><span>{EN.Concat23}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Output}</span></div>
      <div className={styles.funcTipsContent}>
        <Table
          bordered={true}
          defaultExpandAllRows={true}
          pagination={false}
          size="small"
          dataSource={[
            { key: '1', 1: 'red_nature', 2: 'red_small', 3: 'nature_small', 4: 'red_nature_small' },
            { key: '2', 1: 'blue_sports', 2: 'blue_medium', 3: 'sports_medium', 4: 'blue_sports_medium' }
          ]}
          columns={[{
            title: 'color_theme',
            dataIndex: 1,
            key: 1,
            className: styles.funcTipsCol
          }, {
            title: 'color_size',
            dataIndex: 2,
            key: 2,
            className: styles.funcTipsCol
          }, {
            title: 'theme_size',
            dataIndex: 3,
            key: 3,
            className: styles.funcTipsCol
          },
          {
            title: 'color_theme_size',
            dataIndex: 4,
            key: 4,
            className: styles.funcTipsCol
          }]} />
      </div>
      <div className={styles.funcTipsTitle}><span>{EN.Notice}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Iftoomanynewvariablesarecreated}</span></div>
    </div>
  }

  Diff() {
    return <div className={styles.funcTips}>
      <div className={styles.funcTipsName}><span>{EN.Diff}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Difffunctionallowsyoutoeasily}</span></div>
      <div className={styles.funcTipsTitle}><span>{EN.Syntax}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.DIffrow1}</span></div>
      <div className={styles.funcTipsTitle}><span>{EN.Input}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Ormorenumericalvariables}<br />
        {EN.Distancetobecalculated}</span></div>
      <div className={styles.funcTipsTitle}><span>{EN.Output}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Numericalvariable}</span></div>
      <div className={styles.funcTipsTitle}><span>{EN.Example}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Difftax}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Output}</span></div>
      <div className={styles.funcTipsContent}>
        <Table
          bordered={true}
          defaultExpandAllRows={true}
          pagination={false}
          size="small"
          dataSource={[
            { key: '1', 1: '200', 2: 'nan', 3: 'nan' },
            { key: '2', 1: '230', 2: '30', 3: 'nan' },
            { key: '3', 1: '280', 2: '50', 3: '80' },
            { key: '4', 1: '250', 2: '-30', 3: '20' }
          ]}
          columns={[{
            title: 'tax',
            dataIndex: 1,
            key: 1,
            className: styles.funcTipsCol
          }, {
            title: 'tax_diff_r1',
            dataIndex: 2,
            key: 2,
            className: styles.funcTipsCol
          }, {
            title: 'tax_diff_r2',
            dataIndex: 3,
            key: 3,
            className: styles.funcTipsCol
          }]} />
      </div>
      <div className={styles.funcTipsTitle}><span>{EN.Notice}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Iftoomanynewvariablesarecreated}</span></div>
    </div>
  }

  Accumulate() {
    return <div className={styles.funcTips}>
      <div className={styles.funcTipsName}><span>{EN.Accumulate}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Accumulatefunction}</span></div>
      <div className={styles.funcTipsTitle}><span>{EN.Syntax}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Accumulatevar1var2}</span></div>
      <div className={styles.funcTipsTitle}><span>{EN.Input}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Morenumericalvariables}</span></div>
      <div className={styles.funcTipsTitle}><span>{EN.Output}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Numericalvariable}</span></div>
      <div className={styles.funcTipsTitle}><span>{EN.Example}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Accumulatedaily_sales}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Output}</span></div>
      <div className={styles.funcTipsContent}>
        <Table
          bordered={true}
          defaultExpandAllRows={true}
          pagination={false}
          size="small"
          dataSource={[
            { key: '1', 1: '1000', 2: '1000', 3: '200', 4: '200' },
            { key: '2', 1: '1500', 2: '2500', 3: '300', 4: '500' },
            { key: '3', 1: '1800', 2: '4300', 3: '350', 4: '850' }
          ]}
          columns={[{
            title: 'daily_sales',
            dataIndex: 1,
            key: 1,
            className: styles.funcTipsCol
          }, {
            title: 'daily_sales_accum',
            dataIndex: 2,
            key: 2,
            className: styles.funcTipsCol
          }, {
            title: 'daily_cost',
            dataIndex: 3,
            key: 3,
            className: styles.funcTipsCol
          },
          {
            title: 'daily_cost_accum',
            dataIndex: 4,
            key: 4,
            className: styles.funcTipsCol
          }]} />
      </div>
      <div className={styles.funcTipsTitle}><span>{EN.Notice}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Iftoomanynewvariablesarecreatedcsystem}</span></div>
    </div>
  }

  Quantile_bin() {
    return <div className={styles.funcTips}>
      <div className={styles.funcTipsName}><span>{EN.Quantile_bin}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Quantile_binfunctionallows}</span></div>
      <div className={styles.funcTipsTitle}><span>{EN.Syntax}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Quantile_binvar1var2}</span></div>
      <div className={styles.funcTipsTitle}><span>{EN.Input}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Allvariablesneedtostartwith}<br />
        {EN.Numberofgroupstobedivided}<br />
        {EN.Type1type2}<br />
        {EN.Variableisdividedbyitspercentile}<br />
        {EN.Eachgroupiswiththesamevaluerange}</span></div>
      <div className={styles.funcTipsTitle}><span>{EN.Output}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Categoricalvariables}</span></div>
      <div className={styles.funcTipsTitle}><span>{EN.Example}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Quantile_binage}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Output}</span></div>
      <div className={styles.funcTipsContent}>
        <Table
          bordered={true}
          defaultExpandAllRows={true}
          pagination={false}
          size="small"
          dataSource={[
            { key: '1', 1: '19', 2: '0-25' },
            { key: '2', 1: '45', 2: '25-50' },
            { key: '3', 1: '60', 2: '50-75' }
          ]}
          columns={[{
            title: 'age',
            dataIndex: 1,
            key: 1,
            className: styles.funcTipsCol
          }, {
            title: EN.agevalb3,
            dataIndex: 2,
            key: 2,
            className: styles.funcTipsCol
          }]} />
      </div>
      <div className={styles.funcTipsContent}><span>{EN.Quantile_binage1}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Output}</span></div>
      <div className={styles.funcTipsContent}>
        <Table
          bordered={true}
          defaultExpandAllRows={true}
          pagination={false}
          size="small"
          dataSource={[
            { key: '1', 1: '0-24', 2: '0-25', 3: '0-3', 4: '0-5' },
            { key: '2', 1: '24-50', 2: '25-40', 3: '3-9', 4: '5-8' },
            { key: '3', 1: '50-75', 2: '40-60', 3: '9-15', 4: '8-15' }
          ]}
          columns={[{
            title: 'age1_val_b4',
            dataIndex: 1,
            key: 1,
            className: styles.funcTipsCol
          }, {
            title: 'age1_fre_b4',
            dataIndex: 2,
            key: 2,
            className: styles.funcTipsCol
          }, {
            title: 'age2_val_b4',
            dataIndex: 3,
            key: 3,
            className: styles.funcTipsCol
          },
          {
            title: 'age2_fre_b4',
            dataIndex: 4,
            key: 4,
            className: styles.funcTipsCol
          }]} />
      </div>
      <div className={styles.funcTipsTitle}><span>{EN.Notice}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Iftoomanynewvariablesarecreated}</span></div>
    </div>
  }

  Custom_Quantile_bin() {
    return <div className={styles.funcTips}>
      <div className={styles.funcTipsName}><span>{EN.Custom_Quantile_bin}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Custom_Quantile_binfunction}</span></div>
      <div className={styles.funcTipsTitle}><span>{EN.Syntax}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Custom_Quantile_binrange_list1}</span></div>
      <div className={styles.funcTipsTitle}><span>{EN.Input}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Variableneedstostartwith}</span></div>
      <div className={styles.funcTipsTitle}><span>{EN.Output}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Categoricalvariables}</span></div>
      <div className={styles.funcTipsTitle}><span>{EN.Example}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Custom_Quantile_binage}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Output}</span></div>
      <div className={styles.funcTipsContent}>
        <Table
          bordered={true}
          defaultExpandAllRows={true}
          pagination={false}
          size="small"
          dataSource={[
            { key: '1', 1: '15', 2: '(<=25)', 3: '(<=20)' },
            { key: '2', 1: '40', 2: '(25-50)', 3: '(20-40)' },
            { key: '3', 1: '55', 2: '(>=50)', 3: '(40-60)' }
          ]}
          columns={[{
            title: 'age',
            dataIndex: 1,
            key: 1,
            className: styles.funcTipsCol
          }, {
            title: 'age_cus_b3',
            dataIndex: 2,
            key: 2,
            className: styles.funcTipsCol
          }, {
            title: 'age_cus_b4',
            dataIndex: 3,
            key: 3,
            className: styles.funcTipsCol
          }]} />
      </div>
      <div className={styles.funcTipsTitle}><span>{EN.Notice}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Iftoomanynewvariablesarecreated}</span></div>
    </div>
  }

  render() {
    const { value } = this.props
    const key = value.slice(0, -2)
    if (!key || !this[key] || typeof this[key] !== 'function') return null
    return this[key]()
  }
}
