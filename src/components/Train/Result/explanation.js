import classes from "./styles.module.css";
import { Table } from "components/Common";
import React from 'react'
import EN from '../../../constant/en';
const Explanation = (props) => {
  const { model, mapHeader } = props;
  const { labelWithImportance } = model
  const tableData = React.useMemo(() => {
    const fields = [{ content: <span title={EN.Cluster}>{EN.Cluster}</span>, cn: classes.explanationCell }]
    const indexes = [{ content: <span title={EN.ImportantVariables}>{EN.ImportantVariables}</span>, cn: classes.explanationCell }]
    const values = [{ content: <span title={EN.ImportantValues}>{EN.ImportantValues}</span>, cn: classes.explanationCell }]
    Object.entries(labelWithImportance).map(([k, v]) => {
      fields.push({ content: <span title={k}>{k}</span>, cn: classes.explanationCell })
      indexes.push({ content: <span title={v.indexes.map(_i => mapHeader[_i]).join(',')}>{v.indexes.map(_i => mapHeader[_i]).join(',')}</span>, cn: classes.explanationCell })
      values.push({ content: <span title={v.values.join(',')}>{v.values.join(',')}</span>, cn: classes.explanationCell })
    })
    return [fields, indexes, values]
  })

  return <div className={classes.explanation}>
    <Table
      columnWidth={200}
      rowHeight={40}
      columnCount={Object.keys(labelWithImportance).length + 1}
      rowCount={3}
      fixedColumnCount={1}
      fixedRowCount={0}
      checked={null}
      select={null}
      // style={{ border: "1px solid #ccc" }}
      data={tableData}
    />
  </div>
}

export default Explanation
