import React, { useState, ReactElement, ChangeEvent } from 'react';
import styles from './MetricBased.module.css';
import classnames from 'classnames';
import { Modal } from 'components/Common';
import EN from '../../../../constant/en'
import { InputNumber, Select } from 'antd'

const { Option } = Select;

const METRICS = [
  {
    value: 'default',
    label: EN.MaximizeYoudenIndex,
    large: false
  }, {
    value: 'ks',
    label: EN.MaximizeKS,
    large: false
  }, {
    value: 'fbeta',
    label: EN.MaximizeFbeta,
    large: false
  }, {
    value: 'acc',
    label: EN.MaximizeAccuracy,
    large: false
  }, {
    value: 'recall',
    label: EN.MaximizeRecall,
    large: true
  }, {
    value: 'none',
    label: EN.None,
    large: false
  }, {
    value: 'precision',
    label: EN.MaximizePrecision,
    large: true
  }
]

interface MetricBasedProps {

}

interface MetricBasedState {
  metric: string,
  type: string,
  value: number
}

const Based = (props: MetricBasedProps) => {
  const [visible, setVisible] = useState(false)

  const onShow = () => {
    setVisible(true)
  }

  const onClose = () => {
    setVisible(false)
  }

  return <div className={styles.main}>
    <div className={styles.button} onClick={onShow}><span>{EN.MetricBased}</span></div>
    {<Modal visible={visible} width={'1200px'} content={<MetricBased {...props} onClose={onClose} />} title={EN.MetricBased} onClose={onClose} closeByMask={false} showClose={true} />}
  </div>
}

export default Based

const MetricBased = (props: MetricBasedProps & { onClose: () => void }) => {
  const { onClose } = props
  const [state, setState] = useState({
    metric: 'default',
    type: '',
    value: 0
  } as MetricBasedState)
  const [checked, setChecked] = useState(true)

  const setMetric = (metric: string) => () => {
    if (state.metric === metric) return
    const type = (metric === 'recall' && 'precision') || (metric === 'precision' && 'recall') || ''
    const value = (metric === 'fbeta' && 1) || ((metric === 'recall' || metric === 'precision') && 0.6) || 0
    setState({
      metric,
      type,
      value
    })
  }

  const setType = (type: string) => {
    if (state.type === type) return
    setState({
      ...state,
      type
    })
  }

  const setValue = (value: number) => {
    if (state.value === value) return
    setState({
      ...state,
      value
    })
  }

  const changeApply = (e: ChangeEvent<HTMLInputElement>) => {
    setChecked(e.target.checked)
  }

  const renderCondition = (value: string): ReactElement => {
    switch (value) {
      case 'fbeta':
        return <div className={styles.condition}>
          <span>condition: beta</span>
          <InputNumber min={0.1} max={10} step={0.1} style={{ marginLeft: 10 }} onChange={setValue} value={state.value} />
        </div>
      case 'recall':
        const recallList = [{
          value: 'precision',
          label: 'Precision'
        }, {
          value: 'recall0',
          label: 'Recall(0)'
        }, {
          value: 'precision0',
          label: 'Precision(0)'
        }].filter(l => l.value !== state.type)
        return <div className={styles.condition}>
          <span>condition: </span>
          <Select onChange={setType} style={{ width: 120, margin: '0px 10px' }} value={state.type}>
            {recallList.map((v, k) => {
              return <Option key={k} value={v.value}>{v.label}</Option>
            })}
          </Select>
          <span>>=</span>
          <InputNumber min={0.01} max={1} step={0.01} style={{ marginLeft: 10 }} onChange={setValue} value={state.value} />
        </div>
      case 'precision':
        const precisionList = [{
          value: 'recall',
          label: 'Recall'
        }, {
          value: 'precision0',
          label: 'Precision(0)'
        }, {
          value: 'recall0',
          label: 'Recall(0)'
        }].filter(l => l.value !== state.type)
        return <div className={styles.condition}>
          <span>condition: </span>
          <Select onChange={setType} style={{ width: 120, margin: '0px 10px' }} value={state.type}>
            {precisionList.map((v, k) => {
              return <Option key={k} value={v.value}>{v.label}</Option>
            })}
          </Select>
          <span>>=</span>
          <InputNumber min={0.01} max={1} step={0.01} style={{ marginLeft: 10 }} onChange={setValue} value={state.value} />
        </div>
      default:
        return null
    }
  }

  return <section className={styles.section}>
    <div className={styles.content}>
      <div className={styles.metrics}>
        {METRICS.map((v, k) => {
          const checked = v.value === state.metric
          return <div className={classnames(styles.metric, {
            [styles.metricLarger]: v.large
          })} key={k}>
            <input id={`metric${k}`} name='metric' type='radio' checked={checked} onChange={setMetric(v.value)} />
            <label htmlFor={`metric${k}`}>{`${v.label}${v.value === 'default' ? `(${EN.Default})` : ``}`}</label>
            {checked && renderCondition(v.value)}
          </div>
        })}
      </div>
      <div className={styles.notes}>
        <div className={styles.noteTitle}><span>{EN.noteTitle}</span></div>
        <ul className={styles.noteList}>
          <li className={styles.noteItem}>{EN.noteItem1}</li>
          <li className={styles.noteItem}>{EN.noteItem2}</li>
          <li className={styles.noteItem}>{EN.noteItem3}</li>
          <li className={styles.noteItem}>{EN.noteItem4}</li>
          <li className={styles.noteItem}>{EN.noteItem5}</li>
        </ul>
      </div>
      <div className={styles.apply}>
        <div className={styles.applyCheck}>
          <input type='checkbox' id='applyCheck' name='applyCheck' checked={checked} onChange={changeApply} />
          <label htmlFor='applyCheck'>{EN.ApplyAllModel}</label>
        </div>
        <div className={styles.applyNote}>
          <span>{EN.ApplyNote}</span>
        </div>
      </div>
    </div>
    <footer className={styles.footer}>
      <div className={styles.metricButton}><button><span>{EN.confirm}</span></button></div>
      <div className={styles.metricButton}><button className={styles.cancel} onClick={onClose}><span>{EN.Cancel}</span></button></div>
      <div className={styles.metricButton}><button><span>{EN.Reset}</span></button></div>
    </footer>
  </section>
}