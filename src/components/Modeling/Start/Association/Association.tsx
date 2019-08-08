import React, { useState } from 'react'
import styles from './Association.module.css'
import classnames from 'classnames'
import EN from '../../../../constant/en'
import { Hint, NumberInput } from 'components/Common';
import Project from 'stores/Project';
import { HistogramCategorical } from '../../../Charts';

interface AssociationProps {
  project: Project
}

const Association = (props: AssociationProps) => {
  const { project } = props;
  const { associationOption, associationView: { target,feature } } = project;

  const sum = target.reduce((sum, s) => sum + s.value, 0);
  // const [tab, setTab] = useState(type)
  const [state, setState] = useState(associationOption);
  const { type } = state
  const list = [
    'support',
    'confidence',
    'lift',
    'length',
  ].slice(0, type === 'fptree' ? 2 : 4)

  const changeTab = value => () => {
    if (type === value) return
    setState({ ...state, type: value })
  }

  const handleChange = key => num => {
    const data = {
      ...state[type],
      [key]: num
    }
    setState({
      ...state,
      [type]: data
    })
  }

  const associationTrain = () => {
    project.associationOption = state;
    project.associationModeling()
  };

  return <div className={styles.association}>
    <div className={styles.options}>
      <div className={styles.tabs}>
        <div className={classnames(styles.tab, {
          [styles.active]: type === 'fptree'
        })} onClick={changeTab('fptree')}>
          <span>{EN.AssociationFP}</span>
        </div>
        <div className={classnames(styles.tab, {
          [styles.active]: type === 'apriori'
        })} onClick={changeTab('apriori')}>
          <span>{EN.AssociationAP}</span>
        </div>
      </div>
      <div className={styles.content}>
        {list.map((v, k) => {
          const t = type === 'fptree' ? 'FP' : 'AP'
          const key = v.slice(0, 1).toUpperCase() + v.slice(1)
          const label = EN[`Association${t}${key}`]
          const hint = EN[`Association${t}${key}Hint`]
          const [min, max] = [(type === 'fptree' ? [1, null] : [0, 1]), [0, 1], [0, null], [1, null]][k]
          return <div className={styles.row} key={label}>
            <div className={styles.label}><label title={label}>{label}</label><Hint content={hint} placement='top' /></div>
            <div className={styles.input}><NumberInput value={state[type][v]} max={max} min={min} onBlur={handleChange(v)} /></div>
          </div>
        })}
      </div>
      <div className={styles.bottom}>
        <div className={styles.button} onClick={associationTrain}>
          <span>{EN.ModelTraining}</span>
        </div>
      </div>
    </div>
    <div className={styles.views}>
      {/*<div className={styles.title}>*/}
      {/*  <span>{EN.AssociationViewTitle}</span>*/}
      {/*</div>*/}
      {/*<div className={styles.chart}/>*/}
      <HistogramCategorical
        title={EN.AssociationViewTitle}
        x_name={EN.NumberofClusters}
        data={feature}
        xAxisName = {feature.map((itm)=>itm.key)}
      />
      <div className={styles.summary}>
        <div className={styles.summaryRow}><span>{EN.summaryRow1}:{sum / target.length}</span></div>
        <div className={styles.summaryRow}><span>{EN.summaryRow2}:{Math.max(...target.map(s => s.value))}</span></div>
        <div className={styles.summaryRow}><span>{EN.summaryRow3}:{Math.min(...target.map(s => s.value))}</span></div>
        <div className={styles.summaryRow}><span>{EN.summaryRow4}:{sum}</span></div>
        <div className={styles.summaryRow}><span>{EN.summaryRow5}:{target.length}</span></div>
      </div>
    </div>
  </div>
}

export default Association
