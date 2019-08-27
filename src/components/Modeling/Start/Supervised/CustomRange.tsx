import { observer } from 'mobx-react';
import Project, { DataView, Stats } from 'stores/Project';
import styles from './styles.module.css';
import EN from '../../../../constant/en';
import React from 'react';
import { Range } from 'components/Common';
import classnames from 'classnames';
interface Interface {
  project: Project;
  dataViews: DataView;
  customField: string;
  customRange: [] | [number, number];
  customFieldList: string[];
}

const CustomRange = observer((props: Interface) => {
  const {
    dataViews,
    customRange,
    customFieldList,
    customField,
    project,
  } = props;
  const data = customField ? dataViews[customField] : ({} as Stats);
  const min = data.min || 0;
  const max = data.max || 0;
  const total = max - min || 1;
  const rangeMin = customRange[0] || min + total * 0.8;
  const rangeMax = customRange[1] || min + total * 0.95;
  const minPercent = Math.round((rangeMin / total) * 100);
  const maxPercent = Math.round((rangeMax / total) * 100);
  const marks = {};
  marks[minPercent] = rangeMin;
  marks[maxPercent] = rangeMax;

  function handleSlider(value: [number, number]) {
    const [minValue, maxValue] = value;
    if (minValue === maxValue) return;
    const { dataViews, customField } = this.props;
    const data = customField ? dataViews[customField] : ({} as Stats);
    const min = data.min || 0;
    const max = data.max || 0;
    const total = max - min || 1;
    project.customRange = [(minValue * total) / 100, (maxValue * total) / 100];
  }
  return (
    <div className={styles.advancedCustomRange}>
      <div className={styles.advancedBlock}>
        <div className={classnames(styles.advancedTitle, styles.limit)}>
          <span>{EN.Selectavariableasreference}:</span>
        </div>
        <div className={styles.advancedOption}>
          <select
            className={classnames(styles.advancedSize, styles.inputLarge)}
            value={customField}
            onChange={this.handleCustomField}
          >
            <option value={''} key="option" />
            {customFieldList.map((i, k) => {
              return (
                <option value={i} key={k}>
                  {i}
                </option>
              );
            })}
          </select>
        </div>
      </div>
      <div className={styles.advancedBlock}>
        {!!customField && (
          <div className={styles.advancedPercentBlock}>
            <div className={styles.advancedPercent}>
              <div
                className={styles.advancedPercentTrain}
                style={{ width: minPercent + '%' }}
              />
              <div
                className={styles.advancedPercentValidation}
                style={{ width: maxPercent - minPercent + '%' }}
              />
              <div
                className={styles.advancedPercentHoldout}
                style={{ width: 100 - maxPercent + '%' }}
              />
            </div>
            <Range
              range={true}
              min={1}
              max={99}
              onChange={handleSlider}
              value={[minPercent, maxPercent]}
              tooltipVisible={true}
              marks={marks}
            />
          </div>
        )}
      </div>
    </div>
  );
});
export default CustomRange;
