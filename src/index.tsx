import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from 'components/App';
import {Modal} from 'antd'
import EN from './constant/en'
ReactDOM.render(<App />, document.getElementById('root'));

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
  };
