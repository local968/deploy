import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from 'components/App';
// import registerServiceWorker from './registerServiceWorker';
import {Modal} from 'antd'
import EN from './constant/en'
ReactDOM.render(<App />, document.getElementById('root'));
// registerServiceWorker();

window.alert = msg=>{
    Modal.warning({
      title: EN.KindlyReminder,
      content: (
        <div>
          {msg}
        </div>
      ),
      onOk() {},
    });
  }
