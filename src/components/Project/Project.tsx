import React, { ChangeEvent } from 'react';
import styles from './styles.module.css';
import { observer, inject } from 'mobx-react';
import ContinueButton from 'components/Common/ContinueButton';
import { Input } from 'antd';
import EN from '../../constant/en';
import { Show } from 'components/Common';

const { TextArea } = Input;

interface ProjectProps {
  projectStore: any;
  deploymentStore: any;
}

function Project(props: ProjectProps) {
  const { deploymentStore = {}, projectStore = {} } = props;
  const { project } = projectStore;

  if (!project) return null;

  const [name, setName] = React.useState(project ? project.name : '');

  const nextStep = () => {
    const _name: string =
      name ||
      EN.Project + new Date().toLocaleString('chinese', { hour12: false });
    const deployment = deploymentStore.deployments.find(
      (d: any) => project.id === d.projectId,
    );
    if (deployment) deploymentStore.change(deployment.id, 'projectName', _name);
    project.updateProject({
      name: _name,
      business: project.business,
      statement: project.statement,
      ...project.nextMainStep(1),
    });
  };

  const onChange = (type: string) => (e: ChangeEvent<HTMLTextAreaElement>) => {
    project[type] = e.target.value;
  };

  const onChangeName = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  return (
    <div className={styles.project}>
      <div className={styles.row}>
        <label>{EN.ProjectName}</label>
        <Input placeholder={EN.ProjectN} value={name} onChange={onChangeName} />
      </div>
      {/* <AA onChange={this.onChange}/> */}
      {/* <div className={styles.row}>
          <label >Project Description</label>
          <TextArea rows={4} placeholder="project description" defaultValue={project ? project.description : ""} onChange={this.onChange.bind(this, "description")} className={styles.textarea}/>
        </div> */}
      <div className={styles.sep} />
      <div className={styles.textBox}>
        <label>{EN.ProblemStatement}</label>
        <TextArea
          defaultValue={project ? project.statement : ''}
          className={styles.textarea}
          onChange={onChange('statement')}
          rows={4}
          placeholder={` ${EN.Problemstatement}${EN.Predictimportantcustomers} `}
        />
      </div>
      <div className={styles.textBox}>
        <label>{EN.BusinessValue}</label>
        <TextArea
          defaultValue={project ? project.business : ''}
          className={styles.textarea}
          onChange={onChange('business')}
          rows={4}
          placeholder={`${EN.Businessvalue}${EN.Thiswillhelpproactively}`}
        />
      </div>
      <Show name="project_continue">
        <ContinueButton
          width={null}
          onClick={nextStep}
          disabled={false}
          text={EN.Continue}
        />
      </Show>
    </div>
  );
}

export default inject('projectStore', 'deploymentStore')(observer(Project));
