import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';

import { Select, ContinueButton, ProjectLoading, Table } from '../../Common';

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
        const {colType, rawHeader, noCompute} = this.props.project;
        const newDataHeader = rawHeader.filter(d => !this.state.checkList.includes(d));
        this.props.project.updateProject({
			dataHeader: newDataHeader,
            colType: colType,
            noCompute: noCompute
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

    checked = (key, checked) => {
        if (!checked) {
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

    select = (key, v) => {
        this.props.project.colType[key] = v
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
        this.props.project.noCompute = e.target.checked;
    }

  

    render() {
        const { project } = this.props;
        const { uploadData, rawHeader, noCompute, target, colType, headerTemp: {temp, isMissed, isDuplicated} } = project;
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
                    <Table 
                        uploadData={uploadData}
                        target={target}
                        colType={colType}
                        rawHeader={rawHeader}
                        temp={temp}
                        checkList={this.state.checkList}
                        showSelect={this.state.showSelect} 
                        columnWidth={110} 
                        rowHeight={34} 
                        fixedColumnCount={1} 
                        fixedRowCount={this.state.showSelect ? 3 : 2}
                        checked={this.checked} 
                        select={this.select} />
                </div>
            </div>
            <div className={styles.bottom}>
                <ContinueButton onClick={this.doEtl} disabled={this.state.load || !target} text="Continue" />
                <div className={styles.checkBox}><input type='checkbox' onChange={this.checkNoCompute} checked={noCompute} /><span>Skip Etl</span></div>
            </div>
            {this.state.load && <ProjectLoading />}
        </div>
    }
}