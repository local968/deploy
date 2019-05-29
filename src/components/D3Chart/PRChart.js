import React, { Component } from 'react';
import {inject, observer} from 'mobx-react';
import * as d3 from 'd3';

import styles from './D3Chart.module.css';

function parseData(chartData) {
  const Recall = chartData.Recall;
  const Precision = chartData.Precision;

  return Object.values(Recall).reduce((result, value, index) => {
    result.push({Recall: value, Precision: Precision[index]});
    return result;
  }, [])
}

@inject('projectStore')
@observer
export default class PRChart extends Component {
  state = {
    movable: false
  };
  
  constructor(props) {
    super(props);
    this.renderD3 = this.renderD3.bind(this);
  }

  componentDidMount () {
    this.renderD3();
  }
  componentDidUpdate () {
    d3.select(`.${this.props.className} svg`).remove();
    this.renderD3();
  }
  render () {
    const {fitIndex} = this.props.model;
    if (fitIndex) { }
    return (
      <div className={`${styles.chart} ${this.props.className}`}>
      </div>
    );
  }

  renderD3 = () => {
    let {height, width} = this.props;
    const {model} = this.props;

    const margin = {top: 5, right: 20, bottom: 20, left: 50};
    width = width - margin.left - margin.right;
    height = height - margin.top - margin.bottom;

    const x = d3.scaleLinear()
      .range([0, width]);

    const y = d3.scaleLinear()
      .range([height, 0]);

    const line = d3.line()
      .x(function (d) { return x(d.Recall); })
      .y(function (d) { return y(d.Precision); });

    const svg = d3.select(`.${this.props.className}`).append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    const _this = this;
    // remove recall = 0 and precision = 0
    const data = parseData(model.chartData.roc)||[]
    if(!data.length){
      return
    }

    x.domain([d3.min(data, d => d.Recall), d3.max(data, function (d) {return d.Recall;})]);
    y.domain([d3.min(data, d => d.Precision), d3.max(data, function (d) {return d.Precision;})]);

    svg.append('g')
      .attr('class', styles.axis)
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x))
      .append('text')
      .attr('x', x(1) + 18)
      .attr('y', -5)
      .attr('fill', '#000')
      .text('Recall');

    svg.append('g')
      .attr('class', styles.axis)
      .call(d3.axisLeft(y))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -40)
      .attr('dy', '.71em')
      .attr('x', 0)
      .attr('fill', '#000')
      .text('Precision');

    // add the Y gridlines
    svg.append('g')
      .attr('class', styles.grid)
      .call(d3.axisLeft(y).ticks(10)
        .tickSize(-width)
        .tickFormat('')
      );
    // add the X gridlines
    svg.append('g')
      .attr('class', styles.grid)
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x).ticks(10)
        .tickSize(-height)
        .tickFormat('')
      );

    svg.append('path')
      .datum(data)
      .attr('class', styles.line)
      .attr('d', line)
      .style('stroke', '#7fc8ee');

    const {fitIndex} = model;
    const initalData = data[fitIndex];

    const focus = svg.append('g')
      .attr('class', styles.focus)
      .attr('transform', 'translate(' + x(initalData.Recall) + ',' + y(initalData.Precision) + ')');
    focus.append('circle')
      .attr('r', 4.5);

    svg.append('rect')
      .attr('class', styles.overlay)
      .attr('width', width)
      .attr('height', height)
      .on('mousedown', function () {
        _this.setState({movable: true});
      })
      .on('mousemove', function () {
        if (!_this.state.movable) return;
        _this.drawFocus(this, x, y, data, focus);
      })
      .on('mouseup', function() {
        _this.setState({movable: false});
      });
  };

  newSort(index){
    clearTimeout(window.changeCutoff);
    window.changeCutoff = setTimeout(()=>{
      this.props.projectStore.changeStopFilter(false);
      this.props.model.setFitIndex(index);
    },800)
  }

  drawFocus = (self, x, y, data, focus) => {
    if (!focus) return null;

    const {model,projectStore} = this.props;
    const x0 = x.invert(d3.mouse(self)[0]);
    const index = this.getNearestPoint(x0, data, 'Recall');
    const d = data[index];
    if (!d) {
      return null;
    }
    focus.attr('transform', 'translate(' + x(d.Recall) + ',' + y(d.Precision) + ')');
    projectStore.changeStopFilter(true);
    model.setFitIndex(index);
    this.newSort(index)
    // this.props.view.panel.models[panelIndex].getMouseOverData(d);
  };

  getNearestPoint (val, data, key) {
    let index;
    let minOffset = 1;
    data.forEach((d, i) => {
      const offset = Math.abs(val - d[key]);
      if (offset < minOffset) {
        minOffset = offset;
        index = i;
      }
    });
    return index;
  }


}
