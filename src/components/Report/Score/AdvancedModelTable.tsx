import { observer } from 'mobx-react';
import React from 'react';
import EN from '../../../constant/en';
import styles from './AdvancedView.module.css';
import { toJS } from 'mobx';
import Chart from '../../Charts/Chart';
import MultiClassificationModelRow from './MultiClassificationModelRow';
import ClassificationModelRow from './ClassificationModelRow';
import RegressionModleRow from './RegressionModleRow';
import config from '../../../config';
const { isEN } = config;

interface Interface {
  models: any;
  project: any;
  sort: any;
  handleSort: any;
  metric: any;
}

const AdvancedModelTable = observer((props: Interface) => {
  const {
    models,
    project: {
      problemType,
      selectModel,
      targetArray,
      targetColMap,
      renameVariable,
      target,
      mapHeader,
      m_cro,
    },
    metric,
    project,
  } = props;

  const [v0, v1] = !targetArray.length
    ? Object.keys(targetColMap)
    : targetArray;
  const [no, yes] = [renameVariable[v0] || v0, renameVariable[v1] || v1];

  let texts;

  switch (problemType) {
    case 'Classification':
      texts = [
        EN.ModelName,
        EN.Time,
        'Fbeta',
        'Precision',
        'Recall',
        'LogLoss',
        'Cutoff Threshold',
        'KS',
        EN.Validation,
        EN.Holdout,
      ];
      break;
    case 'MultiClassification':
      texts = [
        EN.ModelName,
        EN.Time,
        'Accuracy',
        'Micro-P',
        'Micro-R',
        'Micro-F1',
        'Micro-AUC',
        'Macro-P',
        'Macro-R',
        'Macro-F1',
        'Macro-AUC',
        'MCC',
        'Kappa',
        'Jaccard',
        'HammingLoss',
        EN.Validation,
        EN.Holdout,
      ].filter(itm => {
        const rm = ['macro', 'micro'].filter(
          itm => itm !== m_cro.toLowerCase(),
        )[0];
        return (
          itm.toLowerCase().startsWith(m_cro) ||
          !itm.toLowerCase().startsWith(rm)
        );
      });
      break;
    default:
      texts = [
        EN.ModelName,
        EN.Time,
        'Normalized RMSE',
        'RMSE',
        'MSLE',
        'RMSLE',
        'MSE',
        'MAE',
        'R2',
        'AdjustR2',
        EN.Validation,
        EN.Holdout,
      ];
  }
  const dataSource = models.map(m => {
    switch (problemType) {
      case 'Classification':
        return (
          <ClassificationModelRow
            project={project}
            no={no}
            yes={yes}
            key={m.id}
            model={m}
          />
        );
      case 'MultiClassification':
        return (
          <MultiClassificationModelRow
            project={project}
            key={m.id}
            texts={texts}
            checked={selectModel.id === m.id}
            model={m}
          />
        );
      default:
        return (
          <RegressionModleRow
            project={project}
            key={m.id}
            texts={texts}
            model={m}
            metric={metric.key}
          />
        );
    }
  });
  const RegressChart = () => {
    if (problemType !== 'Classification') {
      const graphicList = toJS(models[0].graphicList);
      graphicList.pop();
      graphicList.pop();
      return (
        <Chart
          y_name={
            isEN
              ? `${EN.Groupaverage} ${mapHeader[target]}`
              : `${mapHeader[target]} ${EN.Groupaverage}`
          }
          data={[graphicList.pop(), graphicList.pop()]}
          name="predicted-vs-actual-plot"
          project={project}
          report={true}
        />
      );
    }
    return <React.Fragment />;
  };

  return (
    <div className={styles.advancedModelTableDiv}>
      <RegressChart />
      <div className={styles.advancedModelTable}>{dataSource}</div>
    </div>
  );
});

export default AdvancedModelTable;
