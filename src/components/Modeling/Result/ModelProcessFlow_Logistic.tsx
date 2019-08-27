import React from 'react';
import styles from './styles.module.css';
import { Popover, Button, Icon } from 'antd';
import { formatNumber } from '../../../util';
import EN from '../../../constant/en';
import { toJS } from 'mobx';
import _ from 'lodash';

const Next =
  'data:image/svg+xml;base64,DQo8c3ZnIHdpZHRoPSIxNnB4IiBoZWlnaHQ9IjE2cHgiIHZpZXdCb3g9IjAgMCAxNiAxNiIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj4NCiAgICA8ZyBpZD0iUGFnZS0xIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4NCiAgICAgICAgPGcgaWQ9IjUtNS00bW9kZWxpbmctQkNsYXNzaWZpY2F0aW9uLXNpbXBsZVZpZXc1IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjkyLjAwMDAwMCwgLTQ1NC4wMDAwMDApIiBmaWxsPSIjNDQ4RUVEIj4NCiAgICAgICAgICAgIDxnIGlkPSJHcm91cC00MyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjIxLjQwMDAwMCwgNDQ3LjAwMDAwMCkiPg0KICAgICAgICAgICAgICAgIDxwb2x5Z29uIGlkPSJQYWdlLTEiIHBvaW50cz0iNzcuNDg2NzM3NyA3LjE5OTkxODAzIDc3LjQ4NjczNzcgMTAuMjcwNTk0NCA3MC44IDEwLjI3MDU5NDQgNzAuOCAxOS4xMjg5MTM4IDc3LjQ4NjczNzcgMTkuMTI4OTEzOCA3Ny40ODY3Mzc3IDIyLjIgODUuODAwNDA4OSAxNC42OTk5NTkiPjwvcG9seWdvbj4NCiAgICAgICAgICAgIDwvZz4NCiAgICAgICAgPC9nPg0KICAgIDwvZz4NCjwvc3ZnPg==';

interface Interface {
  project: any;
  model: any;
  mismatchArray: Array<Object>;
}

export default function ModelProcessFlow_Logistic(props: Interface) {
	const {
		model: { featureLabel, dataFlow },
		project: {
			nullFillMethod,
			nullLineCounts,
			mismatchFillMethod,
			mismatchLineCounts,
			outlierFillMethod,
			outlierLineCounts,
			colType,
			target,
			problemType,
			otherMap,
			mapHeader,
			targetUnique,
			targetCounts,
			colValueCounts,
			targetArray,
			outlierDictTemp,
			rawHeader,
			expression,
			dataViews,
		},
		mismatchArray,
	} = props;

	function list(data) {
    const _data = Object.entries(data).filter(
      itm => itm[0].toString().toUpperCase() !== 'MODEL_NAME',
    );
    if (_data.length) {
      return (
        <>
          {_data.map((itm, index) => {
            const key = itm[0];
            let value = itm[1];
            if (typeof value === 'number') {
              value = formatNumber(String(value));
            }
            return (
              <dd key={index}>
                {'' + key}:{'' + value}
              </dd>
            );
          })}
        </>
      );
    }
  }

  function FP() {
    return (
      <dl>
        <dd>No Preprocessing</dd>
      </dl>
    );
  }

  function Third(data) {
    return <dl>{list(data)}</dl>;
  }

  function popOver(content, text) {
    return (
      <Popover
        overlayClassName={styles.popover}
        arrowPointAtCenter={true}
        autoAdjustOverflow={false}
        getPopupContainer={() =>
          (document as any).getElementsByClassName(styles.process)[0]
        }
        placement="bottom"
        content={content}
        trigger="click"
      >
        <Button>
          {text}
          <Icon type="down" />
        </Button>
      </Popover>
    );
  }

  function DQF() {
    const nfm = _.cloneDeep(nullFillMethod);
    const mfm = _.cloneDeep(mismatchFillMethod);

    Object.entries(nullLineCounts)
      .filter(itm => itm[1] && !nullFillMethod[itm[0]])
      .map(itm => {
        nfm[itm[0]] = colType[itm[0]] === 'Numerical' ? 'mean' : 'mode';
      });

    if (otherMap.hasOwnProperty('')) {
      Reflect.deleteProperty(nfm, target);
    }

    Object.entries(mismatchLineCounts)
      .filter(
        itm =>
          colType[itm[0]] === 'Numerical' &&
          itm[1] &&
          !mismatchFillMethod[itm[0]],
      )
      .map(itm => {
        mfm[itm[0]] = 'mean';
      });

    const mv = DQFData(nfm, EN.MissingValue, nullLineCounts[target]); //缺失值
    const mi = DQFData(mfm, EN.mismatch, mismatchLineCounts[target]);
    const out = DQFData(
      outlierFillMethod,
      `${EN.OutlierDetection}(${target})`,
      outlierLineCounts[target],
      true,
    );

    const dqft =
      ['MultiClassification', 'Classification'].includes(problemType) &&
      DQFT();

    if (!mv && !mi && !out && !dqft) {
      return (
        <dl>
          <dd>{EN.none}</dd>
        </dl>
      );
    }

    return (
      <dl className={styles.over}>
        {dqft}
        {mv}
        {mi}
        {out}
      </dl>
    );
  }

  function DQFT() {
    let drop = [],
      mapping = [];

    let ta = [...targetArray];

    if (!targetArray.length) {
      ta = Object.keys(targetCounts).splice(0, targetUnique);
    }

    const df = _.without(Object.keys(colValueCounts[target]), ...ta);

    const om = {};
    Object.entries(toJS(otherMap)).forEach(itm => {
      om[itm[0]] = itm[1] || 'NULL';
    });

    df.forEach(itm => {
      if (om[itm]) {
        mapping.push([itm, om[itm]]);
      } else {
        drop.push(itm);
      }
    });

    if (ta.find(itm => itm === '') === undefined) {
      const NFMT = om[''] || nullFillMethod[target];

      if (NFMT && nullLineCounts[target]) {
        if (NFMT === 'drop') {
          drop.push('NULL');
        } else {
          mapping.push(['NULL', NFMT]);
        }
      }
    }

    if (!drop.length && !mapping.length) {
      return null;
    }

    return (
      <>
        <dt>{EN.TargetMoreUnique + targetUnique + EN.GE}</dt>
        {
          <dd
            title={drop.join(',')}
            style={{ display: drop.length ? '' : 'none' }}
          >
            {EN.DropTheRows}:{drop.join(',')}
          </dd>
        }
        {
          <dd
            title={mapping.map(itm => `${itm[0]}->${itm[1]}`).join(',')}
            style={{ display: mapping.length ? '' : 'none' }}
          >
            {EN.Mapping}:
            {mapping.map(
              (itm, index) => `${index ? ',' : ''}${itm[0]}->${itm[1]}`,
            )}
          </dd>
        }
      </>
    );
  }

  function DQFData(data, title, showTarget, outlier = false) {
    if (!showTarget) {
      Reflect.deleteProperty(data, target);
    }
    const values = Object.entries(data);

    const result: any = mismatchArray.map((itm: any) => ({
      type: itm.value,
      key: itm.label,
      data: [],
    }));

    values.forEach(itm => {
      if (!isNaN(+itm[1])) {
        if (!result.find(itm => itm.type === itm[1])) {
          result.push({
            type: itm[1],
            key: EN.Replacewith + itm[1],
            data: [],
          });
        }
        result.filter(it => it.type === itm[1])[0].data.push(itm[0]);
      } else if (itm[1] !== 'ignore') {
        result.filter(it => it.type === itm[1])[0].data.push(itm[0]);
      } else {
        if (colType[itm[0]] === 'Categorical') {
          result.filter(it => it.type === itm[1])[0].data.push(itm[0]);
        } else {
          result.filter(it => it.type === itm[1])[1].data.push(itm[0]);
        }
      }
    });

    const res = result.filter(itm => itm.data && itm.data.length);

    if (!res.length) {
      return null;
    }
    if (outlier) {
      let { low, high } = dataViews[target];
      if (outlierDictTemp[target]) {
        const lh = [...outlierDictTemp[target]];
        low = lh[0];
        high = lh[1];
      } else {
        low = +low.toFixed(2);
        high = +high.toFixed(2);
      }
      return (
        <>
          <dt>{title}</dt>
          <dd>
            {EN.ValidRange}:[{low},{high}]
          </dd>
          {res.map(itm => (
            <dd
              key={itm.key}
              title={itm.data.map(itm => mapHeader[itm]).join(',')}
            >
              {itm.key}
            </dd>
          ))}
        </>
      );
    }
    return (
      <>
        <dt>{title}</dt>
        {res.map((itm,ind)=> {
          return (
            <dd key={ind}>
              <label>{itm.key}:</label>
              <ul>
                {itm.data.map((it,index) => (
                  <li key={index} title={mapHeader[it]}>{mapHeader[it]}</li>
                ))}
              </ul>
            </dd>
          );
        })}
      </>
    );
  }

  function FS() {
    //新建特性与特征选择
    let drop = _.without(rawHeader, ...featureLabel, target);

    const create = Object.values(expression).map((itm: any) => {
      return `${itm.nameArray.join(',')}=${itm.exps
        .map(it => (it.type === 'ID' ? mapHeader[it.value] : it.value))
        .join('')}`;
    });

    if (!drop.length && !create.length) {
      return null;
    }

    let raw = drop.filter(itm => colType[itm] === 'Raw');
    drop = _.without(drop, ...raw).map(itm => mapHeader[itm] || itm);

    raw = raw.map(itm => mapHeader[itm] || itm);

    const pop = (
      <dl className={styles.over}>
        {drop.length ? (
          <dt>
            <label>{EN.DropTheseVariables}:</label>
            <ul>
              {drop.map(it => (
                <li title={it}>{it}</li>
              ))}
            </ul>
          </dt>
        ) : null}

        {raw.length ? (
          <dt>
            <label>{EN.DropTheseVariables}(raw):</label>
            <ul>
              {raw.map((it,index) => (
                <li key={index} title={it}>{it}</li>
              ))}
            </ul>
          </dt>
        ) : null}
        {create.length ? (
          <>
            <dt title={create.join(',')}>
              <label>{EN.CreateTheseVariables}:</label>
              <ul>
                {create.map(it => (
                  <li key={it} title={it}>{it}</li>
                ))}
              </ul>
            </dt>
          </>
        ) : null}
      </dl>
    );

    return (
      <>
        <img src={Next} alt="" />
        {popOver(pop, EN.FeatureCreationSelection)}
      </>
    );
  }

  return (
    <section className={styles.process}>
      <label>{EN.RawData}</label>
      <img src={Next} alt="" />
      {popOver(DQF(), EN.DataQualityFixing)}
      {FS()}
      <img src={Next} alt="" />
      {popOver(FP(), EN.DataPreprocessing)}
      <img src={Next} alt="" />
      {popOver(FP(), EN.FeaturePreprocessing)}
      <img src={Next} alt="" />
      {popOver(Third(dataFlow[0]), dataFlow[0].model_name)}
      <img src={Next} alt="" />
      <label>{EN.Prediction}</label>
    </section>
  );
}
