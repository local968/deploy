import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Modal } from 'components/Common';
import { observable } from 'mobx'
import * as d3 from 'd3';
import { Icon } from 'antd'

@observer
export class ClassificationTarget extends Component {
  render() {
    const { backToConnect, backToSchema, editTarget, project } = this.props
    const { issues, targetColMap, target, targetMap, targetArray, colValueCounts, totalRawLines } = project
    const map = !targetArray.length ? targetColMap : targetArray.map((v, k) => {
      let n = 0
      Object.entries(targetMap).forEach(([key, value]) => {
        if (value === k) n += colValueCounts[target] ? (colValueCounts[target][key] || 0) : 0
      })
      return { [v]: n }
    }).reduce((start, item) => {
      return Object.assign(start, item)
    }, {})
    const isGood = Object.keys(map).length === 2
    if (isGood && (issues.rowIssue || issues.targetRowIssue)) return null
    const text = (isGood && 'Target variable quality is good!') || 'Your target variable has more than two unique values'
    return <div className={styles.block}>
      <div className={styles.name}>
        {isGood && <div className={styles.cleanHeaderIcon}><Icon type="check" style={{ color: '#fcfcfc', fontSize: '1.6rem' }} /></div>}
        <span>{text}</span>
      </div>
      <div className={styles.desc}>
        <div className={classnames(styles.info, {
          [styles.goodInfo]: isGood
        })}>
          <div className={styles.targetPercentBox}>
            {Object.keys(map).map((v, k) => {
              const percent = (colValueCounts[target][v] || 0) / (totalRawLines || 1) * 85
              const backgroundColor = (k === 0 && '#9be44b') || (k === 1 && '#adaafc') || '#c4cbd7'
              return <div className={styles.targetPercentRow} key={"targetPercentRow" + k}>
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
          {isGood && <div className={styles.cleanTargetBlock}>
            <div className={styles.cleanTargetRename}>
              <div className={styles.cleanTargetButton}>
                <button><span>Rename target variables</span></button>
              </div>
              <span>(optional)</span>
            </div>
          </div>}
        </div>
        {!isGood && <div className={styles.methods}>
          <div className={styles.reasonTitle}><span>Possible Reasons</span></div>
          <div className={styles.methodBox}>
            <div className={styles.method}>
              <div className={styles.reason}><span>It’s the wrong target variable</span></div>
              <div className={styles.button} onClick={backToSchema}>
                <button><span>Reselect target variable</span></button>
              </div>
            </div>
            <div className={styles.method}>
              <div className={styles.reason}><span>It’s general data quality issue</span></div>
              <div className={styles.button} onClick={backToConnect}>
                <button><span>Load a New Dataset</span></button>
              </div>
            </div>
            <div className={styles.method}>
              <div className={styles.reason}><span>The target variable has some noises</span></div>
              <div className={styles.button} onClick={editTarget}>
                <button><span>Fix it</span></button>
              </div>
            </div>
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
      <div className={styles.name}><span>Target Variable Unique Value</span></div>
      <div className={styles.desc}>
        <div className={styles.info}>
          <div className={styles.infoBox}>
            <div className={styles.infoBlock}>
              <div className={styles.num}><span>{unique}</span></div>
              <div className={styles.text}><span>Your Unique Value</span></div>
            </div>
            <div className={styles.infoBlock}>
              <div className={styles.num}><span>{recomm}</span></div>
              <div className={styles.text}><span>Recommended</span></div>
            </div>
          </div>
        </div>
        <div className={styles.methods}>
          <div className={styles.reasonTitle}><span>Possible Reasons</span></div>
          <div className={styles.methodBox}>
            <div className={styles.method}>
              <div className={styles.reason}><span>It’s the wrong target variable</span></div>
              <div className={styles.button} onClick={backToSchema}>
                <button><span>Reselect target variable</span></button>
              </div>
            </div>
            <div className={styles.method}>
              <div className={styles.reason}><span>It’s general data quality issue</span></div>
              <div className={styles.button} onClick={backToConnect}>
                <button><span>Load a New Dataset</span></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  }
}

@observer
export class RowIssue extends Component {
  render() {
    const { backToConnect, totalRawLines } = this.props;
    return <div className={styles.block}>
      <div className={styles.name}><span>Data Size is too small</span></div>
      <div className={styles.desc}>
        <div className={styles.info}>
          <div className={styles.progressBox}>
            <div className={styles.progressText}><span>All Data ({totalRawLines} rows)</span><span>1000 rows(minimum)</span></div>
            <div className={styles.progress} style={{ width: totalRawLines / 10 + "%" }}></div>
          </div>
        </div>
        <div className={styles.methods}>
          <div className={styles.methodBox}>
            <div className={styles.method}>
              <div className={styles.reason}><span>Data size >1000 rows is recommended</span></div>
              <div className={styles.button} onClick={backToConnect}>
                <button><span>Load a New Dataset</span></button>
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
    const { backToConnect, editFixes, targetIssues, totalLines, percent } = this.props;

    return <div className={styles.block}>
      <div className={styles.name}><span>Data issues are found</span></div>
      <div className={styles.desc}>
        <div className={styles.info}>
          <div className={styles.progressBox}>
            {!!targetIssues.nullRow.length && <div className={styles.issueBlock}>
              <div className={styles.left}>
                <div className={styles.issueRow}><span>Missing Value ({targetIssues.nullRow.length} rows) {percent.missing.toFixed(4)}%</span></div>
                <div className={classnames(styles.progress, styles.missing)} style={{ width: percent.missing < 1 ? 1 : percent.missing + "%" }}></div>
              </div>
              <div className={styles.right}>
                <span>Will be fixed</span>
              </div>
            </div>}
            {!!targetIssues.mismatchRow.length && <div className={styles.issueBlock}>
              <div className={styles.left}>
                <div className={styles.issueRow}><span>Data Type Mismatch ({targetIssues.mismatchRow.length} rows) {percent.mismatch.toFixed(4)}%</span></div>
                <div className={classnames(styles.progress, styles.mismatch)} style={{ width: percent.mismatch < 1 ? 1 : percent.mismatch + "%" }}></div>
              </div>
              <div className={styles.right}>
                <span>Will be fixed</span>
              </div>
            </div>}
            {!!targetIssues.outlierRow.length && <div className={styles.issueBlock}>
              <div className={styles.left}>
                <div className={styles.issueRow}><span>Outlier ({targetIssues.outlierRow.length} rows) {percent.outlier.toFixed(4)}%</span></div>
                <div className={classnames(styles.progress, styles.outlier)} style={{ width: percent.outlier < 1 ? 1 : percent.outlier + "%" }}></div>
              </div>
              <div className={styles.right}>
                <span>Will be ignore</span>
              </div>
            </div>}
          </div>
          {totalLines < 1000 && <div className={styles.progressBox}>
            <div className={styles.progressText}><span>Clean Data ({totalLines} rows)</span><span>1000 rows(minimum)</span></div>
            <div className={styles.progress} style={{ width: totalLines / 10 + "%" }}></div>
          </div>}
        </div>

        <div className={styles.methods}>
          <div className={styles.methodBox}>
            <div className={styles.method}>
              <div className={styles.reason}><span>R2 Learn will fix these issues automatically</span></div>
              <div className={styles.button} onClick={editFixes}>
                <button><span>Edit the Fixes</span></button>
              </div>
            </div>
            {totalLines < 1000 && <div className={styles.method}>
              <div className={styles.reason}><span>Data size will be smaller than the minimum size after delete</span></div>
              <div className={styles.button} onClick={backToConnect}>
                <button><span>Load a New Dataset</span></button>
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
    const { colValueCounts, target } = this.props.project;
    const [v0, v1] = checked
    const totalOf0 = [v0, ...belongTo0].reduce((start, v) => start += ((colValueCounts[target] || {})[v]) || 0, 0)
    const totalOf1 = [v1, ...belongTo1].reduce((start, v) => start += ((colValueCounts[target] || {})[v]) || 0, 0)
    const maxKey = totalOf0 >= totalOf1 ? 0 : 1
    let targetMap = {
      [checked[maxKey]]: 0,
      [checked[1 - maxKey]]: 1
    }
    this[`belongTo${maxKey}`].forEach(v0 => targetMap[v0] = 0)
    this[`belongTo${1 - maxKey}`].forEach(v1 => targetMap[v1] = 1)
    this.props.project.targetArrayTemp = [checked[maxKey], checked[1 - maxKey]];
    this.props.project.targetMapTemp = targetMap;
    this.props.saveTargetFixes()
  }

  handleCheck = (key, e) => {
    const value = e.target.value
    const checked = e.target.checked
    const field = `belongTo${key}`
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

    const { targetColMap, target, colValueCounts, totalRawLines } = project
    const { checked, belongTo0, belongTo1 } = this
    const [v0, v1] = checked
    const percent0 = (v0 ? colValueCounts[target][v0] || 0 : 0) / (totalRawLines || 1) * 85
    const percent1 = (v1 ? colValueCounts[target][v1] || 0 : 0) / (totalRawLines || 1) * 85

    return <div className={styles.fixesContent}>
      {this.step === 1 && <div className={styles.fixesBox}>
        <div className={styles.fixesText}><span>Please select two valid values from all unique values in your target variable</span></div>
        <div className={styles.fixesCheckBox}>
          <div className={styles.targetPercentBox}>
            {Object.keys(targetColMap).map((v, k) => {
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
        </div>
      </div>}
      {this.step === 2 && <div className={styles.fixesBox}>
        <div className={styles.fixesText}><span>Select all values that belong to value1 </span></div>
        <div className={styles.targetPercentBox}>
          <div className={styles.targetPercentRow}>
            <div className={styles.targetPercentLabel}>
              <span>{checked[0]}</span>
            </div>
            <div className={styles.targetPercentValue}>
              <div className={styles.targetPercent} style={{ width: percent0 + '%', backgroundColor: '#9be44b' }}></div>
              <span>{colValueCounts[target][v0] || 0}</span>
            </div>
          </div>
          <div className={styles.fixesCheckBox}>
            {Object.keys(targetColMap).filter(v => !checked.includes(v)).map((t, i) => {
              const disabled = belongTo1.includes(t)
              return <div className={styles.fixesCheck} key={i}>
                <input type='checkbox' value={t} id={`belongTo0${t}`} checked={belongTo0.includes(t)} disabled={disabled} onChange={this.handleCheck.bind(null, 0)} />
                <label className={classnames(styles.fixesCheckBoxLabel, {
                  [styles.disabledText]: disabled
                })} htmlFor={`belongTo0${t}`}>{t}</label>
              </div>
            })}
          </div>
          <div className={styles.fixesTips}></div>
        </div>
      </div>}
      {this.step === 3 && <div className={styles.fixesBox}>
        <div className={styles.fixesText}><span>Select all values that belong to value2 </span></div>
        <div className={styles.targetPercentBox}>
          <div className={styles.targetPercentRow}>
            <div className={styles.targetPercentLabel}>
              <span>{this.checked[1]}</span>
            </div>
            <div className={styles.targetPercentValue}>
              <div className={styles.targetPercent} style={{ width: percent1 + '%', backgroundColor: '#adaafc' }}></div>
              <span>{colValueCounts[target][v1] || 0}</span>
            </div>
          </div>
          <div className={styles.fixesCheckBox}>
            {Object.keys(targetColMap).filter(v => !checked.includes(v)).map((t, i) => {
              const disabled = belongTo0.includes(t)
              return <div className={styles.fixesCheck} key={i}>
                <input type='checkbox' value={t} id={`belongTo1${t}`} checked={belongTo1.includes(t)} disabled={disabled} onChange={this.handleCheck.bind(null, 1)} />
                <label className={classnames(styles.fixesCheckBoxLabel, {
                  [styles.disabledText]: disabled
                })} htmlFor={`belongTo1${t}`}>{t}</label>
              </div>
            })}
          </div>
        </div>
        <div className={styles.fixesTips}><span>The rest values will be deleted by default</span></div>
      </div>}
      {this.step === 4 && <div className={styles.fixesBox}>
        <div className={classnames(styles.fixesIconBox, styles.center)}>
          <div className={classnames(styles.cleanHeaderIcon, styles.largeIcon)}><Icon type="check" style={{ color: '#fcfcfc', fontSize: '2.4rem' }} /></div>
        </div>
        <div className={classnames(styles.fixesText, styles.center)}><span>Thank you for fixing data issues.</span></div>
        <div className={styles.fixesCheckBox}>
          <div className={styles.fixesTextBottom}>
            <div className={styles.fixesComplete}>
              <span>The changes will not show up until they are applied an training section.</span>
            </div>
          </div>
        </div>
      </div>}
      <div className={styles.fixesBottom}>
        <button className={styles.cancel} onClick={this.step > 1 ? this.backStep : closeTarget}><span>{this.step > 1 ? 'Back' : 'Cancel'}</span></button>
        <button className={classnames(styles.save, {
          [styles.disabled]: !this.canSave
        })} onClick={this.step < 4 ? this.nextStep : this.save} disabled={!this.canSave} ><span>{this.step < 4 ? 'Next' : "Done"}</span></button>
      </div>
    </div>
  }
}

@observer
export class FixIssue extends Component {
  @observable editKey = ''
  @observable visible = false

  editRange = (key) => {
    this.visible = true
    this.editKey = key
  }

  closeEdit = () => {
    this.visible = false
    this.editKey = ''
  }

  saveEdit = (data) => {
    const { editKey } = this;
    this.props.project.outlierDict[editKey] = data;
    this.visible = false
    this.editKey = ''
  }

  nullSelect = (key, e) => {
    let value = e.target.value
    this.props.project.nullFillMethod[key] = value;
  }

  mismatchSelect = (key, e) => {
    let value = e.target.value
    this.props.project.mismatchFillMethod[key] = value;
  }

  outlierSelect = (key, e) => {
    let value = e.target.value
    this.props.project.outlierFillMethod[key] = value;
  }

  render() {
    const { closeFixes, project, saveDataFixes, mismatchIndex, nullIndex, outlierIndex } = this.props;
    const { issueRows, colType, mismatchFillMethod, nullFillMethod, outlierFillMethod, totalRawLines, dataViews, outlierRange, outlierDict } = project
    return <div className={styles.fixesContent}>
      {!!issueRows.mismatchRow.length && <div className={styles.fixesArea}>
        <div className={styles.typeBox}>
          <div className={styles.type}>
            <div className={classnames(styles.typeBlock, styles.mismatch)}></div>
            <span>Data Type Mismatch</span>
          </div>
        </div>
        <div className={styles.fixesTable}>
          <div className={classnames(styles.fixesRow, styles.fixesHeader)}>
            <div className={classnames(styles.fixesTd, styles.fixesLarge)}><span>Variable Name</span></div>
            <div className={styles.fixesTd}><span>Data Type</span></div>
            <div className={styles.fixesTd}><span>Quantity of Mismatch</span></div>
            <div className={styles.fixesTd}><span>Mean</span></div>
            <div className={styles.fixesTd}><span>Median</span></div>
            <div className={styles.fixesTd}><span>Most Frequent Value</span></div>
            <div className={classnames(styles.fixesTd, styles.fixesLarge)}><span>Fix</span></div>
          </div>
          <div className={styles.fixesBody}>
            {Object.keys(mismatchIndex).map((k, i) => {
              const num = mismatchIndex[k].length
              if (!num) {
                return null;
              }
              const rowText = num + ' (' + (num / (totalRawLines || 1)).toFixed(4) + '%)'
              return <div className={styles.fixesRow} key={i}>
                <div className={classnames(styles.fixesCell, styles.fixesLarge)}><span>{k}</span></div>
                <div className={styles.fixesCell}><span>{colType[k]}</span></div>
                <div className={styles.fixesCell}><span title={rowText}>{rowText}</span></div>
                <div className={styles.fixesCell}><span title={dataViews[k].mean}>{dataViews[k].mean}</span></div>
                <div className={styles.fixesCell}><span title={dataViews[k].median}>{dataViews[k].median}</span></div>
                <div className={styles.fixesCell}><span title={dataViews[k].mode}>{dataViews[k].mode}</span></div>
                <div className={classnames(styles.fixesCell, styles.fixesLarge)}><select value={mismatchFillMethod[k]} onChange={this.mismatchSelect.bind(null, k)}>
                  {colType[k] === 'Categorical' ? [
                    <option value={dataViews[k].mode} key="mode">Replace with most frequent value</option>,
                    <option value="drop" key="drop">Delete the row</option>,
                    <option value={0} key={0}>Replace with 0</option>
                  ] : [
                      <option value={dataViews[k].mean} key='mean'>Replace with mean value</option>,
                      <option value="drop" key='drop'>Delete the row</option>,
                      <option value={dataViews[k].min} key='min'>Replace with min value</option>,
                      <option value={dataViews[k].max} key='max'>Replace with max value</option>,
                      <option value={dataViews[k].mode} key='mode'>Replace with most frequent value</option>,
                      <option value={dataViews[k].median} key='median'>Replace with median value</option>,
                      <option value={0} key={0}>Replace with 0</option>
                    ]}
                </select></div>
              </div>
            })}
          </div>
        </div>
      </div>}
      {!!issueRows.nullRow.length && <div className={styles.fixesArea}>
        <div className={styles.typeBox}>
          <div className={styles.type}>
            <div className={classnames(styles.typeBlock, styles.missing)}></div>
            <span>Missing Value</span>
          </div>
        </div>
        <div className={styles.fixesTable}>
          <div className={classnames(styles.fixesRow, styles.fixesHeader)}>
            <div className={styles.fixesTd}><span>Variable Name</span></div>
            <div className={styles.fixesTd}><span>Missing Reason</span></div>
            <div className={styles.fixesTd}><span>Data Type</span></div>
            <div className={styles.fixesTd}><span>Quantity of Missing Value</span></div>
            <div className={styles.fixesTd}><span>Mean</span></div>
            <div className={styles.fixesTd}><span>Median</span></div>
            <div className={styles.fixesTd}><span>Most Frequent Value</span></div>
            <div className={classnames(styles.fixesTd, styles.fixesLarge)}><span>Fix</span></div>
          </div>
          <div className={styles.fixesBody}>
            {Object.keys(nullIndex).map((k, i) => {
              const num = nullIndex[k].length
              if (!num) {
                return null;
              }
              const rowText = num + ' (' + (num / (totalRawLines || 1)).toFixed(4) + '%)'
              // const rowText = `${num} ${nullFillMethod.hasOwnProperty(k) ? ' row' + (num === 1 ? '' : "s") + ' will be ' + (nullFillMethod[k] === "drop" ? "delete" : "fixed") : '(' + (num / (totalRawLines || 1)).toFixed(4) + '%)'}`
              return <div className={styles.fixesRow} key={i}>
                <div className={styles.fixesCell}><span>{k}</span></div>
                <div className={styles.fixesCell}><span>I don`t know</span></div>
                <div className={styles.fixesCell}><span>{colType[k]}</span></div>
                <div className={styles.fixesCell}><span title={rowText}>{rowText}</span></div>
                <div className={styles.fixesCell}><span title={dataViews[k].mean}>{dataViews[k].mean}</span></div>
                <div className={styles.fixesCell}><span title={dataViews[k].median}>{dataViews[k].median}</span></div>
                <div className={styles.fixesCell}><span title={dataViews[k].mode}>{dataViews[k].mode}</span></div>
                <div className={classnames(styles.fixesCell, styles.fixesLarge)}><select value={nullFillMethod[k]} onChange={this.nullSelect.bind(null, k)}>
                  {colType[k] === 'Categorical' ? [
                    <option value={dataViews[k].mode} key="mode">Replace with most frequent value</option>,
                    <option value="drop" key="drop">Delete the row</option>,
                    <option value={0} key={0}>Replace with 0</option>
                  ] : [
                      <option value={dataViews[k].mean} key='mean'>Replace with mean value</option>,
                      <option value="drop" key='drop'>Delete the row</option>,
                      <option value={dataViews[k].min} key='min'>Replace with min value</option>,
                      <option value={dataViews[k].max} key='max'>Replace with max value</option>,
                      <option value={dataViews[k].mode} key='mode'>Replace with most frequent value</option>,
                      <option value={dataViews[k].median} key='median'>Replace with median value</option>,
                      <option value={0} key={0}>Replace with 0</option>
                    ]}
                </select></div>
              </div>
            })}
          </div>
        </div>
      </div>}
      {!!issueRows.outlierRow.length && <div className={styles.fixesArea}>
        <div className={styles.typeBox}>
          <div className={styles.type}>
            <div className={classnames(styles.typeBlock, styles.outlier)}></div>
            <span>Outlier</span>
          </div>
        </div>
        <div className={styles.fixesTable}>
          <div className={classnames(styles.fixesRow, styles.fixesHeader)}>
            <div className={styles.fixesTd}><span>Variable Name</span></div>
            <div className={styles.fixesTd}><span>Valid Range</span></div>
            <div className={styles.fixesTd}><span>Data Type</span></div>
            <div className={styles.fixesTd}><span>Quantity of Outlier</span></div>
            <div className={styles.fixesTd}><span>Mean</span></div>
            <div className={styles.fixesTd}><span>Median</span></div>
            <div className={classnames(styles.fixesTd, styles.fixesLarge)}><span>Fix</span></div>
          </div>
          <div className={styles.fixesBody}>
            {Object.keys(outlierIndex).map((k, i) => {
              const num = outlierIndex[k].length
              if (!num) {
                return null;
              }
              const outlier = outlierDict[k] && outlierDict[k].length === 2 ? outlierDict[k] : outlierRange[k];
              const isShow = colType[k] === 'Numerical';
              const rowText = num + ' (' + (num / (totalRawLines || 1)).toFixed(4) + '%)'
              // const rowText = `${num} ${outlierFillMethod.hasOwnProperty(k) ? ' row' + (num === 1 ? '' : "s") + ' will be ' + (outlierFillMethod[k] === "drop" ? "delete" : "fixed") : '(' + (num / (totalRawLines || 1)).toFixed(4) + '%)'}`
              return isShow && <div className={styles.fixesRow} key={i}>
                <div className={styles.fixesCell}><span>{k}</span></div>
                <div className={classnames(styles.fixesCell, styles.fixesBwtween)}>
                  <span title={outlier[0].toFixed(2) + "-" + outlier[1].toFixed(2)}>
                    {outlier[0].toFixed(2) + "-" + outlier[1].toFixed(2)}
                  </span><span className={styles.fixesEdit} onClick={this.editRange.bind(null, k)}>edit</span>
                </div>
                <div className={styles.fixesCell}><span>{colType[k]}</span></div>
                <div className={styles.fixesCell}><span title={rowText}>{rowText}</span></div>
                <div className={styles.fixesCell}><span title={dataViews[k].mean} >{dataViews[k].mean}</span></div>
                <div className={styles.fixesCell}><span title={dataViews[k].median}>{dataViews[k].median}</span></div>
                <div className={classnames(styles.fixesCell, styles.fixesLarge)}><select value={outlierFillMethod[k]} onChange={this.outlierSelect.bind(null, k)}>
                  <option value="drop" key='drop'>Delete the row</option>
                  <option value="ignore" key='ignore'>Do Nothing</option>
                  <option value={dataViews[k].mean} key='mean'>Replace with mean value</option>
                  <option value={dataViews[k].median} key='median'>Replace with median value</option>
                  <option value={dataViews[k].mode} key='mode'>Replace with most frequent value</option>
                  <option value={0} key='0'>Replace with 0</option>
                </select></div>
              </div>
            })}
          </div>
        </div>
      </div>}
      <div className={styles.fixesBottom}>
        <button className={styles.save} onClick={saveDataFixes} ><span>save</span></button>
        <button className={styles.cancel} onClick={closeFixes}><span>cancel</span></button>
      </div>
      {this.editKey && <Modal content={<EditOutLier width={800}
        height={400} saveEdit={this.saveEdit}
        closeEdit={this.closeEdit}
        outlierRange={project.outlierRange[this.editKey]}
        outlierDict={project.outlierDict[this.editKey]}
        x={project.numberBins[this.editKey][1]}
        y={project.numberBins[this.editKey][0]} />}
        visible={this.visible}
        width='12em'
        title='Outlier'
        onClose={this.closeEdit}
        closeByMask={true}
        showClose={true}
      />}
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
    const { x } = props
    const minX = x[0];
    const maxX = x[x.length - 1];
    const offset = (maxX - minX) / 4;
    this.minX = minX - offset;
    this.maxX = maxX + offset;
    this.count = 4;
  }

  componentDidMount() {
    this.d3Chart()
  }

  componentDidUpdate() {
    this.d3Chart()
  }

  d3Chart = () => {
    d3.select(`.${styles.d3Chart} svg`).remove();
    const { width, height, x, y } = this.props;
    let { min, max, minX, maxX } = this;
    const padding = { left: 50, bottom: 30, right: 5, top: 100 };

    const realHeight = height - padding.bottom - padding.top;
    const realWidth = width - padding.left - padding.right;
    //添加一个 SVG 画布
    const svg = d3.select(`.${styles.d3Chart}`)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr('transform', `translate(${padding.left}, 0)`);

    const maxH = d3.max(y) || 1;
    const dataset = [];

    //x轴的比例尺
    const xScale = d3.scaleLinear()
      .domain([minX, maxX])
      .range([0, realWidth])
      .clamp(true);

    //y轴的比例尺
    const yScale = d3.scaleLinear()
      .domain([0, maxH])
      .range([realHeight, 0])
      .clamp(true);

    //定义x轴
    const xAxis = d3.axisBottom(xScale);

    //定义y轴
    const yAxis = d3.axisLeft(yScale);

    //添加x轴
    svg.append("g")
      .attr("class", `${styles.axis}`)
      .attr("transform", `translate(0, ${realHeight + padding.top})`)
      .call(xAxis);

    //添加y轴
    svg.append("g")
      .attr("class", `${styles.axis}`)
      .attr("transform", `translate(0, ${padding.top})`)
      .call(yAxis);

    const drawDrag = () => {
      const minDrag = d3.drag()
        .on('drag', () => {
          let minTemp = xScale.invert(d3.event.x)
          if (minTemp > max) minTemp = max;
          if (minTemp < minX) minTemp = minX;
          if (minTemp === min) return;
          min = minTemp;
          minRect.attr('width', xScale(min))
          minLine.attr('x1', xScale(min))
            .attr('x2', xScale(min))
          minCircle.attr('cx', xScale(min))
          minText.attr('x', xScale(min))
            .text(this.renderNum(min))
          if (Math.abs(xScale(max) - xScale(min)) < 40) {
            maxCircle.attr('cy', padding.top - 57)
            maxText.attr('y', padding.top - 53)
          } else {
            maxCircle.attr('cy', padding.top - 17)
            maxText.attr('y', padding.top - 13)
          }

          drawRect()
        })
        .on('end', () => {
          this.min = min
        });

      let minDragBlock = svg.append('g');
      let minRect = minDragBlock.append('rect')
        .attr('class', `${styles.dragRect}`)
        .attr('x', xScale(minX))
        .attr('y', yScale(maxH) + padding.top)
        .attr('width', xScale(min) - xScale(minX))
        .attr('height', realHeight)

      let minLine = minDragBlock.append('line')
        .attr('class', `${styles.dragLine}`)
        .attr('x1', xScale(min) - xScale(minX))
        .attr('y1', yScale(maxH) + padding.top)
        .attr('x2', xScale(min) - xScale(minX))
        .attr('y2', realHeight + padding.top)

      let minCircle = minDragBlock.append('circle')
        .attr('class', `${styles.dragCircle}`)
        .attr('cx', xScale(min))
        .attr('cy', padding.top - 17)
        .attr('r', 20)
        .attr('fill', '#c7f1ee')
        .call(minDrag);

      let minText = minDragBlock.append('text')
        .attr('class', `${styles.dragText}`)
        .text(this.renderNum(min))
        .attr('x', xScale(min))
        .attr('y', padding.top - 13)
        .call(minDrag);

      const maxDrag = d3.drag()
        .on('drag', () => {
          let maxTemp = xScale.invert(d3.event.x)
          if (maxTemp < min) maxTemp = min;
          if (maxTemp > maxX) maxTemp = maxX;
          if (maxTemp === max) return;
          max = maxTemp;
          maxRect.attr('x', xScale(max))
            .attr('width', xScale(maxX) - xScale(max))
          maxLine.attr('x1', xScale(max))
            .attr('x2', xScale(max))
          maxCircle.attr('cx', xScale(max))
          maxText.attr('x', xScale(max))
            .text(this.renderNum(max))
          if (Math.abs(xScale(max) - xScale(min)) < 40) {
            maxCircle.attr('cy', padding.top - 57)
            maxText.attr('y', padding.top - 53)
          } else {
            maxCircle.attr('cy', padding.top - 17)
            maxText.attr('y', padding.top - 13)
          }
          drawRect()
        })
        .on('end', () => {
          this.max = max
        });

      let maxDragBlock = svg.append('g');
      let maxRect = maxDragBlock.append('rect')
        .attr('class', `${styles.dragRect}`)
        .attr('x', xScale(max))
        .attr('y', yScale(maxH) + padding.top)
        .attr('width', xScale(maxX) - xScale(max))
        .attr('height', realHeight)

      let maxLine = maxDragBlock.append('line')
        .attr('class', `${styles.dragLine}`)
        .attr('x1', xScale(max))
        .attr('y1', yScale(maxH) + padding.top)
        .attr('x2', xScale(max))
        .attr('y2', realHeight + padding.top);

      let maxCircle = maxDragBlock.append('circle')
        .attr('class', `${styles.dragCircle}`)
        .attr('cx', xScale(max))
        .attr('cy', () => {
          if (Math.abs(xScale(max) - xScale(min)) < 40) {
            return padding.top - 57
          }
          return padding.top - 17
        })
        .attr('r', 20)
        .attr('fill', '#ffd287')
        .call(maxDrag);

      let maxText = maxDragBlock.append('text')
        .attr('class', `${styles.dragText}`)
        .text(this.renderNum(max))
        .attr('x', xScale(max))
        .attr('y', () => {
          if (Math.abs(xScale(max) - xScale(min)) < 40) {
            return padding.top - 53
          }
          return padding.top - 13
        })
        .call(maxDrag);

    }

    //初始化拖动
    drawDrag()

    //添加矩形元素
    const drawRect = () => {
      // 处理dataset数据
      for (let i = 1; i < x.length; i++) {
        if (x[i] <= min || x[i - 1] >= max) {
          dataset.push({
            x: xScale(x[i - 1]),
            y: yScale(y[i - 1]) + padding.top,
            width: Math.abs(xScale(x[i]) - xScale(x[i - 1])),
            class: styles.outer
          })
        } else if (x[i] <= max && x[i - 1] >= min) {
          dataset.push({
            x: xScale(x[i - 1]),
            y: yScale(y[i - 1]) + padding.top,
            width: Math.abs(xScale(x[i]) - xScale(x[i - 1])),
            class: styles.rect
          })
        } else if (x[i] > max && x[i - 1] < max && x[i - 1] > min) {
          const left = Math.abs(xScale(x[i - 1]) - xScale(max))
          dataset.push({
            x: xScale(x[i - 1]),
            y: yScale(y[i - 1]) + padding.top,
            width: left,
            class: styles.rect
          })
          dataset.push({
            x: xScale(x[i - 1]) + left,
            y: yScale(y[i - 1]) + padding.top,
            width: Math.abs(xScale(x[i]) - xScale(x[i - 1])) - left,
            class: styles.outer
          })
        } else if (x[i] > min && x[i - 1] < min && x[i] < max) {
          const left = Math.abs(xScale(x[i - 1]) - xScale(min))
          dataset.push({
            x: xScale(x[i - 1]),
            y: yScale(y[i - 1]) + padding.top,
            width: left,
            class: styles.outer
          })
          dataset.push({
            x: xScale(x[i - 1]) + left,
            y: yScale(y[i - 1]) + padding.top,
            width: Math.abs(xScale(x[i]) - xScale(x[i - 1])) - left,
            class: styles.rect
          })
        } else {
          if (min > max) {
            dataset.push({
              x: xScale(x[i - 1]),
              y: yScale(y[i - 1]) + padding.top,
              width: Math.abs(xScale(x[i]) - xScale(x[i - 1])),
              class: styles.outer
            })
          } else {
            const left = Math.abs(xScale(x[i - 1]) - xScale(min))
            const middle = Math.abs(xScale(max) - xScale(min))
            dataset.push({
              x: xScale(x[i - 1]),
              y: yScale(y[i - 1]) + padding.top,
              width: left,
              class: styles.outer
            })
            dataset.push({
              x: xScale(x[i - 1]) + left,
              y: yScale(y[i - 1]) + padding.top,
              width: middle,
              class: styles.rect
            })
            dataset.push({
              x: xScale(x[i - 1]) + left + middle,
              y: yScale(y[i - 1]) + padding.top,
              width: Math.abs(xScale(x[i]) - xScale(x[i - 1])) - left - middle,
              class: styles.outer
            })
          }
        }
      }

      const rects = svg.selectAll(`.${styles.rect}`);
      rects.remove();
      rects.data(dataset)
        .enter()
        .append("rect")
        .attr("class", (d) => d.class)
        // .attr("transform",`translate(0,${padding.top})`)
        .attr("x", (d) => d.x)
        .attr("y", (d) => d.y)
        .attr("width", (d) => d.width)
        .attr("height", (d) => realHeight - d.y + padding.top);
    }

    //添加矩形元素
    drawRect()
  }

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
    if (!focus) return;
    if ((temp || temp === '0') && !isNaN(temp)) {
      let num = parseFloat(temp);
      if (focus === 'min') {
        if (num > max) num = max;
        if (num < this.minX) num = this.minX;
        if (min === num) return;
      } else {
        if (num < min) num = min;
        if (num > this.maxX) num = this.maxX;
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
          <div className={styles.outliertext}><span>min</span></div>
          <div className={styles.input}><input value={focus === 'min' ? temp : this.renderNum(min)} onChange={this.change} onFocus={this.focusInput.bind(null, 'min')} onBlur={this.blur} /></div>
        </div>
        <div className={styles.outlierBlock}>
          <div className={styles.outliertext}><span>max</span></div>
          <div className={styles.input}><input value={focus === 'max' ? temp : this.renderNum(max)} onChange={this.change} onFocus={this.focusInput.bind(null, 'max')} onBlur={this.blur} /></div>
        </div>
        <div className={styles.outlierBlock}><button onClick={this.reset}><span>Reset to default</span></button></div>
      </div>
      <div className={styles.d3Chart}></div>
      <div className={styles.fixesBottom}>
        <button className={styles.save} onClick={this.apply} ><span>Apply</span></button>
        <button className={styles.cancel} onClick={closeEdit}><span>cancel</span></button>
      </div>
    </div>
  }
}