import React, { Component } from "react";
import styles from "./styles.module.css";
import classnames from "classnames";
import { observer } from "mobx-react";
import { action } from "mobx";
import { NumberInput, Range, Hint } from "components/Common";
import { Select, message, Tooltip, Popover } from "antd";
import Algorithms from "./algorithms";
import moment from "moment";
import InputNumber from "antd/es/input-number";
import EN from '../../../constant/en';
import SSPlot from "../../Charts/SSPlot";
import Button from "@material-ui/core/Button";
const Option = Select.Option;

@observer
export default class AdvancedView extends Component {
  handleName = action(e => {
    const { project } = this.props;
    project.settings.find(s => s.id === project.settingId).name =
      e.target.value || `custom.${moment().format("MM.DD.YYYY_HH:mm:ss")}`;
  });

  handleMaxTime = value => {
    this.props.project.searchTime = value
    // const { project } = this.props;
    // project.setProperty({
    //   searchTime: value
    // });
  };

  handleRandSeed = value => {
    this.props.project.randSeed = value
    // const { project } = this.props;
    // project.setProperty({
    //   randSeed: value
    // });
  };

  handleMeasurement = value => {
    this.props.project.measurement = value
    // const { project } = this.props;
    // project.setProperty({
    //   measurement: value
    // });
  };

  handleSelectAll = value => {
    const { project } = this.props;
    let algorithms = [];
    if (!value) {
      algorithms = [];
    } else {
      algorithms = Algorithms[project.problemType].map(v => v.value);
    }
    this.props.project.algorithms = algorithms
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
    // project.setProperty({
    //   algorithms: _algorithms
    // });
  };

  handleDefaultCheck = () => {
    this.props.project.algorithms = this.props.project.defaultAlgorithms
    // project.setProperty({
    //   algorithms: _algorithms
    // });
  };

  changeSetting = e => {
    const { project } = this.props;
    if (e.target.value === "default") return this.resetSetting();
    const selectedSetting = project.settings.find(s => s.id === e.target.value);
    if (selectedSetting) {
      project.settingId = e.target.value;
      Object.entries(selectedSetting.setting).forEach(([key, value]) => {
        project[key] = value;
      });
    } else {
      project.settingId = "default";
    }
  };

  resetSetting = () => {
    const { project } = this.props;
    const defaultSetting = {
      kType: "auto",
      algorithms: project.defaultAlgorithms,
      standardType: "standard",
      searchTime: 5,
      measurement: "CVNN",
      randomSeed: 0
    };
    Object.entries(defaultSetting).forEach(([key, value]) => {
      project[key] = value;
    });
    message.info(EN.YourAdvancedModeling);
  };

  handleNum = value => {
    this.props.project.kValue = value
    // const { project } = this.props;
    // project.setProperty({
    //   kValue: value
    // });
  };

  handleMode = type => () => {
    this.props.project.kType = type
    // const { project } = this.props;
    // project.setProperty({
    //   kType: type
    // });
  };

  handleType = (e) => {
    this.props.project.kType = e.target.value
    // const { project } = this.props
    // const value = e.target.value;
    // project.setProperty({
    //   standardType: value
    // })
  }

  render() {
    const { project, hidden } = this.props;
    const { algorithms, defaultAlgorithms } = project
    const isAll = Algorithms[project.problemType].length === algorithms.length
    const isDefault = algorithms.every(al => defaultAlgorithms.includes(al)) && defaultAlgorithms.every(al => algorithms.includes(al))
    const measurementList =
      project.problemType === "Outlier"
        ? // [{ value: "acc", label: 'Accuracy' }, { value: "auc", label: 'AUC' }, { value: "f1", label: 'F1' }, { value: "precision", label: 'Precision' }, { value: "recall", label: 'Recall' }] :
        [{ value: "score", label: EN.Accuracy, hint: EN.ScoreHint }]
        : [
          { value: "CVNN", label: "CVNN", hint: EN.CVNNHint },
          { value: "CH", label: "CH Index", hint: EN.CHIndexHint },
          { value: "silhouette_euclidean", label: "Silhouette Score", hint: EN.SihouetteScoreHint },

          // { value: "CVNN", label: "CVNN" },
          // { value: "RSquared", label: "RSquared" },
          // { value: "RMSSTD", label: "RMSSTD" },
          // { value: "CH", label: "CH" },
          // { value: "silhouette_cosine", label: "silhouette_cosine" },
          // { value: "silhouette_euclidean", label: "silhouette_euclidean" }
        ];
    // const customFieldList = sortHeader.filter(v => colType[v] === "Numerical")
    // const algorithmList = problemType === "Classification" ? ClassificationAlgorithms : RegressionAlgorithms
    return (
      <div className={styles.advanced}>
        <div className={styles.advancedRow}>
          <div className={styles.advancedLeft}>
            <div className={styles.advancedBlock}>
              <div className={`${styles.advancedTitle} ${styles.limit}`}>
                <span>{EN.SelectFromPreviousSettings}:</span>
              </div>
              <div className={styles.advancedOption}>
                <select value={project.settingId} onChange={this.changeSetting}>
                  <option value={"default"}>{EN.Default}</option>
                  {project.settings &&
                    project.settings.map(setting => (
                      <option key={setting.id} value={setting.id}>
                        {setting.name}
                      </option>
                    ))}
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
                  value={project.settingName}
                  onChange={this.handleName}
                />
              </div>
            </div>
          </div>
        </div>
        {project.problemType === "Outlier" ? null : <div className={styles.advancedRow}>
          <div className={styles.advancedBox}>
            <div className={styles.advancedBlock}>
              <div className={`${styles.advancedTitle}`}>
                <span>{EN.SpecifytheNumberofClusterstoForm}</span>
              </div>
              <Popover
                placement="bottomLeft"
                content={<SSPlot
                  height={300} width={600}
                  project={project}
                />} title={null}>
                <Button className={styles.button}>{EN.WithinGroupSsPlot}</Button>
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
                      max={10}
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
                    checked={isAll}
                    readOnly
                    onClick={this.handleSelectAll.bind(null, true)}
                  />
                  <label htmlFor="algorithmSelect1">{EN.SelectAll}</label>
                </div>
                <div className={styles.advancedOptionBox}>
                  <input
                    id="algorithmSelect2"
                    type="radio"
                    name="algorithmSelect"
                    checked={!project.algorithms.length}
                    readOnly
                    onClick={this.handleSelectAll.bind(null, false)}
                  />
                  <label htmlFor="algorithmSelect2">{EN.DeselectAll}</label>
                </div>
                <div className={styles.advancedOptionBox}>
                  <input
                    id="algorithmSelect2"
                    type="radio"
                    name="algorithmSelect"
                    checked={isDefault}
                    readOnly
                    onClick={this.handleDefaultCheck}
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
          <div className={styles.advancedBlock}>
            <div className={`${styles.advancedTitle} ${styles.otherLabel}`}>
              <span>{EN.SetMaxTrainingTime}:</span>
              <span className={styles.advancedDesc}>
                {EN.Maxamountoftimetoevaluatedifferentmodules}
              </span>
            </div>
            <div className={styles.advancedOption}>
              <NumberInput
                className={styles.advancedSize}
                value={project.searchTime}
                onBlur={this.handleMaxTime}
                min={5}
                isInt={true}
              />
              <span style={{ paddingLeft: 10 }}>
                {EN.Minutes}
                {/*<br />*/}
                ({EN.minutesorlonger})
              </span>
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
      </div>
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
