import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Modal, NumberInput } from 'components/Common';
import { observable } from 'mobx'
// import * as d3 from 'd3';
import { Icon, message } from 'antd'
import { formatNumber } from 'util'
import EN from '../../../constant/en';
import OutlierRange from "../../Charts/OutlierRange";
import request from '../../Request'

@observer
export class FixIssue extends Component {
  @observable editKey = ''
  @observable visible = false
  @observable progress = 0
  @observable fillMethod = { missing: {}, mismatch: {}, outlier: {} };
  @observable outLier = {};
  @observable editKey = '';
  
  editRange(key, id){
    const {low,high} = this.props.project.rawDataView[key];
  
    if (!this.outLier[key]) {
      request.post({
        url: '/graphics/outlier-range',
        data: {
          "field": key,
          id,
          "interval": 20,
        },
      }).then((result) => {
        this.outLier = {
          ...this.outLier,
          [key]: {
            low,
            high,
            data: result.data,
          },
        };
        this.editKey = key;
        this.visible = true;
      });
      return;
    }
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
    const { missing } = this.fillMethod
    missing[key] = isNaN(value) ? value : parseFloat(value)
    this.fillMethod.missing = { ...missing }
    // const { nullFillMethodTemp } = this.props.project
    // nullFillMethodTemp[key] = value
    // this.props.project.nullFillMethodTemp = { ...nullFillMethodTemp }
  }

  mismatchSelect = (key, e) => {
    let value = e.target.value
    const { mismatch } = this.fillMethod
    mismatch[key] = isNaN(value) ? value : parseFloat(value)
    this.fillMethod.mismatch = { ...mismatch }
    // const { mismatchFillMethodTemp } = this.props.project
    // mismatchFillMethodTemp[key] = value
    // this.props.project.mismatchFillMethodTemp = { ...mismatchFillMethodTemp }
  }

  outlierSelect = (key, e) => {
    let value = e.target.value
    const { outlier } = this.fillMethod
    outlier[key] = isNaN(value) ? value : parseFloat(value)
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
    const { colType, mismatchFillMethodTemp, nullFillMethodTemp, outlierFillMethodTemp, totalRawLines, rawDataView, outlierDictTemp, target, nullLineCounts, mismatchLineCounts, outlierLineCounts, missingReasonTemp, nullLineCountsOrigin, mismatchLineCountsOrigin, outlierLineCountsOrigin } = project
    return <div className={styles.fixesContent}>
      <div className={styles.fixesBlock}>
        {!!mismatchCount && <div className={styles.fixesArea}>
          <div className={styles.typeBox}>
            <div className={styles.type}>
              <div className={classnames(styles.typeBlock, styles.mismatch)}></div>
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
              {Object.keys(mismatchLineCountsOrigin).map((k, i) => {
                if (isTarget && k !== target) return null
                if (!isTarget && k === target) return null
                const originNum = mismatchLineCountsOrigin[k]
                if (!originNum) {
                  return null;
                }
                const num = mismatchLineCounts[k] || 0
                const showType = colType[k] === 'Numerical' ? 'Numerical' : 'Categorical'
                if (showType !== 'Numerical') return null
                const percnet = num / (totalRawLines || 1) * 100
                const rowText = num + ' (' + (percnet === 0 ? 0 : percnet < 0.01 ? '<0.01' : formatNumber(percnet, 2)) + '%)'
                const mode = !rawDataView ? 'N/A' : (showType === 'Numerical' ? 'N/A' : (rawDataView[k].mode === 'nan' ? (rawDataView[k].modeNotNull || [])[1] : rawDataView[k].mode))
                const mean = !rawDataView ? 'N/A' : (showType === 'Numerical' ? rawDataView[k].mean : 'N/A')
                const median = !rawDataView ? 'N/A' : (showType === 'Numerical' ? rawDataView[k].median : 'N/A')
                const method = this.fillMethod.mismatch.hasOwnProperty(k) ?
                  this.fillMethod.mismatch[k] :
                  mismatchFillMethodTemp.hasOwnProperty(k) ?
                    mismatchFillMethodTemp[k] :
                    (showType === 'Categorical' ? mode : mean)
                const showMethod = (showType !== 'Categorical' &&
                  method !== mean &&
                  method !== 'drop' &&
                  method !== (!rawDataView ? 'N/A' : rawDataView[k].min) &&
                  method !== (!rawDataView ? 'N/A' : rawDataView[k].max) &&
                  method !== median &&
                  method !== 0) ? '' : method
                return <div className={styles.fixesRow} key={i}>
                  <div className={classnames(styles.fixesCell, styles.fixesLarge)}><span>{k}</span></div>
                  <div className={styles.fixesCell}><span>{showType}</span></div>
                  <div className={styles.fixesCell}><span title={rowText}>{rowText}</span></div>
                  <div className={styles.fixesCell}><span title={this.formatCell(mean)}>{this.formatCell(mean)}</span></div>
                  <div className={styles.fixesCell}><span title={this.formatCell(median)}>{this.formatCell(median)}</span></div>
                  <div className={styles.fixesCell}><span title={this.formatCell(mode)}>{this.formatCell(mode)}</span></div>
                  <div className={classnames(styles.fixesCell, styles.fixesLarge)}>
                    <select value={showMethod} onChange={this.mismatchSelect.bind(null, k)}>
                      {showType === 'Categorical' ? [
                        <option value={mode} key="mode">{EN.Replacewithmostfrequentvalue}</option>,
                        <option value="drop" key="drop">{EN.Deletetherows}</option>,
                        <option value="ignore" key="ignore">{EN.Replacewithauniquevalue}</option>
                      ] : [
                          <option value={mean} key='mean'>{EN.Replacewithmeanvalue}</option>,
                          <option value="drop" key='drop'>{EN.Deletetherows}</option>,
                          <option value={!rawDataView ? 'N/A' : rawDataView[k].min} key='min'>{EN.Replacewithminvalue}</option>,
                          <option value={!rawDataView ? 'N/A' : rawDataView[k].max} key='max'>{EN.Replacewithmaxvalue}</option>,
                          // <option value={mode} key='mode'>Replace with most frequent value</option>,
                          <option value={median} key='median'>{EN.Replacewithmedianvalue}</option>,
                          <option value={0} key={0}>{EN.ReplaceWith0}</option>,
                          <option value={''} key='others'>{EN.Replacewithothers}</option>
                        ]}
                    </select>
                    {showMethod === '' && <NumberInput value={method || ''} onBlur={this.handleInput.bind(null, 'mismatch', k)} />}
                  </div>
                </div>
              })}
            </div>
          </div>
        </div>}
        {!!nullCount && <div className={styles.fixesArea}>
          <div className={styles.typeBox}>
            <div className={styles.type}>
              <div className={classnames(styles.typeBlock, styles.missing)}></div>
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
              {Object.keys(nullLineCountsOrigin).map((k, i) => {
                if (isTarget && k !== target) return null
                if (!isTarget && k === target) return null
                const originNum = nullLineCountsOrigin[k]
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
                const method = this.fillMethod.missing.hasOwnProperty(k) ?
                  this.fillMethod.missing[k] :
                  nullFillMethodTemp.hasOwnProperty(k) ?
                    nullFillMethodTemp[k] :
                    (showType === 'Categorical' ? mode : mean)
                const showMethod = (showType !== 'Categorical' &&
                  method !== mean &&
                  method !== 'drop' &&
                  method !== (!rawDataView ? 'N/A' : rawDataView[k].min) &&
                  method !== (!rawDataView ? 'N/A' : rawDataView[k].max) &&
                  method !== median &&
                  method !== 0) ? '' : method
                return <div className={styles.fixesRow} key={i}>
                  <div className={styles.fixesCell}><span>{k}</span></div>
                  <div className={styles.fixesCell}><select value={missingReasonTemp[k]} onChange={this.reasonSelect.bind(null, k)}>
                    <option value='none' key="none">{EN.Idonknow}</option>
                    <option value="blank" key="blank">{EN.Leftblankonpurpose}</option>
                    <option value='fail' key='fail'>{EN.FailedtoCollectorDataError}</option>
                  </select></div>
                  <div className={styles.fixesCell}><span>{showType}</span></div>
                  <div className={styles.fixesCell}><span title={rowText}>{rowText}</span></div>
                  <div className={styles.fixesCell}><span title={this.formatCell(mean)}>{this.formatCell(mean)}</span></div>
                  <div className={styles.fixesCell}><span title={this.formatCell(median)}>{this.formatCell(median)}</span></div>
                  <div className={styles.fixesCell}><span title={this.formatCell(mode)}>{this.formatCell(mode)}</span></div>
                  <div className={classnames(styles.fixesCell, styles.fixesLarge)}>
                    <select value={showMethod} onChange={this.nullSelect.bind(null, k)}>
                      {showType === 'Categorical' ? [
                        <option value={mode} key="mode">{EN.Replacewithmostfrequentvalue}</option>,
                        <option value="drop" key="drop">{EN.Deletetherows}</option>,
                        <option value='ignore' key='ignore'>{EN.Replacewithauniquevalue}</option>
                      ] : [
                          <option value={mean} key='mean'>{EN.Replacewithmeanvalue}</option>,
                          <option value="drop" key='drop'>{EN.Deletetherows}</option>,
                          <option value={!rawDataView ? 'N/A' : rawDataView[k].min} key='min'>{EN.Replacewithminvalue}</option>,
                          <option value={!rawDataView ? 'N/A' : rawDataView[k].max} key='max'>{EN.Replacewithmaxvalue}</option>,
                          // <option value={mode} key='mode'>Replace with most frequent value</option>,
                          <option value={median} key='median'>{EN.Replacewithmedianvalue}</option>,
                          <option value={0} key={0}>{EN.ReplaceWith0}</option>,
                          <option value={''} key='others'>{EN.Replacewithothers}</option>
                        ]}
                    </select>
                    {showMethod === '' && <NumberInput value={method || ''} onBlur={this.handleInput.bind(null, 'missing', k)} />}
                  </div>
                </div>
              })}
            </div>
          </div>
        </div>}
        {!!outlierCount && <div className={styles.fixesArea}>
          <div className={styles.typeBox}>
            <div className={styles.type}>
              <div className={classnames(styles.typeBlock, styles.outlier)}></div>
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
              {Object.keys(outlierLineCountsOrigin).map((k, i) => {
                if (isTarget && k !== target) return null
                if (!isTarget && k === target) return null
                const originNum = outlierLineCountsOrigin[k]
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
                const method = this.fillMethod.outlier.hasOwnProperty(k) ?
                  this.fillMethod.outlier[k] :
                  outlierFillMethodTemp.hasOwnProperty(k) ?
                    outlierFillMethodTemp[k] :
                    'ignore'
                const showMethod = (showType !== 'Categorical' &&
                  method !== mean &&
                  method !== 'drop' &&
                  method !== 'ignore' &&
                  method !== (!rawDataView ? 'N/A' : rawDataView[k].min) &&
                  method !== (!rawDataView ? 'N/A' : rawDataView[k].max) &&
                  method !== median &&
                  method !== 0) ? '' : method
                return <div className={styles.fixesRow} key={i}>
                  <div className={styles.fixesCell}><span>{k}</span></div>
                  <div className={classnames(styles.fixesCell, styles.fixesBwtween)}>
                    <span title={formatNumber(outlier[0], 2) + "-" + formatNumber(outlier[1], 2)}>
                      {formatNumber(outlier[0], 2) + "-" + formatNumber(outlier[1], 2)}
                    </span><span className={styles.fixesEdit} onClick={this.editRange.bind(this, k,project.etlIndex)}>{EN.Edit}</span>
                  </div>
                  <div className={styles.fixesCell}><span>{showType}</span></div>
                  <div className={styles.fixesCell}><span title={rowText}>{rowText}</span></div>
                  <div className={styles.fixesCell}><span title={this.formatCell(mean)} >{this.formatCell(mean)}</span></div>
                  <div className={styles.fixesCell}><span title={this.formatCell(median)}>{this.formatCell(median)}</span></div>
                  <div className={classnames(styles.fixesCell, styles.fixesLarge)}>
                    <select value={showMethod} onChange={this.outlierSelect.bind(null, k)}>
                      <option value="ignore" key='ignore'>{EN.DoNothing}</option>
                      <option value="drop" key='drop'>{EN.Deletetherows}</option>
                      <option value={mean} key='mean'>{EN.Replacewithmeanvalue}</option>
                      <option value={median} key='median'>{EN.Replacewithmedianvalue}</option>
                      {/* <option value={mode} key='mode'>Replace with most frequent value</option> */}
                      <option value={0} key='0'>{EN.ReplaceWith0}</option>,
                      <option value={''} key='others'>{EN.Replacewithothers}</option>
                    </select>
                    {showMethod === '' && <NumberInput value={method || ''} onBlur={this.handleInput.bind(null, 'outlier', k)} />}
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
                  message={this.outLier[this.editKey]}
              />
            } />}
      {/*{this.editKey && <Modal content={<EditOutLier width={800}*/}
      {/*  height={400} saveEdit={this.saveEdit}*/}
      {/*  closeEdit={this.closeEdit}*/}
      {/*  outlierRange={project.outlierRange[this.editKey]}*/}
      {/*  outlierDict={project.outlierDictTemp[this.editKey]}*/}
      {/*  x={project.numberBins[this.editKey][1]}*/}
      {/*  y={project.numberBins[this.editKey][0]}*/}
      {/*  minX={Math.floor((rawDataView[this.editKey] || {}).min || 0)}*/}
      {/*  maxX={Math.ceil((rawDataView[this.editKey] || {}).max || 0)} />}*/}
      {/*  visible={this.visible}*/}
      {/*  width='12em'*/}
      {/*  title={EN.Outlier}*/}
      {/*  onClose={this.closeEdit}*/}
      {/*  closeByMask={true}*/}
      {/*  showClose={true}*/}
      {/*/>}*/}
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
