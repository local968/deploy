import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer, inject } from 'mobx-react';
import { observable } from 'mobx'
import { Checkbox } from 'antd'
import { Select, ContinueButton, ProcessLoading, Table, Hint, HeaderInfo, Confirm } from 'components/Common';
import EN from '../../../constant/en';

@inject('projectStore')
@observer
export default class DataSchema extends Component {
  @observable checkList = this.props.projectStore.project.rawHeader.filter(r => !this.props.projectStore.project.dataHeader.includes(r))
  @observable showSelect = false
  @observable dataType = { ...this.props.projectStore.project.colType }
  @observable visiable = false

  constructor(props) {
    super(props)
    this.tableRef = React.createRef();
  }

  doEtl = () => {
    const { project } = this.props.projectStore
    const { rawHeader } = project;
    const newDataHeader = rawHeader.filter(d => !this.checkList.includes(d));
    const data = {
      dataHeader: newDataHeader,
      colType: { ...this.dataType }
    }
    console.log([...rawHeader], [...project.dataHeader], [...this.checkList],newDataHeader, 'adasdqadas')
    project.setProperty(data)
    if (project.train2ing || !!project.models.length) return this.visiable = true
    this.onConfirm()
  }

  onClose = () => {
    this.visiable = false
  }

  onConfirm = () => {
    this.props.projectStore.project.endSchema()
    this.onClose()
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
    const { headerTemp: { temp }, uploadData, rawHeader, renameVariable, etling } = this.props.projectStore.project;
    if (etling) return []
    const { showSelect, checkList } = this
    if (!uploadData.length) return []
    // return []
    // const { sortData, target, colType, sortHeader, headerTemp: {temp} } = this.props.project;
    // const { checkList, showSelect } = this.state;
    const headerList = rawHeader
    // const notShowIndex = sortHeader.filter(v => !sortHeader.includes(v)).map(v => sortHeader.indexOf(v))
    const data = uploadData
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
        headerData.content = <HeaderInfo row='Header' col='Row' style={{ margin: '-3px -.1em 0', height: '34px', width: '110px' }} rotate={15.739} />
        headerData.title = '';
      } else {
        headerData.content = <EditHeader value={header} key={i - index.columnHeader} />
        headerData.title = header;
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
          <option value="Categorical">{EN.Categorical}</option>
          <option value="Numerical">{EN.Numerical}</option>
        </select>
        selectData.title = colValue === 'Numerical' ? EN.Numerical : EN.Categorical
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
    const { etling, etlProgress, rawHeader, noComputeTemp, headerTemp: { isMissed, isDuplicated } } = project;
    const tableData = this.formatTable()
    const newDataHeader = rawHeader.filter(d => !this.checkList.includes(d));

    return project && <div className={styles.schema}>
      <div className={styles.schemaInfo}>
        <div className={styles.schemaI}><span>i</span></div>
        <div className={styles.schemaText}>
          <span>{EN.Ifyourdatadoesnothaveaheader}</span>
          <span>{EN.Pleaseselectavariableasthetargetvariable}</span>
        </div>
      </div>
      <div className={styles.schemaContent} id='schemaContent'>
        <div className={styles.schemaTools}>
          {(isMissed || isDuplicated) ?
            <div className={classnames(styles.schemaSelect, styles.disabled)}>
              <span>{EN.UnselectUndesirableVariables}</span>
            </div> :
            <div className={styles.schemaSelect} onClick={this.toggleSelect}>
              <span>{EN.UnselectUndesirableVariables}</span>
            </div>
          }
          <Hint themeStyle={{ fontSize: '1.5rem', lineHeight: '2rem', display: 'flex', alignItems: 'center' }} content={<div>{EN.Unselectpredictorsthatleadtolesswantedmodeling} <br />{EN.VariableIDs} <br />{EN.Variablesthatarederivedfromthetarget} <br />{EN.Anyothervariablesyou
          }</div>} />
          {isMissed && <div className={styles.schemaMissed} >
            <div className={styles.errorBlock}></div>
            <span>{EN.Missing}</span>
          </div>}
          {isDuplicated && <div className={styles.schemaDuplicated} >
            <div className={styles.errorBlock}></div>
            <span>{EN.DuplicatedHeader}</span>
          </div>}
          {(isMissed || isDuplicated) && <div className={styles.schemaSelect} onClick={this.autoFix}>
            <span>{EN.AutoHeaderRepair}</span>
          </div>}
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
            style={{ border: "1px solid #ccc" }}
            data={tableData} />
        </div>
      </div>
      <div className={styles.bottom}>
        <ContinueButton onClick={this.doEtl} disabled={etling || (newDataHeader.length < 1)} text={EN.Continue} />
        <div className={styles.checkBox}><input type='checkbox' id='noCompute' onChange={this.checkNoCompute} checked={noComputeTemp} />
          <label htmlFor='noCompute'>{EN.SkipDataQualityCheck}</label>
          <Hint themeStyle={{ fontSize: '1.5rem', lineHeight: '2rem', display: 'flex', alignItems: 'center' }} content={EN.Ifyouknowthedataisclean} />
        </div>
      </div>
      {etling && <ProcessLoading progress={etlProgress} style={{ position: 'fixed' }} />}
      {<Confirm width={'6em'} visible={this.visiable} title={EN.Warning} content={EN.Thisactionmaywipeoutallofyourprevious} onClose={this.onClose} onConfirm={this.onConfirm} confirmText={EN.Continue} closeText={EN.Cancel} />}
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
