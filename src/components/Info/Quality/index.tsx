import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer, inject } from 'mobx-react';
import {
  ContinueButton,
  Modal,
  ProcessLoading,
  Table,
  Show,
  Confirm,
} from 'components/Common';
import { observable } from 'mobx';
import {
  ClassificationTarget,
  RowIssue,
  FixIssue,
  SelectTarget,
} from './TargetIssue';
import { message } from 'antd';
import * as d3 from 'd3';
import { formatNumber } from '../../../util';
import EN from '../../../constant/en';
import { PIE } from '../../Charts';
import _ from 'lodash';
import { ProjectStore } from 'stores/ProjectStore';
import Project from 'stores/Project';

interface DataQualityInterface {
  projectStore: ProjectStore;
}

@inject('projectStore')
@observer
export default class DataQuality extends Component<DataQualityInterface> {
  @observable step = 1;

  changeTab = value => {
    const { problemType } = this.props.projectStore.project;
    if (problemType === 'Clustering') return;
    this.step = value;
  };

  render() {
    const { project } = this.props.projectStore;
    const { problemType, target } = project;
    if (problemType === 'Clustering' || !target)
      return <VariableIssue project={project} hasTab={false} />;
    return this.step === 1 ? (
      <TargetIssue project={project} changeTab={this.changeTab.bind(null, 2)} />
    ) : (
        <VariableIssue
          project={project}
          changeTab={this.changeTab.bind(null, 1)}
          hasTab={true}
        />
      );
  }
}

interface TargetIssueInterface {
  project: Project
  changeTab: () => void
}
@observer
class TargetIssue extends Component<TargetIssueInterface> {
  @observable visible = false;
  @observable edit = false;

  backToConnect = () => {
    const { updateProject, nextSubStep } = this.props.project;
    updateProject(nextSubStep(1, 2));
  };

  backToSchema = () => {
    const { updateProject, nextSubStep } = this.props.project;
    updateProject(nextSubStep(2, 2));
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
      sortData,
      mapHeader,
      target,
      colType,
      sortHeader,
      nullLineCounts,
      mismatchLineCounts,
      outlierLineCounts,
      totalRawLines,
      etling,
      etlProgress,
      renameVariable,
      targetCounts,
      rawDataView,
      targetIssuesCountsOrigin,
      targetArrayTemp,
    } = project;
    const targetIndex = sortHeader.findIndex(h => h === target);
    const isNum = colType[target] === 'Numerical';
    const nullCount = Number.isInteger(nullLineCounts[target])
      ? nullLineCounts[target]
      : 0;
    const mismatchCount =
      isNum && Number.isInteger(mismatchLineCounts[target])
        ? mismatchLineCounts[target]
        : 0;
    const outlierCount =
      isNum && Number.isInteger(outlierLineCounts[target])
        ? outlierLineCounts[target]
        : 0;
    const targetPercent = {
      missing:
        nullCount === 0
          ? 0
          : (nullCount * 100) / (totalRawLines || 1) < 0.01
            ? '<0.01'
            : formatNumber(String((nullCount * 100) / (totalRawLines || 1)), 2),
      mismatch:
        mismatchCount === 0
          ? 0
          : (mismatchCount * 100) / (totalRawLines || 1) < 0.01
            ? '<0.01'
            : formatNumber(String((mismatchCount * 100) / (totalRawLines || 1)), 2),
      outlier:
        outlierCount === 0
          ? 0
          : (outlierCount * 100) / (totalRawLines || 1) < 0.01
            ? '<0.01'
            : formatNumber(String((outlierCount * 100) / (totalRawLines || 1)), 2),
    };
    const warnings = [];
    const unique = targetArrayTemp.length || rawDataView[target].uniqueValues;
    const hasNull = !targetArrayTemp.length ? !!nullCount : false;
    if (unique > 2 || hasNull)
      warnings.push(`${EN.YourtargetvariableHas}${EN.Thantwouniquealues}`);
    if (unique < 2 && !hasNull)
      warnings.push(`${EN.YourtargetvariableHas}${EN.onlyOnevalue}`);
    if (unique === 2 && !hasNull) {
      const min = _.min([...Object.values(targetCounts)]);
      if (min < 3) warnings.push(EN.Itisrecommendedthatyou);
    }
    if ((nullLineCounts[target] ? nullLineCounts[target] : 0) === totalRawLines)
      warnings.push(EN.Yourtargetvariableisempty);
    const cannotContinue = !!warnings.length || issues.targetIssue;
    const isClean = !warnings.length && !issues.targetIssue && !issues.rowIssue;
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
          {(issues.targetIssue || issues.rowIssue) && (
            <div className={styles.issueTitle}>
              <span>
                {EN.IssueS}
                {+issues.targetIssue + +issues.rowIssue + +issues.targetRowIssue >
                  1 && EN.SS}{' '}
                {EN.Found}!
              </span>
            </div>
          )}
          {(issues.targetIssue || issues.rowIssue) && (
            <div className={styles.issueBox}>
              {issues.targetIssue && (
                <div className={styles.issueText}>
                  <div className={styles.point} />
                  <span>{EN.Yourtargetvariablehasmorethantwouniquevalues}</span>
                </div>
              )}
              {issues.rowIssue && (
                <div className={styles.issueText}>
                  <div className={styles.point} />
                  <span>{EN.Datasizeistoosmall}</span>
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
                {!!sortData.length &&
                  sortData.map((r, k) => {
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
            <ContinueButton
              disabled={cannotContinue}
              onClick={changeTab}
              text={EN.Continue}
              width="100%"
            />
          </div>
          <div className={styles.content}>
            <ClassificationTarget
              project={project}
              backToConnect={this.backToConnect}
              backToSchema={this.backToSchema}
              editTarget={this.editTarget}
            />
            {issues.rowIssue && (
              <RowIssue
                backToConnect={this.backToConnect}
                totalRawLines={totalRawLines}
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

interface InterfaceVariableIssue {
  project: Project
  changeTab?: () => void
  hasTab: boolean
}

@observer
class VariableIssue extends Component<InterfaceVariableIssue> {
  @observable visible = false;
  @observable summary = false;
  @observable warning = false;

  backToConnect = () => {
    const { updateProject, nextSubStep } = this.props.project;
    updateProject(nextSubStep(1, 2));
  };

  editFixes = () => {
    this.visible = true;
    this.closeSummary();
  };

  closeFixes = () => {
    this.visible = false;
  };

  showSummary = () => {
    const { project } = this.props;
    if (!project.qualityHasChanged) return (this.summary = true);
    if (project.train2ing || !!project.models.length)
      return (this.warning = true);
    this.onConfirm();
  };

  closeSummary = () => {
    this.summary = false;
  };

  saveDataFixes = () => {
    this.props.project.fixFillMethod();
    message.info(EN.Thechangeswillbeappliedintrainingsection, 5);
    this.closeFixes();
  };

  onClose = () => {
    this.warning = false;
  };

  onConfirm = () => {
    this.props.project
      .endQuality()
      .then(() => (this.summary = true))
      .catch(() => { });
    this.onClose();
  };

  formatTable = () => {
    const {
      colType,
      uploadData,
      rawHeader,
      dataHeader,
      etling,
      rawDataView,
      variableIssues,
      problemType,
      mapHeader,
    } = this.props.project;
    if (etling) return [];
    if (!uploadData.length) return [];
    const headerList = [...dataHeader];
    const notShowIndex = rawHeader
      .filter(v => !headerList.includes(v))
      .map(v => rawHeader.indexOf(v));
    const data = uploadData.map(row =>
      row.filter((k, i) => !notShowIndex.includes(i)),
    );
    /**
     * 根据showSelect, indexPosition变化
     * showSelect: true  显示勾选框
     * checkRow: 勾选框的行数
     * headerRow: 标题的行数
     * selectRow: 类型选择的行数
     * columnHeader: 表头的列数
     * rowHeader: 表头的行数
     */
    const realColumn = headerList.length;

    const indexArr = [];
    const headerArr = [];
    const selectArr = [];
    const issueArr = [];
    for (let i = 0; i < realColumn; i++) {
      const header = headerList[i] ? headerList[i].trim() : '';
      const headerText = mapHeader[header];
      indexArr.push({
        content: <span>{i + 1}</span>,
        title: i + 1,
        cn: styles.cell,
      });

      headerArr.push({
        content: <span>{headerText}</span>,
        title: headerText,
        cn: styles.titleCell,
      });

      const colValue =
        colType[header] === 'Numerical' ? 'Numerical' : 'Categorical';
      selectArr.push({
        content: (
          <span>
            {colValue === 'Numerical' ? EN.Numerical : EN.Categorical}
          </span>
        ),
        title: colValue === 'Numerical' ? EN.Numerical : EN.Categorical,
        cn: styles.cell,
      });
      const issues = [];
      const isNum = colType[header] === 'Numerical';

      if (isNum && variableIssues.mismatchRow[header]) {
        issues.push(
          <div
            className={classnames(styles.errorBlock, styles.mismatch)}
            key={'mismatch' + header}
          >
            <span>
              {variableIssues.mismatchRow[header] < 0.01
                ? '<0.01'
                : formatNumber(variableIssues.mismatchRow[header], 2)}
              %
            </span>
          </div>,
        );
      }
      if (variableIssues.nullRow[header]) {
        issues.push(
          <div
            className={classnames(styles.errorBlock, styles.missing)}
            key={'missing' + header}
          >
            <span>
              {variableIssues.nullRow[header] < 0.01
                ? '<0.01'
                : formatNumber(variableIssues.nullRow[header], 2)}
              %
            </span>
          </div>,
        );
      }
      if (isNum && variableIssues.outlierRow[header]) {
        issues.push(
          <div
            className={classnames(styles.errorBlock, styles.outlier)}
            key={'outlier' + header}
          >
            <span>
              {variableIssues.outlierRow[header] < 0.01
                ? '<0.01'
                : formatNumber(variableIssues.outlierRow[header], 2)}
              %
            </span>
          </div>,
        );
      }
      const issueData = {
        content: <div className={styles.errorBox}>{issues}</div>,
        title: '',
        cn: styles.cell,
      };
      issueArr.push(issueData);
    }
    const tableData = data.map((row) =>
      row.map((v, k) => {
        const header = headerList[k] && headerList[k].trim();
        const itemData = {
          content: <span>{v}</span>,
          title: v,
          cn: styles.cell,
        };

        const isNum = colType[header] === 'Numerical';
        const { low = NaN, high = NaN } = isNum ? rawDataView[header] : {};
        const isMissing = isNaN(+v) ? !v : false;
        const isMismatch = isNum ? isNaN(+v) : false;
        const isOutlier =
          problemType === 'Clustering' && isNum ? +v < low || +v > high : false;

        if (isMissing) {
          itemData.cn = classnames(itemData.cn, styles.missing);
        }
        if (isMismatch) {
          itemData.cn = classnames(itemData.cn, styles.mismatch);
        }
        if (isOutlier) {
          itemData.cn = classnames(itemData.cn, styles.outlier);
        }
        return itemData;
      }),
    );
    return [indexArr, headerArr, selectArr, issueArr, ...tableData].filter(
      row => row.length === realColumn,
    );
  };

  render() {
    const { project, changeTab, hasTab } = this.props;
    const {
      dataHeader,
      etling,
      etlProgress,
      variableIssueCount: { nullCount, mismatchCount, outlierCount },
      totalRawLines,
      problemType,
    } = project;
    const rowIssue = totalRawLines < 1000;
    const dataIssue = +nullCount + +mismatchCount + +outlierCount > 0;
    const tableData = this.formatTable();

    return (
      <div className={styles.quality}>
        <div className={styles.issue}>
          {rowIssue || dataIssue ? (
            <div className={styles.issueTitle}>
              <span>
                {EN.IssueS}
                {+rowIssue + +dataIssue > 1 && EN.SS} {EN.Found}!
              </span>
            </div>
          ) : (
              <div className={styles.cleanTitle}>
                <span>{EN.VariableQualitylooksgood}</span>
              </div>
            )}
          <div className={styles.issueBox}>
            {rowIssue && (
              <div className={styles.issueText}>
                <div className={styles.point} />
                <span className={styles.limitText}>
                  {EN.Foryourwholedataset}
                </span>
                <Show
                  name='quality_LoadaNewDataset_UN'
                >
                  <div
                    className={styles.button} onClick={this.backToConnect}>
                    <button>
                      <span>{EN.LoadaNewDataset}</span>
                    </button>
                  </div>
                </Show>
              </div>
            )}
            {dataIssue && (
              <div className={styles.issueText}>
                <div className={styles.point} />
                <span className={styles.limitText}>
                  {EN.SomeissuesarefoundR2learnhasgenerated}
                </span>
                <Show
                  name='quality_EditTheFixes_UN'
                >
                  <div
                    className={styles.button} onClick={this.editFixes}>
                    <button>
                      <span>{EN.EditTheFixes}</span>
                    </button>
                  </div>
                </Show>

              </div>
            )}
          </div>
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
          {problemType === 'Outlier' && (
            <div className={styles.issueTabs}>
              {hasTab && <div className={styles.issueTab} onClick={changeTab}>
                <span>{EN.TargetVariable}</span>
              </div>}
              <div
                className={styles.issueTab}
                style={{ borderBottomColor: '#1d2b3c' }}
              >
                <span style={{ fontWeight: 'bold' }}>
                  {EN.PredictorVariables}
                </span>
              </div>
            </div>
          )}
        </div>
        <div className={styles.variableIssue}>
          <div className={styles.contentBox}>
            <Table
              columnWidth={160}
              rowHeight={34}
              columnCount={dataHeader.length}
              rowCount={tableData.length}
              fixedColumnCount={0}
              fixedRowCount={4}
              checked={null}
              select={null}
              style={{ border: '1px solid #ccc' }}
              data={tableData}
            />
          </div>
          <Show
            name='quality_continue_UN'
          >
            <div className={styles.variableBottom}>
              <ContinueButton
                onClick={this.showSummary}
                text={EN.Continue}
                width="15%"
              />
            </div>
          </Show>

        </div>
        {etling && (
          <ProcessLoading
            progress={etlProgress}
            style={{ position: 'fixed' }}
          />
        )}
        <Modal
          content={
            <FixIssue
              project={project}
              nullCount={nullCount}
              mismatchCount={mismatchCount}
              outlierCount={outlierCount}
              closeFixes={this.closeFixes}
              saveDataFixes={this.saveDataFixes}
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
            <Summary
              project={project}
              editFixes={this.editFixes}
              dataIssue={dataIssue}
              closeSummary={this.closeSummary}
            />
          }
          visible={this.summary}
          width="12em"
          title={EN.HowR2LearnWillFixtheIssues}
          onClose={this.closeSummary}
          closeByMask={true}
          showClose={true}
        />
        {
          <Confirm
            width={'6em'}
            visible={this.warning}
            title={EN.Warning}
            content={EN.Thisactionmaywipeoutallofyourprevious}
            onClose={this.onClose}
            onConfirm={this.onConfirm}
            confirmText={EN.Continue}
            closeText={EN.CANCEL}
          />
        }
      </div>
    );
  }
}
interface SummaryInterface {
  project: Project
  editFixes: () => void
  dataIssue: boolean
  closeSummary: () => void
}
@observer
class Summary extends Component<SummaryInterface> {
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
    const deletePercent: any = formatNumber(String((deletedCount / totalRawLines) * 100), 2);
    const fixedPercent: any = formatNumber(
      String(((totalFixedLines - deletedCount) / totalRawLines) * 100),
      2,
    );
    const cleanPercent = formatNumber(String(100 - deletePercent - fixedPercent), 2);
    const variableList = dataHeader;
    const percentList = dataHeader.map(v => {
      const percent: any = {
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
                  <div className={styles.summaryCube} />
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
                  <div className={styles.summaryCube} />
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
                  <div className={styles.summaryCube} />
                  <span>{cleanPercent}%</span>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.summaryBottom}>
            <Show
              name='quality_WillFixtheIssues_Continue_UN'
            >
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
            </Show>

            <Show
              name='quality_WillFixtheIssues_EdittheFixes'
            >
              <div
                className={classnames(styles.summaryButton, {
                  [styles.disabled]: !issues.dataIssue,
                })}
                onClick={issues.dataIssue ? editFixes : null}
              >
                <span>{EN.EditTheFixes}</span>
              </div>
            </Show>

            <Show
              name='quality_LoadaBetterDataset_UN'
            >
              <div className={styles.summaryButton} onClick={this.backToConnect}>
                <span>{EN.LoadaBetterDataset}</span>
              </div>
            </Show>
          </div>
        </div>
      </div>
    );
  }
}
