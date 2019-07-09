import { observer } from 'mobx-react';
import React, { Component } from 'react';
import styles from './styles.module.css';
import { formatNumber } from '../../../util';
import EN from '../../../constant/en';
import { PIE } from '../../Charts';
interface SummaryInterface {
  project:any
  editFixes:any
  dataIssue:any
  closeSummary:any
}

@observer
export default class Summary extends Component<SummaryInterface> {
  componentDidMount() {
    this.renderD3();
  }

  backToConnect = () => {
    const { updateProject, nextSubStep } = this.props.project;
    updateProject(nextSubStep(1, 2));
  };

  startTrain = () => {
    const { project } = this.props;
    return project.updateProject(project.nextMainStep(3));
  };

  renderD3 = () => {
    d3.select(`.${styles.summaryChart} svg`).remove();

    const outerRadius = 60; // 外半径
    const innerRadius = 0; // 内半径
    //弧生成器
    const arc = d3
      .arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);
    const { totalRawLines, deletedCount, totalFixedLines } = this.props.project;
    const deleteRows = deletedCount;
    const fixedRows = totalFixedLines - deletedCount;
    const cleanRows = totalRawLines - totalFixedLines;
    const data = [fixedRows, deleteRows, cleanRows];
    const color = ['#9cebff', '#c4cbd7', '#00c855'];
    const dataset = d3.pie()(data);

    const svg = d3
      .select(`.${styles.summaryChart}`)
      .append('svg')
      .attr('width', 120)
      .attr('height', 120);

    svg
      .selectAll(`g`)
      .data(dataset)
      .enter()
      .append('g')
      .attr('transform', 'translate(' + outerRadius + ',' + outerRadius + ')')
      .append('path')
      .attr('fill', (d, i) => color[i])
      .attr('d', d => {
        return arc(d); //调用弧生成器，得到路径值
      });
  };

  render() {
    const { project, editFixes } = this.props;
    const {
      mapHeader,
      dataHeader,
      totalRawLines,
      deletedCount,
      totalLines,
      problemType,
      variableIssueCount: { nullCount, mismatchCount, outlierCount },
      variableIssues: { nullRow, mismatchRow, outlierRow },
      totalFixedLines,
      issues,
    } = project;
    const deletePercent:any = formatNumber(String((deletedCount / totalRawLines) * 100), 2);
    const fixedPercent:any = formatNumber(
      String(((totalFixedLines - deletedCount) / totalRawLines) * 100),
      2,
    );
    const cleanPercent = formatNumber(String(100 - deletePercent - fixedPercent), 2);
    const variableList = dataHeader;
    const percentList = dataHeader.map(v => {
      const percent:any = {
        missing: nullRow[v] || 0,
        mismatch: mismatchRow[v] || 0,
        outlier: outlierRow[v] || 0,
      };
      percent.clean =
        100 - percent.missing - percent.mismatch - percent.outlier;
      return percent;
    });
    return (
      <div className={styles.summary}>
        <div className={styles.summaryLeft}>
          <div className={styles.summaryTitle}>
            <span>{EN.Summaryofyourdata}</span>
          </div>
          <div className={styles.summaryTypeBox}>
            {
              <div className={styles.summaryType}>
                <div
                  className={styles.summaryCube}
                  style={{ backgroundColor: '#00c855' }}
                />
                <span>{EN.CleanData}</span>
              </div>
            }
            {!!mismatchCount && (
              <div className={styles.summaryType}>
                <div
                  className={styles.summaryCube}
                  style={{ backgroundColor: '#819ffc' }}
                />
                <span>{EN.DataTypeMismatch}</span>
              </div>
            )}
            {!!nullCount && (
              <div className={styles.summaryType}>
                <div
                  className={styles.summaryCube}
                  style={{ backgroundColor: '#ff97a7' }}
                />
                <span>{EN.MissingValue}</span>
              </div>
            )}
            {problemType !== 'Outlier' && !!outlierCount && (
              <div className={styles.summaryType}>
                <div
                  className={styles.summaryCube}
                  style={{ backgroundColor: '#f9cf37' }}
                />
                <span>{EN.Outlier}</span>
              </div>
            )}
          </div>
          <div className={styles.summaryTable}>
            <div className={styles.summaryTableLeft}>
              <div className={styles.summaryTableRow}>
                <div className={styles.summaryCell}>
                  <span style={{ fontWeight: 'bold' }}>
                    {EN.PredictorVariables}
                  </span>
                </div>
                <div className={styles.summaryCell}>
                  <span style={{ fontWeight: 'bold' }}>{EN.CleanData}</span>
                </div>
              </div>
            </div>
            <div className={styles.summaryTableRight}>
              <div className={styles.summaryTableRow}>
                <div className={styles.summaryCell}>
                  <span style={{ fontWeight: 'bold' }}>
                    {EN.DataComposition}{' '}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.summaryTable} style={{ maxHeight: '4em' }}>
            <div className={styles.summaryTableLeft}>
              {variableList.map((v, k) => {
                const percent = percentList[k];
                return (
                  <div className={styles.summaryTableRow} key={k}>
                    <div className={styles.summaryCell}>
                      <span>{mapHeader[v]}</span>
                    </div>
                    <div className={styles.summaryCell}>
                      <span>{formatNumber(percent.clean, 2)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className={styles.summaryTableRight}>
              {variableList.map((v, k) => {
                const percent = percentList[k];
                return (
                  <div className={styles.summaryTableRow} key={k}>
                    <div className={styles.summaryProgressBlock}>
                      <div
                        className={styles.summaryProgress}
                        style={{
                          width: percent.clean + '%',
                          backgroundColor: '#00c855',
                        }}
                      />
                      <div
                        className={styles.summaryProgress}
                        style={{
                          width: percent.mismatch + '%',
                          backgroundColor: '#819ffc',
                        }}
                      />
                      <div
                        className={styles.summaryProgress}
                        style={{
                          width: percent.missing + '%',
                          backgroundColor: '#ff97a7',
                        }}
                      />
                      <div
                        className={styles.summaryProgress}
                        style={{
                          width: percent.outlier + '%',
                          backgroundColor: '#f9cf37',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className={styles.summaryRight}>
          <div className={styles.summaryTitle}>
            <span>{EN.HowR2LearnWillFixtheIssues}</span>
          </div>
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
                  <div
                    className={styles.summaryCube}
                    style={{ backgroundColor: '#9cebff' }}
                  />
                  <span style={{ fontWeight: 'bold' }}>
                    {EN.RowsWillBeFixed}
                  </span>
                </div>
                <div className={styles.summaryPartText}>
                  <div className={styles.summaryCube}/>
                  <span>{fixedPercent}%</span>
                </div>
              </div>
              <div className={styles.summaryPart}>
                <div className={styles.summaryPartText}>
                  <div
                    className={styles.summaryCube}
                    style={{ backgroundColor: '#c4cbd7' }}
                  />
                  <span style={{ fontWeight: 'bold' }}>
                    {EN.RowsWillBeDeleted}
                  </span>
                </div>
                <div className={styles.summaryPartText}>
                  <div className={styles.summaryCube}/>
                  <span>{deletePercent}%</span>
                </div>
              </div>
              <div className={styles.summaryPart}>
                <div className={styles.summaryPartText}>
                  <div
                    className={styles.summaryCube}
                    style={{ backgroundColor: '#00c855' }}
                  />
                  <span style={{ fontWeight: 'bold' }}>{EN.CleanData}</span>
                </div>
                <div className={styles.summaryPartText}>
                  <div className={styles.summaryCube}/>
                  <span>{cleanPercent}%</span>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.summaryBottom}>
            <div
              className={classnames(
                styles.summaryButton,
                styles.summaryConfirm,
                {
                  [styles.disabled]: totalLines === 0,
                },
              )}
              onClick={totalLines === 0 ? null : this.startTrain}
            >
              <span>{EN.Continue}</span>
            </div>
            <div
              className={classnames(styles.summaryButton, {
                [styles.disabled]: !issues.dataIssue,
              })}
              onClick={issues.dataIssue ? editFixes : null}
            >
              <span>{EN.EditTheFixes}</span>
            </div>
            <div className={styles.summaryButton} onClick={this.backToConnect}>
              <span>{EN.LoadaBetterDataset}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
