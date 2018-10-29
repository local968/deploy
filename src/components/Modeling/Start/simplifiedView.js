import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import Hint from 'components/Common/Hint';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import { Spin, Popover, message as antdMessage, Icon } from 'antd';
import histogramIcon from './histogramIcon.svg';
import univariantIcon from './univariantIcon.svg';
import config from 'config';
import FUNCTIONS from './functions';

@observer
export default class SimplifiedView extends Component {
  @observable sort = -1
  @observable showHistograms = false
  @observable showCorrelation = false
  @observable visible = false

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
    const { dataHeader } = this.props.project
    const isChecked = e.target.checked
    if (isChecked) {
      if (dataHeader.includes(key)) return
      this.props.project.dataHeader = [...dataHeader, key]
    } else {
      this.props.project.dataHeader = dataHeader.filter(v => v !== key)
    }
  }

  showNewVariable = () => {
    this.visible = true
  }

  hideNewVariable = () => {
    this.visible = false
  }

  reloadTable = () => {
    this.props.project.dataViews = null
    this.props.project.preImportance = null
    this.props.project.dataView()
    this.props.project.preTrainImportance()
  }

  render() {
    const { project } = this.props;
    const { target, colType, colMap, targetMap, dataViews, rawHeader, preImportance, uniqueValues, histgramPlots, dataHeader, addNewVariable, newVariable, host } = project;
    const targetUnique = colType[target] === 'Categorical' ? Object.values(Object.assign({}, colMap[target], targetMap)).length : 'N/A';
    const targetData = (colType[target] !== 'Categorical' && dataViews) ? dataViews[target] : {}
    const allVariables = [...rawHeader, ...newVariable]
    return <div className={styles.simplified}>
      <div className={styles.targetTable}>
        <div className={styles.targetHead}>
          <div className={classnames(styles.targetCell, styles.targetName)}><span>Target Variable</span></div>
          <div className={classnames(styles.targetCell, styles.large)}><span>Histogram</span></div>
          <div className={styles.targetCell}><span>Data Type</span></div>
          <div className={styles.targetCell}><span>Mean</span></div>
          <div className={styles.targetCell}><span>Unique Value</span></div>
          <div className={styles.targetCell}><span>Min</span></div>
          <div className={styles.targetCell}><span>Max</span></div>
        </div>
        <div className={styles.targetRow}>
          <div className={classnames(styles.targetCell, styles.targetName)} title={target}><span>{target}</span></div>
          <div className={classnames(styles.targetCell, styles.targetHistogram)} onClick={this.show}>
            <img src={histogramIcon} alt='histogram' />
            {<Popover placement='bottomLeft'
              visible={this.showHistograms}
              onVisibleChange={this.hide}
              trigger="click"
              content={<SimplifiedViewPlot onClose={this.hide}
                type='histogram'
                getPath={project.histgramPlot.bind(null, target)}
                path={histgramPlots[target]}
                host={host}
              />} />}
            <span>Compute</span>
          </div>
          <div className={styles.targetCell}><span>{colType[target]}</span></div>
          <div className={classnames(styles.targetCell, {
            [styles.none]: colType[target] === 'Categorical'
          })} title={targetData.mean || 'N/A'}><span>{targetData.mean || 'N/A'}</span></div>
          <div className={classnames(styles.targetCell, {
            [styles.none]: colType[target] !== 'Categorical'
          })}><span>{targetUnique || 'N/A'}</span></div>
          <div className={classnames(styles.targetCell, {
            [styles.none]: colType[target] === 'Categorical'
          })} title={targetData.min || 'N/A'}><span>{targetData.min || 'N/A'}</span></div>
          <div className={classnames(styles.targetCell, {
            [styles.none]: colType[target] === 'Categorical'
          })} title={targetData.max || 'N/A'}><span>{targetData.max || 'N/A'}</span></div>
        </div>
      </div>
      <div className={styles.simplifiedText}><span>You can use check box to create your own variable list.</span></div>
      <div className={styles.tool}>
        <div className={styles.toolSelect}>
          <div className={styles.toolLabel}><span>Current Variable List</span></div>
          <select defaultValue="all">
            <option value='all'>All Variables ({rawHeader.length - 1})</option>
          </select>
        </div>
        <div className={styles.newVariable}>
          <div className={styles.toolButton} onClick={this.showNewVariable}>
            <span>Create a New Variable</span>
          </div>
          <CreateNewVariable rawHeader={rawHeader} colType={colType} onClose={this.hideNewVariable} visible={this.visible} addNewVariable={addNewVariable} />
        </div>
        <div className={classnames(styles.toolButton, styles.toolCheck)} onClick={this.showCorrelationMatrix}>
          {this.showCorrelation && <Popover placement='left'
            visible={this.showCorrelation}
            onVisibleChange={this.hideCorrelationMatrix}
            trigger="click"
            content={<SimplifiedViewPlot onClose={this.hideCorrelationMatrix}
              type='correlationMatrix'
              getPath={this.getCorrelationMatrix}
              path={project.correlationMatrixImg}
              host={host}
            />} />}
          <span>Check Correlation Matric</span>
        </div>
      </div>
      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <div className={classnames(styles.tableTh, styles.tableCheck)}></div>
          <div className={styles.tableTh}><span>Name</span></div>
          <div className={classnames(styles.tableTh, styles.tableLarge)}><span>Histogram</span></div>
          <div className={classnames(styles.tableTh, styles.tableLarge)}><span>Univariant Plot</span></div>
          <div className={classnames(styles.tableTh, styles.tableImportance)}>
            <div className={styles.tableSort} onClick={this.sortImportance}><span><Icon type={`arrow-${this.sort === 1 ? 'up' : 'down'}`} theme="outlined" /></span></div>
            <span>Importance</span>
            <div className={styles.tableReload} onClick={this.reloadTable}><span><Icon type="reload" theme="outlined" /></span></div>
            <Hint themeStyle={{ fontSize: '1rem' }} content='It reflect the importance of the predictor to the target variable.' />
          </div>
          <div className={styles.tableTh}><span>Data type</span></div>
          <div className={styles.tableTh}><span>Mean</span></div>
          <div className={styles.tableTh}><span>Unique Value</span></div>
          <div className={styles.tableTh}><span>STD</span></div>
          <div className={styles.tableTh}><span>Median</span></div>
          <div className={styles.tableTh}><span>Min</span></div>
          <div className={styles.tableTh}><span>Max</span></div>
        </div>
        <div className={styles.tableBody}>
          {allVariables.sort((a, b) => {
            return preImportance ? this.sort * ((preImportance[a] || 0) - (preImportance[b] || 0)) : 0
          }).map((h, i) => {
            if (h === target) return null;
            const data = colType[h] !== 'Categorical' && dataViews ? (dataViews[h] || {}) : {}
            const map = targetMap || {};
            const importance = preImportance ? (preImportance[h] || 0) : 0.01;
            return <SimplifiedViewRow key={i} value={h} data={data} map={map} importance={importance} colType={colType} project={project} uniqueValues={uniqueValues[h]} isChecked={dataHeader.includes(h)} handleCheck={this.handleCheck.bind(null, h)} host={host} />
          })}
        </div>
      </div>
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

  render() {
    const { data, importance, colType, value, project, uniqueValues, isChecked, handleCheck, host } = this.props;
    return <div className={styles.tableRow}>
      <div className={classnames(styles.tableTd, styles.tableCheck)}><input type='checkbox' checked={isChecked} onChange={handleCheck} /></div>
      <div className={styles.tableTd} title={value}><span>{value}</span></div>
      <div className={classnames(styles.tableTd, styles.tableChart)} onClick={this.showHistograms}>
        <img src={histogramIcon} alt='histogram' />
        {this.histograms && <Popover placement='topLeft'
          visible={this.histograms}
          onVisibleChange={this.hideHistograms}
          trigger="click"
          content={<SimplifiedViewPlot onClose={this.hideHistograms}
            type='histgram'
            getPath={project.histgramPlot.bind(null, value)}
            path={project.histgramPlots[value]}
            host={host}
          />} />}
        <span>Compute</span>
      </div>
      <div className={classnames(styles.tableTd, styles.tableChart)} onClick={this.showUnivariant}>
        <img src={univariantIcon} alt='univariant' />
        {this.univariant && <Popover placement='topLeft'
          visible={this.univariant}
          onVisibleChange={this.hideUnivariant}
          trigger="click"
          content={<SimplifiedViewPlot onClose={this.hideUnivariant}
            type='univariate'
            getPath={project.univariatePlot.bind(null, value)}
            path={project.univariatePlots[value]}
            host={host}
          />} />}
        <span>Compute</span>
      </div>
      <div className={classnames(styles.tableTd, styles.tableImportance)}>
        <div className={styles.preImpotance}>
          <div className={styles.preImpotanceActive} style={{ width: (importance * 100) + '%' }}></div>
        </div>
      </div>
      <div className={styles.tableTd} title={colType[value]}><span>{colType[value]}</span></div>
      <div className={classnames(styles.tableTd, {
        [styles.none]: colType[value] === 'Categorical'
      })} title={data.mean || 'N/A'}><span>{data.mean || 'N/A'}</span></div>
      <div className={classnames(styles.tableTd, {
        [styles.none]: colType[value] !== 'Categorical'
      })} title={uniqueValues || 'N/A'}><span>{uniqueValues || 'N/A'}</span></div>
      <div className={classnames(styles.tableTd, {
        [styles.none]: colType[value] === 'Categorical'
      })} title={data.std || 'N/A'}><span>{data.std || 'N/A'}</span></div>
      <div className={classnames(styles.tableTd, {
        [styles.none]: colType[value] === 'Categorical'
      })} title={data.median || 'N/A'}><span>{data.median || 'N/A'}</span></div>
      <div className={classnames(styles.tableTd, {
        [styles.none]: colType[value] === 'Categorical'
      })} title={data.min || 'N/A'}><span>{data.min || 'N/A'}</span></div>
      <div className={classnames(styles.tableTd, {
        [styles.none]: colType[value] === 'Categorical'
      })} title={data.max || 'N/A'}><span>{data.max || 'N/A'}</span></div>
    </div>
  }
}

@observer
class SimplifiedViewPlot extends Component {
  constructor(props) {
    super(props)
    if (!props.path) props.getPath()
  }

  render() {
    const { onClose, path, type, host } = this.props;
    const imgPath = path ? `http://${host}:8088/download/${path}` : ''
    return <div className={styles.plot}>
      <div onClick={onClose} className={styles.plotClose}><span>X</span></div>
      {path ? <img src={imgPath} alt={type} /> : <div className={styles.plotLoad}><Spin size="large" /></div>}
    </div>
  }
}

@observer
class CreateNewVariable extends Component {
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

  hideHint = () => {
    this.hintStatus = false
    this.showFunction = {}
    this.active = 0
    this.hints = []
  }

  handleChange = e => {
    this.exp = e.target.value
  }

  changeHints = () => {
    const startIndex = this.getStartIndex()
    const functionStr = this.exp.slice(0, startIndex)
    const functionList = [...FUNCTIONS.base, ...FUNCTIONS.senior]
    const inFunction = functionList.find(v => functionStr.toLowerCase().includes(v.value.toLowerCase().slice(0, -1)))
    const isOutOfFuntion = functionStr.toLowerCase().includes(")")
    this.myFunction = isOutOfFuntion ? {} : (inFunction || {})
    let exp = this.exp.slice(startIndex, this.inputPosition).trim()
    const { rawHeader, colType } = this.props
    let valueList = [...rawHeader]
    if (isOutOfFuntion || !inFunction || inFunction.value !== "Concat()") valueList = valueList.filter(v => colType[v] === "Numerical")
    if (exp.startsWith("@")) {
      exp = exp.slice(1).trim()
      if (!exp) return this.hints = valueList.map(v => {
        return {
          label: v,
          value: "@" + v
        }
      })
    }
    let filterFunctions = [...FUNCTIONS.base]
    if (!inFunction) filterFunctions = FUNCTIONS.senior.filter(v => v.value.toLowerCase().includes(exp.toLowerCase())).concat(filterFunctions)
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

  handleSelect = value => {
    // this.exp = value
    const startIndex = this.getStartIndex()
    this.exp = this.exp.slice(0, startIndex) + value + this.exp.slice(this.inputPosition)
  }

  onKeyDown = e => {
    // enter
    if (e.keyCode === 13) {
      if (!this.hints.length) return
      const selectValue = this.hints[this.active]
      if (!selectValue) return
      this.handleSelect(selectValue.value)
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

  onSelect = e => {
    this.inputPosition = e.target.selectionEnd
    this.changeHints()
    this.hintStatus = true
  }

  showSyntax = n => {
    this.active = n
    this.showFunction = this.hints[this.active]
  }

  handleAdd = () => {
    const { name, exp } = this
    if (!name) {
      antdMessage.error("name is empty")
      return
    }
    const checked = this.checkExp(exp)
    if (!checked.isPass) return antdMessage.error(checked.message)
    const num = checked.num
    const nameArray = []
    if (num === 1) {
      nameArray.push("r2_" + name)
    } else {
      for (let n = 0; n < num; n++) {
        nameArray.push(`r2_${name}_${n + 1}`)
      }
    }
    this.loading = true
    this.props.addNewVariable(nameArray, exp).then(result => {
      this.loading = false
      if (result) this.props.onClose()
    })
  }

  checkExp = _expression => {
    let expression = _expression
    if (!expression) return { isPass: true, message: "ok", num: 0 }
    const baseOptReg = new RegExp(/[\+\-\*\/]/)
    const exps = []
    let num = 1
    let start = 0
    let end = 0
    let functions = 0
    let seniorFunctions = 0
    while (true) {
      start = expression.indexOf("(", start) + 1
      end = expression.indexOf(")", start) + 1
      if (start === 0 || end === 0 || start > end) {
        exps.push(expression)
        break
      }
      while (true) {
        let center = start
        let centerNum = 0
        while (true) {
          center = expression.indexOf("(", center) + 1
          if (center === 0 || center > end) break;
          start = center
          centerNum++
        }
        if (!centerNum) break;
        while (centerNum) {
          end = expression.indexOf(")", end) + 1
          if (end === 0) break
          centerNum--
        }
        if (centerNum) return { isPass: false, message: "error expression" }
      }
      const str = expression.slice(0, end)
      exps.push(str)
      expression = expression.slice(end)
      if (!expression.trim()) break
      const optIndex = expression.search(baseOptReg)
      if (optIndex === -1) return { isPass: false, message: `Unexpected identifier: ${expression}` }
      expression = expression.slice(optIndex + 1)
    }
    for (let exp of exps) {
      const start = exp.indexOf("(")
      const end = exp.lastIndexOf(")")
      const hasFunction = start > -1 && end > -1 && end > start
      if (!hasFunction) {
        const array = exp.split(baseOptReg)
        const isPass = this.checkParams(array)
        if (!isPass) return { isPass: false, message: "error expression" }
      } else {
        const prev = exp.slice(0, start)
        const prevArray = prev.split(baseOptReg)
        const functionName = prevArray.pop().trim()
        if (functionName) {
          const isBase = FUNCTIONS.base.find(f => f.value.slice(0, -2) === functionName)
          const isSenior = FUNCTIONS.senior.find(f => f.value.slice(0, -2) === functionName)
          const isFunction = (isBase || isSenior)
          functions += isFunction ? 1 : 0
          seniorFunctions += isSenior ? 1 : 0
          if (!isFunction) return { isPass: false, message: `error function:"${functionName}"` }
          const functionExp = exp.slice(start + 1, end)
          if (!functionExp.trim()) return { isPass: false, message: `function: "${functionName}" must have param` }
          const params = functionExp.split(",")
          if (isFunction.params && params.length !== isFunction.params) return { isPass: false, message: `function: "${functionName}" must have ${isFunction.params} param` }
          if (isSenior) {
            const seniorChecked = this.checkSeniorParams(isSenior, params)
            if (!seniorChecked.isPass) return seniorChecked
            num += seniorChecked.num - 1
            const next = exp.slice(end + 1)
            const nextArray = next.split(baseOptReg)
            nextArray.shift()
            const checkArray = [...prevArray, ...nextArray]
            for (let checkStr of checkArray) {
              const checked = this.checkExp(checkStr)
              if (!checked.isPass) return checked
              num += checked.num - 1
              functions += checked.functions
              seniorFunctions += checked.seniorFunctions
            }
          } else {
            const next = exp.slice(end + 1)
            const nextArray = next.split(baseOptReg)
            nextArray.shift()
            const checkArray = [...prevArray, ...params, ...nextArray]
            for (let checkStr of checkArray) {
              const checked = this.checkExp(checkStr)
              if (!checked.isPass) return checked
              num += checked.num - 1
              functions += checked.functions
              seniorFunctions += checked.seniorFunctions
            }
          }
        } else {
          const isPrevPass = this.checkParams(prevArray)
          if (!isPrevPass) return { isPass: false, message: "error expression" }
          const functionExp = exp.slice(start + 1, end)
          if (!functionExp.trim()) return { isPass: false, message: `Unexpected token )` }
          const fnArray = functionExp.split(baseOptReg)
          for (let checkStr of fnArray) {
            const checked = this.checkExp(checkStr)
            if (!checked.isPass) return checked
            num += checked.num - 1
            functions += checked.functions
            seniorFunctions += checked.seniorFunctions
          }
          const next = exp.slice(end + 1)
          const nextArray = next.split(baseOptReg)
          nextArray.shift()
          const isNextPass = this.checkParams(nextArray)
          if (!isNextPass) return { isPass: false, message: "error expression" }
        }
      }
    }
    if (seniorFunctions > 1) return { isPass: false, message: "error expression" }
    return { isPass: true, message: "ok", num: num, functions, seniorFunctions }
  }

  checkParams = array => {
    const { rawHeader } = this.props
    for (let item of array) {
      let value = item.trim()
      if (value.startsWith("@")) value = value.slice(1)
      if (!value || (!rawHeader.includes(value) && isNaN(value))) return false
    }
    return true
  }

  checkSeniorParams = (senior, params) => {
    let num = 0
    const length = params.length
    if (length < 1) return { isPass: false, message: `function: ${senior.value.slice(0, -2)} must have param` }
    let numOfParam = 0
    for (let value of params) {
      if (!value) return { isPass: false, message: `function: ${senior.value.slice(0, -2)} param error` }
      if (value.includes("@")) numOfParam++
      if (!value.includes("@")) break;
    }
    const numList = params.slice(numOfParam)
    switch (senior.value) {
      case "Concat()":
        if (numOfParam < 2) return { isPass: false, message: `function: ${senior.value.slice(0, -2)} has At least 3 parameters` }
        const concatResults = numList.map(n => {
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
        const diffResults = numList.map(n => {
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
        num = numOfParam
        break;
      case "Combine()":
        const combineArray = ["min", "max", "mean", "sum"]
        for (let row of numList) {
          if (!combineArray.includes(row.trim())) return { isPass: false, message: `${row} is not supported` }
        }
        num = length - numOfParam
        break;
      case "Quantile_bin()":
        const quantileBinArray = ["value", "frequency"]
        const [b, type1, type2] = numList
        if (isNaN(b) || b.includes(".")) return { isPass: false, message: `${b} must be integer` }
        if (!quantileBinArray.includes(type1.trim())) return { isPass: false, message: `${type1} is not supported` }
        if (type2 && !quantileBinArray.includes(type2.trim())) return { isPass: false, message: `${type2} is not supported` }
        num = numOfParam * (type2 ? 2 : 1)
        break;
      case "Custom_Quantile_bin()":
        const numResults = numList.map(n => {
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
    if (num < 1) return { isPass: false, message: "error expression" }
    return { isPass: true, message: "ok", num: num }
  }

  factorial = (n) => {
    if (n < 2) return 1
    return n * this.factorial(n - 1)
  }

  handleNameChange = e => {
    const value = e.target.value.trim()
    this.name = value
  }

  render() {
    const { visible, onClose } = this.props
    const functionList = [...FUNCTIONS.base, ...FUNCTIONS.senior]
    const functionSyntax = functionList.find(v => v.syntax === this.myFunction.syntax) || functionList.find(v => v.syntax === this.showFunction.syntax)

    return visible && <div className={styles.newVariableBlock}>
      <div className={styles.newVariableRow}>
        <div className={styles.newVariableName}>
          <input className={styles.newVariableInput} placeholder="name" value={this.name} onChange={this.handleNameChange} />
        </div>
        <span>=</span>
        <div className={styles.newVariableFx}>
          <input className={styles.newVariableInput} placeholder="fx" value={this.exp} onChange={this.handleChange} onKeyDown={this.onKeyDown} onBlur={this.hideHint} onSelect={this.onSelect} />
          {this.hintStatus && <div className={styles.newVariableHintList}>
            {this.hints.map((v, k) => {
              return <div key={k} className={classnames(styles.newVariableHint, {
                [styles.activeHint]: this.active === k
              })} onMouseDown={this.handleSelect.bind(null, v.value)} onMouseOver={this.showSyntax.bind(null, k)}><span>{v.label}</span></div>
            })}
          </div>}
          {!!functionSyntax && <div className={classnames(styles.newVariableSyntax, {
            [styles.hasList]: this.hintStatus && !!this.hints.length
          })}><span>{functionSyntax.syntax}</span></div>}
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
