import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Icon } from 'antd';
import { observable } from 'mobx';
import { Table } from 'components/Common';

@observer
export default class Preview extends Component {
  @observable visiable = false

  showTable = () => {
    this.visiable = true
  }

  hideTable = () => {
    this.visiable = false
  }

  formatTable = () => {
    const { colType, cleanData, rawHeader, dataHeader } = this.props.project;
    // const { sortData, target, colType, sortHeader, headerTemp: {temp} } = this.props.project;
    // const { checkList, showSelect } = this.state;
    // const index = rawHeader.indexOf(target)
    // const sortData = cleanData.map(row => {
    //   const value = row[index]
    //   return [value, ...row.slice(0, index), ...row.slice(index + 1)]
    // })

    // if (!cleanData.length) return []
    // const headerList = [...dataHeader]
    // const notShowIndex = sortHeader.filter(v => !headerList.includes(v)).map(v => rawHeader.indexOf(v))
    // const data = sortData.map(row => row.filter((k, i) => !notShowIndex.includes(i)))
    if (!cleanData.length) return []
    const headerList = [...dataHeader]
    const notShowIndex = rawHeader.filter(v => !headerList.includes(v)).map(v => rawHeader.indexOf(v))
    const data = cleanData.map(row => row.filter((k, i) => !notShowIndex.includes(i)))
    /**
     * 根据showSelect, indexPosition变化
     * showSelect: true  显示勾选框
     * checkRow: 勾选框的行数
     * headerRow: 标题的行数
     * selectRow: 类型选择的行数
     * columnHeader: 表头的列数
     * rowHeader: 表头的行数
     */
    const realColumn = headerList.length

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

    const tableData = data.map(row => row.map(v => {
      return {
        content: <span>{v}</span>,
        title: v,
        cn: styles.cell
      }
    }))

    return [indexArr, headerArr, selectArr, ...tableData].filter(row => row.length === realColumn)
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
          columnCount={dataHeader.length - 1}
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