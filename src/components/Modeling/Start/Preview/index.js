import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Icon } from 'antd';
import { observable, autorun } from 'mobx';
import { Table } from 'components/Common';

@observer
export default class Preview extends Component {
  constructor(props) {
    super(props)
    const { cleanPath, etlCleanData, etlCleanDataLoading } = this.props.project
    this.autorun = autorun(() => {
      if (!cleanPath) {
        !etlCleanDataLoading && etlCleanData()
      }
    })
  }

  @observable visiable = false
  @observable cleanData = []

  showTable = () => {
    const { cleanPath, readData } = this.props.project
    this.visiable = true
    if (this.cleanPath === cleanPath) return
    this.cleanPath = cleanPath
    this.cleanData = []
    readData(this.cleanPath).then(data => {
      this.cleanData = data
    })
  }

  hideTable = () => {
    this.visiable = false
  }

  formatTable = () => {
    const { cleanData, visiable } = this
    const { colType, target, will_be_drop_500_lines, renameVariable } = this.props.project;
    if (!visiable) return []
    if (!cleanData.length) return []
    const header = cleanData[0]
    const index = header.indexOf(target)
    if (index === -1) return []
    const headerList = [target, ...header.filter(h => h !== target)]
    const realColumn = headerList.length
    const realData = cleanData.slice(1).filter(r => r.length === realColumn)
    const data = index === 0 ? realData : realData.map(row => {
      return [row[index], ...row.slice(0, index), ...row.slice(index + 1)]
    })
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

      const colValue = colType[header] === 'Numerical' ? 'Numerical' : 'Categorical'
      selectArr.push({
        content: <span>{colValue}</span>,
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
    const { dataHeader, target } = this.props.project
    const tableData = this.formatTable()
    return <div className={classnames(styles.content, {
      [styles.active]: this.visiable
    })}>
      <div className={styles.icon} onClick={this.visiable ? this.hideTable : this.showTable}><Icon type="profile" theme="filled" /></div>
      <div className={styles.arrow}>{this.visiable ? <Icon type="caret-right" theme="filled" /> : <Icon type="caret-left" theme="filled" />}</div>
      <div className={styles.header}>
        <div className={styles.text}><span>Target Variable:</span><span className={styles.value} title={target}>{target}</span></div>
        <div className={styles.text}><span>Total Variables:</span><span className={styles.value} title={dataHeader.length}>{dataHeader.length}</span></div>
      </div>
      <div className={styles.table}>
        <Table
          columnWidth={110}
          rowHeight={34}
          columnCount={dataHeader.length}
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