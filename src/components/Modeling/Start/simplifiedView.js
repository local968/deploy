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
    const { target, colType, colMap, targetMap, dataViews, rawHeader, preImportance, uniqueValues, histgramPlots, dataHeader } = project;
    const targetUnique = Object.values(Object.assign({}, colMap[target], targetMap)).length;
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
          <div className={styles.targetCell}><span>{targetUnique}</span></div>
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
        {/* <div className={styles.newVariable}>
          <div className={styles.toolButton} onClick={this.showNewVariable}>
            <span>Create a New Variable</span>
          </div>
          {this.visible && <CreateNewVariable />}
        </div> */}
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

  showHint = () => {

  }

  hideHint = () => {

  }

  render() {
    return <div className={styles.newVariableBlock}>
      <div className={styles.newVariableRow}>
        <div className={styles.newVariableName}><input className={styles.newVariableInput} placeholder="Name" /></div>
        <span>=</span>
        <div className={styles.newVariableFx}>
          <input className={styles.newVariableInput} placeholder="fx" onFocus={this.showHint} onBlur={this.hideHint} />
        </div>
      </div>
      <div className={styles.newVariableRow}>
        <button className={classnames(styles.newVariableButton, styles.newVariableAdd)}>
          <span>Add</span>
        </button>
        <button className={classnames(styles.newVariableButton, styles.newVariableCancel)}>
          <span>Cancel</span>
        </button>
      </div>
    </div>
  }
}