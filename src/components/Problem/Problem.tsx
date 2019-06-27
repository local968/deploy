import React from 'react';
import styles from './styles.module.css';
import { observer, inject } from 'mobx-react';
import { Radio } from 'antd';
import Hint from 'components/Common/Hint';
import ContinueButton from 'components/Common/ContinueButton';
import Confirm from 'components/Common/Confirm';
import { action } from 'mobx';
import { RadioChangeEvent } from 'antd/lib/radio';
import EN from '../../constant/en';
const RadioGroup = Radio.Group;
const selectable = [
  { value: 'Classification', type: EN.TrueorFalseBinaryClassification, detail: (<p>{EN.Topredictifaneventislikely}</p>) },
  { value: 'Regression', type: EN.ContinuousValuesRegression, detail: (<p>{EN.Topredictacontinuous}</p>) },
];

const Unsupervised = [
  { value: 'Clustering', type:  EN.Clustering, detail: EN.ClusteringHint },
  { value: 'Outlier', type:  EN.OutlierDetection, detail: EN.OutlierDetectionHint }
];

interface ProblemProps {
  projectStore: any
  userStore:any,
}

interface ProblemState {
  visiable: boolean
}

const initState: ProblemState = {
  visiable: false,
}

function Problem(props: ProblemProps) {
  const { projectStore } = props
  const { project } = projectStore || {} as any;
  const { changeProjectType = '', uploadFileName = [], problemType = '', saveProblem } = project || {} as any

  // const { onChange, changeProjectType = '', models = [], uploadFileName = [], problemType = '', saveProblem } = props

  const [state, setState] = React.useState(initState);

  const onChange = action((type: string) => (e: RadioChangeEvent) => {
    project.setProperty({
      [type]: e.target.value
    })
  })

  const nextStep = () => {
    if (!!uploadFileName.length && problemType && problemType !== changeProjectType) return setState({
      ...state,
      visiable: true
    })
    onConfirm()
  }

  const onClose = () => {
    setState({
      ...state,
      visiable: false
    })
  }

  const onConfirm = () => {
    saveProblem()
    onClose()
  };

  const {problem_continue=true} = props.userStore.info.role;

  return <div className={styles.problem}>
    <div className={styles.title}><span>{EN.ChooseProblemType}</span></div>
    <div className={styles.radioBox}>
      <div className={styles.text}><span>{EN.Predictions}</span></div>
      <RadioGroup className={styles.radio} value={changeProjectType} onChange={onChange("changeProjectType")}>
        {selectable.map((content, index) => (
          <Radio key={index} value={content.value}>
            {content.type}
            <Hint content={content.detail} placement="right" />
          </Radio>
        ))}
      </RadioGroup>
    </div>
    <div className={styles.radioBox}>
      <div className={styles.text}><span>{EN.UnsupervisedLearning}</span></div>
      <RadioGroup className={styles.radio} value={changeProjectType} onChange={onChange("changeProjectType")}>
        {Unsupervised.map((content, index) => (
          <Radio key={index} value={content.value}>
            {content.type}
            {!!content.detail && <Hint content={content.detail} placement="right" />}
          </Radio>
        ))}
      </RadioGroup>
    </div>
    <ContinueButton
      onClick={nextStep}
      disabled={!changeProjectType}
      text={EN.Continue}
      show={problem_continue}
      width={null} />
    {<Confirm width={'6em'} visible={state.visiable} title={EN.Warning} content={EN.Thisactionmaywipeoutallofyourprevious} onClose={onClose} onConfirm={onConfirm} confirmText={EN.Continue} closeText={EN.CANCEL} />}
  </div>
}

export default inject('projectStore','userStore')(observer(Problem))
