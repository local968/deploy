import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import { observable } from 'mobx';
import { Checkbox, Icon, message } from 'antd';
import { Confirm, ContinueButton, HeaderInfo, Hint, ProcessLoading, Select, Table } from 'components/Common';
import EN from '../../../constant/en';
import { Show } from '../../Common';

interface Interface {
  projectStore: any
  userStore:any
}

@inject('projectStore','userStore')
@observer
export default class DataSchema extends Component<Interface> {
  @observable checkList = this.props.projectStore.project.rawHeader.filter(
    r =>
      !this.props.projectStore.project.dataHeader.includes(r) &&
      r !== this.props.projectStore.project.target,
  );
  @observable showSelect = false;
  @observable dataType = { ...this.props.projectStore.project.colType };
  @observable visiable = false;
  @observable target = this.props.projectStore.project.target;
  private readonly tableRef: React.RefObject<any>;

  constructor(props) {
    super(props);
    this.tableRef = React.createRef();
  }

  doEtl = () => {
    const { project } = this.props.projectStore;
    if (project.train2ing || !!project.models.length)
      return (this.visiable = true);
    this.onConfirm();
  };

  onClose = () => {
    this.visiable = false;
  };

  onConfirm = () => {
    const { project } = this.props.projectStore;
    const { rawHeader, problemType, outlierLineCounts } = project;
    const newDataHeader = rawHeader.filter(
      d => !this.checkList.includes(d) && d !== this.target,
    );
    const data = {
      target: this.target || '',
      dataHeader: newDataHeader,
      colType: { ...this.dataType },
      outlierFillMethod: {},
      outlierFillMethodTemp: {},
      nullFillMethod: {},
      nullFillMethodTemp: {},
    };
    if (problemType === 'Clustering') {
      const outlierFillMethod = newDataHeader.reduce((prev, h) => {
        if (this.dataType[h] === 'Numerical' && !!outlierLineCounts[h])
          prev[h] = 'drop';
        return prev;
      }, {});
      data.outlierFillMethod = outlierFillMethod;
      data.outlierFillMethodTemp = outlierFillMethod;
    }
    if (problemType === 'Outlier' && this.target) {
      data.nullFillMethod = { [this.target]: 'drop' };
      data.nullFillMethodTemp = { [this.target]: 'drop' };
    }
    project.setProperty(data);
    try {
      this.props.projectStore.project.endSchema();
    } catch (e) {
      message.error(e);
    }
    this.onClose();
  };

  checked = (key, e) => {
    const checked = e.target.checked;
    if (!checked) {
      this.checkList = [...this.checkList, key];
    } else {
      this.checkList = [...this.checkList.filter(v => v !== key)];
    }
    this.tableRef.current.updateGrids();
  };

  targetSelect = value => {
    const {role} = this.props.userStore.info as any;
    const {schema_TargetVariable_UN=true} = role;
    if(schema_TargetVariable_UN) {
      this.target = value;
      this.tableRef.current.updateGrids();
      this.checkList = [...this.checkList.filter(v => v !== value)];
    }
  };

  select = (key, e) => {
    this.dataType[key] = e.target.value;
    this.tableRef.current.updateGrids();
  };

  toggleSelect = () => {
    this.showSelect = !this.showSelect;
  };

  checkNoCompute = e => {
    this.props.projectStore.project.noComputeTemp = e.target.checked;
  };

  autoFix = () => {
    this.props.projectStore.project
      .autoFixHeader()
      .then(() => this.tableRef.current.updateGrids());
  };

  formatTable = () => {
    const { target } = this;
    const {
      uploadData,
      rawHeader,
      renameVariable,
      etling,
      mapHeader,
      headerTemp: { temp },
    } = this.props.projectStore.project;
    if (etling) return [];
    const { showSelect, checkList } = this;
    if (!uploadData.length) return [];
    // return []
    // const { sortData, target, colType, sortHeader, headerTemp: {temp} } = this.props.project;
    // const { checkList, showSelect } = this.state;
    const headerList = target
      ? [target, ...rawHeader.filter(v => v !== target)]
      : rawHeader;
    const targetIndex = target ? rawHeader.indexOf(target) : -1;
    // const notShowIndex = sortHeader.filter(v => !sortHeader.includes(v)).map(v => sortHeader.indexOf(v))
    const data =
      targetIndex > -1
        ? uploadData.map(row => {
            const value = row[targetIndex];
            return [
              value,
              ...row.slice(0, targetIndex),
              ...row.slice(targetIndex + 1),
            ];
          })
        : uploadData;
    // if(!sortData.length) return []
    /**
     * 根据showSelect, indexPosition变化
     * showSelect: true  显示勾选框
     * checkRow: 勾选框的行数
     * headerRow: 标题的行数
     * selectRow: 类型选择的行数
     * columnHeader: 表头的列数
     * rowHeader: 表头的行数
     */
    const index = {
      checkRow: -1 + (showSelect ? 1 : 0),
      headerRow: showSelect ? 1 : 0,
      selectRow: 1 + (showSelect ? 1 : 0),
      columnHeader: 1,
      rowHeader: 2 + (showSelect ? 1 : 0),
    };

    const realColumn = headerList.length + index.columnHeader;

    const checkArr = [];
    const headerArr = [];
    const selectArr = [];
    for (let i = 0; i < realColumn; i++) {
      const header = headerList[i - index.columnHeader]
        ? headerList[i - index.columnHeader].trim()
        : '';
      if (index.checkRow > -1) {
        const checkData:any = {
          content: '',
          title: '',
          cn: styles.check,
        };
        if (i === index.columnHeader - 1) {
          checkData.content = '';
        } else {
          checkData.content = (
            <Checkbox
              onChange={this.checked.bind(null, header)}
              checked={true}
            />
          );
          if (target && target === header) {
            checkData.cn = classnames(styles.check, styles.target);
            checkData.content = '';
          }
          if (checkList.includes(header)) {
            checkData.cn = classnames(styles.check, styles.checked);
            checkData.content = (
              <Checkbox
                onChange={this.checked.bind(null, header)}
                checked={false}
              />
            );
          }
        }
        checkArr.push(checkData);
      }

      const headerData:any = {
        content: '',
        title: '',
        cn: styles.titleCell,
      };
      if (i === index.columnHeader - 1) {
        headerData.content = (
          <HeaderInfo
            row={EN.Header}
            col={EN.Row}
            style={{ margin: '-3px -.1em 0', height: '34px', width: '110px' }}
            rotate={15.739}
          />
        );
        headerData.title = '';
      } else {
        const headerText = mapHeader[header];
        headerData.content = (
          <EditHeader value={headerText} key={i - index.columnHeader} />
        );
        headerData.title = headerText;
        if (target && target === header) {
          headerData.cn = classnames(headerData.cn, styles.target);
        }
        if (checkList.includes(header)) {
          headerData.cn = classnames(headerData.cn, styles.checked);
        }
        if (!headerText) {
          headerData.cn = classnames(headerData.cn, styles.missed);
        }
        if (headerText && temp[headerText] && temp[headerText].length > 1) {
          headerData.cn = classnames(headerData.cn, styles.duplicated);
        }
      }
      headerArr.push(headerData);

      const selectData:any = {
        content: '',
        title: '',
        cn: styles.check,
      };
      if (i === index.columnHeader - 1) {
        selectData.content = '';
      } else {
        let key = header;
        const canTransforToCategorical =
          this.props.projectStore.project.rawDataView[key].doubleUniqueValue <
          Math.min(
            this.props.projectStore.project.rawDataView[key].count * 0.1,
            1000,
          );
        const colValue = this.dataType[key];
        selectData.content = (
          <select value={colValue} onChange={this.select.bind(null, key)}>
            {!canTransforToCategorical && (
              <option value="Raw">{EN.Categorical}(Raw)</option>
            )}
            {canTransforToCategorical && (
              <option value="Categorical">{EN.Categorical}</option>
            )}
            <option value="Numerical">{EN.Numerical}</option>
          </select>
        );
        selectData.title = {
          Numerical: EN.Numerical,
          Categorical: EN.Categorical,
          Raw: EN.Categorical + '(Raw)',
        }[colValue];
        if (target && target === key) {
          selectData.cn = classnames(styles.cell, styles.target);
          selectData.content = (
            <span>
              {
                {
                  Numerical: EN.Numerical,
                  Categorical: EN.Categorical,
                  Raw: EN.Categorical + '(Raw)',
                }[colValue]
              }
            </span>
          );
        }
      }
      selectArr.push(selectData);
    }

    const tableData = data.map((row, rowIndex) => {
      const arr = [];
      if (index.columnHeader > 0) {
        arr.push({
          content: <span>{rowIndex + 1}</span>,
          title: rowIndex + 1,
          cn: styles.cell,
        });
      }
      const dataArr = row.map((v, k) => {
        const header = headerList[k] && headerList[k].trim();
        const itemData = {
          content: <span>{v}</span>,
          title: v,
          cn: styles.cell,
        };
        if (target && target === header) {
          itemData.cn = classnames(itemData.cn, styles.target);
          itemData.content = <span>{renameVariable[v] || v}</span>;
          itemData.title = renameVariable[v] || v;
        }
        if (checkList.includes(header)) {
          itemData.cn = classnames(itemData.cn, styles.checked);
        }
        return itemData;
      });
      return arr.concat(dataArr);
    });
    return [checkArr, headerArr, selectArr, ...tableData].filter(
      row => row.length === realColumn,
    );
  };

  render() {
    const { project } = this.props.projectStore;
    const {
      mapHeader,
      etling,
      etlProgress,
      rawHeader,
      noComputeTemp,
      headerTemp: { isMissed, isDuplicated },
      problemType,
    } = project;
    const tableData = this.formatTable();
    const newDataHeader = rawHeader.filter(d => !this.checkList.includes(d));

    //target选择列表
    const targetOption = rawHeader.reduce((prev, h) => {
      h = h.trim();
      if (this.dataType[h] === 'Categorical') prev[h] = mapHeader[h];
      return prev;
    }, {});
    const {role} = this.props.userStore.info as any;
    const {schema_continue_UN=true} = role;

    return (
      project && (
        <div className={styles.schema}>
          <div className={styles.schemaInfo}>
            <div className={styles.schemaI}>
              <span>i</span>
            </div>
            <div className={styles.schemaText}>
              <span>{EN.Pleaseselectavariableasthetargetvariable}</span>
            </div>
          </div>
          <div className={styles.schemaContent} id="schemaContent">
            <div className={styles.schemaTools}>
              <Select
                title={EN.TargetVariable}
                dropdownClassName={'targetSelect'}
                autoWidth={'1.6em'}
                options={targetOption}
                onChange={this.targetSelect}
                value={this.target}
                disabled={isMissed || isDuplicated}
                selectOption={{
                  showSearch: true,
                  allowClear: !!this.target,
                  clearIcon: <Icon type="close" />,
                }}
                getPopupContainer={() =>
                  document.getElementById('schemaContent')
                }
              />
              <Hint
                themeStyle={{
                  fontSize: '1.5rem',
                  lineHeight: '2rem',
                  display: 'flex',
                  alignItems: 'center',
                }}
                content={EN[`${problemType}Target`]}
              />
              <Show
                name = 'schema_VariableSelection_UN'
              >
                {isMissed || isDuplicated ? (
                  <div
                    className={classnames(styles.schemaSelect, styles.disabled)}
                  >
                    <span>{EN.UnselectUndesirableVariables}</span>
                  </div>
                ) : (
                  <div
                    className={styles.schemaSelect}
                    onClick={this.toggleSelect}
                  >
                    <span>{EN.UnselectUndesirableVariables}</span>
                  </div>
                )}
                <Hint
                  themeStyle={{
                    fontSize: '1.5rem',
                    lineHeight: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  content={
                    <div>
                      {EN.Unselectpredictorsthatleadtolesswantedmodeling} <br />
                      {EN.VariableIDs} <br />
                      {EN.Variablesthatarederivedfromthetarget} <br />
                      {EN.Anyothervariablesyou}
                    </div>
                  }
                />
              </Show>

              {isMissed && (
                <div className={styles.schemaMissed}>
                  <div className={styles.errorBlock}/>
                  <span>{EN.Missing}</span>
                </div>
              )}
              {isDuplicated && (
                <div className={styles.schemaDuplicated}>
                  <div className={styles.errorBlock}/>
                  <span>{EN.DuplicatedHeader}</span>
                </div>
              )}
              {(isMissed || isDuplicated) && (
                <div className={styles.schemaSelect} onClick={this.autoFix}>
                  <span>{EN.AutoHeaderRepair}</span>
                </div>
              )}
            </div>
            <div className={styles.content}>
              <Table
                ref={this.tableRef}
                columnWidth={110}
                rowHeight={34}
                columnCount={rawHeader.length + 1}
                rowCount={tableData.length}
                fixedColumnCount={1}
                fixedRowCount={this.showSelect ? 3 : 2}
                checked={this.checked}
                select={this.select}
                style={{ border: '1px solid #ccc' }}
                data={tableData}
              />
            </div>
          </div>
          <div className={styles.bottom}>
            <ContinueButton
              onClick={this.doEtl}
              disabled={
                etling || newDataHeader.length < 1 || isMissed || isDuplicated
              }
              text={EN.Continue}
              show={schema_continue_UN}
            />
            <Show
              name = 'schema_SkipDataQualityCheck_UN'
            >
              <div className={styles.checkBox}>
                <input
                  type="checkbox"
                  id="noCompute"
                  onChange={this.checkNoCompute}
                  checked={noComputeTemp}
                />
                <label htmlFor="noCompute">{EN.SkipDataQualityCheck}</label>
                <Hint
                  themeStyle={{
                    fontSize: '1.5rem',
                    lineHeight: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  content={EN.Ifyouknowthedataisclean}
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
          {
            <Confirm
              width={'6em'}
              visible={this.visiable}
              title={EN.Warning}
              content={EN.Thisactionmaywipeoutallofyourprevious}
              onClose={this.onClose}
              onConfirm={this.onConfirm}
              confirmText={EN.Continue}
              closeText={EN.Cancel}
            />
          }
        </div>
      )
    );
  }
}

interface EditHeaderInterface {
  value:string
}
//修改表头
class EditHeader extends Component<EditHeaderInterface> {
  render() {
    const { value } = this.props;
    return <span>{value}</span>;
  }
}