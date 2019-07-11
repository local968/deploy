import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import { observable } from 'mobx';
import styles from './styles.module.css';
import EN from '../../constant/en';
import moment from 'moment';
import checkedIcon from './checked.svg';
import deleteIcon from './delete.svg';
import classnames from 'classnames'
import { Show } from 'components/Common';

interface Interface {
  selectId:any
  selected:any
  project:any
  actions:any
  routing?:any
}

@inject('routing')
@observer
export default class Project extends Component<Interface> {
  @observable cover = false;

  hideCover = () => {
    this.cover = false;
  };

  showCover = () => {
    this.cover = true;
  };

  toggleSelect = () => {
    //统计总数
    this.props.selectId(this.props.selected, this.props.project.id);
  };

  handleOpen = () => {
    this.props.routing.push('/project/' + this.props.project.id);
  };

  render() {
    const { project, actions, selected } = this.props;
    return (
      <div
        className={styles.project}
        onMouseEnter={this.showCover}
        onMouseLeave={this.hideCover}
      >
        <div className={styles.info}>
          <div className={styles.name}>{project.name}</div>
          <div className={styles.description}>{project.description}</div>
        </div>
        <div className={styles.sub}>
          <div className={styles.partner}>
            {project.id} {project.fileName}
          </div>
          <div className={styles.time}>
            {EN.CreatedDate}: {moment.unix(project.createTime).fromNow()}
          </div>
        </div>
        <div
          className={classnames(styles.cover, {
            [styles.active]: this.cover || selected,
          })}
        >
          <Show
            name = 'main_delete'
          >
            <div
              className={styles.actionBox}
            >
              <div className={styles.select}>
                {this.props.selected ? (
                  <img
                    className={styles.checked}
                    onClick={this.toggleSelect}
                    src={checkedIcon}
                    alt="checked"
                  />
                ) : (
                  <div className={styles.circle} onClick={this.toggleSelect} />
                )}
              </div>
              <div className={styles.action}>
                <img
                  onClick={actions.bind(null, 'delete', project.id)}
                  src={deleteIcon}
                  alt="delete"
                />
              </div>
            </div>
          </Show>

          <div className={styles.openBox}>
            <div className={styles.open} onClick={this.handleOpen}>
              <span>{EN.Open}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
