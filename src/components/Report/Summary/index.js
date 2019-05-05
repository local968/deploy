import React, { Component } from 'react';
import styles from './styles.module.css';
import { observer } from 'mobx-react';
import * as d3 from 'd3';
import { formatNumber } from 'util'
import EN from '../../../constant/en';
@observer
class Summary extends Component {
  componentDidMount() {
    this.renderD3()
  }

  backToConnect = () => {
    const { updateProject, nextSubStep } = this.props.project
    updateProject(nextSubStep(1, 2))
  }

  startTrain = () => {
    const { project } = this.props
    project.updateProject(project.nextMainStep(3))
  }

  renderD3 = () => {
    d3.select(`.${styles.summaryChart} svg`).remove();

    const outerRadius = 100;           // 外半径
    const innerRadius = 0;             // 内半径
    //弧生成器
    const arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
    const { totalRawLines, totalLines, totalFixedLines } = this.props.project
    const deleteRows = totalRawLines - totalLines
    const fixedRows = totalFixedLines
    const cleanRows = totalLines - totalFixedLines
    const data = [fixedRows, deleteRows, cleanRows]
    const color = ['#9cebff', '#c4cbd7', '#00c855'];
    const dataset = d3.pie()(data);

    const svg = d3.select(`.${styles.summaryChart}`)
      .append("svg")
      .attr("width", 200)
      .attr("height", 200)

    svg.selectAll(`g`)
      .data(dataset)
      .enter()
      .append("g")
      .attr("transform", "translate(" + outerRadius + "," + outerRadius + ")")
      .append("path")
      .attr("fill", (d, i) => color[i])
      .attr("d", (d) => {
        return arc(d);   //调用弧生成器，得到路径值
      });
  }

  render() {
    const { project } = this.props;
    const { target, colType, sortHeader, dataHeader, totalRawLines, totalLines, nullLineCounts, mismatchLineCounts, outlierLineCounts, totalFixedLines, problemType, mismatchFillMethod, nullFillMethod, outlierFillMethod } = project
    const deletePercent = (totalRawLines - totalLines) / totalRawLines * 100
    const fixedPercent = totalFixedLines / totalRawLines * 100
    const cleanPercent = (totalLines - totalFixedLines) / totalRawLines * 100
    const currentHeader = sortHeader.filter(h => dataHeader.includes(h))
    const variableList = currentHeader.slice(1)
    const percentList = currentHeader.map(v => {
      const percent = {
        missing: (nullLineCounts[v] || 0) / (totalRawLines || 1) * 100,
        mismatch: (mismatchLineCounts[v] || 0) / (totalRawLines || 1) * 100,
        outlier: (problemType !== 'Classification' ? (outlierLineCounts[v] || 0) : 0) / (totalRawLines || 1) * 100
      }
      percent.clean = 100 - percent.missing - percent.mismatch - percent.outlier
      return percent
    })
    const fillMethod = method => method === 'ignore' || method === 'drop' ? method : `replace with ${method}`
    const getFixMethod = key => {
      let result = []
      const mismatchDefault = colType[key] === 'Numerical' ? 'mean' : 'mode'
      const nullDefault = colType[key] === 'Numerical' ? 'mean' : 'mode'
      const outlierDefault = colType[key] === 'drop'
      if (mismatchLineCounts[key]) result.push(`mismatch: ${fillMethod(mismatchFillMethod[key] || mismatchDefault)}`)
      if (nullLineCounts[key]) result.push(`missing value: ${fillMethod(nullFillMethod[key] || nullDefault)}`)
      if (outlierLineCounts[key]) result.push(`outlier: ${fillMethod(outlierFillMethod[key] || outlierDefault)}`)
      return result.join('\n')
    }
    return <div className={styles.summary}>
      <div className={styles.summaryLeft}>
        <div className={styles.summaryTitle}><span>{EN.DataQualityIssuesandFixMethod}</span></div>
        <div className={styles.summaryTypeBox}>
          <div className={styles.summaryType}>
            <div className={styles.summaryCube} style={{ backgroundColor: '#00c855' }}></div>
            <span>{EN.CleanData}</span>
          </div>
          <div className={styles.summaryType}>
            <div className={styles.summaryCube} style={{ backgroundColor: '#819ffc' }}></div>
            <span>{EN.mismatch}</span>
          </div>
          <div className={styles.summaryType}>
            <div className={styles.summaryCube} style={{ backgroundColor: '#ff97a7' }}></div>
            <span>{EN.MissingValue}</span>
          </div>
          {problemType !== 'Classification' && <div className={styles.summaryType}>
            <div className={styles.summaryCube} style={{ backgroundColor: '#f9cf37' }}></div>
            <span>{EN.Outlier}</span>
          </div>}
        </div>
        <div className={styles.summaryTable}>
          <div className={styles.summaryTableLeft}>
            <div className={styles.summaryTableRow}>
              <div className={styles.summaryCell}><span style={{ fontWeight: 'bold' }}>{EN.TargetVariable}</span></div>
              <div className={styles.summaryCell}><span style={{ fontWeight: 'bold' }}>{EN.CleanData}</span></div>
            </div>
            <div className={styles.summaryTableRow}>
              <div className={styles.summaryCell}><span>{target}</span></div>
              <div className={styles.summaryCell}><span>{formatNumber(percentList[0].clean, 2)}%</span></div>
            </div>
          </div>
          <div className={styles.summaryTableRight}>
            <div className={styles.summaryTableRow}>
              <div className={styles.summaryCell}><span style={{ fontWeight: 'bold' }}>{EN.DataComposition} </span></div>
            </div>
            <div className={styles.summaryTableRow}>
              <div className={styles.summaryProgressBlock} title={getFixMethod(target)}>
                <div className={styles.summaryProgress} style={{ width: percentList[0].clean + '%', backgroundColor: '#00c855' }}></div>
                <div className={styles.summaryProgress} style={{ width: percentList[0].mismatch + '%', backgroundColor: '#819ffc' }}></div>
                <div className={styles.summaryProgress} style={{ width: percentList[0].missing + '%', backgroundColor: '#ff97a7' }}></div>
                {problemType !== 'Classification' && <div className={styles.summaryProgress} style={{ width: percentList[0].outlier + '%', backgroundColor: '#f9cf37' }}></div>}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.summaryTable} style={{ paddingRight: '.2em' }}>
          <div className={styles.summaryTableLeft}>
            <div className={styles.summaryTableRow}>
              <div className={styles.summaryCell}><span style={{ fontWeight: 'bold' }}>{EN.PredictorVariables}</span></div>
              <div className={styles.summaryCell}><span style={{ fontWeight: 'bold' }}>{EN.CleanData}</span></div>
            </div>
          </div>
          <div className={styles.summaryTableRight}>
            <div className={styles.summaryTableRow}>
              <div className={styles.summaryCell}><span style={{ fontWeight: 'bold' }}>{EN.DataComposition }</span></div>
            </div>
          </div>
        </div>
        <div className={styles.summaryTable} style={{ overflow: 'scroll' }}>
          <div className={styles.summaryTableLeft}>
            {variableList.map((v, k) => {
              const percent = percentList[k + 1]
              return <div className={styles.summaryTableRow} key={k}>
                <div className={styles.summaryCell}><span alt={v}>{v}</span></div>
                <div className={styles.summaryCell}><span>{formatNumber(percent.clean, 2)}%</span></div>
              </div>
            })}
          </div>
          <div className={styles.summaryTableRight}>
            {variableList.map((v, k) => {
              const percent = percentList[k + 1]
              return <div className={styles.summaryTableRow} key={k}>
                <div className={styles.summaryProgressBlock} title={getFixMethod(v)}>
                  <div className={styles.summaryProgress} style={{ width: percent.clean + '%', backgroundColor: '#00c855' }}></div>
                  <div className={styles.summaryProgress} style={{ width: percent.mismatch + '%', backgroundColor: '#819ffc' }}></div>
                  <div className={styles.summaryProgress} style={{ width: percent.missing + '%', backgroundColor: '#ff97a7' }}></div>
                  {problemType !== 'Classification' && <div className={styles.summaryProgress} style={{ width: percent.outlier + '%', backgroundColor: '#f9cf37' }}></div>}
                </div>
              </div>
            })}
          </div>
        </div>
      </div>
      <div className={styles.summaryRight}>
        <div className={styles.summaryTitle}><span>{EN.SummaryofFixes}</span></div>
        <div className={styles.summaryPie}>
          <div className={styles.summaryChart}>
          </div>
          <div className={styles.summaryParts}>
            <div className={styles.summaryPart}>
              <div className={styles.summaryPartText}>
                <div className={styles.summaryCube} style={{ backgroundColor: '#9cebff' }}></div>
                <span style={{ fontWeight: 'bold' }}>{EN.RowsWillBeFixed}</span>
              </div>
              <div className={styles.summaryPartText}>
                <div className={styles.summaryCube}></div>
                <span>{formatNumber(fixedPercent, 2)}%</span>
              </div>
            </div>
            <div className={styles.summaryPart}>
              <div className={styles.summaryPartText}>
                <div className={styles.summaryCube} style={{ backgroundColor: '#c4cbd7' }}></div>
                <span style={{ fontWeight: 'bold' }}>{EN.RowsWillBeDeleted}</span>
              </div>
              <div className={styles.summaryPartText}>
                <div className={styles.summaryCube}></div>
                <span>{formatNumber(deletePercent, 2)}%</span>
              </div>
            </div>
            <div className={styles.summaryPart}>
              <div className={styles.summaryPartText}>
                <div className={styles.summaryCube} style={{ backgroundColor: '#00c855' }}></div>
                <span style={{ fontWeight: 'bold' }}>{EN.CleanData}</span>
              </div>
              <div className={styles.summaryPartText}>
                <div className={styles.summaryCube}></div>
                <span>{formatNumber(cleanPercent, 2)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  }
}

export default Summary
