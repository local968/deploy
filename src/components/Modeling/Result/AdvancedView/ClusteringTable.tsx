import React, { ReactElement, useState, MouseEvent, useMemo } from 'react'
import styles from './Table.module.css'
import EN from '../../../../constant/en'
import { Icon, Tooltip } from 'antd'
import Project from 'stores/Project';
import Model, { Score } from 'stores/Model';
import { Hint } from 'components/Common';
import { observer } from 'mobx-react';
import { TableHeader } from './AdvancedViewTable';
import moment from 'moment';
import { formatNumber } from '../../../../util'
import ClusteringDetailCurves from './ClusteringDetailCurves';
import IconParallel from './svg/icon-parallel.svg'
import IconParallel2 from './svg/icon-parallel2.svg'

const Headers: TableHeader[] = [
  {
    label: EN.ModelName,
    value: 'name',
    sort: true,
  },
  {
    label: EN.Time,
    value: 'time',
    sort: true,
  },
  {
    label: 'CVNN',
    value: 'cvnn',
    sort: true,
    hint: EN.CVNNHint
  },
  {
    label: 'RSquared',
    value: 'rSquared',
    sort: true,
    hint: EN.squaredHint
  },
  {
    label: 'RMSSTD',
    value: 'rmsstd',
    sort: true,
    hint: EN.RMSSTDHint
  },
  {
    label: 'CH Index',
    value: 'ch',
    sort: true,
  },
  {
    label: 'Silhouette Cosine',
    value: 'cosine',
    sort: true,
  },
  {
    label: 'Silhouette Euclidean',
    value: 'euclidean',
    sort: true,
  },
]

interface ClusteringTableProps {
  project: Project,
  sort: {
    key: string,
    value: number
  },
  handleSort: (k: string) => void,
  models: Model[],
  currentSettingId: string
}

interface Detail { id: string, type: string }

const ClusteringTable = (props: ClusteringTableProps) => {
  const { sort, handleSort, project, models, currentSettingId } = props
  const [detailArr, setDetail] = useState([] as Detail[])

  const sortBy = (key: string) => () => {
    handleSort(key)
  }

  const handleDetail = (s: string, t: string) => {
    const _d = detailArr.find(d => d.id === s)
    if (!_d) return setDetail([...detailArr, { id: s, type: t }])
    if (_d.type === t) return setDetail(detailArr.filter(d => d.id !== s))
    return setDetail([...detailArr.filter(d => d.id !== s), { id: s, type: t }])
  }

  const sortMethods = (aModel, bModel) => {
    switch (sort.key) {
      case 'cvnn':
        {
          const aModelData = (aModel.score.CVNN);
          const bModelData = (bModel.score.CVNN);
          return sort.value === 1 ? aModelData - bModelData : bModelData - aModelData
        }
      case 'rSquared':
        {
          const aModelData = (aModel.score.RSquared)
          const bModelData = (bModel.score.RSquared)
          return sort.value === 1 ? aModelData - bModelData : bModelData - aModelData
        }
      case 'rmsstd':
        {
          const aModelData = (aModel.score.RMSSTD)
          const bModelData = (bModel.score.RMSSTD)
          return sort.value === 1 ? aModelData - bModelData : bModelData - aModelData
        }
      case 'ch':
        {
          const aModelData = (aModel.score.CH)
          const bModelData = (bModel.score.CH)
          return sort.value === 1 ? aModelData - bModelData : bModelData - aModelData
        }
      case 'cosine':
        {
          const aModelData = (aModel.score.silhouette_cosine)
          const bModelData = (bModel.score.silhouette_cosine)
          return sort.value === 1 ? aModelData - bModelData : bModelData - aModelData
        }
      case 'euclidean':
        {
          const aModelData = (aModel.score.silhouette_euclidean)
          const bModelData = (bModel.score.silhouette_euclidean)
          return sort.value === 1 ? aModelData - bModelData : bModelData - aModelData
        }
      case 'time':
        return (sort.value === 1 ? 1 : -1) * ((aModel.createTime || 0) - (bModel.createTime || 0))
      case 'name':
      default:
        return (aModel.modelName > bModel.modelName ? 1 : -1) * (sort.value === 1 ? 1 : -1)
      // const aModelTime = aModel.name.split('.').splice(1, Infinity).join('.');
      // const aModelUnix = moment(aModelTime, 'MM.DD.YYYY_HH:mm:ss').unix();
      // const bModelTime = bModel.name.split('.').splice(1, Infinity).join('.');
      // const bModelUnix = moment(bModelTime, 'MM.DD.YYYY_HH:mm:ss').unix();
      // return this.sortState[currentSort] === 1 ? aModelUnix - bModelUnix : bModelUnix - aModelUnix
    }
  };

  const filtedModels = useMemo(() => {
    let _models = [...models];
    if (currentSettingId !== 'all') {
      const currentSetting = project.settings.find(setting => setting.id === currentSettingId)
      if (currentSetting) _models = _models.filter(model => model.settingId === currentSetting.id)
    }
    _models.filter(_m => _m.dbscanClusters >= 2)
    return [..._models.filter(_m => _m.dbscanClusters >= 2).sort(sortMethods), ..._models.filter(_m => _m.dbscanClusters < 2)]
  }, [models.map(m => m.fitIndex), sort.key, sort.value, currentSettingId])

  return <div className={styles.main}>
    <div className={styles.header}>
      {Headers.map((h, i) => {
        const hintElement = h.hint ? <Hint content={h.hint} /> : null
        let sortElement: null | ReactElement = null
        if (h.sort) {
          if (h.value !== sort.key) sortElement = <Icon type='minus' />
          else sortElement = <Icon type='up' style={sort.value === 1 ? {} : { transform: 'rotateZ(180deg)' }} />
        }
        return <div className={`${styles.headerCell} ${h.value === 'name' ? styles.name : ''}`} onClick={sortBy(h.value)} key={i}>
          <span>{hintElement}</span>
          <span className={styles.text} title={h.label}>{h.label}</span>
          <span>{sortElement}</span>
        </div>
      })}
      <div className={styles.toolCell} style={{ backgroundColor: '#fff' }}>
        <div className={styles.headerCell}>
          <span className={styles.text} title={'Parallel Plot'}>{'Parallel Plot'}</span>
        </div>
        <div className={styles.headerCell}>
          <span className={styles.text} title={'PCA'}>{'PCA'}</span>
        </div>
      </div>
    </div>
    <div className={styles.body}>
      {filtedModels.map((m, i) => <ClusteringTableRow model={m} project={project} key={i} detail={detailArr.find(d => d.id === m.id)} handleDetail={handleDetail} />)}
    </div>
  </div>
}

export default observer(ClusteringTable)

interface ClusteringTableRowProps {
  model: Model,
  // metric: string,
  project: Project,
  detail?: Detail
  handleDetail: (s: string, t: string) => void
}

const ClusteringTableRow = observer((props: ClusteringTableRowProps) => {
  const { model, project, detail, handleDetail } = props
  const { selectModel, recommendModel } = project
  const { score, dbscanClusters } = model
  const isNull = dbscanClusters < 2
  const modelScore = isNull ? {} as Score : score
  const isRecommend = recommendModel.id === model.id
  const handleResult = (id: string, type: string) => () => {
    handleDetail(id, type)
  }
  const handleClick = (e: MouseEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (selectModel.id === model.id) return
    project.updateProject({ selectId: model.id })
  }

  const handleType = (id: string) => (type: string) => {
    handleDetail(id, type)
  }
  return <div className={styles.rowBody}>
    <Tooltip
      placement="left"
      title={isRecommend ? EN.Recommended : EN.Selected}
      visible={selectModel.id === model.id || isRecommend}
      overlayClassName={styles.recommendLabel}
      autoAdjustOverflow={false}
      arrowPointAtCenter={true}
      getPopupContainer={el => el.parentElement}
    >
      <div className={styles.row}>
        <div className={styles.check}><input type='radio' name='modelRadio' checked={selectModel.id === model.id} onClick={handleClick} onChange={() => { }} /></div>
        <div className={`${styles.cell} ${styles.name}`}>
          <span className={styles.text} title={model.id}>{model.id}</span>
          <span className={styles.icon} style={isNull ? { cursor: 'not-allowed', color: '#ccc' } : {}} onClick={isNull ? () => { } : handleResult(model.id, 'parallel')}>
            <Icon type='down' style={!!detail ? { transform: 'rotateZ(180deg)' } : {}} />
          </span>
        </div>
        <div className={styles.cell}><span className={styles.text} title={moment.unix(model.createTime).format('YYYY/MM/DD HH:mm')}>{moment.unix(model.createTime).format('YYYY/MM/DD HH:mm')}</span></div>
        <div className={styles.cell}><span className={styles.text} title={formatNumber((modelScore.CVNN || "null").toString())}>{formatNumber((modelScore.CVNN || "null").toString())}</span></div>
        <div className={styles.cell}><span className={styles.text} title={formatNumber((modelScore.RSquared || "null").toString())}>{formatNumber((modelScore.RSquared || "null").toString())}</span></div>
        <div className={styles.cell}><span className={styles.text} title={formatNumber((modelScore.RMSSTD || "null").toString())}>{formatNumber((modelScore.RMSSTD || "null").toString())}</span></div>
        <div className={styles.cell}><span className={styles.text} title={formatNumber((modelScore.CH || "null").toString())}>{formatNumber((modelScore.CH || "null").toString())}</span></div>
        <div className={styles.cell}><span className={styles.text} title={formatNumber((modelScore.silhouette_cosine || "null").toString())}>{formatNumber((modelScore.silhouette_cosine || "null").toString())}</span></div>
        <div className={styles.cell}><span className={styles.text} title={formatNumber((modelScore.silhouette_euclidean || "null").toString())}>{formatNumber((modelScore.silhouette_euclidean || "null").toString())}</span></div>
        <div className={styles.scoreCell}>
          <div className={styles.cell} style={isNull ? { cursor: 'not-allowed', color: '#ccc' } : {}} onClick={isNull ? () => { } : handleResult(model.id, 'parallel')}>
            <span className={styles.text} style={(!!detail && detail.type === 'parallel') ? { backgroundColor: '#539df0', color: '#fff' } : { color: '#539df0' }}>
              <img src={(!!detail && detail.type === 'parallel') ? IconParallel2 : IconParallel} alt='' />{EN.Compute}
            </span>
          </div>
          <div className={styles.cell} style={isNull ? { cursor: 'not-allowed', color: '#ccc' } : {}} onClick={isNull ? () => { } : handleResult(model.id, 'pca')}>
            <span className={styles.text} style={(!!detail && detail.type === 'pca') ? { backgroundColor: '#539df0', color: '#fff' } : { color: '#539df0' }}>
              <img src={(!!detail && detail.type === 'pca') ? IconParallel2 : IconParallel} alt='' />{EN.Compute}
            </span>
          </div>
        </div>
      </div>
    </Tooltip>
    {!!detail && <ClusteringDetailCurves
      project={project}
      model={model}
      type={detail.type}
      handleType={handleType(model.id)}
    />}
  </div>
})