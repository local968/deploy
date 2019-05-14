import React, { Component } from 'react';
import classnames from 'classnames';
import { Select, Radio, Tooltip, Icon } from 'antd';
import { observer, inject } from 'mobx-react';
import styles from './AdvancedView.module.css';
import { Hint } from 'components/Common';
import FitPlotHover from './iconMR-FitPlot-Hover.svg';
import FitPlotNormal from './iconMR-FitPlot-Normal.svg';
import FitPlotSelected from './iconMR-FitPlot-Selected.svg';
import { observable, computed, action } from 'mobx';
import moment from 'moment';
import { formatNumber } from 'util'
import EN from '../../../constant/en';
import FitPlot2 from "../../Charts/FitPlot2";
import request from "../../Request";
import ParallelPlots from "../../Charts/ParallelPlots";
const Option = Select.Option;

@inject('projectStore')
@observer
export default class AdvancedView extends Component {

  @observable currentSettingId = 'all';

  @computed
  get filtedModels() {
    const { models, project, projectStore, sort } = this.props;
    let _filtedModels = [...models];

    let { stopFilter, oldfiltedModels } = projectStore;

    const sortMethods = (aModel, bModel) => {
      switch (sort.key) {
        case 'CVNN':
          {
            const aModelData = formatNumber(aModel.score.CVNN);
            const bModelData = formatNumber(bModel.score.CVNN);
            return sort.value === 1 ? aModelData - bModelData : bModelData - aModelData
          }
        case 'RSquared':
          {
            const aModelData = formatNumber(aModel.score.RSquared)
            const bModelData = formatNumber(bModel.score.RSquared)
            return sort.value === 1 ? aModelData - bModelData : bModelData - aModelData
          }
        case 'RMSSTD':
          {
            const aModelData = formatNumber(aModel.score.RMSSTD)
            const bModelData = formatNumber(bModel.score.RMSSTD)
            return sort.value === 1 ? aModelData - bModelData : bModelData - aModelData
          }
        case 'CH':
          {
            const aModelData = formatNumber(aModel.score.CH)
            const bModelData = formatNumber(bModel.score.CH)
            return sort.value === 1 ? aModelData - bModelData : bModelData - aModelData
          }
        case 'silhouette_cosine':
          {
            const aModelData = formatNumber(aModel.score.silhouette_cosine)
            const bModelData = formatNumber(bModel.score.silhouette_cosine)
            return sort.value === 1 ? aModelData - bModelData : bModelData - aModelData
          }
        case 'silhouette_euclidean':
          {
            const aModelData = formatNumber(aModel.score.silhouette_euclidean)
            const bModelData = formatNumber(bModel.score.silhouette_euclidean)
            return sort.value === 1 ? aModelData - bModelData : bModelData - aModelData
          }
        case 'Time':
          return (sort.value === 1 ? 1 : -1) * ((aModel.createTime || 0) - (bModel.createTime || 0))
        case 'Model Name':
        default:
          return (aModel.name > bModel.name ? 1 : -1) * (sort.value === 1 ? 1 : -1)
      }
    };

    projectStore.changeNewfiltedModels(_filtedModels);
    if (!oldfiltedModels) {
      projectStore.changeOldfiltedModels(_filtedModels);
      oldfiltedModels = _filtedModels;
    }

    if (stopFilter && oldfiltedModels) {
      _filtedModels = oldfiltedModels.sort(sortMethods);
    } else {
      _filtedModels = _filtedModels.sort(sortMethods);
    }

    if (this.currentSettingId === 'all') return _filtedModels;
    const currentSetting = project.settings.find(setting => setting.id === this.currentSettingId)
    if (currentSetting && currentSetting.models && currentSetting.models.length > 0)
      return _filtedModels.filter(model => currentSetting.models.find(id => model.id === id))
    return _filtedModels
  }

  changeSetting = action((settingId) => {
    this.currentSettingId = settingId
  });


  constructor(props) {
    super(props);

    props.projectStore.changeOldfiltedModels(undefined)
  }

  render() {
    const { project, sort, handleSort } = this.props;
    return (
      <div className={styles.advancedModelResult}>
        <div className={styles.middle}>
          <div className={styles.settings}>
            <span className={styles.label}>{EN.ModelNameContains}:</span>
            <Select className={styles.settingsSelect} value={this.currentSettingId} onChange={this.changeSetting} getPopupContainer={() => document.getElementsByClassName(styles.settings)[0]}>
              <Option value={'all'}>{EN.All}</Option>
              {project.settings.map(setting => <Option key={setting.id} value={setting.id} >{setting.name}</Option>)}
            </Select>
          </div>
        </div>
        <AdvancedModelTable models={this.filtedModels} project={project} sort={sort} handleSort={handleSort} />
      </div>
    )
  }
}

const questMarks = {
  'CVNN': EN.CVNNHint, 'RSquared': EN.squaredHint, 'RMSSTD':EN.RMSSTDHint, 'CH': "", 'silhouette_cosine': "", 'silhouette_euclidean': ""
}

@observer
class AdvancedModelTable extends Component {

  onClickCheckbox = (modelId) => (e) => {
    this.props.project.setSelectModel(modelId);
    e.stopPropagation()
  };

  render() {
    const { models, project: { selectModel }, sort, handleSort } = this.props;
    const texts = [EN.ModelName, EN.Time, 'CVNN', 'RSquared', 'RMSSTD', 'CH Index', 'Silhouette Cosine', 'Silhouette Euclidean'];
    const arr = []
    const replaceR2 = str => str.replace(/R2/g, 'R²');
    const getHint = (text) => questMarks.hasOwnProperty(text.toString()) ? <Hint content={questMarks[text.toString()]} /> : ''
    const headerData = texts.reduce((prev, curr) => {
      const label = <div className={styles.headerLabel} title={replaceR2(curr)}>{curr === 'Model Name' ? EN.ModelName : replaceR2(curr)}</div>;
      if (curr === sort.key) {
        if (sort.value === 1) return { ...prev, [curr]: <div onClick={handleSort.bind(null, curr)}>{getHint(curr)} {label}<Icon type='up' /></div> }
        if (sort.value === -1) return { ...prev, [curr]: <div onClick={handleSort.bind(null, curr)}>{getHint(curr)} {label}<Icon type='up' style={{ transform: 'rotateZ(180deg)' }} /></div> }
      } else {
        if (arr.includes(curr)) {
          return { ...prev, [curr]: curr };
        }
        return { ...prev, [curr]: <div onClick={handleSort.bind(null, curr)}>{getHint(curr)} {label}<Icon type='minus' /></div> }
      }
      return prev
    }, {});
    const header = <div className={styles.tableHeader}><Row>{texts.map(t => <RowCell data={headerData[t]} key={t} />)}</Row></div>
    const dataSource = models.map(m => {
      return <RegressionModleRow project={this.props.project} key={m.id} texts={texts} onClickCheckbox={this.onClickCheckbox(m.id)} checked={selectModel.id === m.id} model={m} />
    });
    return (
      <React.Fragment>
        {header}
        <div className={styles.advancedModelTable} >

          {dataSource}
        </div>
      </React.Fragment>
    )
  }
}

@observer class RegressionModleRow extends Component {
  state = {
    detail: false
  }
  handleResult = e => {
    this.setState({ detail: !this.state.detail });
  }
  render() {
    const { model, texts, checked } = this.props;
    const { score, modelName } = model;
    const { detail } = this.state;
    return (
      <div >
        <Row onClick={this.handleResult} >
          {texts.map(t => {

            switch (t) {
              case 'Model Name':
                return (
                  <RowCell key={1} data={<div key={1} >
                    <Radio checked={checked} onClick={this.props.onClickCheckbox} />
                    <Tooltip title={modelName}>
                      <span className={styles.modelName} alt={modelName}>{modelName}</span>
                    </Tooltip>
                  </div>}
                  />
                )
              case 'CVNN':
                return <RowCell key={10} data={score.CVNN} />;
              case 'RSquared':
                return <RowCell key={2} data={score.RSquared} />;
              case 'RMSSTD':
                return <RowCell key={11} data={score.RMSSTD} />;
              case 'CH Index':
                return <RowCell key={9} data={score.CH} />;
              case 'Silhouette Cosine':
                return <RowCell key={3} data={score.silhouette_cosine} />;
              case 'Silhouette Euclidean':
                return <RowCell key={4} data={score.silhouette_euclidean} />;
              case 'Time':
                return <RowCell key={12} data={model.createTime ? moment.unix(model.createTime).format('YYYY/MM/DD HH:mm') : ''} notFormat={true} />;
              default:
                return null
            }
          })}
        </Row>
        {detail && <RegressionDetailCurves project={this.props.project} model={model} />}
      </div>
    )
  }
}

@observer
class RegressionDetailCurves extends Component {
  state = {
    curve: "Variable Impact",
    visible: false,
    diagnoseType: null
  }

  handleClick = val => {
    this.setState({ curve: val });
  }

  render() {
    // const { model } = this.props;
    const { curve } = this.state;
    // let curComponent = (
    //   <div className={styles.plot} >
    //     <img className={styles.img} src={model.fitPlotPath} alt="fit plot" />
    //   </div>
    // );
    let curComponent = <div className={styles.plot}>
      <ParallelPlots url={this.props.model.parallelPlotData} />
    </div>
    const thumbnails = [{
      text: 'Parallel Plot',
      hoverIcon: FitPlotHover,
      normalIcon: FitPlotNormal,
      selectedIcon: FitPlotSelected,
      type: 'fitplot'
    }]
    return (
      <div className={styles.detailCurves} >
        <div className={styles.leftPanel} style={{ minWidth: 0 }} >
          {thumbnails.map((tn, i) => <Thumbnail curSelected={curve} key={i} thumbnail={tn} onClick={this.handleClick} value={tn.text} />)}
        </div>
        <div className={styles.rightPanel} >
          {curComponent}
        </div>
      </div>
    )
  }
}

class Thumbnail extends Component {
  state = {
    clickActive: false,
    hoverActive: false
  }
  componentDidMount() {
    const { curSelected, value } = this.props;
    this.setState({ clickActive: curSelected === value });
  }
  componentWillReceiveProps(nextProps) {
    const { curSelected, value } = nextProps;
    this.setState({ clickActive: curSelected === value });
  }
  handleClick = e => {
    e.stopPropagation();
    this.setState({ clickActive: true });
    this.props.onClick(this.props.value);
  }
  handleMouseEnter = () => {
    this.setState({ hoverActive: true });
  }
  handleMouseLeave = () => {
    this.setState({ hoverActive: false });
  }
  render() {
    const { selectedIcon, hoverIcon, normalIcon, text } = this.props.thumbnail;
    const { clickActive, hoverActive } = this.state;
    const icon = clickActive ? selectedIcon : hoverActive ? hoverIcon : normalIcon;
    return (
      <div
        className={styles.thumbnail}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        onClick={this.handleClick}
      >
        <img src={icon} alt="icon" />
        <div>{text}</div>
      </div>
    )
  }
}

class Row extends Component {
  render() {
    const { children, rowStyle, ...other } = this.props;
    return (
      <div className={styles.adrow} style={rowStyle} {...other} >
        {children}
      </div>
    );
  }
}

class RowCell extends Component {
  render() {
    const { data, cellStyle, cellClassName, title, notFormat, ...rest } = this.props;
    return (
      <div
        {...rest}
        style={cellStyle}
        className={classnames(styles.adcell, cellClassName)}
        title={title ? title : typeof data === 'object' ? '' : data}
      >
        {notFormat ? data : formatNumber(data)}
      </div>
    );
  }
}
