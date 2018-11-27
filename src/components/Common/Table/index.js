import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { AutoSizer, MultiGrid } from 'react-virtualized';

@observer
export default class Table extends Component {
  updateGrids = () => {
    this.grid.forceUpdateGrids()
  }

  cellRenderer = ({ columnIndex, key, rowIndex, style }) => {
    const { data } = this.props;
    const row = data[rowIndex] || []
    const cell = row[columnIndex] || {}
    return (
      <div
        className={cell.cn}
        key={key}
        style={style}
        title={cell.title}
      >
        {cell.content}
      </div>
    )
  }

  MultiGridCb = (grid) => {
    this.grid = grid
  }

  render() {
    const { columnCount, columnWidth, rowHeight, fixedColumnCount, fixedRowCount, rowCount } = this.props;
    return <AutoSizer>
      {({ height, width }) => {
        return <MultiGrid
          columnCount={columnCount}
          columnWidth={columnWidth}
          height={height}
          rowCount={rowCount}
          rowHeight={rowHeight}
          width={width}
          cellRenderer={this.cellRenderer}
          fixedRowCount={fixedRowCount}
          fixedColumnCount={fixedColumnCount}
          style={{ border: "1px solid #ccc" }}
          ref={this.MultiGridCb}
        />
      }}
    </AutoSizer>
  }
}