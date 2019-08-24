import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames'
import { observer, inject } from 'mobx-react';
import { observable, action } from 'mobx';
import AdvancedView from '../AdvancedView';
import SimpleView from './SimpleView';
import { ProgressBar, ProcessLoading } from 'components/Common';
import { Modal, message, Button, Tooltip } from 'antd'
import EN from '../../../../constant/en';
import { DeploymentStore } from 'stores/DeploymentStore';
import { ProjectStore } from 'stores/ProjectStore';
import { RouterStore } from 'mobx-react-router';

interface ModelResultProps {
  deploymentStore?: DeploymentStore,
  projectStore?: ProjectStore,
  routing?: RouterStore,
  resetSide: () => void
}

@inject('deploymentStore', 'routing', 'projectStore')
@observer
export default class ModelResult extends Component<ModelResultProps> {
  @observable view = 'simple'
  @observable show = false
  @observable sort = {
    simple: {
      key: 'time',
      value: 1
    },
    advanced: {
      key: 'time',
      value: 1
    }
  }
  @observable metric = this.props.projectStore.project.measurement
  // @observable isHoldout = false
  @observable currentSettingId = 'all';
  cancel?: () => void

  changeView = view => {
    this.view = view
  }

  handleSort = (view, key) => {
    const sort = this.sort[view]
    if (!sort) return
    if (sort.key === key) sort.value = -sort.value
    else {
      sort.key = key
      sort.value = 1
    }
    this.sort = { ...this.sort, [view]: sort }
  }

  handleChange = action((value: string) => {
    this.metric = value;
    // if (window.localStorage)
    //   window.localStorage.setItem(`advancedViewMetric:${this.props.project.id}`, value)
  });

  handleHoldout = value => {
    // this.isHoldout = value
    // const {isHoldout} = this.props.projectStore.project;
    this.props.projectStore.project.upIsHoldout(value);
  };

  deploy = () => {
    const { project } = this.props.projectStore;
    const { selectModel: current } = project;
    // const { newVariable, trainHeader } = project
    // const newVariableLabel = newVariable.filter(v => !trainHeader.includes(v))
    // const variables = [...new Set(newVariableLabel.map(label => label.split("_")[1]))]
    // const exps = variables.map(v => expression[v]).filter(n => !!n).join(";").replace(/\|/g, ",")

    this.props.deploymentStore
      .addDeployment(project.id, project.name, current.modelName, current.problemType, project.mapHeader)
      .then(id => this.props.routing.push('/deploy/project/' + id));
  };

  // showInsights = () => {
  //   this.show = true
  // }

  // hideInsights = () => {
  //   this.show = false
  // }

  componentDidMount() {
    this.props.resetSide()
  }

  componentDidUpdate() {
    this.props.resetSide()
  }

  exportReport = (modelId) => async () => {
    try {
      this.cancel = await this.props.projectStore.project.generateReport(modelId)
    } catch (e) {
      message.destroy();
      message.error('导出报告错误。')
      this.props.projectStore.project.reportProgress = 0
      this.props.projectStore.project.reportProgressText = 'init'
    }
  }

  changeSetting = action((settingId: string) => {
    this.currentSettingId = settingId
  });

  createPmml = () => {
    this.props.projectStore.project.selectModel.createPmml().then(result => {
      if (result.status < 0) message.error(result['processError'])
    })
  }

  createContainer = () => {
    this.props.projectStore.project.selectModel.createContainer().then(result => {
      if (result.status < 0) message.error(result['processError'])
    })
  }

  render() {
    const { project } = this.props.projectStore;
    const { models, isHoldout, problemType } = project;
    const { id, etlIndex, fileName, selectModel, target, loadModel, settings } = project
    if (!models.length) return null;
    if (loadModel) return <ProcessLoading style={{ position: 'fixed' }} />
    // const { view } = this;

    const modelName = selectModel.modelName;
    const cannotDownload = !isHoldout && selectModel.isCV && (modelName.startsWith('Ensemble') || modelName.startsWith('r2-solution-DNN'))
    const cannotCreate = modelName.startsWith('r2-solution') || modelName.startsWith('Ensemble')

    const type = isHoldout ? 'holdout' : 'validate'
    const realName = fileName.endsWith('.csv') ? fileName.slice(0, -4) : fileName
    let filterModels = [...models]
    const currentSetting = this.currentSettingId === 'all' ? null : settings.find(setting => setting.id === this.currentSettingId)
    if (currentSetting)
      filterModels = filterModels.filter(model => model.settingId === currentSetting.id)
    return (
      <div className={styles.modelResult}>
        <div className={styles.tabBox}>
          <div className={classnames(styles.tab, {
            [styles.active]: this.view === 'simple'
          })} onClick={this.changeView.bind(null, 'simple')}><span>{EN.SimplifiedView}</span></div>
          <div className={classnames(styles.tab, {
            [styles.active]: this.view === 'advanced'
          })} onClick={this.changeView.bind(null, 'advanced')}><span>{EN.AdvancedView}</span></div>
        </div>
        {/* <div className={styles.buttonBlock} >
          <button className={styles.button} onClick={this.changeView.bind(this, 'simple')}>
            <span>Simple View</span>
          </button>
          <button className={styles.button} onClick={this.changeView.bind(this, 'advanced')}>
            <span>Advanced View</span>
          </button>
        </div> */}
        {this.view === 'simple' ?
          <SimpleView models={filterModels} project={project} exportReport={this.exportReport} sort={this.sort.simple} handleSort={this.handleSort.bind(null, 'simple')} /> :
          <AdvancedView models={models}
            project={project}
            sort={this.sort.advanced}
            handleSort={this.handleSort.bind(null, 'advanced')}
            metric={this.metric}
            handleChange={this.handleChange}
            currentSettingId={this.currentSettingId}
            changeSetting={this.changeSetting} />}
        <div className={styles.buttonBlock}>
          {/* <button className={styles.button} onClick={this.showInsights}>
            <span>Check Model Insights</span>
          </button>
          <div className={styles.or}>
            <span>or</span>
          </div> */}
          <button className={styles.button} onClick={this.deploy}>
            <span>{EN.DeployTheModel}</span>
          </button>
          {this.view === 'advanced' && (cannotDownload ? <button className={classnames(styles.button, styles.disabled)}>
            <span>{`${EN.Exportmodelresults}(${isHoldout ? EN.Holdout : EN.Validation})`}</span>
          </button> : <a href={`/upload/download/result?projectId=${id}&filename=${encodeURIComponent(`${realName}-${selectModel.modelName}-${type}.csv`)}&mid=${selectModel.modelName}&etlIndex=${etlIndex}&type=${type}&target=${target}`} target='_blank'>
              <button className={styles.button}>
                <span>{`${EN.Exportmodelresults}(${isHoldout ? EN.Holdout : EN.Validation})`}</span>
              </button>
            </a>)}
          {this.view === 'advanced' && (!selectModel.getPmml ? (cannotCreate ? <Tooltip title={EN.CannotCreatePmml}>
            <button className={classnames(styles.button, styles.disabled)}>
              <span>{`${EN.CreatePmml}`}</span>
            </button>
          </Tooltip> : <button className={styles.button} onClick={this.createPmml}>
              <span>{`${EN.CreatePmml}`}</span>
            </button>) : !selectModel.pmmlData ?
              <Tooltip title={EN.CannotExportPmml}>
                <button className={classnames(styles.button, styles.disabled)}>
                  <span>{`${EN.DownloadPmml}`}</span>
                </button>
              </Tooltip> : <a href={`/upload/download/pmml?projectId=${id}&mid=${selectModel.modelName}`} target='_blank'>
                <button className={styles.button}>
                  <span>{`${EN.DownloadPmml}`}</span>
                </button>
              </a>)}
          {this.view === 'advanced' && (!selectModel.getContainer ? (cannotCreate ? <Tooltip title={EN.CannotCreatePmml}>
            <button className={classnames(styles.button, styles.disabled)}>
              <span>{`${EN.CreateContainer}`}</span>
            </button>
          </Tooltip> : <button className={styles.button} onClick={this.createContainer}>
              <span>{`${EN.CreateContainer}`}</span>
            </button>) : !selectModel.containerData ?
              <Tooltip title={EN.CannotExportPmml}>
                <button className={classnames(styles.button, styles.disabled)}>
                  <span>{`${EN.DownloadContainer}`}</span>
                </button>
              </Tooltip> : <a href={`/upload/download/container?projectId=${id}&mid=${selectModel.modelName}`} target='_blank'>
                <button className={styles.button}>
                  <span>{`${EN.DownloadContainer}`}</span>
                </button>
              </a>)}
        </div>
        {/* <Modal title='Model Insights'
          visible={current && this.show}
          onClose={this.hideInsights}
          content={<ModelInsights model={current} project={project} />} /> */}
        <Modal title={EN.ExportingReport} visible={project.reportProgressText !== 'init'} closable={true} footer={null} onCancel={this.cancel} maskClosable={false}>
          <div className={styles.reportProgress}>
            <ProgressBar progress={project.reportProgress} allowRollBack={true} />
            <span className={styles.reportProgressText}>{project.reportProgressText}</span>
            <Button onClick={() => this.cancel()} className={styles.reportCancel} >{EN.CANCEL}</Button>
          </div>
        </Modal>
      </div>
    );
  }
}
