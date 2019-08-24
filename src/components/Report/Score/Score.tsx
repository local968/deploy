import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import styles from './AdvancedView.module.css';
import { observable, computed } from 'mobx';
import EN from '../../../constant/en';
import AdvancedModelTable from './AdvancedModelTable';
import ModelComp from './ModelComp';
interface Interface {
  models:any
  project:any
  projectStore?:any
  sort:any
  metric:any
  handleSort:any
}
@inject('projectStore')
@observer
export default class Score extends Component<Interface> {
  @observable currentSettingId = 'all';

  @computed
  get filtedModels() {
    const { models, project, projectStore, sort, metric } = this.props;
    let _filtedModels = [...models];

    let { stopFilter, oldfiltedModels } = projectStore;

    const sortMethods = (aModel, bModel) => {
      switch (sort.key) {
        case 'F1-Score': {
          const aFitIndex = aModel.fitIndex;
          const bFitIndex = bModel.fitIndex;
          const aModelData = aModel.chartData.roc.F1[aFitIndex];
          const bModelData = bModel.chartData.roc.F1[bFitIndex];
          return (aModelData - bModelData) * sort.value;
        }
        case 'Precision': {
          const aFitIndex = aModel.fitIndex;
          const bFitIndex = bModel.fitIndex;
          const aModelData = aModel.chartData.roc.Precision[aFitIndex];
          const bModelData = bModel.chartData.roc.Precision[bFitIndex];
          return (aModelData - bModelData) * sort.value;
        }
        case 'Recall': {
          const aFitIndex = aModel.fitIndex;
          const bFitIndex = bModel.fitIndex;
          const aModelData = aModel.chartData.roc.Recall[aFitIndex];
          const bModelData = bModel.chartData.roc.Recall[bFitIndex];
          return (aModelData - bModelData) * sort.value;
        }
        case 'LogLoss': {
          const aFitIndex = aModel.fitIndex;
          const bFitIndex = bModel.fitIndex;
          const aModelData = aModel.chartData.roc.LOGLOSS[aFitIndex];
          const bModelData = bModel.chartData.roc.LOGLOSS[bFitIndex];
          return (aModelData - bModelData) * sort.value;
        }
        case 'Cutoff Threshold': {
          const aFitIndex = aModel.fitIndex;
          const bFitIndex = bModel.fitIndex;
          const aModelData = aModel.chartData.roc.Threshold[aFitIndex];
          const bModelData = bModel.chartData.roc.Threshold[bFitIndex];
          return (aModelData - bModelData) * sort.value;
        }
        case 'Normalized RMSE': {
          const aModelData = aModel.score.validateScore.nrmse;
          const bModelData = bModel.score.validateScore.nrmse;
          return (aModelData - bModelData) * sort.value;
        }
        case 'RMSE': {
          const aModelData = aModel.score.validateScore.rmse;
          const bModelData = bModel.score.validateScore.rmse;
          return (aModelData - bModelData) * sort.value;
        }
        case 'MSLE': {
          const aModelData = aModel.score.validateScore.msle;
          const bModelData = bModel.score.validateScore.msle;
          return (aModelData - bModelData) * sort.value;
        }
        case 'RMSLE': {
          const aModelData = aModel.score.validateScore.rmsle;
          const bModelData = bModel.score.validateScore.rmsle;
          return (aModelData - bModelData) * sort.value;
        }
        case 'MSE': {
          const aModelData = aModel.score.validateScore.mse;
          const bModelData = bModel.score.validateScore.mse;
          return (aModelData - bModelData) * sort.value;
        }
        case 'MAE': {
          const aModelData = aModel.score.validateScore.mae;
          const bModelData = bModel.score.validateScore.mae;
          return (aModelData - bModelData) * sort.value;
        }
        case 'R2': {
          const aModelData = aModel.score.validateScore.r2;
          const bModelData = bModel.score.validateScore.r2;
          return (aModelData - bModelData) * sort.value;
        }
        case 'AdjustR2': {
          const aModelData = aModel.score.validateScore.adjustR2;
          const bModelData = bModel.score.validateScore.adjustR2;
          return (aModelData - bModelData) * sort.value;
        }
        case EN.Validation: {
          const { problemType } = project;
          let aModelData, bModelData;
          if (problemType === 'Regression') {
            aModelData = aModel.score.validateScore[metric || 'r2'];
            bModelData = bModel.score.validateScore[metric || 'r2'];
          } else {
            aModelData =
              metric === 'auc'
                ? aModel.score.validateScore[metric]
                : aModel[metric + 'Validation'];
            bModelData =
              metric === 'auc'
                ? bModel.score.validateScore[metric]
                : bModel[metric + 'Validation'];
          }
          return (aModelData - bModelData) * sort.value;
        }
        case EN.Holdout: {
          const { problemType } = project;
          let aModelData, bModelData;
          if (problemType === 'Regression') {
            aModelData = aModel.score.holdoutScore[metric || 'r2'];
            bModelData = bModel.score.holdoutScore[metric || 'r2'];
          } else {
            aModelData =
              metric === 'auc'
                ? aModel.score.holdoutScore[metric]
                : aModel[metric + 'Holdout'];
            bModelData =
              metric === 'auc'
                ? bModel.score.holdoutScore[metric]
                : bModel[metric + 'Holdout'];
          }
          return (aModelData - bModelData) * sort.value;
        }
        case 'KS': {
          const aFitIndex = aModel.fitIndex;
          const bFitIndex = bModel.fitIndex;
          const aModelData = aModel.chartData.roc.KS[aFitIndex];
          const bModelData = bModel.chartData.roc.KS[bFitIndex];
          return (aModelData - bModelData) * sort.value;
        }
        case EN.Time:
          return (
            (sort.value === 1 ? 1 : -1) *
            ((aModel.createTime || 0) - (bModel.createTime || 0))
          );
        case EN.ModelName:
        default:
          return (
            (aModel.modelName > bModel.modelName ? 1 : -1) *
            (sort.value === 1 ? 1 : -1)
          );
      }
    };

    projectStore.changeNewfiltedModels(_filtedModels);
    if (!oldfiltedModels) {
      projectStore.changeOldfiltedModels(_filtedModels);
      oldfiltedModels = _filtedModels;
    }
    if (stopFilter && oldfiltedModels) {
      _filtedModels = oldfiltedModels.sort(sortMethods);
    } else {
      _filtedModels = _filtedModels.sort(sortMethods);
    }

    if (this.currentSettingId === 'all') return _filtedModels;
    const currentSetting = project.settings.find(
      setting => setting.id === this.currentSettingId,
    );
    if (
      currentSetting &&
      currentSetting.models &&
      currentSetting.models.length > 0
    )
      return _filtedModels.filter(model =>
        currentSetting.models.find(id => model.id === id),
      );
    return _filtedModels;
  }

  @computed
  get performance() {
    try {
      const { project } = this.props;
      const { selectModel: current } = project;
      if (project.problemType === 'Classification') {
        return current
          ? (current.score.validateScore.auc > 0.8 && EN.GOOD) ||
              (current.score.validateScore.auc > 0.6 && EN.OK) ||
              EN.NotSatisfied
          : '';
      } else {
        return current
          ? (current.score.validateScore.r2 > 0.5 && EN.Acceptable) ||
              EN.NotAcceptable
          : '';
      }
    } catch (e) {
      return 'OK';
    }
  }

  @computed
  get metricOptions() {
    const { project } = this.props;
    if (project && project.problemType) {
      return project.problemType === 'Classification'
        ? [
            {
              display: 'Accuracy',
              key: 'acc',
            },
            {
              display: 'AUC',
              key: 'auc',
            },
            {
              display: 'F1',
              key: 'f1',
            },
            {
              display: 'Precision',
              key: 'precision',
            },
            {
              display: 'Recall',
              key: 'recall',
            },
          ]
        : [
            {
              display: 'MSE',
              key: 'mse',
            },
            {
              display: 'RMSE',
              key: 'rmse',
            },
            {
              display: (
                <div>
                  R<sup>2</sup>
                </div>
              ),
              key: 'r2',
            },
          ];
    }
    return [];
  }

  constructor(props) {
    super(props);
    props.projectStore.changeOldfiltedModels(undefined);
  }

  render() {
    const { project, sort, handleSort, metric } = this.props;
    const { problemType, selectModel: current } = project;
    const currMetric =
      this.metricOptions.find(
        m =>
          m.key ===
          (metric || (problemType === 'Classification' ? 'auc' : 'r2')),
      ) || {};

    let currentPerformance = '';
    if (problemType === 'MultiClassification') {
      currentPerformance = current
        ? (current.chartData.roc_auc.macro > 0.8 && EN.GOOD) ||
          (current.chartData.roc_auc.macro > 0.6 && EN.OK) ||
          EN.NotSatisfied
        : '';
    } else {
      currentPerformance = this.performance;
    }
    return (
      <div className={styles.advancedModelResult}>
        <div className={styles.modelResult}>
          {EN.ModelingResults} :{' '}
          <div className={styles.status}>&nbsp;&nbsp;{currentPerformance}</div>
        </div>
        <div className={styles.middle}>
          {project.problemType === 'Classification' && (
            <ModelComp
              models={this.filtedModels} />
          )}
        </div>
        <AdvancedModelTable
          {...this.props}
          models={this.filtedModels}
          project={project}
          sort={sort}
          handleSort={handleSort}
          metric={currMetric}
        />
      </div>
    );
  }
}

