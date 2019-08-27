import React, { useState, useEffect, useMemo } from 'react';
import { Table, HeaderInfo } from 'components/Common'
import styles from './DisplayOutlier.module.css';
import { observer } from 'mobx-react';
import EN from '../../../../constant/en';

interface DisplayOutlierProps {
  visiable: boolean,
  rate: string,
  header: string[],
  mapHeader: string[]
  colType: StringObject
  getOutlierData: () => Promise<any>
}

type TableCell = {
  content: string | React.ReactElement;
  title: string;
  cn: string;
};

const DisplayOutlier = (props: DisplayOutlierProps) => {
  const { visiable, rate, getOutlierData, header, colType, mapHeader } = props
  const [tableRows, setTableRows] = useState([] as any[])
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    if (!visiable || rate === '0') {
      setTableRows([])
      // setLoading(false)
    } else {
      setLoading(true)
      getOutlierData().then(result => {
        if (result.status === 200) {
          setTableRows(result.list)
        } else {
          setTableRows([])
        }
        setLoading(false)
      })
    }
    // return setLoading(true)
  }, [visiable, rate])

  const tableData = useMemo(() => {
    if (loading) return []
    if (!tableRows.length) return []

    const headerList = header
    const data = tableRows.map(row => {
      return header.map(h => row[h])
    })
    /**
     * 根据showSelect, indexPosition变化
     * headerRow: 标题的行数
     * selectRow: 类型选择的行数
     * columnHeader: 表头的列数
     * rowHeader: 表头的行数
     */
    const index = {
      headerRow: 0,
      selectRow: 1,
      columnHeader: 1,
      rowHeader: 2
    }

    const realColumn = headerList.length + index.columnHeader

    const headerArr = []
    const selectArr = []
    for (let i = 0; i < realColumn; i++) {
      const header = headerList[i - index.columnHeader] ? headerList[i - index.columnHeader].trim() : '';

      const headerData: TableCell = {
        content: '',
        title: '',
        cn: styles.titleCell
      }
      if (i === index.columnHeader - 1) {
        headerData.content = <HeaderInfo row={EN.Header} col={EN.Row} style={{ margin: '-3px -.1em 0', height: '34px', width: '110px' }} rotate={15.739} />
        headerData.title = '';
      } else {
        const headerText = mapHeader[header]
        headerData.content = <span>{headerText}</span>
        headerData.title = headerText;
      }
      headerArr.push(headerData)

      const selectData: TableCell = {
        content: '',
        title: '',
        cn: styles.cell
      }
      if (i === index.columnHeader - 1) {
        selectData.content = "";
      } else {
        const colValue = colType[header]
        selectData.content = <span>{{ Numerical: EN.Numerical, Categorical: EN.Categorical, Raw: EN.Categorical + '(Raw)' }[colValue]}</span>
      }
      selectArr.push(selectData)
    }

    const tableData = data.map((row, rowIndex) => {
      const arr: TableCell[] = []
      if (index.columnHeader > 0) {
        arr.push({
          content: <span>{rowIndex + 1}</span>,
          title: (rowIndex + 1).toString(),
          cn: styles.cell
        })
      }
      const dataArr = row.map((v, k) => {
        return {
          content: <span>{v}</span>,
          title: v,
          cn: styles.cell
        }
      })
      return arr.concat(dataArr)
    })
    return [headerArr, selectArr, ...tableData].filter(row => row.length === realColumn)

  }, [loading, tableRows])

  if (!visiable) return null

  return (!loading && !tableRows.length) ? <div className={styles.none}><span>{EN.dispalyNull}</span></div> : <div className={styles.detail}>
    <Table
      columnWidth={110}
      rowHeight={34}
      columnCount={header.length + 1}
      rowCount={tableData.length}
      fixedColumnCount={1}
      fixedRowCount={2}
      style={{ border: "1px solid #ccc" }}
      data={tableData}
    />
  </div>
}

export default observer(DisplayOutlier)