import React, { useState } from 'react';
import { Hint, ProgressBar, Table, ProcessLoading, TrainModel } from 'components/Common';
import classes from './styles.module.css';
import VariableImpact from '../VariableImpact';
import Explanation from './explanation';
import AdvancedView from '../AdvancedView';
import { Tooltip, Icon, Popover, Select, message } from 'antd';
import { observer, inject } from 'mobx-react';
import { formatNumber } from '../../../../util';
import EN from '../../../../constant/en';
import moment from 'moment';
import { ISO, D3D2 } from '../../../Charts';
import MPF from '../MPF';
import DisplayOutlier from './DisplayOutlier';
import { Show } from '../../../Common';

const { Option } = Select;

function ModelResult(props) {
  const [showTips, setShowTips] = useState(false);
  const [sort, setSort] = useState({
    simple: {
      key: 'time',
      value: 1,
    },
    advanced: {
      key: EN.Time,
      value: 1,
    },
  });
  const [currentSettingId, setCurrentSettingId] = React.useState('all');
  const [view, setView] = React.useState('simple');
  const { resetSide, projectStore } = props;
  const { project } = projectStore;
  const {
    problemType,
    models,
    selectModel,
    colType,
    dataHeader,
    trainHeader,
    id,
    etlIndex,
    fileName,
    mapHeader,
    newVariable,
    settings,
    loadModel,
    measurement,
  } = project;
  const list = Object.entries(colType)
    .filter(
      t =>
        t[1] === 'Categorical' &&
        dataHeader.includes(t[0]) &&
        !trainHeader.includes(t[0]),
    )
    .map(c => c[0]);
  const newMapHeader = {
    ...mapHeader.reduce((prev, v, k) => Object.assign(prev, { [k]: v }), {}),
    ...newVariable.reduce((prev, v) => Object.assign(prev, { [v]: v }), {}),
  };
  React.useEffect(() => {
    resetSide();
  });
  let filterModels = [...models];
  const currentSetting =
    currentSettingId === 'all'
      ? null
      : settings.find(setting => setting.id === currentSettingId);
  const measurementLabel =
    (measurement === 'CH' && 'CH Index') ||
    (measurement === 'silhouette_euclidean' && EN.SihouetteScore) ||
    'CVNN';
  const measurementHint =
    (measurement === 'CH' && EN.CHIndexHint) ||
    (measurement === 'silhouette_euclidean' && EN.SihouetteScoreHint) ||
    EN.CVNNHint;
  if (currentSetting)
    filterModels = filterModels.filter(model => model.settingId === currentSetting.id);

  const [visible, setVisible] = React.useState(false);
  // console.log('selectModel',selectModel,selectModel.multiVarPlotData);
  if (!selectModel || !models.length) return null;
  if (loadModel) return <ProcessLoading style={{ position: 'fixed' }} />;

  const cannotDeploy =
    problemType === 'Clustering' && !selectModel.supportDeploy;
  const realName = fileName.endsWith('.csv') ? fileName.slice(0, -4) : fileName;
  // const isDownload = ['DBSCAN', 'Agg', 'MeanShift'].some(v => selectModel.modelName.toString().toLowerCase().startsWith(v.toLowerCase()))

  const isNull = problemType === 'Clustering' && selectModel.dbscanClusters < 2

  const changeView = view => {
    setView(view);
  };

  const abortTrain = stopId => {
    project.abortTrain(stopId);
  };

  const showDict = () => {
    setVisible(true);
  };

  const hideDict = () => {
    setVisible(false);
  };

  const onSelect = model => () => {
    if (selectModel.id === model.id) return;
    return project.updateProject({
      selectId: model.id,
    });
  };

  const changeSetting = settingId => {
    setCurrentSettingId(settingId);
  };

  const handleSort = (view, key) => {
    const _sort = sort[view];
    if (!_sort) return;
    if (_sort.key === key) _sort.value = -_sort.value;
    else {
      _sort.key = key;
      _sort.value = 1;
    }
    setSort({ ...sort, [view]: _sort });
  };

  const deploy = () => {
    // const { project } = this.props.projectStore;
    const { selectModel: current } = project;
    if (cannotDeploy) return;
    // const { newVariable, trainHeader, expression } = project
    // const newVariableLabel = newVariable.filter(v => !trainHeader.includes(v))
    // const variables = [...new Set(newVariableLabel.map(label => label.split("_")[1]))]
    // const exps = variables.map(v => expression[v]).filter(n => !!n).join(";").replace(/\|/g, ",")

    props.deploymentStore
      .addDeployment(
        project.id,
        project.name,
        current.modelName,
        project.problemType,
        project.mapHeader,
      )
      .then(id => props.routing.push('/deploy/project/' + id));
  };

  const createPmml = () => {
    selectModel.createPmml().then(result => {
      if (result.status < 0) message.error(result['processError'])
    })
  }

  const createContainer = () => {
    selectModel.createContainer().then(result => {
      if (result.status < 0) message.error(result['processError'])
    })
  }

  return (
    <div className={classes.root}>
      {problemType === 'Outlier' && (
        <h3 className={classes.header}>{EN.ModelingResult}</h3>
      )}
      {problemType === 'Clustering' && (
        <div className={classes.tabs}>
          <span
            className={`${classes.tab} ${
              view === 'simple' ? classes.active : ''
              }`}
            onClick={() => changeView('simple')}
          >
            {EN.SimpleView}
          </span>
          <span
            className={`${classes.tab} ${
              view === 'advanced' ? classes.active : ''
              }`}
            onClick={() => changeView('advanced')}
          >
            {EN.AdvancedView}
          </span>
        </div>
      )}
      {view === 'simple' && (
        <div className={classes.body}>
          <div className={classes.top}>
            <div className={classes.left}>
              <div className={classes.descriptions}>
                {EN.RecommendedAModel}
                <br />
                <small>
                  {
                    EN.Youcanalsotellusyourbusinessneedstogetamorepreciserecommendation
                  }
                </small>
                <br />
                {EN.SelectedModel}:{' '}
                <span
                  style={{ display: 'inline-flex', color: '#448EED' }}
                  className={classes.modelName}
                >
                  {selectModel.modelName}
                </span>
              </div>
              {problemType === 'Outlier' && (
                <div className={classes.scores}>
                  <div className={classes.score}>
                    <div className={classes.orange}>
                      {formatNumber(selectModel.score.score)}
                    </div>
                    <span className={classes.label}>
                      {EN.Score} <Hint content={EN.ScoreHint} />
                    </span>
                  </div>
                  <div className={classes.rate}>
                    <div className={classes.blood}>
                      {formatNumber(selectModel.rate || 0)}
                    </div>
                    <span
                      className={classes.rateLabel}
                      style={{ justifyContent: 'center' }}
                    >
                      {EN.ContaminationRate}{' '}
                      <Hint content={EN.ContaminationRateHint} />
                    </span>
                  </div>
                </div>
              )}
              {problemType === 'Clustering' && (
                <div className={classes.scores}>
                  <div className={classes.cvnn}>
                    <div className={classes.orange}>
                      {isNull ? 'null' : formatNumber(selectModel.score[measurement])}
                    </div>
                    <span className={classes.label}>
                      {measurementLabel} <Hint content={measurementHint} />
                    </span>
                  </div>
                  <div className={classes.cluster}>
                    <div className={classes.blood}>
                      {isNull ? selectModel.dbscanClusters : Object.keys(selectModel.labelWithImportance).length}
                    </div>
                    <span
                      className={classes.rateLabel}
                      style={{ justifyContent: 'center' }}
                    >
                      {EN.TheNumberofClusters}
                    </span>
                  </div>
                  <div className={classes.rSquared}>
                    <div className={classes.green}>
                      {isNull ? 'null' : formatNumber(selectModel.score.RSquared)}
                    </div>
                    <span
                      className={classes.rateLabel}
                      style={{ justifyContent: 'center' }}
                    >
                      R squared <Hint content={EN.squaredHint} />
                    </span>
                  </div>
                </div>
              )}
              {!!list.length && (
                <div className={classes.dict}>
                  <button className={classes.button} onClick={showDict}>
                    <span>{EN.MappingDictionary}</span>
                  </button>
                  <Popover
                    trigger="click"
                    getPopupContainer={el => el.parentElement}
                    placement="bottomLeft"
                    visible={visible}
                    onVisibleChange={hideDict}
                    content={
                      <MappingDict
                        project={project}
                        list={list}
                        hideDict={hideDict}
                        mapHeader={newMapHeader}
                      />
                    }
                  />
                </div>
              )}
            </div>
            <div className={classes.right} style={{ flex: 1, width: 200 }}>
              {project.problemType === 'Outlier' ? (
                <ISO />
              ) : (
                  isNull ? null : <D3D2 url={selectModel.multiVarPlotData} />
                )}
            </div>
          </div>
          {problemType === 'Clustering' && (
            <ClusteringTable
              abortTrain={abortTrain}
              project={project}
              models={filterModels}
              sort={sort.simple}
              handleSort={key => handleSort('simple', key)}
              onSelect={onSelect}
              mapHeader={newMapHeader}
            />
          )}
          {problemType === 'Outlier' && (
            <OutlierTable
              abortTrain={abortTrain}
              project={project}
              models={filterModels}
              sort={sort.simple}
              handleSort={key => handleSort('simple', key)}
              onSelect={onSelect}
              mapHeader={newMapHeader}
            />
          )}
        </div>
      )}
      {view === 'advanced' && (
        <AdvancedView
          project={project}
          models={models}
          sort={sort.advanced}
          handleSort={key => handleSort('advanced', key)}
          currentSettingId={currentSettingId}
          changeSetting={changeSetting}
        />
      )}
      <div className={classes.buttonBlock}>
        {cannotDeploy ? (
          <Tooltip title={EN.cannotDeploy} visible={showTips}>
            <button
              className={`${classes.button} ${classes.disabled}`}
              onMouseOver={() => setShowTips(true)}
              onMouseOut={() => setShowTips(false)}
            >
              <span>{EN.DeployTheModel}</span>
            </button>
          </Tooltip>
        ) : (
            <button className={`${classes.button}`} onClick={deploy}>
              <span>{EN.DeployTheModel}</span>
            </button>
          )}
        {problemType === 'Clustering' && (isNull ? <button
          className={`${classes.button} ${classes.disabled}`}
          style={{ marginLeft: '.1em' }}
        >
          <span>{EN.Exportmodelresults}</span>
        </button> :
          <a
            href={`/upload/download/model?projectId=${id}&filename=${encodeURIComponent(
              `${realName}-${selectModel.modelName}-predict.csv`,
            )}&mid=${selectModel.modelName}&etlIndex=${etlIndex}`}
            target="_black"
          >
            <button
              className={`${classes.button}`}
              style={{ marginLeft: '.1em' }}
            >
              <span>{EN.Exportmodelresults}</span>
            </button>
          </a>)
        }
        {problemType === 'Outlier' && (
          <a
            href={`/upload/download/outlier?projectId=${id}&filename=${encodeURIComponent(
              `${realName}-${selectModel.modelName}-predict.csv`,
            )}&mid=${selectModel.modelName}&rate=${formatNumber(
              selectModel.rate,
            )}&etlIndex=${etlIndex}`}
            target="_black"
          >
            <button
              className={`${classes.button}`}
              style={{ marginLeft: '.1em' }}
            >
              <span>{EN.Exportmodelresults}</span>
            </button>
          </a>
        )}
        {!selectModel.getPmml ? <button className={classes.button} onClick={createPmml}>
          <span>{`${EN.CreatePmml}`}</span>
        </button> : !selectModel.pmmlData ?
            <Tooltip title={EN.CannotExportPmml}>
              <button className={`${classes.button} ${classes.disabled}`}>
                <span>{`${EN.DownloadPmml}`}</span>
              </button>
            </Tooltip> : <a href={`/upload/download/pmml?projectId=${id}&mid=${selectModel.modelName}`} target='_blank'>
              <button className={classes.button}>
                <span>{`${EN.DownloadPmml}`}</span>
              </button>
            </a>}
        {!selectModel.getContainer ? <button className={classes.button} onClick={createContainer}>
          <span>{`${EN.CreateContainer}`}</span>
        </button> : !selectModel.containerData ?
            <Tooltip title={EN.CannotExportPmml}>
              <button className={`${classes.button} ${classes.disabled}`}>
                <span>{`${EN.DownloadContainer}`}</span>
              </button>
            </Tooltip> : <a href={`/upload/download/container?projectId=${id}&mid=${selectModel.modelName}`} target='_blank'>
              <button className={classes.button}>
                <span>{`${EN.DownloadContainer}`}</span>
              </button>
            </a>}
      </div>
    </div>
  );
}

export default inject('projectStore', 'deploymentStore', 'routing')(
  observer(ModelResult),
);

const OutlierTable = observer(props => {
  const {
    models,
    sort,
    handleSort,
    project,
    abortTrain,
    onSelect,
    mapHeader,
  } = props;
  const {
    train2Finished,
    trainModel,
    isAbort,
    recommendModel,
    selectModel,
    stopIds,
  } = project;
  const hasTarget = models.some(m => !!m.target.length);
  const sortModels = React.useMemo(() => {
    const { key, value } = sort;
    const fn = (a, b) => {
      switch (key) {
        case 'auc':
          if (hasTarget)
            return ((a.score.auc || 0) - (b.score.auc || 0)) * value;
        // if (!!target) return (a.score.auc - b.score.auc) * value
        case 'acc':
          if (hasTarget)
            return (
              ((a.accuracyData[formatNumber(a.rate)] || 0) -
                (b.accuracyData[formatNumber(b.rate)] || 0)) *
              value
            );
        // if (!!target) return (a.score.accuracy - b.score.accuracy) * value
        case 'score':
          return (a.score.score - b.score.score) * value;
        case 'rate':
          return (a.rate - b.rate) * value;
        case 'time':
          return ((a.createTime || 0) - (b.createTime || 0)) * value;
        case 'name':
        default:
          return a.modelName > b.modelName ? value : -value;
      }
    };
    return models.sort(fn);
  }, [models, sort.key, sort.value]);

  return (
    <div className={classes.table}>
      <div className={classes.rowHeader}>
        <div className={classes.rowData}>
          <div
            className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader} ${classes.modelName}`}
            onClick={() => handleSort('name')}
          >
            <span>{EN.ModelName}</span>
            <span>
              {sort.key === 'name' ? (
                <Icon
                  type="up"
                  style={
                    sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }
                  }
                />
              ) : (
                  <Icon type="minus" />
                )}
            </span>
          </div>
          <div
            className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader}`}
            onClick={() => handleSort('score')}
          >
            <span className={classes.ccellHeaderSpan}>{EN.Score} </span>
            <span>
              {sort.key === 'score' ? (
                <Icon
                  type="up"
                  style={
                    sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }
                  }
                />
              ) : (
                  <Icon type="minus" />
                )}
            </span>
          </div>
          <div
            className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader}`}
            onClick={() => handleSort('rate')}
          >
            <Tooltip title={EN.ContaminationRate}>
              {EN.ContaminationRate}
            </Tooltip>
            {/*<span className={classes.ccellHeaderSpan}>{EN.ContaminationRate}</span>*/}
            <span>
              {sort.key === 'rate' ? (
                <Icon
                  type="up"
                  style={
                    sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }
                  }
                />
              ) : (
                  <Icon type="minus" />
                )}
            </span>
          </div>
          {hasTarget && (
            <div
              className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader}`}
              onClick={() => handleSort('auc')}
            >
              <Tooltip title={EN.PerformanceAUC}>{EN.PerformanceAUC}</Tooltip>
              {/*<span className={classes.ccellHeaderSpan}>{EN.ContaminationRate}</span>*/}
              <span>
                {sort.key === 'auc' ? (
                  <Icon
                    type="up"
                    style={
                      sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }
                    }
                  />
                ) : (
                    <Icon type="minus" />
                  )}
              </span>
            </div>
          )}
          {hasTarget && (
            <div
              className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader}`}
              onClick={() => handleSort('acc')}
            >
              <Tooltip title={EN.Accuracys}>{EN.Accuracys}</Tooltip>
              {/*<span className={classes.ccellHeaderSpan}>{EN.ContaminationRate}</span>*/}
              <span>
                {sort.key === 'acc' ? (
                  <Icon
                    type="up"
                    style={
                      sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }
                    }
                  />
                ) : (
                    <Icon type="minus" />
                  )}
              </span>
            </div>
          )}
          <div
            className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader}`}
            onClick={() => handleSort('time')}
          >
            <Tooltip title={EN.Time}>{EN.Time} </Tooltip>
            {/*<span className={classes.ccellHeaderSpan}>{EN.clusters} </span>*/}
            <span>
              {sort.key === 'time' ? (
                <Icon
                  type="up"
                  style={
                    sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }
                  }
                />
              ) : (
                  <Icon type="minus" />
                )}
            </span>
          </div>
          <div
            className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader}`}
          >
            <Tooltip title={EN.VariableImpact}>{EN.VariableImpact}</Tooltip>
            {/*<span>{EN.VariableImpact}</span>*/}
          </div>
          <div
            className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader}`}
          >
            <Tooltip title={EN.ModelProcessFlow}>{EN.ModelProcessFlow}</Tooltip>
            {/*<span>{EN.ModelProcessFlow}</span>*/}
          </div>
          <div
            className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader}`}
          >
            <span style={{ overflow: 'visible' }}>
              <Hint content={EN.DisplayOutlierHint} />
            </span>
            <Tooltip title={EN.ModelProcessFlow}>{EN.DisplayOutlier}</Tooltip>
            {/*<span>{EN.ModelProcessFlow}</span>*/}
          </div>
        </div>
      </div>
      <div className={classes.rowBox}>
        {sortModels.map(m => {
          return (
            <OutlierRow
              model={m}
              isRecommend={m.id === recommendModel.id}
              isSelect={m.id === selectModel.id}
              onSelect={onSelect}
              key={m.id}
              mapHeader={mapHeader}
              project={project}
              hasTarget={hasTarget}
            />
          );
        })}
        {!train2Finished && <div className={classes.rowData}>
          <div className={classes.trainingModel}>
            <Tooltip title={EN.ModelProcessing}>
              {EN.ModelProcessing}
            </Tooltip>
          </div>
          <Show
            name='result_abortButton_UN_OUT'
          >
            <div
              className={`${classes.abortButton} ${classes.abortButtonAll}`}
              onClick={
                !isAbort
                  ? () => project.abortTrainByEtl()
                  : null
              }
            >
              {isAbort ? (
                <Icon type="loading" />
              ) : (
                  <span>{EN.AbortTrainingAll}</span>
                )}
            </div>
          </Show>
        </div>}
        {!train2Finished &&
          stopIds.map(stopId => {
            const trainingModel = trainModel[stopId];
            if (!trainingModel) return null;
            return <TrainModel trainingModel={trainingModel} isAbort={isAbort} abortTrain={abortTrain} show='result_abortButton_UN_OUT' key={stopId} />
          })}
      </div>
    </div>
  );
});

const OutlierRow = observer(props => {
  const [type, setType] = React.useState('');
  const [visible, setVisible] = React.useState(false);
  const {
    model,
    isRecommend,
    isSelect,
    onSelect,
    mapHeader,
    hasTarget,
    project,
  } = props;

  const toggleImpact = _type => {
    if (!visible) {
      //本来是关着的
      setType(_type);
      setVisible(true);
      return;
    }
    if (type === _type) {
      setVisible(false);
    } else {
      setType(_type);
    }
  };

  return (
    <div className={classes.rowBody}>
      <Tooltip
        placement="left"
        title={isRecommend ? EN.Recommended : EN.Selected}
        visible={isSelect || isRecommend}
        overlayClassName={classes.recommendLabel}
        autoAdjustOverflow={false}
        arrowPointAtCenter={true}
        getPopupContainer={el => el.parentElement}
      >
        <div className={classes.rowData}>
          <div className={classes.modelSelect}>
            <input
              type="radio"
              name="modelSelect"
              checked={isSelect}
              onChange={onSelect(model)}
            />
          </div>
          <div className={`${classes.ccell} ${classes.modelName}`}>
            <Tooltip title={model.modelName}>{model.modelName}</Tooltip>
            {/*<span>{model.modelName}</span>*/}
          </div>
          <div className={`${classes.ccell}`}>
            <span>{formatNumber(model.score.score)}</span>
          </div>
          <div className={`${classes.ccell}`}>
            <span>{formatNumber(model.rate || 0)}</span>
          </div>
          {hasTarget && (
            <div className={`${classes.ccell}`}>
              <span>
                {!model.target.length
                  ? 'null'
                  : formatNumber(model.score.auc || 0)}
              </span>
            </div>
          )}
          {hasTarget && (
            <div className={`${classes.ccell}`}>
              <span>
                {!model.target.length
                  ? 'null'
                  : formatNumber(
                    model.accuracyData[formatNumber(model.rate)] || 0,
                  )}
              </span>
            </div>
          )}
          <div className={`${classes.ccell}`}>
            <span>
              {model.createTime
                ? moment.unix(model.createTime).format('YYYY/MM/DD HH:mm')
                : ''}
            </span>
          </div>
          <div className={`${classes.ccell} ${classes.compute}`}>
            <span onClick={() => toggleImpact('impact')}>
              <img src={'/static/modeling/Variable.svg'} alt="" /> {EN.Compute}
            </span>
          </div>
          <div className={`${classes.ccell} ${classes.compute}`}>
            <span onClick={() => toggleImpact('process')}>
              <img src={'/static/modeling/Process.svg'} alt="" /> {EN.Compute}
            </span>
          </div>
          <div className={`${classes.ccell} ${classes.compute}`}>
            <span onClick={() => toggleImpact('display')}>
              <img src={'/static/modeling/Process.svg'} alt="" /> {EN.Compute}
            </span>
          </div>
        </div>
      </Tooltip>
      {/* <div className={classes.rowData}> */}
      {visible && type === 'impact' && (
        <VariableImpact model={model} mapHeader={mapHeader} />
      )}
      {visible && type === 'process' && <MPF project={project} model={model} />}
      <DisplayOutlier
        getOutlierData={model.getOutlierData}
        rate={formatNumber(model.rate)}
        visiable={visible && type === 'display'}
        header={model.featureLabel.filter(
          h => !project.newVariable.includes(h),
        )}
        mapHeader={mapHeader}
        colType={project.colType}
      />
      {/* </div> */}
    </div>
  );
});

const ClusteringTable = observer(props => {
  const {
    models,
    sort,
    handleSort,
    project,
    abortTrain,
    onSelect,
    mapHeader,
  } = props;
  const {
    train2Finished,
    trainModel,
    isAbort,
    recommendModel,
    selectModel,
    measurement,
    stopIds,
  } = project;
  const hasTarget = models.some(m => !!m.target.length);
  const measurementLabel =
    (measurement === 'CH' && 'CH Index') ||
    (measurement === 'silhouette_euclidean' && EN.SihouetteScore) ||
    'CVNN';
  const measurementHint =
    (measurement === 'CH' && EN.CHIndexHint) ||
    (measurement === 'silhouette_euclidean' && EN.SihouetteScoreHint) ||
    EN.CVNNHint;
  const sortModels = React.useMemo(() => {
    const { key, value } = sort;
    const fn = (a, b) => {
      switch (key) {
        case 'adjinfo':
          if (hasTarget)
            return (
              ((!a.target.length ? 0 : a.realLabelScore.adjust_mutual_info) -
                (!b.target.length ? 0 : b.realLabelScore.adjust_mutual_info)) *
              value
            );
        // if (!!target) {
        //   return (a.realLabelScore.adjust_mutual_info - b.realLabelScore.adjust_mutual_info) * value
        // }
        case 'adjScore':
          if (hasTarget)
            return (
              ((!a.target.length ? 0 : a.realLabelScore.adjust_rand_score) -
                (!b.target.length ? 0 : b.realLabelScore.adjust_rand_score)) *
              value
            );
        // if (!!target) {
        //   return (a.realLabelScore.adjust_rand_score - b.realLabelScore.adjust_rand_score) * value
        // }
        case 'CVNN':
          return (a.score.CVNN - b.score.CVNN) * value;
        case 'rsquared':
          return (a.score.RSquared - b.score.RSquared) * value;
        case 'CH':
          return (a.score.CH - b.score.CH) * value;
        case 'silhouette_euclidean':
          return (
            (a.score.silhouette_euclidean - b.score.silhouette_euclidean) *
            value
          );
        case 'cluster':
          return (
            (Object.keys(a.labelWithImportance).length -
              Object.keys(b.labelWithImportance).length) *
            value
          );
        case 'time':
          return ((a.createTime || 0) - (b.createTime || 0)) * value;
        case 'name':
        default:
          return a.modelName > b.modelName ? value : -value;
      }
    };
    const _models = models.filter(m => m.dbscanClusters >= 2).sort(fn)
    return [..._models, ...models.filter(m => m.dbscanClusters < 2)]
  }, [models, sort.key, sort.value]);

  return (
    <div className={classes.table}>
      <div className={classes.rowHeader}>
        <div className={classes.rowData}>
          <div
            className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader} ${classes.modelName}`}
            onClick={() => handleSort('name')}
          >
            <span>{EN.ModelName}</span>
            <span>
              {sort.key === 'name' ? (
                <Icon
                  type="up"
                  style={
                    sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }
                  }
                />
              ) : (
                  <Icon type="minus" />
                )}
            </span>
          </div>
          <div
            className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader}`}
            onClick={() => handleSort(measurement)}
          >
            <span style={{ overflow: 'visible' }}>
              <Hint content={measurementHint} />
            </span>
            <Tooltip title={measurementLabel}>{measurementLabel}</Tooltip>
            <span>
              {sort.key === measurement ? (
                <Icon
                  type="up"
                  style={
                    sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }
                  }
                />
              ) : (
                  <Icon type="minus" />
                )}{' '}
            </span>
          </div>
          {/* <div className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader}`} onClick={() => handleSort('cvnn')}>
          <span style={{ overflow: 'visible' }}><Hint content={EN.CVNNHint} /></span>
          <span className={classes.ccellHeaderSpan}>CVNN</span>
          <span>{sort.key === 'cvnn' ? <Icon type='up' style={sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }} /> : <Icon type='minus' />} </span>
        </div> */}
          {/* <div className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader}`} onClick={() => handleSort('sihouette')}>
          <span style={{ overflow: 'visible' }}><Hint content={EN.SihouetteScoreHint} /></span>
          <Tooltip title={EN.SihouetteScore}>{EN.SihouetteScore}</Tooltip>
          <span>{sort.key === 'sihouette' ? <Icon type='up' style={sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }} /> : <Icon type='minus' />} </span>
        </div> */}
          {/* <div className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader}`} onClick={() => handleSort('ch')}>
          <span style={{ overflow: 'visible' }}><Hint content={EN.CHIndexHint} /></span>
          <Tooltip title={'CH Index '}>CH Index</Tooltip>
          <span>{sort.key === 'ch' ? <Icon type='up' style={sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }} /> : <Icon type='minus' />} </span>
        </div> */}
          <div
            className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader}`}
            onClick={() => handleSort('rsquared')}
          >
            <span style={{ overflow: 'visible' }}>
              <Hint content={EN.squaredHint} />
            </span>
            <Tooltip title={'R square'}>R square</Tooltip>
            <span>
              {sort.key === 'rsquared' ? (
                <Icon
                  type="up"
                  style={
                    sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }
                  }
                />
              ) : (
                  <Icon type="minus" />
                )}{' '}
            </span>
          </div>
          <div
            className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader}`}
            onClick={() => handleSort('cluster')}
          >
            <Tooltip title={EN.clusters}>{EN.clusters} </Tooltip>
            <span>
              {sort.key === 'cluster' ? (
                <Icon
                  type="up"
                  style={
                    sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }
                  }
                />
              ) : (
                  <Icon type="minus" />
                )}
            </span>
          </div>
          {!!hasTarget && (
            <div
              className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader}`}
              onClick={() => handleSort('adjinfo')}
            >
              <span style={{ overflow: 'visible' }}>
                <Hint content={EN.adjustMutualInfoHint} />
              </span>
              <Tooltip title={EN.adjustMutualInfo}>
                {EN.adjustMutualInfo}{' '}
              </Tooltip>
              <span>
                {sort.key === 'adjinfo' ? (
                  <Icon
                    type="up"
                    style={
                      sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }
                    }
                  />
                ) : (
                    <Icon type="minus" />
                  )}
              </span>
            </div>
          )}
          {!!hasTarget && (
            <div
              className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader}`}
              onClick={() => handleSort('adjScore')}
            >
              <span style={{ overflow: 'visible' }}>
                <Hint content={EN.adjustRandScoreHint} />
              </span>
              <Tooltip title={EN.adjustRandScore}>
                {EN.adjustRandScore}{' '}
              </Tooltip>
              <span>
                {sort.key === 'adjScore' ? (
                  <Icon
                    type="up"
                    style={
                      sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }
                    }
                  />
                ) : (
                    <Icon type="minus" />
                  )}
              </span>
            </div>
          )}
          <div
            className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader}`}
            onClick={() => handleSort('time')}
          >
            <Tooltip title={EN.Time}>{EN.Time} </Tooltip>
            <span>
              {sort.key === 'time' ? (
                <Icon
                  type="up"
                  style={
                    sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }
                  }
                />
              ) : (
                  <Icon type="minus" />
                )}
            </span>
          </div>
          <div
            className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader}`}
          >
            <Tooltip title={EN.VariableImpact}>{EN.VariableImpact}</Tooltip>
          </div>
          <div
            className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader}`}
          >
            <Tooltip title={EN.ModelProcessFlow}>{EN.ModelProcessFlow}</Tooltip>
          </div>
          <div
            className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader}`}
          >
            <span>
              {EN.Explaination}
              <Hint content={EN.ExplainationHint} />
            </span>
          </div>
        </div>
      </div>
      <div className={classes.rowBox}>
        {sortModels.map(m => {
          return (
            <ClusteringRow
              key={m.id}
              model={m}
              isRecommend={m.id === recommendModel.id}
              isSelect={m.id === selectModel.id}
              onSelect={onSelect}
              project={project}
              mapHeader={mapHeader}
              hasTarget={hasTarget}
            />
          );
        })}
        {!train2Finished && <div className={classes.rowData}>
          <div className={classes.trainingModel}>
            <Tooltip title={EN.ModelProcessing}>
              {EN.ModelProcessing}
            </Tooltip>
          </div>
          <Show
            name='result_abortButton_UN_AGGRE'
          >
            <div
              className={`${classes.abortButton} ${classes.abortButtonAll}`}
              onClick={
                !isAbort
                  ? () => project.abortTrainByEtl()
                  : null
              }
            >
              {isAbort ? (
                <Icon type="loading" />
              ) : (
                  <span>{EN.AbortTrainingAll}</span>
                )}
            </div>
          </Show>
        </div>}
        {!train2Finished &&
          stopIds.map(stopId => {
            const trainingModel = trainModel[stopId];
            if (!trainingModel) return null;
            return <TrainModel trainingModel={trainingModel} isAbort={isAbort} abortTrain={abortTrain} show='result_abortButton_UN_AGGRE' key={stopId} />
          })}
      </div>
    </div>
  );
});

const ClusteringRow = observer(props => {
  const {
    model,
    isRecommend,
    isSelect,
    onSelect,
    mapHeader,
    hasTarget,
    project,
  } = props;
  const { realLabelScore, target, dbscanClusters, labelWithImportance } = model;
  // const {adjust_mutual_info = '', adjust_rand_score = '' } = realLabelScore;
  const [type, setType] = React.useState('');
  const [visible, setVisible] = React.useState(false);
  const toggleImpact = _type => {
    if (!visible) {
      //本来是关着的
      setType(_type);
      setVisible(true);
      return;
    }
    if (_type === type) {
      setVisible(false);
    } else {
      setType(_type);
    }
  };
  const isNull = dbscanClusters < 2
  const clusters = isNull ? dbscanClusters : Object.keys(labelWithImportance || {}).length;
  return (
    <div className={classes.rowBody}>
      <Tooltip
        placement="left"
        title={isRecommend ? EN.Recommended : EN.Selected}
        visible={isSelect || isRecommend}
        overlayClassName={classes.recommendLabel}
        autoAdjustOverflow={false}
        arrowPointAtCenter={true}
        getPopupContainer={el => el.parentElement}
      >
        <div className={classes.rowData}>
          <div className={classes.modelSelect}>
            <input
              type="radio"
              name="modelSelect"
              checked={isSelect}
              onChange={onSelect(model)}
            />
          </div>
          <div className={`${classes.ccell} ${classes.modelName}`}>
            <Tooltip title={model.modelName}>
              {formatNumber(model.modelName)}
            </Tooltip>
            {/*<span>{formatNumber(model.modelName)}</span>*/}
          </div>
          <div className={`${classes.ccell}`}>
            <span>{isNull ? 'null' : formatNumber(model.score[project.measurement])}</span>
          </div>
          {/* <div className={`${classes.ccell}`}>
          <span>{formatNumber(model.score.CVNN)}</span>
        </div> */}
          {/* <div className={`${classes.ccell}`}>
          <span>{formatNumber(model.score.silhouette_euclidean)}</span>
        </div> */}
          {/* <div className={`${classes.ccell}`}>
          <span>{formatNumber(model.score.CH)}</span>
        </div> */}
          <div className={`${classes.ccell}`}>
            <span>{isNull ? 'null' : formatNumber(model.score.RSquared)}</span>
          </div>
          <div className={`${classes.ccell}`}>
            <span>{clusters}</span>
          </div>
          {hasTarget && (
            <div className={`${classes.ccell}`}>
              <span>
                {(!target.length || isNull) ? 'null' : formatNumber(realLabelScore.adjust_mutual_info)}
              </span>
            </div>
          )}
          {hasTarget && (
            <div className={`${classes.ccell}`}>
              <span>
                {(!target.length || isNull) ? 'null' : formatNumber(realLabelScore.adjust_rand_score)}
              </span>
            </div>
          )}
          <div className={`${classes.ccell}`}>
            <span>
              {model.createTime
                ? moment.unix(model.createTime).format('YYYY/MM/DD HH:mm')
                : ''}
            </span>
          </div>
          <div className={`${classes.ccell} ${classes.compute} ${isNull ? classes.disable : ''}`}>
            <span onClick={() => isNull ? null : toggleImpact('impact')}>
              <img src={'/static/modeling/Variable.svg'} alt="" /> {EN.Compute}
            </span>
          </div>
          <div className={`${classes.ccell} ${classes.compute}`}>
            <span onClick={() => toggleImpact('process')}>
              <img src={'/static/modeling/Process.svg'} alt="" /> {EN.Compute}
            </span>
          </div>
          <div className={`${classes.ccell} ${classes.compute} ${isNull ? classes.disable : ''}`}>
            <span onClick={() => isNull ? null : toggleImpact('explanation')}>
              <img src={'/static/modeling/Variable.svg'} alt="" /> {EN.Compute}
            </span>
          </div>
        </div>
      </Tooltip>
      {/* <div className={classes.rowData}> */}
      {visible && type === 'impact' && (
        <VariableImpact model={model} mapHeader={mapHeader} />
      )}
      {visible && type === 'process' && <MPF project={project} model={model} />}
      {visible && type === 'explanation' && (
        <Explanation model={model} mapHeader={mapHeader} />
      )}
      {/* </div> */}
    </div>
  );
});

const MappingDict = observer(props => {
  const { project, list, hideDict, mapHeader } = props;
  const { colMap, mappingKey } = project;
  const [state, setState] = React.useState({
    origin: '',
    encode: '',
  });
  const handleChange = key => e => {
    setState({
      ...state,
      [key]: e.target.value,
    });
  };

  const handleSelect = value => {
    project.updateProject({ mappingKey: value });
    setState({
      origin: '',
      encode: '',
    });
  };
  const tableData = React.useMemo(() => {
    const key = mappingKey || list[0];
    const mapping = colMap[key];
    const data = Object.entries(mapping)
      .filter(r1 =>
        r1[0]
          .toString()
          .toLowerCase()
          .includes(state.origin.toLowerCase()),
      )
      .filter(r2 =>
        r2[1]
          .toString()
          .toLowerCase()
          .includes(state.encode.toLowerCase()),
      )
      .map(r =>
        r.map(c => ({ content: <span>{c}</span>, cn: classes.mapCell })),
      );
    const header = [
      {
        content: (
          <div className={classes.inputBox}>
            <span>{EN.Origin}</span>{' '}
            <input
              style={{ width: 160 }}
              value={state.origin}
              onChange={handleChange('origin')}
            />
          </div>
        ),
        cn: classes.mapCell,
      },
      {
        content: (
          <div className={classes.inputBox}>
            <span>{EN.Encoding}</span>{' '}
            <input
              style={{ width: 160 }}
              value={state.encode}
              onChange={handleChange('encode')}
            />
          </div>
        ),
        cn: classes.mapCell,
      },
    ];
    return [header, ...data];
  }, [mappingKey, state.encode, state.origin]);
  return (
    <div className={classes.dictBlock}>
      <div className={classes.dictClose} onClick={hideDict}>
        <span>+</span>
      </div>
      <div className={classes.dictSelect}>
        <span>{EN.PleaseSelectaCategoricalVariable}</span>
        <Select
          getPopupContainer={() =>
            (document as any).getElementsByClassName(classes.dictSelect)[0]
          }
          value={mappingKey || list[0]}
          style={{ minWidth: 120, marginLeft: 20 }}
          onChange={handleSelect}
        >
          {list.map((l, k) => (
            <Option value={l} key={k}>
              {mapHeader[l]}
            </Option>
          ))}
        </Select>
      </div>
      <div className={classes.dictTable}>
        <Table
          columnWidth={290}
          rowHeight={({ index }) => {
            return index === 0 ? 68 : 34;
          }}
          columnCount={2}
          rowCount={tableData.length}
          fixedColumnCount={0}
          fixedRowCount={1}
          // style={{ border: "1px solid #ccc" }}
          data={tableData}
        />
      </div>
    </div>
  );
});
