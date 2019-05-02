import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Icon, Tooltip } from 'antd';
import { observable } from 'mobx';
import { Table } from 'components/Common';
import EN from '../../../../constant/en';

import dataIcon from './data.svg';

@observer
export default class Preview extends Component {
  @observable visiable = false
  @observable cleanData = []
  @observable loading = false

  componentDidUpdate() {
    const { readIndex, etlIndex } = this.props.project;
    this.loading = true
    readIndex(etlIndex).then(data => {
      this.cleanData = data
      this.loading = false
    })
    // const { readData, cleanPath, etlCleanData, etlCleanDataLoading } = this.props.project;
    // if (!cleanPath) {
    //   if (!this.loading) {
    //     this.cleanData = []
    //     if (!etlCleanDataLoading) {
    //       this.loading = true
    //       etlCleanData()
    //     }
    //   }
    // } else {
    //   this.loading = false
    //   if (this.cleanPath === cleanPath) return
    //   this.cleanPath = cleanPath
    //   readData(cleanPath).then(data => {
    //     this.cleanData = data
    //   })
    // }
  }

  showTable = () => {
    this.visiable = true
  }

  hideTable = () => {
    this.visiable = false
  }

  formatTable = () => {
    const { cleanData, visiable, loading } = this
    const { colType, will_be_drop_500_lines, renameVariable, trainHeader, sortHeader, newVariable, newType } = this.props.project;
    if (loading) return []
    if (!visiable) return []
    if (!cleanData.length) return []
    const header = cleanData[0]
    const headerList = [...sortHeader, ...newVariable].filter(v => !trainHeader.includes(v))
    const indexs = headerList.map(h => header.indexOf(h))
    const realColumn = headerList.length
    // const realData = cleanData.slice(1).filter(r => r.length === realColumn)
    const data = cleanData.slice(1).map(row => indexs.map(i => row[i]))
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
        content: <span>{colValue=== 'Numerical' ? EN.Numerical : EN.Categorical}</span>,
        title: colValue,
        cn: styles.cell
      })
    }

    const tableData = data.map((row, index) => row.map((v, i) => {
      if (i === 0) v = renameVariable[v] || v
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
    const { sortHeader, target, trainHeader, newVariable, cleanPath } = this.props.project
    const header = [...sortHeader, ...newVariable].filter(v => !trainHeader.includes(v))
    const tableData = cleanPath ? this.formatTable() : []
    // console.log(tableData.length, "tableData", cleanPath)
    return <div className={classnames(styles.content, {
      [styles.active]: this.visiable
    })}>
      <div className={styles.icon} onClick={this.visiable ? this.hideTable : this.showTable}>
        {<Tooltip title={`${this.visiable ? EN.CloseDataTable : EN.ViewDataTable}`} mouseLeaveDelay={0}>
          <img src={dataIcon} alt={"view"} />
        </Tooltip>}
        {/* {!this.visiable && <span >View Data Table</span>} */}
      </div>
      <div className={styles.arrow}>{<Icon type="caret-right" theme="filled" style={{ transform: `rotate(${this.visiable ? 0 : 180}deg)` }} />}</div>
      <div className={styles.header}>
        <div className={styles.text}><span>{EN.TargetVariable}:</span><span className={styles.value} title={target}>{target}</span></div>
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