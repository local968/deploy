import React from 'react';
import { ContinueButton, Hint, ProgressBar, Table, ProcessLoading } from 'components/Common'
import classes from './styles.module.css';
import VariableImpact from './VariableImpact'
import ModelProcessFlow from './modelProcessFlow'
import Explanation from './explanation'
import AdvancedViewUn from '../AdvancedViewUn/AdvancedView';
import { Tooltip, Icon, Popover, Select, message } from 'antd'
import { observer, inject } from 'mobx-react';
import { formatNumber } from 'util'
import D3D2 from "../../Charts/D3D2";
import EN from '../../../constant/en';
import ISO2 from "../../Charts/ISO2";
import axios from 'axios'

const Option = Select.Option;

function ModelResult(props) {
  // const type = 'clustering'
  const [showTips, setShowTips] = React.useState(false)
  const [downloading, setDownloading] = React.useState(false)
  const [sort, setSort] = React.useState({
    simple: {
      key: 'name',
      value: 1
    },
    advanced: {
      key: 'Model Name',
      value: 1
    }
  })
  const { resetSide, view, changeView, projectStore } = props
  const { project } = projectStore
  const { problemType, models, selectModel, colType, dataHeader, trainHeader, id, etlIndex, fileName } = project;
  const list = Object.entries(colType).filter(t => (t[1] === 'Categorical' && dataHeader.includes(t[0]) && !trainHeader.includes(t[0]))).map(c => c[0])

  React.useEffect(() => {
    resetSide()
  })

  const [visible, setVisible] = React.useState(false);
  // console.log('selectModel',selectModel,selectModel.multiVarPlotData);
  if (!selectModel || !models.length) return null

  const cannotDeploy = problemType === 'Clustering' && !selectModel.supportDeploy
  const realName = fileName.endsWith('.csv') ? fileName.slice(0, -4) : fileName
  // const isDownload = ['DBSCAN', 'Agg', 'MeanShift'].some(v => selectModel.modelName.toString().toLowerCase().startsWith(v.toLowerCase()))

  const abortTrain = () => {
    project.abortTrain()
  }

  const showDict = () => {
    setVisible(true)
  }

  const hideDict = () => {
    setVisible(false)
  }

  const onSelect = (model) => () => {
    if (selectModel.id === model.id) return
    project.updateProject({
      selectId: model.id
    })
  }

  const handleSort = (view, key) => {
    const _sort = sort[view]
    if (!_sort) return
    if (_sort.key === key) _sort.value = -_sort.value
    else {
      _sort.key = key
      _sort.value = 1
    }
    setSort({ ...sort, [view]: _sort })
  }

  const deploy = () => {
    // const { project } = this.props.projectStore;
    const { selectModel: current } = project
    if (cannotDeploy) return
    // const { newVariable, trainHeader, expression } = project
    // const newVariableLabel = newVariable.filter(v => !trainHeader.includes(v))
    // const variables = [...new Set(newVariableLabel.map(label => label.split("_")[1]))]
    // const exps = variables.map(v => expression[v]).filter(n => !!n).join(";").replace(/\|/g, ",")

    props.deploymentStore
      .addDeployment(project.id, project.name, current.modelName, project.problemType)
      .then(id => props.routing.push('/deploy/project/' + id));
  };

  // const download = async () => {
  //   setDownloading(true)
  //   const deplotData = problemType === 'Outlier' ? await project.preDownload() : selectModel.deployData
  //   if (!deplotData) return message.error('download error!')
  //   window.open(`/upload/download/model?projectId=${id}&filename=${encodeURIComponent(`${realName}-${selectModel.modelName}-predict.csv`)}&mid=${selectModel.modelName}&etlIndex=${etlIndex}&url=${encodeURIComponent(deplotData)}`)
  //   setDownloading(false)
  // }

  return <div className={classes.root}>
    {problemType === 'Outlier' && <h3 className={classes.header}>{EN.ModelingResult}</h3>}
    {problemType === "Clustering" && <div className={classes.tabs}>
      <span className={`${classes.tab} ${view === 'simple' ? classes.active : ''}`} onClick={() => changeView('simple')}>{EN.SimpleView}</span>
      <span className={`${classes.tab} ${view === 'advanced' ? classes.active : ''}`} onClick={() => changeView('advanced')}>{EN.AdvancedView}</span>
    </div>}
    {view === 'simple' && <div className={classes.body}>
      <div className={classes.top}>
        <div className={classes.left}>
          <div className={classes.descriptions}>
            {EN.RecommendedAModel}<br />
            <small>{EN.Youcanalsotellusyourbusinessneedstogetamorepreciserecommendation}</small>
            <br />
            {EN.SelectedModel}: <span style={{ display: 'inline-flex', color: '#448EED' }} className={classes.modelName}>{selectModel.modelName}</span>
          </div>
          {problemType === 'Outlier' && <div className={classes.scores}>
            <div className={classes.score}>
              <div className={classes.orange}>{formatNumber(selectModel.score.score)}</div>
              <span className={classes.label}>{EN.Score} <Hint content={EN.ScoreHint} /></span>
            </div>
            <div className={classes.rate}>
              <div className={classes.blood}>{formatNumber(selectModel.rate || 0)}</div>
              <span className={classes.rateLabel} style={{ justifyContent: 'center' }}>{EN.ContaminationRate} <Hint content={EN.ContaminationRateHint} /></span>
            </div>
          </div>}
          {problemType === 'Clustering' && <div className={classes.scores}>
            <div className={classes.cvnn}>
              <div className={classes.orange}>{formatNumber(selectModel.score.CVNN)}</div>
              <span className={classes.label}>CVNN <Hint content={EN.CVNNHint} /></span>
            </div>
            <div className={classes.cluster}>
              <div className={classes.blood}>{Object.keys(selectModel.labelWithImportance).length}</div>
              <span className={classes.rateLabel} style={{ justifyContent: 'center' }}>{EN.TheNumberofClusters}</span>
            </div>
            <div className={classes.rSquared}>
              <div className={classes.green}>{formatNumber(selectModel.score.RSquared)}</div>
              <span className={classes.rateLabel} style={{ justifyContent: 'center' }}>R squared <Hint content={EN.squaredHint} /></span>
            </div>
          </div>}
          {!!list.length && <div className={classes.dict}>
            <button className={classes.button} onClick={showDict}>
              <span>{EN.MappingDictionary}</span>
            </button>
            <Popover
              trigger='click'
              getPopupContainer={() => document.getElementsByClassName(classes.dict)[0]}
              placement='bottomLeft'
              visible={visible}
              onVisibleChange={hideDict}
              content={<MappingDict project={project} list={list} hideDict={hideDict} />} />
          </div>}
        </div>
        <div className={classes.right} style={{ flex: 1, width: 200 }}>
          {
            project.problemType === "Outlier" ?
              <ISO2 />
              : <D3D2 url={selectModel.multiVarPlotData} />
          }
        </div>
      </div>
      {problemType === 'Clustering' && <ClusteringTable abortTrain={abortTrain} project={project} models={models} sort={sort.simple} handleSort={(key) => handleSort('simple', key)} onSelect={onSelect} />}
      {problemType === 'Outlier' && <OutlierTable abortTrain={abortTrain} project={project} models={models} sort={sort.simple} handleSort={(key) => handleSort('simple', key)} onSelect={onSelect} />}
    </div>}
    {view === 'advanced' && <AdvancedViewUn project={project} models={models} sort={sort.advanced} handleSort={(key) => handleSort('advanced', key)} />}
    <div className={classes.buttonBlock}>
      {cannotDeploy ? <Tooltip title={EN.cannotDeploy} visible={showTips}>
        <button className={`${classes.button} ${classes.disable}`} onMouseOver={() => setShowTips(true)} onMouseOut={() => setShowTips(false)}>
          <span>{EN.DeployTheModel}</span>
        </button>
      </Tooltip> : <button className={`${classes.button}`} onClick={deploy}>
          <span>{EN.DeployTheModel}</span>
        </button>}
      {/* {<button className={`${classes.button}`} onClick={download} style={{ marginLeft: '.1em' }}>
        <span>导出模型结果</span>
      </button>} */}
      {problemType === 'Clustering' && <a href={`/upload/download/model?projectId=${id}&filename=${encodeURIComponent(`${realName}-${selectModel.modelName}-predict.csv`)}&mid=${selectModel.modelName}&etlIndex=${etlIndex}`} target='_black'><button className={`${classes.button}`} style={{ marginLeft: '.1em' }}>
        <span>{'导出模型结果'}</span>
      </button></a>}
      {problemType === 'Outlier' && <a href={`/upload/download/outlier?projectId=${id}&filename=${encodeURIComponent(`${realName}-${selectModel.modelName}-predict.csv`)}&mid=${selectModel.modelName}&rate=${formatNumber(selectModel.rate)}&etlIndex=${etlIndex}`} target='_black'><button className={`${classes.button}`} style={{ marginLeft: '.1em' }}>
        <span>{'导出模型结果'}</span>
      </button></a>}
    </div>
    {downloading && <ProcessLoading style={{ position: 'fixed' }} />}
  </div>;
}

export default inject('projectStore', 'deploymentStore', 'routing')(observer(ModelResult))

const OutlierTable = observer((props) => {
  const { models, sort, handleSort, project, abortTrain, onSelect } = props
  const { train2Finished, trainModel, isAbort, recommendModel, selectModel } = project
  const sortModels = React.useMemo(() => {
    const { key, value } = sort
    const fn = (a, b) => {
      switch (key) {
        case "score":
          return (a.score.score - b.score.score) * value
        case 'rate':
          return (a.rate - b.rate) * value
        case "name":
        default:
          return a.modelName > b.modelName ? value : -value
      }
    }
    return models.sort(fn)
  }, [models, sort.key, sort.value])

  return <div className={classes.table}>
    <div className={classes.rowHeader}>
      <div className={classes.rowData}>
        <div className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader} ${classes.modelName}`}>
          <span onClick={() => handleSort('name')}>{EN.ModelName} {sort.key === 'name' ? <Icon type='up' style={sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }} /> : <Icon type='minus' />}</span>
        </div>
        <div className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader}`}>
          <span onClick={() => handleSort('score')}>{EN.Score} {sort.key === 'score' ? <Icon type='up' style={sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }} /> : <Icon type='minus' />}</span>
        </div>
        <div className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader}`}>
          <span onClick={() => handleSort('rate')}>{EN.ContaminationRate}{sort.key === 'rate' ? <Icon type='up' style={sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }} /> : <Icon type='minus' />}</span>
        </div>
        <div className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader}`}>
          <span>{EN.VariableImpact}</span>
        </div>
        <div className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader}`}>
          <span>{EN.ModelProcessFlow}</span>
        </div>
      </div>
    </div>
    <div className={classes.rowBox}>
      {sortModels.map(m => {
        return <OutlierRow model={m} isRecommend={m.id === recommendModel.id} isSelect={m.id === selectModel.id} onSelect={onSelect} key={m.id} />
      })}
      {!train2Finished && <div className={classes.rowData}>
        {trainModel ? <div className={classes.trainingModel}><Tooltip title={EN.TrainingNewModel}>{EN.TrainingNewModel}</Tooltip></div> : null}
        {trainModel ? <ProgressBar progress={((trainModel || {}).value || 0)} /> : null}
        <div className={classes.abortButton} onClick={!isAbort ? abortTrain : null}>
          {isAbort ? <Icon type='loading' /> : <span>{EN.AbortTraining}</span>}
        </div>
      </div>}
    </div>
  </div >
})

const OutlierRow = observer((props) => {
  const [type, setType] = React.useState('')
  const [visible, setVisible] = React.useState(false)
  const { model, isRecommend, isSelect, onSelect } = props

  const toggleImpact = (_type) => {
    if (!visible) {//本来是关着的
      setType(_type)
      setVisible(true)
      return
    }
    if (type === _type) {
      setVisible(false)
    } else {
      setType(_type)
    }
  }

  return <div className={classes.rowBody}>
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
          <span>{model.modelName}</span>
        </div>
        <div className={`${classes.ccell}`}>
          <span>{formatNumber(model.score.score)}</span>
        </div>
        <div className={`${classes.ccell}`}>
          <span>{formatNumber(model.rate || 0)}</span>
        </div>
        <div className={`${classes.ccell} ${classes.compute}`}>
          <span onClick={() => toggleImpact('impact')}><img src={'/static/modeling/Variable.svg'} alt="" /> {EN.Compute}</span>
        </div>
        <div className={`${classes.ccell} ${classes.compute}`}>
          <span onClick={() => toggleImpact('process')}><img src={'/static/modeling/Process.svg'} alt="" /> {EN.Compute}</span>
        </div>
      </div>
    </Tooltip>
    <div className={classes.rowData}>
      {visible && type === 'impact' && <VariableImpact model={model} />}
      {visible && type === 'process' && <ModelProcessFlow model={model} />}
    </div>
  </div>
})

const ClusteringTable = observer((props) => {
  const { models, sort, handleSort, project, abortTrain, onSelect } = props
  const { train2Finished, trainModel, isAbort, recommendModel, selectModel } = project
  const sortModels = React.useMemo(() => {
    const { key, value } = sort
    const fn = (a, b) => {
      switch (key) {
        case "cvnn":
          return (a.score.CVNN - b.score.CVNN) * value
        case "rsquared":
          return (a.score.RSquared - b.score.RSquared) * value
        case "ch":
          return (a.score.CH - b.score.CH) * value
        case "sihouette":
          return (a.score.silhouette_euclidean - b.score.silhouette_euclidean) * value
        case "cluster":
          return (Object.keys(a.labelWithImportance).length - Object.keys(b.labelWithImportance).length) * value
        case "name":
        default:
          return a.modelName > b.modelName ? value : -value
      }
    }
    return models.sort(fn)
  }, [models, sort.key, sort.value])

  return <div className={classes.table}>
    <div className={classes.rowHeader}>
      <div className={classes.rowData}>
        <div className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader} ${classes.modelName}`}>
          <span onClick={() => handleSort('name')}>{EN.ModelName} {sort.key === 'name' ? <Icon type='up' style={sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }} /> : <Icon type='minus' />}</span>
        </div>
        <div className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader}`}>
          <span onClick={() => handleSort('cvnn')}>CVNN {sort.key === 'cvnn' ? <Icon type='up' style={sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }} /> : <Icon type='minus' />} <Hint content={EN.CVNNHint} /></span>
        </div>
        <div style={{ width: 100 }} className={`${classes.ccell}  ${classes.ccellHeader}`}>
          <span onClick={() => handleSort('sihouette')}>{EN.SihouetteScore} {sort.key === 'sihouette' ? <Icon type='up' style={sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }} /> : <Icon type='minus' />} <Hint content={EN.SihouetteScoreHint} /></span>
        </div>
        <div className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader}`}>
          <span onClick={() => handleSort('ch')}>CH Index {sort.key === 'ch' ? <Icon type='up' style={sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }} /> : <Icon type='minus' />} <Hint content={EN.CHIndexHint} /></span>
        </div>
        <div className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader}`}>
          <span onClick={() => handleSort('rsquared')}>R squared {sort.key === 'rsquared' ? <Icon type='up' style={sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }} /> : <Icon type='minus' />} <Hint content={EN.squaredHint} /></span>
        </div>
        <div className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader}`}>
          <span onClick={() => handleSort('cluster')}>{EN.clusters} {sort.key === 'cluster' ? <Icon type='up' style={sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }} /> : <Icon type='minus' />}</span>
        </div>
        <div className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader}`}>
          <span>{EN.VariableImpact}</span>
        </div>
        <div className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader}`}>
          <span>{EN.ModelProcessFlow}</span>
        </div>
        <div className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader}`}>
          <span>{EN.Explaination}<Hint content={EN.ExplainationHint} /></span>

        </div>
      </div>
    </div>
    <div className={classes.rowBox}>
      {sortModels.map(m => {
        return <ClusteringRow key={m.id} model={m} isRecommend={m.id === recommendModel.id} isSelect={m.id === selectModel.id} onSelect={onSelect} />
      })}
      {!train2Finished && <div className={classes.rowData}>
        {trainModel ? <div className={classes.trainingModel}><Tooltip title={EN.TrainingNewModel}>{EN.TrainingNewModel}</Tooltip></div> : null}
        {trainModel ? <ProgressBar progress={((trainModel || {}).value || 0)} /> : null}
        <div className={classes.abortButton} onClick={!isAbort ? abortTrain : null}>
          {isAbort ? <Icon type='loading' /> : <span>{EN.AbortTraining}</span>}
        </div>
      </div>}
    </div>
  </div >
})

const ClusteringRow = observer((props) => {
  const { model, isRecommend, isSelect, onSelect } = props
  const [type, setType] = React.useState('')
  const [visible, setVisible] = React.useState(false)
  const toggleImpact = (_type) => {
    if (!visible) {//本来是关着的
      setType(_type)
      setVisible(true)
      return
    }
    if (_type === type) {
      setVisible(false)
    } else {
      setType(_type)
    }
  }

  const clusters = Object.keys(model.labelWithImportance).length
  return <div className={classes.rowBody}>
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
          <span>{formatNumber(model.modelName)}</span>
        </div>
        <div className={`${classes.ccell}`}>
          <span>{formatNumber(model.score.CVNN)}</span>
        </div>
        <div className={`${classes.ccell}`}>
          <span>{formatNumber(model.score.silhouette_euclidean)}</span>
        </div>
        <div className={`${classes.ccell}`}>
          <span>{formatNumber(model.score.CH)}</span>
        </div>
        <div className={`${classes.ccell}`}>
          <span>{formatNumber(model.score.RSquared)}</span>
        </div>
        <div className={`${classes.ccell}`}>
          <span>{clusters}</span>
        </div>
        <div className={`${classes.ccell} ${classes.compute}`}>
          <span onClick={() => toggleImpact('impact')}><img src={'/static/modeling/Variable.svg'} alt="" /> {EN.Compute}</span>
        </div>
        <div className={`${classes.ccell} ${classes.compute}`}>
          <span onClick={() => toggleImpact('process')}><img src={'/static/modeling/Process.svg'} alt="" /> {EN.Compute}</span>
        </div>
        <div className={`${classes.ccell} ${classes.compute}`}>
          <span onClick={() => toggleImpact('explanation')}><img src={'/static/modeling/Variable.svg'} alt="" /> {EN.Compute}</span>
        </div>
      </div>
    </Tooltip>
    <div className={classes.rowData}>
      {visible && type === 'impact' && <VariableImpact model={model} />}
      {visible && type === 'process' && <ModelProcessFlow model={model} />}
      {visible && type === 'explanation' && <Explanation model={model} />}
    </div>
  </div>
})

const MappingDict = observer((props) => {
  const { project, list, hideDict } = props
  const { colMap, mappingKey } = project
  const [state, setState] = React.useState({
    origin: '',
    encode: ''
  })
  const handleChange = key => e => {
    setState({
      ...state,
      [key]: e.target.value
    })
  }

  const handleSelect = value => {
    project.updateProject({ mappingKey: value })
  }
  const tableData = React.useMemo(() => {
    const key = mappingKey || list[0]
    const mapping = colMap[key]
    const data = Object.entries(mapping)
      .filter(r1 => r1[0].toString().includes(state.origin))
      .filter(r2 => r2[1].toString().includes(state.encode))
      .map(r => r.map(c => ({ content: <span>{c}</span>, cn: classes.ccell })))
    const header = [
      { content: <span>{EN.Origin}<input style={{ marginLeft: 10 }} value={state.origin} onChange={handleChange('origin')} /></span>, cn: classes.titleCell },
      { content: <span>{EN.Encoding} <input style={{ marginLeft: 10 }} value={state.encode} onChange={handleChange('encode')} /></span>, cn: classes.titleCell }
    ]
    return [header, ...data]
  })
  return <div className={classes.dictBlock}>
    <div className={classes.dictClose} onClick={hideDict}>
      <span>+</span>
    </div>
    <div className={classes.dictSelect}>
      <span>{EN.PleaseSelectaCategoricalVariable}</span>
      <Select value={mappingKey || list[0]} style={{ width: 120, marginLeft: 20 }} onChange={handleSelect}>
        {list.map(l => <Option value={l}>{l}</Option>)}
      </Select>
    </div>
    <div className={classes.dictTable}>
      <Table
        columnWidth={300}
        rowHeight={({ index }) => { return index === 0 ? 68 : 34 }}
        columnCount={2}
        rowCount={tableData.length}
        fixedColumnCount={0}
        fixedRowCount={1}
        checked={null}
        select={null}
        style={{ border: "1px solid #ccc" }}
        data={tableData}
      />
    </div>
  </div>
})
