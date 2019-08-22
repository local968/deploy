import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { observable } from 'mobx';
import { formatNumber } from '../../../util';
import styles from './styles.module.css';
import { Icon, Popover } from 'antd';
import Chart from '../../Charts/Chart';
import EN from '../../../constant/en';
import classnames from 'classnames'
const histogramIcon = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+DQo8c3ZnIHdpZHRoPSIzNHB4IiBoZWlnaHQ9IjIwcHgiIHZpZXdCb3g9IjAgMCAzNCAyMCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj4NCiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDM5LjEgKDMxNzIwKSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT4NCiAgICA8dGl0bGU+aWNvblZhcmlhYmxlSW1wb3J0YW5jZUJsdWU8L3RpdGxlPg0KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPg0KICAgIDxkZWZzPg0KICAgICAgICA8cmVjdCBpZD0icGF0aC0xIiB4PSIxLjA4NzEzMDMiIHk9IjIiIHdpZHRoPSIzLjI2MTM5MDg5IiBoZWlnaHQ9IjEzIj48L3JlY3Q+DQogICAgICAgIDxtYXNrIGlkPSJtYXNrLTIiIG1hc2tDb250ZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiBtYXNrVW5pdHM9Im9iamVjdEJvdW5kaW5nQm94IiB4PSIwIiB5PSIwIiB3aWR0aD0iMy4yNjEzOTA4OSIgaGVpZ2h0PSIxMyIgZmlsbD0id2hpdGUiPg0KICAgICAgICAgICAgPHVzZSB4bGluazpocmVmPSIjcGF0aC0xIj48L3VzZT4NCiAgICAgICAgPC9tYXNrPg0KICAgICAgICA8cmVjdCBpZD0icGF0aC0zIiB4PSI1LjQzNTY1MTQ4IiB5PSIwIiB3aWR0aD0iMy4yNjEzOTA4OSIgaGVpZ2h0PSIxNSI+PC9yZWN0Pg0KICAgICAgICA8bWFzayBpZD0ibWFzay00IiBtYXNrQ29udGVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgbWFza1VuaXRzPSJvYmplY3RCb3VuZGluZ0JveCIgeD0iMCIgeT0iMCIgd2lkdGg9IjMuMjYxMzkwODkiIGhlaWdodD0iMTUiIGZpbGw9IndoaXRlIj4NCiAgICAgICAgICAgIDx1c2UgeGxpbms6aHJlZj0iI3BhdGgtMyI+PC91c2U+DQogICAgICAgIDwvbWFzaz4NCiAgICAgICAgPHJlY3QgaWQ9InBhdGgtNSIgeD0iMTQuMTMyNjkzOCIgeT0iNSIgd2lkdGg9IjMuMjYxMzkwODkiIGhlaWdodD0iMTAiPjwvcmVjdD4NCiAgICAgICAgPG1hc2sgaWQ9Im1hc2stNiIgbWFza0NvbnRlbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIG1hc2tVbml0cz0ib2JqZWN0Qm91bmRpbmdCb3giIHg9IjAiIHk9IjAiIHdpZHRoPSIzLjI2MTM5MDg5IiBoZWlnaHQ9IjEwIiBmaWxsPSJ3aGl0ZSI+DQogICAgICAgICAgICA8dXNlIHhsaW5rOmhyZWY9IiNwYXRoLTUiPjwvdXNlPg0KICAgICAgICA8L21hc2s+DQogICAgICAgIDxyZWN0IGlkPSJwYXRoLTciIHg9IjE4LjQ4MTIxNSIgeT0iOCIgd2lkdGg9IjMuMjYxMzkwODkiIGhlaWdodD0iNyI+PC9yZWN0Pg0KICAgICAgICA8bWFzayBpZD0ibWFzay04IiBtYXNrQ29udGVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgbWFza1VuaXRzPSJvYmplY3RCb3VuZGluZ0JveCIgeD0iMCIgeT0iMCIgd2lkdGg9IjMuMjYxMzkwODkiIGhlaWdodD0iNyIgZmlsbD0id2hpdGUiPg0KICAgICAgICAgICAgPHVzZSB4bGluazpocmVmPSIjcGF0aC03Ij48L3VzZT4NCiAgICAgICAgPC9tYXNrPg0KICAgICAgICA8cmVjdCBpZD0icGF0aC05IiB4PSIyMi44Mjk3MzYyIiB5PSI4IiB3aWR0aD0iMy4yNjEzOTA4OSIgaGVpZ2h0PSI3Ij48L3JlY3Q+DQogICAgICAgIDxtYXNrIGlkPSJtYXNrLTEwIiBtYXNrQ29udGVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgbWFza1VuaXRzPSJvYmplY3RCb3VuZGluZ0JveCIgeD0iMCIgeT0iMCIgd2lkdGg9IjMuMjYxMzkwODkiIGhlaWdodD0iNyIgZmlsbD0id2hpdGUiPg0KICAgICAgICAgICAgPHVzZSB4bGluazpocmVmPSIjcGF0aC05Ij48L3VzZT4NCiAgICAgICAgPC9tYXNrPg0KICAgICAgICA8cmVjdCBpZD0icGF0aC0xMSIgeD0iMjcuMTc4MjU3NCIgeT0iMTEiIHdpZHRoPSIzLjI2MTM5MDg5IiBoZWlnaHQ9IjQiPjwvcmVjdD4NCiAgICAgICAgPG1hc2sgaWQ9Im1hc2stMTIiIG1hc2tDb250ZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiBtYXNrVW5pdHM9Im9iamVjdEJvdW5kaW5nQm94IiB4PSIwIiB5PSIwIiB3aWR0aD0iMy4yNjEzOTA4OSIgaGVpZ2h0PSI0IiBmaWxsPSJ3aGl0ZSI+DQogICAgICAgICAgICA8dXNlIHhsaW5rOmhyZWY9IiNwYXRoLTExIj48L3VzZT4NCiAgICAgICAgPC9tYXNrPg0KICAgICAgICA8cmVjdCBpZD0icGF0aC0xMyIgeD0iOS43ODQxNzI2NiIgeT0iNSIgd2lkdGg9IjMuMjYxMzkwODkiIGhlaWdodD0iMTAiPjwvcmVjdD4NCiAgICAgICAgPG1hc2sgaWQ9Im1hc2stMTQiIG1hc2tDb250ZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiBtYXNrVW5pdHM9Im9iamVjdEJvdW5kaW5nQm94IiB4PSIwIiB5PSIwIiB3aWR0aD0iMy4yNjEzOTA4OSIgaGVpZ2h0PSIxMCIgZmlsbD0id2hpdGUiPg0KICAgICAgICAgICAgPHVzZSB4bGluazpocmVmPSIjcGF0aC0xMyI+PC91c2U+DQogICAgICAgIDwvbWFzaz4NCiAgICA8L2RlZnM+DQogICAgPGcgaWQ9IjUuTW9kZWxpbmciIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPg0KICAgICAgICA8ZyBpZD0iaWNvblZhcmlhYmxlSW1wb3J0YW5jZUJsdWUiIHN0cm9rZT0iIzQ0OEVFRCI+DQogICAgICAgICAgICA8ZyBpZD0iaWNvblZhcmlhYmxlQmx1ZSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMC4wMDAwMDAsIDMuMDAwMDAwKSI+DQogICAgICAgICAgICAgICAgPHVzZSBpZD0iUmVjdGFuZ2xlIiBtYXNrPSJ1cmwoI21hc2stMikiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0iI0VGRjVGQyIgeGxpbms6aHJlZj0iI3BhdGgtMSI+PC91c2U+DQogICAgICAgICAgICAgICAgPHVzZSBpZD0iUmVjdGFuZ2xlLTIiIG1hc2s9InVybCgjbWFzay00KSIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSIjRUZGNUZDIiB4bGluazpocmVmPSIjcGF0aC0zIj48L3VzZT4NCiAgICAgICAgICAgICAgICA8dXNlIGlkPSJSZWN0YW5nbGUtMi1Db3B5LTIiIG1hc2s9InVybCgjbWFzay02KSIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSIjRUZGNUZDIiB4bGluazpocmVmPSIjcGF0aC01Ij48L3VzZT4NCiAgICAgICAgICAgICAgICA8dXNlIGlkPSJSZWN0YW5nbGUtMi1Db3B5LTMiIG1hc2s9InVybCgjbWFzay04KSIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSIjRUZGNUZDIiB4bGluazpocmVmPSIjcGF0aC03Ij48L3VzZT4NCiAgICAgICAgICAgICAgICA8dXNlIGlkPSJSZWN0YW5nbGUtMi1Db3B5LTQiIG1hc2s9InVybCgjbWFzay0xMCkiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0iI0VGRjVGQyIgeGxpbms6aHJlZj0iI3BhdGgtOSI+PC91c2U+DQogICAgICAgICAgICAgICAgPHVzZSBpZD0iUmVjdGFuZ2xlLTItQ29weS01IiBtYXNrPSJ1cmwoI21hc2stMTIpIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9IiNFRkY1RkMiIHhsaW5rOmhyZWY9IiNwYXRoLTExIj48L3VzZT4NCiAgICAgICAgICAgICAgICA8dXNlIGlkPSJSZWN0YW5nbGUtMi1Db3B5IiBtYXNrPSJ1cmwoI21hc2stMTQpIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9IiNFRkY1RkMiIHhsaW5rOmhyZWY9IiNwYXRoLTEzIj48L3VzZT4NCiAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMC41NDM1NjUxNDgsMTQuNSBMMzMuMTU3NDc0LDE0LjUiIGlkPSJMaW5lIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIj48L3BhdGg+DQogICAgICAgICAgICA8L2c+DQogICAgICAgIDwvZz4NCiAgICA8L2c+DQo8L3N2Zz4=';
const univariantIcon = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4NCjxzdmcgd2lkdGg9IjQwcHgiIGhlaWdodD0iMjZweCIgdmlld0JveD0iMCAwIDQwIDI2IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPg0KICAgIDwhLS0gR2VuZXJhdG9yOiBTa2V0Y2ggNDcuMSAoNDU0MjIpIC0gaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoIC0tPg0KICAgIDx0aXRsZT5JY29uVW5pdmFyaWFudC1Db250aVlDb250aVg8L3RpdGxlPg0KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPg0KICAgIDxkZWZzPjwvZGVmcz4NCiAgICA8ZyBpZD0iTmV3U3RhcnRNb2RlbGluZ0Zsb3ctRnVuY3Rpb25zLUFkdmFuY2VkIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4NCiAgICAgICAgPGcgaWQ9Ikljb25Vbml2YXJpYW50LUNvbnRpWUNvbnRpWCI+DQogICAgICAgICAgICA8ZyBpZD0iaWNvblVuaXZhcmlhdGVQbG90IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyLjAwMDAwMCwgMi4wMDAwMDApIj4NCiAgICAgICAgICAgICAgICA8Zz4NCiAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0iTTEuNSwyMC4yMzUyOTQxIEwzNS41LDIwLjIzNTI5NDEiIGlkPSJ4LWF4aXMiIHN0cm9rZT0iIzQ0OEVFRCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48L3BhdGg+DQogICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0xLjUsMTkuNSBMMS41LDEuNSIgaWQ9InktYXhpcyIgc3Ryb2tlPSIjNDQ4RUVEIiBzdHJva2UtbGluZWNhcD0icm91bmQiPjwvcGF0aD4NCiAgICAgICAgICAgICAgICAgICAgPGcgaWQ9Ikdyb3VwLTgiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDQuMDAwMDAwLCAxLjAwMDAwMCkiIGZpbGw9IiM0NDhFRUQiPg0KICAgICAgICAgICAgICAgICAgICAgICAgPGNpcmNsZSBpZD0iT3ZhbC01IiBjeD0iMSIgY3k9IjE0IiByPSIxIj48L2NpcmNsZT4NCiAgICAgICAgICAgICAgICAgICAgICAgIDxjaXJjbGUgaWQ9Ik92YWwtNS1Db3B5LTYiIGN4PSIxIiBjeT0iMTEiIHI9IjEiPjwvY2lyY2xlPg0KICAgICAgICAgICAgICAgICAgICAgICAgPGNpcmNsZSBpZD0iT3ZhbC01LUNvcHktNyIgY3g9IjEiIGN5PSI4IiByPSIxIj48L2NpcmNsZT4NCiAgICAgICAgICAgICAgICAgICAgICAgIDxjaXJjbGUgaWQ9Ik92YWwtNS1Db3B5IiBjeD0iNS4yIiBjeT0iMTMiIHI9IjEiPjwvY2lyY2xlPg0KICAgICAgICAgICAgICAgICAgICAgICAgPGNpcmNsZSBpZD0iT3ZhbC01LUNvcHktOCIgZmlsbC1vcGFjaXR5PSIwLjgiIGN4PSI1LjIiIGN5PSIxMSIgcj0iMSI+PC9jaXJjbGU+DQogICAgICAgICAgICAgICAgICAgICAgICA8Y2lyY2xlIGlkPSJPdmFsLTUtQ29weS0yIiBjeD0iMTEiIGN5PSI4IiByPSIxIj48L2NpcmNsZT4NCiAgICAgICAgICAgICAgICAgICAgICAgIDxjaXJjbGUgaWQ9Ik92YWwtNS1Db3B5LTkiIGN4PSIxMSIgY3k9IjEwIiByPSIxIj48L2NpcmNsZT4NCiAgICAgICAgICAgICAgICAgICAgICAgIDxjaXJjbGUgaWQ9Ik92YWwtNS1Db3B5LTMiIGN4PSIxNyIgY3k9IjQiIHI9IjEiPjwvY2lyY2xlPg0KICAgICAgICAgICAgICAgICAgICAgICAgPGNpcmNsZSBpZD0iT3ZhbC01LUNvcHktMTMiIGN4PSIxNyIgY3k9IjEiIHI9IjEiPjwvY2lyY2xlPg0KICAgICAgICAgICAgICAgICAgICAgICAgPGNpcmNsZSBpZD0iT3ZhbC01LUNvcHktNCIgY3g9IjI0IiBjeT0iMyIgcj0iMSI+PC9jaXJjbGU+DQogICAgICAgICAgICAgICAgICAgICAgICA8Y2lyY2xlIGlkPSJPdmFsLTUtQ29weS0xMCIgY3g9IjI0IiBjeT0iNyIgcj0iMSI+PC9jaXJjbGU+DQogICAgICAgICAgICAgICAgICAgICAgICA8Y2lyY2xlIGlkPSJPdmFsLTUtQ29weS0xMSIgY3g9IjI0IiBjeT0iMTAiIHI9IjEiPjwvY2lyY2xlPg0KICAgICAgICAgICAgICAgICAgICAgICAgPGNpcmNsZSBpZD0iT3ZhbC01LUNvcHktNSIgY3g9IjMwIiBjeT0iNiIgcj0iMSI+PC9jaXJjbGU+DQogICAgICAgICAgICAgICAgICAgICAgICA8Y2lyY2xlIGlkPSJPdmFsLTUtQ29weS0xMiIgY3g9IjMwIiBjeT0iOSIgcj0iMSI+PC9jaXJjbGU+DQogICAgICAgICAgICAgICAgICAgIDwvZz4NCiAgICAgICAgICAgICAgICA8L2c+DQogICAgICAgICAgICA8L2c+DQogICAgICAgIDwvZz4NCiAgICA8L2c+DQo8L3N2Zz4=';


interface Interface {
  data: any;
  importance: any;
  colType: any;
  value: any;
  project: any;
  isChecked: any;
  handleCheck: any;
  lines: any;
  chartDatas: any;
  mapHeader: any;
}

@observer
class SimplifiedViewRow extends Component<Interface> {
  @observable histograms = false;
  @observable univariant = false;
  @observable chartData = {};
  @observable scatterData = {};

  showHistograms = () => {
    this.histograms = true;
  };
  showUnivariant = () => {
    this.univariant = true;
  };

  hideHistograms = e => {
    e && e.stopPropagation();
    this.histograms = false;
  };

  hideUnivariant = e => {
    e && e.stopPropagation();
    this.univariant = false;
  };

  renderCell = (value, isNA) => {
    if (isNA) return 'N/A';
    if (isNaN(+value)) return value || 'N/A';
    return formatNumber(value, 2);
  };

  render() {
    const {
      data = {},
      importance,
      colType,
      value,
      project,
      isChecked,
      handleCheck,
      lines,
      chartDatas,
      mapHeader,
    } = this.props;
    const valueType =
      colType[value] === 'Numerical' ? 'Numerical' : 'Categorical';
    const isRaw = colType[value] === 'Raw';
    const unique =
      (isRaw && `${lines}+`) ||
      (valueType === 'Numerical' && 'N/A') ||
      data.uniqueValues;

    return (
      <div className={styles.tableRow}>
        <div className={classnames(styles.tableTd, styles.tableCheck)}>
          <input type="checkbox" checked={isChecked} onChange={handleCheck} />
        </div>
        <div className={styles.tableTd} title={mapHeader[value]}>
          <span>{mapHeader[value]}</span>
        </div>
        <div
          className={classnames(styles.tableTd, {
            [styles.notAllow]: isRaw,
          })}
          onClick={this.showHistograms}
        >
          <img src={histogramIcon} className={styles.tableImage}  alt=''/>
          {!isRaw && this.histograms ? (
            <Popover
              placement="topLeft"
              visible={!isRaw && this.histograms}
              onVisibleChange={this.hideHistograms}
              trigger="click"
              title={
                <Icon
                  style={{
                    float: 'right',
                    height: 23,
                    alignItems: 'center',
                    display: 'flex',
                  }}
                  onClick={this.hideHistograms}
                  type="close"
                />
              }
              content={
                <Chart
                  x_name={mapHeader[value]}
                  y_name={'count'}
                  title={`Feature:${value}`}
                  data={chartDatas[0]}
                  project={project}
                />
              }
            />
          ) : null}
        </div>
        <div
          className={classnames(styles.tableTd, {
            [styles.notAllow]: isRaw,
          })}
          onClick={this.showUnivariant}
        >
          <img src={univariantIcon} className={styles.tableImage} alt="" />
          {!isRaw && this.univariant ? (
            <Popover
              placement="topLeft"
              visible={!isRaw && this.univariant}
              onVisibleChange={this.hideUnivariant}
              trigger="click"
              title={
                <Icon
                  style={{
                    float: 'right',
                    height: 23,
                    alignItems: 'center',
                    display: 'flex',
                  }}
                  onClick={this.hideUnivariant}
                  type="close"
                />
              }
              content={<Chart data={chartDatas[1]} project={project} />}
            />
          ) : null}
        </div>
        <div className={classnames(styles.tableTd, styles.tableImportance)}>
          <div className={styles.preImpotance}>
            <div
              className={styles.preImpotanceActive}
              style={{ width: importance * 100 + '%' }}
            />
          </div>
        </div>
        <div
          className={styles.tableTd}
          title={valueType === 'Numerical' ? EN.Numerical : EN.Categorical}
        >
          <span>
            {valueType === 'Numerical' ? EN.Numerical : EN.Categorical}
          </span>
        </div>
        <div
          className={classnames(styles.tableTd, {
            [styles.none]: valueType !== 'Categorical',
          })}
          title={unique}
        >
          <span>{unique}</span>
        </div>
        <div
          className={classnames(styles.tableTd, {
            [styles.none]: valueType === 'Categorical',
          })}
          title={this.renderCell(data.mean, valueType === 'Categorical')}
        >
          <span>{this.renderCell(data.mean, valueType === 'Categorical')}</span>
        </div>
        <div
          className={classnames(styles.tableTd, {
            [styles.none]: valueType === 'Categorical',
          })}
          title={this.renderCell(data.std, valueType === 'Categorical')}
        >
          <span>{this.renderCell(data.std, valueType === 'Categorical')}</span>
        </div>
        <div
          className={classnames(styles.tableTd, {
            [styles.none]: valueType === 'Categorical',
          })}
          title={this.renderCell(data.median, valueType === 'Categorical')}
        >
          <span>
            {this.renderCell(data.median, valueType === 'Categorical')}
          </span>
        </div>
        <div
          className={classnames(styles.tableTd, {
            [styles.none]: valueType === 'Categorical',
          })}
          title={this.renderCell(data.min, valueType === 'Categorical')}
        >
          <span>{this.renderCell(data.min, valueType === 'Categorical')}</span>
        </div>
        <div
          className={classnames(styles.tableTd, {
            [styles.none]: valueType === 'Categorical',
          })}
          title={this.renderCell(data.max, valueType === 'Categorical')}
        >
          <span>{this.renderCell(data.max, valueType === 'Categorical')}</span>
        </div>
      </div>
    );
  }
}
export default SimplifiedViewRow;
