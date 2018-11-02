import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Modal } from 'components/Common';
import { observable } from 'mobx'
import * as d3 from 'd3';

@observer
export class TargetIssue extends Component {
  render() {
    const { num, backToConnect, backToSchema, editTarget, unique, recomm } = this.props;
    return <div className={styles.block}>
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
          {num === 0 && <div className={styles.reasonTitle}><span>Possible Reasons</span></div>}
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
        </div>
      </div>
    </div>
  }
}

@observer
export class RowIssue extends Component {
  render() {
    const { num, backToConnect, totalRawLines } = this.props;
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
          {num === 0 && <div className={styles.reasonTitle}><span>Possible Reasons</span></div>}
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
    const { num, backToConnect, editFixes, issueRows, totalLines, percent } = this.props;
    // const cleanRows = totalLines - issueRows.errorRow.length;

    return <div className={styles.block}>
      <div className={styles.name}><span>Data issues are found</span></div>
      <div className={styles.desc}>
        <div className={styles.info}>
          <div className={styles.progressBox}>
            {!!issueRows.nullRow.length && <div className={styles.issueBlock}>
              <div className={styles.left}>
                <div className={styles.issueRow}><span>Missing Value ({issueRows.nullRow.length} rows) {percent.missing.toFixed(4)}%</span></div>
                <div className={classnames(styles.progress, styles.missing)} style={{ width: percent.missing < 1 ? 1 : percent.missing + "%" }}></div>
              </div>
              <div className={styles.right}>
                <span>Will be fixed</span>
              </div>
            </div>}
            {!!issueRows.mismatchRow.length && <div className={styles.issueBlock}>
              <div className={styles.left}>
                <div className={styles.issueRow}><span>Data Type Mismatch ({issueRows.mismatchRow.length} rows) {percent.mismatch.toFixed(4)}%</span></div>
                <div className={classnames(styles.progress, styles.mismatch)} style={{ width: percent.mismatch < 1 ? 1 : percent.mismatch + "%" }}></div>
              </div>
              <div className={styles.right}>
                <span>Will be fixed</span>
              </div>
            </div>}
            {!!issueRows.outlierRow.length && <div className={styles.issueBlock}>
              <div className={styles.left}>
                <div className={styles.issueRow}><span>Outlier ({issueRows.outlierRow.length} rows) {percent.outlier.toFixed(4)}%</span></div>
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
          {num === 0 && <div className={styles.reasonTitle}><span>Possible Reasons</span></div>}
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
  @observable canSave = false
  @observable map = {}

  check = (e) => {
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
    const { checked, map } = this;
    const { target, colMap } = this.props.project;
    let min, max;
    for (let key in colMap[target]) {
      if (checked.includes(key)) {
        if (!max) {
          max = {
            k: key,
            v: colMap[target][key]
          }
        } else {
          if (max.v > colMap[target][key]) {
            min = {
              k: key,
              v: colMap[target][key]
            }
          } else {
            min = max;
            max = {
              k: key,
              v: colMap[target][key]
            }
          }
        }
      }
    }
    if (!max || !min) {
      return false;
    }
    let targetMap = this.props.project.targetMap || {}
    targetMap[min.k] = 0;
    targetMap[max.k] = 1;
    for (let key in map) {
      if (map[key] === max.k) {
        targetMap[key] = 1
      } else if (map[key] === min.k) {
        targetMap[key] = 0
      }
    }
    this.props.project.targetMapTemp = targetMap;
    this.props.saveTargetFixes()
  }

  changeBind = (key, e) => {
    let map = this.map;
    map[key] = e.target.value;
    this.map = map
  }

  render() {
    const { closeTarget } = this.props;
    const { target, colMap } = this.props.project;

    return <div className={styles.fixesContent}>
      <div className={styles.fixesBox}>
        <div className={styles.fixesText}><span>Please select two valid values from all unique values in your target variable</span></div>
        <div className={styles.fixesCheckBox}>
          {Object.keys(colMap[target]).map((t, i) => {
            return <div className={styles.fixesCheck} key={i}>
              <input type='checkbox' value={t} checked={this.checked.includes(t)} onChange={this.check} />
              <span>{t}</span>
            </div>
          })}
        </div>
      </div>
      {this.canSave && <div className={styles.fixesBox}>
        <div className={styles.fixesText}><span>Please map the other values to valid ones if they are equivalent. The rest will be deleted</span></div>
        <div className={styles.fixesSelectBox}>
          {Object.keys(colMap[target]).map((t, i) => {
            if (this.checked.includes(t)) return null;
            return <div className={styles.fixesSelect} key={i}>
              <span title={t}>{t}: </span>
              <select value={this.map[t]} onChange={this.changeBind.bind(null, t)}>
                <option value="drop">Drop</option>
                <option value={this.checked[0]}>{this.checked[0]}</option>
                <option value={this.checked[1]}>{this.checked[1]}</option>
              </select>
            </div>
          })}
        </div>
      </div>}
      <div className={styles.fixesBottom}>
        <button className={classnames(styles.save, {
          [styles.disabled]: !this.canSave
        })} onClick={this.save} disabled={!this.canSave} ><span>save</span></button>
        <button className={styles.cancel} onClick={closeTarget}><span>cancel</span></button>
      </div>
    </div>
  }
}

@observer
export class FixIssue extends Component {
  @observable editKey = ''
  @observable canSave = false
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
    this.canSave = true
  }

  nullSelect = (key, e) => {
    let value = e.target.value
    if (value === "ignore") value = null
    this.props.project.nullFillMethod[key] = value;
    this.canSave = true
  }

  mismatchSelect = (key, e) => {
    let value = e.target.value
    if (value === "ignore") value = null
    this.props.project.mismatchFillMethod[key] = value;
    this.canSave = true
  }

  outlierSelect = (key, e) => {
    let value = e.target.value
    if (value === "ignore") value = null
    this.props.project.outlierFillMethod[key] = value;
    this.canSave = true
  }

  render = () => {
    const { closeFixes, project, saveDataFixes } = this.props;
    const { issueRows, colType, mismatchIndex, nullIndexes, outlierIndex, mismatchFillMethod, nullFillMethod, outlierFillMethod, totalRawLines, dataViews, outlierRange, outlierDict } = project
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
              if (!mismatchIndex[k].length) {
                return null;
              }
              return <div className={styles.fixesRow} key={i}>
                <div className={classnames(styles.fixesCell, styles.fixesLarge)}><span>{k}</span></div>
                <div className={styles.fixesCell}><select value={colType[k]} readOnly={true}>
                  <option value="Categorical">Categorical</option>
                  <option value="Numerical">Numerical</option>
                </select></div>
                <div className={styles.fixesCell}><span>{mismatchIndex[k].length} ({(mismatchIndex[k].length / (totalRawLines || 1)).toFixed(4)}%)</span></div>
                <div className={styles.fixesCell}><span title={dataViews[k].mean}>{dataViews[k].mean}</span></div>
                <div className={styles.fixesCell}><span title={dataViews[k].median}>{dataViews[k].median}</span></div>
                <div className={styles.fixesCell}><span title={dataViews[k].mode}>{dataViews[k].mode}</span></div>
                <div className={classnames(styles.fixesCell, styles.fixesLarge)}><select value={mismatchFillMethod[k]} onChange={this.mismatchSelect.bind(null, k)}>
                  {colType[k] === 'Categorical' ? <option value="mode">Replace with most frequent value</option> : <option value="mean">Replace with mean value</option>}
                  <option value="drop">Delete the row</option>
                  <option value="min">Replace with min value</option>
                  <option value="max">Replace with max value</option>
                  <option value="max+1">Replace with max+1 value</option>
                  {colType[k] === 'Categorical' ? <option value="mean">Replace with mean value</option> : <option value="mode">Replace with most frequent value</option>}
                  <option value="median">Replace with median value</option>
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
            {Object.keys(nullIndexes).map((k, i) => {
              if (!nullIndexes[k].length) {
                return null;
              }
              return <div className={styles.fixesRow} key={i}>
                <div className={styles.fixesCell}><span>{k}</span></div>
                <div className={styles.fixesCell}><span>I don`t know</span></div>
                <div className={styles.fixesCell}><select value={colType[k]} readOnly={true}>
                  <option value="Categorical">Categorical</option>
                  <option value="Numerical">Numerical</option>
                </select></div>
                <div className={styles.fixesCell}><span>{nullIndexes[k].length} ({(nullIndexes[k].length / (totalRawLines || 1)).toFixed(4)}%)</span></div>
                <div className={styles.fixesCell}><span title={dataViews[k].mean}>{dataViews[k].mean}</span></div>
                <div className={styles.fixesCell}><span title={dataViews[k].median}>{dataViews[k].median}</span></div>
                <div className={styles.fixesCell}><span title={dataViews[k].mode}>{dataViews[k].mode}</span></div>
                <div className={classnames(styles.fixesCell, styles.fixesLarge)}><select value={nullFillMethod[k]} onChange={this.nullSelect.bind(null, k)}>
                  {colType[k] === 'Categorical' ? <option value="mode">Replace with most frequent value</option> : <option value="mean">Replace with mean value</option>}
                  <option value="drop">Delete the row</option>
                  <option value="ignore">Do Nothing</option>
                  <option value="min">Replace with min value</option>
                  <option value="max">Replace with max value</option>
                  <option value="max+1">Replace with max+1 value</option>
                  {colType[k] === 'Categorical' ? <option value="mean">Replace with mean value</option> : <option value="mode">Replace with most frequent value</option>}
                  <option value="median">Replace with median value</option>
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
              if (!outlierIndex[k].length) {
                return null;
              }
              const outlier = outlierDict[k] && outlierDict[k].length === 2 ? outlierDict[k] : outlierRange[k];
              const isShow = colType[k] === 'Numerical';
              return isShow && <div className={styles.fixesRow} key={i}>
                <div className={styles.fixesCell}><span>{k}</span></div>
                <div className={classnames(styles.fixesCell, styles.fixesBwtween)}>
                  <span title={outlier[0].toFixed(2) + "-" + outlier[1].toFixed(2)}>
                    {outlier[0].toFixed(2) + "-" + outlier[1].toFixed(2)}
                  </span><span className={styles.fixesEdit} onClick={this.editRange.bind(null, k)}>edit</span>
                </div>
                <div className={styles.fixesCell}><select value={colType[k]} readOnly={true}>
                  <option value="Categorical">Categorical</option>
                  <option value="Numerical">Numerical</option>
                </select></div>
                <div className={styles.fixesCell}><span>{outlierIndex[k].length} ({(outlierIndex[k].length / (totalRawLines || 1)).toFixed(4)}%)</span></div>
                <div className={styles.fixesCell}><span title={dataViews[k].mean} >{dataViews[k].mean}</span></div>
                <div className={styles.fixesCell}><span title={dataViews[k].median}>{dataViews[k].median}</span></div>
                <div className={classnames(styles.fixesCell, styles.fixesLarge)}><select value={outlierFillMethod[k]} onChange={this.outlierSelect.bind(null, k)}>
                  <option value="ignore">Do Nothing</option>
                  <option value="drop">Delete the row</option>
                  <option value="min">Replace with min value</option>
                  <option value="max">Replace with max value</option>
                  <option value="max+1">Replace with max+1 value</option>
                  <option value="mean">Replace with mean value</option>
                  <option value="median">Replace with median value</option>
                  <option value="mode">Replace with most frequent value</option>
                </select></div>
              </div>
            })}
          </div>
        </div>
      </div>}
      <div className={styles.fixesBottom}>
        <button className={classnames(styles.save, {
          [styles.disabled]: !this.canSave
        })} onClick={saveDataFixes} disabled={!this.canSave} ><span>save</span></button>
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
        let data
        if (x[i] <= min || x[i - 1] >= max) {
          data = {
            x: xScale(x[i - 1]),
            y: yScale(y[i - 1]) + padding.top,
            width: Math.abs(xScale(x[i]) - xScale(x[i - 1])),
            class: styles.outer
          }
        } else if (x[i] <= max && x[i - 1] >= min) {
          data = {
            x: xScale(x[i - 1]),
            y: yScale(y[i - 1]) + padding.top,
            width: Math.abs(xScale(x[i]) - xScale(x[i - 1])),
            class: styles.rect
          }
        } else if (x[i] > max && x[i - 1] < max && x[i - 1] > min) {
          const left = Math.abs(xScale(x[i - 1]) - xScale(max))
          data = {
            x: xScale(x[i - 1]),
            y: yScale(y[i - 1]) + padding.top,
            width: left,
            class: styles.rect
          }
          data = {
            x: xScale(x[i - 1]) + left,
            y: yScale(y[i - 1]) + padding.top,
            width: Math.abs(xScale(x[i]) - xScale(x[i - 1])) - left,
            class: styles.outer
          }
        } else if (x[i] > min && x[i - 1] < min && x[i] < max) {
          const left = Math.abs(xScale(x[i - 1]) - xScale(min))
          data = {
            x: xScale(x[i - 1]),
            y: yScale(y[i - 1]) + padding.top,
            width: left,
            class: styles.outer
          }
          data = {
            x: xScale(x[i - 1]) + left,
            y: yScale(y[i - 1]) + padding.top,
            width: Math.abs(xScale(x[i]) - xScale(x[i - 1])),
            class: styles.rect
          }
        } else {
          if (min > max) {
            data = {
              x: xScale(x[i - 1]),
              y: yScale(y[i - 1]) + padding.top,
              width: Math.abs(xScale(x[i]) - xScale(x[i - 1])),
              class: styles.outer
            }
          } else {
            const left = Math.abs(xScale(x[i - 1]) - xScale(min))
            const middle = Math.abs(xScale(max) - xScale(min))
            data = {
              x: xScale(x[i - 1]),
              y: yScale(y[i - 1]) + padding.top,
              width: left,
              class: styles.outer
            }
            data = {
              x: xScale(x[i - 1]) + left,
              y: yScale(y[i - 1]) + padding.top,
              width: middle,
              class: styles.rect
            }
            data = {
              x: xScale(x[i - 1]) + left + middle,
              y: yScale(y[i - 1]) + padding.top,
              width: Math.abs(xScale(x[i]) - xScale(x[i - 1])),
              class: styles.outer
            }
          }
        }
        dataset.push(data)
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
        .attr("height", (d) => {console.log(realHeight , d.y , padding.top);return realHeight - d.y + padding.top});
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
