import React, { Component } from "react";
import styles from "./styles.module.css";
import { Tree, Input, message } from "antd";
import { observable, action, toJS } from "mobx";
import { observer, inject } from "mobx-react";
import Article from "./article.js";
import classnames from "classnames";
import axios from "axios"
const { TreeNode, DirectoryTree } = Tree;
const TextArea = Input.TextArea
const _data = observable({
	selectedKeys: ["1.1"],
	expandedKeys: ["1"],
	waiting: false,
	type: 1,
	text: '',
	email: ''
});

const _change = action((name, value) => (_data[name] = value));

@inject('userStore')
@observer
export default class Support extends Component {

	waiting = false;

	constructor(props) {
		super(props);
		this.changeSelectedKeys = this.changeSelectedKeys.bind(this);
		this.onSelect = this.onSelect.bind(this);
		_change('email', props.userStore.info.email)
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

	submit() {
		const { email, type, text } = toJS(_data)
		const typeText = (type === 1 && 'Bug') || (type === 2 && 'Feature') || (type === 3 && 'Question') || ''
		if (!typeText) return
		if (!text) return
		if (!email) return
		axios.post("/user/report", { type: typeText, text, email }).then(res => {
			if (res.status === 200) {
				_change('email', this.props.userStore.info.email)
				_change('text', '')
				_change('type', 1)
				message.success("report success")
			} else {
				message.error((res.data || {}).message || "report error")
			}
		})
	}

	render() {
		const selectedKeys = toJS(_data.selectedKeys);
		const expandedKeys = toJS(_data.expandedKeys);
		return (
			<section style={{ width: "100%" }}>
				{/*<header className={styles.header}>*/}
				{/*Welcome to R<span>2</span>.ai support*/}
				{/*</header>*/}
				<div className={styles.main}>
					<div className={styles.support}>
						<div className={styles.report}>
							<div className={styles.types}>
								<div className={classnames(styles.type, {
									[styles.checked]: _data.type === 1
								})} onClick={this.changeType.bind(this, 1)}><span>Report a Bug</span></div>
								<div className={classnames(styles.type, {
									[styles.checked]: _data.type === 2
								})} onClick={this.changeType.bind(this, 2)}><span>Request a Feature</span></div>
								<div className={classnames(styles.type, {
									[styles.checked]: _data.type === 3
								})} onClick={this.changeType.bind(this, 3)}><span>Ask a Question</span></div>
							</div>
							<div className={styles.text}>
								<TextArea className={styles.textArea} rows={4} value={_data.text} onChange={this.handleChangeArea} />
							</div>
							<div className={styles.email}>
								<Input placeholder='Enter your email' value={_data.email} onChange={this.handleChange} />
							</div>
							<div className={styles.button}>
								<div className={classnames(styles.type, styles.checked)} onClick={this.submit.bind(this)}>
									<span>Submit</span>
								</div>
							</div>
						</div>
						<div className={styles.menu}>
							<p>CATALOGUE</p>
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
								<TreeNode title="1.Overview" key="1">
									<TreeNode title="Machine learning" key="1.1" />
									<TreeNode title="Machine learning with R2-Learn" key="1.2" />
								</TreeNode>

								<TreeNode title="2. Getting started with R2-Learn" key="2">
									<TreeNode title="Software requirements" key="2.1" />
									<TreeNode title="Importing data into R2-Learn" key="2.2">
										<TreeNode
											title="Importing data from a database"
											key="2.2.1"
										/>
										<TreeNode title="Importing a local file" key="2.2.2" />
									</TreeNode>
									<TreeNode title="Project home" key="2.3" />
									<TreeNode title="Model deployment home page" key="2.4" />
								</TreeNode>

								<TreeNode title="3.Starting a new project" key="3">
									<TreeNode title="Create a project" key="3.1" />
									<TreeNode title="Describe your business problem" key="3.2" />
									<TreeNode title="Working with your data" key="3.3">
										<TreeNode title="Data Connect" key="3.3.1" />
										<TreeNode title="Data Schema" key="3.3.2" />
										<TreeNode title="Data Quality" key="3.3.3">
											<TreeNode title="Common Issues with Data" key="3.3.3.1" />
											<TreeNode title="Target Variable Quality" key="3.3.3.2" />
											<TreeNode title="All Data Quality" key="3.3.3.3" />
										</TreeNode>
									</TreeNode>
									<TreeNode title="Modeling" key="3.4">
										<TreeNode title="Automatic Modeling" key="3.4.1" />
										<TreeNode title="Advanced Modeling" key="3.4.2" />
										<TreeNode title="Building your model" key="3.4.3">
											<TreeNode title="Model Selection" key="3.4.3.1" />
										</TreeNode>
									</TreeNode>
								</TreeNode>

								<TreeNode title="4.Deploying your models" key="4">
									<TreeNode title="Deployment" key="4.1" >
										<TreeNode title="Predict with data source" key="4.1.1" />
										<TreeNode title="Predict with API" key="4.1.2" />
									</TreeNode>
									<TreeNode title="Monitor your deployed models" key="4.2">
										<TreeNode title="Operation Monitor" key="4.2.1" />
										<TreeNode title="Performance Monitor" key="4.2.2" />
										<TreeNode title="Performance Status" key="4.2.3" />
									</TreeNode>
								</TreeNode>

								<TreeNode title="Appendix A: Data Quality Fixes" key="a">
									<TreeNode title="Fixing outliers" key="a.1" />
									<TreeNode title="Fixing missing values" key="a.2" />
									<TreeNode title="Fixing data type mismatch" key="a.3" />
								</TreeNode>

								<TreeNode title="Appendix B: Advanced Modeling" key="b">
									<TreeNode title="Advanced Variable Settings" key="b.1" />
									<TreeNode title="Advanced Modeling Setting" key="b.2" >
										<TreeNode title="Create/Edit Model Setting By default" key="b.2.1" />
										<TreeNode title="Select Algorithm" key="b.2.2" />
										<TreeNode title="Set Max Model Ensemble Size" key="b.2.3" />
										<TreeNode title="Train Validation Holdout and Cross Validation" key="b.2.4" />
										<TreeNode title="Resampling Setting" key="b.2.5" />
										<TreeNode title="Set Measurement Metric" key="b.2.6" />
										<TreeNode title="Set Max Optimization Time" key="b.2.7" />
										<TreeNode title="Random Seed" key="b.2.8" />
									</TreeNode>
								</TreeNode>

								<TreeNode title="Appendix C: Model selection for Binary Classification problems" key="c">
									<TreeNode title="Simplified view" key="c.1" />
									<TreeNode title="Advanced View" key="c.2" >
										<TreeNode title="Top Section" key="c.2.1" />
										<TreeNode title="Table of Models" key="c.2.2" />
										<TreeNode title="Additional Model Details" key="c.2.3" />
									</TreeNode>
								</TreeNode>

								<TreeNode title="Appendix D: Model selection for Regression problems" key="d">
									<TreeNode title="Simplified View" key="d.1" />
									<TreeNode title="Advanced View" key="d.2" >
										<TreeNode title="Top Section" key="d.2.1" />
										<TreeNode title="Table of Models" key="d.2.2" />
										<TreeNode title="Additional Model Details" key="d.2.3" />
									</TreeNode>
								</TreeNode>
							</DirectoryTree>
						</div>
					</div>
					<div className={styles.content}>
						<Article
							changeSelectedKeys={this.changeSelectedKeys}
						/>
					</div>
				</div>
			</section>
		);
	}
}
