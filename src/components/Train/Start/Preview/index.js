import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Icon, Tooltip } from 'antd';
import { observable, autorun } from 'mobx';
import { Table } from 'components/Common';
import EN from '../../../../constant/en';

import dataIcon from './data.svg';
import axios from 'axios';

@observer
export default class Preview extends Component {
  @observable cleanData = []
  @observable newVariableData = []
  @observable loading = false

  constructor(props) {
    super(props)
    const { readIndex, etlIndex, fetchData } = props.project;
    readIndex(etlIndex).then(data => {
      this.cleanData = data
    })
    autorun(() => {
      if (!props.project.newVariablePath) return
      this.loading = true
      fetchData(props.project.newVariablePath).then(data => {
        this.loading = false
        this.newVariableData = data
      })
    })
  }



  formatTable = () => {
    const { cleanData, newVariableData } = this
    const { visiable, project } = this.props
    const { colType, will_be_drop_500_lines, trainHeader, newVariable, newType, rawHeader, dataHeader } = project;
    if (!visiable) return []
    if (this.loading) return []
    if (!cleanData.length) return []
    if (!!newVariable.length && !newVariableData.length) return []
    const headerList = [...rawHeader.filter(_h => dataHeader.includes(_h)), ...newVariable].filter(h => !trainHeader.includes(h))
    const notShowIndex = rawHeader.filter(v => !headerList.includes(v))
    const data = cleanData.map((row, index) => row.concat(newVariable.map(n => newVariableData[index][n])).filter((k, i) => !notShowIndex.includes(i)))

    // const headerList = [...sortHeader,].filter(v => !trainHeader.includes(v))
    // const indexs = headerList.map(h => header.indexOf(h))
    const realColumn = headerList.length
    // const realData = cleanData.slice(1).filter(r => r.length === realColumn)
    // const data = cleanData.slice(1).map(row => indexs.map(i => row[i]))
    const types = { ...colType, ...newType }
    /**
     * 根据showSelect, indexPosition变化
     * showSelect: true  显示勾选框
     * checkRow: 勾选框的行数
     * headerRow: 标题的行数
     * selectRow: 类型选择的行数
     * columnHeader: 表头的列数
     * rowHeader: 表头的行数
     */
    const indexArr = []
    const headerArr = []
    const selectArr = []
    for (let i = 0; i < realColumn; i++) {
      const header = headerList[i] ? headerList[i].trim() : '';

      indexArr.push({
        content: <span>{i + 1}</span>,
        title: i + 1,
        cn: styles.cell
      })

      headerArr.push({
        content: <span>{header}</span>,
        title: header,
        cn: styles.titleCell
      })

      const colValue = types[header] === 'Numerical' ? 'Numerical' : 'Categorical'
      selectArr.push({
        content: <span>{colValue === 'Numerical' ? EN.Numerical : EN.Categorical}</span>,
        title: colValue === 'Numerical' ? EN.Numerical : EN.Categorical,
        cn: styles.cell
      })
    }

    const tableData = data.map((row, index) => row.map(v => {
      v = v === 'NEW_VARIABLE_TYPE' ? '' : v
      return {
        content: <span>{v}</span>,
        title: v,
        cn: classnames(styles.cell, {
          [styles.drop]: (will_be_drop_500_lines || []).includes(index)
        })
      }
    }))

    return [indexArr, headerArr, selectArr, ...tableData]
  }

  render() {
    const { visiable, project, hideTable, showTable } = this.props
    const { dataHeader, trainHeader, newVariable } = project
    const header = [...dataHeader, ...newVariable].filter(v => !trainHeader.includes(v))
    const tableData = this.formatTable()
    // console.log(tableData.length, "tableData", cleanPath)
    return <div className={classnames(styles.content, {
      [styles.active]: visiable
    })}>
      <div className={styles.icon} onClick={visiable ? hideTable : showTable}>
        {<Tooltip title={`${visiable ? EN.CloseDataTable : EN.ViewDataTable}`} mouseLeaveDelay={0}>
          <img src={dataIcon} alt={"view"} />
        </Tooltip>}
        {/* {!visiable && <span >View Data Table</span>} */}
      </div>
      <div className={styles.arrow}>{<Icon type="caret-right" theme="filled" style={{ transform: `rotate(${visiable ? 0 : 180}deg)` }} />}</div>
      <div className={styles.header}>
        <div className={styles.text}><span>{EN.TotalVariables}:</span><span className={styles.value} title={header.length}>{header.length}</span></div>
      </div>
      <div className={styles.table}>
        <Table
          columnWidth={110}
          rowHeight={34}
          columnCount={header.length}
          rowCount={tableData.length}
          fixedColumnCount={0}
          fixedRowCount={3}
          checked={null}
          select={null}
          style={{ border: "1px solid #ccc" }}
          data={tableData}
        />
      </div>
    </div>
  }
}
