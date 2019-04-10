import React from 'react';
import styles from './styles.module.css';
import { observer, inject } from 'mobx-react';
import { Radio } from 'antd';
import Hint from 'components/Common/Hint';
import ContinueButton from 'components/Common/ContinueButton';
import Confirm from 'components/Common/Confirm';
import { action } from 'mobx';
import { RadioChangeEvent } from 'antd/lib/radio';

const RadioGroup = Radio.Group;
const selectable = [
  { value: 'Classification', type: 'True or False (Binary Classification)', detail: (<p>To predict if an event is likely to happen or not (e.g. if a customer will make a purchase or not).</p>) },
  { value: 'Regression', type: 'Continuous Values (Regression)', detail: (<p>To predict a continuous/numeric value (e.g. cost of a purchase)</p>) },
];

const Unsupervised = [
  { value: 'Clustering', type: 'Clustering', detail: null },
  { value: 'Outlier', type: 'Outlier Detection', detail: null }
];

interface ProblemProps {
  // onChange: (v: string) =>(e: RadioChangeEvent) =>  void, 
  // changeProjectType: string, 
  // models: Array<any>, 
  // uploadFileName: Array<any>, 
  // problemType: string, 
  // saveProblem: () => void
  projectStore: any
}

interface ProblemState {
  visiable: boolean
}

const initState: ProblemState = {
  visiable: false
}

function Problem(props: ProblemProps) {
  const { projectStore } = props
  const { project } = projectStore || {} as any;
  const { changeProjectType = '', models = [], uploadFileName = [], problemType = '', saveProblem } = project || {} as any

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
  }

  return <div className={styles.problem}>
    <div className={styles.title}><span>Choose Problem Type</span></div>
    <div className={styles.radioBox}>
      <div className={styles.text}><span>Prediction</span></div>
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
      <div className={styles.text}><span>Unsupervised Learning</span></div>
      <RadioGroup className={styles.radio} value={changeProjectType} onChange={onChange("changeProjectType")}>
        {Unsupervised.map((content, index) => (
          <Radio key={index} value={content.value}>
            {content.type}
            {!!content.detail && <Hint content={content.detail} placement="right" />}
          </Radio>
        ))}
      </RadioGroup>
    </div>
    <ContinueButton onClick={nextStep} disabled={!changeProjectType} text="Continue" width={null} />
    {<Confirm width={'6em'} visible={state.visiable} title='Warning' content={`This action may wipe out all of your previous work (e.g. dataset${!!models.length ? ', models' : ''}). Please proceed with caution.`} onClose={onClose} onConfirm={onConfirm} confirmText='Continue' closeText='Cancel' />}
  </div>
}

export default inject('projectStore')(observer(Problem))

// @inject('projectStore')
// @observer
// class Problem extends Component {

//   @observable visiable = false

//   componentWillUnmount() {
//     this.props.projectStore.project.changeProjectType = this.props.projectStore.project.problemType
//   }

//   nextStep = () => {
//     const { project } = this.props.projectStore;
//     if (!!project.uploadFileName.length && project.problemType && project.problemType !== project.changeProjectType) return this.visiable = true
//     this.onConfirm()
//   }

//   onChange = action((type, e) => {
//     this.props.projectStore.project[type] = e.target.value;
//   })

//   onClose = () => {
//     this.visiable = false
//   }

//   onConfirm = () => {
//     const { project } = this.props.projectStore;
//     project.saveProblem()
//     this.onClose()
//   }

//   render() {
//     const { changeProjectType, models } = this.props.projectStore.project || {}
//     return <div className={styles.problem}>
//       <div className={styles.title}><span>Choose Problem Type</span></div>
//       <div className={styles.radioBox}>
//         <div className={styles.text}><span>Prediction</span></div>
//         <RadioGroup className={styles.radio} value={changeProjectType} onChange={this.onChange.bind(this, "changeProjectType")}>
//           {selectable.map((content, index) => (
//             <Radio key={index} value={content.value}>
//               {content.type}
//               <Hint content={content.detail} placement="right" />
//             </Radio>
//           ))}
//         </RadioGroup>
//       </div>
//       <ContinueButton onClick={this.nextStep} disabled={!changeProjectType} text="Continue" />
//       {<Confirm width={'6em'} visible={this.visiable} title='Warning' content={`This action may wipe out all of your previous work (e.g. dataset${!!models.length ? ', models' : ''}). Please proceed with caution.`} onClose={this.onClose} onConfirm={this.onConfirm} confirmText='Continue' closeText='Cancel' />}
//     </div>
//   }
// }

// export default Problem