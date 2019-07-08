import React, { Component } from 'react';
import styles from '../styles.module.css';
import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import { observable } from 'mobx';
import { Icon, message } from 'antd';
import EN from '../../../../constant/en';
import Project from 'stores/Project';

interface ClassificationTargetProps {
  backToConnect: () => void;
  backToSchema: () => void;
  editTarget: () => void;
  project: Project;
  userStore?:any
}

@inject('userStore')
@observer
class ClassificationTarget extends Component<ClassificationTargetProps> {
  @observable rename = false;
  @observable temp = {};

  showRename = () => {
    this.rename = true;
  };

  hideRename = () => {
    this.rename = false;
    this.temp = {};
  };

  handleRename = (key, e) => {
    const value = e.target.value;
    const { temp } = this;
    this.temp = Object.assign({}, temp, { [key]: value });
  };

  handleSave = () => {
    const { temp } = this;
    const {
      targetCounts,
      renameVariable,
      updateProject,
      histgramPlots,
      target,
    } = this.props.project;
    const deleteKeys = [];
    for (const k of Object.keys(temp)) {
      if (!temp[k]) delete temp[k];
      if (temp[k] === k) deleteKeys.push(k);
    }
    if (Object.keys(temp).length) {
      const renameValues = Object.entries(renameVariable)
        .map(([k, v]) => {
          if (!deleteKeys.includes(k) && targetCounts.hasOwnProperty(k))
            return v;
          return null;
        })
        .filter(n => !!n);
      const values = [
        ...Object.keys(targetCounts),
        ...Object.values(temp).filter(v => !deleteKeys.includes(v)),
        ...renameValues,
      ];
      if (values.length !== [...new Set(values)].length) {
        message.destroy();
        return message.error('Cannot be modified to the same name');
      }
      const { targetArrayTemp, targetMapTemp } = this.props.project;
      if (!!targetArrayTemp.length) {
        targetArrayTemp.forEach((v, k) => {
          if (deleteKeys.includes(v)) {
            delete renameVariable[v];
            delete temp[v];
            return;
          }
          if (temp.hasOwnProperty(v)) {
            Object.keys(targetMapTemp).forEach(key => {
              if (targetMapTemp[key] === k) temp[key] = temp[v];
            });
          }
        });
      }
      const data = Object.assign({}, renameVariable, temp);
      const updateData: {
        renameVariable: any;
        histgramPlots?: any;
      } = { renameVariable: data };
      //更新histgramPlot  target的图
      if (histgramPlots.hasOwnProperty(target)) {
        delete histgramPlots[target];
        updateData.histgramPlots = histgramPlots;
      }
      updateProject(updateData);
    }
    this.rename = false;
    this.temp = {};
  };

  render() {
    const { backToConnect, backToSchema, editTarget, project,userStore } = this.props;
    const {
      targetArrayTemp,
      totalRawLines,
      renameVariable,
      targetCounts,
    } = project;
    const isLess = Object.keys(targetCounts).filter(_k => _k !== '').length < 2;
    const isMore = Object.keys(targetCounts).length > 2;
    const isGood = targetArrayTemp.length === 2 || (!isLess && !isMore);
    const hasNull = !isGood && Object.keys(targetCounts).includes('');
    const error = isLess && !hasNull;
    const nullPercent = ((targetCounts[''] || 0) / (totalRawLines || 1)) * 85;
    const text =
      (isGood && EN.Targetvariablequalityisgood) ||
      `${EN.YourtargetvariableHas}${
        error ? EN.onlyOnevalue : EN.Thantwouniquealues
        }`;
    const {quality_rename=true,quality_Fixit=true,quality_ReselectTargetVariable=true} = userStore.info.role;

    return (
      <div className={styles.block}>
        <div className={styles.name}>
          {isGood && (
            <div className={styles.cleanHeaderIcon}>
              <Icon
                type="check"
                style={{ color: '#fcfcfc', fontSize: '1.6rem' }}
              />
            </div>
          )}
          <span>{text}</span>
        </div>
        <div className={styles.desc}>
          <div
            className={classnames(styles.info, {
              [styles.goodInfo]: isGood,
            })}
          >
            <div className={styles.targetTitleLabel}>
              <span>{EN.TargetValues}</span>
            </div>
            <div className={styles.targetPercentBox}>
              {Object.keys(targetCounts)
                .filter(_k => isGood || _k !== '')
                .map((v, k) => {
                  const percent =
                    ((targetCounts[v] || 0) / (totalRawLines || 1)) * 85;
                  const backgroundColor =
                    (k === 0 && '#9be44b') ||
                    (k === 1 && '#adaafc') ||
                    '#c4cbd7';
                  const value = this.temp.hasOwnProperty(v)
                    ? this.temp[v]
                    : renameVariable[v] || v;
                  return (
                    <div
                      className={styles.targetPercentRow}
                      key={'targetPercentRow' + k}
                    >
                      <div className={styles.targetPercentLabel}>
                        {!this.rename ? (
                          <span title={value || 'NULL'}>{value || 'NULL'}</span>
                        ) : (
                          <input
                            value={value}
                            onChange={this.handleRename.bind(null, v)}
                          />
                        )}
                      </div>
                      <div className={styles.targetPercentValue}>
                        <div
                          className={styles.targetPercent}
                          style={{ width: percent + '%', backgroundColor }}
                        />
                        <span>{targetCounts[v]}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
            {hasNull && (
              <div className={styles.targetTitleLabel}>
                <span>{EN.MissingValues}</span>
              </div>
            )}
            {hasNull && (
              <div className={styles.targetPercentBox}>
                <div
                  className={styles.targetPercentRow}
                  key={'targetPercentRowmissing'}
                >
                  <div className={styles.targetPercentLabel}>
                    <span
                      title={
                        this.temp.hasOwnProperty('')
                          ? this.temp['']
                          : renameVariable[''] || 'NULL'
                      }
                    >
                      {this.temp.hasOwnProperty('')
                        ? this.temp['']
                        : renameVariable[''] || 'NULL'}
                    </span>
                  </div>
                  <div className={styles.targetPercentValue}>
                    <div
                      className={styles.targetPercent}
                      style={{
                        width: nullPercent + '%',
                        backgroundColor: '#ff97a7',
                      }}
                    />
                    <span>{targetCounts['']}</span>
                  </div>
                </div>
              </div>
            )}
            {isGood &&quality_rename&& (
              <div className={styles.cleanTargetBlock}>
                {!this.rename ? (
                  <div className={styles.cleanTargetRename}>
                    <div className={styles.cleanTargetButton}>
                      <button onClick={this.showRename}>
                        <span>{EN.ChangeTargetVariableValue}</span>
                      </button>
                    </div>
                    <span>({EN.Optional})</span>
                    {!!targetArrayTemp.length && (
                      <div className={styles.remapTargetButton}>
                        <button onClick={editTarget}>
                          <span>{EN.RemapTarget}</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={styles.cleanTargetRename}>
                    <div className={styles.cleanTargetButton}>
                      <button onClick={this.handleSave} className={styles.save}>
                        <span>{EN.Save}</span>
                      </button>
                      <button onClick={this.hideRename}>
                        <span>{EN.Cancel}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          {!isGood && (
            <div className={styles.methods}>
              <div className={styles.reasonTitle}>
                <span>{EN.PossibleReasons}</span>
              </div>
              <div className={styles.methodBox}>
                <div className={styles.method}>
                  <div className={styles.reason}>
                    <span>{EN.Itsthewrongtargetvariable}</span>
                  </div>
                  <div style={{display:(quality_ReselectTargetVariable?'':'none')}} className={styles.button} onClick={backToSchema}>
                    <button>
                      <span>{EN.ReselectTargetVariable}</span>
                    </button>
                  </div>
                </div>
                <div className={styles.method}>
                  <div className={styles.reason}>
                    <span>{EN.Itsgeneraldataqualityissue}</span>
                  </div>
                  <div className={styles.button} onClick={backToConnect}>
                    <button>
                      <span>{EN.LoadaNewDataset}</span>
                    </button>
                  </div>
                </div>
                {!error && (
                  <div className={styles.method}>
                    <div className={styles.reason}>
                      <span>{EN.Thetargetvariablehassomenoise}</span>
                    </div>
                    <div
                      style={{display:(quality_Fixit?'':'none')}}
                      className={styles.button} onClick={editTarget}>
                      <button>
                        <span>{EN.Fixit}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default observer(ClassificationTarget);
