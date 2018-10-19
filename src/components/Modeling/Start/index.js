import React, { Component } from 'react';
import 'rc-slider/assets/index.css';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import autoIcon from './mr-one-logo-blue.svg';
import { Modal } from 'components/Common';
import { when, observable } from 'mobx';
import { Spin, Popover } from 'antd';
import histogramIcon from './histogramIcon.svg';
import univariantIcon from './univariantIcon.svg';
import config from 'config';
import Slider from 'rc-slider';

const Range = Slider.Range;

@observer
export default class StartTrain extends Component {
  @observable visible = false

  fastTrain = () => {
    this.props.project.fastTrain();
  };

  advanced = () => {
    this.visible = true
  }

  closeAdvanced = () => {
    this.visible = false
  }

  render() {
    return (
      <div className={styles.modelStart}>
        <div className={styles.startTitle}>
          <span>Data looks good now, It’s time to train your model!</span>
        </div>
        <div className={styles.trainWarp}>
          <div className={styles.trainBox}>
            <div className={styles.trainBlock}>
              <div className={styles.trainRecommend}>
                <span>Recommended</span>
              </div>
              <div className={styles.trainImg}>
                <img src={autoIcon} alt="auto" />
              </div>
              <div className={styles.trainName}>
                <span>Easy and simple</span>
              </div>
              <div className={styles.trainDesc}>
                <span>
                  If you want Mr.One to build the model automatically, choose
                  automatic modeling.
                </span>
              </div>
            </div>
            <button className={styles.train} onClick={this.fastTrain}>
              <span>Automatic Modeling</span>
            </button>
          </div>
          <div className={styles.trainSep}></div>
          <div className={styles.trainBox}>
            <div className={styles.trainBlock}>
              <div className={styles.trainImg}>
                <img src={autoIcon} alt="auto" />
              </div>
              <div className={styles.trainName}>
                <span>Detailed and advanced</span>
              </div>
              <div className={styles.trainDesc}>
                <span>
                  If you want to have more control over the modeling process, choose advanced modeling.
                </span>
              </div>
            </div>
            <button className={styles.train} onClick={this.advanced}>
              <span>Advanced Modeling</span>
            </button>
          </div>
        </div>
        <Modal width='13em' content={<AdvancedModel project={this.props.project} closeAdvanced={this.closeAdvanced} />} title='Advanced Modeling' onClose={this.closeAdvanced} visible={this.visible} />
      </div>
    );
  }
}

@observer
class AdvancedModel extends Component {
  @observable tab = 1

  switchTab = (num) => {
    if (num !== 1 && num !== 2) return false;
    this.tab = num
  }

  modeling = () => {
    const { project, closeAdvanced } = this.props
    closeAdvanced()
    project.advancedModeling()
  }

  render() {
    const { project, closeAdvanced } = this.props
    return <div className={styles.advancedModel}>
      <div className={styles.advancedContent}>
        <div className={styles.tabBox}>
          <div className={classnames(styles.tab, {
            [styles.active]: this.tab === 1
          })} onClick={this.switchTab.bind(null, 1)}><span>Advanced Variable Setting</span></div>
          <div className={classnames(styles.tab, {
            [styles.active]: this.tab === 2
          })} onClick={this.switchTab.bind(null, 2)}><span>Advanced Modeling Setting</span></div>
        </div>
        {this.tab === 1 ? <SimplifiedView project={project} /> : <AdvancedView project={project} />}
        <div className={styles.bottom}>
          <button className={styles.save} onClick={this.modeling} ><span>modeling</span></button>
          <button className={styles.cancel} onClick={closeAdvanced}><span>cancel</span></button>
        </div>
      </div>
    </div>
  }
}

@observer
class SimplifiedView extends Component {
  @observable sort = -1
  @observable showHistograms = false
  @observable showCorrelation = false

  componentDidMount() {
    when(
      () => !this.props.project.dataViews,
      () => this.props.project.dataView()
    )
    when(
      () => !this.props.project.preImportance,
      () => this.props.project.preTrainImportance()
    )
  }

  show = () => {
    when(
      () => !this.props.project.histograms,
      () => this.props.project.histgramPlot()
    )
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
    when(
      () => !this.props.project.correlationMatrixImg,
      () => this.props.project.correlationMatrix()
    )
    this.showCorrelation = true
  }

  hideCorrelationMatrix = e => {
    e && e.stopPropagation();
    this.showCorrelation = false
  }

  render() {
    const { project } = this.props;
    const { target, colType, colMap, targetMap, dataViews, rawHeader, preImportance, uniqueValues } = project;
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
                path={project.histgramPlots ? project.histgramPlots.target : ''}
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
        {/* <div className={styles.toolButton}><span>Create a New Variable</span></div> */}
        <div className={classnames(styles.toolButton, styles.toolCheck)} onClick={this.showCorrelationMatrix}>
          {this.showCorrelation && <Popover placement='left'
            visible={this.showCorrelation}
            onVisibleChange={this.hideCorrelationMatrix}
            trigger="click"
            content={<SimplifiedViewPlot onClose={this.hideCorrelationMatrix}
              type='correlationMatrix'
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
            return <SimplifiedViewRow key={i} value={h} data={data} map={map} importance={importance} colType={colType} project={project} uniqueValues={uniqueValues[h]} />
          })}
        </div>
      </div>
      {(!dataViews || !preImportance) && <div className={styles.simplifiedLoad}>
        <Spin size="large" />
      </div>}
    </div>
  }
}

@observer
class SimplifiedViewRow extends Component {
  @observable histograms = false
  @observable univariant = false

  showHistograms = () => {
    when(
      () => !this.props.project.histgramPlots,
      () => this.props.project.histgramPlot()
    )
    this.histograms = true
  }

  showUnivariant = () => {
    when(
      () => !this.props.project.univariatePlots,
      () => this.props.project.univariatePlot()
    )
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
    const { data, map, importance, colType, value, project, uniqueValues } = this.props;
    return <div className={styles.tableRow}>
      <div className={classnames(styles.tableTd, styles.tableCheck)}><input type='checkbox' defaultChecked={true} /></div>
      <div className={styles.tableTd} title={value}><span>{value}</span></div>
      <div className={classnames(styles.tableTd, styles.tableChart)} onClick={this.showHistograms}>
        <img src={histogramIcon} alt='histogram' />
        {this.histograms && <Popover placement='topLeft'
          visible={this.histograms}
          onVisibleChange={this.hideHistograms}
          trigger="click"
          content={<SimplifiedViewPlot onClose={this.hideHistograms}
            type='histgram'
            path={project.histgramPlots ? project.histgramPlots[value] : ''}
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
            path={project.univariatePlots ? project.univariatePlots[value] : ''}
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
class AdvancedView extends Component {
  // @observable type = ''

  handleName = (e) => {
    this.props.project.advancedName = e.target.value;
  }

  handleSize = (e) => {
    let value = e.target.value;
    if (value && !isNaN(value)) {
      value = parseInt(value, 10)
      if (value < 1 || value > 30) return;
      this.props.project.advancedSize = value;
    }
  }

  handleSlider = value => {
    const { runWith } = this.props.project;
    if (runWith === 'holdout') {
      this.props.project.holdoutRate = (100 - value[1]);
      this.props.project.validationRate = (value[1] - value[0]);
    } else {
      this.props.project.holdoutRate = (100 - value[0]);
    }
  }

  changeValidationRate = e => {
    let value = e.target.value;
    if (value && !isNaN(value)) {
      const { validationRate, holdoutRate } = this.props.project;
      value = parseInt(value, 10)
      if (value < 1) value = 1;
      if (value + holdoutRate > 99) value = 99 - holdoutRate;
      if (validationRate === value) return;
      this.props.project.validationRate = value;
    }
  }

  changeHoldoutRate = e => {
    let value = e.target.value;
    if (value && !isNaN(value)) {
      const { holdoutRate, validationRate, runWith } = this.props.project;
      const num = runWith === 'holdout' ? validationRate : 0;
      value = parseInt(value, 10);
      if (value < 1) value = 1;
      if (value + num > 99) value = 99 - num;
      if (holdoutRate === value) return;
      this.props.project.holdoutRate = value;
    }
  }

  changeCrossCount = e => {
    let value = e.target.value;
    if (value && !isNaN(value)) {
      const { crossCount } = this.props.project;
      value = parseInt(value, 10);
      if (value > 15) value = 15;
      if (value < 2) value = 2;
      if (value === crossCount) return;
      this.props.project.crossCount = value;
    }
  }

  handleMaxTime = e => {
    let value = e.target.value;
    if (value && !isNaN(value)) {
      value = parseFloat(value)
      if (value < 3) return;
      this.props.project.maxTime = value;
    }
  }

  handleRandSeed = e => {
    let value = e.target.value;
    if (value && !isNaN(value)) {
      value = parseInt(value, 10)
      if (value < 0 || value > 99999999) return;
      this.props.project.randSeed = value;
    }
  }

  handleMeasurement = e => {

  }

  handleRunWith = v => {
    if (v === 'holdout') {
      const { validationRate, holdoutRate } = this.props.project;
      if (validationRate + holdoutRate > 99) {
        this.props.project.holdoutRate = Math.min((99 - validationRate), 10);
      }
    }
    this.props.project.runWith = v;
  }

  handleResampling = v => {
    this.props.project.resampling = v;
  }

  crossPercent = () => {
    const { crossCount, holdoutRate } = this.props.project;
    const percent = 100 - holdoutRate;
    const arr = [];
    for (let i = 0; i < crossCount; i++) {
      arr.push(<div className={styles.advancedPercentCross} style={{ width: (percent / crossCount) + '%' }} key={i}></div>)
    }
    return arr
  }

  render() {
    const { advancedName, advancedSize, validationRate, holdoutRate, maxTime, randSeed, measurement, runWith, resampling, crossCount, problemType } = this.props.project;
    const measurementList = problemType === "Classification" ?
      [{ value: "accuracy", label: 'Accuracy' }, { value: "auc", label: 'AUC' }, { value: "f1", label: 'F1' }] :
      [{ value: "r2", label: 'R²' }, { value: "mse", label: 'MSE' }]

    return <div className={styles.advanced}>
      <div className={styles.advancedRow}>
        <div className={styles.advancedLeft}>
          <div className={styles.advancedBlock}>
            <div className={styles.advancedTitle}>
              <span>Select From Previous Settings:</span>
            </div>
            <div className={styles.advancedOption}>
              <select>
                <option value={advancedName || 1}>{advancedName || 'custom.03.07.2018_23:14:40'}</option>
              </select>
            </div>
          </div>
        </div>
        <div className={styles.advancedRight}>
          <div className={styles.advancedBlock}>
            <div className={classnames(styles.advancedTitle, styles.limit)}>
              <span>Name Your Model Settings:</span>
            </div>
            <div className={styles.advancedOption}>
              <input type="text" value={advancedName} onChange={this.handleName} />
            </div>
          </div>
        </div>
      </div>
      <div className={styles.advancedRow}>
        <div className={styles.advancedLeft}>
          {/* <div className={styles.advancedBlock}>
            <div className={styles.advancedTitle}>
              <span>Select Algorithm:</span>
            </div>
            <div className={styles.advancedOption}>
              <div className={styles.advancedOptionBox}><input id="solutiona" type='checkbox' name="algorithm" defaultChecked={true} /><label htmlFor="solutiona">solution-a</label></div>
              <div className={styles.advancedOptionBox}><input id="solutionb" type='checkbox' name="algorithm" defaultChecked={true} /><label htmlFor="solutionb">solution-b</label></div>
            </div>
          </div> */}
          <div className={styles.advancedBlock}>
            <div className={styles.advancedResampling}>
              <div className={styles.advancedTitle}>
                <span>Resampling Setting:</span>
              </div>
              <div className={styles.advancedOptionBox}>
                <input id="resampling1" type='radio' name="resampling" checked={resampling === "up"} onChange={this.handleResampling.bind(null, 'up')} />
                <label htmlFor="resampling1">Upsampling</label>
              </div>
              <div className={styles.advancedOptionBox}>
                <input id="resampling2" type='radio' name="resampling" checked={resampling === "down"} onChange={this.handleResampling.bind(null, 'down')} />
                <label htmlFor="resampling2">Downsampling</label>
              </div>
              <div className={styles.advancedOptionBox}>
                <input id="resampling3" type='radio' name="resampling" checked={resampling === "no"} onChange={this.handleResampling.bind(null, 'no')} />
                <label htmlFor="resampling3">No resampling</label>
              </div>
              <div className={styles.advancedOptionBox}>
                <input id="resampling4" type='radio' name="resampling" checked={resampling === "auto"} onChange={this.handleResampling.bind(null, 'no')} />
                <label htmlFor="resampling4">Auto resampling</label>
              </div>
            </div>
            <div className={styles.advancedOther}>
              <div className={styles.advancedBlock}>
                <div className={classnames(styles.advancedTitle, styles.otherLabel)}>
                  <span>Set Measurement:</span>
                </div>
                <div className={styles.advancedOption}>
                  <select className={classnames(styles.advancedSize, styles.inputLarge)} value={measurement} onChange={this.handleMeasurement} >
                    {measurementList.map((i, k) => {
                      return <option value={i.value} key={k}>{i.label}</option>
                    })}
                  </select>
                </div>
              </div>
              <div className={styles.advancedBlock}>
                <div className={classnames(styles.advancedTitle, styles.otherLabel)}>
                  <span>Set Max Training Time:</span>
                  <span className={styles.advancedDesc}>Max amount of time to evaluate different modules.</span>
                </div>
                <div className={styles.advancedOption}>
                  <input className={styles.advancedSize} value={maxTime} onChange={this.handleMaxTime} />
                  <span>Minutes<br />(3 minutes or longer)</span>
                </div>
              </div>
              <div className={styles.advancedBlock}>
                <div className={classnames(styles.advancedTitle, styles.otherLabel)}>
                  <span>Random Seed:</span>
                  <span className={styles.advancedDesc}>Value between 0 - 99999999</span>
                </div>
                <div className={styles.advancedOption}>
                  <input className={classnames(styles.advancedSize, styles.inputLarge)} value={randSeed} onChange={this.handleRandSeed} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.advancedRight}>
          <div className={styles.advancedBlock}>
            <div className={classnames(styles.advancedTitle, styles.limit)}>
              <span>Set Model Ensemble Size:</span>
              <span className={styles.advancedDesc}>Actual number of ensemble models may be less than this number.</span>
            </div>
            <div className={styles.advancedOption}>
              <input className={styles.advancedSize} value={advancedSize} onChange={this.handleSize} />
              <span>(1~30)</span>
            </div>
          </div>
          <div className={styles.advancedBlock}>
            <div className={styles.advancedTitle}>
              <span>Run models with:</span>
            </div>
            <div className={styles.advancedOption}>
              <div className={styles.advancedOptionBox}>
                <input id="runwith1" type='radio' name="runWith" checked={runWith === "cross"} onChange={this.handleRunWith.bind(null, 'cross')} />
                <label htmlFor="runwith1">Cross Validation</label>
              </div>
              <div className={styles.advancedOptionBox}>
                <input id="runwith2" type='radio' name="runWith" checked={runWith === "holdout"} onChange={this.handleRunWith.bind(null, 'holdout')} />
                <label htmlFor="runwith2">Train / Validation / Holdout</label>
              </div>
            </div>
          </div>
          <div className={styles.advancedBlock}>
            <div className={styles.advancedBox}>
              <div className={styles.advancedTitle}>
                <span>Set Percentage of Each Part:</span>
              </div>
              {runWith === "holdout" ? <div className={styles.advancedPercentBlock}>
                <div className={styles.advancedPercent}>
                  <div className={styles.advancedPercentTrain} style={{ width: (100 - validationRate - holdoutRate) + '%' }}></div>
                  <div className={styles.advancedPercentValidation} style={{ width: validationRate + "%" }}></div>
                  <div className={styles.advancedPercentHoldout} style={{ width: holdoutRate + '%' }}></div>
                </div>
                <Range
                  className={styles.range}
                  railStyle={{ backgroundColor: 'transparent' }}
                  trackStyle={[{ backgroundColor: 'transparent' }, { backgroundColor: 'transparent' }]}
                  handleStyle={[{
                    backgroundImage: 'radial-gradient(circle at 50% 0, #a3a0a0, #cdcdcd)',
                    border: '0.07em solid #e8e8e8',
                    width: '0.3em',
                    height: '0.3em',
                    marginLeft: '-0.15em',
                    marginTop: '-0.13em',
                    borderRadius: '50%',
                    display: 'flex',
                    flex: 'none',
                    alignitems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }, {
                    backgroundImage: 'radial-gradient(circle at 50% 0, #a3a0a0, #cdcdcd)',
                    border: '0.07em solid #e8e8e8',
                    width: '0.3em',
                    height: '0.3em',
                    marginLeft: '-0.15em',
                    marginTop: '-0.13em',
                    borderRadius: '50%',
                    display: 'flex',
                    flex: 'none',
                    alignitems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }]}
                  value={[100 - parseInt(validationRate, 10) - parseInt(holdoutRate, 10), 100 - parseInt(holdoutRate, 10)]}
                  onChange={this.handleSlider}
                  allowCross={false}
                  pushable={1}
                  count={2}
                  min={1}
                  max={99}
                />
              </div> : <div className={styles.advancedPercentBlock} >
                  <div className={styles.advancedPercent}>
                    {this.crossPercent()}
                    <div className={styles.advancedPercentHoldout} style={{ width: holdoutRate + '%' }}></div>
                  </div>
                  <Range
                    className={styles.range}
                    railStyle={{ backgroundColor: 'transparent' }}
                    trackStyle={[{ backgroundColor: 'transparent' }]}
                    handleStyle={[{
                      backgroundImage: 'radial-gradient(circle at 50% 0, #a3a0a0, #cdcdcd)',
                      border: '0.07em solid #e8e8e8',
                      width: '0.3em',
                      height: '0.3em',
                      marginLeft: '-0.15em',
                      marginTop: '-0.13em',
                      borderRadius: '50%',
                      display: 'flex',
                      flex: 'none',
                      alignitems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }]}
                    value={[100 - parseInt(holdoutRate, 10)]}
                    onChange={this.handleSlider}
                    allowCross={false}
                    pushable={1}
                    count={1}
                    min={1}
                    max={99}
                  />
                </div>}
              {runWith === "holdout" ? <div className={styles.advancedPercentBox}>
                <div className={styles.advancedPercentInput}>
                  <div className={styles.advancedPercentText}>
                    <div className={classnames(styles.advancedPercetColor, styles.advancedPercentTrain)}></div>
                    <span>Training</span>
                  </div>
                  <input disabled={true} value={100 - parseInt(validationRate, 10) - parseInt(holdoutRate, 10)} />
                  <span>%</span>
                </div>
                <div className={styles.advancedPercentInput}>
                  <div className={styles.advancedPercentText}>
                    <div className={classnames(styles.advancedPercetColor, styles.advancedPercentValidation)}></div>
                    <span>Validation</span>
                  </div>
                  <input value={parseInt(validationRate, 10)} onChange={this.changeValidationRate} />
                  <span>%</span>
                </div>
                <div className={styles.advancedPercentInput}>
                  <div className={styles.advancedPercentText}>
                    <div className={classnames(styles.advancedPercetColor, styles.advancedPercentHoldout)}></div>
                    <span>Holdout</span>
                  </div>
                  <input value={parseInt(holdoutRate, 10)} onChange={this.changeHoldoutRate} />
                  <span>%</span>
                </div>
              </div> : <div className={styles.advancedPercentBox}>
                  <div className={styles.advancedPercentInput}>
                    <div className={styles.advancedPercentText}>
                      <div className={classnames(styles.advancedPercetColor, styles.advancedPercentCross)}></div>
                      <span>Select Number of CV folds</span>
                    </div>
                    <input value={crossCount} onChange={this.changeCrossCount} />
                  </div>
                  <div className={styles.advancedPercentInput}>
                    <div className={styles.advancedPercentText}>
                      <div className={classnames(styles.advancedPercetColor, styles.advancedPercentHoldout)}></div>
                      <span>Holdout</span>
                    </div>
                    <input value={parseInt(holdoutRate, 10)} onChange={this.changeHoldoutRate} />
                    <span>%</span>
                  </div>
                </div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  }
}
