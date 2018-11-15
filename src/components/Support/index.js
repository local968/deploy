import React, {Component} from 'react';
import styles from './styles.module.css';
import {Tag} from 'antd';

export default class Support extends Component {

  _download(filename,downname){
    var a  = document.createElement("a")
    a.href = `/${filename}`
    a.download = downname
    a.click();
  }

  render() {
    return (
      <div className={styles.content}>
        <div className={styles.header}>R2.ai Support - Product Manual</div>
        <div className={styles.item}>
            R2-Learn User Manual
            <Tag className={styles.tag} onClick={()=>{
              this._download('support-eng.docx','R2-Learn User Manual.docx')
            }}>docs</Tag>
        </div>

        <div className={styles.item}>
            R2-learn产品操作手册-中文
            <Tag className={styles.tag} onClick={()=>{
              this._download('support-chn.docx','R2-learn产品操作手册.docx')
            }}>docs</Tag>
            <Tag className={styles.tag} onClick={()=>{
              this._download('support-chn.pdf','R2-learn产品操作手册.pdf')
            }}>pdf</Tag>
        </div>

      </div>
    )
  }
}
