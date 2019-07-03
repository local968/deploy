import React, { Component } from 'react';
import styles from '../styles.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { observable } from 'mobx'
// import * as d3 from 'd3';
import { Icon } from 'antd'
import EN from '../../../../constant/en';
import Project from 'stores/Project';

interface SelectTargetProps {
  saveTargetFixes: () => void, 
  closeTarget: () => void, 
  project: Project
}

class SelectTarget extends Component<SelectTargetProps> {
  @observable checked = []
  @observable belongTo0 = []
  @observable belongTo1 = []
  @observable step = 1
  @observable canSave = false
  @observable belong = -1

  check = e => {
    let arr, canSave = false;
    if (e.target.checked && this.checked.length < 2) {
      arr = [...this.checked, e.target.value];
    } else if (!e.target.checked && this.checked.length > 0) {
      arr = this.checked.filter(t => t !== e.target.value);
    } else {
      return false;
    }
    if (arr.length === 2) {
      canSave = true
    }
    this.checked = arr
    this.canSave = canSave
  }

  save = () => {
    const { checked, belongTo0, belongTo1 } = this;
    const { colValueCounts, target, nullLineCounts } = this.props.project;
    const [v0, v1] = checked
    const totalOf0 = [v0, ...belongTo0].reduce((start, v) => start += (v === '' ? nullLineCounts[target] : ((colValueCounts[target] || {})[v] || 0)), 0)
    const totalOf1 = [v1, ...belongTo1].reduce((start, v) => start += (v === '' ? nullLineCounts[target] : ((colValueCounts[target] || {})[v] || 0)), 0)
    const maxKey = totalOf0 >= totalOf1 ? 0 : 1
    let targetMap = {
      [checked[maxKey]]: 0,
      [checked[1 - maxKey]]: 1
    }
    // 重置rename
    const otherMap = {}
    this[`belongTo${maxKey}`].forEach(v0 => {
      targetMap[v0] = 0
      otherMap[v0] = checked[maxKey]
    })
    this[`belongTo${1 - maxKey}`].forEach(v1 => {
      targetMap[v1] = 1
      otherMap[v1] = checked[1 - maxKey]
    })
    this.props.project.targetArrayTemp = [checked[maxKey], checked[1 - maxKey]];
    this.props.project.targetMapTemp = targetMap;
    this.props.project.otherMap = otherMap
    this.props.saveTargetFixes()
  }

  handleBelong = key => {
    this.belong = key === this.belong ? -1 : key
  }

  handleCheck = e => {
    const field = 'belongTo' + this.belong
    const value = e.target.value
    const checked = e.target.checked
    // const field = `belongTo${key}`
    if (checked && !this[field].includes(value)) this[field] = [...this[field], value]
    if (!checked && this[field].includes(value)) this[field] = this[field].filter(v => v !== value)
  }

  nextStep = () => {
    this.step++
  }

  backStep = () => {
    this.step--
  }

  render() {
    const { closeTarget, project } = this.props;

    const { targetColMap, target, colValueCounts, totalRawLines, nullLineCounts } = project
    const { checked } = this
    const [v0, v1] = checked
    const currentBelong = [...this.belongTo0, ...this.belongTo1]
    const hasNull = Object.keys(targetColMap).includes('')
    const nullPercent = (nullLineCounts[target] || 0) / (totalRawLines || 1) * 85
    const disabledArray = Object.keys(targetColMap).filter(h => {
      if (this.belong !== 0 && this.belong !== 1) return true
      const arr = this['belongTo' + (1 - this.belong)]
      return arr.includes(h)
    })
    return <div className={styles.fixesContent}>
      {this.step === 1 && <div className={styles.fixesBox}>
        <div className={styles.fixesText}><span>{EN.Pleaseselecttwovalid}</span></div>
        <div className={styles.targetPercentBox}>
          {Object.keys(targetColMap).filter(_k => _k !== '').map((v, k) => {
            const percent = (colValueCounts[target][v] || 0) / (totalRawLines || 1) * 85
            const backgroundColor = (v0 === v && '#9be44b') || (v1 === v && '#adaafc') || '#c4cbd7'
            return <div className={styles.targetPercentRow} key={k}>
              <div className={styles.targetPercentCheckBox}>
                <input type='checkbox' onChange={this.check} value={v} checked={checked.includes(v)} />
              </div>
              <div className={styles.targetPercentLabel}>
                <span>{v}</span>
              </div>
              <div className={styles.targetPercentValue}>
                <div className={styles.targetPercent} style={{ width: percent + '%', backgroundColor }}></div>
                <span>{colValueCounts[target][v] || 0}</span>
              </div>
            </div>
          })}
        </div>
        {hasNull && <div className={styles.fixesText}><span>{EN.Doyouwanttotreatnull}</span></div>}
        {hasNull && <div className={styles.targetPercentBox}>
          <div className={styles.targetPercentRow} key={`missing${this.step}`}>
            <div className={styles.targetPercentCheckBox}>
              <input type='checkbox' onChange={this.check} value={''} checked={checked.includes('')} />
            </div>
            <div className={styles.targetPercentLabel}>
              <span>{'NULL'}</span>
            </div>
            <div className={styles.targetPercentValue}>
              <div className={styles.targetPercent} style={{ width: nullPercent + '%', backgroundColor: 'ff97a7' }}></div>
              <span>{nullLineCounts[target] || 0}</span>
            </div>
          </div>
        </div>}
        <div className={styles.fixesTips}><span></span></div>
      </div>}
      {this.step === 2 && <div className={styles.fixesBox}>
        <div className={styles.fixesText}><span>{EN.Selectallvaluesthatmatchas}{v0 || 'NULL'}{EN.Or}{v1 || 'NULL'}{EN.MATAHC} </span></div>
        <div className={styles.targetPercentBox}>
          {this.checked.map((t, i) => {
            const percent = ((t === '' ? nullLineCounts[target] : colValueCounts[target][t]) || 0) / (totalRawLines || 1) * 85
            const backgroundColor = (v0 === t && '#9be44b') || (v1 === t && '#adaafc') || '#c4cbd7'
            return <div className={styles.targetPercentRow} key={i}>
              <div className={styles.targetPercentLabel}>
                <span>{t || 'NULL'}</span>
              </div>
              <div className={styles.targetPercentValue}>
                <div className={styles.targetPercent} style={{ width: percent + '%', backgroundColor }}></div>
                <span>{(t === '' ? nullLineCounts[target] : colValueCounts[target][t]) || 0}</span>
              </div>
            </div>
          })}
          {!!Object.keys(targetColMap).filter(_k => _k !== '').filter(v => !checked.includes(v)).length && <div className={styles.fixesCheckBox}>
            {Object.keys(targetColMap).filter(_k => _k !== '').filter(v => !checked.includes(v)).map((t, i) => {
              const disabled = disabledArray.includes(t)
              return <div className={styles.fixesCheck} key={i}>
                <input type='checkbox' value={t} id={`belong${t}`} checked={currentBelong.includes(t)} disabled={disabled} onChange={disabled ? null : this.handleCheck} />
                <label className={classnames(styles.fixesCheckBoxLabel, {
                  [styles.disabledText]: disabled
                })} htmlFor={`belong${t}`}>{t}</label>
              </div>
            })}
          </div>}
          {(hasNull && !checked.includes('')) && <div className={styles.fixesText}><span>{EN.Doyouwanttotreatnull}</span></div>}
          {(hasNull && !checked.includes('')) && <div className={styles.targetPercentBox}>
            <div className={styles.targetPercentRow} key={`missing${this.step}`}>
              <div className={styles.targetPercentCheckBox}>
                <input type='checkbox' value={''} id={`belong`} checked={currentBelong.includes('')} disabled={disabledArray.includes('')} onChange={disabledArray.includes('') ? null : this.handleCheck} />
              </div>
              <div className={styles.targetPercentLabel}>
                <span>{'NULL'}</span>
              </div>
              <div className={styles.targetPercentValue}>
                <div className={styles.targetPercent} style={{ width: nullPercent + '%', backgroundColor: 'ff97a7' }}></div>
                <span>{nullLineCounts[target] || 0}</span>
              </div>
            </div>
          </div>}
          <div className={styles.cleanTargetButton} style={{ margin: '.1em 0' }}>
            <button onClick={this.handleBelong.bind(null, 0)} className={this.belong === 0 ? styles.activeButton : null}><span>{EN.Matchas}{v0 || 'NULL'}</span></button>
            <button onClick={this.handleBelong.bind(null, 1)} className={this.belong === 1 ? styles.activeButton : null}><span>{EN.Matchas}{v1 || 'NULL'}</span></button>
          </div>
        </div>

        <div className={styles.fixesTips}><span>{EN.Therestvalueswillbedeletedbydefault}</span></div>
      </div>}
      {this.step === 3 && <div className={styles.fixesBox}>
        <div className={classnames(styles.fixesIconBox, styles.center)}>
          <div className={classnames(styles.cleanHeaderIcon, styles.largeIcon)}><Icon type="check" style={{ color: '#fcfcfc', fontSize: '2.4rem' }} /></div>
        </div>
        <div className={classnames(styles.fixesText, styles.center)}><span>{EN.Thankyouforfixingddatassues}。</span></div>
        <div className={styles.fixesCheckBox}>
          <div className={styles.fixesTextBottom}>
            <div className={styles.fixesComplete}>
              <span>{EN.Thechangeswillnotshowupuntil}</span>
            </div>
          </div>
        </div>
      </div>}
      <div className={styles.fixesBottom}>
        <button className={styles.cancel} onClick={this.step > 1 ? this.backStep : closeTarget}><span>{this.step > 1 ? EN.Back : EN.CANCEL}</span></button>
        <button className={classnames(styles.save, {
          [styles.disabled]: !this.canSave
        })} onClick={this.step < 3 ? this.nextStep : this.save} disabled={!this.canSave} ><span>{this.step < 3 ? EN.Next : EN.DONE}</span></button>
      </div>
    </div>
  }
}

export default observer(SelectTarget)