import React, { Component } from "react";
import styles from "./styles.module.css";
import { Tree,Input } from "antd";
import {observable, action,toJS} from 'mobx';
import {observer} from 'mobx-react';
import Article from './article.js'
const { TreeNode } = Tree;
const {Search} = Input;

const _data = observable({
    selectedKeys:['1.1'],
});

const _change = action((name,value)=>_data[name] = value)

@observer
export default class Support extends Component {

    constructor(props){
        super(props);
    }

    onSelect(selectedKeys, info){
        _change('selectedKeys',selectedKeys)
    }

  render() {
        const selectedKeys = toJS(_data.selectedKeys);
    return <section style={{width:'100%'}}>
        <header className={styles.header}>Welcome to R<span>2</span>.ai support</header>
        <div className={styles.main}>
            <div className={styles.menu}>
                <p>CATALOGUE</p>
                <Tree
                    showLine
                    onSelect={this.onSelect}
                    selectedKeys={selectedKeys}
                    // onExpand={this.onExpand}
                    // expandedKeys={expandedKeys}
                    // autoExpandParent={autoExpandParent}
                >
                    <TreeNode title="1.Overview" key="1">
                        <TreeNode title="Machine learning" key="1.1"/>
                        <TreeNode title="Machine learning with R2-Learn" key="1.2"/>
                    </TreeNode>

                    <TreeNode title="2. Getting started with R2-Learn" key="2">
                        <TreeNode title="Software requirements" key="2.1"/>
                        <TreeNode title="Importing data into R2-Learn" key="2.2">
                            <TreeNode title="Importing data from a database" key="2.2.1"/>
                            <TreeNode title="Importing a local file" key="2.2.2"/>
                        </TreeNode>
                    </TreeNode>
                </Tree>
            </div>
            <div className={styles.content}>
                <Article/>
            </div>
        </div>
    </section>
  }
}
