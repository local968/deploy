import React, { Component } from 'react';
import styles from '../styles.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { formatNumber } from '../../../../util'
import EN from '../../../../constant/en';

interface DataIssueProps {
  backToConnect: () => void,
  editFixes: () => void,
  targetIssuesCountsOrigin: {
    nullRow: number,
    mismatchRow: number,
    outlierRow: number
  },
  totalLines: number,
  percent: {
    missing: number | string,
    mismatch: number | string,
    outlier: number | string
  },
  totalRawLines: number
}

export class DataIssue extends Component<DataIssueProps> {
  render() {
    const { backToConnect, editFixes, targetIssuesCountsOrigin, totalLines, percent, totalRawLines } = this.props;

    return <div className={styles.block}>
      <div className={styles.name}><span>{EN.Dataissuesarefound}</span></div>
      <div className={styles.desc}>
        <div className={styles.info}>
          <div className={styles.progressBox}>
            {!!targetIssuesCountsOrigin.nullRow && <div className={styles.issueBlock}>
              <div className={styles.left}>
                <div className={styles.issueRow}><span>{EN.MissingValueS}({targetIssuesCountsOrigin.nullRow} {EN.Rows}) {formatNumber(percent.missing.toString(), 2)}%</span></div>
                <div className={classnames(styles.progress, styles.missing)} style={{ width: ((typeof percent.missing === 'number') ? percent.missing : 1) + "%" }}/>
              </div>
            </div>}
            {!!targetIssuesCountsOrigin.mismatchRow && <div className={styles.issueBlock}>
              <div className={styles.left}>
                <div className={styles.issueRow}><span>{EN.mismatch}({targetIssuesCountsOrigin.mismatchRow} {EN.Rows}) {formatNumber(percent.mismatch.toString(), 2)}%</span></div>
                <div className={classnames(styles.progress, styles.mismatch)} style={{ width: ((typeof percent.mismatch === 'number') ? percent.mismatch : 1) + "%" }}/>
              </div>
            </div>}
            {!!targetIssuesCountsOrigin.outlierRow && <div className={styles.issueBlock}>
              <div className={styles.left}>
                <div className={styles.issueRow}><span>{EN.outlierRow} ({targetIssuesCountsOrigin.outlierRow} {EN.Rows}) {formatNumber(percent.outlier.toString(), 2)}%</span></div>
                <div className={classnames(styles.progress, styles.outlier)} style={{ width: ((typeof percent.outlier === 'number') ? percent.outlier : 1) + "%" }}/>
              </div>
            </div>}
          </div>
          {(totalRawLines > 1000 && totalLines < 1000) && <div className={styles.progressBox}>
            <div className={styles.progressText}><span>{EN.CleanDataS}({totalLines} {EN.Rows})</span><span>{EN.Rowsminimum}</span></div>
            <div className={styles.progress} style={{ width: totalLines / 10 + "%" }}/>
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

export default observer(DataIssue)
