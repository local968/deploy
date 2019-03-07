import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Icon } from 'antd';
import { observable, autorun } from 'mobx';
import { Table } from 'components/Common';

@observer
export default class Preview extends Component {
  @observable visiable = false
  @observable cleanData = []
  @observable loading = false

  componentDidUpdate() {
    const { readData, cleanPath, etlCleanData, etlCleanDataLoading } = this.props.project;
    if (!cleanPath) {
      if (!this.loading) {
        this.cleanData = []
        if (!etlCleanDataLoading) {
          this.loading = true
          etlCleanData()
        }
      }
    } else {
      this.loading = false
      if (this.cleanPath === cleanPath) return
      this.cleanPath = cleanPath
      this.cleanData = []
      this.cleanPath && readData(this.cleanPath).then(data => {
        this.cleanData = data
      })
    }
  }

  showTable = () => {
    this.visiable = true
  }

  hideTable = () => {
    this.visiable = false
  }

  formatTable = () => {
    const { cleanData, visiable } = this
    const { colType, will_be_drop_500_lines, renameVariable, trainHeader, sortHeader, newVariable } = this.props.project;
    if (!visiable) return []
    if (!cleanData.length) return []
    const header = cleanData[0]
    const headerList = [...sortHeader, ...newVariable].filter(v => !trainHeader.includes(v))
    const indexs = headerList.map(h => header.indexOf(h))
    const realColumn = headerList.length
    // const realData = cleanData.slice(1).filter(r => r.length === realColumn)
    const data = cleanData.slice(1).map(row => indexs.map(i => row[i]))
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
    const { sortHeader, target, trainHeader, newVariable } = this.props.project
    const header = [...sortHeader, ...newVariable].filter(v => !trainHeader.includes(v))
    const tableData = this.formatTable()
    return <div className={classnames(styles.content, {
      [styles.active]: this.visiable
    })}>
      <div className={styles.icon} onClick={this.visiable ? this.hideTable : this.showTable}><Icon type="profile" theme="filled" /></div>
      <div className={styles.arrow}>{this.visiable ? <Icon type="caret-right" theme="filled" /> : <Icon type="caret-left" theme="filled" />}</div>
      <div className={styles.header}>
        <div className={styles.text}><span>Target Variable:</span><span className={styles.value} title={target}>{target}</span></div>
        <div className={styles.text}><span>Total Variables:</span><span className={styles.value} title={header.length}>{header.length}</span></div>
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