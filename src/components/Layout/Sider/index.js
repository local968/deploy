import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import logo from './rsquared_logo_website.svg';
import home from './icon-home.svg';
import homeActive from './icon-home-active.svg';
import help from './icon-help.svg';
import helpActive from './icon-help-active.svg';
import community from './community.png'
import switchIcon from './switch.svg';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router';
import EN from '../../../constant/en';
import { message, Icon } from 'antd';

const errorTip = message.error;

@withRouter
@inject('userStore', 'deploymentStore', 'routing')
@observer
export default class Sider extends Component {
  state = {
    labUrl: '',
    logoUrl:'',
    dashUrl:''
  };

   componentDidMount() {
    axios.get('/jupyterLabUrl')
      .then(({ data }) => this.setState({ labUrl: data }))
      .catch(({ response: { data } }) => errorTip(data))

    axios.get('/dashboardUrl')
      .then(({ data }) => this.setState({ dashUrl: data }))
      .catch(({ response: { data } }) => errorTip(data))
    axios.get('/image/logo')
      .then(({data}) => this.setState({logoUrl:data}))
  }

  render() {
    const { labUrl, dashUrl,logoUrl } = this.state;
    const { userStore, routing } = this.props;
    const isLogin = userStore.status === 'login';
    // const jupyterLabUrl = process.env.JUPYTER_LAB || 'http://192.168.0.23:18888/lab';
    const isDeploy = routing.location.pathname.includes('deploy');
    const isSupport = routing.location.pathname.includes('support');
    
    const {support=true,JupyterLab=true,project=true} = userStore.info.role;
  
    return (
      <aside className={styles.sider}>
        <div className={styles.logo}>
          <img className={styles.logoImg} src={logoUrl} alt="logo"/>
          {/*<img className={styles.logoImg} src={logo} alt="logo"/>*/}
          {/* <h2 className={styles.mrone}>R2 Learn</h2> */}
        </div>
        <div className={styles.menus}>
          <a
            className={styles.home}
            style={{display:(project?'':'none')}}
            onClick={() =>
              isDeploy && isLogin ? routing.push('/deploy') : routing.push('/')
            }
          >
            {!isSupport ? <img alt="home" src={homeActive} /> : <img alt="home" src={home} />}
            <h4 className={classnames(styles.nav, {
              [styles.active]: !isSupport
            })}>{EN.Home}</h4>
          </a>
          <a className={styles.support}
             style={{display:(support?'':'none')}}
             onClick={() => {
               routing.push('/support')
             }}>
            {isSupport ? <img alt="support" src={helpActive}/> : <img alt="support" src={help}/>}
            <h4 className={classnames(styles.nav, {
              [styles.active]: isSupport
            })}>{EN.Support}</h4>
        </a>
          <a className={styles.support}
             style={{display:(JupyterLab?'':'none')}}
             onClick={() => labUrl && window.open(labUrl, '_blank')}>
            <img alt="support" src={community} className={styles.community}/>
            <h4 className={styles.nav}>JupyterLab</h4>
          </a>
          <a className={styles.support} onClick={() => dashUrl && window.open(dashUrl, '_blank')}>
            <Icon style={{ fontSize: '32px', color: '#2987a4', marginBottom: '5px' }} type="dashboard" />
            <h4 className={styles.nav}>Dashboard</h4>
          </a>

        </div>
        <a className={styles.bottom} onClick={this.switchClick}>
          <img alt="switch" src={switchIcon} />
          {isDeploy || !isLogin ? (
            <h4 className={styles.nav}>
              {EN.Model}<br />{EN.TrainingS}
            </h4>
          ) : (
              <h4 className={styles.nav}>
                {EN.Deployments}<br />{EN.Console}
              </h4>
            )}
        </a>
      </aside>
    );
  }

  switchClick = () => {
    const { location, deploymentStore, userStore, routing } = this.props;
    const isDeploy = routing.location.pathname.includes('deploy');
    const userId = userStore.info.id;
    if (location.pathname.indexOf('/deploy/project/') !== -1) {
      const deploymentId = location.pathname.split('/')[3];
      const projectId = deploymentStore.deployments.find(d => d.id === parseInt(deploymentId, 10)).projectId;
      routing.push('/project/' + projectId);
      return;
    }

    isDeploy || !userId ? routing.push('/') : routing.push('/deploy');
  };
}
