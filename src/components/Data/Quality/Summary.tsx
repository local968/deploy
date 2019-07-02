import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { formatNumber } from '../../../util'
import EN from '../../../constant/en';
import {
  PIE
} from "../../Charts"
import Project from 'stores/Project';

interface SummaryProps {
  project: Project,
  editFixes: () => void
}

class Summary extends Component<SummaryProps> {
  backToConnect = () => {
    const { updateProject, nextSubStep } = this.props.project
    updateProject(nextSubStep(1, 2))
  }

  startTrain = () => {
    const { project } = this.props
    project.updateProject({ ...project.nextMainStep(3), runWith: project.totalLines < 10000 ? 'cross' : 'holdout' })
  }

  render() {
    const { project, editFixes } = this.props;
    const { mapHeader, target, sortHeader, colType, dataHeader, totalRawLines, deletedCount, totalLines, targetIssuesCountsOrigin, variableIssueCount: { nullCount, mismatchCount, outlierCount }, variableIssues: { nullRow, mismatchRow, outlierRow }, totalFixedLines, problemType, issues } = project
    const deletePercent = formatNumber((deletedCount / totalRawLines * 100).toString(), 2)
    const fixedPercent = formatNumber(((totalFixedLines - deletedCount) / totalRawLines * 100).toString(), 2)
    const cleanPercent = formatNumber((100 - +deletePercent - +fixedPercent).toString(), 2)
    const currentHeader = sortHeader.filter(h => dataHeader.includes(h))
    const variableList = currentHeader.slice(1)
    const percentList = currentHeader.map(v => {
      const percent: {
        missing: number
        mismatch: number
        outlier: number
        clean?: number
      } = {
        missing: nullRow[v] || 0,
        mismatch: mismatchRow[v] || 0,
        outlier: outlierRow[v] || 0
      }
      percent.clean = 100 - percent.missing - percent.mismatch - percent.outlier
      return percent
    })
    return <div className={styles.summary}>
      <div className={styles.summaryLeft}>
        <div className={styles.summaryTitle}><span>{EN.Summaryofyourdata}</span></div>
        <div className={styles.summaryTypeBox}>
          <div className={styles.summaryType}>
            <div className={styles.summaryCube} style={{ backgroundColor: '#00c855' }} />
            <span>{EN.CleanData}</span>
          </div>
          {(!!targetIssuesCountsOrigin.mismatchRow || !!mismatchCount) && <div className={styles.summaryType}>
            <div className={styles.summaryCube} style={{ backgroundColor: '#819ffc' }} />
            <span>{EN.DataTypeMismatch}</span>
          </div>}
          {(!!targetIssuesCountsOrigin.nullRow || !!nullCount) && <div className={styles.summaryType}>
            <div className={styles.summaryCube} style={{ backgroundColor: '#ff97a7' }} />
            <span>{EN.MissingValue}</span>
          </div>}
          {(problemType !== 'Classification' && (!!targetIssuesCountsOrigin.outlierRow || !!outlierCount)) && <div className={styles.summaryType}>
            <div className={styles.summaryCube} style={{ backgroundColor: '#f9cf37' }} />
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
              <div className={styles.summaryCell}><span>{mapHeader[target]}</span></div>
              <div className={styles.summaryCell}><span>{formatNumber(percentList[0].clean.toString(), 2)}%</span></div>
            </div>
          </div>
          <div className={styles.summaryTableRight}>
            <div className={styles.summaryTableRow}>
              <div className={styles.summaryCell}><span style={{ fontWeight: 'bold' }}>{EN.DataComposition} </span></div>
            </div>
            <div className={styles.summaryTableRow}>
              <div className={styles.summaryProgressBlock}>
                <div className={styles.summaryProgress} style={{ width: percentList[0].clean + '%', backgroundColor: '#00c855' }} />
                <div className={styles.summaryProgress} style={{ width: percentList[0].mismatch + '%', backgroundColor: '#819ffc' }} />
                <div className={styles.summaryProgress} style={{ width: percentList[0].missing + '%', backgroundColor: '#ff97a7' }} />
                {problemType !== 'Classification' && <div className={styles.summaryProgress} style={{ width: percentList[0].outlier + '%', backgroundColor: '#f9cf37' }} />}
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
              <div className={styles.summaryCell}><span style={{ fontWeight: 'bold' }}>{EN.DataComposition} </span></div>
            </div>
          </div>
        </div>
        <div className={styles.summaryTable} style={{ overflow: 'scroll' }}>
          <div className={styles.summaryTableLeft}>
            {variableList.map((v, k) => {
              const percent = percentList[k + 1]
              return <div className={styles.summaryTableRow} key={k}>
                <div className={styles.summaryCell}><span>{mapHeader[v]}</span></div>
                <div className={styles.summaryCell}><span>{formatNumber(percent.clean.toString(), 2)}%</span></div>
              </div>
            })}
          </div>
          <div className={styles.summaryTableRight}>
            {variableList.map((v, k) => {
              const percent = percentList[k + 1]
              return <div className={styles.summaryTableRow} key={k}>
                <div className={styles.summaryProgressBlock}>
                  <div className={styles.summaryProgress} style={{ width: percent.clean + '%', backgroundColor: '#00c855' }} />
                  <div className={styles.summaryProgress} style={{ width: percent.mismatch + '%', backgroundColor: '#819ffc' }} />
                  <div className={styles.summaryProgress} style={{ width: percent.missing + '%', backgroundColor: '#ff97a7' }} />
                  {problemType !== 'Classification' && <div className={styles.summaryProgress} style={{ width: percent.outlier + '%', backgroundColor: '#f9cf37' }} />}
                </div>
              </div>
            })}
          </div>
        </div>
      </div>
      <div className={styles.summaryRight}>
        <div className={styles.summaryTitle}><span>{EN.HowR2LearnWillFixtheIssues}</span></div>
        <div className={styles.summaryPie}>
          {/*<div className={styles.summaryChart}>*/}
          {/*</div>*/}
          <PIE
            RowsWillBeFixed={fixedPercent}
            RowsWillBeDeleted={deletePercent}
            CleanData={cleanPercent}
          />
          <div className={styles.summaryParts}>
            <div className={styles.summaryPart}>
              <div className={styles.summaryPartText}>
                <div className={styles.summaryCube} style={{ backgroundColor: '#9cebff' }} />
                <span style={{ fontWeight: 'bold' }}>{EN.RowsWillBeFixed}</span>
              </div>
              <div className={styles.summaryPartText}>
                <div className={styles.summaryCube} />
                <span>{fixedPercent}%</span>
              </div>
            </div>
            <div className={styles.summaryPart}>
              <div className={styles.summaryPartText}>
                <div className={styles.summaryCube} style={{ backgroundColor: '#c4cbd7' }} />
                <span style={{ fontWeight: 'bold' }}>{EN.RowsWillBeDeleted}</span>
              </div>
              <div className={styles.summaryPartText}>
                <div className={styles.summaryCube} />
                <span>{deletePercent}%</span>
              </div>
            </div>
            <div className={styles.summaryPart}>
              <div className={styles.summaryPartText}>
                <div className={styles.summaryCube} style={{ backgroundColor: '#00c855' }} />
                <span style={{ fontWeight: 'bold' }}>{EN.CleanData}</span>
              </div>
              <div className={styles.summaryPartText}>
                <div className={styles.summaryCube} />
                <span>{cleanPercent}%</span>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.summaryBottom}>
          <div className={classnames(styles.summaryButton, styles.summaryConfirm, {
            [styles.disabled]: totalLines === 0
          })} onClick={totalLines === 0 ? null : this.startTrain}><span>{EN.Continue}</span></div>
          <div className={classnames(styles.summaryButton, {
            [styles.disabled]: !issues.dataIssue
          })} onClick={issues.dataIssue ? editFixes : null}><span>{EN.EditTheFixes}</span></div>
          <div className={styles.summaryButton} onClick={this.backToConnect}><span>{EN.LoadaBetterDataset}</span></div>
        </div>
      </div>
    </div>
  }
}

export default observer(Summary)