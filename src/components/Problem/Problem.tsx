import React from 'react';
import styles from './styles.module.css';
import { observer, inject } from 'mobx-react';
import { Radio } from 'antd';
import { action } from 'mobx';
import { RadioChangeEvent } from 'antd/lib/radio';
import EN from '../../constant/en';
import { ProjectStore } from 'stores/ProjectStore';
import { Show, Hint, ContinueButton, Confirm } from 'components/Common';

const RadioGroup = Radio.Group;
const selectable = [
  {
    value: 'Classification',
    type: EN.TrueorFalseBinaryClassification,
    detail: <p>{EN.Topredictifaneventislikely}</p>,
  },
  {
    value: 'Regression',
    type: EN.ContinuousValuesRegression,
    detail: <p>{EN.Topredictacontinuous}</p>,
  },
];

const Unsupervised = [
  { value: 'Clustering', type: EN.Clustering, detail: EN.ClusteringHint },
  {
    value: 'Outlier',
    type: EN.Outlier,
    detail: EN.OutlierDetectionHint,
  },
  {
    value: 'Association',
    type: EN.Association,
    detail: EN.AssociationHint,
  },
];

interface ProblemProps {
  projectStore: ProjectStore;
}

interface ProblemState {
  visiable: boolean;
}

const initState: ProblemState = {
  visiable: false,
};

function Problem(props: ProblemProps) {
  const { projectStore } = props;
  const { project } = projectStore;
  const { changeProjectType, fileName, problemType, saveProblem } = project;

  const [state, setState] = React.useState(initState);

  const onChange = action((type: string) => (e: RadioChangeEvent) => {
    project.setProperty({
      [type]: e.target.value,
    });
  });

  const nextStep = () => {
    if (!!fileName && problemType && problemType !== changeProjectType)
      return setState({
        ...state,
        visiable: true,
      });
    onConfirm();
  };

  const onClose = () => {
    setState({
      ...state,
      visiable: false,
    });
  };

  const onConfirm = () => {
    saveProblem();
    onClose();
  };

  return (
    <div className={styles.problem}>
      <div className={styles.title}>
        <span>{EN.ChooseProblemType}</span>
      </div>
      <div className={styles.radioBox}>
        <div className={styles.text}>
          <span>{EN.Predictions}</span>
        </div>
        <RadioGroup
          className={styles.radio}
          value={changeProjectType}
          onChange={onChange('changeProjectType')}
        >
          {selectable.map((content, index) => (
            <Radio key={index} value={content.value}>
              {content.type}
              <Hint content={content.detail} placement="right" />
            </Radio>
          ))}
        </RadioGroup>
      </div>
      <div className={styles.radioBox}>
        <div className={styles.text}>
          <span>{EN.UnsupervisedLearning}</span>
        </div>
        <RadioGroup
          className={styles.radio}
          value={changeProjectType}
          onChange={onChange('changeProjectType')}
        >
          {Unsupervised.map((content, index) => (
            <Radio key={index} value={content.value}>
              {content.type}
              {!!content.detail && (
                <Hint content={content.detail} placement="right" />
              )}
            </Radio>
          ))}
        </RadioGroup>
      </div>
      <Show name="problem_continue">
        <ContinueButton
          onClick={nextStep}
          disabled={!changeProjectType}
          text={EN.Continue}
          width={null}
        />
      </Show>

      {
        <Confirm
          width={'6em'}
          visible={state.visiable}
          title={EN.Warning}
          content={EN.Thisactionmaywipeoutallofyourprevious}
          onClose={onClose}
          onConfirm={onConfirm}
          confirmText={EN.Continue}
          closeText={EN.CANCEL}
        />
      }
    </div>
  );
}

export default inject('projectStore')(observer(Problem));
