import React, { Component } from 'react';
import { observer } from 'mobx-react';
import styles from './CorrelationMatrix.module.less';
import { MultiGrid } from 'react-virtualized';

@observer
export default class CorrelationMatrix extends Component {
  gradientColors = (start, end, steps, gamma) => {
    let i, j, ms, me, output = [], so = [];
    gamma = gamma || 1;
    const normalize = function (channel) {
      return Math.pow(channel / 255, gamma);
    };
    start = this.parseColor(start).map(normalize);
    end = this.parseColor(end).map(normalize);
    for (i = 0; i < steps; i++) {
      ms = i / (steps - 1);
      me = 1 - ms;
      for (j = 0; j < 3; j++) {
        so[j] = this.pad(Math.round(Math.pow(start[j] * me + end[j] * ms, 1 / gamma) * 255).toString(16));
      }
      output.push('#' + so.join(''));
    }
    return output;
  }

  parseColor = (hexStr) => {
    return hexStr.length === 4 ? hexStr.substr(1).split('').map(function (s) { return 0x11 * parseInt(s, 16); }) : [hexStr.substr(1, 2), hexStr.substr(3, 2), hexStr.substr(5, 2)].map(function (s) { return parseInt(s, 16); });
  }

  // zero-pad 1 digit to 2
  pad = (s) => {
    return (s.length === 1) ? '0' + s : s;
  }

  render() {
    const cor = [1, 0.8, 0.6, 0.4, 0.2, 0, -0.2, -0.4, -0.6, -0.8, -1];
    const colorStep1 = this.gradientColors('#ffffff', '#688bfa', 50);
    const colorStep2 = this.gradientColors('#ff0000', '#ffffff', 50);
    const colorList = [...colorStep2, ...colorStep1]
    const { header, data } = this.props;
    const colorData = header.map((v, i) => {
      const rowData = data[i]
      const colorMap = header.map((key, n) => {
        const index = Math.max(Math.round(((rowData[n] + 1) / 2) * 100), 1) - 1
        return { type: 'block', style: { backgroundColor: colorList[index] }, cn: styles.rect, content: '' }
      })
      return [{ type: 'text', content: v, cn: styles.horizonText }, ...colorMap]
    })

    const topRow = [{ type: 'text', content: '', cn: styles.horizonText }, ...header.map(h => { return { type: 'text', content: h, cn: styles.horizonText, style: { writingMode: 'vertical-lr' } } })]
    const tableData = [topRow, ...colorData] || []
    const count = header.length + 1
    const total = 400
    const rectLength = Math.max(total / count, 25)
    return (
      <div className={styles.correlationMatrix} >
        <div className={styles.matrix} >
          <Table
            data={tableData}
            columnCount={count}
            rowCount={count}
            fixedColumnCount={1}
            fixedRowCount={1}
            height={total}
            width={total}
            rowHeight={rectLength}
            columnWidth={rectLength}
          />
          {/* {header.map((v, i) => {
            return <CorrelationRow
              data={data[i]}
              key={i}
              index={i}
              header={header}
            />
          })} */}
        </div>
        <div className={styles.colorBar} >
          <div className={styles.bar}></div>
          <div className={styles.text}>
            {cor.map(c => <div key={c}>{c}</div>)}
          </div>
        </div>
      </div>
    )
  }
}

class Table extends Component {
  cellRenderer = ({ columnIndex, key, rowIndex, style }) => {
    const { data } = this.props
    const row = data[rowIndex] || {} // Derive this from your data somehow
    const cell = row[columnIndex] || {}

    return (
      <div
        style={{
          ...style,
          whiteSpace: 'nowrap',
          ...cell.style
        }}
        className={cell.cn}
        title={cell.content}
        key={key}
      >
        {cell.content}
      </div>
    );
  }

  render() {
    const { columnCount, rowCount, fixedColumnCount, fixedRowCount, height, width, rowHeight, columnWidth } = this.props
    return <MultiGrid
      height={height}
      width={width}
      fixedColumnCount={fixedColumnCount}
      fixedRowCount={fixedRowCount}
      rowHeight={({ index }) => { return index === 0 ? Math.max(rowHeight, 50) : rowHeight }}
      columnWidth={({ index }) => { return index === 0 ? Math.max(columnWidth, 50) : columnWidth }}
      columnCount={columnCount}
      rowCount={rowCount}
      // deferredMeasurementCache={this.cellcache}
      cellRenderer={this.cellRenderer}
    />
  }
}

// class CorrelationRow extends Component {
//   render() {
//     const { data, header, index } = this.props;
//     const colorStep1 = gradientColors('#ffffff', '#688bfa', 50);
//     const colorStep2 = gradientColors('#ff0000', '#ffffff', 50);
//     const aaa = Math.max(Math.round(((data[i] + 1) / 2) * 100), 1) - 1
//     return (
//       <div className={styles.correlationRow} >
//         <span className={styles.horizonText} title={header[index]} >{header[index]}</span>
//         {header.map((key, i) => {
//           return (
//             <div
//               className={styles.rect}
//               key={key}
//               style={{
//                 backgroundColor: [...colorStep2, ...colorStep1][Math.max(Math.round(((data[i] + 1) / 2) * 100), 1) - 1]
//               }}
//             >
//               {index === header.length - 1 && <span title={header[i]} className={styles.verticalText} >{header[i]}</span>}
//             </div>
//           )
//         })}
//       </div>
//     )
//   }
// }