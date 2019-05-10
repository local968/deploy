import classes from "./styles.module.css";
import { Table } from "components/Common";
import React from 'react'

const Explanation = (props) => {
  const { model } = props;
  const { labelWithImportance } = model
  const tableData = React.useMemo(() => {
    const fields = [{ content: <span title={'Cluster'}>{EN.Cluster}</span>, cn: classes.explanationCell }]
    const values = [{ content: <span title={'Important Variables'}>{EN.ImportantVariables}</span>, cn: classes.explanationCell }]
    Object.entries(labelWithImportance).map(([k, v]) => {
      fields.push({ content: <span title={k}>{k}</span>, cn: classes.explanationCell })
      values.push({ content: <span title={v.join(',')}>{v.join(',')}</span>, cn: classes.explanationCell })
    })
    return [fields, values]
  })

  return <div className={classes.explanation}>
    <Table
      columnWidth={200}
      rowHeight={60}
      columnCount={Object.keys(labelWithImportance).length + 1}
      rowCount={2}
      fixedColumnCount={1}
      fixedRowCount={0}
      checked={null}
      select={null}
      style={{ border: "1px solid #ccc" }}
      data={tableData}
    />
  </div>
}

export default Explanation
