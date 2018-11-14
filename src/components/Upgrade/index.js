import React, {Component} from 'react';
import styles from './styles.module.css';
import basic from './basic.svg'
import essential from './essential.svg'

const labels = ["Data Size", "Number of Users", "Number of Models", "Number of Predictions Storage Space", "Number of Concurrent Projects", "Data Format", "API Access", "Resource Priority", "Technical Support"];

const basicData = ["50MB", "1", "15/month", "20,000/month", "10GB", "1", "CSV", "No", "Low", "Email"];

const essentialData = ["200MB", "1", "150/month", "200,000/month", "100GB", "5", "CSV", "No", "Medium", "Email"];

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
      <div onClick={onClick} className={styles.button}>Buy Now</div>
    </label>)
};

export default class Upgrade extends Component {

  open() {
    const url = 'http://app17.newa-tech.com:27002/submitOrder';
    window.open(url)
  }

  render() {
    return (
      <div className={styles.main}>
        <div className={styles.header}>
          If you enjoy our R2 Learn experience and are interested in product upgrade, please choose the SaaS Offering
          option, and click on the ‘buy now’ button to start!
        </div>
        <InfoContent describe="Basic" img={basic}
                     data={basicData} onClick={this.open}/>
        <InfoContent describe="Essential" img={essential}
                     data={essentialData} onClick={this.open}/>
      </div>
    )
  }
}
