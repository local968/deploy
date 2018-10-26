import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import Hint from 'components/Common/Hint';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import { Spin, Popover } from 'antd';
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

  getHistograms = value => {
    if (!value) {
      value = []
    } else {
      value = [value]
    }
    this.props.project.histgramPlot(value)
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

  render() {
    const { project } = this.props;
    const { target, colType, colMap, targetMap, dataViews, rawHeader, preImportance, uniqueValues, histgramPlots, dataHeader, problemType } = project;
    const targetUnique = colType[target] === 'Categorical' ? Object.values(Object.assign({}, colMap[target], targetMap)).length : 'N/A';
    const targetData = (colType[target] !== 'Categorical' && dataViews) ? dataViews[target] : {}
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
                getPath={this.getHistograms.bind(null, target)}
                path={histgramPlots[target]}
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
          <CreateNewVariable rawHeader={rawHeader} colType={colType} onClose={this.hideNewVariable} visible={this.visible}/>
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
            <div className={styles.tableSort} onClick={this.sortImportance}><span>sort</span></div>
            <span>Importance</span>
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
          {rawHeader.sort((a, b) => {
            return preImportance ? this.sort * (preImportance[a] - preImportance[b]) : 0
          }).map((h, i) => {
            if (h === target) return null;
            const data = colType[h] !== 'Categorical' && dataViews ? dataViews[h] : {}
            const map = targetMap || {};
            const importance = preImportance ? preImportance[h] : 0.01;
            return <SimplifiedViewRow key={i} value={h} data={data} map={map} importance={importance} colType={colType} project={project} uniqueValues={uniqueValues[h]} isChecked={dataHeader.includes(h)} handleCheck={this.handleCheck.bind(null, h)} />
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

  getHistograms = value => {
    if (!value) {
      value = []
    } else {
      value = [value]
    }
    this.props.project.histgramPlot(value)
  }

  getUnivariant = value => {
    if (!value) {
      value = []
    } else {
      value = [value]
    }
    this.props.project.univariatePlot(value)
  }

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
    const { data, importance, colType, value, project, uniqueValues, isChecked, handleCheck } = this.props;
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
            getPath={this.getHistograms.bind(null, value)}
            path={project.histgramPlots[value]}
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
            getPath={this.getUnivariant.bind(null, value)}
            path={project.univariatePlots[value]}
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
    const { onClose, path, type } = this.props;
    const imgPath = path ? `http://${config.uploadServer}/download/${path}` : ''
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
  @observable showFunction = {}
  @observable active = 0
  //光标结束位置
  @observable inputPosition = 0
  @observable myFunction = {}

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
    const hasFunction = FUNCTIONS.find(v => functionStr.toLowerCase().includes(v.value.toLowerCase()) || functionStr.toLowerCase().includes(v.value.toLowerCase().slice(0, -1)))
    this.myFunction = hasFunction || {}
    let exp = this.exp.slice(startIndex, this.inputPosition).trim()
    const { rawHeader, colType } = this.props
    let valueList = [...rawHeader]
    if (hasFunction && hasFunction.value !== "combine()") valueList = valueList.filter(v => colType[v] === "Numerical")
    if (exp.startsWith("@")) {
      exp = exp.slice(1).trim()
      if (!exp) return this.hints = valueList.map(v => {
        return {
          label: v,
          value: "@" + v
        }
      })
    }
    const isFunction = FUNCTIONS.find(v => v.value.toLowerCase() === exp.toLowerCase() || v.value === exp.toLowerCase() + ")")
    if (isFunction) {
      this.hints = []
      this.myFunction = isFunction
      this.showFunction = {}
      return
    }
    let filterFunctions = []
    if (!hasFunction) {
      filterFunctions = FUNCTIONS.filter(v => v.value.toLowerCase().includes(exp.toLowerCase()))
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

  handleSelect = value => {
    // this.exp = value
    const startIndex = this.getStartIndex()
    this.exp = this.exp.slice(0, startIndex) + value + this.exp.slice(this.inputPosition)
  }

  onKeyDown = e => {
    // enter
    if (e.keyCode === 13) {
      if(!this.hints.length) return
      const selectValue = this.hints[this.active]
      if(!selectValue) return
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

  render() {
    const {visible, onClose} = this.props
    const functionSyntax = FUNCTIONS.find(v => v.syntax === this.myFunction.syntax) || FUNCTIONS.find(v => v.syntax === this.showFunction.syntax)

    return visible && <div className={styles.newVariableBlock}>
      <div className={styles.newVariableRow}>
        <span>Fx =</span>
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
        <button className={classnames(styles.newVariableButton, styles.newVariableAdd)}>
          <span>Add</span>
        </button>
        <button className={classnames(styles.newVariableButton, styles.newVariableCancel)} onClick={onClose}>
          <span>Cancel</span>
        </button>
      </div>
    </div>
  }
}