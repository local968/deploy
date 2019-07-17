import React, {Component} from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import {observer} from 'mobx-react';
import {Hint, ProcessLoading} from 'components/Common';
import {observable, toJS} from 'mobx';
import {Popover, message as antdMessage, Icon, Table, Modal} from 'antd';
import FUNCTIONS from './functions';
import {formatNumber} from 'util'
import EN from '../../../constant/en';
import CorrelationMatrixs from "../../Charts/CorrelationMatrixs";
import HistogramNumerical from "../../Charts/HistogramNumerical";
import HistogramCategorical from "../../Charts/HistogramCategorical";
import TSENOne from "../../Charts/TSENOne";
import BoxPlots from "../../Charts/BoxPlots";
import UnivariantPlots from "../../Charts/UnivariantPlots";
import CreateNewVariables from '../../CreateNewVariable'
import Chart from "../../Charts/Chart";

const histogramIcon  = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+DQo8c3ZnIHdpZHRoPSIzNHB4IiBoZWlnaHQ9IjIwcHgiIHZpZXdCb3g9IjAgMCAzNCAyMCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj4NCiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDM5LjEgKDMxNzIwKSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT4NCiAgICA8dGl0bGU+aWNvblZhcmlhYmxlSW1wb3J0YW5jZUJsdWU8L3RpdGxlPg0KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPg0KICAgIDxkZWZzPg0KICAgICAgICA8cmVjdCBpZD0icGF0aC0xIiB4PSIxLjA4NzEzMDMiIHk9IjIiIHdpZHRoPSIzLjI2MTM5MDg5IiBoZWlnaHQ9IjEzIj48L3JlY3Q+DQogICAgICAgIDxtYXNrIGlkPSJtYXNrLTIiIG1hc2tDb250ZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiBtYXNrVW5pdHM9Im9iamVjdEJvdW5kaW5nQm94IiB4PSIwIiB5PSIwIiB3aWR0aD0iMy4yNjEzOTA4OSIgaGVpZ2h0PSIxMyIgZmlsbD0id2hpdGUiPg0KICAgICAgICAgICAgPHVzZSB4bGluazpocmVmPSIjcGF0aC0xIj48L3VzZT4NCiAgICAgICAgPC9tYXNrPg0KICAgICAgICA8cmVjdCBpZD0icGF0aC0zIiB4PSI1LjQzNTY1MTQ4IiB5PSIwIiB3aWR0aD0iMy4yNjEzOTA4OSIgaGVpZ2h0PSIxNSI+PC9yZWN0Pg0KICAgICAgICA8bWFzayBpZD0ibWFzay00IiBtYXNrQ29udGVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgbWFza1VuaXRzPSJvYmplY3RCb3VuZGluZ0JveCIgeD0iMCIgeT0iMCIgd2lkdGg9IjMuMjYxMzkwODkiIGhlaWdodD0iMTUiIGZpbGw9IndoaXRlIj4NCiAgICAgICAgICAgIDx1c2UgeGxpbms6aHJlZj0iI3BhdGgtMyI+PC91c2U+DQogICAgICAgIDwvbWFzaz4NCiAgICAgICAgPHJlY3QgaWQ9InBhdGgtNSIgeD0iMTQuMTMyNjkzOCIgeT0iNSIgd2lkdGg9IjMuMjYxMzkwODkiIGhlaWdodD0iMTAiPjwvcmVjdD4NCiAgICAgICAgPG1hc2sgaWQ9Im1hc2stNiIgbWFza0NvbnRlbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIG1hc2tVbml0cz0ib2JqZWN0Qm91bmRpbmdCb3giIHg9IjAiIHk9IjAiIHdpZHRoPSIzLjI2MTM5MDg5IiBoZWlnaHQ9IjEwIiBmaWxsPSJ3aGl0ZSI+DQogICAgICAgICAgICA8dXNlIHhsaW5rOmhyZWY9IiNwYXRoLTUiPjwvdXNlPg0KICAgICAgICA8L21hc2s+DQogICAgICAgIDxyZWN0IGlkPSJwYXRoLTciIHg9IjE4LjQ4MTIxNSIgeT0iOCIgd2lkdGg9IjMuMjYxMzkwODkiIGhlaWdodD0iNyI+PC9yZWN0Pg0KICAgICAgICA8bWFzayBpZD0ibWFzay04IiBtYXNrQ29udGVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgbWFza1VuaXRzPSJvYmplY3RCb3VuZGluZ0JveCIgeD0iMCIgeT0iMCIgd2lkdGg9IjMuMjYxMzkwODkiIGhlaWdodD0iNyIgZmlsbD0id2hpdGUiPg0KICAgICAgICAgICAgPHVzZSB4bGluazpocmVmPSIjcGF0aC03Ij48L3VzZT4NCiAgICAgICAgPC9tYXNrPg0KICAgICAgICA8cmVjdCBpZD0icGF0aC05IiB4PSIyMi44Mjk3MzYyIiB5PSI4IiB3aWR0aD0iMy4yNjEzOTA4OSIgaGVpZ2h0PSI3Ij48L3JlY3Q+DQogICAgICAgIDxtYXNrIGlkPSJtYXNrLTEwIiBtYXNrQ29udGVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgbWFza1VuaXRzPSJvYmplY3RCb3VuZGluZ0JveCIgeD0iMCIgeT0iMCIgd2lkdGg9IjMuMjYxMzkwODkiIGhlaWdodD0iNyIgZmlsbD0id2hpdGUiPg0KICAgICAgICAgICAgPHVzZSB4bGluazpocmVmPSIjcGF0aC05Ij48L3VzZT4NCiAgICAgICAgPC9tYXNrPg0KICAgICAgICA8cmVjdCBpZD0icGF0aC0xMSIgeD0iMjcuMTc4MjU3NCIgeT0iMTEiIHdpZHRoPSIzLjI2MTM5MDg5IiBoZWlnaHQ9IjQiPjwvcmVjdD4NCiAgICAgICAgPG1hc2sgaWQ9Im1hc2stMTIiIG1hc2tDb250ZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiBtYXNrVW5pdHM9Im9iamVjdEJvdW5kaW5nQm94IiB4PSIwIiB5PSIwIiB3aWR0aD0iMy4yNjEzOTA4OSIgaGVpZ2h0PSI0IiBmaWxsPSJ3aGl0ZSI+DQogICAgICAgICAgICA8dXNlIHhsaW5rOmhyZWY9IiNwYXRoLTExIj48L3VzZT4NCiAgICAgICAgPC9tYXNrPg0KICAgICAgICA8cmVjdCBpZD0icGF0aC0xMyIgeD0iOS43ODQxNzI2NiIgeT0iNSIgd2lkdGg9IjMuMjYxMzkwODkiIGhlaWdodD0iMTAiPjwvcmVjdD4NCiAgICAgICAgPG1hc2sgaWQ9Im1hc2stMTQiIG1hc2tDb250ZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiBtYXNrVW5pdHM9Im9iamVjdEJvdW5kaW5nQm94IiB4PSIwIiB5PSIwIiB3aWR0aD0iMy4yNjEzOTA4OSIgaGVpZ2h0PSIxMCIgZmlsbD0id2hpdGUiPg0KICAgICAgICAgICAgPHVzZSB4bGluazpocmVmPSIjcGF0aC0xMyI+PC91c2U+DQogICAgICAgIDwvbWFzaz4NCiAgICA8L2RlZnM+DQogICAgPGcgaWQ9IjUuTW9kZWxpbmciIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPg0KICAgICAgICA8ZyBpZD0iaWNvblZhcmlhYmxlSW1wb3J0YW5jZUJsdWUiIHN0cm9rZT0iIzQ0OEVFRCI+DQogICAgICAgICAgICA8ZyBpZD0iaWNvblZhcmlhYmxlQmx1ZSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMC4wMDAwMDAsIDMuMDAwMDAwKSI+DQogICAgICAgICAgICAgICAgPHVzZSBpZD0iUmVjdGFuZ2xlIiBtYXNrPSJ1cmwoI21hc2stMikiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0iI0VGRjVGQyIgeGxpbms6aHJlZj0iI3BhdGgtMSI+PC91c2U+DQogICAgICAgICAgICAgICAgPHVzZSBpZD0iUmVjdGFuZ2xlLTIiIG1hc2s9InVybCgjbWFzay00KSIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSIjRUZGNUZDIiB4bGluazpocmVmPSIjcGF0aC0zIj48L3VzZT4NCiAgICAgICAgICAgICAgICA8dXNlIGlkPSJSZWN0YW5nbGUtMi1Db3B5LTIiIG1hc2s9InVybCgjbWFzay02KSIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSIjRUZGNUZDIiB4bGluazpocmVmPSIjcGF0aC01Ij48L3VzZT4NCiAgICAgICAgICAgICAgICA8dXNlIGlkPSJSZWN0YW5nbGUtMi1Db3B5LTMiIG1hc2s9InVybCgjbWFzay04KSIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSIjRUZGNUZDIiB4bGluazpocmVmPSIjcGF0aC03Ij48L3VzZT4NCiAgICAgICAgICAgICAgICA8dXNlIGlkPSJSZWN0YW5nbGUtMi1Db3B5LTQiIG1hc2s9InVybCgjbWFzay0xMCkiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0iI0VGRjVGQyIgeGxpbms6aHJlZj0iI3BhdGgtOSI+PC91c2U+DQogICAgICAgICAgICAgICAgPHVzZSBpZD0iUmVjdGFuZ2xlLTItQ29weS01IiBtYXNrPSJ1cmwoI21hc2stMTIpIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9IiNFRkY1RkMiIHhsaW5rOmhyZWY9IiNwYXRoLTExIj48L3VzZT4NCiAgICAgICAgICAgICAgICA8dXNlIGlkPSJSZWN0YW5nbGUtMi1Db3B5IiBtYXNrPSJ1cmwoI21hc2stMTQpIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9IiNFRkY1RkMiIHhsaW5rOmhyZWY9IiNwYXRoLTEzIj48L3VzZT4NCiAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMC41NDM1NjUxNDgsMTQuNSBMMzMuMTU3NDc0LDE0LjUiIGlkPSJMaW5lIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIj48L3BhdGg+DQogICAgICAgICAgICA8L2c+DQogICAgICAgIDwvZz4NCiAgICA8L2c+DQo8L3N2Zz4='
const univariantIcon = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4NCjxzdmcgd2lkdGg9IjQwcHgiIGhlaWdodD0iMjZweCIgdmlld0JveD0iMCAwIDQwIDI2IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPg0KICAgIDwhLS0gR2VuZXJhdG9yOiBTa2V0Y2ggNDcuMSAoNDU0MjIpIC0gaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoIC0tPg0KICAgIDx0aXRsZT5JY29uVW5pdmFyaWFudC1Db250aVlDb250aVg8L3RpdGxlPg0KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPg0KICAgIDxkZWZzPjwvZGVmcz4NCiAgICA8ZyBpZD0iTmV3U3RhcnRNb2RlbGluZ0Zsb3ctRnVuY3Rpb25zLUFkdmFuY2VkIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4NCiAgICAgICAgPGcgaWQ9Ikljb25Vbml2YXJpYW50LUNvbnRpWUNvbnRpWCI+DQogICAgICAgICAgICA8ZyBpZD0iaWNvblVuaXZhcmlhdGVQbG90IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyLjAwMDAwMCwgMi4wMDAwMDApIj4NCiAgICAgICAgICAgICAgICA8Zz4NCiAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0iTTEuNSwyMC4yMzUyOTQxIEwzNS41LDIwLjIzNTI5NDEiIGlkPSJ4LWF4aXMiIHN0cm9rZT0iIzQ0OEVFRCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48L3BhdGg+DQogICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0xLjUsMTkuNSBMMS41LDEuNSIgaWQ9InktYXhpcyIgc3Ryb2tlPSIjNDQ4RUVEIiBzdHJva2UtbGluZWNhcD0icm91bmQiPjwvcGF0aD4NCiAgICAgICAgICAgICAgICAgICAgPGcgaWQ9Ikdyb3VwLTgiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDQuMDAwMDAwLCAxLjAwMDAwMCkiIGZpbGw9IiM0NDhFRUQiPg0KICAgICAgICAgICAgICAgICAgICAgICAgPGNpcmNsZSBpZD0iT3ZhbC01IiBjeD0iMSIgY3k9IjE0IiByPSIxIj48L2NpcmNsZT4NCiAgICAgICAgICAgICAgICAgICAgICAgIDxjaXJjbGUgaWQ9Ik92YWwtNS1Db3B5LTYiIGN4PSIxIiBjeT0iMTEiIHI9IjEiPjwvY2lyY2xlPg0KICAgICAgICAgICAgICAgICAgICAgICAgPGNpcmNsZSBpZD0iT3ZhbC01LUNvcHktNyIgY3g9IjEiIGN5PSI4IiByPSIxIj48L2NpcmNsZT4NCiAgICAgICAgICAgICAgICAgICAgICAgIDxjaXJjbGUgaWQ9Ik92YWwtNS1Db3B5IiBjeD0iNS4yIiBjeT0iMTMiIHI9IjEiPjwvY2lyY2xlPg0KICAgICAgICAgICAgICAgICAgICAgICAgPGNpcmNsZSBpZD0iT3ZhbC01LUNvcHktOCIgZmlsbC1vcGFjaXR5PSIwLjgiIGN4PSI1LjIiIGN5PSIxMSIgcj0iMSI+PC9jaXJjbGU+DQogICAgICAgICAgICAgICAgICAgICAgICA8Y2lyY2xlIGlkPSJPdmFsLTUtQ29weS0yIiBjeD0iMTEiIGN5PSI4IiByPSIxIj48L2NpcmNsZT4NCiAgICAgICAgICAgICAgICAgICAgICAgIDxjaXJjbGUgaWQ9Ik92YWwtNS1Db3B5LTkiIGN4PSIxMSIgY3k9IjEwIiByPSIxIj48L2NpcmNsZT4NCiAgICAgICAgICAgICAgICAgICAgICAgIDxjaXJjbGUgaWQ9Ik92YWwtNS1Db3B5LTMiIGN4PSIxNyIgY3k9IjQiIHI9IjEiPjwvY2lyY2xlPg0KICAgICAgICAgICAgICAgICAgICAgICAgPGNpcmNsZSBpZD0iT3ZhbC01LUNvcHktMTMiIGN4PSIxNyIgY3k9IjEiIHI9IjEiPjwvY2lyY2xlPg0KICAgICAgICAgICAgICAgICAgICAgICAgPGNpcmNsZSBpZD0iT3ZhbC01LUNvcHktNCIgY3g9IjI0IiBjeT0iMyIgcj0iMSI+PC9jaXJjbGU+DQogICAgICAgICAgICAgICAgICAgICAgICA8Y2lyY2xlIGlkPSJPdmFsLTUtQ29weS0xMCIgY3g9IjI0IiBjeT0iNyIgcj0iMSI+PC9jaXJjbGU+DQogICAgICAgICAgICAgICAgICAgICAgICA8Y2lyY2xlIGlkPSJPdmFsLTUtQ29weS0xMSIgY3g9IjI0IiBjeT0iMTAiIHI9IjEiPjwvY2lyY2xlPg0KICAgICAgICAgICAgICAgICAgICAgICAgPGNpcmNsZSBpZD0iT3ZhbC01LUNvcHktNSIgY3g9IjMwIiBjeT0iNiIgcj0iMSI+PC9jaXJjbGU+DQogICAgICAgICAgICAgICAgICAgICAgICA8Y2lyY2xlIGlkPSJPdmFsLTUtQ29weS0xMiIgY3g9IjMwIiBjeT0iOSIgcj0iMSI+PC9jaXJjbGU+DQogICAgICAgICAgICAgICAgICAgIDwvZz4NCiAgICAgICAgICAgICAgICA8L2c+DQogICAgICAgICAgICA8L2c+DQogICAgICAgIDwvZz4NCiAgICA8L2c+DQo8L3N2Zz4='
@observer
export default class SimplifiedView extends Component {
  @observable sort = -1
  @observable showHistograms = false
  @observable showCorrelation = false
  @observable visible = false
  @observable chartData = {};
  @observable CorrelationMatrixData = {};

  componentDidMount() {
    this.props.project.dataView().then(() => {
      this.props.project.preTrainImportance()
    })
  }

  show = () => {
    this.showHistograms = true;
  };

  showback = (target, result) => {
    this.chartData = {
      ...this.chartData,
      [target]: result,
    };
    this.showHistograms = true;
  }

  hide = e => {
    e && e.stopPropagation();
    this.showHistograms = false
  }

  sortImportance = () => {
    this.sort = this.sort * -1
  }

  // showCorrelationMatrix = () => {
  //   this.showCorrelation = true
  // }

  showCorrelationMatrix = () => {
      this.showCorrelation = true;
  };

  hideCorrelationMatrix = e => {
    e && e.stopPropagation();
    this.showCorrelation = false
  }

  handleCheck = (key, e) => {
    const {trainHeader} = this.props.project
    const isChecked = e.target.checked
    if (isChecked) {
      this.props.project.trainHeader = trainHeader.filter(v => v !== key)
    } else {
      if (trainHeader.includes(key)) return
      this.props.project.trainHeader = [...trainHeader, key]
    }
  }

  showNewVariable = () => {
    this.visible = true
  }

  hideNewVariable = () => {
    this.visible = false
  }

  reloadTable = () => {
    this.props.project.dataView().then(() => {
      this.props.project.preTrainImportance()
    })
  }

  handleChange = e => {
    const value = e.target.value
    const {project} = this.props
    const {informativesLabel, dataHeader, customHeader, newVariable, target} = project
    let filterList = []
    if (!value) return
    if (value === 'all') {
      filterList = [...dataHeader, ...newVariable]
    }
    if (value === 'informatives') {
      filterList = informativesLabel
    }
    if (!isNaN(value) && value < customHeader.length) {
      filterList = customHeader[value]
    }
    project.trainHeader = [...dataHeader, ...newVariable].filter(v => !filterList.includes(v) && v !== target)
  }

  renderCell = (value, isNA) => {
    if (isNA) return 'N/A'
    if (isNaN(+(value))) return value || 'N/A'
    return formatNumber(value, 2)
  };
  
  matrix(data){
    const {project} = this.props;
    // const colType = toJS(project.colType);
    const trainHeader = toJS(project.trainHeader);
    
    trainHeader.map(itm=>{
       const ind = data.data.type.indexOf(itm);
       data.data.type.splice(ind,1);
       data.data.value.splice(ind,1);
       data.data.value = data.data.value.map(it=>{
         it.splice(ind,1);
         return it
       })
    });

    return <Chart
      data = {data}
      project={project}
    />
  }

  render() {
    const {project} = this.props;
    const {target, colType, targetMap, dataViews, dataViewsLoading, preImportance, preImportanceLoading,
      histgramPlots, dataHeader, addNewVariable, addNewVariable2, newVariable, newType, newVariableViews,
      id, informativesLabel, trainHeader, expression, customHeader, totalLines, dataViewProgress, importanceProgress,
	    models,mapHeader = [],
    } = project;
    const {graphicList:lists} = models[0];
    const graphicList = JSON.parse(JSON.stringify(lists));
    const targetUnique = colType[target] === 'Categorical' ? 2 : 'N/A'
    const targetData = (colType[target] !== 'Categorical' && dataViews) ? (dataViews[target] || {}) : {}
    const allVariables = [...dataHeader.filter(h => h !== target), ...newVariable]
    const variableType = {...newType, ...colType}
    const checkedVariables = allVariables.filter(v => !trainHeader.includes(v))
    const key = [allVariables, informativesLabel, ...customHeader].map(v => v.sort().toString()).indexOf(checkedVariables.sort().toString())
    const hasNewOne = key === -1
    const selectValue = hasNewOne ? customHeader.length : (key === 0 ? 'all' : (key === 1 ? 'informatives' : key - 2));
    const top1 = graphicList.shift();
    const top2 = graphicList.shift();

    const newMapHeader = {
      ...mapHeader.reduce((prev, v, k) => Object.assign(prev, { [k]: v }), {}),
      ...newVariable.reduce((prev, v) => Object.assign(prev, { [v]: v }), {}),
    };
    return <div className={styles.simplified} style={{zIndex: this.visible ? 3 : 1}}>
      <div className={styles.targetTable}>
        <div className={styles.targetHead}>
          <div className={classnames(styles.targetCell, styles.targetName)}><span>{EN.TargetVariable}</span></div>
          <div className={styles.targetCell}><span>{EN.Histogram}</span></div>
          <div className={styles.targetCell}><span>{EN.DataType}</span></div>
          <div className={styles.targetCell}><span>{EN.Mean}</span></div>
          <div className={styles.targetCell}><span>{EN.UniqueValue}</span></div>
          <div className={styles.targetCell}><span>{EN.Min}</span></div>
          <div className={styles.targetCell}><span>{EN.Max}</span></div>
        </div>
        <div className={styles.targetRow}>
          <div className={classnames(styles.targetCell, styles.targetName)} title={newMapHeader[target]}><span>{newMapHeader[target]}</span></div>
          <div className={styles.targetCell} onClick={this.show}>
          <img src={histogramIcon} className={styles.tableImage} />
            {<Popover placement='bottomLeft'
                      visible={this.showHistograms}
                      onVisibleChange={this.hide}
                      trigger="click"
                      title={
                        <Icon
                          style={{
                            float: 'right',
                            height: 23,
                            alignItems: 'center',
                            display: 'flex',
                          }}
                          onClick={this.hide}
                          type="close"
                        />
                      }
                      content={<Chart
                          x_name={newMapHeader[target]}
                          y_name={'count'}
                          title={`Feature:${target}`}
                          data={top1}
                          project={project}
                      />}/>}
          </div>
          <div className={styles.targetCell}>
            <span>{colType[target] === 'Numerical' ? EN.Numerical : EN.Categorical}</span></div>
          <div className={classnames(styles.targetCell, {
            [styles.none]: colType[target] === 'Categorical'
          })} title={this.renderCell(targetData.mean, colType[target] === 'Categorical')}>
            <span>{this.renderCell(targetData.mean, colType[target] === 'Categorical')}</span>
          </div>
          <div className={classnames(styles.targetCell, {
            [styles.none]: colType[target] !== 'Categorical'
          })}><span>{targetUnique}</span></div>
          <div className={classnames(styles.targetCell, {
            [styles.none]: colType[target] === 'Categorical'
          })} title={this.renderCell(targetData.min, colType[target] === 'Categorical')}>
            <span>{this.renderCell(targetData.min, colType[target] === 'Categorical')}</span>
          </div>
          <div className={classnames(styles.targetCell, {
            [styles.none]: colType[target] === 'Categorical'
          })} title={this.renderCell(targetData.max, colType[target] === 'Categorical')}>
            <span>{this.renderCell(targetData.max, colType[target] === 'Categorical')}</span>
          </div>
        </div>
      </div>
      <div className={styles.simplifiedText}><span>{EN.CreateVariableListTip}</span></div>
      <div className={styles.tool}>
        <div className={styles.toolSelect}>
          <div className={styles.toolLabel}><span>{EN.CurrentVariableList}</span></div>
          <select value={selectValue} onChange={this.handleChange}>
            <option value='all'>{EN.AllVariables} ({allVariables.length})</option>
            <option value='informatives'>{EN.Informatives} ({informativesLabel.length})</option>
            {customHeader.map((v, k) => <option key={k} value={k}>{EN.Custom}{k + 1} ({v.length})</option>)}
            {hasNewOne &&
            <option value={customHeader.length}>custom_{customHeader.length + 1} ({checkedVariables.length})</option>}
          </select>
        </div>
        <div className={styles.newVariable}>
          <Modal visible={this.visible} footer={null} closable={false} width={'65%'}>
            <CreateNewVariables onClose={this.hideNewVariable} addNewVariable={addNewVariable2} colType={colType} expression={expression}/>
          </Modal>
        </div>
        <div className={classnames(styles.toolButton, styles.toolCheck)} onClick={this.showCorrelationMatrix}>
          {this.showCorrelation && <Popover placement='left'
                                            visible={this.showCorrelation}
                                            onVisibleChange={this.hideCorrelationMatrix}
                                            trigger="click"
                                            title={
                                              <Icon
                                                style={{
                                                  float: 'right',
                                                  height: 23,
                                                  alignItems: 'center',
                                                  display: 'flex',
                                                }}
                                                onClick={this.hideCorrelationMatrix}
                                                type="close"
                                              />
                                            }
                                            content={this.matrix(top2)}/>}
          <span>{EN.CheckCorrelationMatrix}</span>
        </div>
      </div>
      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <div className={classnames(styles.tableTh, styles.tableCheck)}/>
          <div className={styles.tableTh}><span>{EN.Name}</span></div>
          <div className={styles.tableTh}><span>{EN.Histogram}</span></div>
          <div className={styles.tableTh}><span>{EN.UnivariantPlot}</span></div>
          <div className={classnames(styles.tableTh, styles.tableImportance)}>
            <div className={styles.tableSort} onClick={this.sortImportance}><span><Icon
              type={`arrow-${this.sort === 1 ? 'up' : 'down'}`} theme="outlined"/></span></div>
            <span>{EN.Importance}</span>
            <div className={styles.tableReload} onClick={this.reloadTable}><span><Icon type="reload" theme="outlined"/></span>
            </div>
            <Hint themeStyle={{fontSize: '1rem'}} content={EN.AdvancedModelingImportanceTip}/>
          </div>
          <div className={styles.tableTh}><span>{EN.DataType}</span></div>
          <div className={styles.tableTh}><span>{EN.UniqueValue}</span></div>
          <div className={styles.tableTh}><span>{EN.Mean}</span></div>
          <div className={styles.tableTh}><span>{EN.STD}</span></div>
          <div className={styles.tableTh}><span>{EN.Median}</span></div>
          <div className={styles.tableTh}><span>{EN.Min}</span></div>
          <div className={styles.tableTh}><span>{EN.Max}</span></div>
        </div>
        {(dataViewsLoading || preImportanceLoading) ?
          <div className={styles.tableLoading}>
            <Icon type="loading"/>
          </div> :
          <div className={styles.tableBody}>
            {allVariables.sort((a, b) => {
              return preImportance ? this.sort * ((preImportance[a] || 0) - (preImportance[b] || 0)) : 0
            }).map((h, i) => {
              if (h === target) return null;
              const data = {...dataViews, ...newVariableViews}[h] || {}
              const map = targetMap || {};
              const importance = preImportance ? (preImportance[h] || 0) : 0.01;
              return <SimplifiedViewRow
                  mapHeader={newMapHeader}
                  chartDatas = {[graphicList.shift(),graphicList.shift()]}
                  key={i} value={h} data={data} map={map} importance={importance}
                                        colType={variableType} project={project}
                                        isChecked={checkedVariables.includes(h)}
                                        handleCheck={this.handleCheck.bind(null, h)}
                                        lines={Math.min(Math.floor(totalLines * 0.95), 1000)} id={id}/>
            })}
          </div>}
      </div>
      {(dataViewsLoading || preImportanceLoading) &&
      <ProcessLoading progress={dataViewsLoading ? (dataViewProgress / 2) : (importanceProgress / 2 + 50)}
                      style={{bottom: '0.25em'}}/>}
    </div>
  }
}

@observer
class SimplifiedViewRow extends Component {
  @observable histograms = false
  @observable univariant = false;
  @observable chartData = {};
  @observable scatterData = {};

  showHistograms = () => {
      this.histograms = true;
  };
  showback = (result, value) => {
    this.chartData = {
      ...this.chartData,
      [value]: result,
    };
    this.histograms = true;
  }

  showUnivariant = () => {
    this.univariant = true
  }
  // showUnivariant = () => {
  //   const {value, project} = this.props;
  //   // const { name, categoricalMap } = project.dataViews[value];
  //
  //   if (!this.scatterData[value]) {
  //     const {target, problemType, etlIndex, colType} = project;
  //     const type = colType[value];
  //
  //     // const data = {
  //     //   field: value,
  //     //   id: etlIndex,
  //     // };
  //
  //     if (problemType === "Regression") {
  //       if (type === 'Numerical') {//散点图
  //         request.post({
  //           url: '/graphics/regression-numerical',
  //           data: {
  //             y: target,
  //             x: value,
  //             id: etlIndex,
  //           }
  //         }).then((result) => this.showbackUnivariant(result, value, target, 'Numerical'));
  //       } else {//回归-分类 箱线图
  //         request.post({
  //           url: '/graphics/regression-categorical',
  //           data: {
  //             target,
  //             value,
  //             id: etlIndex,
  //           }
  //         }).then((result) => this.showbackUnivariant(result, value, target, 'Categorical'));
  //       }
  //     } else {//Univariant
  //       const {min, max} = project.dataViews[value];
  //       const data = {
  //         target,
  //         value,
  //         id: etlIndex,
  //         interval: Math.floor((max - min) / 20) || 1,
  //       };
  //       if (type === 'Numerical') {
  //         request.post({
  //           url: '/graphics/classification-numerical',
  //           data,
  //         }).then((result) => {
  //           this.scatterData = {
  //             ...this.scatterData,
  //             [value]: {
  //               ...result,
  //             },
  //             [`${value}-msg`]: {
  //               type,
  //             }
  //           };
  //           this.univariant = true;
  //
  //         });
  //       } else {//?
  //         request.post({
  //           url: '/graphics/classification-categorical',
  //           data,
  //         }).then((result) => {
  //           this.scatterData = {
  //             ...this.scatterData,
  //             [value]: {
  //               ...result,
  //             },
  //             [`${value}-msg`]: {
  //               type,
  //             }
  //           };
  //           this.univariant = true;
  //         });
  //       }
  //     }
  //     return
  //   }
  //   this.univariant = true;
  // };

  // showUnivariantData(result,type){
  //   const {value} = this.props;
  //   this.scatterData = {
  //      ...this.scatterData,
  //      [value]: {
  //        ...result,
  //      },
  //      [`${value}-msg`]: {
  //        type,
  //      }
  //    };
  //    this.univariant = true;
  //   };

  showbackUnivariant = (result, x, y, type) => {
    const {value} = this.props;
    this.scatterData = {
      ...this.scatterData,
      [value]: {
        ...result,
      },
      [`${value}-msg`]: {
        x,
        y,
        type,
      }
    };
    this.univariant = true;
  };

  hideHistograms = e => {
    e && e.stopPropagation();
    this.histograms = false
  }

  hideUnivariant = e => {
    e && e.stopPropagation();
    this.univariant = false
  }

  renderCell = (value, isNA) => {
    if (isNA) return 'N/A'
    if (isNaN(+(value))) return value || 'N/A'
    return formatNumber(value, 2)
  }

  render() {
    const {data = {}, importance, colType, value, project, isChecked, handleCheck, id, lines,chartDatas,mapHeader} = this.props;
    const valueType = colType[value] === 'Numerical' ? 'Numerical' : 'Categorical'
    const isRaw = colType[value] === 'Raw'
    const unique = (isRaw && `${lines}+`) || (valueType === 'Numerical' && 'N/A') || data.uniqueValues;

    return <div className={styles.tableRow}>
      <div className={classnames(styles.tableTd, styles.tableCheck)}><input type='checkbox' checked={isChecked}
                                                                            onChange={handleCheck}/></div>
      {/*<div className={styles.tableTd} title={value}><span>{value}</span></div>*/}
      <div className={styles.tableTd} title={mapHeader[value]}>
        <span>{mapHeader[value]}</span>
      </div>
      <div className={classnames(styles.tableTd, {
        [styles.notAllow]: isRaw
      })} onClick={this.showHistograms}>
        <img src={histogramIcon} className={styles.tableImage} />
        {(!isRaw && this.histograms) ? <Popover placement='topLeft'
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
                                                content={<Chart
                                                    x_name={mapHeader[value]}
                                                    y_name={'count'}
                                                    title={`Feature:${value}`}
                                                    data={chartDatas[0]}
                                                    project={project}
                                                />}/> : null}
      </div>
      <div className={classnames(styles.tableTd, {
        [styles.notAllow]: isRaw
      })} onClick={this.showUnivariant}>
        <img src={univariantIcon} className={styles.tableImage}  alt=''/>
        {(!isRaw && this.univariant) ? <Popover placement='topLeft'
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
                                                content={<Chart
                                                    data={chartDatas[1]}
                                                    project={project}
                                                />}/> : null}
      </div>
      <div className={classnames(styles.tableTd, styles.tableImportance)}>
        <div className={styles.preImpotance}>
          <div className={styles.preImpotanceActive} style={{width: (importance * 100) + '%'}}/>
        </div>
      </div>
      <div className={styles.tableTd} title={valueType === 'Numerical' ? EN.Numerical : EN.Categorical}>
        <span>{valueType === 'Numerical' ? EN.Numerical : EN.Categorical}</span></div>
      <div className={classnames(styles.tableTd, {
        [styles.none]: valueType !== 'Categorical'
      })} title={unique}><span>{unique}</span></div>
      <div className={classnames(styles.tableTd, {
        [styles.none]: valueType === 'Categorical'
      })} title={this.renderCell(data.mean, valueType === 'Categorical')}>
        <span>{this.renderCell(data.mean, valueType === 'Categorical')}</span>
      </div>
      <div className={classnames(styles.tableTd, {
        [styles.none]: valueType === 'Categorical'
      })} title={this.renderCell(data.std, valueType === 'Categorical')}>
        <span>{this.renderCell(data.std, valueType === 'Categorical')}</span>
      </div>
      <div className={classnames(styles.tableTd, {
        [styles.none]: valueType === 'Categorical'
      })} title={this.renderCell(data.median, valueType === 'Categorical')}>
        <span>{this.renderCell(data.median, valueType === 'Categorical')}</span>
      </div>
      <div className={classnames(styles.tableTd, {
        [styles.none]: valueType === 'Categorical'
      })} title={this.renderCell(data.min, valueType === 'Categorical')}>
        <span>{this.renderCell(data.min, valueType === 'Categorical')}</span>
      </div>
      <div className={classnames(styles.tableTd, {
        [styles.none]: valueType === 'Categorical'
      })} title={this.renderCell(data.max, valueType === 'Categorical')}>
        <span>{this.renderCell(data.max, valueType === 'Categorical')}</span>
      </div>
    </div>
  }
}

@observer
class CorrelationPlot extends Component {
  render() {
    const {onClose, CorrelationMatrixData} = this.props;
    const {type, value} = CorrelationMatrixData;
    return (
      <div className={styles.correlationPlot}>
        <div
          onClick={onClose}
          style={{zIndex: 5}}
          className={styles.plotClose}><span>
           <Icon
             style={{
               float: 'right',
               height: 23,
               alignItems: 'center',
               display: 'flex',
             }}
             onClick={onClose}
             type="close"
           />
        </span></div>
        <CorrelationMatrixs
          value={value}
          type={type}
        />
      </div>
    )
  }
}

class SimplifiedViewPlot extends Component {

  render() {
    const {type, style, data, target} = this.props;
    if (type === 'Raw') return null
    if (type === 'Numerical') {
      return <div className={styles.plot} style={style}>
        {/*<div onClick={onClose} className={styles.plotClose}><span>X</span></div>*/}
        <HistogramNumerical
          x_name={target}
          y_name={'count'}
          title={`Feature:${target}`}
          data={data}
        />
      </div>
    }
    return <div className={styles.plot} style={style}>
      {/*<div onClick={onClose} className={styles.plotClose}><span>X</span></div>*/}
      <HistogramCategorical
        x_name={target}
        data={data}
      />
    </div>
  }
}

@observer
class CreateNewVariable extends Component {
  constructor(props) {
    super(props)
    this.fxRef = React.createRef();
  }

  @observable hintStatus = false
  @observable hints = []
  @observable exp = ''
  @observable name = ''
  @observable showFunction = {}
  @observable active = 0
  //光标结束位置
  @observable inputPosition = 0
  @observable myFunction = {}
  @observable loading = false
  @observable isIn = false
  @observable showTips = false

  hideHint = () => {
    this.hintStatus = false
    this.showTips = false
    this.showFunction = {}
    this.active = 0
    this.hints = []
    document.onmousedown = () => {
    }
  }

  handleChange = e => {
    this.exp = e.target.value
  }

  changeHints = () => {
    const startIndex = this.getStartIndex()
    const functionStr = this.exp.slice(0, startIndex)
    const functionList = [...FUNCTIONS.base, ...FUNCTIONS.senior]
    const hasFunction = functionList.find(v => functionStr.includes(v.value.slice(0, -1)))
    const hasConcat = functionList.filter(v => functionStr.includes(v.value.slice(0, -1))).find(v => v.value === "Concat()")
    this.myFunction = [...FUNCTIONS.senior].reverse().find(v => functionStr.includes(v.value.slice(0, -1))) || {}
    let exp = this.exp.slice(startIndex, this.inputPosition).trim()
    const {dataHeader, colType} = this.props
    let valueList = [...dataHeader]
    if (!hasConcat) valueList = valueList.filter(v => colType[v] === "Numerical")
    let filterFunctions = []
    if (exp.startsWith("@")) {
      exp = exp.slice(1).trim()
      if (!exp) return this.hints = valueList.map(v => {
        return {
          label: v,
          value: "@" + v
        }
      })
    } else {
      filterFunctions = [...FUNCTIONS.base]
      if (!hasFunction) filterFunctions = FUNCTIONS.senior.filter(v => v.value.toLowerCase().includes(exp.toLowerCase())).concat(filterFunctions)
    }
    const filterValues = valueList.filter(_v => _v.includes(exp.toLowerCase())).map(item => {
      return {
        label: item,
        value: "@" + item
      }
    })
    this.hints = [...filterFunctions, ...filterValues]
    this.showFunction = !this.hints.length ? {} : this.hints[0]
    return
  }

  getStartIndex = () => {
    const exp = this.exp.slice(0, this.inputPosition)
    let start = exp.length
    const endStr = ["+", "-", "*", "/", "(", ","]
    for (; start > 0; start--) {
      if (endStr.includes(exp[start])) {
        start++
        break
      }
    }
    return start
  }

  handleSelect = (value, isFunciton) => {
    // this.exp = value
    const startIndex = this.getStartIndex()
    this.exp = this.exp.slice(0, startIndex) + value + this.exp.slice(this.inputPosition)
    this.fxRef.current.focus()
    setTimeout(() => {
      this.inputPosition = (this.exp.slice(0, startIndex) + value).length + (isFunciton ? -1 : 0)
      this.fxRef.current.setSelectionRange(this.inputPosition, this.inputPosition)
    }, 0);

    window.ref = this.fxRef.current
  }

  onKeyDown = e => {
    // enter
    if (e.keyCode === 13) {
      if (!this.hints.length) return
      const selectValue = this.hints[this.active]
      if (!selectValue) return
      this.handleSelect(selectValue.value, !!selectValue.syntax)
      return
    }
    // up
    if (e.keyCode === 38) {
      e.preventDefault()
      if (this.active === 0) return
      this.active--
      this.showFunction = this.hints[this.active]
    }
    // down
    if (e.keyCode === 40) {
      e.preventDefault()
      if (this.active === this.hints.length - 1) return
      this.active++
      this.showFunction = this.hints[this.active]
    }
  }

  onSelect = () => {
    this.inputPosition = this.fxRef.current.selectionEnd
    this.changeHints()
    this.hintStatus = true
    this.isIn = true
    document.onmousedown = e => {
      let dom = e.target;
      let isIn = false
      while (dom) {
        if (dom.className === styles.newVariableFx) {
          isIn = true;
          break
        }
        dom = dom.parentNode
      }
      if (!isIn) this.hideHint()
      this.isIn = isIn
    }
  }

  showSyntax = n => {
    this.active = n
    this.showFunction = this.hints[this.active]
    this.showTips = false
  }

  //点击确认按钮
  handleAdd = () => {
    let {name, exp, props: {expression}} = this
    console.log(name, exp, expression, 6666)
    name = name.trim()
    if (!name) return antdMessage.error(EN.Nameisempty)
    if (expression.hasOwnProperty(name)) return antdMessage.error(`${EN.Newvariable} ${name} ${EN.Isexist}`)
    if (name.includes("_")) return antdMessage.error(EN.Namecannotcontain)
    const checked = this.checkExp(exp)
    if (!checked.isPass) return antdMessage.error(checked.message)
    if (!checked.num) return antdMessage.error(EN.Expressionisempty)
    const {num, type} = checked
    const nameArray = []
    if (num === 1) {
      nameArray.push("r2_" + name)
    } else {
      for (let n = 0; n < num; n++) {
        nameArray.push(`r2_${name}_${n + 1}`)
      }
    }
    this.loading = true
    this.props.addNewVariable(name, nameArray, exp, type).then(result => {
      this.loading = false
      if (!result) return
      this.props.onClose()
      this.name = ''
      this.exp = ''
      this.myFunction = {}
      this.hideHint()
    })
  }

  // 转化括号
  formatBracket = _expression => {
    let expression = _expression
    const bracketExps = []
    let num = 0

    while (true) {
      // 查询第一个)
      const end = expression.indexOf(")") + 1
      if (end === 0) break;
      if (num > 9) return {isPass: false, message: EN.Toomanyfunctions}
      // 查询截取表达式最后一个(
      const start = expression.lastIndexOf("(", end)
      if (start === -1) return {isPass: false, message: EN.Unexpectedtoken}
      const exp = expression.slice(start + 1, end - 1)
      bracketExps.push(exp)
      //转化(...)为$?
      expression = expression.slice(0, start) + "$" + num + expression.slice(end)
      num++
    }

    return {
      expression,
      bracketExps
    }
  }

  // 校验基本表达式
  checkSimpleExp = (expression, bracketExps) => {
    if (!expression) return {isPass: false, message: EN.Emptyexpression}
    const baseOptReg = new RegExp(/[+\-*/]/)
    // 根据+-*/切割表达式
    const array = expression.split(baseOptReg)
    console.log(array, 777)
    let num = 1
    let isVariable = false
    let expType = ''
    const typeArray = []
    for (let item of array) {
      //Categorical
      let type = 'Numerical'
      item = item.trim()
      if (!item) return {isPass: false, message: EN.Errorexpression}
      //判断是否是数字
      if (isNaN(item)) {
        // 判断是否含有转化的()表达式
        if (item.includes("$")) {
          const index = item.indexOf("$")
          // 截取函数名称
          const functionName = item.slice(0, index).trim()
          let bracketNum = item.slice(index + 1, index + 2).trim()
          if (!bracketNum || isNaN(bracketNum)) return {isPass: false, message: EN.Errorexpression}
          try {
            bracketNum = parseInt(bracketNum, 10)
          } catch (e) {
            return {isPass: false, message: EN.Errorexpression}
          }
          const other = item.slice(index + 2).trim()
          if (other) return {isPass: false, message: `${EN.Unexpectedidentifier} ${other}`}
          // 校验参数
          const fnResult = this.checkParams(functionName, bracketExps, bracketNum)
          if (!fnResult.isPass) return fnResult
          num += fnResult.num - 1
          isVariable = fnResult.isVariable
          type = fnResult.type
        }
        // 判断是否为选择的参数
        if (item.startsWith("@")) {
          item = item.slice(1)
          const {dataHeader, colType} = this.props
          if (!item || !dataHeader.includes(item)) return {isPass: false, message: `${EN.Unknownvariable} ${item}`}
          isVariable = true
          type = colType[item] === 'Numerical' ? 'Numerical' : 'Categorical'
        }
      }
      typeArray.push(type)
    }
    if (typeArray.length > 1) {
      const index = typeArray.indexOf('Categorical')
      if (index !== -1) return {isPass: false, message: `${EN.Errorexpression}: ${array[index]}`}
      expType = 'Numerical'
    } else {
      expType = typeArray[0]
    }
    return {isPass: true, message: EN.OK, num, isVariable, type: expType}
  }

  // 校验表达式参数
  checkParams = (functionName, bracketExps, bracketNum) => {
    const exps = bracketExps[bracketNum]
    if (!exps) return {isPass: false, message: EN.Emptyparameter}
    // 根据, 分割参数
    const expArray = exps.split(",")
    // 不是函数, 则参数只能为1个
    if (!functionName && expArray.length > 1) return {isPass: false, message: `${EN.Unexpectedidentifier} ${exps}`}
    const isBaseFn = FUNCTIONS.base.find(fn => fn.value === functionName + "()")
    const isSeniorFn = FUNCTIONS.senior.find(fn => fn.value === functionName + "()")
    const currentFn = isBaseFn || isSeniorFn
    // 判断函数参数个数限制
    if (currentFn.params && currentFn.params !== expArray.length) return {
      isPass: false,
      message: `${EN.Function} ${functionName} must have ${currentFn.params} params`
    }
    let numOfParam = 0
    let isVariable1 = false
    let num = 1
    let fnType = ''
    const params = []

    for (const exp of expArray) {
      // 校验表达式
      const expChecked = this.checkSimpleExp(exp.trim(), bracketExps)
      if (!expChecked.isPass) return expChecked
      const {isVariable, num, type} = expChecked
      if (isVariable) numOfParam++
      // 报存参数类型
      params.push({
        isVariable,
        num,
        exp,
        type
      })
    }

    if (isSeniorFn) {
      // 校验高级函数参数
      const seniorResult = this.checkSeniorParams(currentFn, params, numOfParam)
      if (!seniorResult.isPass) return seniorResult
      isVariable1 = true
      num += seniorResult.num - 1
      fnType = seniorResult.type
    } else if (isBaseFn) {
      // 校验一般函数参数
      if (currentFn.value === 'eq()') {
        fnType = 'Categorical'
      } else {
        fnType = 'Numerical'
      }
    } else {
      // 校验非函数参数
      for (let param of params) {
        if (param.type !== 'Numerical') return {isPass: false, message: EN.ParametersmustbeNumerical}
      }
      fnType = 'Numerical'
    }
    for (let param of params) {
      num += param.num - 1
      isVariable1 = isVariable1 || param.isVariable
    }
    return {isPass: true, message: `ok`, num, isVariable: isVariable1, type: fnType}
  }

  // 校验高级表达式参数
  checkSeniorParams = (senior, params, numOfParam) => {
    let num = 0
    let type = ''

    // 截取列名参数
    const paramList = params.slice(0, numOfParam)
    if (senior.value !== 'Concat()') {
      for (let param of paramList) {
        if (param.type !== 'Numerical') return {
          isPass: false,
          message: `${EN.Function} ${senior.value.slice(0, -2)} ${EN.ParametersmustbeNumerical}`
        }
      }
    }
    // 截取非列名参数
    const numList = params.slice(numOfParam)
    switch (senior.value) {
      case "Concat()":
        type = 'Categorical'
        if (numOfParam < 1) return {
          isPass: false,
          message: `${EN.Function}: ${senior.value.slice(0, -2)} ${EN.Parameterserror}`
        }
        const concatResults = numList.map(num => {
          let n = num.exp
          if (isNaN(n) || n.includes(".")) return {isPass: false, message: `${n} ${EN.Mustbeinteger}`}
          try {
            n = parseInt(n, 10)
          } catch (e) {
            return {isPass: false, message: `${n} ${EN.Mustbeinteger}`}
          }
          if (n < 2) return {isPass: false, message: `${n} ${EN.Mustgreaterthan} 1`}
          if (n > numOfParam) return {isPass: false, message: `${n} ${EN.Mustlessthan} ${numOfParam + 1}`}
          return {
            isPass: true,
            message: EN.OK,
            num: this.factorial(numOfParam) / this.factorial(n) / this.factorial(numOfParam - n)
          }
        })
        for (let numResult of concatResults) {
          if (!numResult.isPass) return numResult
          num += numResult.num
        }
        break;
      case "Diff()":
        type = 'Numerical'
        const diffResults = numList.map(num => {
          let n = num.exp
          if (isNaN(n) || n.includes(".")) return {isPass: false, message: `${n} ${EN.Mustbeinteger}`}
          try {
            n = parseInt(n, 10)
          } catch (e) {
            return {isPass: false, message: `${n} ${EN.Mustbeinteger}`}
          }
          return {isPass: true, message: EN.OK, num: numOfParam}
        })
        for (let numResult of diffResults) {
          if (!numResult.isPass) return numResult
          num += numResult.num
        }
        break;
      case "Accumulate()":
        type = 'Numerical'
        num = numOfParam
        break;
      case "Quantile_bin()":
        type = 'Categorical'
        const quantileBinArray = ["0", "1"]
        const [b, type1, type2] = numList
        if (isNaN(b.exp) || b.exp.includes(".")) return {isPass: false, message: `${b.exp} ${EN.Mustbeinteger}`}
        if (!quantileBinArray.includes(type1.exp.trim())) return {
          isPass: false,
          message: `${type1.exp} ${EN.Isnotsupported}`
        }
        if (type2 && !quantileBinArray.includes(type2.exp.trim())) return {
          isPass: false,
          message: `${type2.exp} ${EN.Isnotsupported}`
        }
        num = numOfParam * (type2 ? 2 : 1)
        break;
      case "Custom_Quantile_bin()":
        type = 'Categorical'
        const numResults = numList.map(num => {
          let n = num.exp
          const str = n.trim()
          const first = str.slice(0, 1)
          const last = str.slice(-1)
          if (first !== "[" || last !== "]") return {isPass: false, message: `${EN.Unexpectedidentifier} ${n}`}
          const array = str.slice(1, -1).split("|")
          for (let item of array) {
            if (!item || isNaN(item.trim())) return {isPass: false, message: `${item} ${EN.Mustbenumbe}`}
          }
          return {isPass: true, message: EN.OK, num: 1}
        })
        for (let numResult of numResults) {
          if (!numResult.isPass) return numResult
          num += numResult.num
        }
        break;
      default:
        break;
    }
    if (num < 1) return {isPass: false, message: `${EN.Function}: ${senior.value.slice(0, -2)} ${EN.Parameterserror}`}
    return {isPass: true, message: EN.OK, num, type}
  }

  // 校验总表达式
  checkExp = _expression => {
    if (!_expression) return {isPass: true, message: EN.OK, num: 0}
    if (_expression.includes("$")) return {isPass: false, message: EN.Unexpectedtoken$}

    const {bracketExps, expression} = this.formatBracket(_expression)
    console.log(bracketExps, expression, 666)
    const {isPass, message, num, type} = this.checkSimpleExp(expression, bracketExps)
    return {isPass, message, num, type}
  }

  // 计算阶乘
  factorial = (n) => {
    if (n < 2) return 1
    return n * this.factorial(n - 1)
  }

  handleNameChange = e => {
    const value = e.target.value.trim()
    this.name = value
  }

  deleteFx = () => {
    this.exp = ''
    this.fxRef.current.focus()
  }

  showAll = () => {
    const isSenior = FUNCTIONS.senior.map(v => v.syntax).includes(this.showFunction.syntax)
    if (isSenior) this.showTips = true
  }

  render() {
    console.log(this.props);
    const {onClose} = this.props
    const functionList = [...FUNCTIONS.base, ...FUNCTIONS.senior]
    const functionSyntax = functionList.find(v => v.syntax === this.myFunction.syntax)
    const hintFunctionSyntax = functionList.find(v => v.syntax === this.showFunction.syntax)
    const hintIsSenior = FUNCTIONS.senior.includes(hintFunctionSyntax)

    return <div className={styles.newVariableBlock}>
      <div className={styles.newVariableRow}>
        <div className={styles.newVariableName}>
          <input className={styles.newVariableInput} placeholder={EN.NAME} value={this.name}
                 onChange={this.handleNameChange}/>
        </div>
        <span>=</span>
        <div className={styles.newVariableFx}>
          <input className={styles.newVariableInput} placeholder={EN.FX} ref={this.fxRef} value={this.exp}
                 onChange={this.handleChange} onKeyDown={this.onKeyDown} onSelect={this.onSelect}/>
          {this.isIn && <div className={styles.newVariableEmpty} onClick={this.deleteFx}><span>X</span></div>}
          {this.hintStatus && <div className={styles.newVariableHintList}>
            {this.hints.map((v, k) => {
              return <div key={k} className={classnames(styles.newVariableHint, {
                [styles.activeHint]: this.active === k
              })} onClick={this.handleSelect.bind(null, v.value, !!v.syntax)}
                          onMouseOver={this.showSyntax.bind(null, k)}>
                <span>{v.label}</span>
              </div>
            })}
          </div>}
          {!!hintFunctionSyntax && (this.showTips ?
            <FunctionTips value={hintFunctionSyntax.value}/> :
            <div className={styles.newVariableHintSyntax}>
              <span>{hintFunctionSyntax.syntax}</span>
              {hintIsSenior && <button onClick={this.showAll}><span>{EN.Tips}</span></button>}
            </div>)}
          {!!functionSyntax && <div className={styles.newVariableSyntax}
                                    style={(this.hintStatus && !!this.hints.length) ? {right: '100%'} : null}>
            <span>{functionSyntax.syntax}</span></div>}
        </div>
      </div>
      <div className={styles.newVariableRow}>
        <button className={classnames(styles.newVariableButton, styles.newVariableAdd, {
          [styles.disable]: this.loading
        })} onClick={this.loading ? null : this.handleAdd}>
          <span>{this.loading ? <Icon type="loading" theme="outlined"/> : EN.ADD}</span>
        </button>
        <button className={classnames(styles.newVariableButton, styles.newVariableCancel)} onClick={onClose}>
          <span>{EN.Cancel}</span>
        </button>
      </div>
    </div>
  }
}

class FunctionTips extends Component {
  Concat() {
    return <div className={styles.funcTips}>
      <div className={styles.funcTipsName}><span>{EN.Concat}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Concatfunctionallowsyou}</span></div>
      <div className={styles.funcTipsTitle}><span>{EN.Syntax}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Concatvar1}</span></div>
      <div className={styles.funcTipsTitle}><span>{EN.Input}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Var1var2var3}<br/>
        {EN.Numberofvariables}</span></div>
      <div className={styles.funcTipsTitle}><span>{EN.Output}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Categoricalvariables}</span></div>
      <div className={styles.funcTipsTitle}><span>{EN.Examples}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Concatcolor}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Output}</span></div>
      <div className={styles.funcTipsContent}>
        <Table
          bordered={true}
          defaultExpandAllRows={true}
          pagination={false}
          size="small"
          dataSource={[
            {key: '1', 1: 'red_nature', 2: 'red_small', 3: 'nature_small'},
            {key: '2', 1: 'blue_sports', 2: 'blue_medium', 3: 'sports_medium'}
          ]}
          columns={[{
            title: 'color_theme',
            dataIndex: 1,
            key: 1,
            className: styles.funcTipsCol
          }, {
            title: 'color_size',
            dataIndex: 2,
            key: 2,
            className: styles.funcTipsCol
          }, {
            title: 'theme_size',
            dataIndex: 3,
            key: 3,
            className: styles.funcTipsCol
          }]}/>
      </div>
      <div className={styles.funcTipsContent}><span>{EN.Concatolor3}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Output}</span></div>
      <div className={styles.funcTipsContent}>
        <Table
          bordered={true}
          defaultExpandAllRows={true}
          pagination={false}
          size="small"
          dataSource={[
            {key: '1', 1: 'red_nature_small'},
            {key: '2', 1: 'blue_sports_medium'}
          ]}
          columns={[{
            title: 'color_theme_size',
            dataIndex: 1,
            key: 1,
            className: styles.funcTipsCol
          }]}/>
      </div>
      <div className={styles.funcTipsContent}><span>{EN.Concat23}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Output}</span></div>
      <div className={styles.funcTipsContent}>
        <Table
          bordered={true}
          defaultExpandAllRows={true}
          pagination={false}
          size="small"
          dataSource={[
            {key: '1', 1: 'red_nature', 2: 'red_small', 3: 'nature_small', 4: 'red_nature_small'},
            {key: '2', 1: 'blue_sports', 2: 'blue_medium', 3: 'sports_medium', 4: 'blue_sports_medium'}
          ]}
          columns={[{
            title: 'color_theme',
            dataIndex: 1,
            key: 1,
            className: styles.funcTipsCol
          }, {
            title: 'color_size',
            dataIndex: 2,
            key: 2,
            className: styles.funcTipsCol
          }, {
            title: 'theme_size',
            dataIndex: 3,
            key: 3,
            className: styles.funcTipsCol
          },
            {
              title: 'color_theme_size',
              dataIndex: 4,
              key: 4,
              className: styles.funcTipsCol
            }]}/>
      </div>
      <div className={styles.funcTipsTitle}><span>{EN.Notice}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Iftoomanynewvariablesarecreated}</span></div>
    </div>
  }

  Diff() {
    return <div className={styles.funcTips}>
      <div className={styles.funcTipsName}><span>{EN.Diff}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Difffunctionallowsyoutoeasily}</span></div>
      <div className={styles.funcTipsTitle}><span>{EN.Syntax}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.DIffrow1}</span></div>
      <div className={styles.funcTipsTitle}><span>{EN.Input}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Ormorenumericalvariables}<br/>
        {EN.Distancetobecalculated}</span></div>
      <div className={styles.funcTipsTitle}><span>{EN.Output}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Numericalvariable}</span></div>
      <div className={styles.funcTipsTitle}><span>{EN.Example}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Difftax}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Output}</span></div>
      <div className={styles.funcTipsContent}>
        <Table
          bordered={true}
          defaultExpandAllRows={true}
          pagination={false}
          size="small"
          dataSource={[
            {key: '1', 1: '200', 2: 'nan', 3: 'nan'},
            {key: '2', 1: '230', 2: '30', 3: 'nan'},
            {key: '3', 1: '280', 2: '50', 3: '80'},
            {key: '4', 1: '250', 2: '-30', 3: '20'}
          ]}
          columns={[{
            title: 'tax',
            dataIndex: 1,
            key: 1,
            className: styles.funcTipsCol
          }, {
            title: 'tax_diff_r1',
            dataIndex: 2,
            key: 2,
            className: styles.funcTipsCol
          }, {
            title: 'tax_diff_r2',
            dataIndex: 3,
            key: 3,
            className: styles.funcTipsCol
          }]}/>
      </div>
      <div className={styles.funcTipsTitle}><span>{EN.Notice}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Iftoomanynewvariablesarecreated}</span></div>
    </div>
  }

  Accumulate() {
    return <div className={styles.funcTips}>
      <div className={styles.funcTipsName}><span>{EN.Accumulate}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Accumulatefunction}</span></div>
      <div className={styles.funcTipsTitle}><span>{EN.Syntax}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Accumulatevar1var2}</span></div>
      <div className={styles.funcTipsTitle}><span>{EN.Input}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Morenumericalvariables}</span></div>
      <div className={styles.funcTipsTitle}><span>{EN.Output}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Numericalvariable}</span></div>
      <div className={styles.funcTipsTitle}><span>{EN.Example}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Accumulatedaily_sales}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Output}</span></div>
      <div className={styles.funcTipsContent}>
        <Table
          bordered={true}
          defaultExpandAllRows={true}
          pagination={false}
          size="small"
          dataSource={[
            {key: '1', 1: '1000', 2: '1000', 3: '200', 4: '200'},
            {key: '2', 1: '1500', 2: '2500', 3: '300', 4: '500'},
            {key: '3', 1: '1800', 2: '4300', 3: '350', 4: '850'}
          ]}
          columns={[{
            title: 'daily_sales',
            dataIndex: 1,
            key: 1,
            className: styles.funcTipsCol
          }, {
            title: 'daily_sales_accum',
            dataIndex: 2,
            key: 2,
            className: styles.funcTipsCol
          }, {
            title: 'daily_cost',
            dataIndex: 3,
            key: 3,
            className: styles.funcTipsCol
          },
            {
              title: 'daily_cost_accum',
              dataIndex: 4,
              key: 4,
              className: styles.funcTipsCol
            }]}/>
      </div>
      <div className={styles.funcTipsTitle}><span>{EN.Notice}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Iftoomanynewvariablesarecreatedcsystem}</span></div>
    </div>
  }

  Quantile_bin() {
    return <div className={styles.funcTips}>
      <div className={styles.funcTipsName}><span>{EN.Quantile_bin}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Quantile_binfunctionallows}</span></div>
      <div className={styles.funcTipsTitle}><span>{EN.Syntax}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Quantile_binvar1var2}</span></div>
      <div className={styles.funcTipsTitle}><span>{EN.Input}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Allvariablesneedtostartwith}<br/>
        {EN.Numberofgroupstobedivided}<br/>
        {EN.Type1type2}<br/>
        {EN.Variableisdividedbyitspercentile}<br/>
        {EN.Eachgroupiswiththesamevaluerange}</span></div>
      <div className={styles.funcTipsTitle}><span>{EN.Output}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Categoricalvariables}</span></div>
      <div className={styles.funcTipsTitle}><span>{EN.Example}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Quantile_binage}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Output}</span></div>
      <div className={styles.funcTipsContent}>
        <Table
          bordered={true}
          defaultExpandAllRows={true}
          pagination={false}
          size="small"
          dataSource={[
            {key: '1', 1: '19', 2: '0-25'},
            {key: '2', 1: '45', 2: '25-50'},
            {key: '3', 1: '60', 2: '50-75'}
          ]}
          columns={[{
            title: 'age',
            dataIndex: 1,
            key: 1,
            className: styles.funcTipsCol
          }, {
            title: EN.agevalb3,
            dataIndex: 2,
            key: 2,
            className: styles.funcTipsCol
          }]}/>
      </div>
      <div className={styles.funcTipsContent}><span>{EN.Quantile_binage1}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Output}</span></div>
      <div className={styles.funcTipsContent}>
        <Table
          bordered={true}
          defaultExpandAllRows={true}
          pagination={false}
          size="small"
          dataSource={[
            {key: '1', 1: '0-24', 2: '0-25', 3: '0-3', 4: '0-5'},
            {key: '2', 1: '24-50', 2: '25-40', 3: '3-9', 4: '5-8'},
            {key: '3', 1: '50-75', 2: '40-60', 3: '9-15', 4: '8-15'}
          ]}
          columns={[{
            title: 'age1_val_b4',
            dataIndex: 1,
            key: 1,
            className: styles.funcTipsCol
          }, {
            title: 'age1_fre_b4',
            dataIndex: 2,
            key: 2,
            className: styles.funcTipsCol
          }, {
            title: 'age2_val_b4',
            dataIndex: 3,
            key: 3,
            className: styles.funcTipsCol
          },
            {
              title: 'age2_fre_b4',
              dataIndex: 4,
              key: 4,
              className: styles.funcTipsCol
            }]}/>
      </div>
      <div className={styles.funcTipsTitle}><span>{EN.Notice}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Iftoomanynewvariablesarecreated}</span></div>
    </div>
  }

  Custom_Quantile_bin() {
    return <div className={styles.funcTips}>
      <div className={styles.funcTipsName}><span>{EN.Custom_Quantile_bin}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Custom_Quantile_binfunction}</span></div>
      <div className={styles.funcTipsTitle}><span>{EN.Syntax}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Custom_Quantile_binrange_list1}</span></div>
      <div className={styles.funcTipsTitle}><span>{EN.Input}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Variableneedstostartwith}</span></div>
      <div className={styles.funcTipsTitle}><span>{EN.Output}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Categoricalvariables}</span></div>
      <div className={styles.funcTipsTitle}><span>{EN.Example}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Custom_Quantile_binage}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Output}</span></div>
      <div className={styles.funcTipsContent}>
        <Table
          bordered={true}
          defaultExpandAllRows={true}
          pagination={false}
          size="small"
          dataSource={[
            {key: '1', 1: '15', 2: '(<=25)', 3: '(<=20)'},
            {key: '2', 1: '40', 2: '(25-50)', 3: '(20-40)'},
            {key: '3', 1: '55', 2: '(>=50)', 3: '(40-60)'}
          ]}
          columns={[{
            title: 'age',
            dataIndex: 1,
            key: 1,
            className: styles.funcTipsCol
          }, {
            title: 'age_cus_b3',
            dataIndex: 2,
            key: 2,
            className: styles.funcTipsCol
          }, {
            title: 'age_cus_b4',
            dataIndex: 3,
            key: 3,
            className: styles.funcTipsCol
          }]}/>
      </div>
      <div className={styles.funcTipsTitle}><span>{EN.Notice}</span></div>
      <div className={styles.funcTipsContent}><span>{EN.Iftoomanynewvariablesarecreated}</span></div>
    </div>
  }

  render() {
    const {value} = this.props
    const key = value.slice(0, -2)
    if (!key || !this[key] || typeof this[key] !== 'function') return null
    return this[key]()
  }
}

class ScatterPlot extends Component {
  render() {
    const {type, style, data, message} = this.props;
    if (type === 'Regression') {
      //散点图
      if (message.type === 'Numerical') {
        return <div className={styles.plot} style={style}>
          {/*<div onClick={onClose} className={styles.plotClose}><span>X</span></div>*/}
          <TSENOne
            x_name={message.x}
            y_name={message.y}
            data={data}
          />
        </div>
      }

      //箱线图
      return <div className={styles.plot} style={style}>
        {/*<div onClick={onClose} className={styles.plotClose}><span>X</span></div>*/}
        <BoxPlots
          x_keys={data.x_keys}
          value={data.value}
        />
      </div>
    }
    return <div className={styles.plot} style={style}>
      <UnivariantPlots
        x_name={message.x}
        y_name={message.y}
        result={data}
      />
    </div>

  }
}
