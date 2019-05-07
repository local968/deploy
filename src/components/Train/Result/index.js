import React from 'react';
import { ContinueButton, Hint, ProgressBar, Table } from 'components/Common'
import classes from './styles.module.css';
import VariableImpact from './VariableImpact'
import ModelProcessFlow from './modelProcessFlow'
import Explanation from './explanation'
import AdvancedViewUn from '../AdvancedViewUn/AdvancedView';
// import D3D2 from '@src/components/charts/D3D2'
// import Iso from '@src/components/charts/Iso'
// import ParallelPlot from '@src/components/charts/ParallelPlot'
import { Tooltip, Icon, Popover, Select } from 'antd'
import { observer, inject } from 'mobx-react';
import { formatNumber } from 'util'
import D3D2 from "../../Charts/D3D2";
import EN from '../../../constant/en';

const Option = Select.Option;

function ModelResult(props) {
  // const type = 'clustering'
  const { resetSide, view, sort, handleSort, changeView, projectStore } = props
  const { project } = projectStore
  const { problemType, models, selectModel, colType } = project
  const list = Object.entries(colType).filter(t => t[1] === 'Categorical').map(c => c[0])

  const [visible, setVisible] = React.useState(false)

  if (!selectModel || !models.length) return null

  React.useEffect(() => {
    resetSide()
  })

  const abortTrain = () => {
    project.abortTrain()
  }

  const showDict = () => {
    setVisible(true)
  }

  const hideDict = () => {
    setVisible(false)
  }

  const deploy = () => {
    // const { project } = this.props.projectStore;
    const { selectModel: current } = project
    const { newVariable, trainHeader, expression } = project
    const newVariableLabel = newVariable.filter(v => !trainHeader.includes(v))
    const variables = [...new Set(newVariableLabel.map(label => label.split("_")[1]))]
    const exps = variables.map(v => expression[v]).filter(n => !!n).join(";").replace(/\|/g, ",")

    props.deploymentStore
      .addDeployment(project.id, project.name, current.modelName, project.problemType, exps)
      .then(id => props.routing.push('/deploy/project/' + id));
  };

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
            {EN.SelectedModel}: <span className={classes.modelName}>{selectModel.modelName}</span>
          </div>
          {problemType === 'Outlier' && <div className={classes.scores}>
            <div className={classes.score}>
              <div className={classes.orange}>{formatNumber(selectModel.score.score)}</div>
              <span className={classes.label}>{EN.Score} <Hint content='123321' /></span>
            </div>
            <div className={classes.rate}>
              <div className={classes.blood}>{formatNumber(selectModel.dataFlow[0].contamination || 0)}</div>
              <span className={classes.rateLabel} style={{ justifyContent: 'center' }}>{EN.ContaminationRate} <Hint content='123321' /></span>
            </div>
          </div>}
          {problemType === 'Clustering' && <div className={classes.scores}>
            <div className={classes.cvnn}>
              <div className={classes.orange}>{formatNumber(selectModel.score.CVNN, 2)}</div>
              <span className={classes.label}>CVNN <Hint content='123321' /></span>
            </div>
            <div className={classes.cluster}>
              <div className={classes.blood}>{Object.keys(selectModel.labelWithImportance).length}</div>
              <span className={classes.rateLabel} style={{ justifyContent: 'center' }}>{EN.TheNumberofClusters} <Hint content='123321' /></span>
            </div>
            <div className={classes.rSquared}>
              <div className={classes.green}>{formatNumber(selectModel.score.RSquared, 2)}</div>
              <span className={classes.rateLabel} style={{ justifyContent: 'center' }}>R squared <Hint content='123321' /></span>
            </div>
          </div>}
          {!!list.length && <div className={classes.dict}>
            <button className={classes.button} onClick={showDict}>
              <span>{EN.MappingDictionary}</span>
            </button>
            <Popover trigger='click' placement='bottomLeft' visible={visible} onVisibleChange={hideDict} content={<MappingDict project={project} list={list} hideDict={hideDict} />} />
          </div>}
        </div>
        <div className={classes.right}>
          <D3D2 url='http://192.168.0.182:8081/blockData?uid=ce732e55681011e9b948000c2959bcd0' />
          {/*<Iso url='http://192.168.0.182:8081/blockData?uid=de3e5a3a682d11e9b948000c2959bcd0'/>*/}
          {/* <ParallelPlot url='http://192.168.0.182:8081/blockData?uid=c2e0d5c2681111e9b948000c2959bcd0'/> */}
        </div>
      </div>
      {problemType === 'Clustering' && <ClusteringTable abortTrain={abortTrain} project={project} models={models} sort={sort.simple} handleSort={(key) => handleSort('simple', key)} />}
      {problemType === 'Outlier' && <OutlierTable abortTrain={abortTrain} project={project} models={models} sort={sort.simple} handleSort={(key) => handleSort('simple', key)} />}
    </div>}
    {view === 'advanced' && <AdvancedViewUn project={project} models={models} sort={sort.advanced} handleSort={(key) => handleSort('advanced', key)} />}
    <div className={classes.buttonBlock}>
      <button className={classes.button} onClick={deploy}>
        <span>{EN.DeployTheModel}</span>
      </button>
    </div>
  </div>;
}

export default inject('projectStore', 'deploymentStore', 'routing')(observer(ModelResult))

const OutlierTable = observer((props) => {
  const { models, sort, handleSort, project, abortTrain } = props
  const { train2Finished, trainModel } = project
  const sortModels = React.useMemo(() => {
    const { key, value } = sort
    const fn = (a, b) => {
      switch (key) {
        case "score":
          return (a.score.score - b.score.score) * value
        case 'rate':
          return ((a.createTime || 0) - (b.createTime || 0)) * value
        case "name":
        default:
          return a.modelName > b.modelName ? value : -value
      }
    }
    return models.sort(fn)
  }, [models, sort])

  return <div className={classes.table}>
    <div className={classes.rowHeader}>
      <div className={classes.rowData}>
        <div className={`${classes.cell} ${classes.name} ${classes.cellHeader}`}>
          <span onClick={() => handleSort('name')}>{EN.ModelName} {sort.key === 'name' ? <Icon type='up' style={sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }} /> : <Icon type='minus' />}</span>
        </div>
        <div className={`${classes.cell} ${classes.name} ${classes.cellHeader}`}>
          <span onClick={() => handleSort('score')}>{EN.Score} {sort.key === 'score' ? <Icon type='up' style={sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }} /> : <Icon type='minus' />}</span>
        </div>
        <div className={`${classes.cell} ${classes.name} ${classes.cellHeader}`}>
          <span onClick={() => handleSort('rate')}>{EN.ContaminationRate}{sort.key === 'rate' ? <Icon type='up' style={sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }} /> : <Icon type='minus' />}</span>
        </div>
        <div className={`${classes.cell} ${classes.name} ${classes.cellHeader}`}>
          <span>{EN.VariableImpact}</span>
        </div>
        <div className={`${classes.cell} ${classes.name} ${classes.cellHeader}`}>
          <span>{EN.ModelProcessFlow}</span>
        </div>
      </div>
    </div>
    <div className={classes.rowBox}>
      {sortModels.map(m => {
        return <OutlierRow model={m} />
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
  const { model } = props

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
    <div className={classes.rowData}>
      <div className={`${classes.cell}`}>
        <span>{model.modelName}</span>
      </div>
      <div className={`${classes.cell}`}>
        <span>{formatNumber(model.score.score)}</span>
      </div>
      <div className={`${classes.cell}`}>
        <span>{formatNumber(model.dataFlow[0].contamination || 0)}</span>
      </div>
      <div className={`${classes.cell} ${classes.compute}`}>
        <span onClick={() => toggleImpact('impact')}><img src={'/static/modeling/Variable.svg'} alt="" /> {EN.Compute}</span>
      </div>
      <div className={`${classes.cell} ${classes.compute}`}>
        <span onClick={() => toggleImpact('process')}><img src={'/static/modeling/Process.svg'} alt="" /> {EN.Compute}</span>
      </div>
    </div>
    <div className={classes.rowData}>
      {visible && type === 'impact' && <VariableImpact model={model} />}
      {visible && type === 'process' && <ModelProcessFlow model={model} />}
    </div>
  </div>
})

const ClusteringTable = observer((props) => {
  const { models, sort, handleSort, project, abortTrain } = props
  const { train2Finished, trainModel, isAbort } = project

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
          return (a.score.silhouette_cosine - b.score.silhouette_cosine) * value
        case "cluster":
          return (Object.keys(a.labelWithImportance).length - Object.keys(b.labelWithImportance).length) * value
        case "name":
        default:
          return a.modelName > b.modelName ? value : -value
      }
    }
    return models.sort(fn)
  }, [models, sort])

  return <div className={classes.table}>
    <div className={classes.rowHeader}>
      <div className={classes.rowData}>
        <div className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader}`}>
          <span onClick={() => handleSort('name')}>{EN.ModelName} {sort.key === 'name' ? <Icon type='up' style={sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }} /> : <Icon type='minus' />}</span>
        </div>
        <div className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader}`}>
          <span onClick={() => handleSort('cvnn')}>CVNN {sort.key === 'cvnn' ? <Icon type='up' style={sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }} /> : <Icon type='minus' />} <Hint content='123321' /></span>
        </div>
        <div className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader}`}>
          <span onClick={() => handleSort('sihouette')}>{EN.SihouetteScore} {sort.key === 'sihouette' ? <Icon type='up' style={sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }} /> : <Icon type='minus' />} <Hint content='123321' /></span>
        </div>
        <div className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader}`}>
          <span onClick={() => handleSort('ch')}>CH Index {sort.key === 'ch' ? <Icon type='up' style={sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }} /> : <Icon type='minus' />} <Hint content='123321' /></span>
        </div>
        <div className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader}`}>
          <span onClick={() => handleSort('rsquared')}>R squared {sort.key === 'rsquared' ? <Icon type='up' style={sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }} /> : <Icon type='minus' />} <Hint content='123321' /></span>
        </div>
        <div className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader}`}>
          <span onClick={() => handleSort('cluster')}>#clusters {sort.key === 'cluster' ? <Icon type='up' style={sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }} /> : <Icon type='minus' />} <Hint content='123321' /></span>
        </div>
        <div className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader}`}>
          <span>{EN.VariableImpact}</span>
        </div>
        <div className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader}`}>
          <span>{EN.ModelProcessFlow}</span>
        </div>
        <div className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader}`}>
          <span>{EN.Explaination}</span>
        </div>
      </div>
    </div>
    <div className={classes.rowBox}>
      {sortModels.map(m => {
        return <ClusteringRow model={m} />
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
  const { model } = props
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
    <div className={classes.rowData}>
      <div className={`${classes.ccell}`}>
        <span>{formatNumber(model.modelName, 2)}</span>
      </div>
      <div className={`${classes.ccell}`}>
        <span>{formatNumber(model.score.CVNN, 2)}</span>
      </div>
      <div className={`${classes.ccell}`}>
        <span>{formatNumber(model.score.silhouette_cosine, 2)}</span>
      </div>
      <div className={`${classes.ccell}`}>
        <span>{formatNumber(model.score.CH, 2)}</span>
      </div>
      <div className={`${classes.ccell}`}>
        <span>{formatNumber(model.score.RSquared, 2)}</span>
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
      .map(r => r.map(c => ({ content: <span>{c}</span>, cn: classes.cell })))
    const header = [
      { content: <span>Origin<input style={{ marginLeft: 10 }} value={state.origin} onChange={handleChange('origin')} /></span>, cn: classes.titleCell },
      { content: <span>Encoding <input style={{ marginLeft: 10 }} value={state.encode} onChange={handleChange('encode')} /></span>, cn: classes.titleCell }
    ]
    return [header, ...data]
  })
  return <div className={classes.dictBlock}>
    <div className={classes.dictClose} onClick={hideDict}>
      <span>+</span>
    </div>
    <div className={classes.dictSelect}>
      <span>Please Select a Categorical Variable</span>
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
