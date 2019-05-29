import React, { Component } from 'react';
import * as d3 from 'd3';
import { Checkbox } from 'antd';
import { inject, observer } from 'mobx-react';
import styles from './D3Chart.module.css';
// import d3tips from './d3-tip';
import EN from '../../constant/en';
const d3ColorsCategory20 = ['#2073F0', '#FF0000', '#FF8800', '#880000', '#2E8B57', '#00FF99', '#BE7347', '#DB1C82', '#00BBFF', '#FF5511', '#0000FF', '#240B42', '#00FFCC', '#9900FF', '#00FF00', '#CC00FF', '#888800', '#5500FF', '#000088', '#77FF00'];
d3ColorsCategory20.push(...d3.schemeCategory20)

function parseData(chartData) {
  const fpr = chartData.FPR;
  const tpr = chartData.TPR;

  return Object.values(fpr).reduce((result, value, index) => {
    result.push({ FPR: value, TPR: tpr[index] });
    return result;
  }, [])
}

@inject('projectStore')
@observer
export default class RocChart extends Component {
  constructor(props) {
    super(props);
  }
  state = {
    movable: false,
    options: this.props.compareChart && this.props.models.map(m => m.name),
  }
  static defaultProps = {
    isFocus: true,
    compareChart: false
  }

  componentDidMount() {
    this.renderD3();
  }
  componentDidUpdate() {
    d3.select(`.${this.props.className} svg`).remove();
    this.renderD3();
  }
  handleCheck = (val, { target: { checked } }) => {
    const op = new Set(this.state.options);
    if (checked)
      op.add(val);
    else
      op.delete(val);

    this.setState({ options: [...op] });
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
        .call(d3.axisBottom(x))
        .append('text')
        .attr('x', width - 50)
        .attr('y', 35)
        .attr('fill', '#000')
        .text(EN.FalsePositiveDate);

      svg.append('g')
        .attr('class', styles.axis)
        .call(d3.axisLeft(y))
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -40)
        .attr('dy', '.71em')
        .attr('x', 0)
        .attr('fill', '#000')
        .text(EN.TruePositiveRate);
    }
    if (lineEnable) {
      svg.append('path')
        .datum(data)
        .attr('class', styles.line)
        .attr('d', line)
        .style('stroke', color[index]);
    }
    return data;
  };

  newSort(index) {
    clearTimeout(window.changeCutoff);
    window.changeCutoff = setTimeout(() => {
      this.props.projectStore.changeStopFilter(false);
      this.props.model.setFitIndex(index);
    }, 800)
  }

  drawFocus = (self, x, y, data, focus) => {
    const { model, projectStore } = this.props;
    const x0 = x.invert(d3.mouse(self)[0]);

    const index = this.getNearestPoint(x0, data, 'FPR');
    const d = data[index];

    if (!d) {
      return null;
    }
    focus.attr('transform', 'translate(' + x(d.FPR) + ',' + y(d.TPR) + ')');
    projectStore.changeStopFilter(true);
    model.setFitIndex(index);
    this.newSort(index)
  };

  getNearestPoint(val, data, key) {
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

  render() {
    const { compareChart } = this.props;
    const names = compareChart && this.props.models.map(m => m.name);
    // observe for fitIndex
    const { fitIndex } = this.props.model;
    if (fitIndex) { }

    return (
      <div className={styles.chart + ' ' +this.props.className}>
        {compareChart && <div className={styles.checkbox} >
          {names.map((o, i) => <Checkbox defaultChecked={true} onClick={this.handleCheck.bind(this, o)} style={{ color: d3ColorsCategory20[i] }} key={o} >{o}</Checkbox>)}
        </div>}
      </div>
    );
  }

  renderD3 = () => {
    let { height, width } = this.props;
    const { model, isFocus, compareChart } = this.props;
    const { chartData } = model;
    if (!chartData) return null;
    let data = parseData(chartData.roc);

    const margin = { top: 20, right: 20, bottom: 20, left: 50 };
    width = width - margin.left - margin.right;
    height = height - margin.top - margin.bottom;

    const color = d3ColorsCategory20;

    const x = d3.scaleLinear()
      .range([0, width]);

    const y = d3.scaleLinear()
      .range([height, 0]);

    const line = d3.line()
      .x(function (d) { return x(d.FPR); })
      .y(function (d) { return y(d.TPR); });

    const svg = d3.select(`.${this.props.className}`).append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    if (compareChart) {
      const { models } = this.props;
      let xRange = [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER]
      let yRange = [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER]
      const list = models.map(m => {
        const { chartData } = m
        if (!chartData) return null
        const data = parseData(chartData.roc)
        const xDomain = [d3.min(data, d => d.FPR), d3.max(data, function (d) { return d.FPR; })]
        const yDomain = [d3.min(data, d => d.TPR), d3.max(data, function (d) { return d.TPR; })]
        xRange = [xRange[0] < xDomain[0] ? xRange[0] : xDomain[0], xRange[1] > xDomain[1] ? xRange[1] : xDomain[1]]
        yRange = [yRange[0] < yDomain[0] ? yRange[0] : yDomain[0], yRange[1] > yDomain[1] ? yRange[1] : yDomain[1]]
        const lineEnable = this.state.options.indexOf(m.name) >= 0;
        return { data, lineEnable }
      }).filter(l => !!l)
      x.domain(xRange);
      y.domain(yRange);
      list.forEach((d, index) => {
        this.drawChart(d.data, x, y, svg, height, line, index, color, d.lineEnable, width);
      })
      // models.forEach((m, index) => {
      //   const { chartData } = m
      //   if (!chartData) {
      //     return
      //   }
      //   const lineEnable = this.state.options.indexOf(m.name) >= 0;
      //   this.drawChart(parseData(chartData.roc), x, y, svg, height, line, index, color, lineEnable, width);
      // });
    } else {
      x.domain([d3.min(data, d => d.FPR), d3.max(data, function (d) { return d.FPR; })]);
      y.domain([d3.min(data, d => d.TPR), d3.max(data, function (d) { return d.TPR; })]);
      data = this.drawChart(data, x, y, svg, height, line, 0, color, true, width);
    }

    if (isFocus) {
      const { fitIndex } = model;
      const initalData = data[fitIndex];
      const focus = svg.append('g')
        .attr('class', styles.focus)
        .attr('transform', 'translate(' + x(initalData.FPR) + ',' + y(initalData.TPR) + ')');

      focus.append('circle')
        .attr('r', 4.5);
    
      svg.append('rect')
        .attr('class', styles.overlay)
        .attr('width', width)
        .attr('height', height)
        .on('mousedown',  ()=> {
          this.setState({ movable: true });
        })
        .on('mousemove',  ()=> {
          if (!this.state.movable) return;
          this.drawFocus(this, x, y, data, focus);
        })
        .on('mouseup',  ()=> {
          this.setState({ movable: false });
        });
    }
  }
}
