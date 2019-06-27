import React, { Component } from 'react';
import styles from './styles.module.css';
// import classnames from 'classnames';
import { observer } from 'mobx-react';
import { ProcessLoading } from 'components/Common';
import EN from '../../../constant/en';
import { observable } from 'mobx';
import { formatNumber } from '../../../util';
import Project from 'stores/Project';

interface DataSampleProps {
  project: Project,
  onClose: () => void,
  visible: boolean,
  selectSample: (obj: unknown) => void
}

@observer
class DataSample extends Component<DataSampleProps> {
  constructor(props) {
    super(props)
    this.init()
  }
  @observable select: number = -1
  @observable loading: boolean = true
  @observable files: any[] = []

  onSelect = (index: number) => {
    this.select = index
  }

  init = () => {
    this.props.project.getSample().then(list => {
      this.files = list
      this.loading = false
    })
  }

  submit = () => {
    const { selectSample } = this.props;
    // const sample = this.files[project.problemType + 'Sample'];
    const file = (this.files || [])[this.select];
    if (!file) return;
    selectSample({
      rawHeader: file.header,
      totalRawLines: file.lines,
      originalIndex: file.index,
      fileName: file.name
    });
  };

  formatSize = size => {
    let { size: s, n } = this.getSize(size)
    if (n < 0) n = 1
    const unit = (n === 1 && 'b') || (n === 2 && 'Kb') || (n === 3 && 'Mb') || (n === 4 && 'Gb') || 'Tb'
    return (parseInt((s * 100).toString(), 10) / 100) + ' ' + unit
  }

  getSize = (size, n = 1) => {
    if (n >= 5) return { size, n }
    const s = size / 1024
    if (s > 1) return this.getSize(s, ++n)
    return { size, n }
  }

  render() {
    const { onClose, visible } = this.props;
    if (!visible) return null
    // const sample = this.files[project.problemType + 'Sample'];
    return this.loading ?
      <ProcessLoading style={{ position: 'fixed' }} /> :
      <div className={styles.sample}>
        <div className={styles.cover} onClick={onClose} />
        <div className={styles.sampleBlock}>
          <div className={styles.sampleTitle}>
            <span>{EN.ChooseSampleD}</span>
            <div className={styles.close} onClick={onClose}>
              <span>X</span>
            </div>
          </div>
          <div className={styles.sampleTop}>
            <span>
              {EN.SelectSampleData}
            </span>
          </div>
          <div className={styles.sampleTable}>
            <div className={styles.sampleHeader}>
              <div className={styles.sampleCell}>
                <span>{EN.Name}</span>
              </div>
              {/* <div className={classnames(styles.sampleCell, styles.sampleDesc)}>
                <span>Description</span>
              </div> */}
              <div className={styles.sampleCell}>
                <span>{EN.FileName}</span>
              </div>
              <div className={styles.sampleCell}>
                <span>{EN.TargetVariable}</span>
              </div>
              <div className={styles.sampleCell}>
                <span>{EN.DataLines}</span>
              </div>
              <div className={styles.sampleCell}>
                <span>{EN.DataSize}</span>
              </div>
            </div>
            {(this.files || []).map((row, index) => {
              return (
                <div
                  className={styles.sampleRow}
                  key={index}
                  onClick={this.onSelect.bind(null, index)}
                >
                  <div className={styles.sampleRadio}>
                    <input
                      type="radio"
                      name="sampleSelect"
                      checked={this.select === index}
                      onChange={this.onSelect.bind(null, index)}
                    />
                  </div>
                  <div className={styles.sampleCell} title={row.usecase}>
                    <span>{row.name}</span>
                  </div>
                  {/* <div
                    className={classnames(styles.sampleCell, styles.sampleDesc)}
                    title={row.desc}
                  >
                    <span>{row.desc}</span>
                  </div> */}
                  <div className={styles.sampleCell} title={row.filename}>
                    <span>{row.name}</span>
                  </div>
                  <div className={styles.sampleCell} title={row.target}>
                    <span>{row.target}</span>
                  </div>
                  <div className={styles.sampleCell}>
                    <span>{formatNumber(row.lines)}</span>
                  </div>
                  <div className={styles.sampleCell} title={row.size}>
                    <span>{this.formatSize(row.size)}</span>
                  </div>
                </div>
              );
            })}
            <div className={styles.sampleButton}>
              <button onClick={this.submit} className={styles.submit}>
                <span>{EN.LoadSampleData}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
  }
}

export default DataSample
