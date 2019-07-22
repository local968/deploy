
import Thumbnail from './Thumbnail';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import styles from './DetailCurves.module.css';
import ParallelPlot from './svg/parallel-plot.png'
import ParallelPlotOn from './svg/parallel-plot-on.png'
import PcaIcon from './svg/pca.png'
import PcaIconOn from './svg/pca-on.png'
import {
  PAW,
  ParallelPlots,
} from "../../../Charts"
import Model from 'stores/Model';
import Project from 'stores/Project';

interface ClusteringDetailCurvesProps {
  project: Project;
  model: Model;
  type: string;
  handleType: (t: string) => void
}

@observer
class ClusteringDetailCurves extends Component<ClusteringDetailCurvesProps> {
  constructor(props) {
    super(props);
  }

  handleClick = (val: string) => {
    this.props.handleType(val)
  };

  curComponent() {
    const { model, type } = this.props;
    if (type === 'parallel') {
      return <ParallelPlots url={model.parallelPlotData} />
    }

    if (type === 'pca') {
      return <PAW url={model.pcaPlotData} />
    }
  }

  render() {
    const { type } = this.props;
    // let curComponent = (
    //   <div className={styles.plot} >
    //     <img className={styles.img} src={model.fitPlotPath} alt="fit plot" />
    //   </div>
    // );
    // let curComponent = <div className={styles.plot}>
    //   <ParallelPlots url={this.props.model.parallelPlotData} />
    // </div>;
    const thumbnails = [{
      text: 'Parallel Plot',
      hoverIcon: ParallelPlotOn,
      normalIcon: ParallelPlot,
      selectedIcon: ParallelPlotOn,
      type: "parallel"
    }, {
      text: 'PCA',
      hoverIcon: PcaIcon,
      normalIcon: PcaIcon,
      selectedIcon: PcaIconOn,
      type: 'pca'
    }];
    return (
      <div className={styles.detailCurves} >
        <div className={styles.leftPanel} style={{
          minWidth: 250,
          backgroundColor: 'transparent',
          padding: '20px 0 0 90px',
        }} >
          {/*<img style={{marginRight:12}} src={ParallelPlot} alt=''/>Parallel Plot*/}
          {thumbnails.map((tn, i) => <Thumbnail curSelected={type} key={i} thumbnail={tn} onClick={this.handleClick} value={tn.type} />)}
        </div>
        <div className={styles.rightPanel} >
          <div className={styles.plot}>{this.curComponent()}</div>
        </div>
      </div>
    )
  }
}

export default ClusteringDetailCurves;
