import React, {Component} from 'react';
import styles from './styles.module.css';
import basic from './basic.svg'
import essential from './essential.svg'
import EN from '../../constant/en';


const labels = [EN.DataSize, EN.NumberofUsers, EN.NumberofModels, EN.NumberofPredictions, EN.NumberConcurrentProjects,EN.DataFormat, EN.APIAccess, EN.ResourcePriority, EN.TechnicalSupport];

const basicData = ["50MB", "1", EN.Fivemonth, EN.TWOmonth, "10GB", "1", "CSV", EN.No, EN.Low, EN.Email];

const essentialData = ["200MB", "1", EN.Fivemonths,EN.TWOmonths, "100GB", "5", "CSV", EN.No, EN.Medium, EN.Email];

const InfoContent = ({describe, img, onClick, data = []}) => {
  return (
    <label className={styles.content}>
      <div className={styles.contentLabel}>{describe}</div>
      <div>
      </div>
      <img src={img} className={styles.img}/>
      <div className={styles.info}>
        {
          labels.map((label, index) => <div key={index}>
            <label className={styles.tipContent}>{label}</label>
            <label>{data[index]}</label>
          </div>)
        }
      </div>
      <div onClick={onClick} className={styles.button}>{EN.BuyNow}</div>
    </label>)
};

export default class Upgrade extends Component {

  open() {
    const url = '//app17.newa-tech.com:27002/submitOrder';
    window.open(url)
  }

  render() {
    return (
      <div className={styles.main}>
        <div className={styles.header}>
          {EN.Ifyouenjoyour}
        </div>
        <InfoContent describe="Basic" img={basic}
                     data={basicData} onClick={this.open}/>
        <InfoContent describe="Essential" img={essential}
                     data={essentialData} onClick={this.open}/>
      </div>
    )
  }
}
