import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import { Modal, NumberInput } from 'components/Common';
import { observable } from 'mobx'
// import * as d3 from 'd3';
import { Icon, message } from 'antd'
import { formatNumber } from 'util'
import EN from '../../../constant/en';
import OutlierRange from "../../Charts/OutlierRange";
import request from '../../Request'

@inject('userStore')
@observer
export class ClassificationTarget extends Component {
  @observable rename = false
  @observable temp = {}

  showRename = () => {
    this.rename = true
  }

  hideRename = () => {
    this.rename = false
    this.temp = {}
  }

  handleRename = (key, e) => {
    const value = e.target.value
    const { temp } = this
    this.temp = Object.assign({}, temp, { [key]: value })
  }

  handleSave = () => {
    const { temp } = this
    const { targetCounts, renameVariable, updateProject, histgramPlots, target } = this.props.project
    const deleteKeys = []
    for (const k of Object.keys(temp)) {
      if (!temp[k]) delete temp[k]
      if (temp[k] === k) deleteKeys.push(k)
    }
    if (Object.keys(temp).length) {
      const renameValues = Object.entries(renameVariable).map(([k, v]) => {
        if (!deleteKeys.includes(k) && targetCounts.hasOwnProperty(k)) return v
        return null
      }).filter(n => !!n)
      const values = [...Object.keys(targetCounts), ...Object.values(temp).filter(v => !deleteKeys.includes(v)), ...renameValues]
      if (values.length !== [...new Set(values)].length) {

        message.destroy();
        return message.error("Cannot be modified to the same name")
      }
      const { targetArrayTemp, targetMapTemp } = this.props.project
      if (!!targetArrayTemp.length) {
        targetArrayTemp.forEach((v, k) => {
          if (deleteKeys.includes(v)) {
            delete renameVariable[v]
            delete temp[v]
            return
          }
          if (temp.hasOwnProperty(v)) {
            Object.keys(targetMapTemp).forEach(key => {
              if (targetMapTemp[key] === k) temp[key] = temp[v]
            })
          }
        })
      }
      const data = Object.assign({}, renameVariable, temp)
      const updateData = { renameVariable: data }
      //更新histgramPlot  target的图
      if (histgramPlots.hasOwnProperty(target)) {
        delete histgramPlots[target]
        updateData.histgramPlots = histgramPlots
      }
      updateProject(updateData)
    }
    this.rename = false;
    this.temp = {}
  }

  render() {
    const { backToConnect, backToSchema, editTarget, project } = this.props
    const { targetArrayTemp, totalRawLines, renameVariable, targetCounts } = project
    const isLess = Object.keys(targetCounts).filter(_k => _k !== '').length < 2
    const isMore = Object.keys(targetCounts).length > 2
    const isGood = targetArrayTemp.length === 2 || (!isLess && !isMore)
    const hasNull = !isGood && Object.keys(targetCounts).includes('')
    const error = isLess && !hasNull
    const nullPercent = (targetCounts[''] || 0) / (totalRawLines || 1) * 85
    const text = (isGood && EN.Targetvariablequalityisgood) || `${EN.YourtargetvariableHas}${error ? EN.onlyOnevalue : EN.Thantwouniquealues}`;
    const {quality_Fixit=true,quality_rename = true,quality_RemapTarget=true} = this.props.userStore.info.role;
    return <div className={styles.block}>
      <div className={styles.name}>
        {isGood && <div className={styles.cleanHeaderIcon}><Icon type="check" style={{ color: '#fcfcfc', fontSize: '1.6rem' }} /></div>}
        <span>{text}</span>
      </div>
      <div className={styles.desc}>
        <div className={classnames(styles.info, {
          [styles.goodInfo]: isGood
        })}>
          <div className={styles.targetTitleLabel}><span>{EN.TargetValues}</span></div>
          <div className={styles.targetPercentBox}>
            {Object.keys(targetCounts).filter(_k => isGood || _k !== '').map((v, k) => {
              const percent = (targetCounts[v] || 0) / (totalRawLines || 1) * 85
              const backgroundColor = (k === 0 && '#9be44b') || (k === 1 && '#adaafc') || '#c4cbd7'
              const value = this.temp.hasOwnProperty(v) ? this.temp[v] : (renameVariable[v] || v)
              return <div className={styles.targetPercentRow} key={"targetPercentRow" + k}>
                <div className={styles.targetPercentLabel}>
                  {!this.rename ? <span title={value || 'NULL'}>{value || 'NULL'}</span> : <input value={value} onChange={this.handleRename.bind(null, v)} />}
                </div>
                <div className={styles.targetPercentValue}>
                  <div className={styles.targetPercent} style={{ width: percent + '%', backgroundColor }}></div>
                  <span>{targetCounts[v]}</span>
                </div>
              </div>
            })}
          </div>
          {hasNull && <div className={styles.targetTitleLabel}><span>{EN.MissingValues}</span></div>}
          {hasNull && <div className={styles.targetPercentBox}>
            <div className={styles.targetPercentRow} key={"targetPercentRowmissing"}>
              <div className={styles.targetPercentLabel}>
                <span title={this.temp.hasOwnProperty('') ? this.temp[''] : (renameVariable[''] || 'NULL')}>{this.temp.hasOwnProperty('') ? this.temp[''] : (renameVariable[''] || 'NULL')}</span>
              </div>
              <div className={styles.targetPercentValue}>
                <div className={styles.targetPercent} style={{ width: nullPercent + '%', backgroundColor: '#ff97a7' }}/>
                <span>{targetCounts['']}</span>
              </div>
            </div>
          </div>}
          {isGood && <div className={styles.cleanTargetBlock}>
            {!this.rename ? <div
              className={styles.cleanTargetRename}>
              <div
                style={{display:(quality_rename?'':'none')}}
                className={styles.cleanTargetButton}>
                <button onClick={this.showRename}><span>{EN.ChangeTargetVariableValue}</span></button>
              </div>
              <span>({EN.Optional})</span>
              {!!targetArrayTemp.length && <div
                style={{display:(quality_RemapTarget?'':'none')}}
                className={styles.remapTargetButton}>
                <button onClick={editTarget}><span>{EN.RemapTarget}</span></button>
              </div>}
            </div> : <div className={styles.cleanTargetRename}>
                <div className={styles.cleanTargetButton}>
                  <button onClick={this.handleSave} className={styles.save}><span>{EN.Save}</span></button>
                  <button onClick={this.hideRename}><span>{EN.Cancel}</span></button>
                </div>
              </div>}
          </div>}
        </div>
        {!isGood && <div className={styles.methods}>
          <div className={styles.reasonTitle}><span>{EN.PossibleReasons}</span></div>
          <div className={styles.methodBox}>
            <div className={styles.method}>
              <div className={styles.reason}><span>{EN.Itsthewrongtargetvariable}</span></div>
              <div className={styles.button} onClick={backToSchema}>
                <button><span>{EN.ReselectTargetVariable}</span></button>
              </div>
            </div>
            <div className={styles.method}>
              <div className={styles.reason}><span>{EN.Itsgeneraldataqualityissue}</span></div>
              <div className={styles.button} onClick={backToConnect}>
                <button><span>{EN.LoadaNewDataset}</span></button>
              </div>
            </div>
            {!error && <div className={styles.method}>
              <div className={styles.reason}><span>{EN.Thetargetvariablehassomenoise}</span></div>
              <div
                className={styles.button}
                style={{display:(quality_Fixit?"":"none")}}
                onClick={editTarget}>
                <button><span>{EN.Fixit}</span></button>
              </div>
            </div>}
          </div>
        </div>}
      </div>
    </div>
  }
}

@observer
export class RegressionTarget extends Component {
  render() {
    const { backToConnect, backToSchema, hasIssue, unique, recomm } = this.props;
    return !hasIssue ? null : <div className={styles.block}>
      <div className={styles.name}><span>{EN.TargetVariableUniqueValue}</span></div>
      <div className={styles.desc}>
        <div className={styles.info}>
          <div className={styles.infoBox}>
            <div className={styles.infoBlock}>
              <div className={styles.num}><span>{unique}</span></div>
              <div className={styles.text}><span>{EN.YourUniqueValue}</span></div>
            </div>
            <div className={styles.infoBlock}>
              <div className={styles.num}><span>{recomm}+</span></div>
              <div className={styles.text}><span>{EN.Recommended}</span></div>
            </div>
          </div>
        </div>
        <div className={styles.methods}>
          <div className={styles.reasonTitle}><span>{EN.PossibleReasons}</span></div>
          <div className={styles.methodBox}>
            <div className={styles.method}>
              <div className={styles.reason}><span>{EN.Itsthewrongtargetvariable}</span></div>
              <div className={styles.button} onClick={backToSchema}>
                <button><span>{EN.ReselectTargetVariable}</span></button>
              </div>
            </div>
            <div className={styles.method}>
              <div className={styles.reason}><span>{EN.Itsgeneraldataqualityissue}</span></div>
              <div className={styles.button} onClick={backToConnect}>
                <button><span>{EN.LoadaNewDataset}</span></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  }
}

@inject('userStore')
@observer
export class RowIssue extends Component {
  render() {
    const { backToConnect, totalRawLines } = this.props;
    const {quality_LoadaNewDataset=true} = this.props.userStore.info.role;
  
    return <div className={styles.block}>
      <div className={styles.name}><span>{EN.Datasizeistoosmall}</span></div>
      <div className={styles.desc}>
        <div className={styles.info}>
          <div className={styles.progressBox}>
            <div className={styles.progressText}><span>{EN.AllDatatotalRawLinesrows} ({totalRawLines} {EN.Rows})</span><span>{EN.Rowsminimum}</span></div>
            <div className={styles.progress} style={{ width: totalRawLines / 10 + '%' }}/>
          </div>
        </div>
        <div className={styles.methods}>
          <div className={styles.methodBox}>
            <div className={styles.method}>
              <div className={styles.reason}><span>{EN.Datasize} > {EN.Rowsisrecommended}</span></div>
              <div style={{display:quality_LoadaNewDataset?'':'none'}} className={styles.button} onClick={backToConnect}>
                <button><span>{EN.LoadaNewDataset}</span></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  }
}

@observer
export class DataIssue extends Component {
  render() {
    const { backToConnect, editFixes, targetIssuesCountsOrigin, totalLines, percent, totalRawLines } = this.props;

    return <div className={styles.block}>
      <div className={styles.name}><span>{EN.Dataissuesarefound}</span></div>
      <div className={styles.desc}>
        <div className={styles.info}>
          <div className={styles.progressBox}>
            {!!targetIssuesCountsOrigin.nullRow && <div className={styles.issueBlock}>
              <div className={styles.left}>
                <div className={styles.issueRow}><span>{EN.MissingValueS}({targetIssuesCountsOrigin.nullRow} {EN.Rows}) {formatNumber(percent.missing, 2)}%</span></div>
                <div className={classnames(styles.progress, styles.missing)} style={{ width: ((typeof percent.missing === 'number') ? percent.missing : 1) + "%" }}></div>
              </div>
            </div>}
            {!!targetIssuesCountsOrigin.mismatchRow && <div className={styles.issueBlock}>
              <div className={styles.left}>
                <div className={styles.issueRow}><span>{EN.mismatch}({targetIssuesCountsOrigin.mismatchRow} {EN.Rows}) {formatNumber(percent.mismatch, 2)}%</span></div>
                <div className={classnames(styles.progress, styles.mismatch)} style={{ width: ((typeof percent.mismatch === 'number') ? percent.mismatch : 1) + "%" }}></div>
              </div>
            </div>}
            {!!targetIssuesCountsOrigin.outlierRow && <div className={styles.issueBlock}>
              <div className={styles.left}>
                <div className={styles.issueRow}><span>{EN.outlierRow} ({targetIssuesCountsOrigin.outlierRow} {EN.Rows}) {formatNumber(percent.outlier, 2)}%</span></div>
                <div className={classnames(styles.progress, styles.outlier)} style={{ width: ((typeof percent.outlier === 'number') ? percent.outlier : 1) + "%" }}></div>
              </div>
            </div>}
          </div>
          {(totalRawLines > 1000 && totalLines < 1000) && <div className={styles.progressBox}>
            <div className={styles.progressText}><span>{EN.CleanDataS}({totalLines} {EN.Rows})</span><span>{EN.Rowsminimum}</span></div>
            <div className={styles.progress} style={{ width: totalLines / 10 + "%" }}></div>
          </div>}
        </div>

        <div className={styles.methods}>
          <div className={styles.methodBox}>
            <div className={styles.method}>
              <div className={styles.reason}><span>{EN.R2Learnwillfixtheseissuesautomatically}</span></div>
              <div className={styles.button} onClick={editFixes}>
                <button><span>{EN.EdittheFixes}</span></button>
              </div>
            </div>
            {(totalRawLines > 1000 && totalLines < 1000) && <div className={styles.method}>
              <div className={styles.reason}><span>{EN.Datasizewillbesmallerthantheminimumsizeafterdelete}</span></div>
              <div className={styles.button} onClick={backToConnect}>
                <button><span>{EN.LoadaNewDataset}</span></button>
              </div>
            </div>}
          </div>
        </div>
      </div>
    </div>
  }
}

@observer
export class SelectTarget extends Component {
  @observable checked = []
  @observable belongTo0 = []
  @observable belongTo1 = []
  @observable step = 1
  @observable canSave = false
  @observable belong = ""

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
                <div className={styles.targetPercent} style={{ width: percent + '%', backgroundColor }}/>
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

@observer
export class FixIssue extends Component {
  @observable editKey = ''
  @observable visible = false
  @observable progress = 0
  @observable fillMethod = { missing: {}, mismatch: {}, outlier: {} };
  // @observable outLier = {};

  editRange(key) {
    // const { low, high } = this.props.project.rawDataView[key];
    // if (!this.outLier[key]) {
    //   request.post({
    //     url: '/graphics/outlier-range',
    //     data: {
    //       "field": key,
    //       id,
    //       "interval": 20,
    //     },
    //   }).then((result) => {
    //     this.outLier = {
    //       ...this.outLier,
    //       [key]: {
    //         low,
    //         high,
    //         data: result.data,
    //       },
    //     };
    //     this.editKey = key;
    //     this.visible = true;
    //   });
    //   return;
    // }
    this.editKey = key;
    this.visible = true;
  };

  closeEdit = () => {
    this.visible = false
    this.editKey = ''
  }

  saveEdit = (data) => {
    const { editKey } = this;
    this.props.project.outlierDictTemp[editKey] = data;
    this.visible = false
    this.editKey = ''
  }

  nullSelect = (key, e) => {
    let value = e.target.value
    value = isNaN(+(value)) ? value : parseFloat(value)
    const { missing } = this.fillMethod
    missing[key] = value === 'others' ? '' : value
    this.fillMethod.missing = { ...missing }
    // const { nullFillMethodTemp } = this.props.project
    // nullFillMethodTemp[key] = value
    // this.props.project.nullFillMethodTemp = { ...nullFillMethodTemp }
  }

  mismatchSelect = (key, e) => {
    let value = e.target.value
    value = isNaN(+(value)) ? value : parseFloat(value)
    const { mismatch } = this.fillMethod
    mismatch[key] = value === 'others' ? '' : value
    this.fillMethod.mismatch = { ...mismatch }
    // const { mismatchFillMethodTemp } = this.props.project
    // mismatchFillMethodTemp[key] = value
    // this.props.project.mismatchFillMethodTemp = { ...mismatchFillMethodTemp }
  }

  outlierSelect = (key, e) => {
    let value = e.target.value
    value = isNaN(+(value)) ? value : parseFloat(value)
    const { outlier } = this.fillMethod
    outlier[key] = value === 'others' ? '' : value
    this.fillMethod.outlier = { ...outlier }
    // const { outlierFillMethodTemp } = this.props.project
    // outlierFillMethodTemp[key] = value
    // this.props.project.outlierFillMethodTemp = { ...outlierFillMethodTemp }
  }

  save = () => {
    const { project } = this.props
    const realFillMethod = {}
    Object.keys(this.fillMethod).forEach(k => {
      realFillMethod[k] = {}
      Object.keys(this.fillMethod[k]).forEach(field => {
        const value = this.fillMethod[k][field]
        if (value === 0 || !!value) realFillMethod[k][field] = value
      })
    })
    project.nullFillMethodTemp = { ...project.nullFillMethodTemp, ...realFillMethod.missing }
    project.mismatchFillMethodTemp = { ...project.mismatchFillMethodTemp, ...realFillMethod.mismatch }
    project.outlierFillMethodTemp = { ...project.outlierFillMethodTemp, ...realFillMethod.outlier }
    this.props.saveDataFixes()
  }

  formatCell = num => {
    if (typeof num === "number") return formatNumber(num, 2, true)
    if (typeof num === "string") return num
    return "N/A"
  }

  reasonSelect = (key, e) => {
    const value = e.target.value
    const { missingReasonTemp, nullFillMethodTemp, colType } = this.props.project
    if (value === "none") {
      delete nullFillMethodTemp[key]
      delete missingReasonTemp[key]
    } else {
      missingReasonTemp[key] = value
      if (colType[key] === 'Categorical' && value === 'blank') {
        nullFillMethodTemp[key] = 'ignore'
      } else {
        delete nullFillMethodTemp[key]
      }
    }
    this.props.project.missingReasonTemp = { ...missingReasonTemp }
    this.props.project.nullFillMethodTemp = { ...nullFillMethodTemp }
  }

  handleInput = (key, field, value) => {
    this.fillMethod[key][field] = value
  }

  render() {
    const { closeFixes, project, isTarget, nullCount, mismatchCount, outlierCount } = this.props;
    const { mapHeader, colType, mismatchFillMethodTemp, nullFillMethodTemp, outlierFillMethodTemp, totalRawLines, rawDataView, outlierDictTemp, target, nullLineCounts, mismatchLineCounts, outlierLineCounts, missingReasonTemp, dataHeader } = project
    return <div className={styles.fixesContent}>
      <div className={styles.fixesBlock}>
        {!!mismatchCount && <div className={styles.fixesArea}>
          <div className={styles.typeBox}>
            <div className={styles.type}>
              <div className={classnames(styles.typeBlock, styles.mismatch)} />
              <span>{EN.DataTypeMismatch}</span>
            </div>
          </div>
          <div className={styles.fixesTable}>
            <div className={classnames(styles.fixesRow, styles.fixesHeader)}>
              <div className={classnames(styles.fixesTd, styles.fixesLarge)}><span>{EN.VariableName}</span></div>
              <div className={styles.fixesTd}><span>{EN.DataType}</span></div>
              <div className={styles.fixesTd}><span>{EN.QuantityofMismatch}</span></div>
              <div className={styles.fixesTd}><span>{EN.Mean}</span></div>
              <div className={styles.fixesTd}><span>{EN.Median}</span></div>
              <div className={styles.fixesTd}><span>{EN.MostFrequentValue}</span></div>
              <div className={classnames(styles.fixesTd, styles.fixesLarge)}><span>{EN.Fix}</span></div>
            </div>
            <div className={styles.fixesBody}>
              {Object.keys(mismatchLineCounts).map((k, i) => {
                if (!dataHeader.includes(k)) return null
                if (isTarget && k !== target) return null
                if (!isTarget && k === target) return null
                const originNum = mismatchLineCounts[k]
                if (!originNum) {
                  return null;
                }
                const num = mismatchLineCounts[k] || 0
                const showType = colType[k] === 'Numerical' ? 'Numerical' : 'Categorical'
                if (showType !== 'Numerical') return null
                const percnet = num / (totalRawLines || 1) * 100
                const rowText = num + ' (' + (percnet === 0 ? 0 : percnet < 0.01 ? '<0.01' : formatNumber(percnet, 2)) + '%)'
                const mode = !rawDataView ? 'N/A' : (showType === 'Numerical' ? 'N/A' : rawDataView[k].mode)
                const mean = !rawDataView ? 'N/A' : (showType === 'Numerical' ? rawDataView[k].mean : 'N/A')
                const median = !rawDataView ? 'N/A' : (showType === 'Numerical' ? rawDataView[k].median : 'N/A')
                const mismatchArray = showType === 'Categorical' ? [{
                  value: 'mode',
                  label: EN.Replacewithmostfrequentvalue
                }, {
                  value: 'drop',
                  label: EN.Deletetherows
                }, {
                  value: 'ignore',
                  label: EN.Replacewithauniquevalue
                }] : [{
                  value: 'mean',
                  label: EN.Replacewithmeanvalue
                }, {
                  value: 'drop',
                  label: EN.Deletetherows
                }, {
                  value: 'min',
                  label: EN.Replacewithminvalue
                }, {
                  value: 'max',
                  label: EN.Replacewithmaxvalue
                }, {
                  value: 'median',
                  label: EN.Replacewithmedianvalue
                }, {
                  value: 'zero',
                  label: EN.ReplaceWith0
                }, {
                  value: 'others',
                  label: EN.Replacewithothers
                }]
                const method = this.fillMethod.mismatch.hasOwnProperty(k) ?
                  this.fillMethod.mismatch[k] :
                  mismatchFillMethodTemp.hasOwnProperty(k) ?
                    mismatchFillMethodTemp[k] :
                    (showType === 'Categorical' ? 'mode' : 'mean')
                const isOthers = !mismatchArray.find(_a => _a.value === method)
                return <div className={styles.fixesRow} key={i}>
                  <div className={classnames(styles.fixesCell, styles.fixesLarge)}><span title={mapHeader[k]}>{mapHeader[k]}</span></div>
                  <div className={styles.fixesCell}><span>{showType === 'Numerical' ? EN.Numerical : EN.Categorical}</span></div>
                  <div className={styles.fixesCell}><span title={rowText}>{rowText}</span></div>
                  <div className={styles.fixesCell}><span title={this.formatCell(mean)}>{this.formatCell(mean)}</span></div>
                  <div className={styles.fixesCell}><span title={this.formatCell(median)}>{this.formatCell(median)}</span></div>
                  <div className={styles.fixesCell}><span title={this.formatCell(mode)}>{this.formatCell(mode)}</span></div>
                  <div className={classnames(styles.fixesCell, styles.fixesLarge)}>
                    <select value={isOthers ? 'others' : method} onChange={this.mismatchSelect.bind(null, k)}>
                      {mismatchArray.map(item => {
                        return <option value={item.value} key={item.value}>{item.label}</option>
                      })}
                    </select>
                    {isOthers && <NumberInput value={method} onBlur={this.handleInput.bind(null, 'mismatch', k)} />}
                  </div>
                </div>

                // const mode = !rawDataView ? 'N/A' : (showType === 'Numerical' ? 'N/A' : (rawDataView[k].mode === 'nan' ? (rawDataView[k].modeNotNull || [])[1] : rawDataView[k].mode))
                // const mean = !rawDataView ? 'N/A' : (showType === 'Numerical' ? rawDataView[k].mean : 'N/A')
                // const median = !rawDataView ? 'N/A' : (showType === 'Numerical' ? rawDataView[k].median : 'N/A')
                // const method = this.fillMethod.mismatch.hasOwnProperty(k) ?
                //   this.fillMethod.mismatch[k] :
                //   mismatchFillMethodTemp.hasOwnProperty(k) ?
                //     mismatchFillMethodTemp[k] :
                //     (showType === 'Categorical' ? mode : mean)
                // const showMethod = (showType !== 'Categorical' &&
                //   method !== mean &&
                //   method !== 'drop' &&
                //   method !== (!rawDataView ? 'N/A' : rawDataView[k].min) &&
                //   method !== (!rawDataView ? 'N/A' : rawDataView[k].max) &&
                //   method !== median &&
                //   method !== 0) ? '' : method
                // return <div className={styles.fixesRow} key={i}>
                //   <div className={classnames(styles.fixesCell, styles.fixesLarge)}><span title={k}>{k}</span></div>
                //   <div className={styles.fixesCell}><span>{showType === 'Numerical' ? EN.Numerical : EN.Categorical}</span></div>
                //   <div className={styles.fixesCell}><span title={rowText}>{rowText}</span></div>
                //   <div className={styles.fixesCell}><span title={this.formatCell(mean)}>{this.formatCell(mean)}</span></div>
                //   <div className={styles.fixesCell}><span title={this.formatCell(median)}>{this.formatCell(median)}</span></div>
                //   <div className={styles.fixesCell}><span title={this.formatCell(mode)}>{this.formatCell(mode)}</span></div>
                //   <div className={classnames(styles.fixesCell, styles.fixesLarge)}>
                //     <select value={showMethod} onChange={this.mismatchSelect.bind(null, k)}>
                //       {showType === 'Categorical' ? [
                //         <option value={mode} key="mode">{EN.Replacewithmostfrequentvalue}</option>,
                //         <option value="drop" key="drop">{EN.Deletetherows}</option>,
                //         <option value="ignore" key="ignore">{EN.Replacewithauniquevalue}</option>
                //       ] : [
                //           <option value={mean} key='mean'>{EN.Replacewithmeanvalue}</option>,
                //           <option value="drop" key='drop'>{EN.Deletetherows}</option>,
                //           <option value={!rawDataView ? 'N/A' : rawDataView[k].min} key='min'>{EN.Replacewithminvalue}</option>,
                //           <option value={!rawDataView ? 'N/A' : rawDataView[k].max} key='max'>{EN.Replacewithmaxvalue}</option>,
                //           // <option value={mode} key='mode'>Replace with most frequent value</option>,
                //           <option value={median} key='median'>{EN.Replacewithmedianvalue}</option>,
                //           <option value={0} key={0}>{EN.ReplaceWith0}</option>,
                //           <option value={''} key='others'>{EN.Replacewithothers}</option>
                //         ]}
                //     </select>
                //     {showMethod === '' && <NumberInput value={method} onBlur={this.handleInput.bind(null, 'mismatch', k)} />}
                //   </div>
                // </div>
              })}
            </div>
          </div>
        </div>}
        {!!nullCount && <div className={styles.fixesArea}>
          <div className={styles.typeBox}>
            <div className={styles.type}>
              <div className={classnames(styles.typeBlock, styles.missing)} />
              <span>{EN.MissingValue}</span>
            </div>
          </div>
          <div className={styles.fixesTable}>
            <div className={classnames(styles.fixesRow, styles.fixesHeader)}>
              <div className={styles.fixesTd}><span>{EN.VariableName}</span></div>
              <div className={styles.fixesTd}><span>{EN.MissingReason}</span></div>
              <div className={styles.fixesTd}><span>{EN.Data}</span></div>
              <div className={styles.fixesTd}><span>{EN.QuantityofMissingValue}</span></div>
              <div className={styles.fixesTd}><span>{EN.Mean}</span></div>
              <div className={styles.fixesTd}><span>{EN.Median}</span></div>
              <div className={styles.fixesTd}><span>{EN.MostFrequentValue}</span></div>
              <div className={classnames(styles.fixesTd, styles.fixesLarge)}><span>{EN.Fix}</span></div>
            </div>
            <div className={styles.fixesBody}>
              {Object.keys(nullLineCounts).map((k, i) => {
                if (!dataHeader.includes(k)) return null
                if (isTarget && k !== target) return null
                if (!isTarget && k === target) return null
                const originNum = nullLineCounts[k]
                if (!originNum) {
                  return null;
                }
                const num = nullLineCounts[k] || 0
                const showType = colType[k] === 'Numerical' ? 'Numerical' : 'Categorical'
                const percnet = num / (totalRawLines || 1) * 100
                const rowText = num + ' (' + (percnet === 0 ? 0 : percnet < 0.01 ? '<0.01' : formatNumber(percnet, 2)) + '%)'
                const mode = !rawDataView ? 'N/A' : (showType === 'Numerical' ? 'N/A' : (rawDataView[k].mode === 'nan' ? (rawDataView[k].modeNotNull || [])[1] : rawDataView[k].mode))
                const mean = !rawDataView ? 'N/A' : (showType === 'Numerical' ? rawDataView[k].mean : 'N/A')
                const median = !rawDataView ? 'N/A' : (showType === 'Numerical' ? rawDataView[k].median : 'N/A')
                const nullArray = showType === 'Categorical' ? [{
                  value: 'mode',
                  label: EN.Replacewithmostfrequentvalue
                }, {
                  value: 'drop',
                  label: EN.Deletetherows
                }, {
                  value: 'ignore',
                  label: EN.Replacewithauniquevalue
                }] : [{
                  value: 'mean',
                  label: EN.Replacewithmeanvalue
                }, {
                  value: 'drop',
                  label: EN.Deletetherows
                }, {
                  value: 'min',
                  label: EN.Replacewithminvalue
                }, {
                  value: 'max',
                  label: EN.Replacewithmaxvalue
                }, {
                  value: 'median',
                  label: EN.Replacewithmedianvalue
                }, {
                  value: 'zero',
                  label: EN.ReplaceWith0
                }, {
                  value: 'others',
                  label: EN.Replacewithothers
                }]
                const method = this.fillMethod.missing.hasOwnProperty(k) ?
                  this.fillMethod.missing[k] :
                  nullFillMethodTemp.hasOwnProperty(k) ?
                    nullFillMethodTemp[k] :
                    (showType === 'Categorical' ? 'mode' : 'mean')
                const isOthers = !nullArray.find(_a => _a.value === method)
                return <div className={styles.fixesRow} key={i}>
                  <div className={styles.fixesCell}><span title={mapHeader[k]}>{mapHeader[k]}</span></div>
                  <div className={styles.fixesCell}><select value={missingReasonTemp[k]} onChange={this.reasonSelect.bind(null, k)}>
                    <option value='none' key="none">{EN.Idonknow}</option>
                    <option value="blank" key="blank">{EN.Leftblankonpurpose}</option>
                    <option value='fail' key='fail'>{EN.FailedtoCollectorDataError}</option>
                  </select></div>
                  <div className={styles.fixesCell}><span>{showType === 'Numerical' ? EN.Numerical : EN.Categorical}</span></div>
                  <div className={styles.fixesCell}><span title={rowText}>{rowText}</span></div>
                  <div className={styles.fixesCell}><span title={this.formatCell(mean)}>{this.formatCell(mean)}</span></div>
                  <div className={styles.fixesCell}><span title={this.formatCell(median)}>{this.formatCell(median)}</span></div>
                  <div className={styles.fixesCell}><span title={this.formatCell(mode)}>{this.formatCell(mode)}</span></div>
                  <div className={classnames(styles.fixesCell, styles.fixesLarge)}>
                    <select value={isOthers ? 'others' : method} onChange={this.nullSelect.bind(null, k)}>
                      {nullArray.map(item => {
                        return <option value={item.value} key={item.value}>{item.label}</option>
                      })}
                    </select>
                    {isOthers && <NumberInput value={method} onBlur={this.handleInput.bind(null, 'missing', k)} />}
                  </div>
                </div>


                // const mode = !rawDataView ? 'N/A' : (showType === 'Numerical' ? 'N/A' : (rawDataView[k].mode === 'nan' ? (rawDataView[k].modeNotNull || [])[1] : rawDataView[k].mode))
                // const mean = !rawDataView ? 'N/A' : (showType === 'Numerical' ? rawDataView[k].mean : 'N/A')
                // const median = !rawDataView ? 'N/A' : (showType === 'Numerical' ? rawDataView[k].median : 'N/A')
                // const method = this.fillMethod.missing.hasOwnProperty(k) ?
                //   this.fillMethod.missing[k] :
                //   nullFillMethodTemp.hasOwnProperty(k) ?
                //     nullFillMethodTemp[k] :
                //     (showType === 'Categorical' ? mode : mean)
                // const showMethod = (showType !== 'Categorical' &&
                //   method !== mean &&
                //   method !== 'drop' &&
                //   method !== (!rawDataView ? 'N/A' : rawDataView[k].min) &&
                //   method !== (!rawDataView ? 'N/A' : rawDataView[k].max) &&
                //   method !== median &&
                //   method !== 0) ? '' : method
                // return <div className={styles.fixesRow} key={i}>
                //   <div className={styles.fixesCell}><span title={k}>{k}</span></div>
                //   <div className={styles.fixesCell}><select value={missingReasonTemp[k]} onChange={this.reasonSelect.bind(null, k)}>
                //     <option value='none' key="none">{EN.Idonknow}</option>
                //     <option value="blank" key="blank">{EN.Leftblankonpurpose}</option>
                //     <option value='fail' key='fail'>{EN.FailedtoCollectorDataError}</option>
                //   </select></div>
                //   <div className={styles.fixesCell}><span>{showType === 'Numerical' ? EN.Numerical : EN.Categorical}</span></div>
                //   <div className={styles.fixesCell}><span title={rowText}>{rowText}</span></div>
                //   <div className={styles.fixesCell}><span title={this.formatCell(mean)}>{this.formatCell(mean)}</span></div>
                //   <div className={styles.fixesCell}><span title={this.formatCell(median)}>{this.formatCell(median)}</span></div>
                //   <div className={styles.fixesCell}><span title={this.formatCell(mode)}>{this.formatCell(mode)}</span></div>
                //   <div className={classnames(styles.fixesCell, styles.fixesLarge)}>
                //     <select value={showMethod} onChange={this.nullSelect.bind(null, k)}>
                //       {showType === 'Categorical' ? [
                //         <option value={mode} key="mode">{EN.Replacewithmostfrequentvalue}</option>,
                //         <option value="drop" key="drop">{EN.Deletetherows}</option>,
                //         <option value='ignore' key='ignore'>{EN.Replacewithauniquevalue}</option>
                //       ] : [
                //           <option value={mean} key='mean'>{EN.Replacewithmeanvalue}</option>,
                //           <option value="drop" key='drop'>{EN.Deletetherows}</option>,
                //           <option value={!rawDataView ? 'N/A' : rawDataView[k].min} key='min'>{EN.Replacewithminvalue}</option>,
                //           <option value={!rawDataView ? 'N/A' : rawDataView[k].max} key='max'>{EN.Replacewithmaxvalue}</option>,
                //           // <option value={mode} key='mode'>Replace with most frequent value</option>,
                //           <option value={median} key='median'>{EN.Replacewithmedianvalue}</option>,
                //           <option value={0} key={0}>{EN.ReplaceWith0}</option>,
                //           <option value={''} key='others'>{EN.Replacewithothers}</option>
                //         ]}
                //     </select>
                //     {showMethod === '' && <NumberInput value={method || ''} onBlur={this.handleInput.bind(null, 'missing', k)} />}
                //   </div>
                // </div>
              })}
            </div>
          </div>
        </div>}
        {!!outlierCount && <div className={styles.fixesArea}>
          <div className={styles.typeBox}>
            <div className={styles.type}>
              <div className={classnames(styles.typeBlock, styles.outlier)} />
              <span>{EN.Outlier}</span>
            </div>
          </div>
          <div className={styles.fixesTable}>
            <div className={classnames(styles.fixesRow, styles.fixesHeader)}>
              <div className={styles.fixesTd}><span>{EN.VariableName}</span></div>
              <div className={styles.fixesTd}><span>{EN.ValidRange}</span></div>
              <div className={styles.fixesTd}><span>{EN.DataType}</span></div>
              <div className={styles.fixesTd}><span>{EN.QuantityofOutlier}</span></div>
              <div className={styles.fixesTd}><span>{EN.Mean}</span></div>
              <div className={styles.fixesTd}><span>{EN.Median}</span></div>
              <div className={classnames(styles.fixesTd, styles.fixesLarge)}><span>{EN.Fix}</span></div>
            </div>
            <div className={styles.fixesBody}>
              {Object.keys(outlierLineCounts).map((k, i) => {
                if (!dataHeader.includes(k)) return null
                if (isTarget && k !== target) return null
                if (!isTarget && k === target) return null
                const originNum = outlierLineCounts[k]
                if (!originNum) {
                  return null;
                }
                const num = outlierLineCounts[k] || 0
                const showType = colType[k] === 'Numerical' ? 'Numerical' : 'Categorical'
                if (showType !== 'Numerical') return null
                const isShow = showType === 'Numerical';
                if (!isShow) return null
                const outlier = outlierDictTemp[k] && outlierDictTemp[k].length === 2 ? outlierDictTemp[k] : [rawDataView[k].low, rawDataView[k].high];
                const percnet = num / (totalRawLines || 1) * 100
                const rowText = num + ' (' + (percnet === 0 ? 0 : percnet < 0.01 ? '<0.01' : formatNumber(percnet, 2)) + '%)'
                const mean = !rawDataView ? 'N/A' : rawDataView[k].mean
                const median = !rawDataView ? 'N/A' : rawDataView[k].median
                const outlierArray = [{
                  value: 'ignore',
                  label: EN.DoNothing
                }, {
                  value: 'drop',
                  label: EN.Deletetherows
                }, {
                  value: 'mean',
                  label: EN.Replacewithmeanvalue
                }, {
                  value: 'median',
                  label: EN.Replacewithmedianvalue
                }, {
                  value: 'zero',
                  label: EN.ReplaceWith0
                }, {
                  value: 'others',
                  label: EN.Replacewithothers
                }]
                const method = this.fillMethod.outlier.hasOwnProperty(k) ?
                  this.fillMethod.outlier[k] :
                  outlierFillMethodTemp.hasOwnProperty(k) ?
                    outlierFillMethodTemp[k] : 'ignore'
                const isOthers = !outlierArray.find(_a => _a.value === method)
                return <div className={styles.fixesRow} key={i}>
                  <div className={styles.fixesCell}><span title={mapHeader[k]}>{mapHeader[k]}</span></div>
                  <div className={classnames(styles.fixesCell, styles.fixesBwtween)}>
                    <span title={formatNumber(outlier[0], 2) + "-" + formatNumber(outlier[1], 2)}>
                      {formatNumber(outlier[0], 2) + "-" + formatNumber(outlier[1], 2)}
                    </span><span className={styles.fixesEdit} onClick={this.editRange.bind(this, k, project.etlIndex)}>{EN.Edit}</span>
                  </div>
                  <div className={styles.fixesCell}><span>{showType === 'Numerical' ? EN.Numerical : EN.Categorical}</span></div>
                  <div className={styles.fixesCell}><span title={rowText}>{rowText}</span></div>
                  <div className={styles.fixesCell}><span title={this.formatCell(mean)} >{this.formatCell(mean)}</span></div>
                  <div className={styles.fixesCell}><span title={this.formatCell(median)}>{this.formatCell(median)}</span></div>
                  <div className={classnames(styles.fixesCell, styles.fixesLarge)}>
                    <select value={isOthers ? 'others' : method} onChange={this.outlierSelect.bind(null, k)}>
                      {outlierArray.map(item => {
                        return <option value={item.value} key={item.value}>{item.label}</option>
                      })}
                    </select>
                    {isOthers && <NumberInput value={method} onBlur={this.handleInput.bind(null, 'outlier', k)} />}
                  </div>
                </div>

                // const mean = !rawDataView ? 'N/A' : rawDataView[k].mean
                // const median = !rawDataView ? 'N/A' : rawDataView[k].median
                // const method = this.fillMethod.outlier.hasOwnProperty(k) ?
                //   this.fillMethod.outlier[k] :
                //   outlierFillMethodTemp.hasOwnProperty(k) ?
                //     outlierFillMethodTemp[k] :
                //     'ignore'
                // const showMethod = (showType !== 'Categorical' &&
                //   method !== mean &&
                //   method !== 'drop' &&
                //   method !== 'ignore' &&
                //   method !== (!rawDataView ? 'N/A' : rawDataView[k].min) &&
                //   method !== (!rawDataView ? 'N/A' : rawDataView[k].max) &&
                //   method !== median &&
                //   method !== 0) ? '' : method;
                // return <div className={styles.fixesRow} key={i}>
                //   <div className={styles.fixesCell}><span title={k}>{k}</span></div>
                //   <div className={classnames(styles.fixesCell, styles.fixesBwtween)}>
                //     <span title={formatNumber(outlier[0], 2) + "-" + formatNumber(outlier[1], 2)}>
                //       {formatNumber(outlier[0], 2) + "-" + formatNumber(outlier[1], 2)}
                //     </span><span className={styles.fixesEdit} onClick={this.editRange.bind(this, k, project.etlIndex)}>{EN.Edit}</span>
                //   </div>
                //   <div className={styles.fixesCell}><span>{showType === 'Numerical' ? EN.Numerical : EN.Categorical}</span></div>
                //   <div className={styles.fixesCell}><span title={rowText}>{rowText}</span></div>
                //   <div className={styles.fixesCell}><span title={this.formatCell(mean)} >{this.formatCell(mean)}</span></div>
                //   <div className={styles.fixesCell}><span title={this.formatCell(median)}>{this.formatCell(median)}</span></div>
                //   <div className={classnames(styles.fixesCell, styles.fixesLarge)}>
                //     <select value={showMethod} onChange={this.outlierSelect.bind(null, k)}>
                //       <option value="ignore" key='ignore'>{EN.DoNothing}</option>
                //       <option value="drop" key='drop'>{EN.Deletetherows}</option>
                //       <option value={mean} key='mean'>{EN.Replacewithmeanvalue}</option>
                //       <option value={median} key='median'>{EN.Replacewithmedianvalue}</option>
                //       {/* <option value={mode} key='mode'>Replace with most frequent value</option> */}
                //       <option value={0} key='0'>{EN.ReplaceWith0}</option>,
                //       <option value={''} key='others'>{EN.Replacewithothers}</option>
                //     </select>
                //     {showMethod === '' && <NumberInput value={method || ''} onBlur={this.handleInput.bind(null, 'outlier', k)} />}
                //   </div>
                // </div>
              })}
            </div>
          </div>
        </div>}
      </div>
      <div className={styles.fixesBottom}>
        <button className={styles.save} onClick={this.save} ><span>{EN.Save}</span></button>
        <button className={styles.cancel} onClick={closeFixes}><span>{EN.CANCEL}</span></button>
      </div>
      {
        this.visible && <Modal
          closeByMask={true}
          showClose={true}
          visible={this.visible}
          title={EN.Outlier}
          onClose={this.closeEdit}
          content={
            <OutlierRange
              closeEdit={this.closeEdit}
              saveEdit={this.saveEdit}
              field={this.editKey}
              id={project.originalIndex}
              project={project}
            />
          } />}

    </div>
  }
}

@observer
class EditOutLier extends Component {
  @observable min = this.props.outlierDict && this.props.outlierDict.length === 2 ? this.props.outlierDict[0] : this.props.outlierRange[0]
  @observable max = this.props.outlierDict && this.props.outlierDict.length === 2 ? this.props.outlierDict[1] : this.props.outlierRange[1]
  @observable temp = ''
  @observable focus = ''

  constructor(props) {
    super(props)
    // const { x } = props
    // const minX = x[0];
    // const maxX = x[x.length - 1];
    // const offset = (maxX - minX) / 4;
    // this.minX = minX - offset;
    // this.maxX = maxX + offset;
    this.count = 4;
  }

  // componentDidMount() {
  //   this.d3Chart()
  // }
  //
  // componentDidUpdate() {
  //   this.d3Chart()
  // }

  // d3Chart = () => {
  //   d3.select(`.${styles.d3Chart} svg`).remove();
  //   const { width, height, x, y, minX, maxX } = this.props;
  //   let { min, max } = this;
  //   const padding = { left: 50, bottom: 30, right: 5, top: 100 };
  //
  //   const realHeight = height - padding.bottom - padding.top;
  //   const realWidth = width - padding.left - padding.right;
  //   //添加一个 SVG 画布
  //   const svg = d3.select(`.${styles.d3Chart}`)
  //     .append("svg")
  //     .attr("width", width)
  //     .attr("height", height)
  //     .append("g")
  //     .attr('transform', `translate(${padding.left}, 0)`);
  //
  //   const maxH = d3.max(y) || 1;
  //   const dataset = [];
  //
  //   //x轴的比例尺
  //   const xScale = d3.scaleLinear()
  //     .domain([minX, maxX])
  //     .range([0, realWidth])
  //     .clamp(true);
  //
  //   //y轴的比例尺
  //   const yScale = d3.scaleLinear()
  //     .domain([0, maxH])
  //     .range([realHeight, 0])
  //     .clamp(true);
  //
  //   //定义x轴
  //   const xAxis = d3.axisBottom(xScale);
  //
  //   //定义y轴
  //   const yAxis = d3.axisLeft(yScale);
  //
  //   //添加x轴
  //   svg.append("g")
  //     .attr("class", `${styles.axis}`)
  //     .attr("transform", `translate(0, ${realHeight + padding.top})`)
  //     .call(xAxis);
  //
  //   //添加y轴
  //   svg.append("g")
  //     .attr("class", `${styles.axis}`)
  //     .attr("transform", `translate(0, ${padding.top})`)
  //     .call(yAxis);
  //
  //   const drawDrag = () => {
  //     const minDrag = d3.drag()
  //       .on('drag', () => {
  //         let minTemp = xScale.invert(d3.event.x)
  //         if (minTemp > max) minTemp = max;
  //         if (minTemp < minX) minTemp = minX;
  //         if (minTemp === min) return;
  //         min = minTemp;
  //         minRect.attr('width', xScale(min))
  //         minLine.attr('x1', xScale(min))
  //           .attr('x2', xScale(min))
  //         minCircle.attr('cx', xScale(min))
  //         minText.attr('x', xScale(min))
  //           .text(this.renderNum(min))
  //         if (Math.abs(xScale(max) - xScale(min)) < 40) {
  //           maxCircle.attr('cy', padding.top - 57)
  //           maxText.attr('y', padding.top - 53)
  //         } else {
  //           maxCircle.attr('cy', padding.top - 17)
  //           maxText.attr('y', padding.top - 13)
  //         }
  //
  //         drawRect()
  //       })
  //       .on('end', () => {
  //         this.min = min
  //       });
  //
  //     let minDragBlock = svg.append('g');
  //     let minRect = minDragBlock.append('rect')
  //       .attr('class', `${styles.dragRect}`)
  //       .attr('x', xScale(minX))
  //       .attr('y', yScale(maxH) + padding.top)
  //       .attr('width', xScale(min) - xScale(minX))
  //       .attr('height', realHeight)
  //
  //     let minLine = minDragBlock.append('line')
  //       .attr('class', `${styles.dragLine}`)
  //       .attr('x1', xScale(min) - xScale(minX))
  //       .attr('y1', yScale(maxH) + padding.top)
  //       .attr('x2', xScale(min) - xScale(minX))
  //       .attr('y2', realHeight + padding.top)
  //
  //     let minCircle = minDragBlock.append('circle')
  //       .attr('class', `${styles.dragCircle}`)
  //       .attr('cx', xScale(min))
  //       .attr('cy', padding.top - 17)
  //       .attr('r', 20)
  //       .attr('fill', '#c7f1ee')
  //       .call(minDrag);
  //
  //     let minText = minDragBlock.append('text')
  //       .attr('class', `${styles.dragText}`)
  //       .text(this.renderNum(min))
  //       .attr('x', xScale(min))
  //       .attr('y', padding.top - 13)
  //       .call(minDrag);
  //
  //     const maxDrag = d3.drag()
  //       .on('drag', () => {
  //         let maxTemp = xScale.invert(d3.event.x)
  //         if (maxTemp < min) maxTemp = min;
  //         if (maxTemp > maxX) maxTemp = maxX;
  //         if (maxTemp === max) return;
  //         max = maxTemp;
  //         maxRect.attr('x', xScale(max))
  //           .attr('width', xScale(maxX) - xScale(max))
  //         maxLine.attr('x1', xScale(max))
  //           .attr('x2', xScale(max))
  //         maxCircle.attr('cx', xScale(max))
  //         maxText.attr('x', xScale(max))
  //           .text(this.renderNum(max))
  //         if (Math.abs(xScale(max) - xScale(min)) < 40) {
  //           maxCircle.attr('cy', padding.top - 57)
  //           maxText.attr('y', padding.top - 53)
  //         } else {
  //           maxCircle.attr('cy', padding.top - 17)
  //           maxText.attr('y', padding.top - 13)
  //         }
  //         drawRect()
  //       })
  //       .on('end', () => {
  //         this.max = max
  //       });
  //
  //     let maxDragBlock = svg.append('g');
  //     let maxRect = maxDragBlock.append('rect')
  //       .attr('class', `${styles.dragRect}`)
  //       .attr('x', xScale(max))
  //       .attr('y', yScale(maxH) + padding.top)
  //       .attr('width', xScale(maxX) - xScale(max))
  //       .attr('height', realHeight)
  //
  //     let maxLine = maxDragBlock.append('line')
  //       .attr('class', `${styles.dragLine}`)
  //       .attr('x1', xScale(max))
  //       .attr('y1', yScale(maxH) + padding.top)
  //       .attr('x2', xScale(max))
  //       .attr('y2', realHeight + padding.top);
  //
  //     let maxCircle = maxDragBlock.append('circle')
  //       .attr('class', `${styles.dragCircle}`)
  //       .attr('cx', xScale(max))
  //       .attr('cy', () => {
  //         if (Math.abs(xScale(max) - xScale(min)) < 40) {
  //           return padding.top - 57
  //         }
  //         return padding.top - 17
  //       })
  //       .attr('r', 20)
  //       .attr('fill', '#ffd287')
  //       .call(maxDrag);
  //
  //     let maxText = maxDragBlock.append('text')
  //       .attr('class', `${styles.dragText}`)
  //       .text(this.renderNum(max))
  //       .attr('x', xScale(max))
  //       .attr('y', () => {
  //         if (Math.abs(xScale(max) - xScale(min)) < 40) {
  //           return padding.top - 53
  //         }
  //         return padding.top - 13
  //       })
  //       .call(maxDrag);
  //
  //   }
  //
  //   //初始化拖动
  //   drawDrag()
  //
  //   //添加矩形元素
  //   const drawRect = () => {
  //     // 处理dataset数据
  //     for (let i = 1; i < x.length; i++) {
  //       if (x[i] <= min || x[i - 1] >= max) {
  //         dataset.push({
  //           x: xScale(x[i - 1]),
  //           y: yScale(y[i - 1]) + padding.top,
  //           width: Math.abs(xScale(x[i]) - xScale(x[i - 1])),
  //           class: styles.outer
  //         })
  //       } else if (x[i] <= max && x[i - 1] >= min) {
  //         dataset.push({
  //           x: xScale(x[i - 1]),
  //           y: yScale(y[i - 1]) + padding.top,
  //           width: Math.abs(xScale(x[i]) - xScale(x[i - 1])),
  //           class: styles.rect
  //         })
  //       } else if (x[i] > max && x[i - 1] < max && x[i - 1] > min) {
  //         const left = Math.abs(xScale(x[i - 1]) - xScale(max))
  //         dataset.push({
  //           x: xScale(x[i - 1]),
  //           y: yScale(y[i - 1]) + padding.top,
  //           width: left,
  //           class: styles.rect
  //         })
  //         dataset.push({
  //           x: xScale(x[i - 1]) + left,
  //           y: yScale(y[i - 1]) + padding.top,
  //           width: Math.abs(xScale(x[i]) - xScale(x[i - 1])) - left,
  //           class: styles.outer
  //         })
  //       } else if (x[i] > min && x[i - 1] < min && x[i] < max) {
  //         const left = Math.abs(xScale(x[i - 1]) - xScale(min))
  //         dataset.push({
  //           x: xScale(x[i - 1]),
  //           y: yScale(y[i - 1]) + padding.top,
  //           width: left,
  //           class: styles.outer
  //         })
  //         dataset.push({
  //           x: xScale(x[i - 1]) + left,
  //           y: yScale(y[i - 1]) + padding.top,
  //           width: Math.abs(xScale(x[i]) - xScale(x[i - 1])) - left,
  //           class: styles.rect
  //         })
  //       } else {
  //         if (min > max) {
  //           dataset.push({
  //             x: xScale(x[i - 1]),
  //             y: yScale(y[i - 1]) + padding.top,
  //             width: Math.abs(xScale(x[i]) - xScale(x[i - 1])),
  //             class: styles.outer
  //           })
  //         } else {
  //           const left = Math.abs(xScale(x[i - 1]) - xScale(min))
  //           const middle = Math.abs(xScale(max) - xScale(min))
  //           dataset.push({
  //             x: xScale(x[i - 1]),
  //             y: yScale(y[i - 1]) + padding.top,
  //             width: left,
  //             class: styles.outer
  //           })
  //           dataset.push({
  //             x: xScale(x[i - 1]) + left,
  //             y: yScale(y[i - 1]) + padding.top,
  //             width: middle,
  //             class: styles.rect
  //           })
  //           dataset.push({
  //             x: xScale(x[i - 1]) + left + middle,
  //             y: yScale(y[i - 1]) + padding.top,
  //             width: Math.abs(xScale(x[i]) - xScale(x[i - 1])) - left - middle,
  //             class: styles.outer
  //           })
  //         }
  //       }
  //     }
  //
  //     const rects = svg.selectAll(`.${styles.rect}`);
  //     rects.remove();
  //     rects.data(dataset)
  //       .enter()
  //       .append("rect")
  //       .attr("class", (d) => d.class)
  //       // .attr("transform",`translate(0,${padding.top})`)
  //       .attr("x", (d) => d.x)
  //       .attr("y", (d) => d.y)
  //       .attr("width", (d) => d.width)
  //       .attr("height", (d) => realHeight - d.y + padding.top);
  //   }
  //
  //   //添加矩形元素
  //   drawRect()
  // }

  change = e => {
    this.temp = e.target.value
  }

  focusInput = type => {
    if (!type) return;
    this.focus = type
    this.temp = this.renderNum(this[type])
  }

  blur = () => {
    const { focus, temp, min, max } = this;
    const { minX, maxX } = this.props
    if (!focus) return;
    if ((temp || temp === '0') && !isNaN(temp)) {
      let num = parseFloat(temp);
      if (focus === 'min') {
        if (num > max) num = max;
        if (num < minX) num = minX;
        if (min === num) return;
      } else {
        if (num < min) num = min;
        if (num > maxX) num = maxX;
        if (max === num) return;
      }
      this.temp = ''
      this.focus = ''
      this[focus] = num
    }
  }

  reset = () => {
    this.min = this.props.outlierRange[0]
    this.max = this.props.outlierRange[1]
  }

  apply = () => {
    const { min, max } = this
    this.props.saveEdit([min, max])
  }

  renderNum = num => {
    if (num && !isNaN(num)) {
      const n = Math.pow(10, this.count)
      return parseInt(num * n, 10) / n;
    }
    return 0;
  }

  render() {
    const { closeEdit } = this.props;
    const { min, max, temp, focus } = this;
    return <div className={styles.fixesContent}>
      <div className={styles.outlierBox}>
        <div className={styles.outlierBlock}>
          <div className={styles.outliertext}><span>{EN.Min}</span></div>
          <div className={styles.input}><input value={focus === 'min' ? temp : this.renderNum(min)} onChange={this.change} onFocus={this.focusInput.bind(null, 'min')} onBlur={this.blur} /></div>
        </div>
        <div className={styles.outlierBlock}>
          <div className={styles.outliertext}><span>{EN.Max}</span></div>
          <div className={styles.input}><input value={focus === 'max' ? temp : this.renderNum(max)} onChange={this.change} onFocus={this.focusInput.bind(null, 'max')} onBlur={this.blur} /></div>
        </div>
        <div className={styles.outlierBlock}><button onClick={this.reset}><span>{EN.Resettodefault}</span></button></div>
      </div>
      {/*<div className={styles.d3Chart}></div>*/}
      <div className={styles.fixesBottom}>
        <button className={styles.save} onClick={this.apply} ><span>{EN.Apply}</span></button>
        <button className={styles.cancel} onClick={closeEdit}><span>{EN.Cancel}</span></button>
      </div>
    </div>
  }
}
