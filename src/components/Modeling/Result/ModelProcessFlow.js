import React, { Component } from 'react';
import styles from './styles.module.css';
import { observer } from 'mobx-react'
import Next from './Next.svg'
import {Popover,Button,Icon} from 'antd'

@observer
export default class ModelProcessFlow extends Component {
    render() {
        const content = (
                <div>
                    <p>Content</p>
                    <p>Content</p>
                </div>
            );

            return <section className={styles.process}>
                <img src={Next}/>
                <Popover placement="bottom" content={content} trigger="click">
                    <Button>Bottom<Icon type="down" /></Button>
                </Popover>
            </section>
        }
}