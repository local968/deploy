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
import {Modal, Button} from 'antd';

import axios from 'axios';

@inject('userStore', 'routing')
@observer
export default class Home extends Component {
    constructor(props){
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
                const deleteNames = this.props.userStore.projects.filter(project => {
                    return ids.includes(project.projectId);
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

    

    state = {
        ids: [],
        isShow: false,
        isScorll: false,
        selected: false,
        deleteNames: [],
        deleteIds: [],
        visible: false
    }

    componentDidUpdate() {
        //重置滚动条
        this.resetScorll();
    }

    resetScorll = () => {
        const projectsDom = document.getElementsByClassName(styles.projects)[0];
        if(!this.state.isScorll && projectsDom.clientHeight < projectsDom.scrollHeight){
            this.setState({
                isScorll: true
            })
        }
        if(this.state.isScorll && projectsDom.clientHeight >= projectsDom.scrollHeight){
            this.setState({
                isScorll: false
            })
        }
    }

    selectId = (isSelect, id) => {
        let ids;
        if(isSelect){
            ids = this.state.ids.filter(v => v!==id);
        }else{
            ids = [...this.state.ids,id];
        }
        this.setState({
            ids: ids,
            isShow: !!ids.length
        })
    }

    toggleSelect = () => {
        this.setState({
            selected: !this.state.selected,
        })
    }

    removeSelected = () => {
        this.setState({
            ids: [],
            isShow: false
        })
    }

    actions = (act, ids) => {
        if(!Array.isArray(ids)){
            ids = [ids]
        }

        console.log(act, ids);
        this.acts[act](ids);
    }

    handleOk = () => {
        const {ids, deleteIds} = this.state;
        const newIds = ids.filter(id => !deleteIds.includes(id));
        this.props.userStore.deleteProjects(deleteIds)
        this.setState({
            visible: false,
            deleteIds: [],
            ids: newIds,
            isShow: !!newIds.length
        });
    }

    handleCancel = () => {
        this.setState({
            visible: false,
        });
    }

    handleAdd = () => {
        const projectId = this.props.userStore.getNextId();
        this.props.userStore.addProject();
        this.props.routing.push(`/project/${projectId}`);
    }

    render() {
        const {userStore} = this.props;
        const {toolsOption, total, sortProjects, changeOption} = userStore;
        return <div className={classnames(styles.home)} >
            <Tools toolsOption={toolsOption} total={total} changeOption={changeOption.bind(userStore)} />
            <div className={classnames(styles.projects, {
                [styles.scrollY]: this.state.isScorll
            })}>
                <div className={classnames(styles.project, styles.newProject)} onClick={this.handleAdd}>
                    <img src={addProjectIcon} alt="New Project" />
                    <span>Create New Project</span>
                </div>
                {sortProjects.map((project) => {
                    return <Project project={project} selectId={this.selectId} actions={this.actions} key={"project-"+project.projectId} selected={this.state.ids.includes(project.projectId)} />
                })}
            </div>
            {this.state.isShow && <Bar toggleSelect={this.removeSelected} ids={this.state.ids} actions={this.actions} selected={this.state.selected} />}
            <Modal
                title={`Delete Project${this.state.deleteIds.length>1?"s":""}: ${this.state.deleteNames.join(" , ")}`}
                visible={this.state.visible && !!this.state.deleteIds.length}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
                footer={<div style={{textAlign: "center"}}>
                    <Button onClick={this.handleCancel}>No, thanks</Button>,
                    <Button type="primary" onClick={this.handleOk}>Yes, delete</Button>,
                </div>}
                >
                <h4 style={{padding: '3em'}} >Are you sure to delete project{this.state.deleteIds.length>1?"s":""} : {this.state.deleteNames.join(" , ")} ?</h4>
            </Modal>
        </div>
    }
}

@inject('routing')
@observer
class Project extends Component{
    state = {
        cover: false,
        // selected: false
    }

    hideCover = () => {
        this.setState({
            cover: false
        })
    }

    showCover = () => {
        this.setState({
            cover: true
        })
    }

    toggleSelect = () => {
        //统计总数
        this.props.selectId(this.state.selected, this.props.project.projectId);
    }

    handleOpen = () => {
        this.props.routing.push("/project/"+this.props.project.projectId);
    }

    render(){
        const {project,actions} = this.props;
        return <div className={styles.project} onMouseEnter={this.showCover} onMouseLeave={this.hideCover}>
            <div className={styles.info}>
                <div className={styles.name}>{project.name}</div>
                <div className={styles.description}>{project.description}</div>
            </div>
            <div className={styles.sub}>
                <div className={styles.partner}>{project.projectId} {project.uploadFileName}</div>
                <div className={styles.time}>Create Date: {moment(+new Date(project.createdAt)).fromNow()}</div>
            </div>
            <div className={classnames(styles.cover,{
                [styles.active]: this.state.cover
            })}>
                <div className={styles.actionBox}>
                    <div className={styles.select}>
                        {
                            this.props.selected?
                            <img className={styles.checked} onClick={this.toggleSelect} src={checkedIcon} alt="checked"/> :
                            <div className={styles.circle} onClick={this.toggleSelect}></div>
                        }
                    </div>
                    <div className={styles.action}>
                        <img onClick={actions.bind(null, "share", project.projectId)} src={shareIcon} alt="share"/>
                        <img onClick={actions.bind(null, "duplicate", project.projectId)} src={duplicateIcon} alt="duplicate"/>
                        <img onClick={actions.bind(null, "delete", project.projectId)} src={deleteIcon} alt="delete"/>
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

const Tools = ({toolsOption, total, changeOption}) => {
    return <div className={styles.tools}>
        <Search 
            value={toolsOption.keywords}
            onChange={changeOption.bind(null,"keywords")}
        /> 
        <Select
            title="Sort by"
            autoWidth={null}
            options={{
                createdDate: 'Last Created',
                updatedDate: 'Last Modified',
                progressUp: 'Progress 1 - 4',
                progressDown: 'Progress 4 - 1',
                aToz: 'A - Z',
                zToa: 'Z - A'
            }}
            value={toolsOption.sort}
            onChange={changeOption.bind(null,"sort")}
        />
        <Select
            title="Projects  perpage"
            autoWidth
            options={{
                5: '5',
                10: '10',
                20: '20'
            }}
            value={toolsOption.perPage}
            onChange={changeOption.bind(null,"perPage")}
        />
        <Pagination
            current={toolsOption.currentPage}
            pageSize={toolsOption.perPage}
            total={total}
            onChange={changeOption.bind(null,"currentPage")}
        />
    </div>
}

const Bar = ({ toggleSelect, ids, actions }) => {
    return <div className={styles.bar}>
        <div className={styles.select}>
            <img className={styles.checked} onClick={toggleSelect} src={checkedIcon} alt="checked"/>
            <span><span className={styles.count}>{ids.length}</span> Screen Selected</span>
        </div>
        <div className={styles.action}>
            <img onClick={actions.bind(null, "share", ids)} src={shareDarkIcon} alt="share"/>
            <img onClick={actions.bind(null, "duplicate", ids)} src={duplicateDarkIcon} alt="duplicate"/>
            <img onClick={actions.bind(null, "delete", ids)} src={deleteDarkIcon} alt="delete"/>
        </div>
    </div>
}