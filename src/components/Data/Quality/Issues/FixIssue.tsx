import React, { Component } from 'react';
import styles from '../styles.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Modal, NumberInput } from 'components/Common';
import { observable } from 'mobx'
// import * as d3 from 'd3';
import { Icon, message } from 'antd'
import { formatNumber } from '../../../../util'
import EN from '../../../../constant/en';
import OutlierRange from "../../../Charts/OutlierRange";
import Project from 'stores/Project';

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
                const rowText = num + ' (' + (percnet === 0 ? 0 : percnet < 0.01 ? '<0.01' : formatNumber(percnet.toString(), 2)) + '%)'
                const mode = !rawDataView ? 'N/A' : (showType === 'Numerical' ? 'N/A' : rawDataView[k].mode)
                const mean = !rawDataView ? 'N/A' : (showType === 'Numerical' ? rawDataView[k].mean : 'N/A')
                const median = !rawDataView ? 'N/A' : (showType === 'Numerical' ? rawDataView[k].median : 'N/A')
                const mismatchArray = [{
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
                    mismatchFillMethodTemp[k] : 'mean'
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
                const rowText = num + ' (' + (percnet === 0 ? 0 : percnet < 0.01 ? '<0.01' : formatNumber(percnet.toString(), 2)) + '%)'
                const mode = !rawDataView ? 'N/A' : (showType === 'Numerical' ? 'N/A' : rawDataView[k].mode)
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
                const rowText = num + ' (' + (percnet === 0 ? 0 : percnet < 0.01 ? '<0.01' : formatNumber(percnet.toString(), 2)) + '%)'
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
                  value: 'respective',
                  label: EN.ReplaceRespective
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