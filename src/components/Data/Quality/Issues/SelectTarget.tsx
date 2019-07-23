import React, { Component } from 'react';
import styles from '../styles.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { observable } from 'mobx'
import { Icon } from 'antd'
import EN from '../../../../constant/en';
import Project from 'stores/Project';

interface SelectTargetProps {
  saveTargetFixes: () => void,
  closeTarget: () => void,
  project: Project
}

class SelectTarget extends Component<SelectTargetProps> {
  @observable checked: string[] = []
  @observable belongTo: { [key: number]: string[] } = {}
  // @observable belongTo = []
  @observable step = 1
  @observable canSave = false
  @observable belong = -1

  check = e => {
    const { targetUnique } = this.props.project
    const targetUniques = targetUnique || NaN
    let arr, canSave = false;
    if (e.target.checked && !(this.checked.length >= targetUniques)) {
      arr = [...this.checked, e.target.value];
    } else if (!e.target.checked && this.checked.length > 0) {
      arr = this.checked.filter(t => t !== e.target.value);
    } else {
      return false;
    }
    if (!(arr.length > targetUniques) && !(arr.length < targetUniques)) {
      canSave = true
    }
    //修改后重置
    this.belongTo = []
    this.belong = -1
    this.checked = arr
    this.canSave = canSave
  }

  save = () => {
    const { checked, belongTo } = this;
    const { colValueCounts, target, nullLineCounts } = this.props.project;
    // const [v0, v1] = checked
    const sumArr = checked.map((v, index) => {
      const sum = [v, ...(belongTo[index] || [])].reduce((start, v) => start += (v === '' ? nullLineCounts[target] : ((colValueCounts[target] || {})[v] || 0)), 0)
      return { sum, index, value: v }
    })
    // const totalOf0 = [v0, ...belongTo[0]].reduce((start, v) => start += (v === '' ? nullLineCounts[target] : ((colValueCounts[target] || {})[v] || 0)), 0)
    // const totalOf1 = [v1, ...belongTo[1]].reduce((start, v) => start += (v === '' ? nullLineCounts[target] : ((colValueCounts[target] || {})[v] || 0)), 0)
    // const maxKey = totalOf0 >= totalOf1 ? 0 : 1
    // let targetMap = {
    //   [checked[maxKey]]: 0,
    //   [checked[1 - maxKey]]: 1
    // }
    let targetMap: NumberObject = {}
    let otherMap: StringObject = {}
    let targetArray: string[] = []
    sumArr.sort((a, b) => a.sum > b.sum ? -1 : 1).forEach((item, index) => {
      targetArray.push(item.value)
      targetMap[item.value] = index
      belongTo[item.index] && belongTo[item.index].forEach(v => {
        targetMap[v] = index
        otherMap[v] = item.value
      })
    })
    // 重置rename
    // const otherMap = {}
    // this[`belongTo${maxKey}`].forEach(v0 => {
    //   targetMap[v0] = 0
    //   otherMap[v0] = checked[maxKey]
    // })
    // this[`belongTo${1 - maxKey}`].forEach(v1 => {
    //   targetMap[v1] = 1
    //   otherMap[v1] = checked[1 - maxKey]
    // })
    this.props.project.targetArrayTemp = targetArray;
    this.props.project.targetMapTemp = targetMap;
    this.props.project.otherMap = otherMap
    this.props.saveTargetFixes()
  }

  handleBelong = key => {
    this.belong = key === this.belong ? -1 : key
  }

  handleCheck = e => {
    const value = e.target.value
    const checked = e.target.checked
    let belongs = this.belongTo[this.belong] || []
    // const field = `belongTo${key}`
    if (checked && !belongs.includes(value)) belongs = [...belongs, value]
    if (!checked && belongs.includes(value)) belongs = belongs.filter(v => v !== value)
    this.belongTo = { ...this.belongTo, [this.belong]: belongs }
  }

  nextStep = () => {
    this.step++
  }

  backStep = () => {
    this.step--
  }

  handleSelectAll = (e) => {
    const checked = e.target.checked
    if (!checked) return this.belongTo = { ...this.belongTo, [this.belong]: [] }
    const { project } = this.props
    const allKeys: string[] = Object.keys(project.targetColMap).filter(k => !this.checked.includes(k))
    const currentBelong: string[] = Object.values(this.belongTo).reduce((prev: string[], item: undefined | string[], index: number) => index === this.belong ? prev : [...prev, ...(item || [])], [] as string[])
    const belongs = allKeys.filter(k => !currentBelong.includes(k))
    this.belongTo = { ...this.belongTo, [this.belong]: belongs }
  }

  render() {
    const { closeTarget, project } = this.props;

    const { targetColMap, target, colValueCounts, totalRawLines, nullLineCounts, targetUnique } = project
    const { checked } = this
    const targetUniques = targetUnique || NaN
    const isNa = isNaN(targetUniques)
    // const [v0, v1] = checked
    const currentBelong: string[] = Object.values(this.belongTo).reduce((prev: string[], item: undefined | string[]) => [...prev, ...(item || [])], [] as string[])
    const hasNull = Object.keys(targetColMap).includes('')
    const nullPercent = (nullLineCounts[target] || 0) / (totalRawLines || 1) * 85
    const disabledArray: string[] = this.belong < 0 ? Object.keys(targetColMap) : currentBelong.filter(b => !(this.belongTo[this.belong] || []).includes(b))
    const isSelectAll = (currentBelong.length + this.checked.length) === Object.keys(targetColMap).length
    const disableSelectAll = this.belong < 0 || (isSelectAll && (!this.belongTo[this.belong] || !this.belongTo[this.belong].length))

    return <div className={styles.fixesContent}>
      {this.step === 1 && <div className={styles.fixesBox}>
        <div className={styles.fixesText}><span>{EN.Pleaseselect}{isNa ? '' : `${targetUniques}${EN.ge}`}{EN.twovalid}</span></div>
        <div className={styles.targetPercentBox}>
          {Object.keys(targetColMap).filter(_k => _k !== '').map((v, k) => {
            const percent = (colValueCounts[target][v] || 0) / (totalRawLines || 1) * 85
            const backgroundColor = (k === 0 && '#9be44b') || (k === 1 && '#adaafc') || '#c4cbd7'
            return <div className={styles.targetPercentRow} key={k}>
              <div className={styles.targetPercentCheckBox}>
                <input type='checkbox' onChange={this.check} value={v} checked={checked.includes(v)} />
              </div>
              <div className={styles.targetPercentLabel}>
                <span>{v}</span>
              </div>
              <div className={styles.targetPercentValue}>
                <div className={styles.targetPercent} style={{ width: percent + '%', backgroundColor }}></div>
                <span title={colValueCounts[target][v].toString()}>{colValueCounts[target][v] || 0}</span>
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
        <div className={styles.fixesText}><span>{EN.Selectallvaluesthatmatchas}{checked.map(v => v || 'NULL').join(EN.Or)}{EN.MATAHC} </span></div>
        <div className={styles.targetPercentBox}>
          {this.checked.map((t, i) => {
            const percent = ((t === '' ? nullLineCounts[target] : colValueCounts[target][t]) || 0) / (totalRawLines || 1) * 85
            const backgroundColor = (i === 0 && '#9be44b') || (i === 1 && '#adaafc') || '#c4cbd7'
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
            <div className={styles.fixedSelectAll}>
              <input type='checkbox' id={'fixedSelectAll'} checked={!disableSelectAll && isSelectAll} disabled={disableSelectAll} onChange={disableSelectAll ? null : this.handleSelectAll} />
              <label htmlFor={'fixedSelectAll'}>{EN.SelectAll}</label>
            </div>
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
            {this.checked.map((checkBtn, i) =>
              <button key={i} onClick={this.handleBelong.bind(null, i)} className={this.belong === i ? styles.activeButton : null}><span>{EN.Matchas}{checkBtn || 'NULL'}</span></button>
            )}
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
