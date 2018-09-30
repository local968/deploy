import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import addProjectIcon from './combined-shape-copy.svg';
import deleteIcon from './delete.svg';
import duplicateIcon from './duplicate.svg';
import shareIcon from './share.svg';
import deleteDarkIcon from './delete-dark.svg';
import duplicateDarkIcon from './duplicate-dark.svg';
import shareDarkIcon from './share-dark.svg';
import checkedIcon from './checked.svg';
import { Search, Select, Pagination } from 'components/Common';
import { inject, observer } from 'mobx-react';
import moment from 'moment';
import { Modal, Button } from 'antd';

import axios from 'axios';
import { observable } from 'mobx';

@inject('routing', 'projectStore')
@observer
export default class Home extends Component {
    @observable ids = []
    @observable isShow = false
    @observable selected = false
    @observable deleteNames = []
    @observable deleteIds = []
    @observable visible = false

    constructor(props) {
        super(props);
        //设置为英文
        moment.locale('en');
        this.acts = {
            share: (ids) => {
                return;
            },
            duplicate: (ids) => {
                return;
            },
            delete: (ids) => {
                const deleteNames = this.props.projectStore.list.filter(project => {
                    return ids.includes(project.id);
                }).map(project => project.name);
                this.setState({
                    deleteNames: deleteNames,
                    deleteIds: ids,
                    visible: true
                })
            }
        };
        window.axios = axios;
    }

    selectId = (isSelect, id) => {
        let ids;
        if (isSelect) {
            ids = this.ids.filter(v => v !== id);
        } else {
            ids = [...this.ids, id];
        }
        this.ids = ids
        this.isShow = !!ids.length
    }

    toggleSelect = () => {
        this.selected = !this.selected
    }

    removeSelected = () => {
        this.ids = []
        this.isShow = false
    }

    actions = (act, ids) => {
        if (!Array.isArray(ids)) {
            ids = [ids]
        }

        console.log(act, ids);
        this.acts[act](ids);
    }

    handleOk = () => {
        const { ids, deleteIds } = this;
        const newIds = ids.filter(id => !deleteIds.includes(id));
        this.props.projectStore.deleteProjects(deleteIds)

        this.visible = false
        this.deleteIds = []
        this.ids = newIds
        this.isShow = !!newIds.length
    }

    handleCancel = () => {
        this.visible = false
    }

    handleAdd = () => {
        this.props.projectStore.addProject().then(data => {
            if (data.error) return alert(data.error)
            this.props.routing.push(`/project/${data.id}`);
        });
    }

    render() {
        const { projectStore } = this.props;
        const { toolsOption, total, list: sortProjects, changeOption, changePage } = projectStore;
        return <div className={classnames(styles.home)} >
            <Tools toolsOption={toolsOption} total={total} changeOption={changeOption} changePage={changePage} />
            <div className={classnames(styles.projects)}>
                <div className={classnames(styles.project, styles.newProject)} onClick={this.handleAdd}>
                    <img src={addProjectIcon} alt="New Project" />
                    <span>Create New Project</span>
                </div>
                {sortProjects.map((project) => {
                    return <Project project={project} selectId={this.selectId} actions={this.actions} key={"project-" + project.id} selected={this.ids.includes(project.id)} />
                })}
            </div>
            {this.isShow && <Bar toggleSelect={this.removeSelected} ids={this.ids} actions={this.actions} selected={this.selected} />}
            <Modal
                title={`Delete Project${this.deleteIds.length > 1 ? "s" : ""}: ${this.deleteNames.join(" , ")}`}
                visible={this.visible && !!this.deleteIds.length}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
                footer={<div style={{ textAlign: "center" }}>
                    <Button onClick={this.handleCancel}>No, thanks</Button>,
                    <Button type="primary" onClick={this.handleOk}>Yes, delete</Button>,
                </div>}
            >
                <h4 style={{ padding: '3em' }} >Are you sure to delete project{this.deleteIds.length > 1 ? "s" : ""} : {this.deleteNames.join(" , ")} ?</h4>
            </Modal>
        </div>
    }
}

@inject('routing')
@observer
class Project extends Component {
    @observable cover = false

    hideCover = () => {
        this.cover = false
    }

    showCover = () => {
        this.cover = true
    }

    toggleSelect = () => {
        //统计总数
        this.props.selectId(this.props.selected, this.props.project.id);
    }

    handleOpen = () => {
        this.props.routing.push("/project/" + this.props.project.id);
    }

    render() {
        const { project, actions } = this.props;
        return <div className={styles.project} onMouseEnter={this.showCover} onMouseLeave={this.hideCover}>
            <div className={styles.info}>
                <div className={styles.name}>{project.name}</div>
                <div className={styles.description}>{project.description}</div>
            </div>
            <div className={styles.sub}>
                <div className={styles.partner}>{project.id} {project.uploadFileName}</div>
                <div className={styles.time}>Create Date: {moment.unix(project.createTime).fromNow()}</div>
            </div>
            <div className={classnames(styles.cover, {
                [styles.active]: this.cover
            })}>
                <div className={styles.actionBox}>
                    <div className={styles.select}>
                        {
                            this.props.selected ?
                                <img className={styles.checked} onClick={this.toggleSelect} src={checkedIcon} alt="checked" /> :
                                <div className={styles.circle} onClick={this.toggleSelect}></div>
                        }
                    </div>
                    <div className={styles.action}>
                        <img onClick={actions.bind(null, "share", project.id)} src={shareIcon} alt="share" />
                        <img onClick={actions.bind(null, "duplicate", project.id)} src={duplicateIcon} alt="duplicate" />
                        <img onClick={actions.bind(null, "delete", project.id)} src={deleteIcon} alt="delete" />
                    </div>
                </div>
                <div className={styles.openBox}>
                    <div className={styles.open} onClick={this.handleOpen}>
                        <span>OPEN</span>
                    </div>
                </div>
            </div>
        </div>
    }
}

@observer
class Tools extends Component {
    render() {
        const { toolsOption, total, changeOption, changePage } = this.props;
        return <div className={styles.tools}>
            <Search
                value={toolsOption.keywords}
                onChange={changeOption.bind(null, "keywords")}
            />
            <Select
                title="Sort by"
                autoWidth={null}
                options={{
                    createTime: 'Last Created',
                    updateTime: 'Last Modified',
                    // progressUp: 'Progress 1 - 4',
                    // progressDown: 'Progress 4 - 1',
                    // aToz: 'A - Z',
                    // zToa: 'Z - A'
                }}
                value={toolsOption.sort}
                onChange={changeOption.bind(null, "sort")}
            />
            <Select
                title="Projects  perpage"
                autoWidth
                options={{
                    5: 5,
                    10: 10,
                    20: 20
                }}
                value={toolsOption.limit}
                onChange={changeOption.bind(null, "limit")}
            />
            <Pagination
                current={toolsOption.current}
                pageSize={toolsOption.limit}
                total={total}
                onChange={changePage}
            />
        </div>
    }
}

@observer
class Bar extends Component {
    render() {
        const { toggleSelect, ids, actions } = this.props
        return <div className={styles.bar}>
            <div className={styles.select}>
                <img className={styles.checked} onClick={toggleSelect} src={checkedIcon} alt="checked" />
                <span><span className={styles.count}>{ids.length}</span> Screen Selected</span>
            </div>
            <div className={styles.action}>
                <img onClick={actions.bind(null, "share", ids)} src={shareDarkIcon} alt="share" />
                <img onClick={actions.bind(null, "duplicate", ids)} src={duplicateDarkIcon} alt="duplicate" />
                <img onClick={actions.bind(null, "delete", ids)} src={deleteDarkIcon} alt="delete" />
            </div>
        </div>
    }
}