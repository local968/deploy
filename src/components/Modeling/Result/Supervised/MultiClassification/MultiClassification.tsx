import React, { Component } from 'react';
import styles from '../styles.module.css';
import { observer } from 'mobx-react';
import EN from '../../../../../constant/en';
import config from 'config';
import Performance from './Performance';
import ModelTable from './ModelTable';
const { isEN } = config;
import { PVA } from '../../../../Charts';
import Project from 'stores/Project';
import Model from 'stores/Model';
interface Interface {
  project: Project;
  models: Model[];
  exportReport: (s: string) => () => void;
  sort: {
    key: string,
    value: number
  };
  handleSort: (s: string) => void;
}

@observer
export default class RegressionView extends Component<Interface> {
  onSelect = model => {
    this.props.project.setSelectModel(model.id);
    this.props.project.upIsHoldout(false);
  };

  render() {
    const { models, project, exportReport, sort, handleSort } = this.props;
    const {
      train2Finished,
      trainModel,
      abortTrain,
      selectModel: current,
      isAbort,
      recommendModel,
      mapHeader,
      target,
      newVariable,
      stopIds,
      dataViews
    } = project;
    if (!current) return null;
    const currentPerformance = current
      ? (current.chartData.roc_auc.macro > 0.8 && EN.GOOD) ||
      (current.chartData.roc_auc.macro > 0.6 && EN.OK) ||
      EN.NotSatisfied : ''
    const newMapHeader = {
      ...mapHeader.reduce((prev, v, k) => Object.assign(prev, { [k]: v }), {}),
      ...newVariable.reduce((prev, v) => Object.assign(prev, { [v]: v }), {}),
    };

    return (
      <div>
        <div className={styles.result}>
          <div className={styles.box}>
            <div className={styles.title}>
              <span>{EN.RecommendedAModel}</span>
            </div>
            <div className={styles.row}>
              <span>{EN.ModelingResult}: </span>
              <div className={styles.status}>
                &nbsp;&nbsp;{currentPerformance}
              </div>
            </div>
            <div className={styles.row}>
              <span>
                {EN.SelectedModel} :
                <a className={styles.nohover}>&nbsp;{current.modelName}</a>
              </span>
            </div>
            <div className={styles.row}>
              <span>
                {EN.Target} :
                <a className={styles.nohover}>&nbsp;{mapHeader[target]}</a>
              </span>
            </div>
            <div className={styles.row}>
              <span>
                {EN.MultiUnique} :
                <a className={styles.nohover}>&nbsp;{dataViews[target].uniqueValues}</a>
              </span>
            </div>
            {/* <Performance current={current} /> */}
          </div>
          {/* <PVA
            key="pva"
            x_name={EN.PointNumber}
            y_name={
              isEN
                ? `${EN.Groupaverage} ${mapHeader[target]}`
                : `${mapHeader[target]} ${EN.Groupaverage}`
            }
            model={selectModel}
            project={project}
          /> */}
        </div>
        <div className={styles.line} />
        <ModelTable
          models={models}
          current={current}
          onSelect={this.onSelect}
          train2Finished={train2Finished}
          trainModel={trainModel}
          abortTrain={abortTrain}
          isAbort={isAbort}
          project={project}
          exportReport={exportReport}
          recommendId={recommendModel.id}
          sort={sort}
          handleSort={handleSort}
          mapHeader={newMapHeader}
          stopIds={stopIds}
        />
      </div>
    );
  }
}
