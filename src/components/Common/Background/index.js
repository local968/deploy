import React from 'react';
import styles from './styles.module.css';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
// import CircleProgress from 'components/Common/CircleProgress'

@observer
class Background extends React.Component {

  @observable columnReady = false
  @observable bgReady = false

  componentDidMount() {
    setTimeout(action(() => { this.columnReady = true }), 200)
    setTimeout(action(() => { this.bgReady = true }))
  }

  render() {
    return (
      <div className={styles.background}>
        {Array(40)
          .fill(1)
          .map((value, index) => {
            const height = this.columnReady ? Math.random() * index * 3 : 0;
            return (
              <div
                key={index}
                className={styles.column}
                style={{ height: height + '%' }}
              />
            );
          })}
        {/* <CircleProgress></CircleProgress> */}
        <div className={styles.circle}>
          <span className={styles.number}>
            75<span className={styles.percent}>%</span>
          </span>
        </div>
        <div className={styles.bgImage} style={this.bgReady ? { transform: 'scaleY(1)' } : {}} />
      </div>
    );
  }
}

export default Background;
