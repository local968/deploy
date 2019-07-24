import classes from "./styles.module.css";
import { Table } from "components/Common";
import EN from '../../../../constant/en';
import React, { Fragment } from 'react'
import Model from "stores/Model";
import { Popover } from 'antd';
import { TwinBar } from 'components/Charts';
import { formatNumber } from '../../../../util'

interface ExplanationProps {
  model: Model,
  mapHeader: StringObject
}

export default function Explanation(props: ExplanationProps) {
  const { model, mapHeader } = props;
  const { labelWithImportance } = model;
  const tableData = React.useMemo(() => {
    const fields = [{ content: <span title={EN.Cluster}>{EN.Cluster}</span>, cn: classes.explanationCell }]
    const indexes = [{ content: <span title={EN.ImportantVariables}>{EN.ImportantVariables}</span>, cn: classes.explanationCell }]
    // const values = [{ content: <span title={EN.ImportantValues}>{EN.ImportantValues}</span>, cn: classes.explanationCell }]
    const distance = [{ content: <span title={EN.distanceInsideCluster}>{EN.distanceInsideCluster}</span>, cn: classes.explanationCell }]
    const numbers = [{ content: <span title={EN.numberInsideCluster}>{EN.numberInsideCluster}</span>, cn: classes.explanationCell }]
    Object.entries(labelWithImportance).map(([k, v], ind) => {
      const curValues = v.values.map(v => isNaN(+v) ? v : Math.round(parseFloat(v.toString()) * 1000) / 1000)
      fields.push({ content: <span title={k}>{k}</span>, cn: classes.explanationCell })
      indexes.push({
        content: <dfn className={classes.dfn}>
          {
            v.indexes.map((itm, index) => {
              const { histogramIndex, originalDiffCluster, originalSameCluster } = v as any;
              return <Fragment key={itm + index} >
                {index ? ',' : ''}
                <Popover
                  content={<TwinBar
                    x={histogramIndex[index]}
                    same={originalSameCluster[index]}
                    diff={originalDiffCluster[index]}
                    x_name={mapHeader[itm]}
                    index={ind}
                  />}
                  trigger="click"
                  arrowPointAtCenter
                getPopupContainer = {()=>(document as any).getElementsByClassName(classes.explanation)[0]}
                >
                  <a href='javascript:' title={mapHeader[itm]} >
                    {mapHeader[itm]}
                  </a>
                </Popover>
              </Fragment>
            })
          }
        </dfn>,
        cn: classes.explanationCell
      });
      // values.push({ content: <span title={curValues.join(',')}>{curValues.join(',')}</span>, cn: classes.explanationCell })
      distance.push({ content: <span title={formatNumber(v.distanceInsideCluster.toString())}>{formatNumber(v.distanceInsideCluster.toString())}</span>, cn: classes.explanationCell })
      numbers.push({ content: <span title={formatNumber(v.numberInsideCluster.toString())}>{formatNumber(v.numberInsideCluster.toString())}</span>, cn: classes.explanationCell })
    });
    return [fields, numbers, distance, indexes]//values
  }, [])

  return <div className={classes.explanation}>
    <Table
      columnWidth={200}
      rowHeight={40}
      columnCount={Object.keys(labelWithImportance).length + 1}
      rowCount={4}
      fixedColumnCount={1}
      fixedRowCount={0}
      checked={null}
      select={null}
      // style={{ border: "1px solid #ccc" }}
      data={tableData}
    />
  </div>
}
