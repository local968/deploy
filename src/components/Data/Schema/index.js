import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer, inject } from 'mobx-react';
import { observable } from 'mobx'
import { Checkbox } from 'antd'
import { Select, ContinueButton, ProcessLoading, Table, Hint, HeaderInfo } from 'components/Common';

@inject('projectStore')
@observer
export default class DataSchema extends Component {
  @observable checkList = this.props.projectStore.project.sortHeader.filter(r => !this.props.projectStore.project.dataHeader.includes(r))
  @observable showSelect = false
  @observable dataType = { ...this.props.projectStore.project.colType }

  constructor(props) {
    super(props)
    this.tableRef = React.createRef();
  }

  doEtl = () => {
    const { project } = this.props.projectStore
    const { sortHeader, target } = project;
    const newDataHeader = sortHeader.filter(d => !this.checkList.includes(d));
    const data = {
      dataHeader: newDataHeader,
      colType: { ...this.dataType }
    }
    // 回归默认设置为drop
    if (target && this.dataType[target] === 'Numerical') {
      data.outlierFillMethod = { [target]: 'drop' }
      data.outlierFillMethodTemp = { [target]: 'drop' }
    }
    project.setProperty(data)
    project.endSchema()
  }

  targetSelect = (value) => {
    // const { colType } = this.props.projectStore.project
    this.props.projectStore.project.setProperty({ target: value })
    this.tableRef.current.updateGrids()
    // this.props.projectStore.project.updateProject(data).then(() => this.tableRef.current.updateGrids())
    this.checkList = [...this.checkList.filter(v => v !== value)]
  }

  checked = (key, e) => {
    const checked = e.target.checked
    if (!checked) {
      this.checkList = [...this.checkList, key]
    } else {
      this.checkList = [...this.checkList.filter(v => v !== key)]
    }
    this.tableRef.current.updateGrids()
  }

  select = (key, e) => {
    const v = e.target.value
    this.dataType[key] = v
    // this.props.projectStore.project.colType[key] = v
    this.tableRef.current.updateGrids()
  }

  toggleSelect = () => {
    this.showSelect = !this.showSelect
  }

  checkNoCompute = (e) => {
    this.props.projectStore.project.noComputeTemp = e.target.checked;
  }

  autoFix = () => {
    this.props.projectStore.project.autoFixHeader().then(() => this.tableRef.current.updateGrids())
  }

  formatTable = () => {
    const { target, headerTemp: { temp }, sortData, sortHeader, renameVariable, etling } = this.props.projectStore.project;
    if (etling) return []
    const { showSelect, checkList } = this
    if (!sortData.length) return []
    // return []
    // const { sortData, target, colType, sortHeader, headerTemp: {temp} } = this.props.project;
    // const { checkList, showSelect } = this.state;
    const headerList = [...sortHeader]
    // const notShowIndex = sortHeader.filter(v => !sortHeader.includes(v)).map(v => sortHeader.indexOf(v))
    const data = [...sortData]
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
      headerRow: 0 + (showSelect ? 1 : 0),
      selectRow: 1 + (showSelect ? 1 : 0),
      columnHeader: 1,
      rowHeader: 2 + (showSelect ? 1 : 0)
    }

    const realColumn = headerList.length + index.columnHeader

    const checkArr = []
    const headerArr = []
    const selectArr = []
    for (let i = 0; i < realColumn; i++) {
      const header = headerList[i - index.columnHeader] ? headerList[i - index.columnHeader].trim() : '';
      if (index.checkRow > -1) {
        const checkData = {
          content: '',
          title: '',
          cn: styles.check
        }
        if (i === index.columnHeader - 1) {
          checkData.content = "";
        } else {
          checkData.content = <Checkbox onChange={this.checked.bind(null, header)} checked={true}></Checkbox>
          if (target && target === header) {
            checkData.cn = classnames(styles.check, styles.target);
            checkData.content = "";
          }
          if (checkList.includes(header)) {
            checkData.cn = classnames(styles.check, styles.checked);
            checkData.content = <Checkbox onChange={this.checked.bind(null, header)} checked={false}></Checkbox>
          }
        }
        checkArr.push(checkData)
      }

      const headerData = {
        content: '',
        title: '',
        cn: styles.titleCell
      }
      if (i === index.columnHeader - 1) {
        headerData.content = <HeaderInfo row='Header' col='Row' style={{ margin: '-3px -.1em 0', height: '34px', width: '110px' }} rotate={15.739}/>
        headerData.title = '';
      } else {
        headerData.content = <EditHeader value={header} key={i - index.columnHeader} />
        headerData.title = header;
        if (target && target === header) {
          headerData.cn = classnames(headerData.cn, styles.target);
        }
        if (checkList.includes(header)) {
          headerData.cn = classnames(headerData.cn, styles.checked);
        }
        if (!header) {
          headerData.cn = classnames(headerData.cn, styles.missed);
        }
        if (header && temp[header].length > 1) {
          headerData.cn = classnames(headerData.cn, styles.duplicated);
        }
      }
      headerArr.push(headerData)

      const selectData = {
        content: '',
        title: '',
        cn: styles.check
      }
      if (i === index.columnHeader - 1) {
        selectData.content = "";
      } else {
        let key = header;
        if (!header) {
          key = `Unnamed: ${realColumn}`
        }
        if (header && temp[header].length > 1) {
          const tempIndex = temp[header].findIndex(c => c === realColumn);
          const suffix = tempIndex === 0 ? "" : '.' + tempIndex;
          key = header + suffix
        }
        const colValue = this.dataType[key] === 'Numerical' ? 'Numerical' : 'Categorical'
        selectData.content = <select value={colValue} onChange={this.select.bind(null, key)}>
          <option value="Categorical">Categorical</option>
          <option value="Numerical">Numerical</option>
        </select>
        selectData.title = colValue
        if (target && target === key) {
          selectData.cn = classnames(styles.cell, styles.target);
          selectData.content = <span>{colValue}</span>
        }

      }
      selectArr.push(selectData)
    }

    const tableData = data.map((row, rowIndex) => {
      const arr = []
      if (index.columnHeader > 0) {
        arr.push({
          content: <span>{rowIndex + 1}</span>,
          title: rowIndex + 1,
          cn: styles.cell
        })
      }
      const dataArr = row.map((v, k) => {
        const header = headerList[k] && headerList[k].trim();
        const itemData = {
          content: <span>{v}</span>,
          title: v,
          cn: styles.cell
        }
        // const cellValue = data[rowIndex][realColumn]
        if (target && target === header) {
          itemData.cn = classnames(itemData.cn, styles.target);
          itemData.content = <span>{renameVariable[v] || v}</span>;
          itemData.title = renameVariable[v] || v;
        }
        if (checkList.includes(header)) {
          itemData.cn = classnames(itemData.cn, styles.checked);
        }
        return itemData
      })
      return arr.concat(dataArr)
    })
    return [checkArr, headerArr, selectArr, ...tableData].filter(row => row.length === realColumn)
  }

  render() {
    const { project } = this.props.projectStore;
    const { etling, etlProgress, sortHeader, problemType, noComputeTemp, target, headerTemp: { isMissed, isDuplicated } } = project;
    const targetOption = {};
    const tableData = this.formatTable()
    const newDataHeader = sortHeader.filter(d => !this.checkList.includes(d));

    //target选择列表
    sortHeader.forEach(h => {
      h = h.trim()
      if (problemType === "Classification" && this.dataType[h] === "Categorical") targetOption[h] = h
      if (problemType === "Regression" && this.dataType[h] === "Numerical") targetOption[h] = h
    });

    return project && <div className={styles.schema}>
      <div className={styles.schemaInfo}>
        <div className={styles.schemaI}><span>i</span></div>
        <div className={styles.schemaText}>
          <span>If your data does not have a header, please reload one WITH A HEADER.</span>
          <span>Please select a variable as the target variable, and unselect the undesirable variables if necessary.</span>
        </div>
      </div>
      <div className={styles.schemaContent}>
        <div className={styles.schemaTools}>
          <Select
            title={"Target Variable"}
            dropdownClassName={"targetSelect"}
            autoWidth={"1.6em"}
            options={targetOption}
            onChange={this.targetSelect}
            value={target}
            disabled={isMissed || isDuplicated}
            selectOption={{ showSearch: true }}
          />
          {(isMissed || isDuplicated) ?
            <div className={classnames(styles.schemaSelect, styles.disabled)}>
              <span>Unselect Undesirable Variables</span>
            </div> :
            <div className={styles.schemaSelect} onClick={this.toggleSelect}>
              <span>Unselect Undesirable Variables</span>
            </div>
          }
          <Hint themeStyle={{ fontSize: '1.5rem', lineHeight: '2rem', display: 'flex', alignItems: 'center' }} content={<div>Unselect predictors that lead to less wanted modeling results, they could be: <br />1. Variable IDs <br />2. Variables that are derived from the target <br />3. Any other variables you don't need</div>} />
          {isMissed && <div className={styles.schemaMissed} >
            <div className={styles.errorBlock}></div>
            <span>Missing</span>
          </div>}
          {isDuplicated && <div className={styles.schemaDuplicated} >
            <div className={styles.errorBlock}></div>
            <span>Duplicated Header</span>
          </div>}
          {(isMissed || isDuplicated) && <div className={styles.schemaSelect} onClick={this.autoFix}>
            <span>Auto Header Repair</span>
          </div>}
        </div>
        <div className={styles.content}>
          <Table
            ref={this.tableRef}
            columnWidth={110}
            rowHeight={34}
            columnCount={sortHeader.length + 1}
            rowCount={tableData.length}
            fixedColumnCount={1}
            fixedRowCount={this.showSelect ? 3 : 2}
            checked={this.checked}
            select={this.select}
            style={{ border: "1px solid #ccc" }}
            data={tableData} />
        </div>
      </div>
      <div className={styles.bottom}>
        <ContinueButton onClick={this.doEtl} disabled={etling || !target || (newDataHeader.length <= 1 && newDataHeader.indexOf(target) > -1)} text="Continue" />
        <div className={styles.checkBox}><input type='checkbox' id='noCompute' onChange={this.checkNoCompute} checked={noComputeTemp} />
          <label htmlFor='noCompute'>Skip Data Quality Check</label>
          <Hint themeStyle={{ fontSize: '1.5rem', lineHeight: '2rem', display: 'flex', alignItems: 'center' }} content="If you know the data is clean, you can skip the data quality step." />
        </div>
      </div>
      {etling && <ProcessLoading progress={etlProgress} style={{ position: 'fixed' }} />}
    </div>
  }
}

//修改表头
class EditHeader extends Component {
  render() {
    const { value } = this.props
    return <span>{value}</span>
  }
}