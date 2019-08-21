import { observer } from 'mobx-react';
import React, { Component } from 'react';
import EN from '../../../constant/en';
import styles from './AdvancedView.module.css';
import { Icon } from 'antd';
import { toJS } from 'mobx';
import Chart from '../../Charts/Chart';
import { Hint } from '../../Common';
import MultiClassificationModelRow from './MultiClassificationModelRow';
import ClassificationModelRow from './ClassificationModelRow';
import RegressionModleRow from './RegressionModleRow';

const questMarks = {
  Accuracy: EN.AccuracyHint,
  "Micro-P":EN.MicroPHint,
  "Micro-R":EN.MicroRHint,
  "Micro-F1":EN.MicroF1Hint,
  "Micro-AUC":EN.MicroAUCHint,
  "Macro-P":EN.MacroPHint,
  "Macro-R":EN.MacroRHint,
  "Macro-F1":EN.MacroF1Hint,
  "Macro-AUC":EN.MacroAUCHint,
  Kappa:EN.KappaHint,
  Recall: EN.Itrepresentsthecompleteness,
  'Cutoff Threshold': EN.Manyclassifiersareabletoproduce,
  'F1-Score': <p>{EN.TheF1scoreistheharmonicmean}<br /><br />{EN.PrecisionRecall}</p>,
  'Fbeta': <p>{EN.TheFbetascoreistheharmonicmean}<br /><br />{EN.PrecisionRecallbeta}</p>,
  Precision: <p>{EN.Itmeasureshowmanytruepositivesamong}</p>,
  KS: EN.Efficientwaytodetermine,
  'Normalized RMSE': EN.RootMeanSquareError,
  R2: EN.R2isastatisticalmeasure,
  RMSE: EN.RootMeanSquareErrorprediction,
  RMSLE: EN.RMSLEissimilarwithRMSE,
  MSE: EN.MeanSquaredErro,
  MAE: EN.MeanAbsoluteError,
  AdjustR2: EN.TheadjustedR2tells,
  LogLoss: <p>{EN.LogLossis}<br /><br />{EN.Thelikelihoodfunctionanswers}</p>
};

interface Interface {
  models: any;
  project: any;
  sort: any;
  handleSort: any;
  metric: any;
}


@observer
class AdvancedModelTable extends Component<Interface> {
  onClickCheckbox = modelId => e => {
    this.props.project.setSelectModel(modelId);
    e.stopPropagation();
  };

  render() {
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
      sort,
      handleSort,
      metric,
      project,
    } = this.props;
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
    const arr = [];
    const replaceR2 = str => str.replace(/R2/g, 'R²');
    const getHint = text =>
      questMarks.hasOwnProperty(text.toString()) ? (
        <Hint content={questMarks[text.toString()]} />
      ) : (
        ''
      );
    const headerData = texts.reduce((prev, curr) => {
      const label = (
        <div className={styles.headerLabel} title={replaceR2(curr)}>
          {replaceR2(curr)}
        </div>
      );
      if (curr === sort.key) {
        if (sort.value === 1)
          return {
            ...prev,
            [curr]: (
              <div onClick={handleSort.bind(null, curr)}>
                {getHint(curr)} {label}
                <Icon type="up" />
              </div>
            ),
          };
        if (sort.value === -1)
          return {
            ...prev,
            [curr]: (
              <div onClick={handleSort.bind(null, curr)}>
                {getHint(curr)} {label}
                <Icon type="up" style={{ transform: 'rotateZ(180deg)' }} />
              </div>
            ),
          };
      } else {
        if (arr.includes(curr)) {
          return { ...prev, [curr]: curr };
        }
        return {
          ...prev,
          [curr]: (
            <div onClick={handleSort.bind(null, curr)}>
              {getHint(curr)} {label}
              <Icon type="minus" />
            </div>
          ),
        };
      }
      return prev;
    }, {});
    const header = (
      <div className={styles.tableHeader}>
        <Row>
          {texts.map(t => (
            <RowCell data={headerData[t]} key={t} />
          ))}
        </Row>
      </div>
    );
    const dataSource = models.map(m => {
      switch (problemType) {
        case 'Classification':
          return (
            <ClassificationModelRow
              project={this.props.project}
              no={no}
              yes={yes}
              key={m.id}
              texts={texts}
              onClickCheckbox={this.onClickCheckbox(m.id)}
              checked={selectModel.id === m.id}
              model={m}
              metric={metric.key}
            />
          );
        case 'MultiClassification':
          return (
            <MultiClassificationModelRow
              project={this.props.project}
              key={m.id}
              texts={texts}
              onClickCheckbox={this.onClickCheckbox(m.id)}
              checked={selectModel.id === m.id}
              model={m}
            />
          );
        default:
          return (
            <RegressionModleRow
              project={this.props.project}
              key={m.id}
              texts={texts}
              onClickCheckbox={this.onClickCheckbox(m.id)}
              checked={selectModel.id === m.id}
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
          />
        );
      }
      return <React.Fragment />;
    };

    return (
      <div className={styles.advancedModelTableDiv}>
        <RegressChart />
        {header}
        <div className={styles.advancedModelTable}>{dataSource}</div>
      </div>
    );
  }
}
export default AdvancedModelTable;
