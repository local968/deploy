const r = require('./db');
const _ = require('lodash');

const etlFormat = (
  {
    command,
    headerIndex = 0,
    outlier = {},
    filename,
    phase = 'train',
    includeHeader = 1,
    renameVariables = {},
    predictSelectedVar,
    onlyTarget
  },
  _approach
) => {
  const {
    variablesInEtl,
    typeOfProblem,
    location,
    maximumDataSize,
    uploadTarget,
    initialDataType,
    outlierOptions,
    fillMethod,
    userId,
    projectId,
    approachId
  } = _approach;

  const fillMethodBackend = _fillMethodBackend(fillMethod);
  const name = filename || location;
  const id = `${command}-${userId}-${projectId}-${approachId}`;

  return {
    id,
    projectId,
    typeOfProblem,
    sampleSize: maximumDataSize,
    includeHeader,
    approachId,
    onlyTarget,
    leftBlank: [],
    targetVariable: phase !== 'predict' ? uploadTarget : null,
    colType: initialDataType,
    outlier,
    renameVariables,
    variables:
      phase === 'train'
        ? Object.keys(variablesInEtl).filter(d => variablesInEtl[d])
        : predictSelectedVar,
    outlierOptions,
    dataProcess: phase === 'train' ? 'train' : 'fitPredict',
    userId,
    csvLocation: name,
    fillMethod: fillMethodBackend,
    selectHeader: headerIndex,
    command,
    status: '0',
    time: Date()
  };
};

const _fillMethodBackend = fillMethod => {
  return Object.keys(fillMethod).reduce((result, key) => {
    const [method, value] = fillMethod[key];
    const methodBackend = method === 'keep' ? 'auto' : method;
    result[key] = value !== null ? value : methodBackend;
    return result;
  }, {});
};

const mapImpact = (im, headerMap) => {
  if (!im) return [];
  return Object.entries(im)
    .filter(([_, val]) => val > 0.001)
    .map(([key, val]) => {
      const item = [headerMap[key] ? headerMap[key] : key, val, key];
      return item;
    });
};

const getOptionVariables = (_approach, _model) => {
  const headerMap = _approach.rawHeader.reduce((result, value, index) => {
    result[value] = _approach.varNameMap[index] || value;
    return result;
  }, {});

  const impactMap = mapImpact(_model.impact, headerMap);
  return _.xor(_model.variableList, impactMap.map(d => d[0]));
};

const removeExt = (filename, phase) =>
  filename.substr(0, filename.lastIndexOf('.')) + '_' + phase;

module.exports = async (_projectId, _modelId) => {
  const _model = await r.getModel(_modelId);
  const _approach = (await r.getApproach(_projectId))[0];

  const file = { name: 'testfilename.csv' };

  const etl = [
    etlFormat(
      {
        command: 'etlPredict',
        filename: file.name,
        phase: 'predict',
        predictSelectedVar: _model.variableList
      },
      _approach
    )
  ];

  let threshold;
  if (!this.chart || !this.chart.roc)
    threshold = _model.chart.roc[_model.fitIndex]
      ? _model.chart.roc[_model.fitIndex].Threshold
      : null;

  // const resultInfo = deployInapp
  //   ? {}
  //   : {
  //       resultsqlUsername: resultUsername,
  //       resultsqlPassword: resultPassword,
  //       resultsqlHostname: resultHostname,
  //       resultsqlPort: resultPort,
  //       resultsqlDatabase: resultDatabase,
  //       resultsqlDatabaseType: resultDbType,
  //       resultsqlTablename: resultTable,
  //       resultsqlEncoding: resultEncoding
  //     };

  const request = {
    id: `fit_and_predict-${_approach.userId}-${_approach.projectId}-${
      _approach.approachId
    }`,
    command: 'fitPredict',
    etl,
    typeOfProblem: _approach.typeOfProblem,
    optionVariables: getOptionVariables(_approach, _model),
    suggestionFeature: _approach.efficiencyList,
    modelId: [_model.modelId],
    threshold,
    trainId: _model.modelSetting,
    projectId: _approach.projectId,
    approachId: _approach.approachId,
    userId: _approach.userId,
    csvLocation: removeExt(_approach.predictFile, 'predict') + '_after_etl.csv',
    variables: _model.variableList,
    newVariables: {},
    status: '0',
    fitMetric: 'AUC',
    time: Date(),
    version: 4
    // ...resultInfo
  };

  return request;
};
