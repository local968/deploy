import React from 'react';
import { ContinueButton, Hint, ProgressBar } from 'components/Common'
import classes from './styles.module.css';
import VariableImpact from './VariableImpact'
import ModelProcessFlow from './modelProcessFlow'
import AdvancedViewUn from '../AdvancedViewUn/AdvancedView';
// import D3D2 from '@src/components/charts/D3D2'
// import Iso from '@src/components/charts/Iso'
// import ParallelPlot from '@src/components/charts/ParallelPlot'
import { Tooltip, Icon } from 'antd'
import { observer, inject } from 'mobx-react';
import { formatNumber } from 'util'

function ModelResult(props) {
  // const type = 'clustering'
  const { resetSide, view, sort, handleSort, changeView, projectStore } = props
  const { project } = projectStore
  const { problemType, models, selectModel } = project

  if(!selectModel || !models.length) return null

  React.useEffect(() => {
    resetSide()
  })

  const abortTrain = () => {
    project.abortTrain()
  }

  return <div className={classes.root}>
    {problemType === 'Outlier' && <h3 className={classes.header}>Modeling result</h3>}
    {problemType === "Clustering" && <div className={classes.tabs}>
      <span className={`${classes.tab} ${view === 'simple' ? classes.active : ''}`} onClick={() => changeView('simple')}>Simple View</span>
      <span className={`${classes.tab} ${view === 'advanced' ? classes.active : ''}`} onClick={() => changeView('advanced')}>Advanced View</span>
    </div>}
    {true && <div className={classes.body}>
      <div className={classes.top}>
        <div className={classes.left}>
          <div className={classes.descriptions}>
            We have recommended a model by default<br />
            <small>You can also tell us your business needs to get a more precise recommendation</small>
            <br />
            Selected Model: <span className={classes.modelName}>{selectModel.modelName}</span>
          </div>
          {problemType === 'Outlier' && <div className={classes.scores}>
            <div className={classes.score}>
              <div className={classes.orange}>{formatNumber(selectModel.score.score, 2)}</div>
              <span className={classes.label}>Score <Hint content='123321' /></span>
            </div>
            <div className={classes.rate}>
              <div className={classes.blood}>0.1</div>
              <span className={classes.rateLabel}>Contamination Rate <Hint content='123321' /></span>
            </div>
          </div>}
          {problemType === 'Clustering' && <div className={classes.scores}>
            <div className={classes.cvnn}>
              <div className={classes.orange}>{formatNumber(selectModel.score.CVNN, 2)}</div>
              <span className={classes.label}>CVNN <Hint content='123321' /></span>
            </div>
            <div className={classes.cluster}>
              <div className={classes.blood}>{Object.keys(selectModel.labelWithImportance).length}</div>
              <span className={classes.rateLabel}>The Number of Clusters <Hint content='123321' /></span>
            </div>
            <div className={classes.rSquared}>
              <div className={classes.green}>{formatNumber(selectModel.score.RSquared, 2)}</div>
              <span className={classes.rateLabel} style={{ justifyContent: 'center' }}>R squared <Hint content='123321' /></span>
            </div>
          </div>}
          <ContinueButton text='Mapping Dictionary' width='200px' />
        </div>
        <div className={classes.right}>
          {/*<D3D2 url='http://192.168.0.182:8081/blockData?uid=ce732e55681011e9b948000c2959bcd0'/>*/}
          {/*<Iso url='http://192.168.0.182:8081/blockData?uid=de3e5a3a682d11e9b948000c2959bcd0'/>*/}
          {/* <ParallelPlot url='http://192.168.0.182:8081/blockData?uid=c2e0d5c2681111e9b948000c2959bcd0'/> */}
        </div>
      </div>
      {problemType === 'Clustering' && <ClusteringTable abortTrain={abortTrain} project={project} models={models} sort={sort.simple} handleSort={(key) => handleSort('simple', key)} />}
      {problemType === 'Outlier' && <OutlierTable abortTrain={abortTrain} project={project} models={models} sort={sort.simple} handleSort={(key) => handleSort('simple', key)} />}
    </div>}
    {problemType === 'Outlier' && <AdvancedViewUn />}
  </div>;
}

export default inject('projectStore')(observer(ModelResult))

const OutlierTable = (props) => {
  const { models, sort, handleSort, project, abortTrain } = props

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
          <span onClick={() => handleSort('name')}>Model Name {sort.key === 'name' ? <Icon type='up' style={sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }} /> : <Icon type='minus' />}</span>
        </div>
        <div className={`${classes.cell} ${classes.name} ${classes.cellHeader}`}>
          <span onClick={() => handleSort('score')}>Score {sort.key === 'score' ? <Icon type='up' style={sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }} /> : <Icon type='minus' />}</span>
        </div>
        <div className={`${classes.cell} ${classes.name} ${classes.cellHeader}`}>
          <span onClick={() => handleSort('rate')}>Contamination Rate {sort.key === 'rate' ? <Icon type='up' style={sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }} /> : <Icon type='minus' />}</span>
        </div>
        <div className={`${classes.cell} ${classes.name} ${classes.cellHeader}`}>
          <span>Variable Impact</span>
        </div>
        <div className={`${classes.cell} ${classes.name} ${classes.cellHeader}`}>
          <span>Model Process Flow</span>
        </div>
      </div>
    </div>
    <div className={classes.rowBox}>
      {sortModels.map(m => {
        return <OutlierRow model={m} />
      })}
      {!train2Finished && <div className={classes.rowData}>
        {trainModel ? <div className={classes.trainingModel}><Tooltip title={'New Model Being Trained'}>{'New Model Being Trained'}</Tooltip></div> : null}
        {trainModel ? <ProgressBar progress={((trainModel || {}).value || 0)} /> : null}
        <div className={classes.abortButton} onClick={!isAbort ? abortTrain : null}>
          {isAbort ? <Icon type='loading' /> : <span>Abort Training</span>}
        </div>
      </div>}
    </div>
  </div >
}

const OutlierRow = (props) => {
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
        <span>{model.score.score}</span>
      </div>
      <div className={`${classes.cell}`}>
        <span>X</span>
      </div>
      <div className={`${classes.cell} ${classes.compute}`}>
        <span onClick={() => toggleImpact('impact')}><img src={'/static/modeling/Variable.svg'} alt="" /> Compute</span>
      </div>
      <div className={`${classes.cell} ${classes.compute}`}>
        <span onClick={() => toggleImpact('process')}><img src={'/static/modeling/Process.svg'} alt="" /> Compute</span>
      </div>
    </div>
    <div className={classes.rowData}>
      {visible && type === 'impact' && <VariableImpact model={model} />}
      {visible && type === 'process' && <ModelProcessFlow model={model} />}
    </div>
  </div>
}

const ClusteringTable = (props) => {
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
          <span onClick={() => handleSort('name')}>Model Name {sort.key === 'name' ? <Icon type='up' style={sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }} /> : <Icon type='minus' />}</span>
        </div>
        <div className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader}`}>
          <span onClick={() => handleSort('cvnn')}>CVNN {sort.key === 'cvnn' ? <Icon type='up' style={sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }} /> : <Icon type='minus' />} <Hint content='123321' /></span>
        </div>
        <div className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader}`}>
          <span onClick={() => handleSort('sihouette')}>Sihouette Score {sort.key === 'sihouette' ? <Icon type='up' style={sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }} /> : <Icon type='minus' />} <Hint content='123321' /></span>
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
          <span>Variable Impact</span>
        </div>
        <div className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader}`}>
          <span>Model Process Flow</span>
        </div>
        <div className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader}`}>
          <span>Explaination</span>
        </div>
      </div>
    </div>
    <div className={classes.rowBox}>
      {sortModels.map(m => {
        return <ClusteringRow model={m} />
      })}
      {!train2Finished && <div className={classes.rowData}>
        {trainModel ? <div className={classes.trainingModel}><Tooltip title={'New Model Being Trained'}>{'New Model Being Trained'}</Tooltip></div> : null}
        {trainModel ? <ProgressBar progress={((trainModel || {}).value || 0)} /> : null}
        <div className={classes.abortButton} onClick={!isAbort ? abortTrain : null}>
          {isAbort ? <Icon type='loading' /> : <span>Abort Training</span>}
        </div>
      </div>}
    </div>
  </div >
}

const ClusteringRow = (props) => {
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
        <span onClick={() => toggleImpact('impact')}><img src={'/static/modeling/Variable.svg'} alt="" /> Compute</span>
      </div>
      <div className={`${classes.ccell} ${classes.compute}`}>
        <span onClick={() => toggleImpact('process')}><img src={'/static/modeling/Process.svg'} alt="" /> Compute</span>
      </div>
      <div className={`${classes.ccell} ${classes.compute}`}>
        <span><img src={'/static/modeling/Variable.svg'} alt="" /> Compute</span>
      </div>
    </div>
    <div className={classes.rowData}>
      {visible && type === 'impact' && <VariableImpact model={model} />}
      {visible && type === 'process' && <ModelProcessFlow model={model} />}
    </div>
  </div>
}
