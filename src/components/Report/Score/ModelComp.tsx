import React, { Component, useState } from 'react';
import styles from './AdvancedView.module.css';
import EN from '../../../constant/en';
import { Button, Modal, Tabs } from 'antd';
import SpeedvsAccuracys from '../../Charts/SpeedvsAccuracys';
import { LiftChart, RocChart } from '../../Charts';
const { TabPane } = Tabs;


interface Interface {
  models: any;
}

export default function ModelComp(props: Interface) {
  const [modelCompVisible, upModelCompVisible] = useState(false);

  function handleClick() {
    upModelCompVisible(true);
  }
  function handleCancel() {
    upModelCompVisible(false);
  }
  const { models } = props;

  return (
    <div className={styles.modelComp}>
      <a onClick={handleClick} className={styles.comparison}>
        {EN.ModelComparisonCharts}
      </a>
      <Modal
        width={1000}
        visible={modelCompVisible}
        onCancel={handleCancel}
        closable={false}
        footer={
          <Button key="cancel" type="primary" onClick={handleCancel}>
            {EN.Close}
          </Button>
        }
      >
        <div>
          <h4>{EN.ModelComparisonCharts}</h4>
          <Tabs defaultActiveKey="1">
            <TabPane tab={EN.SpeedvsAccuracy} key="1">
              <SpeedvsAccuracys
                height={400}
                x_name={EN.Speedms1000rows}
                y_name={EN.Accuracy}
                models={models}
              />
            </TabPane>
            <TabPane tab={EN.LiftsCharts} key="3">
              <LiftChart
                models={models}
                x_name={EN.percentage}
                y_name={EN.lift}
                mom="lift"
                x="PERCENTAGE"
                y="LIFT"
                formatter={true}
              />
            </TabPane>
            <TabPane tab={EN.ROCCurves} key="4">
              <RocChart
                models={models}
                x_name={EN.FalsePositiveRate}
                y_name={EN.TruePositiveRate}
                mom="roc"
                x="FPR"
                y="TPR"
              />
            </TabPane>
          </Tabs>
        </div>
      </Modal>
    </div>
  );
}
