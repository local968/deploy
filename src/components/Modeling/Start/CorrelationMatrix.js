import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import styles from './CorrelationMatrix.module.less';
import _ from 'lodash';

function parseColor(hexStr) {
  return hexStr.length === 4 ? hexStr.substr(1).split('').map(function (s) { return 0x11 * parseInt(s, 16); }) : [hexStr.substr(1, 2), hexStr.substr(3, 2), hexStr.substr(5, 2)].map(function (s) { return parseInt(s, 16); });
}

// zero-pad 1 digit to 2
function pad(s) {
  return (s.length === 1) ? '0' + s : s;
}

function gradientColors(start, end, steps, gamma) {
  let i, j, ms, me, output = [], so = [];
  gamma = gamma || 1;
  const normalize = function (channel) {
    return Math.pow(channel / 255, gamma);
  };
  start = parseColor(start).map(normalize);
  end = parseColor(end).map(normalize);
  for (i = 0; i < steps; i++) {
    ms = i / (steps - 1);
    me = 1 - ms;
    for (j = 0; j < 3; j++) {
      so[j] = pad(Math.round(Math.pow(start[j] * me + end[j] * ms, 1 / gamma) * 255).toString(16));
    }
    output.push('#' + so.join(''));
  }
  return output;
}

@observer
export default class CorrelationMatrix extends Component {
  render() {
    const cor = [1, 0.8, 0.6, 0.4, 0.2, 0, -0.2, -0.4, -0.6, -0.8, -1];
    const {header, data} = this.props;
    return (
      <div className={styles.correlationMatrix} >
        <div className={styles.matrix} >
          {header.map((v, i) => {
            return <CorrelationRow
              data={data[i]}
              key={i}
              index={i}
              header={header}
            />
          })}
        </div>
        <div className={styles.colorBar} >
          <div className={styles.bar}></div>
          <div className={styles.text}>
            {cor.map(c => <div key={c}>{c}</div>)}
          </div>
        </div>
      </div>
    )
  }
}

class CorrelationRow extends Component {
  render() {
    const {data, header, index} = this.props;
    const colorStep1 = gradientColors('#ffffff', '#688bfa', 50);
    const colorStep2 = gradientColors('#ff0000', '#ffffff', 50);
    return (
      <div>
        <span className={styles.horizonText} title={header[index]} >{header[index]}</span>
        {header.map((key, i) => {
          return (
            <div
              className={styles.rect}
              key={key}
              style={{
                backgroundColor: [...colorStep2, ...colorStep1][Math.max(Math.round(((data[i] + 1) / 2) * 100), 1) - 1]
              }}
            >
              {index === header.length - 1 && <span title={header[i]} className={styles.verticalText} >{header[i]}</span>}
            </div>
          )
        })}
      </div>
    )
  }
}