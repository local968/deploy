import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Hint, ProcessLoading } from 'components/Common';
import { observable } from 'mobx';
import { Popover, Icon } from 'antd';
// import histogramIcon from './histogramIcon.svg';
// import univariantIcon from './univariantIcon.svg';

const histogramIcon = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+DQo8c3ZnIHdpZHRoPSIzNHB4IiBoZWlnaHQ9IjIwcHgiIHZpZXdCb3g9IjAgMCAzNCAyMCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj4NCiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDM5LjEgKDMxNzIwKSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT4NCiAgICA8dGl0bGU+aWNvblZhcmlhYmxlSW1wb3J0YW5jZUJsdWU8L3RpdGxlPg0KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPg0KICAgIDxkZWZzPg0KICAgICAgICA8cmVjdCBpZD0icGF0aC0xIiB4PSIxLjA4NzEzMDMiIHk9IjIiIHdpZHRoPSIzLjI2MTM5MDg5IiBoZWlnaHQ9IjEzIj48L3JlY3Q+DQogICAgICAgIDxtYXNrIGlkPSJtYXNrLTIiIG1hc2tDb250ZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiBtYXNrVW5pdHM9Im9iamVjdEJvdW5kaW5nQm94IiB4PSIwIiB5PSIwIiB3aWR0aD0iMy4yNjEzOTA4OSIgaGVpZ2h0PSIxMyIgZmlsbD0id2hpdGUiPg0KICAgICAgICAgICAgPHVzZSB4bGluazpocmVmPSIjcGF0aC0xIj48L3VzZT4NCiAgICAgICAgPC9tYXNrPg0KICAgICAgICA8cmVjdCBpZD0icGF0aC0zIiB4PSI1LjQzNTY1MTQ4IiB5PSIwIiB3aWR0aD0iMy4yNjEzOTA4OSIgaGVpZ2h0PSIxNSI+PC9yZWN0Pg0KICAgICAgICA8bWFzayBpZD0ibWFzay00IiBtYXNrQ29udGVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgbWFza1VuaXRzPSJvYmplY3RCb3VuZGluZ0JveCIgeD0iMCIgeT0iMCIgd2lkdGg9IjMuMjYxMzkwODkiIGhlaWdodD0iMTUiIGZpbGw9IndoaXRlIj4NCiAgICAgICAgICAgIDx1c2UgeGxpbms6aHJlZj0iI3BhdGgtMyI+PC91c2U+DQogICAgICAgIDwvbWFzaz4NCiAgICAgICAgPHJlY3QgaWQ9InBhdGgtNSIgeD0iMTQuMTMyNjkzOCIgeT0iNSIgd2lkdGg9IjMuMjYxMzkwODkiIGhlaWdodD0iMTAiPjwvcmVjdD4NCiAgICAgICAgPG1hc2sgaWQ9Im1hc2stNiIgbWFza0NvbnRlbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIG1hc2tVbml0cz0ib2JqZWN0Qm91bmRpbmdCb3giIHg9IjAiIHk9IjAiIHdpZHRoPSIzLjI2MTM5MDg5IiBoZWlnaHQ9IjEwIiBmaWxsPSJ3aGl0ZSI+DQogICAgICAgICAgICA8dXNlIHhsaW5rOmhyZWY9IiNwYXRoLTUiPjwvdXNlPg0KICAgICAgICA8L21hc2s+DQogICAgICAgIDxyZWN0IGlkPSJwYXRoLTciIHg9IjE4LjQ4MTIxNSIgeT0iOCIgd2lkdGg9IjMuMjYxMzkwODkiIGhlaWdodD0iNyI+PC9yZWN0Pg0KICAgICAgICA8bWFzayBpZD0ibWFzay04IiBtYXNrQ29udGVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgbWFza1VuaXRzPSJvYmplY3RCb3VuZGluZ0JveCIgeD0iMCIgeT0iMCIgd2lkdGg9IjMuMjYxMzkwODkiIGhlaWdodD0iNyIgZmlsbD0id2hpdGUiPg0KICAgICAgICAgICAgPHVzZSB4bGluazpocmVmPSIjcGF0aC03Ij48L3VzZT4NCiAgICAgICAgPC9tYXNrPg0KICAgICAgICA8cmVjdCBpZD0icGF0aC05IiB4PSIyMi44Mjk3MzYyIiB5PSI4IiB3aWR0aD0iMy4yNjEzOTA4OSIgaGVpZ2h0PSI3Ij48L3JlY3Q+DQogICAgICAgIDxtYXNrIGlkPSJtYXNrLTEwIiBtYXNrQ29udGVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgbWFza1VuaXRzPSJvYmplY3RCb3VuZGluZ0JveCIgeD0iMCIgeT0iMCIgd2lkdGg9IjMuMjYxMzkwODkiIGhlaWdodD0iNyIgZmlsbD0id2hpdGUiPg0KICAgICAgICAgICAgPHVzZSB4bGluazpocmVmPSIjcGF0aC05Ij48L3VzZT4NCiAgICAgICAgPC9tYXNrPg0KICAgICAgICA8cmVjdCBpZD0icGF0aC0xMSIgeD0iMjcuMTc4MjU3NCIgeT0iMTEiIHdpZHRoPSIzLjI2MTM5MDg5IiBoZWlnaHQ9IjQiPjwvcmVjdD4NCiAgICAgICAgPG1hc2sgaWQ9Im1hc2stMTIiIG1hc2tDb250ZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiBtYXNrVW5pdHM9Im9iamVjdEJvdW5kaW5nQm94IiB4PSIwIiB5PSIwIiB3aWR0aD0iMy4yNjEzOTA4OSIgaGVpZ2h0PSI0IiBmaWxsPSJ3aGl0ZSI+DQogICAgICAgICAgICA8dXNlIHhsaW5rOmhyZWY9IiNwYXRoLTExIj48L3VzZT4NCiAgICAgICAgPC9tYXNrPg0KICAgICAgICA8cmVjdCBpZD0icGF0aC0xMyIgeD0iOS43ODQxNzI2NiIgeT0iNSIgd2lkdGg9IjMuMjYxMzkwODkiIGhlaWdodD0iMTAiPjwvcmVjdD4NCiAgICAgICAgPG1hc2sgaWQ9Im1hc2stMTQiIG1hc2tDb250ZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiBtYXNrVW5pdHM9Im9iamVjdEJvdW5kaW5nQm94IiB4PSIwIiB5PSIwIiB3aWR0aD0iMy4yNjEzOTA4OSIgaGVpZ2h0PSIxMCIgZmlsbD0id2hpdGUiPg0KICAgICAgICAgICAgPHVzZSB4bGluazpocmVmPSIjcGF0aC0xMyI+PC91c2U+DQogICAgICAgIDwvbWFzaz4NCiAgICA8L2RlZnM+DQogICAgPGcgaWQ9IjUuTW9kZWxpbmciIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPg0KICAgICAgICA8ZyBpZD0iaWNvblZhcmlhYmxlSW1wb3J0YW5jZUJsdWUiIHN0cm9rZT0iIzQ0OEVFRCI+DQogICAgICAgICAgICA8ZyBpZD0iaWNvblZhcmlhYmxlQmx1ZSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMC4wMDAwMDAsIDMuMDAwMDAwKSI+DQogICAgICAgICAgICAgICAgPHVzZSBpZD0iUmVjdGFuZ2xlIiBtYXNrPSJ1cmwoI21hc2stMikiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0iI0VGRjVGQyIgeGxpbms6aHJlZj0iI3BhdGgtMSI+PC91c2U+DQogICAgICAgICAgICAgICAgPHVzZSBpZD0iUmVjdGFuZ2xlLTIiIG1hc2s9InVybCgjbWFzay00KSIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSIjRUZGNUZDIiB4bGluazpocmVmPSIjcGF0aC0zIj48L3VzZT4NCiAgICAgICAgICAgICAgICA8dXNlIGlkPSJSZWN0YW5nbGUtMi1Db3B5LTIiIG1hc2s9InVybCgjbWFzay02KSIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSIjRUZGNUZDIiB4bGluazpocmVmPSIjcGF0aC01Ij48L3VzZT4NCiAgICAgICAgICAgICAgICA8dXNlIGlkPSJSZWN0YW5nbGUtMi1Db3B5LTMiIG1hc2s9InVybCgjbWFzay04KSIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSIjRUZGNUZDIiB4bGluazpocmVmPSIjcGF0aC03Ij48L3VzZT4NCiAgICAgICAgICAgICAgICA8dXNlIGlkPSJSZWN0YW5nbGUtMi1Db3B5LTQiIG1hc2s9InVybCgjbWFzay0xMCkiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0iI0VGRjVGQyIgeGxpbms6aHJlZj0iI3BhdGgtOSI+PC91c2U+DQogICAgICAgICAgICAgICAgPHVzZSBpZD0iUmVjdGFuZ2xlLTItQ29weS01IiBtYXNrPSJ1cmwoI21hc2stMTIpIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9IiNFRkY1RkMiIHhsaW5rOmhyZWY9IiNwYXRoLTExIj48L3VzZT4NCiAgICAgICAgICAgICAgICA8dXNlIGlkPSJSZWN0YW5nbGUtMi1Db3B5IiBtYXNrPSJ1cmwoI21hc2stMTQpIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9IiNFRkY1RkMiIHhsaW5rOmhyZWY9IiNwYXRoLTEzIj48L3VzZT4NCiAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMC41NDM1NjUxNDgsMTQuNSBMMzMuMTU3NDc0LDE0LjUiIGlkPSJMaW5lIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIj48L3BhdGg+DQogICAgICAgICAgICA8L2c+DQogICAgICAgIDwvZz4NCiAgICA8L2c+DQo8L3N2Zz4='
const univariantIcon = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4NCjxzdmcgd2lkdGg9IjQwcHgiIGhlaWdodD0iMjZweCIgdmlld0JveD0iMCAwIDQwIDI2IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPg0KICAgIDwhLS0gR2VuZXJhdG9yOiBTa2V0Y2ggNDcuMSAoNDU0MjIpIC0gaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoIC0tPg0KICAgIDx0aXRsZT5JY29uVW5pdmFyaWFudC1Db250aVlDb250aVg8L3RpdGxlPg0KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPg0KICAgIDxkZWZzPjwvZGVmcz4NCiAgICA8ZyBpZD0iTmV3U3RhcnRNb2RlbGluZ0Zsb3ctRnVuY3Rpb25zLUFkdmFuY2VkIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4NCiAgICAgICAgPGcgaWQ9Ikljb25Vbml2YXJpYW50LUNvbnRpWUNvbnRpWCI+DQogICAgICAgICAgICA8ZyBpZD0iaWNvblVuaXZhcmlhdGVQbG90IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyLjAwMDAwMCwgMi4wMDAwMDApIj4NCiAgICAgICAgICAgICAgICA8Zz4NCiAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0iTTEuNSwyMC4yMzUyOTQxIEwzNS41LDIwLjIzNTI5NDEiIGlkPSJ4LWF4aXMiIHN0cm9rZT0iIzQ0OEVFRCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48L3BhdGg+DQogICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0xLjUsMTkuNSBMMS41LDEuNSIgaWQ9InktYXhpcyIgc3Ryb2tlPSIjNDQ4RUVEIiBzdHJva2UtbGluZWNhcD0icm91bmQiPjwvcGF0aD4NCiAgICAgICAgICAgICAgICAgICAgPGcgaWQ9Ikdyb3VwLTgiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDQuMDAwMDAwLCAxLjAwMDAwMCkiIGZpbGw9IiM0NDhFRUQiPg0KICAgICAgICAgICAgICAgICAgICAgICAgPGNpcmNsZSBpZD0iT3ZhbC01IiBjeD0iMSIgY3k9IjE0IiByPSIxIj48L2NpcmNsZT4NCiAgICAgICAgICAgICAgICAgICAgICAgIDxjaXJjbGUgaWQ9Ik92YWwtNS1Db3B5LTYiIGN4PSIxIiBjeT0iMTEiIHI9IjEiPjwvY2lyY2xlPg0KICAgICAgICAgICAgICAgICAgICAgICAgPGNpcmNsZSBpZD0iT3ZhbC01LUNvcHktNyIgY3g9IjEiIGN5PSI4IiByPSIxIj48L2NpcmNsZT4NCiAgICAgICAgICAgICAgICAgICAgICAgIDxjaXJjbGUgaWQ9Ik92YWwtNS1Db3B5IiBjeD0iNS4yIiBjeT0iMTMiIHI9IjEiPjwvY2lyY2xlPg0KICAgICAgICAgICAgICAgICAgICAgICAgPGNpcmNsZSBpZD0iT3ZhbC01LUNvcHktOCIgZmlsbC1vcGFjaXR5PSIwLjgiIGN4PSI1LjIiIGN5PSIxMSIgcj0iMSI+PC9jaXJjbGU+DQogICAgICAgICAgICAgICAgICAgICAgICA8Y2lyY2xlIGlkPSJPdmFsLTUtQ29weS0yIiBjeD0iMTEiIGN5PSI4IiByPSIxIj48L2NpcmNsZT4NCiAgICAgICAgICAgICAgICAgICAgICAgIDxjaXJjbGUgaWQ9Ik92YWwtNS1Db3B5LTkiIGN4PSIxMSIgY3k9IjEwIiByPSIxIj48L2NpcmNsZT4NCiAgICAgICAgICAgICAgICAgICAgICAgIDxjaXJjbGUgaWQ9Ik92YWwtNS1Db3B5LTMiIGN4PSIxNyIgY3k9IjQiIHI9IjEiPjwvY2lyY2xlPg0KICAgICAgICAgICAgICAgICAgICAgICAgPGNpcmNsZSBpZD0iT3ZhbC01LUNvcHktMTMiIGN4PSIxNyIgY3k9IjEiIHI9IjEiPjwvY2lyY2xlPg0KICAgICAgICAgICAgICAgICAgICAgICAgPGNpcmNsZSBpZD0iT3ZhbC01LUNvcHktNCIgY3g9IjI0IiBjeT0iMyIgcj0iMSI+PC9jaXJjbGU+DQogICAgICAgICAgICAgICAgICAgICAgICA8Y2lyY2xlIGlkPSJPdmFsLTUtQ29weS0xMCIgY3g9IjI0IiBjeT0iNyIgcj0iMSI+PC9jaXJjbGU+DQogICAgICAgICAgICAgICAgICAgICAgICA8Y2lyY2xlIGlkPSJPdmFsLTUtQ29weS0xMSIgY3g9IjI0IiBjeT0iMTAiIHI9IjEiPjwvY2lyY2xlPg0KICAgICAgICAgICAgICAgICAgICAgICAgPGNpcmNsZSBpZD0iT3ZhbC01LUNvcHktNSIgY3g9IjMwIiBjeT0iNiIgcj0iMSI+PC9jaXJjbGU+DQogICAgICAgICAgICAgICAgICAgICAgICA8Y2lyY2xlIGlkPSJPdmFsLTUtQ29weS0xMiIgY3g9IjMwIiBjeT0iOSIgcj0iMSI+PC9jaXJjbGU+DQogICAgICAgICAgICAgICAgICAgIDwvZz4NCiAgICAgICAgICAgICAgICA8L2c+DQogICAgICAgICAgICA8L2c+DQogICAgICAgIDwvZz4NCiAgICA8L2c+DQo8L3N2Zz4='

@observer
export default class SimplifiedView extends Component {
  @observable sort = -1
  @observable showHistograms = false
  @observable showCorrelation = false
  @observable visible = false

  show = () => {
    this.showHistograms = true
  }

  hide = e => {
    e && e.stopPropagation();
    this.showHistograms = false
  }

  sortImportance = () => {
    this.sort = this.sort * -1
  }

  formatNumber = (num, isNA) => {
    if (isNA) return "N/A"
    if (typeof num === "number") return num.toFixed(2)
    if (typeof num === "string") return num
    return "N/A"
  }

  render() {
    const { project } = this.props;
    const { target, colType, targetMap, dataViews, dataViewsLoading, preImportance, preImportanceLoading, dataHeader, newVariable, newType, id, totalLines, dataViewProgress, importanceProgress } = project;
    const allVariables = [...dataHeader.filter(h => h !== target), ...newVariable]
    const variableType = { ...newType, ...colType }
    return <div className={styles.simplified}>
      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <div className={styles.tableTh}><span>Name</span></div>
          <div className={styles.tableTh}><span>Histogram</span></div>
          <div className={styles.tableTh}><span>Univariant Plot</span></div>
          <div className={classnames(styles.tableTh, styles.tableImportance)}>
            <div className={styles.tableSort} onClick={this.sortImportance}><span><Icon type={`arrow-${this.sort === 1 ? 'up' : 'down'}`} theme="outlined" /></span></div>
            <span>Importance</span>
            <Hint themeStyle={{ fontSize: '1rem' }} content='The following column reflects the importance of the predictor to the target variable.' />
          </div>
          <div className={styles.tableTh}><span>Data Type</span></div>
          <div className={styles.tableTh}><span>Unique Value</span></div>
          <div className={styles.tableTh}><span>Mean</span></div>
          <div className={styles.tableTh}><span>STD</span></div>
          <div className={styles.tableTh}><span>Median</span></div>
          <div className={styles.tableTh}><span>Min</span></div>
          <div className={styles.tableTh}><span>Max</span></div>
        </div>
        {(dataViewsLoading || preImportanceLoading) ?
          <div className={styles.tableLoading}>
            <Icon type="loading" />
          </div> :
          <div className={styles.tableBody}>
            {allVariables.sort((a, b) => {
              return preImportance ? this.sort * ((preImportance[a] || 0) - (preImportance[b] || 0)) : 0
            }).map((h, i) => {
              if (h === target) return null;
              const data = dataViews ? (dataViews[h] || {}) : {}
              const map = targetMap || {};
              const importance = preImportance ? (preImportance[h] || 0) : 0.01;
              return <SimplifiedViewRow
                key={i}
                value={h}
                data={data}
                map={map}
                importance={importance}
                colType={variableType}
                project={project}
                lines={Math.min(Math.floor(totalLines * 0.95), 1000)} id={id} />
            })}
          </div>}
      </div>
      {(dataViewsLoading || preImportanceLoading) && <ProcessLoading progress={dataViewsLoading ? (dataViewProgress / 2) : (importanceProgress / 2 + 50)} style={{ bottom: '0.25em' }} />}
    </div>
  }
}

@observer
class SimplifiedViewRow extends Component {
  @observable histograms = false
  @observable univariant = false

  showHistograms = () => {
    this.histograms = true
  }

  showUnivariant = () => {
    this.univariant = true
  }

  hideHistograms = e => {
    e && e.stopPropagation();
    this.histograms = false
  }

  hideUnivariant = e => {
    e && e.stopPropagation();
    this.univariant = false
  }

  formatNumber = (num, isNA) => {
    if (isNA) return "N/A"
    if (typeof num === "number") return num.toFixed(2)
    return "N/A"
  }

  render() {
    const { data, importance, colType, value, project, id, lines } = this.props;
    const valueType = colType[value] === 'Numerical' ? 'Numerical' : 'Categorical'
    const isRaw = colType[value] === 'Raw'
    const unique = (isRaw && `${lines}+`) || (valueType === 'Numerical' && 'N/A') || data.uniqueValues
    return <div className={styles.tableRow}>
      <div className={styles.tableTd} title={value}><span>{value}</span></div>
      <div className={styles.tableTd} onClick={this.showHistograms}>
        <img src={histogramIcon} className={styles.tableImage} alt='histogram' />
        {this.histograms && <Popover placement='topLeft'
          visible={this.histograms}
          onVisibleChange={this.hideHistograms}
          trigger="click"
          content={<SimplifiedViewPlot onClose={this.hideHistograms}
            type='histgram'
            path={project.histgramPlotsBase64[value]}
            id={id}
          />} />}
      </div>
      <div className={styles.tableTd} onClick={this.showUnivariant}>
        <img src={univariantIcon} className={styles.tableImage} alt='univariant' />
        {this.univariant && <Popover placement='topLeft'
          visible={this.univariant}
          onVisibleChange={this.hideUnivariant}
          trigger="click"
          content={<SimplifiedViewPlot onClose={this.hideUnivariant}
            type='univariate'
            path={project.univariatePlotsBase64[value]}
            id={id}
          />} />}
      </div>
      <div className={classnames(styles.tableTd, styles.tableImportance)}>
        <div className={styles.preImpotance}>
          <div className={styles.preImpotanceActive} style={{ width: (importance * 100) + '%' }}></div>
        </div>
      </div>
      <div className={styles.tableTd} title={valueType}><span>{valueType}</span></div>
      <div className={classnames(styles.tableTd, {
        [styles.none]: valueType !== 'Categorical'
      })} title={unique}><span>{unique}</span></div>
      <div className={classnames(styles.tableTd, {
        [styles.none]: valueType === 'Categorical'
      })} title={this.formatNumber(data.mean, valueType === 'Categorical')}><span>{this.formatNumber(data.mean, valueType === 'Categorical')}</span></div>
      <div className={classnames(styles.tableTd, {
        [styles.none]: valueType === 'Categorical'
      })} title={this.formatNumber(data.std, valueType === 'Categorical')}><span>{this.formatNumber(data.std, valueType === 'Categorical')}</span></div>
      <div className={classnames(styles.tableTd, {
        [styles.none]: valueType === 'Categorical'
      })} title={this.formatNumber(data.median, valueType === 'Categorical')}><span>{this.formatNumber(data.median, valueType === 'Categorical')}</span></div>
      <div className={classnames(styles.tableTd, {
        [styles.none]: valueType === 'Categorical'
      })} title={this.formatNumber(data.min, valueType === 'Categorical')}><span>{this.formatNumber(data.min, valueType === 'Categorical')}</span></div>
      <div className={classnames(styles.tableTd, {
        [styles.none]: valueType === 'Categorical'
      })} title={this.formatNumber(data.max, valueType === 'Categorical')}><span>{this.formatNumber(data.max, valueType === 'Categorical')}</span></div>
    </div>
  }
}

@observer
class SimplifiedViewPlot extends Component {

  render() {
    const { onClose, path, type, id, style } = this.props;
    return <div className={styles.plot} style={style}>
      <div onClick={onClose} className={styles.plotClose}><span>X</span></div>
      <img src={path} alt={type} />
    </div>
  }
}
