import React, {Component} from "react";
import styles from "./styles.module.css";
import {Tree, Input, message, Tabs, Icon} from "antd";
import {observable, action, toJS} from "mobx";
import {observer, inject} from "mobx-react";
import Article from './articleCH';
import classnames from "classnames";
import axios from "axios"
import EN from '../../constant/en';

const {TreeNode, DirectoryTree} = Tree;
const TextArea = Input.TextArea
const _data = observable({
  selectedKeys: ["1.1"],
  expandedKeys: ["1"],
  waiting: false,
  type: 1,
  text: '',
  email: ''
});

Icon.setTwoToneColor('#1d2b3c');

const _change = action((name, value) => (_data[name] = value));

const TabPane = Tabs.TabPane;

const isEN = false;

const videoData = [
  {
    id: '1',
    name: EN.R2LearnTutorialVideo
  }
];

// const videoData = [
//   {
//     id: '1',
//     name:'R2-Learn Tutorial Video (English)'
//   },
//   {
//     id: '2',
//     name:'R2-Learn Tutorial Video (Chinese)'
//   }
// ];


@inject('userStore')
@observer
export default class Support extends Component {

  waiting = false;

  constructor(props) {
    super(props);
    this.changeSelectedKeys = this.changeSelectedKeys.bind(this);
    this.onSelect = this.onSelect.bind(this);
    _change('email', props.userStore.info.email)

    if (this.props.location.state && this.props.location.state.key === 'loginTo') {
      this.props.userStore.change('tabKey')('2');
    } else {
      this.props.userStore.change('tabKey')('1');
    }

  }

  componentWillUnmount(props) {
    this.props.userStore.change('videoKey')('1');
    _change("type", 1)
  }

  onSelect(selectedKeys) {
    _change("selectedKeys", selectedKeys);
    this.waiting = true;
    setTimeout(() => {
      this.waiting = false;
    }, 500);
    window.location.hash = selectedKeys[0];
  }

  changeSelectedKeys(selectedKeys) {
    if (!this.waiting) {
      const expandedKeys = toJS(_data.expandedKeys);
      this.changeSK(expandedKeys, selectedKeys)
    }
  }

  changeSK(expandedKeys, selectedKeys) {
    if (selectedKeys.length === 1) {
      _change("selectedKeys", [selectedKeys]);
      return
    }

    if (expandedKeys.includes(selectedKeys)) {
      _change("selectedKeys", [selectedKeys]);
    } else if (selectedKeys) {
      const s = selectedKeys.substring(0, selectedKeys.length - 2);
      if (expandedKeys.includes(s)) {
        _change("selectedKeys", [selectedKeys]);
        return
      }

      if (s.length === 1) {
        _change("selectedKeys", [s]);
        return
      }
      this.changeSK(expandedKeys, s)
    }
  }

  _onExpand(expandedKeys) {
    _change("expandedKeys", expandedKeys);
  }

  changeType(type) {
    _change("type", type)
  }

  handleChangeArea(e) {
    _change("text", e.target.value)
  }

  handleChange(e) {
    _change("email", e.target.value)
  }

  tabClick = (key) => {
    this.props.userStore.change('tabKey')(key);
    this.props.userStore.change('videoKey')('1');
  }

  topTabsClick = (type) => {
    _change("type", parseInt(type, 10))
  }

  changeVideo = (id) => {
    return () => {
      this.props.userStore.change('videoKey')(id);
      if (id === '1') {
        this.sourceChange.src = require('./resource/English_video.mp4');
        this.videoChange.load();
      } else {
        this.sourceChange.src = require('./resource/Chinese_video.mp4');
        this.videoChange.load();
      }
    }
  }

  submit() {
    const {email, type, text} = toJS(_data)
    const typeText = (type === 1 && 'Bug') || (type === 2 && 'Feature') || (type === 3 && 'Question') || ''
    if (!typeText) return
    if (!text) return
    if (!email) return
    axios.post("/user/report", {type: typeText, text, email}).then(res => {
      if (res.status === 200) {
        _change('email', this.props.userStore.info.email)
        _change('text', '')
        _change('type', 1)
        message.success(EN.Reportsuccess)
      } else {
        message.error((res.data || {}).message || EN.Reporterror)
      }
    }).catch(() => window.stores.userStore._status())
  }

  render() {
    const selectedKeys = toJS(_data.selectedKeys);
    const expandedKeys = toJS(_data.expandedKeys);
    return (
      <section style={{width: "100%", background: '#fff'}}>
        <div className={styles.main}>
          <div className={styles.support}>
            <div className={styles.report}>
              <div className={styles.types}>
                <Tabs defaultActiveKey="1" onChange={this.topTabsClick}>
                  <TabPane tab={EN.ReportBug} key={1}>{}</TabPane>
                  <TabPane tab={EN.RequestFeature} key={2}>{}</TabPane>
                  <TabPane tab={EN.AskQuestion} key={3}>{}</TabPane>
                </Tabs>
              </div>
              <div className={styles.text}>
                <TextArea className={styles.textArea} rows={4} value={_data.text} onChange={this.handleChangeArea}/>
              </div>
              <div className={styles.email}>
                <Input placeholder='Enter your email' value={_data.email} onChange={this.handleChange} disabled/>
              </div>
              <div className={styles.button}>
                <div className={classnames(styles.type, styles.checked)} onClick={this.submit.bind(this)}>
                  <span>{EN.Submit}</span>
                </div>
              </div>
            </div>
            <div className={styles.menu}>
              <Tabs defaultActiveKey={this.props.userStore.tabKey} onChange={this.tabClick}>
                <TabPane tab={EN.UserManual} key="1">
                  <DirectoryTree
                    showLine
                    onSelect={this.onSelect}
                    selectedKeys={selectedKeys}
                    expandedKeys={expandedKeys}
                    // defaultExpandedKeys={['1']}
                    onExpand={this._onExpand}
                    // expandedKeys={expandedKeys}
                    // autoExpandParent={autoExpandParent}
                  >

                    <TreeNode title={EN.Overview} key="1">
                      <TreeNode title={EN.Machinelearning} key="1.1"/>
                      <TreeNode title={EN.MachinewithR2} key="1.2"/>
                    </TreeNode>

                    <TreeNode title={EN.GettingstartedwithR2} key="2">
                      <TreeNode title={EN.Softwarerequirements} key="2.1"/>
                      <TreeNode title={EN.ImportingdataR2} key="2.2">

                        <TreeNode
                          title={EN.Importingdatadatabase}
                          key="2.2.1"
                        />

                        <TreeNode title={EN.Importinglocalfile} key="2.2.2"/>
                      </TreeNode>
                      <TreeNode title={EN.Projecthome} key="2.3"/>
                      <TreeNode title={EN.HomepageDeployment} key="2.4"/>
                    </TreeNode>

                    <TreeNode title={EN.Startingproject} key="3">
                      <TreeNode title={EN.Createproject} key="3.1"/>
                      <TreeNode title={EN.Chooseyourproblem} key="3.2"/>
                      <TreeNode title={EN.Workingwithyour} key="3.3">
                        <TreeNode title={EN.DataConnect} key="3.3.1"/>
                        <TreeNode title={EN.DataSchema} key="3.3.2"/>
                        <TreeNode title={EN.DataQuality} key="3.3.3">
                          <TreeNode title={EN.CommonIssues} key="3.3.3.1"/>
                          <TreeNode title={EN.TargetVariableQuality} key="3.3.3.2"/>
                          <TreeNode title={EN.PredictorVariablesQuality} key="3.3.3.3"/>
                        </TreeNode>
                      </TreeNode>
                      <TreeNode title={EN.Modeling} key="3.4">
                        <TreeNode title={EN.AutomaticModeling} key="3.4.1"/>
                        <TreeNode title={EN.AdvancedModeling} key="3.4.2"/>
                        <TreeNode title={EN.Buildingyourmodelg} key="3.4.3">
                          <TreeNode title={EN.ModelSelection} key="3.4.3.1"/>
                        </TreeNode>
                      </TreeNode>
                    </TreeNode>

                    <TreeNode title={EN.Deployingyourmodels} key="4">
                      <TreeNode title={EN.Deployments} key="4.1">
                        <TreeNode title={EN.Predictwithdata} key="4.1.1"/>
                      </TreeNode>
                      <TreeNode title={EN.Monitoryourdeployed} key="4.2">
                        <TreeNode title={EN.OperationMonitor} key="4.2.1"/>
                        <TreeNode title={EN.Monitor} key="4.2.2"/>
                        <TreeNode title={EN.PerformanceStatus} key="4.2.3"/>
                      </TreeNode>
                    </TreeNode>

                    <TreeNode title={EN.AppendixQuality} key="a">
                      <TreeNode title={EN.Fixingoutliers} key="a.1"/>
                      <TreeNode title={EN.Fixingmissingvalues} key="a.2"/>
                      <TreeNode title={EN.Fixingdatamismatch} key="a.3"/>
                    </TreeNode>

                    <TreeNode title={EN.AppendixAdvancedModeling} key="b">
                      <TreeNode title={EN.AdvancedVariableSettings} key="b.1"/>
                      <TreeNode title={EN.AdvancedModelingSetting} key="b.2">
                        <TreeNode title={EN.ModelSettingdefault} key="b.2.1"/>
                        <TreeNode title={EN.SelectAlgorithm} key="b.2.2"/>
                        <TreeNode title={EN.SetMaxModelEnsemble} key="b.2.3"/>
                        <TreeNode title={EN.TrainValidationHoldoutValidation} key="b.2.4"/>
                        <TreeNode title={EN.ResamplingSetting} key="b.2.5"/>
                        <TreeNode title={EN.SetMeasurementMetric} key="b.2.6"/>
                        <TreeNode title={EN.SetSpeedvsAccuracy} key="b.2.7"/>
                        <TreeNode title={EN.RandomSeed} key="b.2.8"/>
                      </TreeNode>
                    </TreeNode>

                    <TreeNode title={EN.AppendixModelselection} key="c">
                      <TreeNode title={EN.Simplifiedview} key="c.1"/>
                      <TreeNode title={EN.AdvancedView} key="c.2">
                        <TreeNode title={EN.ModelComparisonCharts} key="c.2.1"/>
                        <TreeNode title={EN.TableofModels} key="c.2.2"/>
                        <TreeNode title={EN.AdditionalModelDetails} key="c.2.3"/>
                      </TreeNode>
                    </TreeNode>

                    <TreeNode title={EN.AppendixModelselectionD} key="d">
                      <TreeNode title={EN.SimplifiedView} key="d.1"/>
                      <TreeNode title={EN.AdvancedView} key="d.2">
                        {/*<TreeNode title="Top Section" key="d.2.1" />*/}
                        <TreeNode title={EN.TableofModels} key="d.2.1"/>
                        <TreeNode title={EN.AdditionalModelDetails} key="d.2.2"/>

                      </TreeNode>
                    </TreeNode>
                  </DirectoryTree></TabPane>
                <TabPane tab={EN.TutorialVideo} key="2">
                  {
                    videoData.map((val) => {
                      return (
                        <div onClick={this.changeVideo(val.id)}
                             key={val.id}
                             className={this.props.userStore.videoKey !== val.id ? styles.tabLeft : styles.tabLeftAction}>
                          {
                            this.props.userStore.videoKey !== val.id ?
                              <img src={require('./resource/video.png')} alt=""/> :
                              <Icon type="play-circle"
                                    theme="twoTone"/>
                          }
                          <span>{val.name}</span>
                        </div>
                      )
                    })
                  }
                </TabPane>
              </Tabs>
            </div>
          </div>
          <div className={styles.content}>
            {
              this.props.userStore.tabKey === '1' ?
                <Article
                  changeSelectedKeys={this.changeSelectedKeys}
                /> :
                <video ref={child => this.videoChange = child} className={styles.tabVideo} controls={true} autobuffer="true">
                  <source
                    ref={child => this.sourceChange = child}
                    src={isEN ? require('./resource/English_video.mp4') : require('./resource/Chinese_video.mp4')}
                    type='video/mp4; codecs="avc1.42E01E, mp4a.40.2"'/>
                </video>
            }
          </div>
        </div>
      </section>
    );
  }
}
