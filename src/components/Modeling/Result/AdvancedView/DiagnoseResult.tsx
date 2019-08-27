import React, { Component, ReactElement } from 'react';
import styles from './DetailCurves.module.css';
import EN from '../../../../constant/en';
import Project from 'stores/Project';

interface Interface {
  project: Project;
  diagnoseType: string;
  handleDiagnose: () => void;
}

export default function DiagnoseResult(props: Interface): ReactElement {
  const {
    diagnoseType,
    handleDiagnose,
    project: { updateProject, nextMainStep, jump },
  } = props;

  const handleNewData = () => updateProject(nextMainStep(2));
  const handleSetting = () => updateProject(jump(3, 1));
  const handleOutlierFix = () =>updateProject(jump(2, 3));
  let result;
  switch (diagnoseType) {
    case 'random':
      result = (
        <div className={styles.content}>{EN.Perfectyourresidualplot} </div>
      );
      break;
    case 'yUnbalanced':
      result = (
        <div className={styles.content}>
          <div>{EN.Yourplotisunbalancedonyaxis}</div>
          <ul className={styles.items}>
            <li>{EN.Lookingforanopportunity}</li>
            <li>{EN.Checkingifyourmodel}</li>
          </ul>
          <div className={styles.action}>
            <span>{EN.Youcantransformorselect}</span>
            <button onClick={handleSetting} className={styles.button}>
              {EN.GotoAdvancedVariableSetting}
            </button>
          </div>
          <div className={styles.action}>
            <span>{EN.Alternativelyyoucanmodify}</span>
            <button onClick={handleNewData} className={styles.button}>
              {EN.LoadMyNewData}
            </button>
          </div>
        </div>
      );
      break;
    case 'xUnbalanced':
      result = (
        <div className={styles.content}>
          <div className={styles.header}>{EN.DiagnoseResults}</div>
          <div>{EN.Yourplotisunbalancedonxaxis}</div>
          <ul className={styles.items}>
            <li>{EN.Lookingforanopportunitytousefully}</li>
            <li>{EN.Checkingifyourmodellack}</li>
          </ul>
          <div className={styles.action}>
            <span>{EN.Youcantransformorselectvariables}</span>
            <button onClick={handleSetting} className={styles.button}>
              {EN.GotoAdvancedVariableSetting}
            </button>
          </div>
          <div className={styles.action}>
            <span>{EN.Alternativelyyoucanmodify}</span>
            <button onClick={handleNewData} className={styles.button}>
              {EN.LoadMyNewData}
            </button>
          </div>
        </div>
      );
      break;
    case 'outliers':
      result = (
        <div className={styles.content}>
          <div className={styles.header}>{EN.DiagnoseResults}</div>
          <div>{EN.Yourplotishassomeoutliers}</div>
          <ul className={styles.items}>
            <li>{EN.Deletingtheoutliers}</li>
            <li>{EN.Checkingifyourmodellack}</li>
          </ul>
          <div className={styles.action}>
            <span>{EN.Youcandeletetheoutliers}</span>
            <button onClick={handleOutlierFix} className={styles.button}>
              {EN.GotoEdittheFixesforOutliers}
            </button>
          </div>
          <div className={styles.action}>
            <span>{EN.Youcantransformorselectvariables}</span>
            <button onClick={handleSetting} className={styles.button}>
              {EN.GotoAdvancedVariableSetting}
            </button>
          </div>
          <div className={styles.action}>
            <span>{EN.Alternativelyyoucanmodify}</span>
            <button onClick={handleNewData} className={styles.button}>
              {EN.LoadMyNewData}
            </button>
          </div>
        </div>
      );
      break;
    case 'nonlinear':
      result = (
        <div className={styles.content}>
          <div className={styles.header}>{EN.DiagnoseResults}</div>
          <div>{EN.Yourplotisnonlinear}</div>
          <ul className={styles.items}>
            <li>{EN.Lookingforanopportunityusefully}</li>
            <li>{EN.Checkingifyourneedtoaddnewavariable}</li>
          </ul>
          <div className={styles.action}>
            <span>{EN.Youcantransformorselect}</span>
            <button onClick={handleSetting} className={styles.button}>
              {EN.GotoAdvancedVariableSetting}
            </button>
          </div>
          <div className={styles.action}>
            <span>{EN.Alternativelyyoucanmodify}</span>
            <button onClick={handleNewData} className={styles.button}>
              {EN.LoadMyNewData}
            </button>
          </div>
        </div>
      );
      break;
    case 'heteroscedasticity':
      result = (
        <div className={styles.content}>
          <div className={styles.header}>{EN.DiagnoseResults}</div>
          <div>{EN.Yourplotisheteroscedasticity}</div>
          <ul className={styles.items}>
            <li>{EN.Lookingforanopportunityusefully}</li>
            <li>{EN.Checkingifyourneedtoaddnewavariable}</li>
          </ul>
          <div className={styles.action}>
            <span>{EN.Youcantransformorselect}</span>
            <button onClick={handleSetting} className={styles.button}>
              {EN.GotoAdvancedVariableSetting}
            </button>
          </div>
          <div className={styles.action}>
            <span>{EN.Alternativelyyoucanmodify}</span>
            <button onClick={handleNewData} className={styles.button}>
              {EN.LoadMyNewData}
            </button>
          </div>
        </div>
      );
      break;
    case 'largey':
      result = (
        <div className={styles.content}>
          <div className={styles.header}>{EN.DiagnoseResults}</div>
          <div>{EN.Yourplothaslargeyaxisdatapoints}</div>
          <ul className={styles.items}>
            <li>{EN.Lookingforanopportunityusefully}</li>
            <li>{EN.Checkingifyourneedtoaddnewavariable}</li>
          </ul>
          <div className={styles.action}>
            <span>{EN.Youcantransformorselect}</span>
            <button onClick={handleSetting} className={styles.button}>
              {EN.GotoAdvancedVariableSetting}
            </button>
          </div>
          <div className={styles.action}>
            <span>{EN.Alternativelyyoucanmodify}</span>
            <button onClick={handleNewData} className={styles.button}>
              {EN.LoadMyNewData}
            </button>
          </div>
        </div>
      );
      break;
    default:
      break;
  }
  return (
    <div className={styles.diagnoseResult}>
      <button onClick={handleDiagnose} className={styles.button}>
        {EN.Diagnose}
      </button>
      {result}
    </div>
  );
}
