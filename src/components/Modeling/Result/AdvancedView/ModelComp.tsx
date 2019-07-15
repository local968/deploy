import React, { Component } from 'react';
import { Tabs, Modal, Button } from 'antd';
import styles from './ModelComp.module.css';
import EN from '../../../../constant/en';
const { TabPane } = Tabs;

import {
  SpeedvsAccuracys,
  LiftChart,
  RocChart,
} from "../../../Charts"
import Model from 'stores/Model';

interface ModelCompProps {
  models: Model[]
}

class ModelComp extends Component<ModelCompProps> {
  state = {
    modelCompVisible: false,
    select: true,
  };
  handleClick = () => {
    this.setState({ modelCompVisible: true });
  };
  handleCancel = () => {
    this.setState({ modelCompVisible: false });
  };
  render() {
    const { models } = this.props;
    const { select } = this.state;
    return (
      <div className={styles.modelComp}>
        <div onClick={this.handleClick} className={styles.comparison}><span>{EN.ModelComparisonCharts}</span></div>
        <Modal
          width={1000}
          visible={this.state.modelCompVisible}
          onCancel={this.handleCancel}
          closable={false}
          footer={
            <Button key="cancel" type="primary" onClick={this.handleCancel}>{EN.Close}</Button>
          }
        >
          <div>
            <h4>{EN.ModelComparisonCharts}</h4>
            <Tabs defaultActiveKey="1">
              <TabPane tab={EN.SpeedvsAccuracy} key="1">
                <SpeedvsAccuracys
                  // width={600}
                  selectAll={select}
                  height={400}
                  x_name={EN.Speedms1000rows}
                  y_name={EN.Accuracy}
                  models={models}
                />
              </TabPane>
              <TabPane tab={EN.LiftsCharts} key="3">
                <LiftChart
                  selectAll={select}
                  models={models}
                  x_name={EN.percentage}
                  y_name={EN.lift}
                  mom='lift'
                  x='PERCENTAGE'
                  y='LIFT'
                  formatter={true}
                />
              </TabPane>
              <TabPane tab={EN.ROCCurves} key="4">
                <RocChart
                  models={models}
                  selectAll={select}
                  x_name={EN.FalsePositiveDate}
                  y_name={EN.TruePositiveRate}
                  mom='roc'
                  x='FPR'
                  y='TPR'
                />
              </TabPane>
            </Tabs>
            <div className={styles.mccb}>
              <Button type="primary" onClick={async () => {
                await this.setState({ select: false });
                this.setState({ select: true });
              }}>{EN.SelectAll}</Button>
              <Button type="primary" onClick={async () => {
                await this.setState({ select: true });
                this.setState({ select: false });
              }}>{EN.DeselectAll}</Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}

export default ModelComp