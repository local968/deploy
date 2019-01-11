import React, { Component } from 'react';
import * as d3 from 'd3';
import { Checkbox } from 'antd';
import styles from './D3Chart.module.css';
import d3tips from './d3-tip';

const d3ColorsCategory20 = ['#2073F0', '#FF0000', '#FF8800', '#880000', '#2E8B57', '#00FF99', '#BE7347', '#DB1C82', '#00BBFF', '#FF5511', '#0000FF', '#240B42', '#00FFCC', '#9900FF', '#00FF00', '#CC00FF', '#888800', '#5500FF', '#000088', '#77FF00'];

d3ColorsCategory20.push(...d3.schemeCategory20)

export default class SpeedAndAcc extends Component {
  state = {
    options: this.props.models.map(m => m.name),
  }
  componentDidMount () {
    this.renderD3();
  }

  handleCheck = (val, {target: {checked}}) => {
    const op = new Set(this.state.options);
    if (checked)
      op.add(val);
    else
      op.delete(val);

    this.setState({options: [...op]});
  }

  componentDidUpdate () {
    d3.select(`.${this.props.className} svg`).remove();
    this.renderD3();
  }

  resolveData(models) {
    return models.filter(function ({executeSpeed}) {
      return executeSpeed !== undefined;
    }).map(({executeSpeed, score, name}) => {
      return {speed: executeSpeed, acc: score.validateScore.auc, name };
    });
  }

  renderD3 = () => {
    let {height, width} = this.props;
    const {models} = this.props;
    const margin = {top: 50, right: 50, bottom: 20, left: 50};
    width = width - margin.left - margin.right;
    height = height - margin.top - margin.bottom;

    const color = d3ColorsCategory20;

    const x = d3.scaleLinear()
      .range([0, width]);

    const y = d3.scaleLinear()
      .range([height, 0]);

    const svg = d3.select(`.${this.props.className}`).append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    const data = this.resolveData(models)||[]
    if(!data.length){
      return
    }
    x.domain([0, d3.max(data, function (d) {return d.speed + 50;})]);
    y.domain([0, d3.max(data, function (d) {return d.acc + 0.1;})]);

    data.forEach((d, index) => {
      const pointEnable = this.state.options.indexOf(d.name) >= 0;
      this.drawCircle(d, x, y, svg, height, color, index, pointEnable, width);
    });
    this.drawHoverCircle(data, svg, x, y, color);
  }

  drawHoverCircle = (data, svg, x, y, color) => {
    const tool_tip = d3tips(`.${styles.hoverPanel}`)
      .offset(d => ([y(d.acc), x(d.speed) + 60]))
      .html(function(d) {
        return (
          `
            <h4 >${d.name}</h4>
            <div>Speed(ms/1000 rows): ${d.speed}</div>
            <div>Accuracy: ${d.acc}</div>
          `
        );
      });

    svg.call(tool_tip);
    svg.selectAll('circle')
      .data(data)
      .enter().append('circle')
      .filter(d => this.state.options.indexOf(d.name) >= 0)
      .attr('r', 6)
      .attr('cx', d => x(d.speed))
      .attr('cy', d => y(d.acc))
      .style('fill', d => {
        return color[data.map(p => p.name).indexOf(d.name)];
      })
      .on('mouseover', tool_tip.show)
      .on('mouseout', tool_tip.hide);
  }

  drawCircle = (point, x, y, svg, height, color, index, pointEnable = true, width) => {
    if (index === 0) {
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

      svg.append('g')
        .attr('class', styles.axis)
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(x))
        .append('text')
        .attr('x', 450)
        .attr('y', -10)
        .attr('fill', '#000')
        .text('Speed(ms/1000 rows)');

      svg.append('g')
        .attr('class', styles.axis)
        .call(d3.axisLeft(y))
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -30)
        .attr('x', 0)
        .attr('fill', '#000')
        .text('Accuracy');
    }

    if (!pointEnable) {
      return;
    }
    svg.append('line')
      .style('stroke-dasharray','5,5')
      .attr('x1', x(0))
      .attr('x2', x(point.speed))
      .attr('y1', y(point.acc))
      .attr('y2', y(point.acc))
      .attr('stroke','grey');

    svg.append('line')
      .style('stroke-dasharray','5,5')
      .attr('x1', x(point.speed))
      .attr('x2', x(point.speed))
      .attr('y1', y(point.acc))
      .attr('y2', y(0))
      .attr('stroke','grey');
  }

  render() {
    const names = this.props.models.map(m => m.name);
    return (
      <div className={`${styles.chart} ${this.props.className}`}>
        <div className={styles.hoverPanel}></div>
        <div className={styles.checkbox} >
          {names.map((o, i) => <Checkbox defaultChecked={true} onClick={this.handleCheck.bind(this, o)} style={{color: d3ColorsCategory20[i]}} key={o} >{o}</Checkbox>)}
        </div>
      </div>
    );
  }
}
