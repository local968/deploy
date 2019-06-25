export interface Numerical {
  missingValue?: number;
  mismatch?: number;
  outlierCount?: number;
}

export interface OriginalStats {
  std_deviation?: unknown;
  numerical?: Numerical;
}
export interface Metric {
  originalStats?: OriginalStats;
  type?;
  originalCategoricalMap?;
  categoricalMap?;
}

export interface BaseResponse {
  message: string;
  status: number;
}

export class Project {
  colMap?: unknown = {};
  will_be_drop_500_lines?: unknown[] = [];
  stats?: OriginalStats = {};
  userId?: string = '';
  models?: unknown[] = [];
  trainModel?: unknown = {};
  autorun?: unknown[] = [];

  id?: string = '';
  exist?: boolean = true;
  loading?: boolean = false;
  host?: string = '';
  loadModel?: boolean = false;

  //step
  mainStep?: number = 0;
  curStep?: number = 0;
  lastSubStep?: number = 1;
  subStepActive?: number = 1;

  //project
  name?: unknown;
  createTime?: unknown;
  updateTime?: unknown;
  charset?: string = 'utf-8';
  // description;

  //problem
  problemType?: string = '';
  statement?: string = '';
  business?: string = '';
  changeProjectType?: string = '';

  //etl
  etling?: boolean = false;
  etlProgress?: number = 0;

  // upload data
  cleanHeader?: unknown[] = [];
  dataHeader?: unknown[] = [];
  uploadData?: unknown[] = [];
  rawHeader?: unknown[] = [];
  // add header map
  mapHeader?: unknown[] = [];
  colType?: unknown = {};
  // totalLines?: unknown =  0;
  totalRawLines?: number = 0;
  firstEtl?: boolean = true;
  target?: string = '';
  noCompute?: boolean = false;
  validationRate?: number = 20;
  holdoutRate?: number = 20;
  uploadFileName?: unknown[] = [];
  fileName?: string = '';
  // cleanData?: unknown =  []
  originPath?: string = '';

  etlCleanDataLoading?: boolean = false;
  cleanPath?: string = '';

  noComputeTemp?: boolean = false;
  originalIndex?: string = '';
  etlIndex?: string = '';

  //data quality
  mismatchFillMethod?: unknown = {};
  mismatchIndex?: unknown = {};
  nullFillMethod?: unknown = {};
  nullIndex?: unknown = {};
  outlierFillMethod?: unknown = {};
  outlierIndex?: unknown = {};
  outlierDict?: unknown = {};
  targetMap?: unknown = {};
  targetArray?: unknown[] = [];
  rawDataView?: unknown | null = null;
  preImportance?: unknown | null = null;
  preImportanceLoading?: boolean = false;
  importanceProgress?: number = 0;
  histgramPlots?: unknown = {};
  univariatePlots?: unknown = {};
  newVariable?: unknown[] = [];
  expression?: unknown = {};
  newType?: unknown = {};
  informativesLabel?: unknown[] = [];
  colValueCounts?: unknown = {};
  totalFixedLines?: number = 0;
  nullLineCounts?: unknown = {};
  mismatchLineCounts?: unknown = {};
  outlierLineCounts?: unknown = {};
  renameVariable?: unknown = {};
  missingReason?: unknown = {};
  newVariablePath?: unknown = '';
  newVariableViews?: unknown = {};
  otherMap?: unknown = {};

  // totalFixedCount?: unknown =  0
  deletedCount?: number = 0;

  //原始issue
  nullLineCountsOrigin?: unknown = {};
  mismatchLineCountsOrigin?: unknown = {};
  outlierLineCountsOrigin?: unknown = {};

  targetMapTemp?: unknown = {};
  targetArrayTemp?: unknown = [];
  missingReasonTemp?: unknown = {};
  mismatchFillMethodTemp?: unknown = {};
  nullFillMethodTemp?: unknown = {};
  outlierFillMethodTemp?: unknown = {};
  outlierDictTemp?: unknown = {};

  // train
  // 训练状态
  train2Finished?: boolean = false;
  train2ing?: boolean = false;
  train2Error?: boolean = false;

  trainingId?: string = '';
  // 不需要参加训练的label
  trainHeader?: unknown[] = [];
  customHeader?: unknown[] = [];
  criteria?: string = 'defualt';
  costOption?: { TP: number; FP: number; FN: number; TN: number } = {
    TP: 0,
    FP: 0,
    FN: 0,
    TN: 0,
  };
  mappingKey?: string = '';
  distribution?: number = 0;
  ssPlot?: unknown | null = null;

  // Advanced Modeling Setting
  settingId?: string = '';
  settings?: unknown[] = [];

  // correlation
  correlationMatrixHeader?: unknown;
  correlationMatrixData?: unknown;
  correlationMatrixLoading?: boolean = false;

  // 训练速度和过拟合
  speedVSaccuracy?: unknown = 5;

  ensembleSize?: number = 20;
  randSeed?: number = 0;
  measurement?: string = 'CVNN';
  resampling?: string = 'no';
  runWith?: string = 'holdout';
  crossCount?: number = 5;
  dataRange?: string = 'all';
  customField?: string = '';
  customRange?: unknown[] = [];
  algorithms?: unknown[] = [];
  selectId?: string = '';
  version?: number[] = [1, 2, 4];
  features?: string[] = [
    'Extra Trees',
    'Random Trees',
    'Fast ICA',
    'Kernel PCA',
    'PCA',
    'Polynomial',
    'Feature Agglomeration',
    'Kitchen Sinks',
    'Linear SVM',
    'Nystroem Sampler',
    'Select Percentile',
    'Select Rates',
  ];
  dataViews?: unknown | null = null;
  dataViewsLoading?: boolean = false;
  dataViewProgress?: number = 0;

  //un
  weights?: unknown = {};
  standardType?: string = 'standard';
  searchTime?: number = 5;
  kValue?: number = 5;
  kType?: string = 'auto';

  stopModel?: boolean = false;
  stopEtl?: boolean = false;
  isAbort?: boolean = false;
  stopIds?: unknown[] = [];

  reportProgress?: number = 0;
  reportProgressText?: string = 'init';
  reportCancel?: boolean = false;
}

export type ProjectRedisValue = {
  [key in keyof Project]: string;
};

export interface Steps {
  curStep?: number;
  mainStep?: number;
  subStepActive?: number;
  lastSubStep?: number;
}

export interface StatusData extends Steps {
  train2Finished?: boolean;
  train2Error?: boolean;
  train2ing?: boolean;
  trainModel;
  stopIds?: string[];
}

export interface GenerateNextScheduleTimeOptions {
  ends?;
  starts?;
  repeatOn?: string;
  repeatFrequency?;
  time?;
  repeatPeriod?;
}
