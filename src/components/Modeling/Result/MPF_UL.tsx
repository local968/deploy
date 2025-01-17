import React from 'react';
import styles from './styles.module.css';
import Next from './Next.svg';
import { Popover, Button, Icon } from 'antd';
import { formatNumber } from '../../../util';
import EN from '../../../constant/en';
import _ from 'lodash';

interface Interface {
  project: any;
  model: any;
  mismatchArray: Array<Object>;
}

export default function MPF_UL(props: Interface) {
  const {
    model: { featureLabel, dataFlow, standardType },
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
      outlierDictTemp,
      dataViews,
      rawHeader,
      expression,
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

  function DP(label) {
    return <dl>{`${label} scale`}</dl>;
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
        getPopupContainer={el => el.parentElement}
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

    if (problemType === 'Classification') {
      Reflect.deleteProperty(nfm, target);
    }

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
      `${EN.OutlierDetection}`,
      outlierLineCounts[target],
      true,
    );

    if (!mv && !mi && !out) {
      return (
        <dl>
          <dd>{EN.none}</dd>
        </dl>
      );
    }

    return (
      <dl className={styles.over}>
        {mv}
        {mi}
        {out}
      </dl>
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
      if (target && colType[target] !== 'Categorical') {
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
          {res.map((itm, ind) => {
            let len = 0;
            return (
              <dd key={ind}>
                <label>{itm.key}:</label>
                <ul>
                  {itm.data
                    .filter(it => {
                      if (colType[it] === 'Numerical') {
                        return (len = Math.max(len, mapHeader[it].length));
                      }
                    })
                    .map((it, ind) => {
                      let { std_deviation_bounds } = dataViews[it];
                      const { lower, upper } = std_deviation_bounds;
                      const data = `${mapHeader[it]} ${
                        EN.ValidRange
                      }:[${lower.toFixed(2)},${upper.toFixed(2)}]`;
                      return (
                        <li className={styles.dfn} key={ind} title={data}>
                          <dfn
                            style={{
                              width: 8 * len,
                            }}
                          >
                            {mapHeader[it]}
                          </dfn>
                          {EN.ValidRange}:[{lower.toFixed(2)},{upper.toFixed(2)}
                          ]
                        </li>
                      );
                    })}
                </ul>
              </dd>
            );
          })}
        </>
      );
    }
    return (
      <>
        <dt>{title}</dt>
        {res.map((itm, ind) => {
          return (
            <dd key={ind}>
              <label>{itm.key}:</label>
              <ul>
                {itm.data.map((it, ind) => (
                  <li key={ind} title={mapHeader[it]}>
                    {mapHeader[it]}
                  </li>
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
                <li key={it} title={it}>
                  {it}
                </li>
              ))}
            </ul>
          </dt>
        ) : null}

        {raw.length ? (
          <dt>
            <label>{EN.DropTheseVariables}(raw):</label>
            <ul>
              {raw.map(it => (
                <li key={it} title={it}>
                  {it}
                </li>
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
                  <li key={it} title={it}>
                    {it}
                  </li>
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
      {popOver(DP(standardType), EN.DataPreprocessing)}
      <img src={Next} alt="" />
      {popOver(Third(dataFlow[0]), dataFlow[0].model_name)}
      <img src={Next} alt="" />
      <label>{EN.Prediction}</label>
    </section>
  );
}
