import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import { ContinueButton, Modal, ProcessLoading, Switch, Table, Confirm, Show } from 'components/Common';
import { observable } from 'mobx';
import FixIssue from './Issues/FixIssue'
import Summary from './Summary'
import { message } from 'antd'
import { formatNumber } from '../../../util'
import EN from '../../../constant/en';
import Project from 'stores/Project';

interface VariableIssueProps {
  project: Project,
  changeTab: () => void,
}

@observer
class VariableIssue extends Component<VariableIssueProps> {
  @observable visible = false;
  @observable summary = false;
  @observable warning = false;
  @observable missing = [];
  @observable mismatch = [];
  @observable outlier = [];
  @observable multiMode = false;

  backToConnect = () => {
    const { updateProject, nextSubStep } = this.props.project;
    return updateProject(nextSubStep(1, 2));
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
      deleteColumns,
      etling,
      rawDataView,
      variableIssues,
      problemType,
      mapHeader,
      target,
      reloadData
    } = this.props.project;
    const updateCondition = (column, type) => () => {
      const index = this[type].indexOf(column)
      if ( index !== -1 ) this[type].splice(index,1)
      if(!this.multiMode) {
        this.missing = []
        this.mismatch = []
        this.outlier = []
      }
      if( index === -1 ) this[type].push(column)
      reloadData(0, 500, this.missing, this.mismatch, this.outlier)
    }
    if (etling) return [];
    // if (!uploadData.length) return [];
    const headerList = rawHeader.filter(h => h !== target && (dataHeader.includes(h) || deleteColumns.includes(h)))
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
            className={styles.errorBlock}
            key={'mismatch' + header}
            onClick={updateCondition(header, 'mismatch')}
          >
            <div className={styles.issueBackground}>
              <div className={styles.mismatch}></div>
              <div className={classnames({[styles.issueActive]: this.mismatch.indexOf(header) !== -1 })}></div>
            </div>
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
            className={styles.errorBlock}
            key={'missing' + header}
            onClick={updateCondition(header, 'missing')}
          >
            <div className={styles.issueBackground}>
              <div className={styles.missing}></div>
              <div className={classnames({[styles.issueActive]: this.missing.indexOf(header) !== -1 })}></div>
            </div>
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
            className={styles.errorBlock}
            key={'outlier' + header}
            onClick={updateCondition(header, 'outlier')}
          >
            <div className={styles.issueBackground}>
              <div className={styles.outlier}></div>
              <div className={classnames({[styles.issueActive]: this.outlier.indexOf(header) !== -1 })}></div>
            </div>
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
        const isMismatch = isNum ? isNaN(+v) || isNaN(parseFloat(v.toString())) : false;
        const isOutlier =
          (problemType === 'Clustering' && isNum) ? +v < low || +v > high : false;
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

  toggleMultiMode = () => {
    this.multiMode = !this.multiMode
    this.missing = []
    this.mismatch = []
    this.outlier = []
  }

  render() {
    const { project, changeTab } = this.props;
    const {
      target,
      issues,
      dataHeader,
      etling,
      etlProgress,
      deleteColumns,
      variableIssueCount: { nullCount, mismatchCount, outlierCount },
    } = project;
    const header = [...dataHeader.filter(h => h !== target), ...deleteColumns]
    const tableData = this.formatTable();
    return (
      <div className={styles.quality}>
        <div className={styles.issue}>
          {issues.rowIssue || issues.dataIssue ? (
            <div className={styles.issueTitle}>
              <span>
                {EN.IssueS}
                {+issues.rowIssue + +issues.dataIssue > 1 && EN.SS} {EN.Found}!
              </span>
            </div>
          ) : (
              <div className={styles.cleanTitle}>
                <span>{EN.VariableQualitylooksgood}</span>
              </div>
            )}
          <div className={styles.issueBox}>
            {issues.rowIssue && (
              <div className={styles.issueText}>
                <div className={styles.point} />
                <span className={styles.limitText}>
                  {EN.Foryourwholedataset}
                </span>
                <Show
                  name='quality_Predict_LoadaNewDataset'
                >
                  <div
                    className={styles.button}
                    onClick={this.backToConnect}
                  >
                    <button>
                      <span>{EN.LoadaNewDataset}</span>
                    </button>
                  </div>
                </Show>
              </div>
            )}
            {issues.dataIssue && (
              <div className={styles.issueText}>
                <div className={styles.point} />
                <span className={styles.limitText}>
                  {EN.SomeissuesarefoundR2learnhasgenerated}
                </span>
                <Show
                  name='quality_Predict_EdittheFixes'
                >
                  <div
                    className={styles.button}
                    onClick={this.editFixes}
                  >
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
          {!!mismatchCount || !!nullCount || !!outlierCount || <div className={styles.multiMode}>
              <span>{EN.MultiMode}</span>
              <Switch
                checked={this.multiMode}
                onChange={this.toggleMultiMode}
              />
            </div>}
          {(project.problemType !== 'Clustering' && !!target) && <div className={styles.issueTabs}>
            <div className={styles.issueTab} onClick={changeTab}>
              <span>{EN.TargetVariable}</span>
            </div>
            <div
              className={styles.issueTab}
              style={{ borderBottomColor: '#1d2b3c' }}
            >
              <span style={{ fontWeight: 'bold' }}>
                {EN.PredictorVariables}
              </span>
            </div>
          </div>}
        </div>
        <div className={styles.variableIssue}>
          <div className={styles.contentBox}>
            <Table
              columnWidth={160}
              rowHeight={34}
              columnCount={header.length}
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
            name='quality_Predict_Continue'
          >
            <div
              className={styles.variableBottom}
            >
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
              isTarget={false}
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
          content={<Summary project={project} editFixes={this.editFixes} />}
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

export default observer(VariableIssue)
