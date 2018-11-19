import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { AutoSizer, MultiGrid } from 'react-virtualized';
import { Checkbox } from 'antd';

@observer
export default class Table extends Component {
  updateGrids = () => {
    this.grid.forceUpdateGrids()
  }

  cellRenderer = ({ columnIndex, key, rowIndex, style }) => {
    const { checkList, showSelect, target, colType, temp, uploadData, rawHeader, dataHeader, select, indexPosition, showTarget, showIssue, issues, issueIndex } = this.props;
    // const { uploadData, target, colType, rawHeader, headerTemp: {temp} } = this.props.project;
    // const { checkList, showSelect } = this.state;
    const headerList = [...dataHeader]
    const notShowIndex = rawHeader.filter(v => !dataHeader.includes(v)).map(v => rawHeader.indexOf(v))
    const data = uploadData.map(row => {
      notShowIndex.forEach(i => row.splice(i, 1))
      return row
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
    const index = {
      indexRow: indexPosition === 'top' ? 0 : -1,
      checkRow: -2 + (showSelect ? 2 : 0) + (indexPosition === 'top' ? 1 : 0),
      headerRow: 0 + (showSelect ? 1 : 0) + (indexPosition === 'top' ? 1 : 0),
      selectRow: 1 + (showSelect ? 1 : 0) + (indexPosition === 'top' ? 1 : 0),
      issueRow: (showIssue ? 2 : -3) + (showSelect ? 1 : 0) + (indexPosition === 'top' ? 1 : 0),
      columnHeader: indexPosition === 'top' ? 0 : 1,
      rowHeader: 2 + (showSelect ? 1 : 0) + (indexPosition === 'top' ? 1 : 0) + (showIssue ? 1 : 0)
    }

    //真实的数据行 && 真实的数据列
    const realRow = rowIndex - index.rowHeader
    const realColumn = columnIndex - index.columnHeader;
    const header = headerList[realColumn] && headerList[realColumn].trim();
    //内容, 标题, class
    let content, title, cn;
    //序列
    if (rowIndex === index.indexRow) {
      cn = styles.cell;
      title = "";
      if (columnIndex === index.columnHeader - 1) {
        content = <span>row/header</span>;
      } else {
        content = <span>{realColumn + 1}</span>;
        title = realColumn + 1;
      }
      if (showTarget && target && target === header) {
        cn = classnames(cn, styles.target);
      }
      //勾选框行
    } else if (rowIndex === index.checkRow) {
      cn = styles.check;
      title = "";
      if (columnIndex === index.columnHeader - 1) {
        content = "";
      } else {
        content = <Checkbox onChange={this.checked.bind(null, header)} checked={true}></Checkbox>
        if (target && target === header) {
          cn = classnames(styles.check, styles.target);
          content = "";
        }
        if (checkList.includes(header)) {
          cn = classnames(styles.check, styles.checked);
          content = <Checkbox onChange={this.checked.bind(null, header)} checked={false}></Checkbox>
        }
      }
      //标题行
    } else if (rowIndex === index.headerRow) {
      cn = styles.titleCell;
      if (columnIndex === index.columnHeader - 1) {
        content = <span>row/header</span>;
        title = '';
      } else {
        content = <span>{header}</span>;
        title = header;
        if (showTarget && target && target === header) {
          cn = classnames(cn, styles.target);
        }
        if (checkList.includes(header)) {
          cn = classnames(cn, styles.checked);
        }
        if (!header) {
          cn = classnames(cn, styles.missed);
        }
        if (header && temp[header].length > 1) {
          cn = classnames(cn, styles.duplicated);
        }
      }
      //类型选择行
    } else if (rowIndex === index.selectRow) {
      cn = select ? styles.check : styles.cell;
      title = "";
      if (columnIndex === index.columnHeader - 1) {
        content = "";
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
        if (showTarget && target && target === header) {
          cn = classnames(cn, styles.target);
        }
        content = select ? <select value={colType[key]} onChange={this.select.bind(null, key)}>
          <option value="Categorical">Categorical</option>
          <option value="Numerical">Numerical</option>
        </select> : <span>{colType[key]}</span>
      }
      //issue 行
    } else if (rowIndex === index.issueRow) {
      cn = styles.cell;
      title = "";
      content = [];
      if (!issues || columnIndex === index.columnHeader - 1) {
        content = "";
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
        if (showTarget && target && target === header) {
          cn = classnames(cn, styles.target);
        }
        if (issues.mismatchRow[key]) {
          content.push(<div className={classnames(styles.errorBlock, styles.mismatch)} key={"mismatch" + key}><span>{issues.mismatchRow[key].toFixed(2)}%</span></div>)
        }
        if (issues.nullRow[key]) {
          content.push(<div className={classnames(styles.errorBlock, styles.missing)} key={"missing" + key}><span>{issues.nullRow[key].toFixed(2)}%</span></div>)
        }
        if (issues.outlierRow[key]) {
          content.push(<div className={classnames(styles.errorBlock, styles.outlier)} key={"outlier" + key}><span>{issues.outlierRow[key].toFixed(2)}%</span></div>)
        }
      }
      //其他为数据行 select.bind(null, key)
    } else {
      cn = styles.cell;
      //第一列为排序
      if (columnIndex === index.columnHeader - 1) {
        //排序从1开始
        content = <span>{realRow + 1}</span>;
        title = realRow + 1;
      } else {
        content = <span>{data[realRow][realColumn]}</span>;
        title = data[realRow][realColumn];
        if (showTarget && target && target === header) {
          cn = classnames(cn, styles.target);
        }
        if (checkList.includes(header)) {
          cn = classnames(cn, styles.checked);
        }
        if (showIssue && issueIndex) {
          if (issueIndex.nullIndex[header] && issueIndex.nullIndex[header].includes(realRow)) {
            cn = classnames(cn, styles.missing);
          }
          if (colType[key] === 'Numerical' && issueIndex.mismatchIndex[header] && issueIndex.mismatchIndex[header].includes(realRow)) {
            cn = classnames(cn, styles.mismatch);
          }
          if (colType[key] === 'Numerical' && issueIndex.outlierIndex[header] && issueIndex.outlierIndex[header].includes(realRow)) {
            cn = classnames(cn, styles.outlier);
          }
        }
      }
    }
    return (
      <div
        className={cn}
        key={key}
        style={style}
        title={title}
      >
        {content}
      </div>
    )
  }

  select = (key, e) => {
    this.props.select(key, e.target.value)
    this.updateGrids()
  }

  checked = (key, e) => {
    this.props.checked(key, e.target.checked)
    this.updateGrids()
  }

  MultiGridCb = (grid) => {
    this.grid = grid
  }

  render() {
    const { columnCount, columnWidth, rowHeight, fixedColumnCount, fixedRowCount, rowCount } = this.props;
    return <AutoSizer>
      {({ height, width }) => {
        return <MultiGrid
          columnCount={columnCount}
          columnWidth={columnWidth}
          height={height}
          rowCount={rowCount}
          rowHeight={rowHeight}
          width={width}
          cellRenderer={this.cellRenderer}
          fixedRowCount={fixedRowCount}
          fixedColumnCount={fixedColumnCount}
          style={{ border: "1px solid #ccc" }}
          ref={this.MultiGridCb}
        />
      }}
    </AutoSizer>
  }
}