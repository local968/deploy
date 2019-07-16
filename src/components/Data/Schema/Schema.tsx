import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import { observable } from 'mobx';
import { Checkbox, message } from 'antd';
import { Confirm, ContinueButton, HeaderInfo, Hint, ProcessLoading, Select, Show, Table } from 'components/Common';
import EN from '../../../constant/en';
import EditHeader from './EditHeader';
import { ProjectStore } from 'stores/ProjectStore';
import { UserStore } from 'stores/UserStore';
import { SocketStore } from 'stores/SocketStore';

type TableCell = {
  content: string | React.ReactElement;
  title: string;
  cn: string;
};

interface DataSchemaProps {
  projectStore: ProjectStore;
  userStore: UserStore;
  socketStore: SocketStore;
}

class DataSchema extends Component<DataSchemaProps> {
  @observable checkList = this.props.projectStore.project.rawHeader.filter(
    r => !this.props.projectStore.project.dataHeader.includes(r),
  );
  @observable showSelect = false;
  @observable dataType = { ...this.props.projectStore.project.colType };
  @observable visiable = false;
  @observable target = this.props.projectStore.project.target;
  tableRef: React.RefObject<Table>;

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
    const { rawHeader } = project;
    const newDataHeader = rawHeader.filter(d => !this.checkList.includes(d));
    const data: {
      target: string;
      dataHeader: string[];
      colType: StringObject;
      outlierFillMethod?: StringObject;
      outlierFillMethodTemp?: StringObject;
      nullFillMethod?: StringObject;
      nullFillMethodTemp?: StringObject;
    } = {
      target: this.target || '',
      dataHeader: newDataHeader,
      colType: { ...this.dataType },
    };
    // 回归默认设置为drop
    if (this.target && this.dataType[this.target] === 'Numerical') {
      data.outlierFillMethod = { [this.target]: 'drop' };
      data.outlierFillMethodTemp = { [this.target]: 'drop' };
      data.nullFillMethod = { [this.target]: 'drop' };
      data.nullFillMethodTemp = { [this.target]: 'drop' };
    } else {
      data.nullFillMethod = { [this.target]: 'drop' };
      data.nullFillMethodTemp = { [this.target]: 'drop' };
    }
    project.setProperty(data);
    try {
      this.props.projectStore.project.endSchema();
    } catch (e) {
      message.destroy();
      message.error(e);
    }
    this.onClose();
  };

  targetSelect = value => {
    const { role }  = this.props.userStore.info;
    const { schema_TargetVariable = true } = role as any;
    if (schema_TargetVariable) {
      this.target = value;
      this.tableRef.current.updateGrids();
      this.checkList = [...this.checkList.filter(v => v !== value)];
    }
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
      headerRow: (showSelect ? 1 : 0),
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
        const checkData: TableCell = {
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

      const headerData: TableCell = {
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

      const selectData: TableCell = {
        content: '',
        title: '',
        cn: styles.check,
      };
      if (i === index.columnHeader - 1) {
        selectData.content = '';
      } else {
        let key = header;
        // if (!headerText) {
        //   key = `Unnamed: ${realColumn}`
        // }
        // if (header && temp[header] && temp[header].length > 1) {
        //   const tempIndex = temp[header].findIndex(c => c === realColumn);
        //   const suffix = tempIndex === 0 ? "" : '.' + tempIndex;
        //   key = header + suffix
        // }
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
      const arr: TableCell[] = [];
      if (index.columnHeader > 0) {
        arr.push({
          content: <span>{rowIndex + 1}</span>,
          title: (rowIndex + 1).toString(),
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
        // const cellValue = data[rowIndex][realColumn]
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
      etling,
      etlProgress,
      rawHeader,
      problemType,
      noComputeTemp,
      headerTemp: { isMissed, isDuplicated },
      mapHeader,
    } = project;
    const targetOption = {};
    const tableData = this.formatTable();
    const newDataHeader = rawHeader.filter(d => !this.checkList.includes(d));

    //target选择列表
    rawHeader.forEach(h => {
      h = h.trim();
      if (
        problemType === 'Classification' &&
        this.dataType[h] === 'Categorical'
      )
        targetOption[h] = mapHeader[h];
      if (problemType === 'Regression' && this.dataType[h] === 'Numerical')
        targetOption[h] = mapHeader[h];
    });
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
                width={'1.6em'}
                options={targetOption}
                onChange={this.targetSelect}
                value={this.target}
                disabled={isMissed || isDuplicated}
                selectOption={{ showSearch: true }}
                getPopupContainer={() =>
                  document.getElementById('schemaContent')
                }
              />
              <Show
                name = 'schema_VariableSelection'
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
                  <div className={styles.errorBlock} />
                  <span>{EN.Missing}</span>
                </div>
              )}
              {isDuplicated && (
                <div className={styles.schemaDuplicated}>
                  <div className={styles.errorBlock} />
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
            <Show
              name='schema_continue'
            >
              <ContinueButton
                onClick={this.doEtl}
                disabled={
                  etling ||
                  !this.target ||
                  (newDataHeader.length <= 1 &&
                    newDataHeader.indexOf(this.target) > -1)
                }
                text={EN.Continue}
                width={null}
              />
            </Show>

            <Show
              name = 'schema_SkipDataQualityCheck'
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

export default inject('projectStore', 'userStore')(observer(DataSchema));