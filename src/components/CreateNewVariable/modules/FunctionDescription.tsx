import React, { Component } from 'react';
// import { Typography } from '@material-ui/core';
import styles from './FuncDescription.module.css';
import EN from '../../../constant/en';
import { Table } from 'antd';
import { chain, range, zipObject } from 'lodash';
import config from 'config';
import enFunctions from '../DescriptionData-en';
import zhFunctions from '../DescriptionData-zh';

const isEN = config.isEN;

const getFunctions = (descr) => (isEN ? enFunctions : zhFunctions)[descr];

const Title = ({ name }) => <div className={styles.title}>{name}</div>;

const Describe = ({ describe }) => <div>{describe}</div>;

const Grammar = ({ grammar }) => grammar ? <div>
  <span className={styles.label}>{EN.Syntax}</span>
  <span className={styles.grammar}>{grammar}</span>
</div> : null;

const Input = ({ input }) => input ?
  <div className={styles.input}>
    <span className={styles.label}>{EN.Input}</span>
    <div>{input.map((v, k) => <div key={k}>{v}</div>)}</div>
  </div> : null;

const Output = ({ output }) => output ? <div>
  <span className={styles.label}>{EN.Output}</span>
  <span>{output}</span>
</div> : null;

const OutputDesc = ({ output_desc }) => output_desc ? <div>
  <span className={styles.label}>{EN.Note}</span>
  <span>{output_desc}</span>
</div> : null;

const Examples = ({ examples }) => examples ? <div>
  <p className={styles.label}>{EN.Examples}</p>
  {examples.map((example, key) => <Example key={key} example={example}/>)}
</div> : null;

const generateData = (data, length) => {
  const keys = range(length);
  return data.map((column, key) => Object.assign({ key }, zipObject(keys, column)));
};

const generateSource = (data, length) => data ? generateData(data, length) : null;

const generateColumns = (length, isIndividual, input) => {
  const InputVariable = EN.InputVariable;
  const CreatedVariable = EN.CreatedVariable;
  let values;
  if (isIndividual) {
    values = chain(length).range().fill(input ? InputVariable : CreatedVariable).value();
  } else {
    values = chain(length - 1).range().fill(InputVariable).concat(CreatedVariable).value();
  }
  return chain(length).range().map((v, k) => {
    return { dataIndex: k + '', title: values[k] };
  }).value();
};

const Example = ({ example }) => {
  const { length, input, output, inputData, isIndividual } = example;
  const inputSource = generateSource(inputData, length);
  const outputSource = generateSource(output, length);
  const inputColumns = generateColumns(length, isIndividual, true);
  const outputColumns = generateColumns(length, isIndividual, false);
  return (
    <div>
      <div className={styles.tableLabel}>{EN.Input + input}</div>
      {inputData ?
        <Table dataSource={inputSource} columns={inputColumns} pagination={false}/>
        : null}
      <div className={styles.tableLabel}>{EN.Output}</div>
      {input ?
        <Table dataSource={outputSource} columns={outputColumns} pagination={false}/>
        : null}
    </div>
  );
};


const Description = ({ funcName }) => {
  const descr = getFunctions(funcName || 'Exp');
  const { name, describe, grammar, input, output, output_desc, examples } = descr;
  return (
    descr ? <div className={styles.gap}>
      <Title name={name}/>
      <Describe describe={describe}/>
      <Grammar grammar={grammar}/>
      <Input input={input}/>
      <Output output={output}/>
      <OutputDesc output_desc={output_desc}/>
      <Examples examples={examples}/>
    </div> : null
  );
};


export default Description;
