import React, { Component, ChangeEvent } from "react";
import styles from "./styles.module.css";
import classnames from "classnames";
import { observer } from "mobx-react";
import { action } from "mobx";
import { NumberInput, Hint, Range } from "components/Common";
import { Select, message, Tooltip, Popover, Icon } from "antd";
import Algorithms from "./algorithms.json";
import InputNumber from "antd/es/input-number";
import EN from '../../../../constant/en';
import Button from "@material-ui/core/Button";
const { Option } = Select;
import {
  SSPlot
} from "../../../Charts"
import Project, { Settings } from "stores/Project";

interface AdvancedViewProps {
  setSettingName: (s: string) => void,
  setSetting: (o: unknown) => void
  project: Project,
  hidden: boolean,
  setting: Settings
}

@observer
export default class AdvancedView extends Component<AdvancedViewProps> {
  handleName = (e: ChangeEvent<HTMLInputElement>) => {
    const { setSettingName } = this.props;
    setSettingName(e.target.value)
  }


  handleRandSeed = (value: number) => {
    this.props.project.randSeed = value
    this.props.setSetting({ randSeed: value })
    // const { project } = this.props;
    // project.setProperty({
    //   randSeed: value
    // });
  };

  handleMeasurement = value => {
    this.props.project.measurement = value
    this.props.setSetting({ measurement: value })
    // const { project } = this.props;
    // project.setProperty({
    //   measurement: value
    // });
  };

  handleSelectAll = value => {
    const { project } = this.props;
    let algorithms = [];
    if (value === 'none') {
      algorithms = [];
    } else if (value === 'all') {
      algorithms = Algorithms[project.problemType].map(v => v.value);
    } else if (value === 'default') {
      algorithms = project.defaultAlgorithms
    }
    this.props.project.algorithmRadio = value
    this.props.project.algorithms = algorithms
    this.props.setSetting({ algorithms })
    // project.setProperty({
    //   algorithms
    // });
  };

  handleCheck = (key, e) => {
    const { project } = this.props;
    const isCheck = e.target.checked;
    const { algorithms } = project;
    let _algorithms = [];
    if (isCheck) {
      if (algorithms.includes(key)) return;
      _algorithms = [...algorithms, key];
    } else {
      if (!algorithms.includes(key)) return;
      _algorithms = algorithms.filter(v => v !== key);
    }
    this.props.project.algorithms = _algorithms
    this.props.setSetting({ algorithms: _algorithms })
    // project.setProperty({
    //   algorithms: _algorithms
    // });
  };

  // handleDefaultCheck = () => {
  //   this.props.project.algorithms = this.props.project.defaultAlgorithms
  //   // project.setProperty({
  //   //   algorithms: _algorithms
  //   // });
  // };

  changeSetting = action((e: ChangeEvent<HTMLSelectElement>) => {
    const { project, setSetting } = this.props
    const selectedSetting = project.settings.find(s => s.id === e.target.value)
    if (selectedSetting) {
      Object.entries(selectedSetting.setting).forEach(([key, value]) => {
        project[key] = value
      })
      setSetting(selectedSetting.setting)
    } else {
      setSetting(this.resetSetting(project))
    }
  })

  resetSetting = action((project) => {
    const setting = this.props.project.newSetting()
    Object.entries(setting).forEach(([key, value]) => {
      project[key] = value
    })
    message.destroy();
    message.info(EN.YourAdvancedModeling)
    return setting
  })

  handleNum = value => {
    this.props.project.kValue = value
    this.props.setSetting({ kValue: value })
    // const { project } = this.props;
    // project.setProperty({
    //   kValue: value
    // });
  };

  handleMode = type => () => {
    this.props.project.kType = type
    this.props.setSetting({ kType: type })
    // const { project } = this.props;
    // project.setProperty({
    //   kType: type
    // });
  };

  handleType = (e) => {
    this.props.project.kType = e.target.value
    this.props.setSetting({ kType: e.target.value })
    // const { project } = this.props
    // const value = e.target.value;
    // project.setProperty({
    //   standardType: value
    // })
  }

  handleSpeed = value => {
    this.props.project.speedVSaccuracy = value
    this.props.setSetting({ speedVSaccuracy: value })
  }

  changeSpeed = (isSpeed, value) => {
    if (!isSpeed) value = 10 - value
    if (value < 1 || value > 9) return
    this.props.project.speedVSaccuracy = value
    this.props.setSetting({ speedVSaccuracy: value })
  }

  resetSpeed = () => {
    this.props.project.speedVSaccuracy = 5
    this.props.setSetting({ speedVSaccuracy: 5 })
  }

  render() {
    const { project, hidden, setting } = this.props;
    const { settings, problemType, showSsPlot, algorithmRadio, speedVSaccuracy } = project;
    const measurementList =
      problemType === "Outlier"
        ? [{ value: "score", label: EN.Accuracy, hint: EN.ScoreHint }]
        : [
          { value: "CVNN", label: "CVNN", hint: EN.CVNNHint },
          { value: "CH", label: "CH Index", hint: EN.CHIndexHint },
          { value: "silhouette_euclidean", label: "Silhouette Score", hint: EN.SihouetteScoreHint },
        ];
    return (
      <div className={styles.advanced}>
        <div className={styles.advancedRow}>
          <div className={styles.advancedLeft}>
            <div className={styles.advancedBlock}>
              <div className={`${styles.advancedTitle} ${styles.limit}`}>
                <span>{EN.SelectFromPreviousSettings}:</span>
              </div>
              <div className={styles.advancedOption}>
                <select value={setting.id} onChange={this.changeSetting}>
                  <option value={"default"}>{EN.Default}</option>
                  {settings.map(setting => (
                    <option key={setting.id} value={setting.id}>
                      {setting.name}
                    </option>
                  ))}
                  <option key={setting.id} value={setting.id}>
                    {setting.name}
                  </option>
                </select>
              </div>
            </div>
          </div>
          <div className={styles.advancedRight}>
            <div className={styles.advancedBlock}>
              <div className={`${styles.advancedTitle} ${styles.limit}`}>
                <span>{EN.NameYourModelSettings}:</span>
              </div>
              <div className={styles.advancedOption}>
                <input
                  type="text"
                  value={setting.name}
                  onChange={this.handleName}
                />
              </div>
            </div>
          </div>
        </div>
        {problemType === "Outlier" ? null : <div className={styles.advancedRow}>
          <div className={styles.advancedBox}>
            <div className={styles.advancedBlock}>
              <div className={styles.advancedTitle} id='advancedTitle'>
                <span>{EN.SpecifytheNumberofClusterstoForm}</span>
              </div>
              <Popover
                placement="bottomLeft"
                trigger="click"
                getPopupContainer={() => document.getElementById('advancedTitle')}
                visible={showSsPlot}
                onVisibleChange={() => {
                  project.showSsPlot = !showSsPlot
                }}
                content={<SSPlot
                  height={300} width={600}
                  project={project}
                />} title={<Icon onClick={() => {
                  project.showSsPlot = false
                }
                } className={styles.ssPlot} type="close" />}>
                <Button
                  className={styles.button}>{EN.WithinGroupSsPlot}</Button>
              </Popover>

            </div>
            <div className={styles.advancedBlock}>
              {(
                <div className={styles.advancedOption}>
                  <div className={styles.advancedOptionBox}>
                    <input
                      id="number_auto"
                      type="radio"
                      name="numberselect"
                      checked={project.kType === "auto"}
                      readOnly
                      onClick={this.handleMode("auto")}
                    />
                    <label htmlFor="number_auto">{EN.Auto}</label>
                  </div>
                  <div className={styles.advancedOptionBox}>
                    <input
                      id="number_custom"
                      type="radio"
                      name="numberselect"
                      checked={project.kType === "no_more_than"}
                      readOnly
                      onClick={this.handleMode("no_more_than")}
                    />
                    <label htmlFor="number_custom">{EN.NoMoreThan}</label>
                    <InputNumber
                      value={project.kValue}
                      max={15}
                      min={2}
                      step={1}
                      onChange={this.handleNum}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>}
        <div className={styles.advancedRow}>
          <div className={styles.advancedBox}>
            <div className={styles.advancedBlock}>
              <div className={`${styles.advancedTitle} ${styles.limit}`}>
                <span>{EN.SelectAlgorithm}:</span>
              </div>
              <div className={styles.advancedOption}>
                <div className={styles.advancedOptionBox}>
                  <input
                    id="algorithmSelect1"
                    type="radio"
                    name="algorithmSelect"
                    checked={algorithmRadio === 'all'}
                    readOnly
                    onClick={this.handleSelectAll.bind(null, 'all')}
                  />
                  <label htmlFor="algorithmSelect1">{EN.SelectAll}</label>
                </div>
                <div className={styles.advancedOptionBox}>
                  <input
                    id="algorithmSelect2"
                    type="radio"
                    name="algorithmSelect"
                    checked={algorithmRadio === 'none'}
                    readOnly
                    onClick={this.handleSelectAll.bind(null, 'none')}
                  />
                  <label htmlFor="algorithmSelect2">{EN.DeselectAll}</label>
                </div>
                <div className={styles.advancedOptionBox}>
                  <input
                    id="algorithmSelect3"
                    type="radio"
                    name="algorithmSelect"
                    checked={algorithmRadio === 'default'}
                    readOnly
                    onClick={this.handleSelectAll.bind(null, 'default')}
                  />
                  <label htmlFor="algorithmSelect3">{EN.SelectDefault}</label>
                </div>
              </div>
            </div>
            <div className={styles.advancedBlock}>
              <div className={styles.advancedAlgorithmList}>
                {project.problemType === 'Clustering' ? Algorithms[project.problemType].map((v, k) => {
                  const tooLarge = project.totalLines > 50000 ? ['Agg', 'DBSCAN', 'SpectralClustering'] : project.totalLines > 20000 ? ['SpectralClustering'] : []
                  const notSupport = project.kType === 'no_more_than' ? ['DBSCAN', 'MeanShift'] : []
                  const checked = project.algorithms.includes(v.value)
                  return <AlgorithmCheckBox hidden={hidden} key={k} tooLarge={tooLarge.includes(v.value)} notSupport={notSupport.includes(v.value)} checked={checked} value={v} handleCheck={this.handleCheck} />
                }) : Algorithms[project.problemType].map((v, k) => {
                  return (
                    <div className={styles.advancedAlgorithm} key={k}>
                      <input
                        id={"algorithm" + k}
                        type="checkbox"
                        checked={project.algorithms.includes(v.value)}
                        onChange={this.handleCheck.bind(null, v.value)}
                      />
                      <label htmlFor={"algorithm" + k}>{v.label}</label>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        {project.problemType === "Clustering" && <div className={styles.advancedRow}>
          <div className={styles.advancedBlock}>
            <div className={styles.advancedTitle}>
              <span>{EN.SetMeasurement}:</span>
            </div>
            <div className={styles.advancedOption}>
              <Select
                className={styles.antdAdvancedSize}
                value={project.measurement}
                onChange={this.handleMeasurement}
              >
                {measurementList.map((i, k) => (
                  <Option value={i.value} key={k}>
                    {i.label}
                    <Hint content={i.hint} />
                  </Option>
                ))}
              </Select>
            </div>
          </div>
          <div className={styles.advancedBlock} style={{ marginLeft: "30px" }}>
            <div className={styles.advancedTitle}>
              <span>{EN.RandomSeed}:</span>
              <span className={styles.advancedDesc}>
                {EN.ValueBetween} 0 - 99999999
              </span>
            </div>
            <div className={styles.advancedOption}>
              <NumberInput
                className={`${styles.advancedSize} ${styles.inputLarge}`}
                value={project.randSeed}
                onBlur={this.handleRandSeed}
                min={0}
                max={99999999}
                isInt={true}
              />
            </div>
          </div>
        </div>}
        <div className={styles.advancedRow}>
          <div className={styles.advancedSpeed}>
            <div className={styles.advancedBox}>
              <div className={styles.advancedTitle}>
                <span>{EN.SpeedVSPerformance}:<a className={styles.reset} onClick={this.resetSpeed}>{EN.Reset}</a></span>
              </div>
              <div className={styles.advancedPercentBlock}>
                <div className={styles.advancedPercent}>
                  <div className={styles.advancedPercentCross} style={{ width: ((speedVSaccuracy - 1) / 8 * 100) + '%' }}></div>
                  <div className={styles.advancedPercentHoldout} style={{ width: ((9 - speedVSaccuracy) / 8 * 100) + '%' }}></div>
                </div>
                <Range
                  range={false}
                  step={1}
                  min={1}
                  max={9}
                  onChange={this.handleSpeed}
                  value={speedVSaccuracy}
                  tooltipVisible={false}
                />
              </div>
              <div className={styles.advancedPercentBox}>
                <div className={styles.advancedPercentInput}>
                  <div className={styles.advancedPercentText}>
                    <div className={classnames(styles.advancedPercetColor, styles.advancedPercentCross)}></div>
                    <span>{EN.Speed}</span>
                  </div>
                  <NumberInput value={speedVSaccuracy} onBlur={this.changeSpeed.bind(null, true)} min={1} max={9} isInt={true} />
                </div>
                <div className={styles.advancedPercentInput}>
                  <div className={styles.advancedPercentText}>
                    <div className={classnames(styles.advancedPercetColor, styles.advancedPercentHoldout)}></div>
                    <span>{EN.sPerformance}</span>
                  </div>
                  <NumberInput value={10 - speedVSaccuracy} onBlur={this.changeSpeed.bind(null, false)} min={1} max={9} isInt={true} />
                </div>
              </div>
            </div>
          </div>
          {project.problemType === "Outlier" && <div className={styles.advancedBlock} style={{ marginLeft: "30px" }}>
            <div className={styles.advancedTitle}>
              <span>{EN.RandomSeed}:</span>
              <span className={styles.advancedDesc}>
                {EN.ValueBetween} 0 - 99999999
              </span>
            </div>
            <div className={styles.advancedOption}>
              <NumberInput
                className={`${styles.advancedSize} ${styles.inputLarge}`}
                value={project.randSeed}
                onBlur={this.handleRandSeed}
                min={0}
                max={99999999}
                isInt={true}
              />
            </div>
          </div>}
        </div>
        {project.problemType === "Outlier" && <div className={styles.empty}></div>}
      </div >
    );
  }
}

const AlgorithmCheckBox = (props) => {
  const [visiable, setVisiable] = React.useState(false)
  const { tooLarge, notSupport, checked, value, handleCheck, hidden } = props
  const disabled = tooLarge || notSupport
  const text = tooLarge ? '该算法内存消耗大，当前数据量下不推荐使用。' : notSupport ? '该算法不支持簇的数目选择。' : ''
  return <Tooltip placement='top' title={text} visible={!hidden && disabled && visiable}>
    <div className={classnames(styles.advancedAlgorithm, {
      [styles.algorithmNotAllow]: disabled
    })} onMouseOut={() => setVisiable(false)} onMouseOver={() => setVisiable(true)}>
      <input
        id={"algorithm" + value.value}
        type="checkbox"
        disabled={disabled}
        checked={!disabled && checked}
        onChange={disabled ? () => { } : handleCheck.bind(null, value.value)}
      />
      <label htmlFor={"algorithm" + value.value}>{value.label}</label>
    </div>
  </Tooltip>
}
