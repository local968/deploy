import React, { Component } from 'react';
import {inject, observer} from 'mobx-react';
import * as d3 from 'd3';

import styles from './D3Chart.module.css';

function parseData(chartData) {
  const NEGATIVE = chartData.NEGATIVE;
  const PERCENTAGE = chartData.PERCENTAGE;
  const POSITIVE = chartData.POSITIVE;

  return Object.values(NEGATIVE).reduce((result, value, index) => {
    result.push({NEGATIVE: value, POSITIVE: POSITIVE[index], PERCENTAGE: PERCENTAGE[index]});
    return result;
  }, [])
}

@inject('projectStore')
@observer
export default class AreaChart extends Component {
  state = {
    movable: true
  };

  constructor(props){
    super(props);
    this.newSort = this.newSort.bind(this)
  }

  componentDidMount () {
    this.renderD3();
  }
  componentDidUpdate () {
    if (!this.props.model.fitIndexModified) {
      d3.select(`.${this.props.className} svg`).remove();
      this.renderD3();
    }
  }

  render () {
    const {className} = this.props;
    const {fitIndexModified} = this.props.model;
    if (fitIndexModified) { }
    return <div className={`${styles.areaChart} ${className}`}/>
  }

  renderD3 = () => {
    let {height, width, model} = this.props;
    const margin = {top: 15, right: 20, bottom: 20, left: 50};
    width = width - margin.left - margin.right;
    height = height - margin.top - margin.bottom;
    const {chartData} = model;
    if (!chartData) return null;

    let data = parseData(chartData.density);

    const x = d3.scaleLinear()
      .range([0, width]);

    const y = d3.scaleLinear()
      .range([height, 0]);

    const area = d3.area()
      .x(function (d) {
        return x(d.percentage);
      })
      .y0(height)
      .y1(function (d) {
        return y(d.density);
      });

    const svg = d3.select(`.${this.props.className}`).append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    const np = ['NEGATIVE', 'POSITIVE'].map(function (id) {
      return {
        id,
        values: data.map(function (d) {
          return {percentage: d.PERCENTAGE, density: d[id]};
        })
      };
    });

    const color = {
      NEGATIVE: '#00f580',
      POSITIVE: '#447eee'
    };
    y.domain([
      d3.min(np, function (c) { return d3.min(c.values, function (d) { return d.density; }); }),
      d3.max(np, function (c) { return d3.max(c.values, function (d) { return d.density; }); })
    ]);

    svg.selectAll('.ncsjk')
      .data(np)
      .enter().append('g')
      .append('path')
      .attr('class', styles.line)
      .attr('d', function (d) {
        return area(d.values);
      })
      .style('fill', function (d) {
        return color[d.id];
      });
    svg.append('g')
      .attr('class', styles.axis)
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x))
      .append('text')
      .attr('y', -10)
      .attr('x', x(1) + 55)
      .attr('fill', '#000')
      .text('Probability Threshold');

    svg.append('g')
      .attr('class', styles.axis)
      .call(d3.axisLeft(y))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -40)
      .attr('x', 0)
      .attr('fill', '#000')
      .text('Probability Density');
    this.drawLegend(svg, color);
    this.drawThreshold(svg, x, height);
  };

    newSort(index){
      clearTimeout(window.changeCutoff);
      window.changeCutoff = setTimeout(()=>{
        this.props.projectStore.changeStopFilter(false);
        this.props.model.setFitIndex(index);
      },800)
    }

  /**
   * 可移动棒
   */
  drawThreshold(svg, x, height){
    const {model: {chartData, fitIndex}} = this.props;
    const thresholdLine = svg.append('g');
    const threshold = chartData.roc.Threshold[fitIndex];

    const line = thresholdLine
      .append('line')
      .attr('x1', x(threshold))
      .attr('x2', x(threshold))
      .attr('y1', height)
      .attr('y2', 20)
      .attr('class', styles.thresholdLine);

    const dragCircle = d3.drag()
      .on('drag', () => {
        let p = d3.event.x;
        const index = this.getNearestPoint(x.invert(p), chartData.roc, 'Threshold');
        if(p<0){
          p=0
        }else if(p>430){
            p=430
        }
        line.attr('x1', p)
          .attr('x2', p);
        circle.attr('cx', p);
        this.props.projectStore.changeStopFilter(true);
        this.props.model.setFitIndex(index);//stores/Model.js/setFitIndex
        this.newSort(index)
      });

    const circle = thresholdLine
      .append('circle')
      .attr('class', styles.dragCircle)
      .attr('r', 6)
      .attr('cx', x(threshold))
      .attr('cy', 20)
      .call(dragCircle);
  }

  drawLegend = (svg, color) => {
    const {targetMap} = this.props.model;
    const targets = Object.keys(targetMap);
    const legend = svg.append('g').attr('transform', 'translate(' + 0 + ',' + 0 + ')');
    legend.append('circle')
      .attr('r', 5)
      .attr('cy', 0)
      .attr('cx', 40)
      .attr('fill', color['NEGATIVE']);

    legend.append('text')
      .attr('x', '50px')
      .attr('y', '3px')
      .attr('fill', '#000')
      .text(targets[0]);

    legend.append('circle')
      .attr('r', 5)
      .attr('cy', 0)
      .attr('cx', 180)
      .attr('fill', color['POSITIVE']);

    legend.append('text')
      .attr('x', '190px')
      .attr('y', '3px')
      .attr('fill', '#000')
      .text(targets[1]);
  };

  getNearestPoint (val, data, key) {
    let index;
    let minOffset = Number.MAX_SAFE_INTEGER;
    Object.values(data[key]).forEach((d, i) => {
      const offset = Math.abs(val - d);
      if (offset < minOffset) {
        minOffset = offset;
        index = i;
      }
    });
    return index;
  }


}
