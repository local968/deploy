import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';

import { Select, ContinueButton, ProjectLoading } from '../../Common';

import { AutoSizer, MultiGrid } from 'react-virtualized';
import { Checkbox } from 'antd';

@observer
export default class DataSchema extends Component {

    //更改flag使表格重新加载
    state = {
        flag: false,
        checkList: this.props.project.rawHeader.filter(r => !this.props.project.dataHeader.includes(r)),
        showSelect: false,
        load: false
    }

    doEtl = () => {
        const {colType, rawHeader, no_compute} = this.props.project;
        const newDataHeader = rawHeader.filter(d => !this.state.checkList.includes(d));
        this.props.project.updateProject({
			dataHeader: newDataHeader,
            colType: colType,
            no_compute: no_compute
		});
        this.props.project.etl();
        this.setState({
            load: true
        })
    }

    targetSelect = (value) => {
        this.props.project.updateProject({
            target: value
        })
        this.setState(Object.assign({}, this.state, {
            flag: !this.state.flag,
            checkList: [...this.state.checkList.filter(v => v !== value)]
        }))
    }

    checked = (key, e) => {
        if (!e.target.checked) {
            this.setState({
                flag: !this.state.flag,
                checkList: [...this.state.checkList, key]
            })
        } else {
            this.setState({
                flag: !this.state.flag,
                checkList: [...this.state.checkList.filter(v => v !== key)]
            })
        }
    }

    select = (key, e) => {
        this.props.project.colType[key] = e.target.value
        this.setState({
            flag: !this.state.flag
        })
    }

    toggleSelect = () => {
        this.setState({
            flag: !this.state.flag,
            showSelect: !this.state.showSelect
        })
    }

    checkNoCompute = (e) => {
        this.props.project.no_compute = e.target.checked;
    }

    cellRenderer = ({ columnIndex, key, rowIndex, style }) => {
        const { uploadData, target, colType, rawHeader, headerTemp: {temp} } = this.props.project;
        const { checkList, showSelect } = this.state;
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
                content = <Checkbox onChange={this.checked.bind(this, header)} checked={true}></Checkbox>
                if (target && target === header) {
                    cn = classnames(styles.check, styles.target);
                    content = "";
                }
                if (checkList.includes(header)) {
                    cn = classnames(styles.check, styles.checked);
                    content = <Checkbox onChange={this.checked.bind(this, header)} checked={false}></Checkbox>
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
                content = <select value={colType[key]} onChange={this.select.bind(this, key)}>
                    <option value="Categorical">Categorical</option>
                    <option value="Numerical">Numerical</option>
                </select>
            }
            //其他为数据行
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
                if (this.state.checkList.includes(header)) {
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

    render() {
        const { project } = this.props;
        const { uploadData, rawHeader, no_compute, target, headerTemp: {isMissed, isDuplicated} } = project;
        const targetOption = {};

        //target选择列表
        rawHeader.forEach((h, i) => {
            h = h.trim()
            targetOption[h] = h
        });

        return project && <div className={styles.schema}>
            <div className={styles.schemaInfo}>
                <div className={styles.schemaI}><span>i</span></div>
                <div className={styles.schemaText}>
                    <span>Please edit the default header row if necessary.</span>
                    <span>If your data doesn't have a header, please prepare a dataset that has one.</span>
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
                    <div className={classnames(styles.schemaSelect,styles.disabled)}>
                        <span>Select Undesirable Variables</span>
                    </div>:
                    <div className={styles.schemaSelect} onClick={this.toggleSelect}>
                        <span>Select Undesirable Variables</span>
                    </div>
                    }
                    {isMissed && <div className={styles.schemaMissed} >
                        <div className={styles.errorBlock}></div>
                        <span>Missing</span>
                    </div>}
                    {isDuplicated && <div className={styles.schemaDuplicated} >
                        <div className={styles.errorBlock}></div>
                        <span>Duplicated Header</span>
                    </div>}
                </div>
                <div className={styles.content}>
                    <AutoSizer>
                        {({ height, width }) => {
                            return <MultiGrid
                                columnCount={uploadData[0].length + 1}
                                columnWidth={110}
                                height={height}
                                rowCount={uploadData.length + 1}
                                rowHeight={34}
                                width={width}
                                cellRenderer={this.cellRenderer}
                                scrollToAlignment={this.state.flag}
                                fixedRowCount={this.state.showSelect ? 3 : 2}
                                fixedColumnCount={1}
                                style={{ border: "1px solid #ccc" }}
                            />
                        }}
                    </AutoSizer>
                </div>
            </div>
            <div className={styles.bottom}>
                <ContinueButton onClick={this.doEtl} disabled={this.state.load || !target} text="Continue" />
                <div className={styles.checkBox}><input type='checkbox' onChange={this.checkNoCompute} checked={no_compute} /><span>Skip Etl</span></div>
            </div>
            {this.state.load && <ProjectLoading />}
        </div>
    }
}