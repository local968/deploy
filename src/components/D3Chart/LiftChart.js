import React, { Component } from 'react';
import * as d3 from 'd3';
import { Checkbox } from 'antd';
import styles from './D3Chart.module.less';
import d3tips from './d3-tip';

const d3ColorsCategory20 = ['#2073F0', '#FF0000', '#FF8800', '#880000', '#2E8B57', '#00FF99', '#BE7347', '#DB1C82', '#00BBFF', '#FF5511', '#0000FF', '#240B42', '#00FFCC', '#9900FF', '#00FF00', '#CC00FF', '#888800', '#5500FF', '#000088', '#77FF00'];

function parseData(chartData) {
  const PERCENTAGE = chartData.PERCENTAGE;
  const LIFT = chartData.LIFT;

  return Object.values(PERCENTAGE).reduce((result, value, index) => {
    result.push({PERCENTAGE: value, LIFT: LIFT[index]});
    return result;
  }, [])
}

export default class PRChart extends Component {
  static defaultProps = {
    isFocus: false,
    compareChart: false
  }

  state = {
    options: this.props.compareChart && this.props.models.map(m => m.id),
    movable: true
  }

  componentDidMount () {
    this.renderD3();
  }
  componentDidUpdate () {
    d3.select(`.${this.props.className} svg`).remove();
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

  drawPoints = (data, x, y, svg, color, tool_tip, name) => {
    svg.selectAll(`${name.replace(/[:.]/g, '')}circle`)
      .data(data)
      .enter().append('circle')
      .attr('r', 6)
      .attr('cx', d => x(d.PERCENTAGE))
      .attr('cy', d => y(d.LIFT))
      .style('fill', color)
      .on('mouseover', tool_tip.show)
      .on('mouseout', tool_tip.hide);
  }

  drawChart = (data, x, y, svg, height, line, index, color, lineEnable = true, width) => {
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
        .call(d3.axisBottom(x).tickFormat(d3.format('.0%')))
        .append('text')
        .attr('x', x(1) - 30)
        .attr('y', -10)
        .attr('fill', '#000')
        .text('percentage');

      svg.append('g')
        .attr('class', styles.axis)
        .call(d3.axisLeft(y))
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -40)
        .attr('dy', '.71em')
        .attr('x', 0)
        .attr('fill', '#000')
        .text('lift');
    }
    if (lineEnable) {
      svg.append('path')
        .datum(data)
        .attr('class', styles.line)
        .attr('d', line)
        .style('stroke', color[index]);
    }
    return data;
  }

  drawFocus = (self, x, y, data, focus) => {
    if (!focus) return null;

    const {model} = this.props;
    const x0 = x.invert(d3.mouse(self)[0]);
    const index = this.getNearestPoint(x0, data, 'PERCENTAGE');
    const d = data[index];
    if (!d) {
      return null;
    }
    focus.attr('transform', 'translate(' + x(d.PERCENTAGE) + ',' + y(d.LIFT) + ')');
    model.setFitIndex(index);
    // this.props.view.panel.models[panelIndex].getMouseOverData(d);
  }

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

  render () {
    const {compareChart} = this.props;
    const names = compareChart && this.props.models.map(m => m.id);
    return (
      <div className={`${styles.chart} ${this.props.className}`}>
        {compareChart && <div className={styles.liftHoverPanel} ></div>}
        {compareChart && <div className={styles.checkbox} >
          {names.map((o, i) => <Checkbox defaultChecked={true} onClick={this.handleCheck.bind(this, o)} style={{color: d3ColorsCategory20[i]}} key={o} >{o}</Checkbox>)}
        </div>}
      </div>
    );
  }

  renderD3 = () => {
    let {height, width} = this.props;
    const {model, isFocus, compareChart, models} = this.props;
    const {chartData} = model;
    if (!chartData) return null;

    const margin = {top: 5, right: 20, bottom: 20, left: 50};
    width = width - margin.left - margin.right;
    height = height - margin.top - margin.bottom;

    const color = d3ColorsCategory20;

    const x = d3.scaleLinear()
      .range([0, width]);

    const y = d3.scaleLinear()
      .range([height, 0]);
        
    const line = d3.line()
      .x(function (d) {
        return x(d.PERCENTAGE);
      })
      .y(function (d) {
        return y(d.LIFT);
      });

    const svg = d3.select(`.${this.props.className}`).append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    const _this = this;

    let data = parseData(chartData.lift);

    x.domain([0, d3.max(data, function (d) {return d.PERCENTAGE;})]);
    y.domain([0, d3.max(data, function (d) {return d.LIFT;})]);

    if (compareChart) {
      models.forEach((m, index) => {
        const modelData = parseData(m.chartData.lift);
        const lineEnable = this.state.options.indexOf(m.id) >= 0;
        this.drawChart(modelData, x, y, svg, height, line, index, color, lineEnable, width);
        if (lineEnable) {
          const tool_tip = d3tips(`.${styles.liftHoverPanel}`)
            .offset(d => ([y(d.LIFT), x(d.PERCENTAGE) + 60]))
            .html(function(d) {
              return (
                `
                  <h4 >${m.id}</h4>
                  <div>percentage: ${d.PERCENTAGE}</div>
                  <div>lift: ${d.LIFT}</div>
                `
              );
            });
          svg.call(tool_tip);
          // this.drawPoints(modelData, x, y, svg, color[index], tool_tip, m.id);
        }
      });
    } else {
      data = this.drawChart(data, x, y, svg, height, line, 0, color, true, width);
    }

    if (isFocus) {
      const {fitIndex} = model;
      const initalData = data[fitIndex];
      const focus = svg.append('g')
        .attr('class', styles.focus)
        .attr('transform', 'translate(' + x(initalData.PERCENTAGE) + ',' + y(initalData.LIFT) + ')');
      focus.append('circle')
        .attr('r', 4.5);

      svg.append('rect')
        .attr('class', styles.overlay)
        .attr('width', width)
        .attr('height', height)
        .on('click', function () {
          _this.drawFocus(this, x, y, data, focus);
          _this.setState({movable: !_this.state.movable});
        })
        .on('mousemove', function () {
          if (!_this.state.movable) return;
          _this.drawFocus(this, x, y, data, focus);
        });
    }
  }
}
