import React, { Component } from 'react';
import styles from '../styles.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Modal, NumberInput } from 'components/Common';
import { observable } from 'mobx'
// import * as d3 from 'd3';
import { Icon, message, Select } from 'antd'
import { formatNumber } from '../../../../util'
import EN from '../../../../constant/en';
import OutlierRange from "../../../Charts/OutlierRange";
import Project from 'stores/Project';
const Option = Select.Option

interface FixIssueProps {
  saveDataFixes: () => void,
  closeFixes: () => void,
  project: Project,
  isTarget: boolean,
  nullCount: number,
  mismatchCount: number,
  outlierCount: number
}

class FixIssue extends Component<FixIssueProps> {
  @observable editKey = ''
  @observable visible = false
  @observable progress = 0
  @observable fillMethod = { missing: {}, mismatch: {}, outlier: {} };
  @observable checked = { null: [], mismatch: [], outlier: [] }
  // @observable outLier = {};

  editRange(key) {
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
  }

  mismatchSelect = (key, e) => {
    let value = e.target.value
    value = isNaN(+(value)) ? value : parseFloat(value)
    const { mismatch } = this.fillMethod
    mismatch[key] = value === 'others' ? '' : value
    this.fillMethod.mismatch = { ...mismatch }
  }

  outlierSelect = (key, e) => {
    let value = e.target.value
    value = isNaN(+(value)) ? value : parseFloat(value)
    const { outlier } = this.fillMethod
    outlier[key] = value === 'others' ? '' : value
    this.fillMethod.outlier = { ...outlier }
  }

  save = () => {
    const { project } = this.props
    const realFillMethod: { missing?: { [key: string]: string }, mismatch?: { [key: string]: string }, outlier?: { [key: string]: string } } = {}
    const deleteColumns: Set<string> = new Set<string>()
    Object.keys(this.fillMethod).forEach(k => {
      realFillMethod[k] = {}
      Object.keys(this.fillMethod[k]).forEach(field => {
        const value = this.fillMethod[k][field]
        if (value === 'column') deleteColumns.add(field)
        if (value === 0 || !!value) realFillMethod[k][field] = value
      })
    })
    project.deleteColumns = [...deleteColumns]
    project.nullFillMethodTemp = { ...project.nullFillMethodTemp, ...realFillMethod.missing }
    project.mismatchFillMethodTemp = { ...project.mismatchFillMethodTemp, ...realFillMethod.mismatch }
    project.outlierFillMethodTemp = { ...project.outlierFillMethodTemp, ...realFillMethod.outlier }
    this.props.saveDataFixes()
  }

  formatCell = num => {
    if (typeof num === "number") return formatNumber(num.toString(), 2, true)
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

  handleCheckAll = (type) => (e) => {
    const checked = e.target.checked
    if (!checked) return this.checked = { ...this.checked, [type]: [] }
    const { project, isTarget } = this.props
    const { target, targetIssuesCountsOrigin, variableIssues } = project
    const dataRow = isTarget ? { [target]: targetIssuesCountsOrigin[`${type}Row`] } : variableIssues[`${type}Row`]
    this.checked = { ...this.checked, [type]: Object.keys(dataRow) }
  }

  handleCheck = (type, field) => (e) => {
    const checked = e.target.checked
    let arr = this.checked[type]
    if (!checked && arr.includes(field)) arr = arr.filter(h => h !== field)
    if (checked && !arr.includes(field)) arr.push(field)
    this.checked = { ...this.checked, [type]: arr }
  }

  handleReset = (type) => () => {
    const { project, isTarget } = this.props
    const { target, targetIssuesCountsOrigin, variableIssues, colType } = project
    const dataRow = isTarget ? { [target]: targetIssuesCountsOrigin[`${type}Row`] } : variableIssues[`${type}Row`]
    Object.keys(dataRow).forEach(k => {
      if (type === 'null') {
        const isNum = colType[k] === 'Numerical'
        this.fillMethod.missing[k] = isNum ? 'mean' : 'mode'
      } else {
        this.fillMethod[type][k] = type === 'mismatch' ? 'mean' : 'drop'
      }
    })
  }

  handleSelect = (type, isNum = true) => (value) => {
    const { project } = this.props
    const { colType } = project
    if (type === 'null') {
      this.checked.null
        .filter(k => isNum ? colType[k] === 'Numerical' : colType[k] !== 'Numerical')
        .forEach(k => {
          this.fillMethod.missing = { ...this.fillMethod.missing, [k]: value }
        })
    } else {
      this.checked[type].forEach(k => {
        this.fillMethod[type] = { ...this.fillMethod[type], [k]: value }
      })
    }
  }

  render() {
    const { closeFixes, project, isTarget, nullCount, mismatchCount, outlierCount } = this.props;
    const { mapHeader, colType, mismatchFillMethodTemp, nullFillMethodTemp, outlierFillMethodTemp, totalRawLines, rawDataView, outlierDictTemp, target, missingReasonTemp, dataHeader, deleteColumns, variableIssues, targetIssuesCountsOrigin } = project
    const mismatchRow = isTarget ? { [target]: targetIssuesCountsOrigin.mismatchRow } : variableIssues.mismatchRow
    const nullRow = isTarget ? { [target]: targetIssuesCountsOrigin.nullRow } : variableIssues.nullRow
    const outlierRow = isTarget ? { [target]: targetIssuesCountsOrigin.outlierRow } : variableIssues.outlierRow
    const variables = [...dataHeader, ...deleteColumns]

    const strArray = [{
      value: 'mode',
      label: EN.Replacewithmostfrequentvalue
    }, {
      value: 'drop',
      label: EN.Deletetherows
    }, {
      value: 'column',
      label: EN.Deletethecolumn
    }, {
      value: 'ignore',
      label: EN.Replacewithauniquevalue
    }]

    const numArray = [{
      value: 'mean',
      label: EN.Replacewithmeanvalue
    }, {
      value: 'drop',
      label: EN.Deletetherows
    }, {
      value: 'column',
      label: EN.Deletethecolumn
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

    const outArray = [{
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
      value: 'respective',
      label: EN.ReplaceRespective
    }, {
      value: 'others',
      label: EN.Replacewithothers
    }]

    return <div className={styles.fixesContent}>
      <div className={styles.fixesBlock}>
        {!!mismatchCount && <div className={styles.fixesArea}>
          <div className={styles.typeBox}>
            <div className={styles.type}>
              <div className={classnames(styles.typeBlock, styles.mismatch)} />
              <span>{EN.DataTypeMismatch}</span>
            </div>
            {Object.keys(mismatchRow).length > 1 && <div className={styles.batch}>
              <Select placeholder={EN.BatchFix} value={undefined} onSelect={this.handleSelect('mismatch')} className={styles.batchSelect} >
                {numArray.map(item => {
                  if (isTarget && item.value === 'column') return null
                  return <Option value={item.value} key={item.value}>{item.label}</Option>
                })}
              </Select>
            </div>}
          </div>
          <div className={styles.fixesTable}>
            <div className={classnames(styles.fixesRow, styles.fixesHeader)}>
              {Object.keys(mismatchRow).length > 1 && <div className={styles.fixedCheck}><input type="checkbox" defaultChecked={false} onChange={this.handleCheckAll('mismatch')} /></div>}
              <div className={classnames(styles.fixesTd, styles.fixesLarge)}><span>{EN.VariableName}</span></div>
              <div className={styles.fixesTd}><span>{EN.DataType}</span></div>
              <div className={styles.fixesTd}><span>{EN.QuantityofMismatch}</span></div>
              <div className={styles.fixesTd}><span>{EN.Mean}</span></div>
              <div className={styles.fixesTd}><span>{EN.Median}</span></div>
              <div className={styles.fixesTd}><span>{EN.MostFrequentValue}</span></div>
              <div className={classnames(styles.fixesTd, styles.fixesLarge)}>
                <span>{EN.Fix}</span>
                <span className={styles.reset} onClick={this.handleReset('mismatch')}>{EN.Reset}</span>
              </div>
            </div>
            <div className={styles.fixesBody}>
              {Object.keys(mismatchRow).map((k, i) => {
                const originNum = mismatchRow[k]
                if (!originNum) return null
                const num = mismatchRow[k] || 0
                const showType = colType[k] === 'Numerical' ? 'Numerical' : 'Categorical'
                if (showType !== 'Numerical') return null
                const percnet = num / (totalRawLines || 1) * 100
                const rowText = num + ' (' + (percnet === 0 ? 0 : percnet < 0.01 ? '<0.01' : formatNumber(percnet.toString(), 2)) + '%)'
                const mode = !rawDataView ? 'N/A' : (showType === 'Numerical' ? 'N/A' : rawDataView[k].mode)
                const mean = !rawDataView ? 'N/A' : (showType === 'Numerical' ? rawDataView[k].mean : 'N/A')
                const median = !rawDataView ? 'N/A' : (showType === 'Numerical' ? rawDataView[k].median : 'N/A')
                const method = this.fillMethod.mismatch.hasOwnProperty(k) ?
                  this.fillMethod.mismatch[k] :
                  mismatchFillMethodTemp.hasOwnProperty(k) ?
                    mismatchFillMethodTemp[k] : 'mean'
                const isOthers = !numArray.find(_a => _a.value === method)
                return <div className={styles.fixesRow} key={i}>
                  {Object.keys(mismatchRow).length > 1 && <div className={styles.fixedCheck}><input type="checkbox" checked={this.checked.mismatch.includes(k)} onChange={this.handleCheck('mismatch', k)} /></div>}
                  <div className={classnames(styles.fixesCell, styles.fixesLarge)}><span title={mapHeader[k]}>{mapHeader[k]}</span></div>
                  <div className={styles.fixesCell}><span>{showType === 'Numerical' ? EN.Numerical : EN.Categorical}</span></div>
                  <div className={styles.fixesCell}><span title={rowText}>{rowText}</span></div>
                  <div className={styles.fixesCell}><span title={this.formatCell(mean)}>{this.formatCell(mean)}</span></div>
                  <div className={styles.fixesCell}><span title={this.formatCell(median)}>{this.formatCell(median)}</span></div>
                  <div className={styles.fixesCell}><span title={this.formatCell(mode)}>{this.formatCell(mode)}</span></div>
                  <div className={classnames(styles.fixesCell, styles.fixesLarge)}>
                    <select value={isOthers ? 'others' : method} onChange={this.mismatchSelect.bind(null, k)}>
                      {numArray.map(item => {
                        if (isTarget && item.value === 'column') return null
                        return <option value={item.value} key={item.value}>{item.label}</option>
                      })}
                    </select>
                    {isOthers && <NumberInput value={method} onBlur={this.handleInput.bind(null, 'mismatch', k)} />}
                  </div>
                </div>
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
            {Object.keys(nullRow).length > 1 && <div className={styles.batch}>
              <Select placeholder={`${EN.BatchFix}(${EN.Numerical})`} value={undefined} onSelect={this.handleSelect('null', true)} className={styles.batchSelect} >
                {numArray.map(item => {
                  if (isTarget && item.value === 'column') return null
                  return <Option value={item.value} key={item.value}>{item.label}</Option>
                })}
              </Select>
              <Select placeholder={`${EN.BatchFix}(${EN.Categorical})`} value={undefined} onSelect={this.handleSelect('null', false)} className={styles.batchSelect} >
                {strArray.map(item => {
                  if (isTarget && item.value === 'column') return null
                  return <Option value={item.value} key={item.value}>{item.label}</Option>
                })}
              </Select>
            </div>}
          </div>
          <div className={styles.fixesTable}>
            <div className={classnames(styles.fixesRow, styles.fixesHeader)}>
              {Object.keys(nullRow).length > 1 && <div className={styles.fixedCheck}><input type="checkbox" defaultChecked={false} onChange={this.handleCheckAll('null')} /></div>}
              <div className={styles.fixesTd}><span>{EN.VariableName}</span></div>
              <div className={styles.fixesTd}><span>{EN.MissingReason}</span></div>
              <div className={styles.fixesTd}><span>{EN.Data}</span></div>
              <div className={styles.fixesTd}><span>{EN.QuantityofMissingValue}</span></div>
              <div className={styles.fixesTd}><span>{EN.Mean}</span></div>
              <div className={styles.fixesTd}><span>{EN.Median}</span></div>
              <div className={styles.fixesTd}><span>{EN.MostFrequentValue}</span></div>
              <div className={classnames(styles.fixesTd, styles.fixesLarge)}>
                <span>{EN.Fix}</span>
                <span className={styles.reset} onClick={this.handleReset('null')}>{EN.Reset}</span>
              </div>
            </div>
            <div className={styles.fixesBody}>
              {Object.keys(nullRow).map((k, i) => {
                const originNum = nullRow[k]
                if (!originNum) return null
                const num = nullRow[k] || 0
                const showType = colType[k] === 'Numerical' ? 'Numerical' : 'Categorical'
                const options = showType === 'Numerical' ? numArray : strArray
                const percnet = num / (totalRawLines || 1) * 100
                const rowText = num + ' (' + (percnet === 0 ? 0 : percnet < 0.01 ? '<0.01' : formatNumber(percnet.toString(), 2)) + '%)'
                const mode = !rawDataView ? 'N/A' : (showType === 'Numerical' ? 'N/A' : rawDataView[k].mode)
                const mean = !rawDataView ? 'N/A' : (showType === 'Numerical' ? rawDataView[k].mean : 'N/A')
                const median = !rawDataView ? 'N/A' : (showType === 'Numerical' ? rawDataView[k].median : 'N/A')
                const method = this.fillMethod.missing.hasOwnProperty(k) ?
                  this.fillMethod.missing[k] :
                  nullFillMethodTemp.hasOwnProperty(k) ?
                    nullFillMethodTemp[k] :
                    (showType === 'Categorical' ? 'mode' : 'mean')
                const isOthers = !options.find(_a => _a.value === method)
                return <div className={styles.fixesRow} key={i}>
                  {Object.keys(nullRow).length > 1 && <div className={styles.fixedCheck}><input type="checkbox" checked={this.checked.null.includes(k)} onChange={this.handleCheck('null', k)} /></div>}
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
                      {options.map(item => {
                        if (isTarget && item.value === 'column') return null
                        return <option value={item.value} key={item.value}>{item.label}</option>
                      })}
                    </select>
                    {isOthers && <NumberInput value={method} onBlur={this.handleInput.bind(null, 'missing', k)} />}
                  </div>
                </div>
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
            {Object.keys(outlierRow).length > 1 && <div className={styles.batch}>
              <Select className={styles.batchSelect} placeholder={EN.BatchFix} value={undefined} onSelect={this.handleSelect('outlier')}>
                {outArray.map(item => {
                  if (isTarget && item.value === 'column') return null
                  return <Option value={item.value} key={item.value}>{item.label}</Option>
                })}
              </Select>
            </div>}
          </div>
          <div className={styles.fixesTable}>
            <div className={classnames(styles.fixesRow, styles.fixesHeader)}>
              {Object.keys(outlierRow).length > 1 && <div className={styles.fixedCheck}><input type="checkbox" defaultChecked={false} onChange={this.handleCheckAll('outlier')} /></div>}
              <div className={styles.fixesTd}><span>{EN.VariableName}</span></div>
              <div className={styles.fixesTd}><span>{EN.ValidRange}</span></div>
              <div className={styles.fixesTd}><span>{EN.DataType}</span></div>
              <div className={styles.fixesTd}><span>{EN.QuantityofOutlier}</span></div>
              <div className={styles.fixesTd}><span>{EN.Mean}</span></div>
              <div className={styles.fixesTd}><span>{EN.Median}</span></div>
              <div className={classnames(styles.fixesTd, styles.fixesLarge)}>
                <span>{EN.Fix}</span>
                <span className={styles.reset} onClick={this.handleReset('outlier')}>{EN.Reset}</span>
              </div>
            </div>
            <div className={styles.fixesBody}>
              {Object.keys(outlierRow).map((k, i) => {
                const originNum = outlierRow[k]
                if (!originNum) return null
                const num = outlierRow[k] || 0
                const showType = colType[k] === 'Numerical' ? 'Numerical' : 'Categorical'
                if (showType !== 'Numerical') return null
                const isShow = showType === 'Numerical';
                if (!isShow) return null
                const outlier = outlierDictTemp[k] && outlierDictTemp[k].length === 2 ? outlierDictTemp[k] : [rawDataView[k].low, rawDataView[k].high];
                const percnet = num / (totalRawLines || 1) * 100
                const rowText = num + ' (' + (percnet === 0 ? 0 : percnet < 0.01 ? '<0.01' : formatNumber(percnet.toString(), 2)) + '%)'
                const mean = !rawDataView ? 'N/A' : rawDataView[k].mean
                const median = !rawDataView ? 'N/A' : rawDataView[k].median
                const method = this.fillMethod.outlier.hasOwnProperty(k) ?
                  this.fillMethod.outlier[k] :
                  outlierFillMethodTemp.hasOwnProperty(k) ?
                    outlierFillMethodTemp[k] : 'ignore'
                const isOthers = !outArray.find(_a => _a.value === method)
                return <div className={styles.fixesRow} key={i}>
                  {Object.keys(outlierRow).length > 1 && <div className={styles.fixedCheck}><input type="checkbox" checked={this.checked.outlier.includes(k)} onChange={this.handleCheck('outlier', k)} /></div>}
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
                      {outArray.map(item => {
                        if (isTarget && item.value === 'column') return null
                        return <option value={item.value} key={item.value}>{item.label}</option>
                      })}
                    </select>
                    {isOthers && <NumberInput value={method} onBlur={this.handleInput.bind(null, 'outlier', k)} />}
                  </div>
                </div>
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

export default observer(FixIssue)
