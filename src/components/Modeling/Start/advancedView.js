import React, { Component } from 'react';
import 'rc-slider/assets/index.css';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import Slider from 'rc-slider';
import { NumberInput } from 'components/Common';
import { Select } from 'antd';

const Option = Select.Option;
const Range = Slider.Range;
const ClassificationAlgorithms = ['adaboost', 'bernoulli_nb', 'decision_tree', 'extra_trees', 'gaussian_nb', 'gradient_boosting', 'k_nearest_neighbors', 'lda', 'liblinear_svc', 'libsvm_svc', 'multinomial_nb', 'passive_aggressive', 'qda', 'random_forest', 'sgd', 'xgradient_boosting'];
const RegressionAlgorithms = ['adaboost', 'ard_regression', 'decision_tree', 'extra_trees', 'gaussian_process', 'gradient_boosting', 'k_nearest_neighbors', 'liblinear_svr', 'libsvm_svr', 'random_forest', 'ridge_regression', 'sgd', 'xgradient_boosting'];
const HandleStyle = {
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
}

@observer
export default class AdvancedView extends Component {
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
      this.props.project.holdoutRate = 100 - value[1];
      this.props.project.validationRate = value[1] - value[0];
    } else {
      this.props.project.holdoutRate = 100 - value[0];
    }
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
    this.props.project.crossCount = value;
  }

  handleMaxTime = value => {
    this.props.project.maxTime = value;
  }

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

  handleDataRange = v => {
    this.props.project.dataRange = v;
  }

  handleSelectAll = value => {
    const { problemType } = this.props.project
    if (!value) {
      this.props.project.algorithms = []
      return
    }
    if (problemType === "Classification") {
      this.props.project.algorithms = ClassificationAlgorithms
      return
    }
    this.props.project.algorithms = RegressionAlgorithms
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
    this.props.project.speedVSaccuracy = value[0]
  }

  changeSpeed = (isSpeed, value) => {
    if (!isSpeed) value = 10 - value
    if (value < 1 || value > 9) return
    this.props.project.speedVSaccuracy = value
  }

  render() {
    const { advancedName, validationRate, holdoutRate, maxTime, randSeed, measurement, runWith, resampling, crossCount, problemType, dataRange, customField, customRange, rawHeader, colType, dataViews, algorithms, speedVSaccuracy } = this.props.project;
    const measurementList = problemType === "Classification" ?
      [{ value: "acc", label: 'Accuracy' }, { value: "auc", label: 'AUC' }, { value: "f1", label: 'F1' }] :
      [{ value: "r2", label: <div>R<sup>2</sup></div> }, { value: "mse", label: 'MSE' }, { value: "rmse", label: 'RMSE' }]
    const customFieldList = rawHeader.filter(v => colType[v] === "Numerical")
    const algorithmList = problemType === "Classification" ? ClassificationAlgorithms : RegressionAlgorithms

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
          <div className={styles.advancedBlock}>
            <div className={classnames(styles.advancedTitle, styles.limit)}>
              <span>Select Algorithm:</span>
            </div>
            <div className={styles.advancedOption}>
              <div className={styles.advancedOptionBox}>
                <input id="algorithmSelect1" type='radio' name="algorithmSelect" defaultChecked={algorithms.length} onClick={this.handleSelectAll.bind(null, true)} />
                <label htmlFor="algorithmSelect1">Select All</label>
              </div>
              <div className={styles.advancedOptionBox}>
                <input id="algorithmSelect2" type='radio' name="algorithmSelect" defaultChecked={!algorithms.length} onClick={this.handleSelectAll.bind(null, false)} />
                <label htmlFor="algorithmSelect2">Deselect all</label>
              </div>
            </div>
          </div>
          <div className={styles.advancedBlock}>
            <div className={styles.advancedAlgorithmList}>
              {algorithmList.map((v, k) => {
                return <div className={styles.advancedAlgorithm} key={k}>
                  <input id={"algorithm" + k} type='checkbox' checked={algorithms.includes(v)} onChange={this.handleCheck.bind(null, v)} />
                  <label htmlFor={"algorithm" + k}>{v.split("_").map(i => {
                    const arr = i.split("")
                    return arr.shift().toUpperCase() + arr.join("")
                  }).join(" ")}</label>
                </div>
              })}
            </div>
          </div>
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
                <input id="resampling4" type='radio' name="resampling" checked={resampling === "auto"} onChange={this.handleResampling.bind(null, 'auto')} />
                <label htmlFor="resampling4">Auto resampling</label>
              </div>
            </div>
            <div className={styles.advancedOther}>
              <div className={styles.advancedBlock}>
                <div className={classnames(styles.advancedTitle, styles.otherLabel)}>
                  <span>Set Measurement:</span>
                </div>
                <div className={styles.advancedOption}>
                  <Select className={styles.antdAdvancedSize} value={measurement} onChange={this.handleMeasurement} >
                    {measurementList.map((i, k) => <Option value={i.value} key={k}>{i.label}</Option>)}
                  </Select>
                  {/* <select className={classnames(styles.advancedSize, styles.inputLarge)} value={measurement} onChange={this.handleMeasurement} >
                    {measurementList.map((i, k) => {
                      return <option value={i.value} key={k}>{i.label}</option>
                    })}
                  </select> */}
                </div>
              </div>
              <div className={styles.advancedBlock}>
                <div className={classnames(styles.advancedTitle, styles.otherLabel)}>
                  <span>Set Max Training Time:</span>
                  <span className={styles.advancedDesc}>Max amount of time to evaluate different modules.</span>
                </div>
                <div className={styles.advancedOption}>
                  <NumberInput className={styles.advancedSize} value={maxTime} onBlur={this.handleMaxTime} min={3} isInt={true} />
                  <span>Minutes<br />(3 minutes or longer)</span>
                </div>
              </div>
              <div className={styles.advancedBlock}>
                <div className={classnames(styles.advancedTitle, styles.otherLabel)}>
                  <span>Random Seed:</span>
                  <span className={styles.advancedDesc}>Value between 0 - 99999999</span>
                </div>
                <div className={styles.advancedOption}>
                  <NumberInput className={classnames(styles.advancedSize, styles.inputLarge)} value={randSeed} onBlur={this.handleRandSeed} min={0} max={99999999} isInt={true} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.advancedRight}>
          {/* <div className={styles.advancedBlock}>
            <div className={classnames(styles.advancedTitle, styles.limit)}>
              <span>Set Model Ensemble Size:</span>
              <span className={styles.advancedDesc}>Actual number of ensemble models may be less than this number.</span>
            </div>
            <div className={styles.advancedOption}>
              <input className={styles.advancedSize} value={advancedSize} onChange={this.handleSize} />
              <span>(1~30)</span>
            </div>
          </div> */}
          <div className={styles.advancedBlock}>
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
          </div>
          {dataRange === "custom" && <CustomRange customRange={customRange} customFieldList={customFieldList} dataViews={dataViews} customField={customField} project={this.props.project} />}
          {dataRange === "all" && <div className={styles.advancedBlock}>
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
          </div>}
          {dataRange === "all" && <div className={styles.advancedBlock}>
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
                  handleStyle={[HandleStyle, HandleStyle]}
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
                    handleStyle={[HandleStyle]}
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
                  <NumberInput value={parseInt(validationRate, 10)} onBlur={this.changeValidationRate} min={1} max={99} isInt={true} />
                  <span>%</span>
                </div>
                <div className={styles.advancedPercentInput}>
                  <div className={styles.advancedPercentText}>
                    <div className={classnames(styles.advancedPercetColor, styles.advancedPercentHoldout)}></div>
                    <span>Holdout</span>
                  </div>
                  <NumberInput value={parseInt(holdoutRate, 10)} onBlur={this.changeHoldoutRate} min={1} max={99} isInt={true} />
                  <span>%</span>
                </div>
              </div> : <div className={styles.advancedPercentBox}>
                  <div className={styles.advancedPercentInput}>
                    <div className={styles.advancedPercentText}>
                      <div className={classnames(styles.advancedPercetColor, styles.advancedPercentCross)}></div>
                      <span>Select Number of CV folds</span>
                    </div>
                    <NumberInput value={crossCount} onBlur={this.changeCrossCount} min={2} max={5} isInt={true} />
                  </div>
                  <div className={styles.advancedPercentInput}>
                    <div className={styles.advancedPercentText}>
                      <div className={classnames(styles.advancedPercetColor, styles.advancedPercentHoldout)}></div>
                      <span>Holdout</span>
                    </div>
                    <NumberInput value={parseInt(holdoutRate, 10)} onBlur={this.changeHoldoutRate} min={1} max={99} isInt={true} />
                    <span>%</span>
                  </div>
                </div>}
            </div>
          </div>}
          <div className={styles.advancedBlock}>
            <div className={styles.advancedBox}>
              <div className={styles.advancedTitle}>
                <span>Speed VS Accuracy:</span>
              </div>
              <div className={styles.advancedPercentBlock}>
                <div className={styles.advancedPercent}>
                  <div className={styles.advancedPercentCross} style={{ width: ((speedVSaccuracy - 1) / 8 * 100) + '%' }}></div>
                  <div className={styles.advancedPercentHoldout} style={{ width: ((9 - speedVSaccuracy) / 8 * 100) + '%' }}></div>
                </div>
                <Range
                  className={styles.range}
                  railStyle={{ backgroundColor: 'transparent' }}
                  trackStyle={[{ backgroundColor: 'transparent' }]}
                  handleStyle={[HandleStyle]}
                  value={[speedVSaccuracy]}
                  onChange={this.handleSpeed}
                  min={1}
                  max={9}
                  allowCross={false}
                  pushable={1}
                />
              </div>
              <div className={styles.advancedPercentBox}>
                <div className={styles.advancedPercentInput}>
                  <div className={styles.advancedPercentText}>
                    <div className={classnames(styles.advancedPercetColor, styles.advancedPercentCross)}></div>
                    <span>Speed</span>
                  </div>
                  <NumberInput value={speedVSaccuracy} onBlur={this.changeSpeed.bind(null, true)} min={1} max={9} isInt={true} />
                </div>
                <div className={styles.advancedPercentInput}>
                  <div className={styles.advancedPercentText}>
                    <div className={classnames(styles.advancedPercetColor, styles.advancedPercentHoldout)}></div>
                    <span>Accuracy</span>
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
    const { dataViews, customField } = this.props
    const data = customField ? dataViews[customField] : {}
    const min = data.min || 0
    const max = data.max || 0
    const total = max - min || 1
    this.props.project.customRange = [minValue * total / 100, maxValue * total / 100]
  }

  render() {
    const { dataViews, customRange, customFieldList, customField } = this.props
    const data = customField ? dataViews[customField] : {}
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
          <span>Select a variable as reference:</span>
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
            className={styles.range}
            railStyle={{ backgroundColor: 'transparent' }}
            trackStyle={[{ backgroundColor: 'transparent' }, { backgroundColor: 'transparent' }]}
            handleStyle={[HandleStyle, HandleStyle]}
            value={[minPercent, maxPercent]}
            onChange={this.handleSlider}
            min={1}
            max={99}
            allowCross={false}
            pushable={1}
            marks={marks}
          />
        </div>}
      </div>
    </div>
  }
}
