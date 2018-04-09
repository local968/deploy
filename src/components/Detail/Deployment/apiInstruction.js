import React from 'react';
import styles from './styles.module.css';

export default ({ cddo }) => (
  <div className={styles.row}>
    <span className={styles.holder} />
    <div className={styles.apiInstruction}>
      <div className={styles.block}>
        <div className={styles.line} />
        <span className={styles.title}>
          <span className={styles.no}>
            <span className={styles.noText}>1</span>
          </span>
          <span className={styles.titleText}>
            Send an request with the API key to make predictions on your data.
          </span>
          <span className={styles.other}>(We support Python)</span>
        </span>
        <div className={styles.codeWrapper}>
          <div className={styles.content}>
            <div># API code</div>
            <div>import requests</div>
            <div># Make predictions on your data</div>
            <div>
              data = &#123;"file": open('/path/to/your/data.csv', 'rb')&#125;
            </div>
            <div>
              Response =
              requests.post('http://service2.newa-tech.com/api/&lt;user_name&gt;/&lt;project_namr&gt;/&lt;model_name&gt;/&lt;api_key&gt;',
              data)
            </div>
          </div>
        </div>
      </div>
      <div className={styles.block}>
        <span className={styles.title}>
          <span className={styles.no}>
            <span className={styles.noText}>2</span>
          </span>
          <span className={styles.titleText}>
            Get prediction results from the Response object based on the
            following object definition.
          </span>
        </span>
        <div className={styles.codeWrapper}>
          <div className={styles.content}>
            <div style={{ fontWeight: 'bold' }}>
              <span className={styles.fixWidth}>Attribute</span> Description
            </div>
            <div>
              <span className={styles.fixWidth}>code</span> 200: Successful
              Others: Failure
            </div>
            <div>
              <span className={styles.fixWidth}>result</span> multiple rows of
              CSV (comma separated)
            </div>
          </div>
        </div>
      </div>
      <div className={styles.block}>
        <span className={styles.title}>
          <span className={styles.boldText}>More On How to Use API</span>
        </span>
        <div className={styles.codeWrapper}>
          <div className={styles.content}>
            <div>
              Our API supports CSV formatted input data. An API call is sent via
              POST method.
            </div>
            <div>
              Fill in your user_name, project_name(e.g., {cddo.name}),
              model_name(e.g., {cddo.modelName}) and api_key to get predictions.
            </div>
            <div>
              The ‘api_key’ in the API call is an unique key we assigned to you
              for your software integration development.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
