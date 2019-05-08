import React, { Component } from "react";
import styles from "./styles.module.css";
import classnames from "classnames";
import { observer } from "mobx-react";
import { action } from "mobx";
import { NumberInput, Range } from "components/Common";
import { Select, message, Tooltip } from "antd";
import Algorithms from "./algorithms";
import moment from "moment";
import InputNumber from "antd/es/input-number";
import EN from '../../../constant/en';
const Option = Select.Option;

@observer
export default class AdvancedView extends Component {
  handleName = action(e => {
    const { project } = this.props;
    project.settings.find(s => s.id === project.settingId).name =
      e.target.value || `custom.${moment().format("MM.DD.YYYY_HH:mm:ss")}`;
  });

  handleMaxTime = value => {
    const { project } = this.props;
    project.setProperty({
      searchTime: value
    });
  };

  handleRandSeed = value => {
    const { project } = this.props;
    project.setProperty({
      randSeed: value
    });
  };

  handleMeasurement = value => {
    const { project } = this.props;
    project.setProperty({
      measurement: value
    });
  };

  handleSelectAll = value => {
    const { project } = this.props;
    let algorithms = [];
    if (!value) {
      algorithms = [];
    } else {
      algorithms = Algorithms[project.problemType].map(v => v.value);
    }
    project.setProperty({
      algorithms
    });
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
    project.setProperty({
      algorithms: _algorithms
    });
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
      algorithms: ["KMeans"],
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
    const { project } = this.props;
    project.setProperty({
      kValue: value
    });
  };

  handleMode = type => () => {
    const { project } = this.props;
    project.setProperty({
      kType: type
    });
  };

  handleType = (e) => {
    const { project } = this.props
    const value = e.target.value;
    project.setProperty({
      standardType: value
    })
  }

  render() {
    const { project } = this.props;
    const measurementList =
      project.problemType === "Outlier"
        ? // [{ value: "acc", label: 'Accuracy' }, { value: "auc", label: 'AUC' }, { value: "f1", label: 'F1' }, { value: "precision", label: 'Precision' }, { value: "recall", label: 'Recall' }] :
        [{ value: "score", label: EN.Accuracy }]
        : [
          { value: "CVNN", label: "CVNN" },
          { value: "CH", label: "CH Index" },
          { value: "Silhouette Score", label: "Silhouette Score" },

          // { value: "CVNN", label: "CVNN" },
          // { value: "RSquared", label: "RSquared" },
          // { value: "RMSSTD", label: "RMSSTD" },
          // { value: "CH", label: "CH" },
          // { value: "silhouette_cosine", label: "silhouette_cosine" },
          // { value: "silhouette_euclidean", label: "silhouette_euclidean" }
        ];
    // const customFieldList = sortHeader.filter(v => colType[v] === "Numerical")
    // const algorithmList = problemType === "Classification" ? ClassificationAlgorithms : RegressionAlgorithms
  console.log(project.measurement , 'project.measurement')
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
        <div className={styles.advancedRow}>

          <div className={styles.advancedBox}>
            <div className={styles.advancedBlock}>
              {project.problemType === "Outlier" ? <div style={{marginTop:'-60px'}} className={`${styles.advancedTitle_Outlier}`}>
                <span>{EN.ChooseaVariableScalingMethod}</span>
              </div> : <div className={`${styles.advancedTitle}`}>
                  <span>{EN.SpecifytheNumberofClusterstoForm}</span>
                </div>}
            </div>
            <div className={styles.advancedBlock}>
              {project.problemType === "Outlier" ? (
                <div className={styles.chooseScan} style={{ flex: 'auto' }}>
                  <div className={styles.chooseBox}>
                    <input
                      type="radio"
                      name="scan"
                      value="minMax"
                      id="minMax"
                      checked={project.standardType === 'minMax'}
                      onChange={this.handleType}
                    />
                    <label htmlFor="minMax">{EN.minmaxscale}</label>
                  </div>
                  <div className={styles.chooseBox}>
                    <input
                      type="radio"
                      name="scan"
                      value="standard"
                      id="standard"
                      checked={project.standardType === 'standard'}
                      onChange={this.handleType}
                    />
                    <label htmlFor="standard">Standard Scale</label>
                  </div>
                  <div className={styles.chooseBox}>
                    <input
                      type="radio"
                      name="scan"
                      value="robust"
                      id="robust"
                      checked={project.standardType === 'robust'}
                      onChange={this.handleType}
                    />
                    <label htmlFor="robust">Robust Scale</label>
                  </div>
                </div>
              ) : (
                  <div className={styles.advancedOption}>
                    <div className={styles.advancedOptionBox}>
                      <input
                        id="number_auto"
                        type="radio"
                        name="numberselect"
                        defaultChecked={project.kType === "auto"}
                        onClick={this.handleMode("auto")}
                      />
                      <label htmlFor="number_auto">{EN.Auto}</label>
                    </div>
                    <div className={styles.advancedOptionBox}>
                      <input
                        id="number_custom"
                        type="radio"
                        name="numberselect"
                        defaultChecked={project.kType === "no_more_than"}
                        onClick={this.handleMode("no_more_than")}
                      />
                      <label htmlFor="number_custom">{EN.NoMoreThan}</label>
                      <InputNumber
                        value={project.kValue}
                        max={15}
                        min={2}
                        step={0}
                        precision={0}
                        onChange={this.handleNum}
                      />
                    </div>
                  </div>
                )}
            </div>
          </div>




        </div>
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
                    defaultChecked={project.algorithms.length}
                    onClick={this.handleSelectAll.bind(null, true)}
                  />
                  <label htmlFor="algorithmSelect1">{EN.SelectAll}</label>
                </div>
                <div className={styles.advancedOptionBox}>
                  <input
                    id="algorithmSelect2"
                    type="radio"
                    name="algorithmSelect"
                    defaultChecked={!project.algorithms.length}
                    onClick={this.handleSelectAll.bind(null, false)}
                  />
                  <label htmlFor="algorithmSelect2">{EN.DeselectAll}</label>
                </div>
              </div>
            </div>
            <div className={styles.advancedBlock}>
              <div className={styles.advancedAlgorithmList}>
                {Algorithms[project.problemType].map((v, k) => {
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
              {/*<span className={styles.advancedDesc}>*/}
              {/*  {EN.Maxamountoftimetoevaluatedifferentmodules}*/}
              {/*</span>*/}
            </div>
            <div className={styles.advancedOption}>
              <NumberInput
                className={styles.advancedSize}
                value={project.searchTime}
                onBlur={this.handleMaxTime}
                min={5}
                isInt={true}
              />
              <span style={{paddingLeft:10}}>
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
      </div>
    );
  }
}
