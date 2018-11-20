import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import * as d3 from 'd3';
import _ from 'lodash';
import d3tips from './d3-tip';

import styles from './D3Chart.module.less';

@observer
export default class RegressionPredictActualChart extends Component {
  componentDidMount () {
    this.renderD3();
  }

  componentDidUpdate () {
    d3.select(`.${styles.regressionPredictActualChart} svg`).remove();
    this.renderD3();
  }

  drawAxis = (svg, width, height, x, y1) => {
    const {target} = this.props.project;
    svg.append('g')
      .attr('class', styles.grid)
      .call(d3.axisLeft(y1).ticks(10)
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

    svg.append('g')
      .attr('class', styles.axis)
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x))
      .append('text')
      .attr('x', 550)
      .attr('y', 30)
      .attr('fill', '#000')
      .text('Point Number');

    svg.append('g')
      .attr('class', styles.axis)
      .call(d3.axisLeft(y1))
      .append('text')
      .attr('y', -5)
      .attr('x', 0)
      .attr('fill', '#000')
      .style('text-anchor', 'start')
      .text('Average ' + target);
  }

  drawLine = (svg, data, height, x, y, field, color) => {
    const line = d3.line()
      .x((d, i) => x(i + 1))
      .y(d => y(d[field]));
    const tool_tip = d3tips(`.${styles.hoverPanel}`)
      .offset((d, i) => ([y(d[field]), x(i) + 400]))
      .html(function(d, i) {
        return (
          `
            <div>Group Number: ${i + 1}</div>
            <div>Predicted Average: ${d['pred']}</div>
            <div>Actual Average: ${d['target']}</div>
          `
        );
      });
    svg.call(tool_tip);
    svg.selectAll(styles.circle)
      .data(data)
      .enter().append('circle')
      .attr('class', styles.circle)
      .attr('r', 3)
      .attr('cx', (d, i) => x(i + 1))
      .attr('cy', d => y(d[field]))
      .attr('fill', color)
      .on('mouseover', tool_tip.show)
      .on('mouseout', tool_tip.hide);

    svg.append('path')
      .datum(data)
      .attr('class', styles.line)
      .attr('d', line)
      .style('stroke', color);
  }

  render() {
    const {className} = this.props;
    
    return (
      <div>
        <div className={`${styles.regressionPredictActualChart} ${className}`}>
          <div className={styles.hoverPanel}></div>
        </div>
      </div>
    );
  }

  renderD3 = () => {
    let {height, width, data} = this.props;
    if (!data) return null;
    console.log(data);
    data = data.map(d => ({target: d[0], pred: d[1]}));
    const margin = {top: 15, right: 40, bottom: 30, left: 80};
    width = width - margin.left - margin.right;
    height = height - margin.top - margin.bottom;

    const svg = d3.select(`.${styles.regressionPredictActualChart}`).append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // const y1 = d3.scaleLinear().range([height, 0]);
    // const y2 = d3.scaleLinear().range([height, 0]);
    const x = d3.scaleLinear().range([width, 0]);
    const y = d3.scaleLinear().range([height, 0]);

    x.domain([data.length, 1]);
    // y1.domain([0, d3.max(data, d => d.target)]);
    // y2.domain([0, d3.max(data, d => d.pred)]);
    y.domain([
      Math.min(d3.min(data, d => d.target), d3.min(data, d => d.pred)),
      Math.max(d3.max(data, d => d.target), d3.max(data, d => d.pred))
    ]);
    // const max = d3.max(data, d => d.target)
    // console.log(max);
    this.drawAxis(svg, width, height, x, y);
    this.drawLine(svg, data, height, x, y, 'pred', 'lightblue');
    this.drawLine(svg, data, height, x, y, 'target', 'black');
    // this.drawHoverCircle(data, svg, x, y1);
  }
}