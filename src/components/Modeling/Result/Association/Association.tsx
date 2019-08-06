import React, { useEffect, useState } from 'react'
import styles from './Association.module.css'
import EN from '../../../../constant/en'
import config from 'config'
import Project from 'stores/Project';
import { ProcessLoading } from 'components/Common';
import classnames from 'classnames'

interface AssociationProps {
  project: Project
}

const Association = (props: AssociationProps) => {
  const { project } = props
  const { selectModel, fetchData } = project
  const { correlationData, graphData, plotData } = selectModel
  const [state, setState] = useState({
    'correlation': null, 'graph': null, 'plot': null
  })
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState(1)

  const arr = ['correlation', 'graph', 'plot']

  useEffect(() => {
    const promises = [correlationData, graphData, plotData].map((url, k) => {
      return fetchData(url)
    })
    Promise.all(promises).then(list => {
      const data = list.reduce((obj, v, k) => {
        const key = arr[k]
        obj[key] = v
        return obj
      }, {})
      setState(data)
      setLoading(false)
    })
  }, [])

  const changeTab = value => () => {
    if (value === type) return
    setType(value)
  }

  if (loading) return <ProcessLoading
    style={{ position: 'fixed' }}
  />

  const texts = state.correlation[config.isEN ? 0 : 1]

  console.log(state, 'state')

  return <div className={styles.association}>
    <div className={styles.main}>
      <div className={styles.title}><span>{EN.AssociateRules}</span></div>
      <div className={styles.buttons}>
        <div className={styles.button}><span>{EN.AssociateExport}</span></div>
        <div className={styles.button}><span>{EN.AssociatePlots}</span></div>
        <div className={styles.button}><span>{EN.AssociateReModel}</span></div>
      </div>
      <div className={styles.content}>
        <div className={styles.result}>
          {texts.map((t, k) => {
            return <li className={styles.row} key={k}>
              <span>{k + 1}: {t}</span>
            </li>
          })}
        </div>
        <div className={styles.views}>
          <div className={styles.view}>
            <div className={styles.options}>
              <div className={styles.tabs}>
                <div className={classnames(styles.tab, {
                  [styles.active]: type === 1
                })} onClick={changeTab(1)}>
                  <span>{EN.AssociateScatterPlot}</span>
                </div>
                <div className={classnames(styles.tab, {
                  [styles.active]: type === 2
                })} onClick={changeTab(2)}>
                  <span>{EN.AssociateNetworkDiagram}</span>
                </div>
              </div>
              <div className={styles.chart}>

              </div>
            </div>
          </div>
        </div>
        <div className={styles.empty}></div>
      </div>
    </div>
  </div>
}

export default Association