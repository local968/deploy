import React from 'react';
import {ContinueButton} from 'components/Common'
import classes from './styles.module.css';
import {Icon} from 'antd';
import VariableImpact from './VariableImpact'
import ModelProcessFlow from './modelProcessFlow'
import AdvancedViewUn from '../AdvancedViewUn/AdvancedView';
// import D3D2 from '@src/components/charts/D3D2'
// import Iso from '@src/components/charts/Iso'
// import ParallelPlot from '@src/components/charts/ParallelPlot'
import Hint from "../../Common/Hint";
import sample from './sampleModel.json'

export function ModelResult(sampleModel = sample) {
  const type = 'clustering'

  return <div className={classes.root}>
    {type === 'outlier' && <h3 className={classes.header}>Modeling result</h3>}
    {type === 'clustering' && <div className={classes.tabs}>
      <span className={`${classes.tab} ${classes.active}`}>Simple View</span>
      <span className={`${classes.tab}`}>Advanced View</span>
    </div>}
    {true && <div className={classes.body}>
      <div className={classes.top}>
        <div className={classes.left}>
          <div className={classes.descriptions}>
            We have recommended a model by default<br/>
            <small>You can also tell us your business needs to get a more precise recommendation</small>
            <br/>
            Selected Model: <span className={classes.modelName}>IsolationForest.custom20190109_21:42:12</span>
          </div>
          {type === 'outlier' && <div className={classes.scores}>
            <div className={classes.score}>
              <div className={classes.orange}>0.5</div>
              <span className={classes.label}>Score <Hint content='123321'/></span>
            </div>
            <div className={classes.rate}>
              <div className={classes.blood}>0.1</div>
              <span className={classes.rateLabel}>Contamination Rate <Hint content='123321'/></span>
            </div>
          </div>}
          {type === 'clustering' && <div className={classes.scores}>
            <div className={classes.cvnn}>
              <div className={classes.orange}>0.5</div>
              <span className={classes.label}>CVNN <Hint content='123321'/></span>
            </div>
            <div className={classes.cluster}>
              <div className={classes.blood}>0.1</div>
              <span className={classes.rateLabel}>The Number of Clusters <Hint content='123321'/></span>
            </div>
            <div className={classes.rSquared}>
              <div className={classes.green}>0.85</div>
              <span className={classes.rateLabel}>R squared <Hint content='123321'/></span>
            </div>
          </div>}
          <ContinueButton text='Mapping Dictionary' width='200px'/>
        </div>
        <div className={classes.right}>
          {/*<D3D2 url='http://192.168.0.182:8081/blockData?uid=ce732e55681011e9b948000c2959bcd0'/>*/}
          {/*<Iso url='http://192.168.0.182:8081/blockData?uid=de3e5a3a682d11e9b948000c2959bcd0'/>*/}
          {/* <ParallelPlot url='http://192.168.0.182:8081/blockData?uid=c2e0d5c2681111e9b948000c2959bcd0'/> */}
        </div>
      </div>
      {type === 'clustering' && <ClusteringTable/>}
      {type === 'outlier' && <OutlierTable/>}
    </div>}
    {false && <AdvancedViewUn/>}
  </div>;
}

const OutlierTable = () => {
  const classes = useStyles();
  return <div className={classes.table}>
    <div className={classes.rowHeader}>
      <div className={classes.rowData}>
        <div className={`${classes.cell} ${classes.name} ${classes.cellHeader}`}>
          <span>Model Name <Icon type='minus'/></span>
        </div>
        <div className={`${classes.cell} ${classes.name} ${classes.cellHeader}`}>
          <span>Score <Icon type='minus'/></span>
        </div>
        <div className={`${classes.cell} ${classes.name} ${classes.cellHeader}`}>
          <span>Contamination Rate <Icon type='minus'/></span>
        </div>
        <div className={`${classes.cell} ${classes.name} ${classes.cellHeader}`}>
          <span>Variable Impact</span>
        </div>
        <div className={`${classes.cell} ${classes.name} ${classes.cellHeader}`}>
          <span>Model Process Flow</span>
        </div>
      </div>
    </div>
    <div className={classes.rowBox}>
      <div className={classes.rowData}>
        <div className={`${classes.cell}`}>
          <span>IsolationForest.custom20190429_12:23:12</span>
        </div>
        <div className={`${classes.cell}`}>
          <span>0.5</span>
        </div>
        <div className={`${classes.cell}`}>
          <span>X</span>
        </div>
        <div className={`${classes.cell} ${classes.compute}`}>
          <span><img src={'/static/modeling/Variable.svg'} alt=""/> Compute</span>
        </div>
        <div className={`${classes.cell} ${classes.compute}`}>
          <span><img src={'/static/modeling/Process.svg'} alt=""/> Compute</span>
        </div>
      </div>
      <VariableImpact model={sampleModel}/>
      <div className={classes.rowData}>
        <div className={`${classes.cell}`}>
          <span>IsolationForest.custom20190429_12:23:12</span>
        </div>
        <div className={`${classes.cell}`}>
          <span>0.5</span>
        </div>
        <div className={`${classes.cell}`}>
          <span>X</span>
        </div>
        <div className={`${classes.cell} ${classes.compute}`}>
          <span><img src={'/static/modeling/Variable.svg'} alt=""/> Compute</span>
        </div>
        <div className={`${classes.cell} ${classes.compute}`}>
          <span><img src={'/static/modeling/Process.svg'} alt=""/> Compute</span>
        </div>
      </div>
      <ModelProcessFlow model={sampleModel}/>
    </div>
  </div>
}

const ClusteringTable = () => {
  const classes = useStyles();
  return <div className={classes.table}>
    <div className={classes.rowHeader}>
      <div className={classes.rowData}>
        <div className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader}`}>
          <span>Model Name <Icon type='minus'/></span>
        </div>
        <div className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader}`}>
          <span>CVNN <Icon type='minus'/> <Hint content='123321'/></span>
        </div>
        <div className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader}`}>
          <span>Sihouette Score <Icon type='minus'/> <Hint content='123321'/></span>
        </div>
        <div className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader}`}>
          <span>CH Index <Icon type='minus'/> <Hint content='123321'/></span>
        </div>
        <div className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader}`}>
          <span>R squared <Icon type='minus'/> <Hint content='123321'/></span>
        </div>
        <div className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader}`}>
          <span>#clusters <Icon type='minus'/> <Hint content='123321'/></span>
        </div>
        <div className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader}`}>
          <span>Variable Impact</span>
        </div>
        <div className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader}`}>
          <span>Model Process Flow</span>
        </div>
        <div className={`${classes.ccell} ${classes.cname} ${classes.ccellHeader}`}>
          <span>Explaination</span>
        </div>
      </div>
    </div>
    <div className={classes.rowBox}>
      <div className={classes.rowData}>
        <div className={`${classes.ccell}`}>
          <span>IsolationForest.custom20190429_12:23:12</span>
        </div>
        <div className={`${classes.ccell}`}>
          <span>0.57</span>
        </div>
        <div className={`${classes.ccell}`}>
          <span>X</span>
        </div>
        <div className={`${classes.ccell}`}>
          <span>X</span>
        </div>
        <div className={`${classes.ccell}`}>
          <span>X</span>
        </div>
        <div className={`${classes.ccell}`}>
          <span>4</span>
        </div>
        <div className={`${classes.ccell} ${classes.compute}`}>
          <span><img src={'/static/modeling/Variable.svg'} alt=""/> Compute</span>
        </div>
        <div className={`${classes.ccell} ${classes.compute}`}>
          <span><img src={'/static/modeling/Process.svg'} alt=""/> Compute</span>
        </div>
        <div className={`${classes.ccell} ${classes.compute}`}>
          <span><img src={'/static/modeling/Variable.svg'} alt=""/> Compute</span>
        </div>
      </div>
      <VariableImpact model={sampleModel}/>
      <div className={classes.rowData}>
        <div className={`${classes.ccell}`}>
          <span>IsolationForest.custom20190429_12:23:12</span>
        </div>
        <div className={`${classes.ccell}`}>
          <span>0.57</span>
        </div>
        <div className={`${classes.ccell}`}>
          <span>X</span>
        </div>
        <div className={`${classes.ccell}`}>
          <span>X</span>
        </div>
        <div className={`${classes.ccell}`}>
          <span>X</span>
        </div>
        <div className={`${classes.ccell}`}>
          <span>4</span>
        </div>
        <div className={`${classes.ccell} ${classes.compute}`}>
          <span><img src={'/static/modeling/Variable.svg'} alt=""/> Compute</span>
        </div>
        <div className={`${classes.ccell} ${classes.compute}`}>
          <span><img src={'/static/modeling/Process.svg'} alt=""/> Compute</span>
        </div>
        <div className={`${classes.ccell} ${classes.compute}`}>
          <span><img src={'/static/modeling/Variable.svg'} alt=""/> Compute</span>
        </div>
      </div>
      <ModelProcessFlow model={sampleModel}/>
    </div>
  </div>
}
