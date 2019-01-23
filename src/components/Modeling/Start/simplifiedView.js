import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import CorrelationMatrix from './CorrelationMatrix';
import { Hint, ProcessLoading } from 'components/Common';
import { observable } from 'mobx';
import { Spin, Popover, message as antdMessage, Icon, Table } from 'antd';
import histogramIcon from './histogramIcon.svg';
import univariantIcon from './univariantIcon.svg';
import FUNCTIONS from './functions';
import config from 'config'

@observer
export default class SimplifiedView extends Component {
  @observable sort = -1
  @observable showHistograms = false
  @observable showCorrelation = false
  @observable visible = false

  componentDidMount() {
    this.props.project.dataView().then(() => {
      this.props.project.preTrainImportance()
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

  showCorrelationMatrix = () => {
    this.showCorrelation = true
  }

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
  }

  reloadTable = () => {
    this.props.project.dataView().then(() => {
      this.props.project.preTrainImportance()
    })
  }

  handleChange = e => {
    const value = e.target.value
    const { project } = this.props
    const { informativesLabel, dataHeader, customHeader, newVariable, target } = project
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

  formatNumber = (num, isNA) => {
    if (isNA) return "N/A"
    if (typeof num === "number") return num.toFixed(2)
    if (typeof num === "string") return num
    return "N/A"
  }

  render() {
    const { project } = this.props;
    const { target, colType, targetMap, dataViews, dataViewsLoading, preImportance, preImportanceLoading, histgramPlots, dataHeader, addNewVariable, newVariable, newType, id, informativesLabel, trainHeader, expression, customHeader, totalLines, dataViewProgress, importanceProgress } = project;
    const targetUnique = colType[target] === 'Categorical' ? 2 : 'N/A'
    const targetData = (colType[target] !== 'Categorical' && dataViews) ? (dataViews[target] || {}) : {}
    const allVariables = [...dataHeader.filter(h => h !== target), ...newVariable]
    const variableType = { ...newType, ...colType }
    const checkedVariables = allVariables.filter(v => !trainHeader.includes(v))
    const key = [allVariables, informativesLabel, ...customHeader].map(v => v.sort().toString()).indexOf(checkedVariables.sort().toString())
    const hasNewOne = key === -1
    const selectValue = hasNewOne ? customHeader.length : (key === 0 ? 'all' : (key === 1 ? 'informatives' : key - 2))
    return <div className={styles.simplified}>
      <div className={styles.targetTable}>
        <div className={styles.targetHead}>
          <div className={classnames(styles.targetCell, styles.targetName)}><span>Target Variable</span></div>
          <div className={styles.targetCell}><span>Histogram</span></div>
          <div className={styles.targetCell}><span>Data Type</span></div>
          <div className={styles.targetCell}><span>Mean</span></div>
          <div className={styles.targetCell}><span>Unique Value</span></div>
          <div className={styles.targetCell}><span>Min</span></div>
          <div className={styles.targetCell}><span>Max</span></div>
        </div>
        <div className={styles.targetRow}>
          <div className={classnames(styles.targetCell, styles.targetName)} title={target}><span>{target}</span></div>
          <div className={styles.targetCell} onClick={this.show}>
            <img src={histogramIcon} className={styles.tableImage} alt='histogram' />
            {<Popover placement='bottomLeft'
              visible={this.showHistograms}
              onVisibleChange={this.hide}
              trigger="click"
              content={<SimplifiedViewPlot onClose={this.hide}
                type='histogram'
                getPath={project.histgramPlot.bind(null, target)}
                path={histgramPlots[target]}
                id={id}
                fetch={project.histgramPlot.hasOwnProperty(target)}
              />} />}
          </div>
          <div className={styles.targetCell}><span>{colType[target]}</span></div>
          <div className={classnames(styles.targetCell, {
            [styles.none]: colType[target] === 'Categorical'
          })} title={this.formatNumber(targetData.mean, colType[target] === 'Categorical')}><span>{this.formatNumber(targetData.mean, colType[target] === 'Categorical')}</span></div>
          <div className={classnames(styles.targetCell, {
            [styles.none]: colType[target] !== 'Categorical'
          })}><span>{targetUnique}</span></div>
          <div className={classnames(styles.targetCell, {
            [styles.none]: colType[target] === 'Categorical'
          })} title={this.formatNumber(targetData.min, colType[target] === 'Categorical')}><span>{this.formatNumber(targetData.min, colType[target] === 'Categorical')}</span></div>
          <div className={classnames(styles.targetCell, {
            [styles.none]: colType[target] === 'Categorical'
          })} title={this.formatNumber(targetData.max, colType[target] === 'Categorical')}><span>{this.formatNumber(targetData.max, colType[target] === 'Categorical')}</span></div>
        </div>
      </div>
      <div className={styles.simplifiedText}><span>You can use check box to create your own variable list.</span></div>
      <div className={styles.tool}>
        <div className={styles.toolSelect}>
          <div className={styles.toolLabel}><span>Current Variable List</span></div>
          <select value={selectValue} onChange={this.handleChange}>
            <option value='all'>All Variables ({allVariables.length})</option>
            <option value='informatives'>informatives ({informativesLabel.length})</option>
            {customHeader.map((v, k) => <option key={k} value={k}>custom_{k + 1} ({v.length})</option>)}
            {hasNewOne && <option value={customHeader.length}>custom_{customHeader.length + 1} ({checkedVariables.length})</option>}
          </select>
        </div>
        <div className={styles.newVariable}>
          <div className={styles.toolButton} onClick={this.showNewVariable}>
            <span>Create a New Variable</span>
          </div>
          <CreateNewVariable dataHeader={dataHeader.filter(n => n !== target)} colType={colType} onClose={this.hideNewVariable} visible={this.visible} addNewVariable={addNewVariable} expression={expression} />
        </div>
        <div className={classnames(styles.toolButton, styles.toolCheck)} onClick={this.showCorrelationMatrix}>
          {this.showCorrelation && <Popover placement='left'
            visible={this.showCorrelation}
            onVisibleChange={this.hideCorrelationMatrix}
            trigger="click"
            content={<CorrelationPlot onClose={this.hideCorrelationMatrix}
              type='correlationMatrix'
              getPath={this.getCorrelationMatrix}
              data={project.correlationMatrixData}
              header={project.correlationMatrixHeader}
              id={id}
              fetch={(!!project.correlationMatrixHeader && !!project.correlationMatrixData) || project.correlationMatrixLoading}
            />} />}
          <span>Check Correlation Matrix</span>
        </div>
      </div>
      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <div className={classnames(styles.tableTh, styles.tableCheck)}></div>
          <div className={styles.tableTh}><span>Name</span></div>
          <div className={styles.tableTh}><span>Histogram</span></div>
          <div className={styles.tableTh}><span>Univariant Plot</span></div>
          <div className={classnames(styles.tableTh, styles.tableImportance)}>
            <div className={styles.tableSort} onClick={this.sortImportance}><span><Icon type={`arrow-${this.sort === 1 ? 'up' : 'down'}`} theme="outlined" /></span></div>
            <span>Importance</span>
            <div className={styles.tableReload} onClick={this.reloadTable}><span><Icon type="reload" theme="outlined" /></span></div>
            <Hint themeStyle={{ fontSize: '1rem' }} content='The following column reflects the importance of the predictor to the target variable.' />
          </div>
          <div className={styles.tableTh}><span>Data Type</span></div>
          <div className={styles.tableTh}><span>Unique Value</span></div>
          <div className={styles.tableTh}><span>Mean</span></div>
          <div className={styles.tableTh}><span>STD</span></div>
          <div className={styles.tableTh}><span>Median</span></div>
          <div className={styles.tableTh}><span>Min</span></div>
          <div className={styles.tableTh}><span>Max</span></div>
        </div>
        {(dataViewsLoading || preImportanceLoading) ?
          <div className={styles.tableLoading}>
            <Icon type="loading" />
          </div> :
          <div className={styles.tableBody}>
            {allVariables.sort((a, b) => {
              return preImportance ? this.sort * ((preImportance[a] || 0) - (preImportance[b] || 0)) : 0
            }).map((h, i) => {
              if (h === target) return null;
              const data = dataViews ? (dataViews[h] || {}) : {}
              const map = targetMap || {};
              const importance = preImportance ? (preImportance[h] || 0) : 0.01;
              return <SimplifiedViewRow key={i} value={h} data={data} map={map} importance={importance} colType={variableType} project={project} isChecked={checkedVariables.includes(h)} handleCheck={this.handleCheck.bind(null, h)} lines={Math.min(Math.floor(totalLines * 0.95), 1000)} id={id} />
            })}
          </div>}
      </div>
      {(dataViewsLoading || preImportanceLoading) && <ProcessLoading progress={dataViewsLoading ? (dataViewProgress / 2) : (importanceProgress / 2 + 50)} style={{ bottom: '0.25em' }} />}
    </div>
  }
}

@observer
class SimplifiedViewRow extends Component {
  @observable histograms = false
  @observable univariant = false

  showHistograms = () => {
    this.histograms = true
  }

  showUnivariant = () => {
    this.univariant = true
  }

  hideHistograms = e => {
    e && e.stopPropagation();
    this.histograms = false
  }

  hideUnivariant = e => {
    e && e.stopPropagation();
    this.univariant = false
  }

  formatNumber = (num, isNA) => {
    if (isNA) return "N/A"
    if (typeof num === "number") return num.toFixed(2)
    return "N/A"
  }

  render() {
    const { data, importance, colType, value, project, isChecked, handleCheck, id, lines } = this.props;
    const valueType = colType[value] === 'Numerical' ? 'Numerical' : 'Categorical'
    const isRaw = colType[value] === 'Raw'
    const unique = (isRaw && `${lines}+`) || (valueType === 'Numerical' && 'N/A') || data.uniqueValues
    return <div className={styles.tableRow}>
      <div className={classnames(styles.tableTd, styles.tableCheck)}><input type='checkbox' checked={isChecked} onChange={handleCheck} /></div>
      <div className={styles.tableTd} title={value}><span>{value}</span></div>
      <div className={styles.tableTd} onClick={this.showHistograms}>
        <img src={histogramIcon} className={styles.tableImage} alt='histogram' />
        {this.histograms && <Popover placement='topLeft'
          visible={this.histograms}
          onVisibleChange={this.hideHistograms}
          trigger="click"
          content={<SimplifiedViewPlot onClose={this.hideHistograms}
            type='histgram'
            getPath={project.histgramPlot.bind(null, value)}
            path={project.histgramPlots[value]}
            id={id}
            fetch={project.histgramPlot.hasOwnProperty(value)}
          />} />}
      </div>
      <div className={styles.tableTd} onClick={this.showUnivariant}>
        <img src={univariantIcon} className={styles.tableImage} alt='univariant' />
        {this.univariant && <Popover placement='topLeft'
          visible={this.univariant}
          onVisibleChange={this.hideUnivariant}
          trigger="click"
          content={<SimplifiedViewPlot onClose={this.hideUnivariant}
            type='univariate'
            getPath={project.univariatePlot.bind(null, value)}
            path={project.univariatePlots[value]}
            id={id}
            fetch={project.univariatePlots.hasOwnProperty(value)}
          />} />}
      </div>
      <div className={classnames(styles.tableTd, styles.tableImportance)}>
        <div className={styles.preImpotance}>
          <div className={styles.preImpotanceActive} style={{ width: (importance * 100) + '%' }}></div>
        </div>
      </div>
      <div className={styles.tableTd} title={valueType}><span>{valueType}</span></div>
      <div className={classnames(styles.tableTd, {
        [styles.none]: valueType !== 'Categorical'
      })} title={unique}><span>{unique}</span></div>
      <div className={classnames(styles.tableTd, {
        [styles.none]: valueType === 'Categorical'
      })} title={this.formatNumber(data.mean, valueType === 'Categorical')}><span>{this.formatNumber(data.mean, valueType === 'Categorical')}</span></div>
      <div className={classnames(styles.tableTd, {
        [styles.none]: valueType === 'Categorical'
      })} title={this.formatNumber(data.std, valueType === 'Categorical')}><span>{this.formatNumber(data.std, valueType === 'Categorical')}</span></div>
      <div className={classnames(styles.tableTd, {
        [styles.none]: valueType === 'Categorical'
      })} title={this.formatNumber(data.median, valueType === 'Categorical')}><span>{this.formatNumber(data.median, valueType === 'Categorical')}</span></div>
      <div className={classnames(styles.tableTd, {
        [styles.none]: valueType === 'Categorical'
      })} title={this.formatNumber(data.min, valueType === 'Categorical')}><span>{this.formatNumber(data.min, valueType === 'Categorical')}</span></div>
      <div className={classnames(styles.tableTd, {
        [styles.none]: valueType === 'Categorical'
      })} title={this.formatNumber(data.max, valueType === 'Categorical')}><span>{this.formatNumber(data.max, valueType === 'Categorical')}</span></div>
    </div>
  }
}

@observer
class CorrelationPlot extends Component {
  constructor(props) {
    super(props)
    if (!props.fetch) props.getPath()
  }
  render() {
    const { data, header, onClose } = this.props;
    return (
      <div className={styles.correlationPlot} >
        <div onClick={onClose} className={styles.plotClose}><span>X</span></div>
        {data ? <CorrelationMatrix header={header} data={data} /> : <div className={styles.plotLoad}><Spin size="large" /></div>}
      </div>
    )
  }
}

@observer
class SimplifiedViewPlot extends Component {
  constructor(props) {
    super(props)
    if (!props.fetch) props.getPath()
  }

  render() {
    const { onClose, path, type, id, style } = this.props;
    const imgPath = path ? `http://${config.host}:${config.port}/redirect/download/${path}?projectId=${id}` : ''
    return <div className={styles.plot} style={style}>
      <div onClick={onClose} className={styles.plotClose}><span>X</span></div>
      {path ? <img src={imgPath} alt={type} /> : <div className={styles.plotLoad}><Spin size="large" /></div>}
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
    document.onmousedown = () => { }
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
    this.myFunction = FUNCTIONS.senior.reverse().find(v => functionStr.includes(v.value.slice(0, -1))) || {}
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
      let dom = e.target; let isIn = false
      while (dom) {
        if (dom.className === styles.newVariableFx) { isIn = true; break }
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
    if (!name) return antdMessage.error("name is empty")
    if (expression.hasOwnProperty(name)) return antdMessage.error(`new variable ${name} is exist`)
    if (name.includes("_")) return antdMessage.error(`name cannot contain _`)
    const checked = this.checkExp(exp)
    if (!checked.isPass) return antdMessage.error(checked.message)
    if (!checked.num) return antdMessage.error("expression is empty")
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
      if (num > 9) return { isPass: false, message: "too many functions" }
      // 查询截取表达式最后一个(
      const start = expression.lastIndexOf("(", end)
      if (start === -1) return { isPass: false, message: "Unexpected token )" }
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
    if (!expression) return { isPass: false, message: "empty expression" }
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
      if (!item) return { isPass: false, message: "error expression" }
      //判断是否是数字
      if (isNaN(item)) {
        // 判断是否含有转化的()表达式
        if (item.includes("$")) {
          const index = item.indexOf("$")
          // 截取函数名称
          const functionName = item.slice(0, index).trim()
          let bracketNum = item.slice(index + 1, index + 2).trim()
          if (!bracketNum || isNaN(bracketNum)) return { isPass: false, message: `error expression` }
          try {
            bracketNum = parseInt(bracketNum, 10)
          } catch (e) {
            return { isPass: false, message: `error expression` }
          }
          const other = item.slice(index + 2).trim()
          if (other) return { isPass: false, message: `Unexpected identifier: ${other}` }
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
          if (!item || !dataHeader.includes(item)) return { isPass: false, message: `unknown variable: ${item}` }
          isVariable = true
          type = colType[item] === 'Numerical' ? 'Numerical' : 'Categorical'
        }
      }
      typeArray.push(type)
    }
    if (typeArray.length > 1) {
      const index = typeArray.indexOf('Categorical')
      if (index !== -1) return { isPass: false, message: `error expression: ${array[index]}` }
      expType = 'Numerical'
    } else {
      expType = typeArray[0]
    }
    return { isPass: true, message: `ok`, num, isVariable, type: expType }
  }

  // 校验表达式参数
  checkParams = (functionName, bracketExps, bracketNum) => {
    const exps = bracketExps[bracketNum]
    if (!exps) return { isPass: false, message: `empty parameters` }
    // 根据, 分割参数
    const expArray = exps.split(",")
    // 不是函数, 则参数只能为1个
    if (!functionName && expArray.length > 1) return { isPass: false, message: `Unexpected identifier: ${exps}` }
    const isBaseFn = FUNCTIONS.base.find(fn => fn.value === functionName + "()")
    const isSeniorFn = FUNCTIONS.senior.find(fn => fn.value === functionName + "()")
    const currentFn = isBaseFn || isSeniorFn
    // 判断函数参数个数限制
    if (currentFn.params && currentFn.params !== expArray.length) return { isPass: false, message: `function ${functionName} must have ${currentFn.params} params` }
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
        if (param.type !== 'Numerical') return { isPass: false, message: `parameters must be Numerical` }
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
        if (param.type !== 'Numerical') return { isPass: false, message: `function: ${senior.value.slice(0, -2)} parameters must be Numerical` }
      }
    }
    // 截取非列名参数
    const numList = params.slice(numOfParam)
    switch (senior.value) {
      case "Concat()":
        type = 'Categorical'
        if (numOfParam < 1) return { isPass: false, message: `function: ${senior.value.slice(0, -2)} parameters error` }
        const concatResults = numList.map(num => {
          let n = num.exp
          if (isNaN(n) || n.includes(".")) return { isPass: false, message: `${n} must be integer` }
          try {
            n = parseInt(n, 10)
          } catch (e) {
            return { isPass: false, message: `${n} must be integer` }
          }
          if (n < 2) return { isPass: false, message: `${n} must greater than 1` }
          if (n > numOfParam) return { isPass: false, message: `${n} must less than ${numOfParam + 1}` }
          return { isPass: true, message: "ok", num: this.factorial(numOfParam) / this.factorial(n) / this.factorial(numOfParam - n) }
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
          if (isNaN(n) || n.includes(".")) return { isPass: false, message: `${n} must be integer` }
          try {
            n = parseInt(n, 10)
          } catch (e) {
            return { isPass: false, message: `${n} must be integer` }
          }
          return { isPass: true, message: "ok", num: numOfParam }
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
        if (isNaN(b.exp) || b.exp.includes(".")) return { isPass: false, message: `${b.exp} must be integer` }
        if (!quantileBinArray.includes(type1.exp.trim())) return { isPass: false, message: `${type1.exp} is not supported` }
        if (type2 && !quantileBinArray.includes(type2.exp.trim())) return { isPass: false, message: `${type2.exp} is not supported` }
        num = numOfParam * (type2 ? 2 : 1)
        break;
      case "Custom_Quantile_bin()":
        type = 'Categorical'
        const numResults = numList.map(num => {
          let n = num.exp
          const str = n.trim()
          const first = str.slice(0, 1)
          const last = str.slice(-1)
          if (first !== "[" || last !== "]") return { isPass: false, message: `Unexpected identifier: ${n}` }
          const array = str.slice(1, -1).split("|")
          for (let item of array) {
            if (!item || isNaN(item.trim())) return { isPass: false, message: `${item} must be number` }
          }
          return { isPass: true, message: "ok", num: 1 }
        })
        for (let numResult of numResults) {
          if (!numResult.isPass) return numResult
          num += numResult.num
        }
        break;
      default:
        break;
    }
    if (num < 1) return { isPass: false, message: `function: ${senior.value.slice(0, -2)} parameters error` }
    return { isPass: true, message: "ok", num, type }
  }

  // 校验总表达式
  checkExp = _expression => {
    if (!_expression) return { isPass: true, message: "ok", num: 0 }
    if (_expression.includes("$")) return { isPass: false, message: "Unexpected token $" }

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
    const { visible, onClose } = this.props
    const functionList = [...FUNCTIONS.base, ...FUNCTIONS.senior]
    const functionSyntax = functionList.find(v => v.syntax === this.myFunction.syntax)
    const hintFunctionSyntax = functionList.find(v => v.syntax === this.showFunction.syntax)
    const hintIsSenior = FUNCTIONS.senior.includes(hintFunctionSyntax)

    return visible && <div className={styles.newVariableBlock}>
      <div className={styles.newVariableRow}>
        <div className={styles.newVariableName}>
          <input className={styles.newVariableInput} placeholder="name" value={this.name} onChange={this.handleNameChange} />
        </div>
        <span>=</span>
        <div className={styles.newVariableFx}>
          <input className={styles.newVariableInput} placeholder="fx" ref={this.fxRef} value={this.exp} onChange={this.handleChange} onKeyDown={this.onKeyDown} onSelect={this.onSelect} />
          {this.isIn && <div className={styles.newVariableEmpty} onClick={this.deleteFx}><span>X</span></div>}
          {this.hintStatus && <div className={styles.newVariableHintList}>
            {this.hints.map((v, k) => {
              return <div key={k} className={classnames(styles.newVariableHint, {
                [styles.activeHint]: this.active === k
              })} onClick={this.handleSelect.bind(null, v.value, !!v.syntax)} onMouseOver={this.showSyntax.bind(null, k)}>
                <span>{v.label}</span>
              </div>
            })}
          </div>}
          {!!hintFunctionSyntax && (this.showTips ?
            <FunctionTips value={hintFunctionSyntax.value} /> :
            <div className={styles.newVariableHintSyntax}>
              <span>{hintFunctionSyntax.syntax}</span>
              {hintIsSenior && <button onClick={this.showAll}><span>Tips</span></button>}
            </div>)}
          {!!functionSyntax && <div className={styles.newVariableSyntax} style={(this.hintStatus && !!this.hints.length) ? { right: '100%' } : null}><span>{functionSyntax.syntax}</span></div>}
        </div>
      </div>
      <div className={styles.newVariableRow}>
        <button className={classnames(styles.newVariableButton, styles.newVariableAdd, {
          [styles.disable]: this.loading
        })} onClick={this.loading ? null : this.handleAdd}>
          <span>{this.loading ? <Icon type="loading" theme="outlined" /> : 'Add'}</span>
        </button>
        <button className={classnames(styles.newVariableButton, styles.newVariableCancel)} onClick={onClose}>
          <span>Cancel</span>
        </button>
      </div>
    </div>
  }
}

class FunctionTips extends Component {
  Concat() {
    return <div className={styles.funcTips}>
      <div className={styles.funcTipsName}><span>Concat()</span></div>
      <div className={styles.funcTipsContent}><span>Combine function allows you to easily construct new variables by combine certaininterdependent variables (e.g. variables that describe the same object)</span></div>
      <div className={styles.funcTipsTitle}><span>Syntax:</span></div>
      <div className={styles.funcTipsContent}><span>Combine(@var1, @var2, @var3,...p1, p2...)</span></div>
      <div className={styles.funcTipsTitle}><span>Input:</span></div>
      <div className={styles.funcTipsContent}><span>var1, var2, var3... – 2 or more numerical or categorical variables to be combined; the combination order are decided by the input order. All variables need to start with@.<br />
        p1, p2... - Number of variables in each combination; its number must be largerthan 1 but cannot be larger than the number of specified variables; combinations of p1 variables are created, then combinations of p2 variables are created, and so on.</span></div>
      <div className={styles.funcTipsTitle}><span>Output:</span></div>
      <div className={styles.funcTipsContent}><span>1 or more categorical variables</span></div>
      <div className={styles.funcTipsTitle}><span>Examples:</span></div>
      <div className={styles.funcTipsContent}><span>Combine(@color, @theme, @size, 2)</span></div>
      <div className={styles.funcTipsContent}><span>Output:</span></div>
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
      <div className={styles.funcTipsContent}><span>Combine(@color, @theme, @size, 3)</span></div>
      <div className={styles.funcTipsContent}><span>Output:</span></div>
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
      <div className={styles.funcTipsContent}><span>Combine(@color, @theme, @size, 2, 3)</span></div>
      <div className={styles.funcTipsContent}><span>Output:</span></div>
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
      <div className={styles.funcTipsTitle}><span>Notice:</span></div>
      <div className={styles.funcTipsContent}><span>If too many new variables are created, system will possibly be out of memory. The total number of the created new variables is suggested to be less than 10 times of the number of the original variables.</span></div>
    </div>
  }

  Diff() {
    return <div className={styles.funcTips}>
      <div className={styles.funcTipsName}><span>Diff()</span></div>
      <div className={styles.funcTipsContent}><span>Diff function allows you to easily construct new variables by calculating the difference between two rows of selected variables.</span></div>
      <div className={styles.funcTipsTitle}><span>Syntax:</span></div>
      <div className={styles.funcTipsContent}><span>DIff(@var1, @var2, @var3,...row1,row2,...)</span></div>
      <div className={styles.funcTipsTitle}><span>Input:</span></div>
      <div className={styles.funcTipsContent}><span>var1, var2, var3... – 1 or more numerical variables to be calculated the difference; All variables need to start with@.<br />
        row1,row2,... – distance to be calculated; its number must be equal to or largerthan 1 but cannot be larger than the length of the variable(suggestion: larger the row, more missing values).</span></div>
      <div className={styles.funcTipsTitle}><span>Output:</span></div>
      <div className={styles.funcTipsContent}><span>1 or more numerical variables</span></div>
      <div className={styles.funcTipsTitle}><span>Examples:</span></div>
      <div className={styles.funcTipsContent}><span>Diff (@tax, 1,2)</span></div>
      <div className={styles.funcTipsContent}><span>Output:</span></div>
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
      <div className={styles.funcTipsTitle}><span>Notice:</span></div>
      <div className={styles.funcTipsContent}><span>If too many new variables are created, system will possibly be out of memory. The total number of the created new variables is suggested to be less than 10 times of the number of the original variables.</span></div>
    </div>
  }

  Accumulate() {
    return <div className={styles.funcTips}>
      <div className={styles.funcTipsName}><span>Accumulate()</span></div>
      <div className={styles.funcTipsContent}><span>Accumulate function allows you to easily construct new variables by accumulating values from all previous rows.</span></div>
      <div className={styles.funcTipsTitle}><span>Syntax:</span></div>
      <div className={styles.funcTipsContent}><span>Accumulate(@var1, @var2, @var3,...)</span></div>
      <div className={styles.funcTipsTitle}><span>Input:</span></div>
      <div className={styles.funcTipsContent}><span>var1, var2, var3... – 1 or more numerical variables to be accumulated; All variables need to start with@.</span></div>
      <div className={styles.funcTipsTitle}><span>Output:</span></div>
      <div className={styles.funcTipsContent}><span>1 or more numerical variables</span></div>
      <div className={styles.funcTipsTitle}><span>Examples:</span></div>
      <div className={styles.funcTipsContent}><span>Accumulate (@daily_sales, @daily_cost)</span></div>
      <div className={styles.funcTipsContent}><span>Output:</span></div>
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
      <div className={styles.funcTipsTitle}><span>Notice:</span></div>
      <div className={styles.funcTipsContent}><span>If too many new variables are created, system will possibly be out of memory.Thetotal number of the created new variables is suggested to be less than 10 times of the number of the original variables.</span></div>
    </div>
  }

  Quantile_bin() {
    return <div className={styles.funcTips}>
      <div className={styles.funcTipsName}><span>Quantile_bin()</span></div>
      <div className={styles.funcTipsContent}><span>Quantile_bin function allows you to easily construct new variables by dividing selected variables into certain groups depending on its frequency or value.</span></div>
      <div className={styles.funcTipsTitle}><span>Syntax:</span></div>
      <div className={styles.funcTipsContent}><span>Quantile_bin(@var1, @var2, @var3,b, type1, type2)</span></div>
      <div className={styles.funcTipsTitle}><span>Input:</span></div>
      <div className={styles.funcTipsContent}><span>var1, var2, var3... – 1 or more numerical variables to be divided; All variables need to start with@.<br />
        b – number of groups to be divided; its number must be greater than 1 but cannotbe larger than the length of the variable(suggestion: many groups are meaningless)<br />
        type1,type2 – ways to dividing the variables; 0 and 1 are supported.<br />
        0: variable is divided by its percentile, each group is thesame size;<br />
        1: variable is divided by its value, each group is with the same value range.</span></div>
      <div className={styles.funcTipsTitle}><span>Output:</span></div>
      <div className={styles.funcTipsContent}><span>1 or more categorical variables</span></div>
      <div className={styles.funcTipsTitle}><span>Examples:</span></div>
      <div className={styles.funcTipsContent}><span>Quantile_bin(@age, 3, 1)</span></div>
      <div className={styles.funcTipsContent}><span>Output:</span></div>
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
            title: 'age_val_b3',
            dataIndex: 2,
            key: 2,
            className: styles.funcTipsCol
          }]} />
      </div>
      <div className={styles.funcTipsContent}><span>Quantile_bin(@age1, @age2, 4, 1, 0))</span></div>
      <div className={styles.funcTipsContent}><span>Output:</span></div>
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
      <div className={styles.funcTipsTitle}><span>Notice:</span></div>
      <div className={styles.funcTipsContent}><span>If too many new variables are created, system will possibly be out of memory. The total number of the created new variables is suggested to be less than 10 times of the number of the original variables.</span></div>
    </div>
  }

  Custom_Quantile_bin() {
    return <div className={styles.funcTips}>
      <div className={styles.funcTipsName}><span>Custom_Quantile_bin()</span></div>
      <div className={styles.funcTipsContent}><span>Custom_Quantile_bin function allows you to easily construct new variables by dividing selected variables into certain groups depending on customized range.</span></div>
      <div className={styles.funcTipsTitle}><span>Syntax:</span></div>
      <div className={styles.funcTipsContent}><span>Custom_Quantile_bin(@var, [range_list1], [range_list2]...)</span></div>
      <div className={styles.funcTipsTitle}><span>Input:</span></div>
      <div className={styles.funcTipsContent}><span>var - 1 numerical variable to be divided; Variable needs to start with@. [range_list1], [range_list2]... - customized range to dividing the variable; its firstnumber should be larger than the minimum value of the variable and the last number should be smaller than the maximum value of the variable; the length of the range_list decides the number of groups.</span></div>
      <div className={styles.funcTipsTitle}><span>Output:</span></div>
      <div className={styles.funcTipsContent}><span>1 or more categorical variables</span></div>
      <div className={styles.funcTipsTitle}><span>Examples:</span></div>
      <div className={styles.funcTipsContent}><span>Custom_Quantile_bin(@age,[25|50],[20|40|60])</span></div>
      <div className={styles.funcTipsContent}><span>Output:</span></div>
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
      <div className={styles.funcTipsTitle}><span>Notice:</span></div>
      <div className={styles.funcTipsContent}><span>If too many new variables are created, system will possibly be out of memory. The total number of the created new variables is suggested to be less than 10 times of the number of the original variables.</span></div>
    </div>
  }

  render() {
    const { value } = this.props
    const key = value.slice(0, -2)
    if (!key || !this[key] || typeof this[key] !== 'function') return null
    return this[key]()
  }
}
