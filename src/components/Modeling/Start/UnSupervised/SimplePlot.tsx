import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { observable } from 'mobx';
import request from 'components/Request'

interface SimplePlotInterface {
  path:string
  // getPath:any
  isNew:any
}
@observer
export default class SimplePlot extends Component<SimplePlotInterface> {
  @observable visible = false;
  @observable result = {};
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.getData();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.path !== this.props.path) {
      this.getData(nextProps);
    }
  }

  getData(props = this.props) {
    const { path, isNew } = props;
    if (isNew && !path) return;
    if (!isNew) {
      return (this.visible = true);
    }
    if (isNew && path) {
      request
        .post({
          url: '/graphics/new',
          data: {
            url: path,
          },
        })
        .then(res => {
          this.result = res;
          this.visible = true;
        });
    }
  }

  render() {
    const { children, isNew } = this.props;
    if (!this.visible) return null;
    if (!isNew) {
      return children;
    }
    const cloneEl = el => React.cloneElement(el, { ...this.result });
    return Array.isArray(children) ? children.map(cloneEl) : cloneEl(children);
  }
}
