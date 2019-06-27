import React, { Component } from 'react';
import classnames from 'classnames';
import { Select, Radio, Tooltip, Icon } from 'antd';
import { observer, inject } from 'mobx-react';
import styles from './AdvancedView.module.css';
import { Hint } from 'components/Common';
import { computed} from 'mobx';
import moment from 'moment';
import { formatNumber } from 'util'
import EN from '../../../constant/en';
import ParallelPlot from './parallel-plot.png'
import ParallelPlotOn from './parallel-plot-on.png'
import PcaIcon from './pca.png'
import PcaIconOn from './pca-on.png'
import IconParallel from './icon-parallel.svg'
import IconParallel2 from './icon-parallel2.svg'
const { Option } = Select;
import {
  PAW,
  ParallelPlots,
} from "../../Charts"

@inject('projectStore')
@observer
export default class AdvancedView extends Component {

  @computed
  get filtedModels() {
    const { models, project, projectStore, sort, currentSettingId } = this.props;
    let _filtedModels = [...models];

    let { stopFilter, oldfiltedModels } = projectStore;

    const sortMethods = (aModel, bModel) => {
      switch (sort.key) {
        case 'CVNN':
          {
            const aModelData = (aModel.score.CVNN);
            const bModelData = (bModel.score.CVNN);
            return sort.value === 1 ? aModelData - bModelData : bModelData - aModelData
          }
        case 'RSquared':
          {
            const aModelData = (aModel.score.RSquared)
            const bModelData = (bModel.score.RSquared)
            return sort.value === 1 ? aModelData - bModelData : bModelData - aModelData
          }
        case 'RMSSTD':
          {
            const aModelData = (aModel.score.RMSSTD)
            const bModelData = (bModel.score.RMSSTD)
            return sort.value === 1 ? aModelData - bModelData : bModelData - aModelData
          }
        case 'CH Index':
          {
            const aModelData = (aModel.score.CH)
            const bModelData = (bModel.score.CH)
            return sort.value === 1 ? aModelData - bModelData : bModelData - aModelData
          }
        case 'Silhouette Cosine':
          {
            const aModelData = (aModel.score.silhouette_cosine)
            const bModelData = (bModel.score.silhouette_cosine)
            return sort.value === 1 ? aModelData - bModelData : bModelData - aModelData
          }
        case 'Silhouette Euclidean':
          {
            const aModelData = (aModel.score.silhouette_euclidean)
            const bModelData = (bModel.score.silhouette_euclidean)
            return sort.value === 1 ? aModelData - bModelData : bModelData - aModelData
          }
        case EN.Time:
          return (sort.value === 1 ? 1 : -1) * ((aModel.createTime || 0) - (bModel.createTime || 0))
        case EN.ModelName:
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

    if (currentSettingId === 'all') return _filtedModels;
    const currentSetting = project.settings.find(setting => setting.id === currentSettingId)
    if (currentSetting && currentSetting.models)
      return _filtedModels.filter(model => currentSetting.models.find(id => model.id === id))
    return _filtedModels
  }

  constructor(props) {
    super(props);

    props.projectStore.changeOldfiltedModels(undefined)
  }

  render() {
    const { project, sort, handleSort, currentSettingId, changeSetting } = this.props;
    return (
      <div className={styles.advancedModelResult}>
        <div className={styles.middle}>
          <div className={styles.settings}>
            <span className={styles.label}>{EN.ModelNameContains}:</span>
            <Select className={styles.settingsSelect} value={currentSettingId} onChange={changeSetting} getPopupContainer={() => document.getElementsByClassName(styles.settings)[0]}>
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
  'CVNN': EN.CVNNHint,
  'RSquared': EN.squaredHint,
  'RMSSTD': EN.RMSSTDHint,
  'CH': "",
  'silhouette_cosine': "",
  'silhouette_euclidean': "",
  PCA: EN.PCAIntro,
};

@observer
class AdvancedModelTable extends Component {

  onClickCheckbox = (modelId) => (e) => {
    this.props.project.setSelectModel(modelId);
    e.stopPropagation()
  };

  render() {
    const { models, project: { selectModel }, sort, handleSort } = this.props;
    const texts = [EN.ModelName, EN.Time, 'CVNN', 'RSquared', 'RMSSTD', 'CH Index', 'Silhouette Cosine', 'Silhouette Euclidean', 'Parallel Plot', 'PCA'];
    const arr = [];
    const replaceR2 = str => str.replace(/R2/g, 'R²');
    const getHint = (text) => questMarks.hasOwnProperty(text.toString()) ? <Hint content={questMarks[text.toString()]} /> : ''
    const headerData = texts.reduce((prev, curr) => {
      const label = <div className={styles.headerLabel} title={replaceR2(curr)}>{replaceR2(curr)}</div>;
      if (['PCA', 'Parallel Plot'].includes(curr)) {
        return { ...prev, [curr]: <div>{getHint(curr)} {label}</div> }
      }
      if (curr === sort.key) {
        if (sort.value === 1) {
          return { ...prev, [curr]: <div onClick={handleSort.bind(null, curr)}>{getHint(curr)} {label}<Icon type='up' /></div> }
        }
        if (sort.value === -1) {
          return { ...prev, [curr]: <div onClick={handleSort.bind(null, curr)}>{getHint(curr)} {label}<Icon type='up' style={{ transform: 'rotateZ(180deg)' }} /></div> }
        }
      } else {
        if (arr.includes(curr)) {
          return { ...prev, [curr]: curr };
        }
        return { ...prev, [curr]: <div onClick={handleSort.bind(null, curr)}>{getHint(curr)} {label}<Icon type='minus' /></div> }
      }
      return prev
    }, {});
    console.log('headerData', headerData)
    const header = <div className={styles.tableHeader}>
      <Row>
        {texts.map(t => <RowCell data={headerData[t]} key={t} />)}
        {/*<RowCell data='Parallel Plot' key='para' />*/}
      </Row>
    </div>;
    const dataSource = models.map(m => {
      return <RegressionModleRow project={this.props.project} key={m.id} texts={texts} onClickCheckbox={this.onClickCheckbox(m.id)} checked={selectModel.id === m.id} model={m} />
    });
    return (

      <div className={styles.advancedModelTableDiv}>
        {header}
        <div className={styles.advancedModelTable} >
          {dataSource}
        </div>
      </div>

    )
  }
}

@observer class RegressionModleRow extends Component {
  state = {
    detail: false,
    type: '',
  };
  handleResult = _type => {
    const { type, detail } = this.state;
    this.setState({
      detail: type === _type ? !detail : true,
      type: _type,
    });
  };
  render() {
    const { model, texts, checked } = this.props;
    const { score, modelName } = model;
    const { detail, type } = this.state;
    return (
      <div className={styles.tb}>
        <Row>
          {texts.map(t => {
            switch (t) {
              case EN.ModelName:
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
                return <RowCell key={9} data={score.CH} title={score.CH === 'inf' ? EN.ClusterInfReason : score.CH === 'null' ? EN.ClusterReason : score.CH} />;
              case 'Silhouette Cosine':
                return <RowCell key={3} data={score.silhouette_cosine} title={score.silhouette_cosine === 'inf' ? EN.ClusterInfReason : score.silhouette_cosine === 'null' ? EN.ClusterReason : score.silhouette_cosine} />;
              case 'Silhouette Euclidean':
                return <RowCell key={4} data={score.silhouette_euclidean} title={score.silhouette_euclidean === 'inf' ? EN.ClusterInfReason : score.silhouette_euclidean === 'null' ? EN.ClusterReason : score.silhouette_euclidean} />;
              case EN.Time:
                return <RowCell key={12} data={model.createTime ? moment.unix(model.createTime).format('YYYY/MM/DD HH:mm') : ''} />;
              default:
                return null
            }
          })}
          <RowCell
            onClick={this.handleResult.bind(this, 'Parallel Plot')}
            key='Parallel Plot' data={<a href='javascript:;' className={detail && type === 'Parallel Plot' ? styles.on : ''}>
              {
                detail && type === 'Parallel Plot' ? <img src={IconParallel2} alt='' /> : <img src={IconParallel} alt='' />
              }
              {EN.Compute}
            </a>} />
          <RowCell
            onClick={this.handleResult.bind(this, 'PCA')}
            key='PCA' data={<a href='javascript:;' className={detail && type === 'PCA' ? styles.on : ''}>
              {
                detail && type === 'PCA' ? <img src={IconParallel2} alt='' /> : <img src={IconParallel} alt='' />
              }
              {EN.Compute}
            </a>} />
        </Row>
        {detail && <RegressionDetailCurves
          project={this.props.project}
          model={model}
          type={type}
        />}
      </div>
    )
  }
}

@observer
class RegressionDetailCurves extends Component {
  constructor(props) {
    super(props);
    this.state = {
      curve: props.type,
      visible: false,
      diagnoseType: null
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.type !== this.state.curve) {
      this.handleClick(nextProps.type)
    }
  }

  handleClick = val => {
    this.setState({ curve: val });
  };

  curComponent() {
    const { type, model } = this.props;
    const { curve } = this.state;
    if (curve === 'Parallel Plot') {
      return <ParallelPlots url={model.parallelPlotData} />
    }

    if (['PCA'].includes(curve)) {
      return <PAW url={model.pcaPlotData} />
    }
  }

  render() {
    const { curve } = this.state;
    // let curComponent = (
    //   <div className={styles.plot} >
    //     <img className={styles.img} src={model.fitPlotPath} alt="fit plot" />
    //   </div>
    // );
    // let curComponent = <div className={styles.plot}>
    //   <ParallelPlots url={this.props.model.parallelPlotData} />
    // </div>;
    const thumbnails = [{
      text: 'Parallel Plot',
      hoverIcon: ParallelPlotOn,
      normalIcon: ParallelPlot,
      selectedIcon: ParallelPlotOn,
      type: "Parallel Plot"
    }, {
      text: 'PCA',
      hoverIcon: PcaIcon,
      normalIcon: PcaIcon,
      selectedIcon: PcaIconOn,
      type: 'PCA'
    }];
    return (
      <div className={styles.detailCurves} >
        <div className={styles.leftPanel} style={{
          minWidth: 250,
          backgroundColor: 'transparent',
          padding: '20px 0 0 90px',
        }} >
          {/*<img style={{marginRight:12}} src={ParallelPlot} alt=''/>Parallel Plot*/}
          {thumbnails.map((tn, i) => <Thumbnail curSelected={curve} key={i} thumbnail={tn} onClick={this.handleClick} value={tn.text} />)}
        </div>
        <div className={styles.rightPanel} >
          <div className={styles.plot}>{this.curComponent()}</div>
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
        // onMouseEnter={this.handleMouseEnter}
        // onMouseLeave={this.handleMouseLeave}
        onClick={this.handleClick}
      >
        <img style={{ width: 50, height: 50, margin: 5 }} src={icon} alt="icon" />
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
    const { data, cellStyle, cellClassName, title, ...rest } = this.props;
    return (
      <div
        {...rest}
        style={cellStyle}
        className={classnames(styles.adcell, cellClassName)}
        title={title ? title : typeof data === 'object' ? '' : formatNumber(data)}
      >
        {formatNumber(data)}
      </div>
    );
  }
}
