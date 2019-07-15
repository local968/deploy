import { observer } from 'mobx-react';
import React, { Component } from 'react';
import styles from './AdvancedView.module.css';
import EN from '../../../constant/en';
import { Table } from 'antd';

interface Interface {
  model: any;
  yes: any;
  no: any;
  isHoldout: any;
}

@observer
export default class PredictTable extends Component<Interface> {
  render() {
    const { model, yes, no, isHoldout } = this.props;
    const { fitIndex, chartData, holdoutChartData } = model;
    const { roc } = isHoldout ? holdoutChartData : chartData;
    let TN = roc.TN[fitIndex];
    let FP = roc.FP[fitIndex];
    let TP = roc.TP[fitIndex];
    let FN = roc.FN[fitIndex];
    const column = [
      {
        title: '',
        dataIndex: 'rowName',
        className: styles.actual,
      },
      {
        title: `${EN.Predict}: ${no}`,
        dataIndex: 'col1',
      },
      {
        title: `${EN.Predict}: ${yes}`,
        dataIndex: 'col2',
      },
      {
        title: '',
        dataIndex: 'sum',
      },
    ];

    // set default value
    const data = [
      {
        rowName: `${EN.Actual}: ${no}`,
        col1: `${Math.round(TN)}(TN)`,
        col2: `${Math.round(FP)}(FP)`,
        sum: +TN + +FP,
      },
      {
        rowName: `${EN.Actual}: ${yes}`,
        col1: `${Math.round(FN)}(FN)`,
        col2: `${Math.round(TP)}(TP)`,
        sum: Number(FN) + +TP,
      },
      {
        rowName: '',
        col1: +TN + +FN,
        col2: +FP + +TP,
        sum: +TN + +FN + +FP + +TP,
      },
    ];
    return (
      <Table
        className={styles.predictTable}
        columns={column}
        bordered
        rowKey={({rowName}) => rowName}
        dataSource={data}
        pagination={false}
      />
    );
  }
}
