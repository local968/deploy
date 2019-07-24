import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import { ContinueButton, Modal, ProcessLoading, Show } from 'components/Common';
import { observable } from 'mobx';
import ClassificationTarget from './Issues/ClassificationTarget';
import RegressionTarget from './Issues/RegressionTarget';
import RowIssue from './Issues/RowIssue';
import DataIssue from './Issues/DataIssue';
import FixIssue from './Issues/FixIssue';
import SelectTarget from './Issues/SelectTarget';
import { message } from 'antd';
import { formatNumber } from '../../../util';
import EN from '../../../constant/en';
import Project from 'stores/Project';

interface TargetIssueProps {
  project: Project;
  changeTab: () => void;
}

@observer
class TargetIssue extends Component<TargetIssueProps> {
  @observable visible = false;
  @observable edit = false;

  backToConnect = () => {
    const { updateProject, nextSubStep } = this.props.project;
    return updateProject(nextSubStep(1, 2));
  };

  backToSchema = () => {
    const { updateProject, nextSubStep } = this.props.project;
    return updateProject(nextSubStep(2, 2));
  };

  editFixes = () => {
    this.visible = true;
  };

  closeFixes = () => {
    this.visible = false;
  };

  editTarget = () => {
    this.edit = true;
  };

  closeTarget = () => {
    this.edit = false;
  };

  saveTargetFixes = () => {
    this.props.project.fixTarget();

    message.destroy();
    message.info(EN.Thechangeswillbeappliedintrainingsection, 5);
    this.closeTarget();
  };

  saveDataFixes = () => {
    this.props.project.fixFillMethod();
    message.info(EN.Thechangeswillbeappliedintrainingsection, 5);
    this.closeFixes();
  };

  render() {
    const { project, changeTab } = this.props;
    const {
      issues,
      uploadData,
      mapHeader,
      target,
      colType,
      rawHeader,
      nullLineCounts,
      mismatchLineCounts,
      outlierLineCounts,
      totalRawLines,
      totalLines,
      etling,
      etlProgress,
      renameVariable,
      targetCounts,
      rawDataView,
      targetIssuesCountsOrigin,
      targetArrayTemp,
      targetUnique
    } = project;
    const targetUniques = targetUnique || NaN
    const targetIndex = rawHeader.findIndex(h => h === target);
    const isNum = colType[target] === 'Numerical';
    const recomm = !isNum ? 2 : Math.min((rawHeader.length - 1) * 6, 1000);
    const nullCount = Number.isInteger(nullLineCounts[target]) ? nullLineCounts[target] : 0;
    const mismatchCount = isNum ? mismatchLineCounts[target] : 0;
    const outlierCount = isNum ? outlierLineCounts[target] : 0;
    const targetPercent = {
      missing:
        nullCount === 0
          ? 0
          : (nullCount * 100) / (totalRawLines || 1) < 0.01
            ? '<0.01'
            : formatNumber(
              ((nullCount * 100) / (totalRawLines || 1)).toString(),
              2,
            ),
      mismatch:
        mismatchCount === 0
          ? 0
          : (mismatchCount * 100) / (totalRawLines || 1) < 0.01
            ? '<0.01'
            : formatNumber(
              ((mismatchCount * 100) / (totalRawLines || 1)).toString(),
              2,
            ),
      outlier:
        outlierCount === 0
          ? 0
          : (outlierCount * 100) / (totalRawLines || 1) < 0.01
            ? '<0.01'
            : formatNumber(
              ((outlierCount * 100) / (totalRawLines || 1)).toString(),
              2,
            ),
    };
    const warnings: string[] = [];
    const unique = rawDataView[target].uniqueValues;
    // const unique = targetArrayTemp.length || Object.keys(targetCounts).filter(k => k !== '').length
    if (!isNum) {
      const curUnique = targetArrayTemp.length || Object.keys(targetCounts).filter(k => k !== '').length
      const hasNull = !targetArrayTemp.length ? !!nullCount : false;
      const isNa = isNaN(targetUniques)
      if (hasNull)
        warnings.push(isNa ? EN.Thetargetvariablehassomenoise : `${EN.YourtargetvariableHas}${EN.Thantwouniquealues}`);
      if (curUnique < targetUniques && !hasNull)
        warnings.push(targetUniques === 2 ? `${EN.YourtargetvariableHas}${EN.onlyOnevalue}` : `error`);
      if (curUnique === targetUniques && !hasNull) {
        const min = Math.min(...Object.values(targetCounts));
        if (min < 3) warnings.push(EN.Itisrecommendedthatyou);
      }
    }
    if ((nullLineCounts[target] ? nullLineCounts[target] : 0) === totalRawLines)
      warnings.push(EN.Yourtargetvariableisempty);
    const cannotContinue =
      !!warnings.length ||
      (!isNum && issues.targetIssue);
    const isClean =
      !warnings.length &&
      !issues.targetIssue &&
      !issues.rowIssue &&
      !(issues.targetRowIssue);
    return (
      <div className={styles.quality}>
        <div className={styles.issue}>
          {!!warnings.length && (
            <div className={styles.issueTitle}>
              <span>{EN.Warning}!</span>
            </div>
          )}
          {!!warnings.length && (
            <div className={styles.issueBox}>
              {warnings.map((v, k) => (
                <div className={styles.issueText} key={k}>
                  <div className={styles.point} />
                  <span>{v}</span>
                </div>
              ))}
            </div>
          )}
          {(issues.targetIssue ||
            issues.rowIssue ||
            issues.targetRowIssue) && (
              <div className={styles.issueTitle}>
                <span>
                  {EN.IssueS}
                  {+issues.targetIssue +
                    +issues.rowIssue +
                    +issues.targetRowIssue >
                    1 && EN.SS}{' '}
                  {EN.Found}!
              </span>
              </div>
            )}
          {(issues.targetIssue ||
            issues.rowIssue ||
            issues.targetRowIssue) && (
              <div className={styles.issueBox}>
                {issues.targetIssue && (
                  <div className={styles.issueText}>
                    <div className={styles.point} />
                    {!isNum ? (
                      <span>
                        {EN.Yourtargetvariablehasmorethantwouniquevalues}
                      </span>
                    ) : (
                        <span>
                          {EN.Yourtargetvariablehaslessthan}
                          {recomm}
                          {EN.Uniquevalueswhichisnot}
                        </span>
                      )}
                  </div>
                )}
                {issues.rowIssue && (
                  <div className={styles.issueText}>
                    <div className={styles.point} />
                    <span>{EN.Datasizeistoosmall}</span>
                  </div>
                )}
                {issues.targetRowIssue && (
                  <div className={styles.issueText}>
                    <div className={styles.point} />
                    <span>{EN.Somedataissueshighlightedincolor}</span>
                  </div>
                )}
              </div>
            )}
          {isClean && (
            <div className={styles.cleanTitle}>
              <span>{EN.Targetvariablequalitylooksgood}</span>
            </div>
          )}
        </div>
        <div className={styles.typeBox}>
          {!!mismatchCount && (
            <div className={styles.type}>
              <div
                className={classnames(styles.typeBlock, styles.mismatch)}
              />
              <span>{EN.DataTypeMismatch}</span>
            </div>
          )}
          {!!nullCount && (
            <div className={styles.type}>
              <div
                className={classnames(styles.typeBlock, styles.missing)}
              />
              <span>{EN.MissingValue}</span>
            </div>
          )}
          {!!outlierCount && (
            <div className={styles.type}>
              <div
                className={classnames(styles.typeBlock, styles.outlier)}
              />
              <span>{EN.Outlier}</span>
            </div>
          )}
          <div className={styles.issueTabs}>
            <div
              className={styles.issueTab}
              style={{ borderBottomColor: '#1d2b3c' }}
            >
              <span style={{ fontWeight: 'bold' }}>{EN.TargetVariable}</span>
            </div>
            <div
              className={styles.issueTab}
              onClick={cannotContinue ? null : changeTab}
            >
              <span>{EN.PredictorVariables}</span>
            </div>
          </div>
        </div>
        <div className={styles.contentBox}>
          <div className={styles.list}>
            <div className={styles.table}>
              <div className={classnames(styles.cell, styles.target)}>
                <span>{EN.TargetVariable}</span>
              </div>
              <div className={classnames(styles.cell, styles.label)}>
                <span>{mapHeader[target]}</span>
              </div>
              <div className={classnames(styles.cell, styles.select)}>
                <span>{isNum ? EN.Numerical : EN.Categorical}</span>
              </div>
              <div className={classnames(styles.cell, styles.error)}>
                {!!targetPercent.mismatch && (
                  <div
                    className={classnames(styles.errorBlock, styles.mismatch)}
                  >
                    <span>{targetPercent.mismatch}%</span>
                  </div>
                )}
                {!!targetPercent.missing && (
                  <div
                    className={classnames(styles.errorBlock, styles.missing)}
                  >
                    <span>{targetPercent.missing}%</span>
                  </div>
                )}
                {!!targetPercent.outlier && (
                  <div
                    className={classnames(styles.errorBlock, styles.outlier)}
                  >
                    <span>{targetPercent.outlier}%</span>
                  </div>
                )}
              </div>
              <div className={styles.tableBody}>
                {!!uploadData.length &&
                  uploadData.map((r, k) => {
                    const v = r[targetIndex];
                    const { low = NaN, high = NaN } = rawDataView[target];
                    const isMissing = isNaN(+v) ? !v : false;
                    const isMismatch = isNum ? isNaN(+v) : false;
                    const isOutlier = isNum ? +v < low || +v > high : false;
                    return (
                      <div
                        key={k}
                        className={classnames(styles.cell, {
                          [styles.mismatch]: isMismatch,
                          [styles.missing]: isMissing,
                          [styles.outlier]: isOutlier,
                        })}
                      >
                        <span title={renameVariable[v] || v}>
                          {renameVariable[v] || v}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
            <Show
              name='quality_continue'
            >
              <ContinueButton
                disabled={cannotContinue}
                onClick={changeTab}
                text={EN.Continue}
                width="100%"
              />
            </Show>

          </div>
          <div className={styles.content}>
            {!isNum ? (
              <ClassificationTarget
                project={project}
                backToConnect={this.backToConnect}
                backToSchema={this.backToSchema}
                editTarget={this.editTarget}
              />
            ) : (
                <RegressionTarget
                  backToConnect={this.backToConnect}
                  backToSchema={this.backToSchema}
                  hasIssue={issues.targetIssue}
                  unique={unique}
                  recomm={recomm}
                />
              )}
            {issues.rowIssue && (
              <RowIssue
                backToConnect={this.backToConnect}
                totalRawLines={totalRawLines}
              />
            )}
            {issues.targetRowIssue && (
              <DataIssue
                backToConnect={this.backToConnect}
                editFixes={this.editFixes}
                targetIssuesCountsOrigin={targetIssuesCountsOrigin}
                totalRawLines={totalRawLines}
                totalLines={totalLines}
                percent={targetPercent}
              />
            )}
          </div>
          <Modal
            content={
              <FixIssue
                project={project}
                nullCount={targetIssuesCountsOrigin.nullRow}
                mismatchCount={targetIssuesCountsOrigin.mismatchRow}
                outlierCount={targetIssuesCountsOrigin.outlierRow}
                closeFixes={this.closeFixes}
                saveDataFixes={this.saveDataFixes}
                isTarget={true}
              />
            }
            visible={this.visible}
            width="12em"
            title={EN.HowR2LearnWillFixtheIssues}
            onClose={this.closeFixes}
            closeByMask={true}
            showClose={true}
          />
          <Modal
            content={
              <SelectTarget
                project={project}
                closeTarget={this.closeTarget}
                saveTargetFixes={this.saveTargetFixes}
              />
            }
            visible={this.edit}
            width="5.5em"
            title={EN.HowR2LearnWillFixtheIssues}
            onClose={this.closeTarget}
            closeByMask={true}
            showClose={true}
          />
        </div>
        {etling && (
          <ProcessLoading
            progress={etlProgress}
            style={{ position: 'fixed' }}
          />
        )}
      </div>
    );
  }
}

export default observer(TargetIssue);
