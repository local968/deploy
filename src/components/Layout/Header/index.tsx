import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';

import WelcomeHeader from './WelcomeHeader'
import NormalHeader from './NormalHeader'
import ProjectHeader from './ProjectHeader'
import LoginHeader from './LoginHeader'
import { RouterStore } from 'mobx-react-router';
import { UserStore } from 'stores/UserStore';
import { History } from 'history';

interface HeaderProps {
  history: History,
  userStore: UserStore,
  routing: RouterStore
}

@inject('userStore', 'routing')
@observer
class Header extends Component<HeaderProps> {
  constructor(props) {
    super(props)
  }

  render() {
    const isHome = this.props.history.location.pathname === '/';
    const isDeploy = this.props.history.location.pathname.startsWith('/deploy');
    const isLogin = this.props.userStore.status === 'login';
    const isProject = this.props.history.location.pathname.startsWith('/project')
    if (!isLogin)
      return (
        <LoginHeader
          pathname={this.props.routing.location.pathname}
          routing={this.props.routing}
        />
      );
    if (isHome) return <WelcomeHeader />;
    if (isDeploy) return <NormalHeader />;
    if (isProject) return <ProjectHeader />;
    return <WelcomeHeader />
  }
}

export default withRouter(Header)
