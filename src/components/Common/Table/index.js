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
        const {checkList, showSelect, uploadData, target, colType, rawHeader, temp} = this.props;
        // const { uploadData, target, colType, rawHeader, headerTemp: {temp} } = this.props.project;
        // const { checkList, showSelect } = this.state;
        /**
         * 根据showSelect变化
         * showSelect: true  显示勾选框
         * checkRow: 勾选框的行数
         * headerRow: 标题的行数
         * selectRow: 类型选择的行数
         * columnHeader: 表头的列数
         * rowHeader: 表头的行数
         */
        const index = {
            checkRow: showSelect ? 0 : -1,
            headerRow: showSelect ? 1 : 0,
            selectRow: showSelect ? 2 : 1,
            columnHeader: 1,
            rowHeader: showSelect ? 3 : 2
        }

        //真实的数据行 && 真实的数据列
        const realRow = rowIndex - index.rowHeader
        const realColumn = columnIndex - index.columnHeader;
        const header = rawHeader[realColumn] && rawHeader[realColumn].trim();
        //内容, 标题, class
        let content, title, cn;

        //勾选框行
        if (rowIndex === index.checkRow) {
            cn = styles.check;
            title = "";
            if (columnIndex === 0) {
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
            if (columnIndex === 0) {
                content = <span>row/header</span>;
                title = '';
            } else {
                content = <span>{header}</span>;
                title = header;
                if (target && target === header) {
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
            cn = styles.check;
            title = "";
            if (columnIndex === 0) {
                content = "";
            } else {
                let key = header;
                if(!header) {
                    key = `Unnamed: ${realColumn}`
                }
                if (header && temp[header].length > 1) {
                    const tempIndex = temp[header].findIndex(c => c===realColumn);
                    const suffix = tempIndex===0?"":'.'+tempIndex;
                    key = header+suffix
                }
                content = <select value={colType[key]} onChange={this.select.bind(null, key)}>
                    <option value="Categorical">Categorical</option>
                    <option value="Numerical">Numerical</option>
                </select>
            }
            //其他为数据行 select.bind(null, key)
        } else {
            cn = styles.cell;
            //第一列为排序
            if (columnIndex === 0) {
                //排序从1开始
                content = <span>{realRow + 1}</span>;
                title = realRow + 1;
            } else {
                content = <span>{uploadData[realRow][realColumn]}</span>;
                title = uploadData[realRow][realColumn];
                if (target && target === header) {
                    cn = classnames(cn, styles.target);
                }
                if (checkList.includes(header)) {
                    cn = classnames(cn, styles.checked);
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
        const {uploadData, columnWidth, rowHeight, fixedColumnCount, fixedRowCount} = this.props;
        return <AutoSizer>
            {({ height, width }) => {
                return <MultiGrid
                    columnCount={uploadData[0].length + 1}
                    columnWidth={columnWidth}
                    height={height}
                    rowCount={uploadData.length + 1}
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