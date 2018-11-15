import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { observable } from 'mobx'
import Hint from 'components/Common/Hint';

import { Select, ContinueButton, EtlLoading, Table } from 'components/Common';

@observer
export default class DataSchema extends Component {
  @observable checkList = this.props.project.rawHeader.filter(r => !this.props.project.dataHeader.includes(r))
  @observable showSelect = false

  doEtl = () => {
    const { colType, rawHeader, noComputeTemp } = this.props.project;
    const newDataHeader = rawHeader.filter(d => !this.checkList.includes(d));
    this.props.project.updateProject({
      dataHeader: newDataHeader,
      colType: colType,
      noCompute: noComputeTemp,
      cleanData: [],
      targetMap: {},
      outlierDict: {},
      nullFillMethod: {},
      mismatchFillMethod: {},
      outlierFillMethod: {}
    });
    this.props.project.etl();
  }

  targetSelect = (value) => {
    this.props.project.updateProject({
      target: value
    }).then(() => this.refs.table.updateGrids())
    this.checkList = [...this.checkList.filter(v => v !== value)]
  }

  checked = (key, checked) => {
    if (!checked) {
      this.checkList = [...this.checkList, key]
    } else {
      this.checkList = [...this.checkList.filter(v => v !== key)]
    }
  }

  select = (key, v) => {
    this.props.project.colType[key] = v
  }

  toggleSelect = () => {
    this.showSelect = !this.showSelect
  }

  checkNoCompute = (e) => {
    this.props.project.noComputeTemp = e.target.checked;
  }

  render() {
    const { project } = this.props;
    const { etling, etlProgress, uploadData, rawHeader, noComputeTemp, target, colType, headerTemp: { temp, isMissed, isDuplicated } } = project;
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
            <div className={classnames(styles.schemaSelect, styles.disabled)}>
              <span>Select Undesirable Variables</span>
            </div> :
            <div className={styles.schemaSelect} onClick={this.toggleSelect}>
              <span>Select Undesirable Variables</span>
            </div>
          }
          <Hint themeStyle={{ fontSize: '1.5rem', lineHeight: '2rem', display: 'flex', alignItems: 'center' }} content="Unselect predictors that lead to less wanted modeling results, they could be: 1.Variable IDs 2.Variables that are derived from the target 3.Any other variables you don't need" />
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
            ref="table"
            uploadData={uploadData}
            target={target}
            colType={colType}
            rawHeader={rawHeader}
            temp={temp}
            checkList={this.checkList}
            showSelect={this.showSelect}
            columnWidth={110}
            rowHeight={34}
            fixedColumnCount={1}
            fixedRowCount={this.showSelect ? 3 : 2}
            checked={this.checked}
            select={this.select} />
        </div>
      </div>
      <div className={styles.bottom}>
        <ContinueButton onClick={this.doEtl} disabled={etling || !target} text="Continue" />
        <div className={styles.checkBox}><input type='checkbox' onChange={this.checkNoCompute} checked={noComputeTemp} />
          <span>Skip Data Quality Check</span>
          <Hint themeStyle={{ fontSize: '1.5rem', lineHeight: '2rem', display: 'flex', alignItems: 'center' }} content="If you know the data is clean, you can skip the data quality step." />
        </div>
      </div>
      {etling && <EtlLoading progress={etlProgress}/>}
    </div>
  }
}
