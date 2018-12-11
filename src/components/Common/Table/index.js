import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { AutoSizer, MultiGrid } from 'react-virtualized';
import { Spin } from 'antd'

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
        style={{ ...style, ...cell.style }}
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
    const { columnCount, columnWidth, rowHeight, fixedColumnCount, fixedRowCount, rowCount, data, style } = this.props;
    return !!data.length ? <AutoSizer>
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
          style={style}
          ref={this.MultiGridCb}
        />
      }}
    </AutoSizer> : <div style={{ display: 'flex', flex: 'auto', justifyContent: 'center', alignItems: 'center', border: '1px solid #ccc' }}><Spin size='large' /></div>
  }
}