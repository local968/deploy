import React, { Component } from 'react';
import styles from './Summary.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { formatNumber } from '../../util'
import EN from '../../constant/en';
import {
  PIE
} from "../Charts"
import { ProcessLoading } from '../Common'

export interface SummaryProps {
  summary: {
    totalFixedCount?: number
    deletedCount?: number
    featureLabel?: string[]
    colType?: StringObject
    nullLineCounts?: NumberObject
    mismatchLineCounts?: NumberObject
    outlierLineCounts?: NumberObject
    dataView?: any
    totalCount?: number,
    target?: string,
    problemType?: string,
    mapHeader?: string[]
  },
  loading: boolean
  onClose: () => void
}

class Summary extends Component<SummaryProps> {

  render() {
    const { summary, onClose, loading } = this.props;
    if (loading) return <div className={styles.loading}>
      <ProcessLoading style={{ backgroundColor: '#fff' }} />
    </div>
    const {
      totalFixedCount,
      deletedCount,
      featureLabel,
      colType,
      nullLineCounts,
      mismatchLineCounts,
      outlierLineCounts,
      totalCount,
      target,
      problemType,
      mapHeader
    } = summary
    const deletePercent = formatNumber((deletedCount / totalCount * 100).toString(), 2)
    const fixedPercent = formatNumber(((totalFixedCount - deletedCount) / totalCount * 100).toString(), 2)
    const cleanPercent = formatNumber((100 - +deletePercent - +fixedPercent).toString(), 2)
    const isUnsupervised = ['Clustering', 'Outlier'].includes(problemType);
    const variableList = featureLabel.filter(h => h !== target)
    const percentList = variableList.map(v => {
      const percent: {
        missing: number
        mismatch: number
        outlier: number
        clean?: number
      } = {
        missing: nullLineCounts[v] / totalCount * 100,
        mismatch: (colType[v] === 'Numerical' ? mismatchLineCounts[v] : 0) / totalCount * 100,
        outlier: ((problemType === 'Clustering' && colType[v] === 'Numerical') ? outlierLineCounts[v] : 0) / totalCount * 100,
      }
      percent.clean = 100 - percent.missing - percent.mismatch - percent.outlier
      return percent
    })
    const targetPercent = {
      classesError: 0,
      missing: 0,
      mismatch: 0,
      outlier: 0,
    }
    if (!!target) {
      targetPercent.missing = nullLineCounts[target] / totalCount * 100
      targetPercent.mismatch = (colType[target] === 'Numerical' ? mismatchLineCounts[target] : 0) / totalCount * 100
      targetPercent.outlier = (colType[target] === 'Numerical' ? outlierLineCounts[target] : 0) / totalCount * 100
    }

    let nullCount = false
    let mismatchCount = false
    let outlierCount = false

    percentList.forEach(p => {
      if (!nullCount && p.missing > 0) nullCount = true
      if (!mismatchCount && p.mismatch > 0) mismatchCount = true
      if (!outlierCount && p.outlier > 0) outlierCount = true
    })

    return <div className={styles.summary}>
      <div className={styles.summaryLeft}>
        <div className={styles.summaryTitle}><span>{EN.Summaryofyourdata}</span></div>
        <div className={styles.summaryTypeBox}>
          <div className={styles.summaryType}>
            <div className={styles.summaryCube} style={{ backgroundColor: '#00c855' }} />
            <span>{EN.CleanData}</span>
          </div>
          {!!targetPercent.classesError && <div className={styles.summaryType}>
            <div className={styles.summaryCube} style={{ backgroundColor: '#e72424' }} />
            <span>{EN.TargetClassesError}</span>
          </div>}
          {(!!targetPercent.mismatch || !!mismatchCount) && <div className={styles.summaryType}>
            <div className={styles.summaryCube} style={{ backgroundColor: '#819ffc' }} />
            <span>{EN.DataTypeMismatch}</span>
          </div>}
          {(!!targetPercent.missing || !!nullCount) && <div className={styles.summaryType}>
            <div className={styles.summaryCube} style={{ backgroundColor: '#ff97a7' }} />
            <span>{EN.MissingValue}</span>
          </div>}
          {(!!targetPercent.outlier || !!outlierCount) && <div className={styles.summaryType}>
            <div className={styles.summaryCube} style={{ backgroundColor: '#f9cf37' }} />
            <span>{EN.Outlier}</span>
          </div>}
        </div>
        {!isUnsupervised && <div className={styles.summaryTable}>
          <div className={styles.summaryTableLeft}>
            <div className={styles.summaryTableRow}>
              <div className={styles.summaryCell}><span style={{ fontWeight: 'bold' }}>{EN.TargetVariable}</span></div>
              <div className={styles.summaryCell}><span style={{ fontWeight: 'bold' }}>{EN.CleanData}</span></div>
            </div>
            <div className={styles.summaryTableRow}>
              <div className={styles.summaryCell}><span>{mapHeader[target]}</span></div>
              <div className={styles.summaryCell}><span>{formatNumber((100 - targetPercent.classesError - targetPercent.missing - targetPercent.mismatch - targetPercent.outlier).toString(), 2)}%</span></div>
            </div>
          </div>
          <div className={styles.summaryTableRight}>
            <div className={styles.summaryTableRow}>
              <div className={styles.summaryCell}><span style={{ fontWeight: 'bold' }}>{EN.DataComposition} </span></div>
            </div>
            <div className={styles.summaryTableRow}>
              <div className={styles.summaryProgressBlock}>
                <div className={styles.summaryProgress} style={{ width: (100 - targetPercent.classesError - targetPercent.missing - targetPercent.mismatch - targetPercent.outlier) + '%', backgroundColor: '#00c855' }} />
                <div className={styles.summaryProgress} style={{ width: targetPercent.mismatch + '%', backgroundColor: '#819ffc' }} />
                <div className={styles.summaryProgress} style={{ width: targetPercent.missing + '%', backgroundColor: '#ff97a7' }} />
                <div className={styles.summaryProgress} style={{ width: targetPercent.classesError + '%', backgroundColor: '#e72424' }} />
                <div className={styles.summaryProgress} style={{ width: targetPercent.outlier + '%', backgroundColor: '#f9cf37' }} />
              </div>
            </div>
          </div>
        </div>}
        <div className={styles.summaryTable} style={{ paddingRight: '.2em', maxHeight: isUnsupervised ? '4em' : '3em', marginTop: isUnsupervised ? '10px' : 0 }}>
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
        <div className={styles.summaryTable}>
          <div className={styles.summaryTableLeft}>
            {variableList.map((v, k) => {
              const percent = percentList[k]
              return <div className={styles.summaryTableRow} key={k}>
                <div className={styles.summaryCell}><span>{mapHeader[v]}</span></div>
                <div className={styles.summaryCell}><span>{formatNumber(percent.clean.toString(), 2)}%</span></div>
              </div>
            })}
          </div>
          <div className={styles.summaryTableRight}>
            {variableList.map((v, k) => {
              const percent = percentList[k]
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
          <div className={classnames(styles.summaryButton, styles.summaryConfirm)} onClick={onClose}><span>{EN.Close}</span></div>
        </div>
      </div>
    </div>
  }
}

export default observer(Summary)
