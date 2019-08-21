import React, { Component } from 'react';
import styles from './AdvancedView.module.css';
import EN from '../../../constant/en';

interface Interface {
  project: any;
}

export default class DiagnoseResult extends Component<Interface> {
  handleNewData = () => {
    const { updateProject, nextMainStep } = this.props.project;
    updateProject(nextMainStep(2));
  };
  handleSetting = () => {
    const { updateProject, jump } = this.props.project;
    updateProject(jump(3, 1));
  };
  handleOutlierFix = () => {
    const { updateProject, jump } = this.props.project;
    updateProject(jump(2, 3));
  };
  render() {
    const { diagnoseType } = this.props;
    let result;
    // const type = 'large';
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
              <button onClick={this.handleSetting} className={styles.button}>
                {EN.GotoAdvancedVariableSetting}
              </button>
            </div>
            <div className={styles.action}>
              <span>{EN.Alternativelyyoucanmodify}</span>
              <button onClick={this.handleNewData} className={styles.button}>
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
              <button onClick={this.handleSetting} className={styles.button}>
                {EN.GotoAdvancedVariableSetting}
              </button>
            </div>
            <div className={styles.action}>
              <span>{EN.Alternativelyyoucanmodify}</span>
              <button onClick={this.handleNewData} className={styles.button}>
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
              <button onClick={this.handleOutlierFix} className={styles.button}>
                {EN.GotoEdittheFixesforOutliers}
              </button>
            </div>
            <div className={styles.action}>
              <span>{EN.Youcantransformorselectvariables}</span>
              <button onClick={this.handleSetting} className={styles.button}>
                {EN.GotoAdvancedVariableSetting}
              </button>
            </div>
            <div className={styles.action}>
              <span>{EN.Alternativelyyoucanmodify}</span>
              <button onClick={this.handleNewData} className={styles.button}>
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
              <button onClick={this.handleSetting} className={styles.button}>
                {EN.GotoAdvancedVariableSetting}
              </button>
            </div>
            <div className={styles.action}>
              <span>{EN.Alternativelyyoucanmodify}</span>
              <button onClick={this.handleNewData} className={styles.button}>
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
              <button onClick={this.handleSetting} className={styles.button}>
                {EN.GotoAdvancedVariableSetting}
              </button>
            </div>
            <div className={styles.action}>
              <span>{EN.Alternativelyyoucanmodify}</span>
              <button onClick={this.handleNewData} className={styles.button}>
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
              <button onClick={this.handleSetting} className={styles.button}>
                {EN.GotoAdvancedVariableSetting}
              </button>
            </div>
            <div className={styles.action}>
              <span>{EN.Alternativelyyoucanmodify}</span>
              <button onClick={this.handleNewData} className={styles.button}>
                {EN.LoadMyNewData}
              </button>
            </div>
          </div>
        );
        break;
      default:
        break;
    }
    return <div className={styles.diagnoseResult} />;
  }
}
