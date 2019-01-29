import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Hint, ProcessLoading } from 'components/Common';
import { observable } from 'mobx';
import { Spin, Popover, message as antdMessage, Icon, Table } from 'antd';
import histogramIcon from './histogramIcon.svg';
import univariantIcon from './univariantIcon.svg';
import config from 'config'

@observer
export default class SimplifiedView extends Component {
  @observable sort = -1
  @observable showHistograms = false
  @observable showCorrelation = false
  @observable visible = false

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

  formatNumber = (num, isNA) => {
    if (isNA) return "N/A"
    if (typeof num === "number") return num.toFixed(2)
    if (typeof num === "string") return num
    return "N/A"
  }

  render() {
    const { project } = this.props;
    const { target, colType, targetMap, dataViews, dataViewsLoading, preImportance, preImportanceLoading, histgramPlots, dataHeader, addNewVariable, newVariable, newType, id, informativesLabel, trainHeader, expression, customHeader, totalLines, dataViewProgress, importanceProgress } = project;
    const allVariables = [...dataHeader.filter(h => h !== target), ...newVariable]
    const variableType = { ...newType, ...colType }
    return <div className={styles.simplified}>
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
              return <SimplifiedViewRow
              key={i}
              value={h}
              data={data}
              map={map}
              importance={importance}
              colType={variableType}
              project={project}
              lines={Math.min(Math.floor(totalLines * 0.95), 1000)} id={id} />
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
    const { data, importance, colType, value, project, id, lines } = this.props;
    const valueType = colType[value] === 'Numerical' ? 'Numerical' : 'Categorical'
    const isRaw = colType[value] === 'Raw'
    const unique = (isRaw && `${lines}+`) || (valueType === 'Numerical' && 'N/A') || data.uniqueValues
    return <div className={styles.tableRow}>
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
