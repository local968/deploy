import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from 'components/App';
// import registerServiceWorker from './registerServiceWorker';
import {Modal} from 'antd'

ReactDOM.render(<App />, document.getElementById('root'));
// registerServiceWorker();

window.alert = msg=>{
    Modal.warning({
      title: 'Kindly Reminder',
      content: (
        <div>
          {msg}
        </div>
      ),
      onOk() {},
    });
  }
  