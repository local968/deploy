import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { action } from 'mobx';
import { NumberInput, Range } from 'components/Common';
import { Select, message, Tooltip } from 'antd';
import Algorithms from './algorithms';
import moment from 'moment';

const Option = Select.Option;

@observer
export default class AdvancedView extends Component {

  handleName = action((e) => {
    const { project } = this.props
    project.settings.find(s => s.id === project.settingId).name = e.target.value || `custom.${moment().format('MM.DD.YYYY_HH:mm:ss')}`
  })

  handleMaxTime = (value) => {
    const { project } = this.props
    project.setProperty({
      searchTime: value,
    })
  }

  handleRandSeed = (value) => {
    const { project } = this.props
    project.setProperty({
      randSeed: value,
    })
  }

  handleMeasurement = (value) => {
    const { project } = this.props
    project.setProperty({
      measurement: value,
    })
  }

  handleSelectAll = (value) => {
    const { project } = this.props
    let algorithms = []
    if (!value) {
      algorithms = []
    } else {
      algorithms = Algorithms[problemType].map((v) => v.value)
    }
    project.setProperty({
      algorithms
    })
  }

  handleCheck = (key, e) => {
    const { project } = this.props
    const isCheck = e.target.checked
    const { algorithms } = project
    let _algorithms = []
    if (isCheck) {
      if (algorithms.includes(key)) return
      _algorithms = [...algorithms, key]
    } else {
      if (!algorithms.includes(key)) return
      _algorithms = algorithms.filter((v) => v !== key)
    }
    project.setProperty({
      algorithms: _algorithms
    })
  }

  changeSetting = (e) => {
    const { project } = this.props
    if (e.target.value === 'default') return resetSetting()
    const selectedSetting = project.settings.find((s) => s.id === e.target.value)
    if (selectedSetting) {
      project.settingId = e.target.value
      Object.entries(selectedSetting.setting).forEach(([key, value]) => {
        project[key] = value
      })
    } else {
      project.settingId = 'default'
    }
  }

  resetSetting = () => {
    const { project } = this.props
    const defaultSetting = {
      kType: 'auto',
      algorithms: ['KMeans'],
      standardType: 'standard',
      searchTime: 5,
      measurement: 'CVNN',
      randomSeed: 0,
    }
    Object.entries(defaultSetting).forEach(([key, value]) => {
      project[key] = value
    })
    message.info(EN.YourAdvancedModeling)
  }

  handleNum = (value) => {
    const { project } = this.props
    project.setProperty({
      kValue: value
    })
  }

  handleMode = (type) => () => {
    const { project } = this.props
    project.setProperty({
      kType: type
    })
  }

  render() {
    const { project } = props
    const measurementList = project.problemType === "Outlier" ?
      // [{ value: "acc", label: 'Accuracy' }, { value: "auc", label: 'AUC' }, { value: "f1", label: 'F1' }, { value: "precision", label: 'Precision' }, { value: "recall", label: 'Recall' }] :
      [{ value: "Accuracy", label: 'Accuracy' }] :
      [{ value: "CVNN", label: 'CVNN' }, { value: "RSquared", label: 'RSquared' }, { value: "RMSSTD", label: 'RMSSTD' }, { value: "CH", label: 'CH' }, { value: "silhouette_cosine", label: 'silhouette_cosine' }, { value: "silhouette_euclidean", label: 'silhouette_euclidean' }]
    // const customFieldList = sortHeader.filter(v => colType[v] === "Numerical")
    // const algorithmList = problemType === "Classification" ? ClassificationAlgorithms : RegressionAlgorithms

    return <div className={styles.advanced}>
      <div className={styles.advancedRow}>
        <div className={styles.advancedLeft}>
          <div className={styles.advancedBlock}>
            <div className={`${styles.advancedTitle} ${styles.limit}`}>
              <span>{EN.SelectFromPreviousSettings}:</span>
            </div>
            <div className={styles.advancedOption}>
              <select value={project.settingId} onChange={changeSetting}>
                <option value={'default'}>{EN.Default}</option>
                {project.settings && project.settings.map((setting) => <option key={setting.id} value={setting.id}>{setting.name}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className={styles.advancedRight}>
          <div className={styles.advancedBlock}>
            <div className={`${styles.advancedTitle} ${styles.limit}`}>
              <span>{EN.NameYourModelSettings}:</span>
            </div>
            <div className={styles.advancedOption}>
              <input type="text" value={project.settingName} onChange={handleName} />
            </div>
          </div>
        </div>
      </div>
      <div className={styles.advancedRow}>
        <div className={styles.advancedBox}>
          <div className={styles.advancedBlock}>
            <div className={`${styles.advancedTitle}`}>
              <span>{'Specify the Number of Clusters to Form:'}:</span>
            </div>
          </div>
          <div className={styles.advancedBlock}>
            {project.problemType === "Outlier" ? <div className={styles.chooseScan}>
              <div className={styles.chooseLabel}><span>Choose a Variable Scaling Method:</span></div>
              <div className={styles.chooseBox}>
                <input type='radio' name='scan' value='minMax' id='minMax' checked={project.standardType} onChange={this.handleType} />
                <label htmlFor='minMax'>min_max_scale</label>
              </div>
              <div className={styles.chooseBox}>
                <input type='radio' name='scan' value='standard' id='standard' checked={project.standardType} onChange={this.handleType} />
                <label htmlFor='standard'>standard_scale</label>
              </div>
              <div className={styles.chooseBox}>
                <input type='radio' name='scan' value='robust' id='robust' checked={project.standardType} onChange={this.handleType} />
                <label htmlFor='robust'>robust_scale</label>
              </div>
            </div> :
              <div className={styles.advancedOption}>
                <div className={styles.advancedOptionBox}>
                  <input id="number_auto" type='radio' name="numberselect" defaultChecked={project.kType === 'auto'} onClick={handleMode('auto')} />
                  <label htmlFor="number_auto">{'Auto'}</label>
                </div>
                <div className={styles.advancedOptionBox}>
                  <input id="number_custom" type='radio' name="numberselect" defaultChecked={project.kType === 'no_more_than'} onClick={handleMode('no_more_than')} />
                  <label htmlFor="number_custom">{'No More Than'}</label>
                  <InputNumber value={project.kValue} max={15} min={2} step={0} precision={0} onChange={handleNum} />
                </div>
              </div>}
          </div>
        </div>
      </div>
      <div className={styles.advancedRow}>
        <div className={styles.advancedBox}>
          <div className={styles.advancedBlock}>
            <div className={`${styles.advancedTitle} ${styles.limit}`}>
              <span>{EN.SelectAlgorithm}:</span>
            </div>
            <div className={styles.advancedOption}>
              <div className={styles.advancedOptionBox}>
                <input id="algorithmSelect1" type='radio' name="algorithmSelect" defaultChecked={project.algorithms.length} onClick={handleSelectAll.bind(null, true)} />
                <label htmlFor="algorithmSelect1">{EN.SelectAll}</label>
              </div>
              <div className={styles.advancedOptionBox}>
                <input id="algorithmSelect2" type='radio' name="algorithmSelect" defaultChecked={!project.algorithms.length} onClick={handleSelectAll.bind(null, false)} />
                <label htmlFor="algorithmSelect2">{EN.DeselectAll}</label>
              </div>
            </div>
          </div>
          <div className={styles.advancedBlock}>
            <div className={styles.advancedAlgorithmList}>
              {Algorithms[project.problemType].map((v, k) => {
                return <div className={styles.advancedAlgorithm} key={k}>
                  <input id={"algorithm" + k} type='checkbox' checked={!project.algorithms.includes(v.value)} onChange={handleCheck.bind(null, v.value)} />
                  <label htmlFor={"algorithm" + k}>{v.label}</label>
                </div>
              })}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.advancedRow}>
        <div className={styles.advancedBlock}>
          <div className={styles.advancedTitle}>
            <span>Set Measurement:</span>
          </div>
          <div className={styles.advancedOption}>
            <Select className={styles.antdAdvancedSize} value={project.measurement} onChange={handleMeasurement} >
              {measurementList.map((i, k) => <Option value={i.value} key={k}>{i.label}</Option>)}
            </Select>
          </div>
        </div>
        <div className={styles.advancedBlock} style={{ marginLeft: '30px' }}>
          <div className={styles.advancedTitle}>
            <span>Random Seed:</span>
            <span className={styles.advancedDesc}>Value between 0 - 99999999</span>
          </div>
          <div className={styles.advancedOption}>
            <NumberInput className={`${styles.advancedSize} ${styles.inputLarge}`} value={project.randSeed} onBlur={handleRandSeed} min={0} max={99999999} isInt={true} />
          </div>
        </div>
      </div>
      <div className={styles.advancedRow}>
        <div className={styles.advancedBlock}>
          <div className={`${styles.advancedTitle} ${styles.otherLabel}`}>
            <span>Set Max Training Time:</span>
            <span className={styles.advancedDesc}>Max amount of time to evaluate different modules.</span>
          </div>
          <div className={styles.advancedOption}>
            <NumberInput className={styles.advancedSize} value={project.searchTime} onBlur={handleMaxTime} min={5} isInt={true} />
            <span>Minutes<br />(5 minutes or longer)</span>
          </div>
        </div>
      </div>
    </div >
  }
}
