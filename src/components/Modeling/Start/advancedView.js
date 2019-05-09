import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { action } from 'mobx';
import { NumberInput, Range } from 'components/Common';
import { Select, message, Tooltip } from 'antd';
import Algorithms from './algorithms';
import moment from 'moment';
import EN from '../../../constant/en';

const Option = Select.Option;

@observer
export default class AdvancedView extends Component {

  handleName = action((e) => {
    const { project } = this.props
    project.settings.find(s => s.id === project.settingId).name = e.target.value || `custom.${moment().format('MM.DD.YYYY_HH:mm:ss')}`
  })

  handleSize = value => {
    this.props.project.ensembleSize = value;
  }

  handleSlider = value => {
    const [min, max] = value
    if (max === min) return
    this.props.project.holdoutRate = 100 - max;
    this.props.project.validationRate = max - min;
  }

  handleDrag = value => {
    this.props.project.holdoutRate = 100 - value;
  }

  changeValidationRate = value => {
    const { validationRate, holdoutRate } = this.props.project;
    if (value < 1) value = 1;
    if (value + holdoutRate > 99) value = 99 - holdoutRate;
    if (validationRate === value) return;
    this.props.project.validationRate = value;
  }

  changeHoldoutRate = value => {
    const { holdoutRate, validationRate, runWith } = this.props.project;
    const num = runWith === 'holdout' ? validationRate : 0;
    if (value < 1) value = 1;
    if (value + num > 99) value = 99 - num;
    if (holdoutRate === value) return;
    this.props.project.holdoutRate = value;
  }

  changeCrossCount = value => {
    const { targetCounts, problemType } = this.props.project
    const crossCountMax = problemType === 'Classification' ? Math.min(...Object.values(targetCounts)) : Infinity
    if (value >= crossCountMax) return message.error(`${EN.Oneoftheclasseshasnumber} ${crossCountMax} ${EN.Pleaseselectalowerfoldcv}`)
    this.props.project.crossCount = value;
  }

  // handleMaxTime = value => {
  //   this.props.project.maxTime = value;
  // }

  handleRandSeed = value => {
    this.props.project.randSeed = value;
  }

  handleMeasurement = value => {
    this.props.project.measurement = value
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

  // handleDataRange = v => {
  //   this.props.project.dataRange = v;
  // }

  handleSelectAll = value => {
    const { problemType } = this.props.project
    if (!value) {
      this.props.project.algorithms = []
      return
    }
    this.props.project.algorithms = Algorithms[problemType].map(v => v.value)
    // if (problemType === "Classification") {
    //   this.props.project.algorithms = Classification
    //   return
    // }
    // this.props.project.algorithms = RegressionAlgorithms
  }

  handleCheck = (key, e) => {
    const isCheck = e.target.checked
    const { algorithms } = this.props.project
    if (isCheck) {
      if (algorithms.includes(key)) return
      this.props.project.algorithms = [...algorithms, key]
    } else {
      if (!algorithms.includes(key)) return
      this.props.project.algorithms = algorithms.filter(v => v !== key)
    }
  }

  handleSpeed = value => {
    this.props.project.speedVSaccuracy = value
  }

  changeSpeed = (isSpeed, value) => {
    if (!isSpeed) value = 10 - value
    if (value < 1 || value > 9) return
    this.props.project.speedVSaccuracy = value
  }

  handleSolution = (num, e) => {
    const isCheck = e.target.checked
    const { version } = this.props.project
    if (isCheck) {
      if (version.includes(num)) return
      this.props.project.version = [...version, num]
    } else {
      if (!version.includes(num)) return
      this.props.project.version = version.filter(n => n !== num)
    }
  }

  reset = action(() => {
    const { targetCounts, problemType } = this.props.project
    const min = problemType === 'Classification' ? Math.min(...Object.values(targetCounts)) : Infinity
    this.props.project.holdoutRate = 20
    this.props.project.validationRate = 20
    this.props.project.crossCount = Math.min((min - 1), 5)
  })

  resetSpeed = action(() => {
    this.props.project.speedVSaccuracy = 5
  })

  changeSetting = action((e) => {
    const { project } = this.props
    if (e.target.value === 'default') return this.resetSetting(project)
    const selectedSetting = project.settings.find(s => s.id === e.target.value)
    if (selectedSetting) {
      project.settingId = e.target.value
      Object.entries(selectedSetting.setting).forEach(([key, value]) => {
        project[key] = value
      })
    } else {
      project.settingId = 'default'
    }
  })

  resetSetting = action((project) => {
    const { targetCounts, problemType } = this.props.project
    const min = problemType === 'Classification' ? Math.min(...Object.values(targetCounts)) : Infinity
    const defaultSetting = {
      version: [1, 2],
      validationRate: 20,
      holdoutRate: 20,
      randSeed: 0,
      measurement: project.changeProjectType === "Classification" ? "auc" : "r2",
      runWith: project.totalLines > 10000 ? 'holdout' : 'cross',
      resampling: 'no',
      crossCount: Math.min((min - 1), 5),
      dataRange: 'all',
      customField: '',
      customRange: [],
      algorithms: [],
      speedVSaccuracy: 5
    }
    Object.entries(defaultSetting).forEach(([key, value]) => {
      project[key] = value
    })
    message.info(EN.YourAdvancedModeling)
  })

  render() {
    const { settingId, settingName, settings, version, validationRate, holdoutRate, randSeed, measurement, runWith, resampling, crossCount, problemType, dataRange, customField, customRange, sortHeader, colType, dataViews, algorithms, speedVSaccuracy, ensembleSize, totalLines } = this.props.project;
    const measurementList = problemType === "Classification" ?
      [{ value: "acc", label: 'Accuracy' }, { value: "auc", label: 'AUC' }, { value: "f1", label: 'F1' }, { value: "precision", label: 'Precision' }, { value: "recall", label: 'Recall' }] :
      [{ value: "r2", label: <div>R<sup>2</sup></div> }, { value: "mse", label: 'MSE' }, { value: "rmse", label: 'RMSE' }]
    const customFieldList = sortHeader.filter(v => colType[v] === "Numerical")
    // const algorithmList = problemType === "Classification" ? ClassificationAlgorithms : RegressionAlgorithms

    return <div className={styles.advanced}>
      <div className={styles.advancedRow}>
        <div className={styles.advancedLeft}>
          <div className={styles.advancedBlock}>
            <div className={classnames(styles.advancedTitle, styles.limit)}>
              <span>{EN.SelectFromPreviousSettings}:</span>
            </div>
            <div className={styles.advancedOption}>
              <select value={settingId} onChange={this.changeSetting}>
                <option value={'default'}>{EN.Default}</option>
                {settings && settings.map(setting => <option key={setting.id} value={setting.id}>{setting.name}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className={styles.advancedRight}>
          <div className={styles.advancedBlock}>
            <div className={classnames(styles.advancedTitle, styles.limit)}>
              <span>{EN.NameYourModelSettings}:</span>
            </div>
            <div className={styles.advancedOption}>
              <input type="text" value={settingName} onChange={this.handleName} />
            </div>
          </div>
        </div>
      </div>
      <div className={styles.advancedRow}>
        <div className={styles.advancedLeft}>
          <div className={styles.advancedBlock}>
            <div className={classnames(styles.advancedTitle, styles.limit)}>
              <span>{EN.SelectAlgorithm}:</span>
            </div>
            <div className={styles.advancedOption}>
              <div className={styles.advancedOptionBox}>
                <input id="algorithmSelect1" type='radio' name="algorithmSelect" defaultChecked={algorithms.length} onClick={this.handleSelectAll.bind(null, true)} />
                <label htmlFor="algorithmSelect1">{EN.SelectAll}</label>
              </div>
              <div className={styles.advancedOptionBox}>
                <input id="algorithmSelect2" type='radio' name="algorithmSelect" defaultChecked={!algorithms.length} onClick={this.handleSelectAll.bind(null, false)} />
                <label htmlFor="algorithmSelect2">{EN.DeselectAll}</label>
              </div>
            </div>
          </div>
          <div className={styles.advancedBlock}>
            <div className={styles.advancedAlgorithmList}>
              {/* <Tooltip
                title={<span className={styles.crossWarning}>
                  R2-solution-a & b are mandatory modelling algorithms for Advanced Modelling.
                  </span>}
                mouseLeaveDelay={0}
                overlayStyle={{ maxWidth: '100%' }}> */}
              <div className={styles.advancedSolution}>
                <div className={styles.advancedAlgorithm} key={'solution-a'}>
                  {/* <input id={'R2-solution-a'} type='checkbox' defaultChecked={version.includes(1)} disabled={true} /> */}
                  <input id={'R2-solution-a'} type='checkbox' checked={version.includes(1)} onChange={this.handleSolution.bind(null, 1)} />
                  <label htmlFor={'R2-solution-a'}><span style={{ color: 'red', margin: '0 4px' }}>*</span>R2-solution-a</label>
                </div>
                {/* </Tooltip>
              <Tooltip
                title={<span className={styles.crossWarning}>
                  R2-solution-a & b are mandatory modelling algorithms for Advanced Modelling.
                  </span>}
                mouseLeaveDelay={0}
                overlayStyle={{ maxWidth: '100%' }}> */}
                <div className={styles.advancedAlgorithm} key={'solution-b'}>
                  {/* <input id={'R2-solution-b'} type='checkbox' defaultChecked={version.includes(2)} disabled={true} /> */}
                  <input id={'R2-solution-b'} type='checkbox' checked={version.includes(2)} onChange={this.handleSolution.bind(null, 2)} />
                  <label htmlFor={'R2-solution-b'}><span style={{ color: 'red', margin: '0 4px' }}>*</span>R2-solution-b</label>
                </div>
              </div>
              {/* </Tooltip> */}
              {Algorithms[problemType].map((v, k) => {
                return <div className={styles.advancedAlgorithm} key={k}>
                  <input id={"algorithm" + k} type='checkbox' checked={algorithms.includes(v.value)} onChange={this.handleCheck.bind(null, v.value)} />
                  <label htmlFor={"algorithm" + k}>{v.label}</label>
                </div>
              })}
            </div>
          </div>
          {problemType === "Classification" && < div className={styles.advancedBlock}>
            <div className={styles.advancedResampling}>
              <div className={styles.advancedTitle}>
                <span>{EN.ResamplingSetting}</span>
              </div>
              <div className={styles.advancedOptionBox}>
                <input id="resampling1" type='radio' name="resampling" checked={resampling === "up"} onChange={this.handleResampling.bind(null, 'up')} />
                <label htmlFor="resampling1">{EN.Autoupsampling}</label>
              </div>
              <div className={styles.advancedOptionBox}>
                <input id="resampling2" type='radio' name="resampling" checked={resampling === "down"} onChange={this.handleResampling.bind(null, 'down')} />
                <label htmlFor="resampling2">{EN.Autodownsampling}</label>
              </div>
              <div className={styles.advancedOptionBox}>
                <input id="resampling3" type='radio' name="resampling" checked={resampling === "no"} onChange={this.handleResampling.bind(null, 'no')} />
                <label htmlFor="resampling3">{EN.Noresampling}</label>
              </div>
            </div>
            <div className={styles.advancedOther}>
              <div className={styles.advancedBlock}>
                <div className={classnames(styles.advancedTitle, styles.otherLabel)}>
                  <span>{EN.SetMeasurement}:</span>
                </div>
                <div className={styles.advancedOption}>
                  <Select className={styles.antdAdvancedSize} value={measurement} onChange={this.handleMeasurement} >
                    {measurementList.map((i, k) => <Option value={i.value} key={k}>{i.label}</Option>)}
                  </Select>
                </div>
              </div>
              {/* <div className={styles.advancedBlock}>
                <div className={classnames(styles.advancedTitle, styles.otherLabel)}>
                  <span>Set Max Training Time:</span>
                  <span className={styles.advancedDesc}>Max amount of time to evaluate different modules.</span>
                </div>
                <div className={styles.advancedOption}>
                  <NumberInput className={styles.advancedSize} value={maxTime} onBlur={this.handleMaxTime} min={3} isInt={true} />
                  <span>Minutes<br />(3 minutes or longer)</span>
                </div>
              </div> */}
              <div className={styles.advancedBlock}>
                <div className={classnames(styles.advancedTitle, styles.otherLabel)}>
                  <span>{EN.RandomSeed}:</span>
                  <span className={styles.advancedDesc}>{EN.ValueBetween} 0 - 99999999</span>
                </div>
                <div className={styles.advancedOption}>
                  <NumberInput className={classnames(styles.advancedSize, styles.inputLarge)} value={randSeed} onBlur={this.handleRandSeed} min={0} max={99999999} isInt={true} />
                </div>
              </div>
            </div>
          </div>}
          {problemType === 'Regression' && <div className={styles.advancedBlock}>
            <div className={classnames(styles.advancedTitle, styles.limit)}>
              <span>{EN.SetMeasurement}:</span>
            </div>
            <div className={styles.advancedOption}>
              <Select className={styles.antdAdvancedSize} value={measurement} onChange={this.handleMeasurement} style={{ width: '35%' }}>
                {measurementList.map((i, k) => <Option value={i.value} key={k}>{i.label}</Option>)}
              </Select>
            </div>
          </div>}
          {problemType === 'Regression' && <div className={styles.advancedBlock}>
            <div className={classnames(styles.advancedTitle, styles.limit)}>
              <span>{EN.RandomSeed}:</span>
              <span className={styles.advancedDesc}>{EN.ValueBetween} 0 - 99999999</span>
            </div>
            <div className={styles.advancedOption}>
              <NumberInput className={styles.advancedSize} value={randSeed} onBlur={this.handleRandSeed} min={0} max={99999999} isInt={true} />
            </div>
          </div>}
        </div>
        <div className={styles.advancedRight}>
          <div className={styles.advancedBlock}>
            <div className={classnames(styles.advancedTitle, styles.limit)}>
              <span>{EN.SetModelEnsembleSize}:</span>
              <span className={styles.advancedDesc}>{EN.SetModelEnsembleSizeTip}</span>
            </div>
            <div className={styles.advancedOption}>
              <NumberInput className={styles.advancedSize} value={ensembleSize} onBlur={this.handleSize} min={1} max={30} isInt={true} />
              <span>(1~30)</span>
            </div>
          </div>
          {/* <div className={styles.advancedBlock}>
            <div className={classnames(styles.advancedTitle, styles.limit)}>
              <span>Set Data Range:</span>
            </div>
            <div className={styles.advancedOption}>
              <div className={styles.advancedOptionBox}>
                <input id="datarange1" type='radio' name="datarange" checked={dataRange === "all"} onChange={this.handleDataRange.bind(null, 'all')} />
                <label htmlFor="datarange1">All Data</label>
              </div>
              <div className={styles.advancedOptionBox}>
                <input id="datarange2" type='radio' name="datarange" checked={dataRange === "custom"} onChange={this.handleDataRange.bind(null, 'custom')} />
                <label htmlFor="datarange2">Custom Selected Rows</label>
              </div>
            </div>
          </div> */}
          {dataRange === "custom" && <CustomRange customRange={customRange} customFieldList={customFieldList} dataViews={dataViews} customField={customField} project={this.props.project} />}
          {dataRange === "all" && <div className={styles.advancedBlock}>
            <div className={styles.advancedTitle}>
              <span>{EN.RunModelsWith}:</span>
            </div>
            <div className={styles.advancedOption}>
              <Tooltip
                title={<span className={styles.crossWarning}>
                  {EN.Performingcrossvalidation} <br />
                  {EN.Hencewerecommendchoosing}
                </span>}
                visible={runWith === "cross" && totalLines > 200000}
                overlayStyle={{ maxWidth: '100%' }}>
                <div className={styles.advancedOptionBox}>
                  <input id="runwith1" type='radio' name="runWith" checked={runWith === "cross"} onChange={this.handleRunWith.bind(null, 'cross')} />
                  <label htmlFor="runwith1">{EN.CrossValidation}</label>
                </div>
              </Tooltip>
              <div className={styles.advancedOptionBox}>
                <input id="runwith2" type='radio' name="runWith" checked={runWith === "holdout"} onChange={this.handleRunWith.bind(null, 'holdout')} />
                <label htmlFor="runwith2">{EN.TrainValidationHoldout}</label>
              </div>
            </div>
          </div>}
          {dataRange === "all" && <div className={styles.advancedBlock}>
            <div className={styles.advancedBox}>
              <div className={styles.advancedTitle}>
                <span>{EN.SetPercentage}:<a className={styles.reset} onClick={this.reset}>{EN.Reset}</a></span>
              </div>
              {runWith === "holdout" ? <div className={styles.advancedPercentBlock}>
                <div className={styles.advancedPercent}>
                  <div className={styles.advancedPercentTrain} style={{ width: (100 - validationRate - holdoutRate) + '%' }}></div>
                  <div className={styles.advancedPercentValidation} style={{ width: validationRate + "%" }}></div>
                  <div className={styles.advancedPercentHoldout} style={{ width: holdoutRate + '%' }}></div>
                </div>
                <Range
                  range={true}
                  step={1}
                  min={1}
                  max={99}
                  onChange={this.handleSlider}
                  value={[100 - parseInt(validationRate, 10) - parseInt(holdoutRate, 10), 100 - parseInt(holdoutRate, 10)]}
                  tooltipVisible={false}
                />
              </div> : <div className={styles.advancedPercentBlock} >
                  <div className={styles.advancedPercent}>
                    {this.crossPercent()}
                    <div className={styles.advancedPercentHoldout} style={{ width: holdoutRate + '%' }}></div>
                  </div>
                  <Range
                    range={false}
                    step={1}
                    min={1}
                    max={99}
                    onChange={this.handleDrag}
                    value={100 - parseInt(holdoutRate, 10)}
                    tooltipVisible={false}
                  />
                </div>}
              {runWith === "holdout" ? <div className={styles.advancedPercentBox}>
                <div className={styles.advancedPercentInput}>
                  <div className={styles.advancedPercentText}>
                    <div className={classnames(styles.advancedPercetColor, styles.advancedPercentTrain)}/>
                    <span>{EN.Training}</span>
                  </div>
                  {/* <input disabled={true} value={100 - parseInt(validationRate, 10) - parseInt(holdoutRate, 10)} /> */}
                  <span>{100 - parseInt(validationRate, 10) - parseInt(holdoutRate, 10)}%</span>
                </div>
                <div className={styles.advancedPercentInput}>
                  <div className={styles.advancedPercentText}>
                    <div className={classnames(styles.advancedPercetColor, styles.advancedPercentValidation)}/>
                    <span>{EN.Validation}</span>
                  </div>
                  {/* <NumberInput value={parseInt(validationRate, 10)} onBlur={this.changeValidationRate} min={1} max={99} isInt={true} /> */}
                  <span>{parseInt(validationRate, 10)}%</span>
                </div>
                <div className={styles.advancedPercentInput}>
                  <div className={styles.advancedPercentText}>
                    <div className={classnames(styles.advancedPercetColor, styles.advancedPercentHoldout)}></div>
                    <span>{EN.Holdout}</span>
                  </div>
                  {/* <NumberInput value={parseInt(holdoutRate, 10)} onBlur={this.changeHoldoutRate} min={1} max={99} isInt={true} /> */}
                  <span>{parseInt(holdoutRate, 10)}%</span>
                </div>
              </div> : <div className={styles.advancedPercentBox}>
                  <div className={styles.advancedPercentInput}>
                    <div className={styles.advancedPercentText}>
                      <div className={classnames(styles.advancedPercetColor, styles.advancedPercentCross)}></div>
                      <span>{EN.SelectNumberofCVfolds}</span>
                    </div>
                    <NumberInput value={crossCount} onBlur={this.changeCrossCount} min={2} max={10} isInt={true} />
                    {/* <span>{crossCount}</span> */}
                  </div>
                  <div className={styles.advancedPercentInput}>
                    <div className={styles.advancedPercentText}>
                      <div className={classnames(styles.advancedPercetColor, styles.advancedPercentHoldout)}></div>
                      <span>{EN.Holdout}</span>
                    </div>
                    {/* <NumberInput value={parseInt(holdoutRate, 10)} onBlur={this.changeHoldoutRate} min={1} max={99} isInt={true} /> */}
                    <span>{parseInt(holdoutRate, 10)}%</span>
                  </div>
                </div>}
            </div>
          </div>}
          <div className={styles.advancedBlock}>
            <div className={styles.advancedBox}>
              <div className={styles.advancedTitle}>
                <span>{EN.SpeedVSAccuracy}:<a className={styles.reset} onClick={this.resetSpeed}>{EN.Reset}</a></span>
              </div>
              <div className={styles.advancedPercentBlock}>
                <div className={styles.advancedPercent}>
                  <div className={styles.advancedPercentCross} style={{ width: ((speedVSaccuracy - 1) / 8 * 100) + '%' }}></div>
                  <div className={styles.advancedPercentHoldout} style={{ width: ((9 - speedVSaccuracy) / 8 * 100) + '%' }}></div>
                </div>
                <Range
                  range={false}
                  step={1}
                  min={1}
                  max={9}
                  onChange={this.handleSpeed}
                  value={speedVSaccuracy}
                  tooltipVisible={false}
                />
              </div>
              <div className={styles.advancedPercentBox}>
                <div className={styles.advancedPercentInput}>
                  <div className={styles.advancedPercentText}>
                    <div className={classnames(styles.advancedPercetColor, styles.advancedPercentCross)}></div>
                    <span>{EN.Speed}</span>
                  </div>
                  <NumberInput value={speedVSaccuracy} onBlur={this.changeSpeed.bind(null, true)} min={1} max={9} isInt={true} />
                </div>
                <div className={styles.advancedPercentInput}>
                  <div className={styles.advancedPercentText}>
                    <div className={classnames(styles.advancedPercetColor, styles.advancedPercentHoldout)}></div>
                    <span>{EN.Accuracy}</span>
                  </div>
                  <NumberInput value={10 - speedVSaccuracy} onBlur={this.changeSpeed.bind(null, false)} min={1} max={9} isInt={true} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  }
}

@observer
class CustomRange extends Component {
  handleCustomField = e => {
    this.props.project.customField = e.target.value
    this.props.project.customRange = []
  }

  handleSlider = value => {
    const [minValue, maxValue] = value
    if (minValue === maxValue) return
    const { dataViews, customField } = this.props
    const data = customField ? (dataViews[customField] || {}) : {}
    const min = data.min || 0
    const max = data.max || 0
    const total = max - min || 1
    this.props.project.customRange = [minValue * total / 100, maxValue * total / 100]
  }

  render() {
    const { dataViews, customRange, customFieldList, customField } = this.props
    const data = customField ? (dataViews[customField] || {}) : {}
    const min = data.min || 0
    const max = data.max || 0
    const total = max - min || 1
    const rangeMin = customRange[0] || (min + total * 0.8)
    const rangeMax = customRange[1] || min + total * 0.95
    const minPercent = Math.round(rangeMin / total * 100)
    const maxPercent = Math.round(rangeMax / total * 100)
    const marks = {}
    marks[minPercent] = rangeMin
    marks[maxPercent] = rangeMax
    return <div className={styles.advancedCustomRange}>
      <div className={styles.advancedBlock}>
        <div className={classnames(styles.advancedTitle, styles.limit)}>
          <span>{EN.Selectavariableasreference}:</span>
        </div>
        <div className={styles.advancedOption}>
          <select className={classnames(styles.advancedSize, styles.inputLarge)} value={customField} onChange={this.handleCustomField} >
            <option value={""} key="option"></option>
            {customFieldList.map((i, k) => {
              return <option value={i} key={k}>{i}</option>
            })}
          </select>
        </div>
      </div>
      <div className={styles.advancedBlock}>
        {!!customField && <div className={styles.advancedPercentBlock}>
          <div className={styles.advancedPercent}>
            <div className={styles.advancedPercentTrain} style={{ width: minPercent + '%' }}></div>
            <div className={styles.advancedPercentValidation} style={{ width: (maxPercent - minPercent) + '%' }}></div>
            <div className={styles.advancedPercentHoldout} style={{ width: (100 - maxPercent) + '%' }}></div>
          </div>
          <Range
            range={true}
            min={1}
            max={99}
            onChange={this.handleSlider}
            value={[minPercent, maxPercent]}
            tooltipVisible={true}
            marks={marks}
          />
        </div>}
      </div>
    </div>
  }
}
