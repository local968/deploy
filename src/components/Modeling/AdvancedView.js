import React, { Component } from 'react';
import classnames from 'classnames';
import {Radio} from 'antd';
import styles from './styles.module.css';

export default class AdvancedView extends Component {
  render() {
    const {models, project} = this.props;
    return (
      <div className={styles.advancedModelResult}>
        <div className={styles.row}>
          <span>
            Modeling Results :{' '}
            <div className={styles.status}>&nbsp;&nbsp;OK</div>
          </span>
        </div>
        <AdvancedModelTable models={models} project={project} />
      </div>
    )
  }
}

class AdvancedModelTable extends Component {
  render() {
    const {models, project} = this.props;
    const texts = ['Model Name', 'F1-Score', 'Precision', 'Recall', 'Cutoff Threshold'];
    const header = (
      <Row>
        {texts.map(t => {
          return (
            <RowCell data={t} key={t} />
          )
        })}
      </Row>
    )
    const dataSource = models.map(m => {
      return (
        <ModelRow key={m.id} texts={texts} model={m} />
      )
    })
    return (
      <div className={styles.advancedModelTable} >
        {header}
        {dataSource}
      </div>
    )
  }
}

class ModelRow extends Component {
  handleClick = e => {
    e.stopPropagation();
  }
  render() {
    const {model, texts, checked} = this.props;
    const {id, fitIndex, chartData: {roc}} = model;
    return (
      <Row>
        {texts.map(t => {
          switch (t) {
            case 'Model Name':
              return (
                <RowCell key={1} data={<div key={1} >
                  <span onClick={this.handleClick} >
                      <Radio checked={checked} onClick={this.props.onClickCheckbox} />
                    </span>
                    <span className={styles.modelName} >{id}</span>
                  </div>}
                />
              )
            case 'F1-Score':
              return <RowCell data={roc.F1[fitIndex]} />;
            case 'Precision':
              return <RowCell data={roc.Precision[fitIndex]} />;
            case 'Recall':
              return <RowCell data={roc.Recall[fitIndex]} />;
            case 'Cutoff Threshold':
              return <RowCell data={roc.Threshold[fitIndex]} />;
          }

        })}
      </Row>
    )
  }
}

class Row extends Component {
  render() {
    const {children, rowStyle} = this.props;
    return (
      <div className={styles.adrow} style={rowStyle} >
        {children}
      </div>
    );
  }
}

class RowCell extends Component {
  render() {
    const {data, cellStyle, other, cellClassName, ...rest} = this.props;
    
    return (
      <div
        {...rest}
        style={cellStyle}
        className={classnames(styles.adcell, cellClassName)}
        title={(typeof data === 'string' || typeof data === 'number') ? data : null}
      >
        {other ? <span className={styles.hasotherCell} >{data}</span> : data}
        {other}
      </div>
    );
  }
}
