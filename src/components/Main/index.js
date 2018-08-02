import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { when } from 'mobx';
import Project from '../Project';
import Problem from '../Problem';
import Data from '../Data';
import Modeling from '../Modeling';

@inject('userStore', 'projectStore')
@observer
export default class Main extends Component{
    constructor(props) {
        super(props);
        const {pid} = props.match.params || {};
        this.pid = pid
        
        when(
            () => props.userStore.userId && !props.userStore.isLoad,
            () => props.projectStore.init(props.userStore.userId, this.pid)
        )
    }

    getChild = () => {
        const {project, models} = this.props.projectStore;
        const { curStep } = project || {};
        switch(curStep){
            case 1:
                return <Problem project={project}/>
            case 2:
                return <Data userId={this.props.userStore.userId} project={project}/>
            case 3:
                return <Modeling project={project} models={models} history={this.props.history}/>
            case 0:
            default:
                return <Project project={project}/>
        }
    }

    render() {
        return <React.Fragment>
            {!this.props.projectStore.isLoad&&this.getChild()}
        </React.Fragment>
    }
}