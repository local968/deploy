tuple = {
  deploymentOptions: {
    autoDisable: true,
    enable: null,
    file: {},
    frequency: 'once',
    frequencyOptions: {
      time: 1531812606
    },
    location: 'app',
    locationOptions: {},
    option: 'data',
    source: 'database',
    sourceOptions: {
      databaseEncoding: 'utf8',
      databaseName: '321',
      databaseType: 'mysql',
      finish: '',
      hostname: '21',
      password: '213',
      period: '',
      port: '21',
      rememberMyConnectionProfile: false,
      rememberMyPassword: false,
      start: '',
      tableName: '231',
      tableType: 'new',
      username: '213'
    }
  },
  modelName: 'RandomForestClassifier4.custom.03.26.2018_17:46:51',
  modelType: 'Classification',
  projectId: '23',
  projectName: 'teas',
  performanceOptions: {
    autoDisable: null,
    enable: true,
    file: {},
    frequency: 'once',
    frequencyOptions: {
      time: 'completed'
    },
    measurementMetric: 'AUC',
    metricThreshold: 70,
    source: 'database',
    sourceOptions: {
      databaseEncoding: 'utf8',
      databaseName: '213',
      databaseType: 'mysql',
      finish: '',
      hostname: '123',
      password: '',
      period: '',
      port: '321',
      rememberMyConnectionProfile: false,
      rememberMyPassword: false,
      start: '',
      tableName: '23',
      tableType: 'new',
      username: ''
    }
  }
};

(async () => {
  watchResult = await db.watchDeploy(
    console.log.bind(console, 'watch callback:')
  );
  console.log('watchResult:', watchResult);
  insertResult = await db.newDeploy({ tuple });
  console.log('insertResult:', insertResult);
  updateResult = await db.updateDeploy({
    tuple: { ...tuple, id: insertResult.result.id, projectName: '321123' }
  });
  console.log('updateResult:', updateResult);
  searchResult = await db.searchDeploy();
  console.log('searchResult:', searchResult);
  idSearchResult = await db.searchDeploy({ id: insertResult.result.id });
  console.log('idSearchResult:', idSearchResult);
  unwatchResult = await db.unwatchDeploy();
  console.log('unwatchResult:', unwatchResult);
})();
