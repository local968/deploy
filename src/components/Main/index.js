import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { when } from 'mobx';
import Project from 'components/Project';
import Problem from 'components/Problem';
// import Data from 'components/Data';
// import Modeling from 'components/Modeling';
import {message} from 'antd';

@inject('userStore', 'projectStore', 'routing')
@observer
export default class Main extends Component{
    constructor(props) {
        super(props);
        const {pid} = props.match.params || {};
        this.pid = pid
        
        when(
            () => props.userStore.status === "login",
            () => props.projectStore.initProject(this.pid)
        )
    }

    getChild = () => {
        const {project, models} = this.props.projectStore;
        const { curStep } = project || {};

        when(
            () => project && !project.exist,
            () => {
                message.warn("project not exist")
                this.props.routing.push("/")
            }
        )

        switch(curStep){
            case 1:
                return <Problem project={project}/>
            // case 2:
            //     return <Data userId={this.props.userStore.userId} project={project}/>
            // case 3:
            //     return <Modeling project={project} models={models} />
            case 0:
            default:
                return <Project project={project}/>
        }
    }

    render() {
        console.log({...this.props.projectStore.project})
        return <React.Fragment>
            {this.getChild()}
        </React.Fragment>
    }
}