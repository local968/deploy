import React from "react";
import { Typography } from "@material-ui/core";

const ZH_LAN: any = {
  Loading: '加载中…',
  Reconnecting: '重新连接...',
  OhISee: '我知道了',
  AutoRepeatSettings: '自动重复设置',
  Repeatevery: '重复周期，每',
  Day: '天',
  Week: '周',
  Month: '月',
  RepeatOn: '重复时间',
  Starts: '开始',
  Startss: '',
  SelectTime: '选择时间',
  Ends: '结束',
  Never: '不结束',
  NeverS: '从不',
  On: '',
  Ons: '结束',
  Occurrences: '次后结束',
  CANCEL: '取消',
  DONE: '完成',
  Cancel: '取消',
  SomethingwentwrongPlease: '运行出现错误，请',
  Refresh: '刷新',
  Goback: '返回上一步',
  Thenumbermustbeaninteger: '必须为整数',
  Thenumbermustbegreaterthanorequalto: '必须大于或等于',
  Thenumbermustbelessthanorequalto: '必须小于或等于',
  OneTimeSettings: '一次性设置',
  Startaftersettingscompleted: '设置完成后启动',
  PleaseUploaafileinoneofthefollowingformats: '文件类型错误：上传文件类型不支持，请上传一个“csv”文件或“csv”压缩文件',
  OK: '可接受',
  CommunityR2aiCommunity: 'R2.ai 社区 - AI 的智能搭档',
  CommunityUsethesame: '使用相同的产品登录ID密码来访问我们的AI社区',
  CommunityRich: '丰富的产品资源',
  CommunityIndept: '深入案例研究',
  CommunityQuotes: '专家引证',
  Communityscientists: '数据科学家问答',
  CommunityReviews: '用户评论',
  CommunityFirst: '先试用我们产品',
  CommunityAfter: '如果您的产品账号已过期，您仍然可以使用该账号访问我们的社区,了解更多内容！',
  CommunityEnter: '进入社区',
  FromR2L: '案例数据',
  Warning: '警告',
  Continue: '继续',
  DataSize: '数据大小',
  FileName: '文件名',
  FromComp: '本地上传',
  NoAuthority: '无权限',
  ChooseSampleD: '案例数据',
  TargetVariable: '目标变量',
  SelectSampleData: '使用案例数据试用R2 Learn',
  FileMustNotExceed: '文件大小不能超过',
  Paused: '暂停',
  Preparingforupload: '准备上传…',
  Uploadingdata: '数据上传中...',
  ExtractTransformLoadinprogress: '正在进行 提取-转换-加载…',
  Perparingfordatabaseconnection: '数据库连接中',
  DownloadedData: '已下载数据：',
  Rows: '行',
  Samplefileerror: '样本文件错误，请重新选择',
  Pleasechooseadata: '请选择要连接的数据。',
  Resume: '继续',
  DataSourceDatabase: '数据源 – 数据库',
  Thisactionmaywipeoutallofyourprevious: '点击继续将删除之前所有操作．您是否还要继续？',
  Name: '名称',
  LoadSampleData: '加载',
  Thechangeswillbeappliedintrainingsection: '感谢您修复问题，这些更改将会在训练部分实现',
  Yourtargetvariablehaslessthantwouniquevalues: '目标变量的类别少于两个，建议重新选择目标变量或上传新的数据。',
  Itisrecommendedthatyou: '建议你重新选择目标变量或者上传新数据',
  Yourtargetvariableisempty: '目标变量为空，建议重新选择目标变量或上传新的数据。',
  Yourtargetvariablehasmorethantwouniquevalues: '您的目标变量含有多个类别，不适合二分类问题。',
  Yourtargetvariablehaslessthan: '目标变量的类别少于',
  Uniquevalueswhichisnot: '不适用于回归。',
  Datasizeistoosmall: '数据量太少',
  Somedataissueshighlightedincolor: '颜色突出显示为检测出的一些数据质量问题。您可以通过点击“编辑修复”来修正，或者采用R2 Learn自动修复方式。',
  Targetvariablequalitylooksgood: '数据质量看起来不错！',
  DataTypeMismatch: '数据类型匹配错误',
  MissingValue: '缺失值',
  Outlier: '异常值',
  PredictorVariables: '预测变量',
  HowR2LearnWillFixtheIssues: 'R2-Learn 解决方案',
  Error: '错误！',
  Numerical: '连续变量',
  Categorical: '离散变量',
  VariableQualitylooksgood: '数据很干净！',
  Foryourwholedataset: '对于当前数据集，可用于建模的数据量小于建议的最小值1000行。',
  LoadaNewDataset: '上传一份新数据',
  SomeissuesarefoundR2learnhasgenerated: '发现了一些问题。 R2 learn已生成自动修复解决方案。您还可以通过单击“质量修复”按钮来创建自己的修复解决方案。',
  EditTheFixes: '质量修复',
  Summaryofyourdata: '数据质量分析',
  CleanData: '干净数据',
  DataComposition: '数据组合',
  RowsWillBeFixed: '修复行数',
  RowsWillBeDeleted: '删除行数',
  LoadaBetterDataset: '上传一份高质量数据',
  Ifyourdatadoesnothaveaheader: '如果你的数据没有列名，请重新上传一个有列名的数据。',
  Pleaseselectavariableasthetargetvariable: '请选择一个目标变量，也可以取消选择不需要的变量。',
  UnselectUndesirableVariables: '变量选择',
  Missing: '缺失',
  Unselectpredictorsthatleadtolesswantedmodeling: '选择建模变量，剔除噪音变量。比如：',
  VariableIDs: '1. ID',
  Variablesthatarederivedfromthetarget: '2. 从目标变量派生出的变量',
  Anyothervariablesyou: '3. 其他不需要的变量',
  DuplicatedHeader: '重复标题',
  AutoHeaderRepair: '变量名称自动修复',
  SkipDataQualityCheck: '跳过数据质量检测',
  Ifyouknowthedataisclean: '如果您上传的是一份干净数据，您可以选择跳过数据质量检测步骤',
  DataConnects: '数据连接',
  DataSchemas: '数据概要',
  DataQualitys: '数据质量',
  entStatus: '部署状态',
  Home: '主页',
  SortBy: '排序',
  ProPerPage: '显示数量/页',
  ProjectName: '项目名称',
  Enable: '启用',
  ModelName: '模型名称',
  Owner: '所有者',
  DeploymentStatus: '部署状态',
  PerformanceStatus: '执行状态',
  Normal: '正常',
  Issue: '异常',
  IssueS: '',
  SS: '',
  Running: '运行中',
  NA: 'N/A',
  ionMonitor: '操作监控',
  PerformanceMonitor: '性能监测',
  Pleaseuploadafileintheformatofcsv: '文件错误：请上传“csv”格式的文件。',
  Model: '模型',
  DeploymentDataDefinition: '部署数据定义',
  ValidationDataDefinitionTip: '它包含用于验证的变量。用于验证的数据源应该包含验证数据定义中提到的所有变量。',
  lidationDataDefinition: '所需变量名称',
  CreatedDate: '创建时间',
  Download: '下载',
  EmailtoReceiveAlert: '邮件提醒',
  Edit: '编辑',
  Save: '保存',
  PredictWithAPI: '使用API预测',
  Or: '或者',
  PredictWithDataSource: '使用数据源预测',
  DataSourceText: '数据源',
  LocalFile: '本地文件',
  ResultLocation: '在R2中进行部署',
  InApp: '在APP里进行',
  DeployFrequency: '部署频率',
  OneTime: '一次性',
  Time: '时间',
  Times: '开始时间：',
  Redeployevery: '每次重新部署',
  AutoRepeat: '自动重复',
  Autodisableifanyissueoccurs: '如出任何问题则自动禁用',
  Introduction: '介绍',
  WhatDoesOurAPIDo: 'API功能',
  WhatDoesOurAPIDoAnswer: 'API作为预先训练的模型的http接口，供用户进行预测。在完成模型训练之后，用户可以将这些模型视为API，并通过调用它们进行预测。',
  Request: '请求',
  Parameters: '参数',
  ResponseSample: '响应示例',
  Authentication: '授权',
  DeploymentAuthentication: '对于每个API调用，我们会使用自动生成的token进行身份验证。每个项目里的每个部署都会生成一个独特的token。使用token进行API调用后，我们将计算相应的使用情况。',
  ErrorCodes: '错误代码',
  RateLimit: '使用上限',
  DeploymentRateLimit: '由于不同级别账户的限制不同，当用户API调用数量/并发数量达到允许的最大数量时，后续请求将作为等待名单放入请求队列。如果队列太长，可能会导致超时。',
  DeploymentId: '部署ID',
  Token: 'token',
  Showtoken: '显示token',
  CURLSample: 'cURL 示例',
  DeploymentTime: '部署时间',
  DeploymentStyle: '部署方式',
  ExecutionSpeed: '执行速度',
  Rowss: '(行/秒)',
  TotalLines: '总行数',
  Status: '状态',
  Results: '结果',
  Predictwith: '',
  MeasurementMetric: '度量指标',
  AUC: 'AUC',
  Accuracy: '准确率',
  Accuracys: 'Accuracy',
  RMSE: 'RMSE',
  MetricThreshold: '指标阈值',
  NextMonitorDate: '下次监测日期',
  ValidationDataSource: '验证数据源',
  Threshold: '阈值',
  ModelInvokeTime: '模型调用时间',
  Performance: '性能',
  NoDeploymentReportYet: '暂时没有部署报告',
  CreateProject: '新建',
  DeleteDialogTitle: '删除项目',
  ConfirmOfDeletManyProject: '您确定要删除以下项目吗？',
  Areyousuretodeleteproject: '您确定要删除该项目吗？',
  DeploymentOptionText: '选项',
  Open: '打开',
  Selected: '已选',
  LastCreated: '最近创建',
  LastModified: '最近修改',
  TotalProject: '项目总数',
  Enabled: '启用',
  Disabled: '禁用',
  ChangePassword: '更改密码',
  LogOut: '注销',
  Notification: '通知',
  Welcome: '欢迎',
  WelcometoR2ai: '欢迎来到R2.ai',
  Problem: '问题',
  Project: '项目',
  Data: '数据',
  Modeling: '建模',
  Support: '客户支持',
  AccountInfo: '账户信息',
  Training: '训练集',
  TrainingS: '训练',
  Console: '控制台',
  Dataset: '数据集',
  Sorrybutyoudonthavetheauthority: '抱歉, 您无权进入此项目。',
  Youhavebeenkickedout: '您的账号已在另一个页面登录',
  GoBacktotheProject: '返回到项目',
  GotoHomePage: '返回主页',
  Youhavebeenkickedoutof: '因其他用户在访问该项目，你已被踢出。',
  StartModeling: '开始建模',
  ModelSelection: '模型选择',
  Diagnose: '诊断',
  All: '全部',
  ModelNameContains: '模型筛选',
  ModelingResults: '模型结果',
  Givenaparticularpopulation: '准确率衡量的是正确预测的百分比; 例如，对于一个有70个yes和30个no的100个数据，如果模型正确预测出60个yes和20个no，那么它的准确率是(60+20)/100 = 80%。',
  Itrepresentsthecompleteness: 'Recall =TP/(TP+FN) 召回率度量分类器正确判为阳类占实际所有阳类的百分比。它代表了分类器的完整性。召回越高，分类器捕获实际阳类的数量越多。',
  Manyclassifiersareabletoproduce: '截断阈值是一个决定预测结果为正例或负例的临界概率。大于等于截断阈值的样本会被判断为正例，小于截断阈值的样本则会被判断为负例。',
  TheF1scoreistheharmonicmean: 'F1是精确度和召回率的调和平均值. F1值最佳值为1 (精确度和召回率为完美) , 最差值为0。',
  PrecisionRecall: 'F1 = 2*Precision*Recall / (Precision+Recall)',
  Itmeasureshowmanytruepositivesamong: '它衡量所有预测（包括真假）阳类中有多少实际阳类,方程为真阳(tp) / (真阳(tp) + 假阳(fp))。从计算中可以看出，当值越大，分类器的误报越少。它有点代表分类器的准确性。',
  Efficientwaytodetermine: 'KS = TPR - FPR。KS用来判断两个类别之间是否存在显著差异。为所有阈值上真阳性率与假阳性率之差的最大值。k值越高，两个类别的的区分度就越大。',
  RootMeanSquareError: '均方根误差（RMSE）测量模型的预测误差。标准化RMSE将帮助您比较模型性能：越小越好。',
  R2isastatisticalmeasure: 'R^2 在统计学中用于度量应变量的变异中可由自变量解释部分所占的比例，以此来判断统计模型的解释力。 R^2=模型能解释的方差/目标变量总方差',
  RootMeanSquareErrorprediction: '均方根误差（RMSE）测量模型的预测误差。标准化RMSE将帮助您比较模型性能：越小越好。',
  RMSLEissimilarwithRMSE: 'RMSLE与RMSE相似，差别在于RMSLE对y和y的预测值做了对数变换。',
  MeanSquaredErro: '均方误差',
  MeanAbsoluteError: 'Mean Absolute Error',
  TheadjustedR2tells: 'Adjusted R² 描述了自变量给因变量带来的差异的百分比',
  LogLossis: 'Log Loss 是 -1*似然函数的对数',
  Thelikelihoodfunctionanswers: '对数似然损失，或称交叉熵损失，用于度量模型的分类误差：越小表示模型效果越好。',
  F1Score: 'F1-Score',
  Precision: 'Precision',
  Recall: 'Recall',
  LogLoss: 'Log Loss',
  CutoffThreshold: 'Cutoff Threshold',
  KS: 'KS',
  Validation: '验证集',
  Holdout: '留出集',
  NormalizedRMSE: 'Normalized RMSE',
  MSLE: 'MSLE',
  RMSLE: 'RMSLE',
  MSE: 'MSE',
  MAE: 'MAE',
  R2: 'R2',
  AdjustR2: 'AdjustR2',
  ResidualPlotDiagnose: '残差图诊断',
  FitPlot: '拟合图',
  ResidualPlot: '残差图',
  VariableImpact: '变量重要性',
  ROCCurve: 'ROC 曲线',
  PredictionDistribution: '预测分布',
  LiftChart: 'Lift 图',
  ModelProcessFlow: '模型流程',
  Reset: '重置',
  ModelComparisonCharts: '模型比较图',
  Close: '关闭',
  RandomlyDistributed: '随机分布',
  YaxisUnbalanced: 'Y轴方向数据不平衡',
  XaxisUnbalanced: 'X轴方向数据不平衡',
  Outliers: '异常值',
  Nonlinear: '非线性',
  Heteroscedasticity: '异方差性',
  LargeYaxisDataPoints: 'Y轴方向数据方差教大',
  Whichplotdoesyourresidual: '你的残差图看起来最像以下哪个图?',
  Perfectyourresidualplot: '完美！你的残差图是随机分布的，无需进一步改进你的模型。',
  Yourplotisunbalancedonyaxis: '您的数据在Y轴上不平衡。你可以通过以下方式改进模型:',
  Lookingforanopportunity: '寻找有效转换变量的方法，通常是您的目标变量',
  Checkingifyourmodel: '检查你的模型是否缺少有益变量',
  Youcantransformorselect: '您可以对变量进行转换或重新选择',
  GotoAdvancedVariableSetting: '转到变量设置',
  Alternativelyyoucanmodify: '您可以线下处理数据后重新上传',
  LoadMyNewData: '上传新数据',
  DiagnoseResults: '诊断结果:',
  Yourplotisunbalancedonxaxis: '您的数据在X轴上不平衡。你可以通过以下方式改进模型:',
  Lookingforanopportunitytousefully: '寻找有效转换变量的方法，通常是您的预测变量',
  Checkingifyourmodellack: '检查你的模型是否缺少有益变量',
  Youcantransformorselectvariables: '您可以在我们的应用程序中转换或选择变量',
  Yourplotishassomeoutliers: '您的数据含有异常值。您可以通过以下方式改进模型：',
  Deletingtheoutliers: '把你认为不需要的异常值剔除',
  Youcandeletetheoutliers: '您可以在应用中删除异常值',
  GotoEdittheFixesforOutliers: '转到异常值修正编辑',
  Yourplotisnonlinear: '您的数据呈现非线性。您可以通过以下方式改进模型:',
  Lookingforanopportunityusefully: '寻找有效转换变量的方法',
  Checkingifyourneedtoaddnewavariable: '检查是否需要添加新变量',
  Yourplotisheteroscedasticity: '您的数据呈现异方差性。您可以通过以下方式改进模型：',
  Yourplothaslargeyaxisdatapoints: '您的数据Y轴方向方差较大。您可以通过以下方式改进模型：',
  Acceptable: '一般',
  NotAcceptable: '未达标',
  TrainingFailed: '训练失败',
  AbortTraining: '终止训练',
  SimplifiedView: '简单视图',
  AdvancedView: '高级视图',
  DeployTheModel: '部署模型',
  Predict: '预测',
  Units: '单位',
  BenefitCost: '收益损失',
  Recommended: '推荐',
  ModelingResult: '模型结果',
  SelectedModel: '选择模型',
  Target: '目标变量',
  Selectyourmodelbasedonyourown: '根据您自己的标准选择您的模型：',
  R2LearnsDefaultSelection: 'R2 Learn 的默认推荐',
  Input: '输入:',
  Pleaseenterbenefitandcostin: '请在0.00到1000,000,000.00范围内输入收益和损失。输入的数字最多支持两位小数，必须是正值。',
  Noteifacorrectpredictionbringsyouprofit: '注意：如果正确的预测为您带来利润，那么这是一种效收益。如果不正确的预测为您带来损失，那就是成本。所有输入都应以相同的单位进行测量。',
  Tips: '提示',
  Benefit: '收益:',
  Benefits: '收益',
  Costs: '损失',
  Cost: '损失：',
  Recordswithadistributionof: '记录分布',
  Theoptimalthreshold: '最优阈值：',
  Submit: '提交',
  Return: '返回',
  Benefitcostiscalculated: '整体收益的计算公式：',
  BenefitTPBenefit: '收益* TP+ 收益 * TN - 成本* FN – 成本* FP ；',
  TPTruePositiveTNTrueNegative: '根据所选择的阈值确定TP（真阳类）,TN（真阴类），FN（假阴类）和FP（假阳类）等值都是由模型阈值决定的。阈值是将预测结果划分为事件发生组（例如，贷款中违约）和非事件组（例如，贷款中无违约）的临界概率。通常，大于阈值的预测结果（概率）被归为事件组，小于阈值的预测结果被归为非事件组。最优阈值是指使整体收益最大化的阈值。',
  Example: '例如：',
  Inthisloandefaultexample: '在这个贷款违约示例中，“yes”表示客户贷款违约，“no”表示客户没有贷款违约。请假设以下业务场景：',
  Acorrectpredictionof: '一次对违约情况的正确预测将为银行平均节省20万美元（带来20万美元的收益）',
  Acorrectpredictionofnondefault: '一次正确预测非违约的情况将给银行带来10万美元的收益',
  Anincorrectpredictionofthedefault: '一次对违约情况的错误预测将导致平均20万美元的损失',
  Andanincorrectpredictionofthenondefault: '一次对非违约案例的错误预测将导致平均10万美元的损失',
  Youcaninputthisinformationinto: '针对以上场景，您可以使用$K作为单位(或$作为单位)，输入如下:',
  R2Learnwillfindtheoptimalthreshold: 'R2 Learn将找到使整体收益最大化的最优阈值：',
  Thatoptimizesthebenefit: '',
  Currentbenefitcostequals: '当前最大整体收益：',
  Actual: '实际',
  Predicted: '预测',
  Different: '差异',
  Areaunderthecurve: 'AUC（ROC曲线下方的面积）是一个衡量分类模型性能的常用指标。AUC值通常介于0.5到1之间，其中0.5表示不良分类器，1表示优异的分类器。',
  PerformanceAUC: '性能(AUC)',
  Compute: '计算',
  TrainingNewModel: '新模型训练中',
  RecommendedAModel: '我们推荐了一个模型。',
  PredictedVSActualPlotSorted: '预测值 VS 真实值（有序的）',
  Howwastheplotcreate: '图表是如何绘制的？',
  Sortthedatabythe: '1.根据目标变量的真实值排序；',
  Dividealldatapoints: '2.将所有排序后的数据平均分为100组；',
  Calculatethemeanvalue: '3.计算每一组目标变量预测值与真实值的平均数，并绘图。',
  HowdoIinterprete: '如何解释这张图表？',
  Weaimtogetyouasense: '我们的目的是通过比较预测值和实际值来让您了解模型的准确程度。或许您也可以从中发现一些模式。',
  PredictedValues: '预测值',
  ActualValues: '真实值',
  GoodnessofFit: 'Goodness of Fit',
  EasyAndSimple: '简易',
  EasyAndSimpleTip: '如果您需要R2 Learn 自动建模．',
  AutomaticModeling: '自动建模',
  DetailedAndAdvanced: '详细和高级',
  DetailedAndAdvancedTip: '如果您想要对模型训练有更多的控制。',
  AdvancedModeling: '高级建模',
  Youneedtoselectatleast: '你需要选择至少一种算法！',
  Setting: '设置',
  PrepareToModel: '无数据质量问题，可以进行模型训练！',
  AdvancedVariable: '变量',
  AdvancellcedModeling: '建模',
  Histogram: '直方图',
  DataType: '数据类型',
  Mean: '均值',
  UniqueValue: '类别个数',
  Min: '最小值',
  Max: '最大值',
  CreateVariableListTip: '您可以通过勾选复选框建立变量列表',
  CurrentVariableList: '当前变量列表',
  AllVariables: '所有变量',
  Informatives: '重要变量',
  CreateANewVariable: '创建新变量',
  CheckCorrelationMatrix: '相关性矩阵',
  UnivariantPlot: '散点图',
  Importance: '重要性',
  AdvancedModelingImportanceTip: '下列显示了预测因子相对于目标变量的重要性。',
  STD: '标准差',
  Median: '中位数',
  Nameisempty: '名称为空',
  Newvariable: '新变量',
  Isexist: '已存在',
  Namecannotcontain: '名称不能包含_',
  Expressionisempty: '公式为空',
  Toomanyfunctions: '使用函数过多',
  Unexpectedtoken: '错误识别碼',
  Emptyexpression: '表达式为空',
  Errorexpression: '错误公式',
  Unexpectedidentifier: '不支持的标识符',
  Unknownvariable: '未知变量：',
  Unknownfunction: '未知函数：',
  Emptyparameter: '参数为空',
  ParametersmustbeNumerical: '参数必须为连续变量',
  ParametersmustbeCategorical: '参数必须为离散变量',
  Mustbeinteger: '必须为整数',
  Function: '函数',
  Parameterserror: '参数错误',
  Mustgreaterthan: '必须大于',
  Mustlessthan: '必须小于',
  Isnotsupported: '不支持',
  Mustbenumber: '必须为数字',
  Unexpectedtoken$: '错误识别碼',
  Concat: 'Concat()',
  Concatfunctionallowsyou: 'Concat函数通过合并某些变量创建新变量（例如，描述同一对象的变量）',
  Syntax: '语法：',
  Concatvar1: 'Concat(@var1, @var2, @var3,...p1, p2...)',
  Var1var2var3: 'var1, var2, var3… - 组合2个或多个连续变量和离散变量；组合顺序由输入顺序决定。所有的变量输入需以@开头。',
  Numberofvariables: 'p1，p2 ... - 每个组合中的变量数量;　其数量必须大于1但不能大于指定变量的数量;　创建p1个变量的组合，然后创建p2个变量的组合，依此类推。',
  Output: '输出：',
  Categoricalvariables: '一或多个离散变量',
  Examples: '例如：',
  Concatcolor: 'Concat(@color, @theme, @size, 2)',
  Concatolor3: 'Concat(@color, @theme, @size, 3)',
  Concat23: 'Concat(@color, @theme, @size, 2, 3)',
  Notice: '注意：',
  Iftoomanynewvariablesarecreated: '如果创建变量太多，系统可能会存在内存不足。建议创建变量的总数小于原始变量数的10倍。',
  Diff: 'Diff()',
  Difffunctionallowsyoutoeasily: 'Diff函数通过计算选定变量两行之间的差值来构造新变量。',
  DIffrow1: 'Diff(@var1, @var2, @var3,...row1,row2,...)',
  Ormorenumericalvariables: 'var1，var2，var3 ... - 选择一或多个需要计算差值的连续变量;所有变量都需要以@开头。',
  Distancetobecalculated: 'row1,row2,…-计算差值的行数；数字必须大于等于1，但不能大于变量的长度(建议：行越大，丢失的值越多)。',
  Numericalvariable: '一或多个连续变量',
  Difftax: 'Diff (@tax, 1,2)',
  Accumulate: 'Accumulate()',
  Accumulatefunction: 'Accumulate函数通过累加所有之前行的值来构造新变量。',
  Accumulatevar1var2: 'Accumulate(@var1, @var2, @var3,...)',
  Morenumericalvariables: 'var1, var2, var3... –选择1个或多个需要计算累加值的连续变量;所有变量都需要以@开头。',
  Accumulatedaily_sales: 'Accumulate (@daily_sales, @daily_cost)',
  Iftoomanynewvariablesarecreatedcsystem: '创建过多新变量会耗尽内存。建议创建的新变量的总数小于原始变量的10倍。',
  Quantile_bin: 'Quantile_bin()',
  Quantile_binfunctionallows: 'Quantile_bin函数通过根据所选变量的频率或值将其分组来构造新变量。',
  Quantile_binvar1var2: 'Quantile_bin(@var1, @var2, @var3,b, type1, type2)',
  Allvariablesneedtostartwith: 'var1, var2, var3... –选择1个或多个需要分组的连续变量;所有变量都需要以@开头。',
  Numberofgroupstobedivided: 'b – 分组数量;它的数量必须大于1但不能大于变量的长度（提示：分组太多没有意义）',
  Type1type2: 'type1,type2——变量分组的方法;支持0和1。',
  Variableisdividedbyitspercentile: '0：以频率分组，每组数量相同;',
  Eachgroupiswiththesamevaluerange: '1：以变量值分组，每组的值范围相同。',
  Quantile_binage: 'Quantile_bin(@age, 3, 1)',
  Quantile_binage1: 'Quantile_bin(@age1, @age2, 4, 1, 0))',
  Custom_Quantile_bin: 'Custom_Quantile_bin()',
  Custom_Quantile_binfunction: 'Custom_Quantile_bin函数通过根据用户指定的范围对选择的变量分组来构造新的变量。',
  Custom_Quantile_binrange_list1: 'Custom_Quantile_bin(@var, [range_list1], [range_list2]...)',
  Variableneedstostartwith: 'var - 选择一个连续变量;变量需要以@开头。[range_list1], [range_list2]…-自定义变量划分范围;第一个数值应大于该变量的最小值，最后一个数值应小于该变量的最大值;range_list的长度决定组的数量。',
  Custom_Quantile_binage: 'Custom_Quantile_bin(@age,[25|50],[20|40|60])',
  Oneoftheclasseshasnumber: '单类别数据点个数少于',
  Pleaseselectalowerfoldcv: '子集，请选择较低的子集交叉验证',
  YourAdvancedModeling: '高级模型设置已重置',
  SelectFromPreviousSettings: '选择历史设置',
  NameYourModelSettings: '命名您的设置',
  SpecifytheNumberofClusterstoForm: '请选择聚类类别个数：',
  SelectAlgorithm: '选择算法',
  SelectAll: '全选',
  DeselectAll: '取消全选',
  R2solutionModelling: 'R2-solution-a & b 为必选模型',
  R2solutiona: 'R2-solution-a',
  R2solutionb: 'R2-solution-b',
  ResamplingSetting: '采样设置',
  Autoupsampling: '自动上采样',
  Autodownsampling: '自动下采样',
  Noresampling: '不采样',
  SetMeasurement: '设置度量指标',
  RandomSeed: '随机种子',
  ValueBetween: '数值之间',
  SetModelEnsembleSize: '设置模型集成数量',
  SetModelEnsembleSizeTip: '实际集成模型数量可能小于此数',
  RunModelsWith: '数据集划分',
  Performingcrossvalidation: '对大型数据集执行交叉验证将花费大量时间。',
  Hencewerecommendchoosing: '因此，我们建议选择 ＂训练集／验证集／留出集＂',
  CrossValidation: '交叉验证',
  TrainValidationHoldout: '训练集／验证集／留出集',
  SetPercentage: '设置每个部分的百分比',
  SelectNumberofCVfolds: '选择交叉验证子集数量',
  SpeedVSAccuracy: '速度vs准确率',
  Speed: '速度',
  Selectavariableasreference: '选择一个变量作为参考',
  TotalVariables: '变量总数',
  ViewDataTable: '数据预览',
  Topredictifaneventislikely: '预测事件是否可能会发生（例如，客户是否会进行购买）。',
  Topredictacontinuous: '预测一个连续变量（比如：预测购买成本）',
  ChooseProblemType: '请选择问题类型',
  Predictions: '有监督',
  Prediction: '预测',
  ProjectN: '项目名称',
  ProblemStatement: '问题描述',
  Predictimportantcustomers: '例如：预测在接下来的30天内可能会流失的重要客户，以便客户服务部有效锁定目标并留住这些客户。',
  Thiswillhelpproactively: '例如：这将助于留住重要客户。留住老客户的成本远低于获取新客户。提高顾客满意度与忠诚度，能够为企业带来更多的经济效益。',
  BusinessValue: '商业价值',
  R2LearnTutorialVideo: 'R2-Learn 教学视频',
  Reportsuccess: '报告成功',
  Reporterror: '报告失败',
  Overview: '1. 概览',
  Machinelearning: '机器学习',
  MachinewithR2: '使用R2-Learn进行机器学习',
  GettingstartedwithR2: '2. 开始使用R2-Learn',
  Softwarerequirements: '软件需求',
  ImportingdataR2: '将数据导入R2-Learn',
  Importingdatadatabase: '从数据库导入数据',
  Importinglocalfile: '导入本地文件',
  Projecthome: '项目主页',
  HomepageDeployment: '主页 - 部署控制台',
  Startingproject: '3. 新建项目',
  Createproject: '创建项目',
  Chooseyourproblem: '选择您的问题类型',
  Workingwithyour: '处理您的数据',
  DataConnect: '数据连接',
  DataSchema: '数据预览／模式数据预览／模式',
  DataQuality: '数据质量',
  CommonIssues: '数据常见问题',
  TargetVariableQuality: '目标变量质量',
  PredictorVariablesQuality: '预测变量质量',
  Buildingyourmodelg: '创建模型',
  Predictwithdata: '使用数据源预测',
  Deployments: '部署模型',
  OperationMonitor: '操作监测',
  Monitor: '性能监视器',
  Deployingyourmodels: '4. 部署你的模型',
  Monitoryourdeployed: '监控已部署的模型',
  AppendixQuality: '附录A：数据质量修复',
  Fixingoutliers: '修复异常值',
  Fixingmissingvalues: '修复缺失值',
  Fixingdatamismatch: '修复数据类型错配',
  AppendixAdvancedModeling: '附录B: 高级建模',
  AdvancedVariableSettings: '变量设置',
  AdvancedModelingSetting: '模型设置',
  ModelSettingdefault: '创建／编辑默认模型设置',
  SetMaxModelEnsemble: '设置最大模型集合大小',
  TrainValidationHoldoutValidation: '训练集／验证集／留出集和交叉验证',
  SetMeasurementMetric: '设置度量指标',
  SetSpeedvsAccuracy: '设置建模速度vs准确率',
  AppendixModelselection: '附录C：二分类问题模型选择',
  Simplifiedview: '简单视图',
  TableofModels: '模型表格',
  AdditionalModelDetails: '附加／额外模型细节',
  AppendixModelselectionD: '附录D：回归问题模型选择',
  AskQuestion: '提问',
  RequestFeature: '申请更多功能',
  ReportBug: '报告漏洞',
  UserManual: '用户手册',
  TutorialVideo: '教学视频',
  NumberofUsers: '用户数量',
  NumberofModels: '模型数量',
  NumberofPredictions: '预测存储空间数量',
  NumberConcurrentProjects: '并发项目数量',
  DataFormat: '数据格式',
  APIAccess: 'API 访问',
  ResourcePriority: '资源优先级',
  TechnicalSupport: '技术支持',
  Fivemonth: '15/月',
  TWOmonth: '20,000/月',
  No: '无',
  Low: '低',
  Email: '电子邮件',
  Fivemonths: '150/月',
  TWOmonths: '200000/月',
  Medium: '中',
  BuyNow: '现在购买',
  Ifyouenjoyour: '如果您对我们R2 Learn的体验很满意并且对产品升级感兴趣，请选择SaaS Offer选项并单击“立即购买”按钮即可开始！',
  Thetwonewpasswords: '您输入的两个新密码不一致。',
  Passwordchangesucceeded: '修改密码成功！请使用您的新密码登录。',
  Passwordchangefailed: '密码更改失败，请稍后再试',
  ChangeYourPassword: '更改密码',
  Pleaseenteryourcurrent: '请输入您的当前密码和新密码。',
  CurrentPassword: '当前密码',
  NewPassword: '新密码',
  ConfirmYour: '确认您的新密码',
  ResetYourPassword: '重置密码',
  Wehavesent: '我们已发送重置密码到',
  Pleaseclickthereset: '请单击重置密码链接以设置新密码。',
  Didnreceivetheemail: '还未收到邮件？请检查您的垃圾邮件文件夹，或',
  Resend: '重新发送',
  Theemail: '邮箱',
  ForgetPassword: '忘记密码',
  Pleaseenteryouremail: '请提供账户注册所用的邮箱，我们将发送重置密码到您邮箱。',
  EmailAddress: '电子邮件',
  Send: '发送',
  Passwordresetsuccessed: '密码重置成功',
  Pleaseenteryour: '请输入您的新密码。',
  EnterNewPassword: '输入新密码',
  ConfirmPassword: '确认密码',
  ResetPassword: '重置密码',
  Enteryouremail: '输入您的邮箱',
  Enteravaildemial: '输入有效电子邮件',
  SignIn: '登录',
  SetPassword: '设置密码',
  Enteryourpassword: '输入您的密码',
  Passwordsnotmatch: '密码输入错误',
  SignUp: '注册',
  Unavailable: '不可用',
  FreeTrial: '免费试用',
  Basic: '基础版',
  Essential: '专业版',
  Enterprise: '企业版',
  ByclickingSign: '点击注册即表示您同意我们的',
  EndUserLicense: '用户许可协议',
  Alreadyhaveanaccount: '账户已存在',
  Pleaseloginagain: '请重新登录！',
  Used: '使用',
  TOTAL: '总计',
  LEFT: '剩余',
  CONCURRENT_TITLE: '项目数量',
  DEPLOY_TITLE: '预测行数',
  PROJECT_TITLE: '模型数量',
  STORAGE_TITLE: '存储空间',
  MONTHLY_SUBSCRIPTION_USD_NAME: '每月订阅（USD）',
  MONTHLY_SUBSCRIPTION_RMB_NAME: '每月订阅（RMB）',
  ANNUAL_SUBSCRIPTION_USD_NAME: '年度订阅（USD）',
  ANNUAL_SUBSCRIPTION_RMB_NAME: '每年订阅（RMB）',
  RESOURCE_PRIORITY_NAME: '资源优先级',
  NUMBER_OF_USERS_NAME: '用户数量',
  MODELING_DATA_SIZE_NAME: '建模数据大小',
  NUMBER_OF_CONCURRENT_PROJECTS_NAME: '项目数量',
  NUMBER_OF_PROJECTS_NAME: '当前项目数量',
  NUMBER_OF_MODEL_TRAINING_RUNS_NAME: '模型数量',
  ADDITIOANL_MODEL_TRAINING_RUNS_USD_NAME: '追加模型训练 （USD）',
  ADDITIOANL_MODEL_TRAINING_RUNS_RMB_NAME: '追加模型训练（RMB）',
  DATA_SOURCE_SUPPORT_NAME: '数据源支持',
  STORAGE_SPACE_NAME: '存储空间',
  NUMBER_OF_PREDICTIONS_INCLUDED_NAME: '预测数量',
  ADDITIONAL_PREDICTIONS_USD_NAME: '追加预测（USD）',
  ADDITIONAL_PREDICTIONS_RMB_NAME: '追加预测（RMB）',
  API_ACCESS_NAME: 'API 访问',
  TECH_SUPPORT_NAME: '技术支持',
  UNLIMITED: '无限制',
  UNAVAILABLE: '不可用',
  FREE_TRAIL: '免费试用',
  BASIC: '基础版',
  ESSENTIAL: '专业版',
  ENTERPRISE: '企业版',
  FORMAT_YEAR: 'MM/DD/YYYY',
  DEADLINE: '有效日期',
  CREATE_TIME: '创建时间',
  Database: '数据库',
  DataSource: '数据源',
  APISource: 'API源',
  DataNotFound: '未发现数据',
  DeploymentOption: '部署选项',
  DeploymentNotFound: '未发现部署',
  SearchProject: '搜索项目',
  TokenNotFound: '未发现识别码',
  ValidationDataDefinition: '所需变量名称',
  TrueorFalseBinaryClassification: '二分类',
  ContinuousValuesRegression: '回归',
  Upgrade: '更新',
  Header: '表头',
  Row: '行',
  Yes: '确定',
  Nop: '取消',
  PossibleReasons: '可能原因',
  Itsthewrongtargetvariable: '错误目标变量',
  ReselectTargetVariable: '重新选择目标变量',
  Itsgeneraldataqualityissue: '数据质量问题',
  Thetargetvariablehassomenoise: '目标变量质量问题',
  Fixit: '质量修复',
  ChangeTargetVariableValue: '重命名',
  RemapTarget: '重新选择修复方案',
  TargetVariableUniqueValue: '目标变量类别个数',
  YourUniqueValue: '类别个数',
  AllDatatotalRawLinesrows: '所有数据',
  Rowsminimum: '1000行（最小）',
  Datasize: '数据大小',
  Rowsisrecommended: '建议：1000行以上',
  Dataissuesarefound: '检测出数据质量问题',
  MissingValueS: '缺失值',
  mismatch: '数据类型不匹配',
  outlierRow: '异常值',
  CleanDataS: '干净数据',
  R2Learnwillfixtheseissuesautomatically: 'R2 Learn将自动修复这些问题',
  EdittheFixes: '质量修复',
  Datasizewillbesmallerthantheminimumsizeafterdelete: '删除后，数据大小将小于最小行数',
  Pleaseselecttwovalid: '请选择两个有效类别',
  Selectallvaluesthatmatchas: '请选择把其它类别映射成',
  MATAHC: '',
  Matchas: '映射为',
  Therestvalueswillbedeletedbydefault: '未选择类别将被默认删除。',
  Thankyouforfixingddatassues: '感谢您对数据问题的修复',
  Thechangeswillnotshowupuntil: '更改将在训练执行后显示。',
  Back: '返回',
  Next: '下一步',
  VariableName: '变量名',
  QuantityofMismatch: '不匹配的数量',
  MostFrequentValue: '众数',
  Fix: '修复方案',
  Replacewithmostfrequentvalue: '替换为众数',
  Deletetherows: '删除整行',
  Replacewith:"替换为",
  Replacewithauniquevalue: '替换为新类别',
  Replacewithmeanvalue: '替换为平均值',
  Replacewithminvalue: '替换为最小值',
  Replacewithmaxvalue: '替换为最大值',
  Replacewithmedianvalue: '替换为中位数',
  ReplaceWith0: '替换为“0”',
  Replacewithothers: '替换为其它值',
  MissingReason: '缺失原因',
  QuantityofMissingValue: '缺失值数量',
  Idonknow: '原因不明',
  Leftblankonpurpose: '有意留空',
  FailedtoCollectorDataError: '数据收集错误',
  ValidRange: '有效范围',
  QuantityofOutlier: '异常值数量',
  DoNothing: '不处理忽略',
  Apply: '应用',
  Found: '发现问题',
  YourtargetvariableHas: '您的目标变量的类别个数',
  Less: '少于',
  More: '多于',
  Thantwouniquealues: '包含噪音',
  onlyOnevalue: '只有一个',
  Targetvariablequalityisgood: '未检测出目标变量质量问题',
  Optional: '可选的',
  After: '重复',
  DeploymentpagewillprovidedeploymentIdandtokenparameter: '部署页面将提供deploymentId和token参数',
  Response: '响应',
  predictresult: 'predict resul',
  errorcodeifsuccess: 'error code, 10000 if succes',
  humenreadableinformation: 'humen readable information',
  originalerrorinformation: 'original error information, this field only exist if some error appear',
  dataisnotavalidJSONstring: '数据不是有效的JSON字符串',
  dataisemptyor: '数据为空或不是有效数组',
  fileuploaderror: '文件上传错误',
  fileuploaFrror: '文件上传失败',
  predicterror: '预测错误',
  predictf: '预测失败',
  invalidtoken: '无效token',
  exceedpredictionusageimit: '超过预测使用限制',
  exceedpredictionapiimit: '超过预测api限制',
  downloadpredictesultfailed: '下载预测结果失败',
  predictresultisempty: '预测结果为空',
  Yourcsvdata: '你的csv数据',
  DataImport: '导入数据',
  Kindly_Reminder: '提醒',
  Yourusageofnumberofconcurrent: '您的并行项目使用数量已达到当前权限的上限。',
  Change: '更改',
  Ifyoucanestimatethebusiness: '如果您可以估计模型正确预测带来的商业收益和错误预测产生的损失，我们可以依据您的估计优化模型参数，推荐更适合的模型。',
  Basedonyourbizscenario: '根据您的业务情况，',
  EventDistribution: '事件分布：',
  A: '1.',
  B: '2.',
  Resultbasedonthedataset: '以下结果基于数据集的事件分布为',
  Events: '',
  Theoverallbenefit: '整体收益：',
  Boththebenefitandcost: '收益和损失的输入范围是0.00至1,000,000,000.00。',
  Eventdistributioninputranges: '事件分布的输入范围是0.00到100.00。',
  NoteAllinputsentered: '注意：所有输入最多可以包含2位小数。',
  Eventdistributionistheproportion: '事件分布是整个数据集中需要预测的事件发生的比例（例如，贷款违约客户占所有客户中的比例）。 估计的收益和损失将受到这个分布的影响。 事件分布越高，正确或错误预测事件发生带来的收益和损失就越大，对非事件预测（例如，对非贷款违约客户的预测）则情况相反。 该关系在上述公式中有解释，其中',
  Isthedefaulteventdistribution: '是上传训练数据中的默认事件分布。',
  Istheuserprovideddistribution: '是实际业务场景中用户提供的事件分布。',
  Thedistributionof: '上传数据中“是”类别的分布为10％，但是用户认为违约事件的实际分布在20％左右',
  R2Learnthenautomaticallyfinds: 'R2 Learn将会通过优化模型阈值使收益最大，并且推荐最优模型。',
  Thatmaximizethebenefit: '',
  Yourusageofmodelingdata: '您的建模数据量超出当前权限最大限制。',
  Missingparams: '缺少参数',
  Modelingfiletoolarge: '建模文件太大了',
  Storagespacefull: '存储空间已满',
  Uploaderror: '上传错误',
  Resettodefault: '重置',
  FX: '函数',
  NAME: '变量名',
  price: '价格',
  ADD: '新建',
  Average: '',
  PointNumber: '组编号',
  NewAverage: '的平均值',
  RawData: '原始数据',
  GroupNumber: '组数：',
  PredictedAverage: '预测值（均值）：',
  ActualAverage: '实际值（均值）：',
  DataPreprocessing: '数据预处理',
  FeaturePreprocessing: '特征预处理',
  ModelTraining: '模型训练',
  RootMeanSquareErrorRMSEmeasures: '均方根误差（RMSE）测量模型的预测误差。标准化（Normalized）RMSE将帮助您比较模型性能：越小越好。',
  Problemstatement: '',
  Businessvalue: '',
  SpeedvsAccuracy: '建模速度vs准确率',
  LiftsCharts: 'Lift图',
  ROCCurves: 'ROC曲线',
  Speedms1000rows: '建模速度(行/秒)',
  Percentage: '百分比',
  TruePositiveRate: '真阳率',
  FalsePositiveDate: '假阳率',
  GOOD: '优秀',
  Yourusageofnumberofdeploylineshas: '部署行数已达到出当前权限最大限制。',
  Aftercompleted: '点击"完成"后',
  Empty: '未填写',
  Custom: '自定义',
  S: '日',
  M: '一',
  T: '二',
  W: '三',
  TH: '四',
  F: '五',
  SA: '六',
  Default: '默认',
  CloseDataTable: '关闭数据表格',
  empty: '未填写 ',
  correctly: '正确',
  incorrectly: '错误',
  True: '真',
  False: '假',
  Positive: '阳类',
  Negative: '阴类',
  monSubUsd: "每月订阅（USD）",
  monSubRmb: "每月订阅（RMB）",
  annSubUsd: "年度订阅（USD）",
  annSubRmb: "每年订阅（RMB）",
  priority: "资源优先级",
  userAmount: "用户数量",
  userModelingRestriction: "建模数据大小",
  userConcurrentRestriction: '项目数量',
  userCommandRestriction: "当前项目数量",
  userProjectRestriction: "模型数量",
  addRunUsd: "追加模型训练 （USD）",
  addRunRmb: "追加模型训练（RMB）",
  supportSources: "数据源支持",
  userStorageRestriction: "存储空间",
  userDeployRestriction: "预测数量",
  addPreUsd: "追加预测（USD）",
  addPreRmb: "追加预测（RMB）",
  api: "API 访问",
  support: "技术支持",
  UnsupervisedLearning: '非监督',
  Clustering: '聚类',
  OutlierDetection: '异常值检测',
  ProbabilityThreshold: '概率阈值',
  percentage: '百分比',
  lift: '提升',
  ProbabilityDensity: '概率密度',
  Truevalue: '真实值',
  Predictvalue: '预测值',
  Residual: '残差',
  EnsembledModel: '集成模型',
  Onehotencoding: 'One Hot Encoding',
  Rescaling: 'Rescaling',
  Imputation: 'Imputation',
  Banlance: 'Balance',
  extremlrandtreesprepr: 'Extra Trees',
  ICA: 'Fast ICA',
  FeatureAgglomeration: 'Feature Agglomeration',
  kernelPCA: 'Kernel PCA',
  KitchenSinks: 'Kitchen Sinks',
  LinearSVMprepr: 'Linear SVM。',
  NoPreprocessing: 'No Preprocessing',
  NystroemSampler: 'Nystroem Sampler',
  PCA: 'PCA',
  Polynomial: 'Polynomial',
  RandomTreesembed: 'Random Trees',
  SelectPercentile: 'Select Percentile',
  SelectRates: 'Select Rates',
  colortheme: 'color_theme',
  colorsize: 'color_size',
  themesizel: 'theme_size',
  colorthemesize: 'color_theme_size',
  tax: 'tax',
  taxdiffr1: 'tax_diff_r1',
  taxdiffr2: 'tax_diff_r2',
  dailysales: 'daily_sales',
  dailysalesaccum: 'daily_sales_accum',
  dailycost: 'daily_cost',
  dailycostaccum: 'daily_cost_accum',
  age: 'age',
  agevalb3: 'age_val_b3',
  age1valb4: 'age1_val_b4',
  age1freb4: 'age1_fre_b4',
  age2valb4: 'age2_val_b4',
  age2freb4: 'age2_fre_b4',
  agecusb3: 'age_cus_b3',
  agecusb4: 'age_cus_b4',
  ChooseaVariableScalingMethod: '请选择标准化方法',
  minmaxscale: 'Min Max Scale',
  standardscale: 'Standard Scale',
  robustscale: 'Robust Scale',
  FromSQL: '来自SQL',
  ProjectReport: '项目记录',
  Hostname: '主机名',
  Port: '端口',
  DatabaseType: '数据库类型',
  TableName: '表名',
  SQLoptional: 'SQL（可选）',
  SQLforquery: '用于查询的SQL',
  DatabaseEncoding: '数据库编码',
  optional: '可选',
  Username: '用户名',
  Yourdatabaseusername: '数据库用户名',
  Password: '密码',
  Yourdatabasepassword: '数据库密码',
  RememberMyPassword: '记住密码',
  RememberMyConnectionProfile: '保存连接信息',
  CONNECT: '连接',
  Yourtablename: '你的表名',
  DatabaseName: '数据库名称',
  Eg: '例如：',
  NoteIfapredictionbringsyou: '注意：如果预测给你带来损失，那就是成本; 如果预测结果为您带来利润，那么这是一种好处。 所有输入应在同一单位测量。',
  Report: '报告',
  Exports: '导出',
  Export: '导出',
  CostBased: '基于成本',
  NotSatisfied: '不满意',
  ExportingReport: '导出报告',
  preparingunivariateplot: '导出散点图。',
  preparinghistogramplot: '导出直方图。',
  preparingvariabledata: '导出变量。',
  preparingvariablepreimportance: '导出变量重要性。',
  preparingvariablecorrelationmatrix: '导出相关性矩阵。',
  downloadingplots: '导出图示。',
  generatingreportfile: '生成报告',
  init: '完成',
  Weight: '权重',
  BeforeETL: '数据清洗前',
  AfterETL: '数据清洗后',
  DataQualityIssuesandFixMethod: '数据质量问题和修复方法',
  SummaryofFixes: '质量修复总结',
  Profile: '信息',
  ProjectStatement: '项目描述',
  ProblemType: '问题类型',
  ExploratoryDataAnalysis: '探索性数据分析',
  ModelResult: '模型结果',
  Metrics: '度量指标',
  ConfusionMatrix: '混淆矩阵',
  Charts: '图表',
  VariableImpactnotavailableforthisalgorithm: '该算法不支持计算变量重要性',
  SetMaxTrainingTime: '设置最长训练时间',
  Maxamountoftimetoevaluatedifferentmodules: '单个模型估计搜索时间',
  Minutes: '分钟',
  minutesorlonger: '5分钟或更长时间',
  NoMoreThan: '不超过',
  Auto: '自动',
  SimpleView: '简单视图',
  Youcanalsotellusyourbusinessneedstogetamorepreciserecommendation: '您还可以告诉我们您的业务需求，以获得更精确的建议',
  ContaminationRate: '异常值比例',
  TheNumberofClusters: '聚类个数',
  Score: '评分',
  SihouetteScore: 'Sihouette Score',
  exportreporterror: '导出报告异常。',
  Inputyourcostorbenefitofeveryredictionresult: '输入每个预测结果的成本或收益：（0~100）',
  MappingDictionary: '映射字典',
  Explaination: '可解释性',
  pleaseenteryourhostname: '请输入您的主机名',
  invalidhostport: '无效的主机端口',
  invaliddatabasetype: '无效的数据库类型',
  pleaseenteryourdatabasename: '请输入您的数据库名称',
  pleaseenteryourtablename: '请输入您的表名',
  pleaseenteryourdatabseusername: '请输入您的数据库用户名',
  pleaseenteryourdatabsepassword: '请输入您的数据库密码',
  PleaseSelectaCategoricalVariable: '请选择一个离散变量',
  Encoding: '映射值',
  Origin: '原始值',
  Choose2Variables: '请选择两个变量',
  Youcanadjustthecontaminationrate: '滑动改变异常值比例',
  Choose2or3Variables: '请选择两个或三个变量',
  Result: '结果',
  Ss: '',
  ScoreHint: '评估异常值检测模型的参考性评分，取值范围为0~1，分数越高代表模型效果越好。',
  ContaminationRateHint: '异常样本占所有数据样本的比例。',
  CVNNHint: '综合考虑聚类类别间紧密度与可分割性的指标，该值范围在0到2之间。一般该值越小说明模型效果越好。',
  TheNumberofClustersHint: 'TheNumberofClustersHint',
  squaredHint: '聚类类别间方差占样本总体方差的比例，直观理解是样本在多大程度(百分比)上可以被区分开来。该值范围在0到1之间，在聚类类别数k相同情况下，该值越大说明模型效果越好。',
  SihouetteScoreHint: '样本总体轮廓系数的均值，该值范围在-1到1之间。一般该值越大说明模型效果越好。',
  CHIndexHint: '聚类类别间与聚类类别内分散程度的比值，一般该值越大说明模型效果越好。',
  clustersHint: 'clustersHint',
  RMSSTDHint: '每个聚类类别内样本与聚类中心的欧式距离和的均值，在聚类类别数一定的情况下，一般该值越小说明模型效果越好。',
  clusters: '聚类类别',
  ImportantVariables: '重要变量',
  Cluster: '聚类类别',
  ClusteringHint: '对样本进行分类，把相似样本归为同一类。（例如：客户分群与画像）',
  OutlierDetectionHint: '识别与其他样本差异过大的低频、可疑样本。（例如：信用卡欺诈行为侦测）',
  ExplainationHint: '展示对每一个聚类类别重要的变量。',
  Doyouwanttotreatnull: '是否把缺失值设置为有效类别？',
  cannotDeploy: '提示：您选择的模型仅支持对原始训练数据进行部署。',
  TargetValues: '目标变量类别',
  MissingValues: '缺失值',
  PrecisionRecallTradeoff: '精准率召回率曲线',
  KindlyReminder: '提示',
  Null: '缺失值',
  VariableFormula: '创建新变量',
  FormField: '变量',
  ProjectDescription: '函数功能说明',
  base: '基础函数',
  senior: 'R2自定义函数',
  ClusterReason: '您的数据在该模型上的预测类别数为1类，故不显示度量指标。',
  Replacewithlower: '替换为下界',
  Replacewithupper: '替换为上界',
  Pleaseinputsomecontentsforthesubmissio: '请输入提交的内容。',

  Variablename: '变量名称',
  formula: '公式',
  Exportmodelresults: '导出模型结果',

  ClusterInfReason: '该指标数值溢出',
  DataQualityFixing: '数据质量修复',
  none: '无',
  VarianceExplained: '方差解释比例',
  VarianceExplainedTip: `该表格按照特征根的大小降序排列。主成分的特征根越大，对整个数据的代表能力越强，因而也越重要。一般而言，我们选择累计解释百分比达到0.8及以上的全部主成分即可代表整个数据。<br/>
                        比如：在以下例子中，我们认为选择前三个主成分就已经具有足够代表性。<br/>
                        <img src="/VarianceExplainedTip.png" alt=""/>
                        `,
  PC: '主成分',
  Eigenvalue: '特征根',
  ComulatedProportion: '累计解释百分比',
  Choose2PCs: '请选择两个主成分',
  Choose2PCsTip: `<section style="height:400px;overflow:auto;">
                <strong>怎么使用这个功能？</strong><br/>
                  请选择任意两个主成分。默认显示最重要的两个主成分。<br/>
                  <strong>首先</strong><br/>
                  下方左侧的图展示的是主成分和原始变量之间的相关性，利用该图，您可以更方便地理解主成分。<br/>
                  以下图为例：<br/>
                  （1）沿着x轴可以看出，PC1和变量x4强正相关，和x6强负相关，PC1被这两个变量主导，其余变量的影响稍弱；<br/>
                  （2）沿着y轴可以看出，PC2和变量x5强正相关，PC2被它主导，其余变量的影响稍弱；<br/>
                  <img src="/Choose2PCsTip1.png" alt=""><br/>
                  <strong>接着</strong><br/>
                  下方右侧的散点图，以您选中的主成分为坐标轴。将聚类的结果以不同颜色的点展示在图上。您可以清晰地看出每一个类的样本具有什么特点。<br/>
                  结合上图，并以下图为例：<br/>
                  （1）第一个主成分把两类区分开了，所以x4和x6是区分两个类的关键变量；<br/>
                  （2）第0类（蓝色）在PC1上取值偏大，参照该主成分和原始变量的相关性关系，这表示原始变量中x4取值大而x6取值小的样本，被聚集在了这一类中；第1类（绿色）恰好相反。<br/>
                  <img src="/Choose2PCsTip2.png" alt="">
                </section>
                `,
  PCSTitle: '原始变量和主成分的相关性：',
  ScatterPlotOfPCs: '主成分散点图：',
  FeatureCreationSelection: '新建特征与特征选择',
  PCAIntro: "PCA（主成分分析）是一种传统的降维方法，可以提取出少数几个具有代表性的主成分作为高维数据的代表。",
  watchtheinstructionalvideos: '是否观看教学视频？',
  Dontpromptforthismessage: '不再提示该信息 ',
  YES: '是',
  NO: '否',
  Logconversionofthe2: '以2为底数，对所选变量进行Log转换。',
  VarContinuousvariablestartingwiththesymbol: 'var- 连续变量，以@符号开头。',
  Description: '说明：',
  Negativenumbersinvariableswill0: '变量中存在负数将被自动替换成0',
  Logconversionofthe10: '以10为底数，对所选变量进行Log转换。',
  Logconversionofthee: '以e为底数，对所选变量进行Log转换。',
  Calculatethenthpoweroftheselectedvariable: '计算所选变量的n次方。',
  Npositiveornegativeintegerordecimal: 'n- 实数。',
  Whenthereturnvalueexceedsthememory: '返回数值超出内存后将用系统默认最大最小值替代。',
  Comparestwovariablesforequality: '比较两个变量是否相等，相等返回1，不相等返回0。',
  Var1Adiscretevariable: 'var1- 离散变量或连续变量，以@符号开头。',
  Var2Adiscretevariable: 'var2- 离散变量或连续变量，以@符号开头。',
  Return01result: '返回0/1结果',
  Whenasinglevariableisentered: '输入单个变量时，返回该变量的总和；输入多个变量时，返回行的总和。',
  Var1var2var3continuousvariables: 'var1, var2, var3, ….- 连续变量，以@符号开头。',
  Whenasinglevariableisenteredtheminimumvalue: '输入单个变量时，返回该变量的最小值；输入多个变量时，返回行的最小值。',
  Whenasinglevariableisenteredtheminimumvaluemax: '输入单个变量时，返回该变量的最小值；输入多个变量时，返回行的最大值。',
  Whenasinglevariableisenteredtheminimumvaluemaxmean: '输入单个变量时，返回该变量的均值；输入多个变量时，返回行的均值。',
  Thisratiowilldetermine: '该比例将决定模型部署结果',
  normal: '正常',
  abnormal: '异常',
  Scaleseachfeaturetothegivenrange: '将每一个特征标准化到0和1之间，公式为: (x - 最小值) / (最大值 - 最小值)。',
  Centereachfeaturetothemean: '将每一个特征标准化到均值为0，标准差为1，即服从标准正态分布。公式为: (x - 平均值) / 标准差。',
  Centereachfeaturetothemedian: '将每一个特征进行如下变换，公式为: (x - 中位数) / (上四分位数 - 下四分位数)。该变换对异常值更为稳健。',
  Youcangivehigherweightstofeatures: '您可以给您认为重要的变量设置更高的权重。取值范围为0.1~99.9，调节步长为0.1。',
  restore: '还原',
  Groupaverage: '的组内平均值',
  DropTheseVariables: "删除下列特征",
  CreateTheseVariables: "新增下列特征",

  Interactive: 'Interactive',
  Interactive_descr: 'Interactive函数对选择的变量进行两两相乘操作，生成新变量',
  Interactiverange_grammar: 'Interactive(@var1, @var2, @var3, …)',
  Interactive_input: 'var1, var2, var3, ….-连续变量，以@符号开头，最多支持选择20个变量。',
  Interactive_output: '连续变量',
  Interactive_example: 'Interactive(@age, @income)',

  func_note: '说明',

  Box_cox: 'Box_cox',
  Box_cox_descr: 'Box_cox函数对选择的变量进行以lambda为参数的Box-Cox转换。',
  Box_cox_grammar: 'Box_cox(@var, lambda)',
  Box_cox_input: 'var- 连续变量，以@符号开头。',
  Box_cox_input1: 'lambda- 实数，不输入lambda时默认根据最大化似然函数选择最优lambda值。',
  Box_cox_output: '连续变量',
  Box_cox_example: 'Box_cox(@duration)',
  Box_cox_example1: 'Box_cox(@duration,0.5)',
  Box_cox_note: 'Box_cox(@duration)',
  Box_cox_note_txt: '1. 变量中存在小于0的数时，变量将被平移处理成大于等于1的范围。',
  Box_cox_note_txt1: '2. 不合理的lambda输入可能引起错误，建议范围-5.00~5.00，支持小数点后两位小数。',

  Number_extraction: 'Number_extraction',
  Number_extraction_descr: 'Number_extraction函数可以提取选择变量中的数字信息。',
  Number_extraction_grammar: 'Number_extraction(@var)',
  Number_extraction_input: 'var- 离散变量，以@符号开头。',
  Number_extraction_output: '连续变量',
  Number_extraction_note_txt: '当变量中含有多个间隔数字时，提取后数字将被合并。',
  Number_extraction_example: 'Number_extraction(@percent)',

  Substring: 'Substring',
  Substring_descr: 'Substing函数可以通过指定位置提取变量信息。',
  Substring_grammar: 'Substring(@var1, [position1, position2])',
  Substring_input: 'var- 离散变量，以@符号开头。',
  Substring_input1: 'position1, position2- 大于等于0的正整数，position1为提取变量的起始位置，position2为提取字段的结束位置。变量的起始位置从0开始， position2必须大于position1。',
  Substring_output: '离散变量',
  Substring_note_txt: 'position2如果超出变量长度将自动截取至变量结束位置。',
  Substring_example: 'Substring(@month, [3, 5])',

  Groupby: 'Groupby',
  Groupby_descr: 'Groupby函数通过指定主键变量（key）对选择变量进行统计计算。',
  Groupby_grammar: 'Groupby(@var, [@key1, @key2], [fun1,fun2,…])',
  Groupby_input: 'var- 连续变量或离散变量，以@符号开头。',
  Groupby_input1: 'key1， key2- 离散变量，用以对选择变量进行分组的主键变量。最多支持选择2个主键变量（2级统计），只选择一个主键变量时，“[]”可省略，所有变量以@符号开头。',
  Groupby_input2: 'fun1, fun2,…- 对变量的统计函数，只选择一个fun时，“[]”可省略；',
  Groupby_input3: 'var为连续变量时，支持 [sum, mean, min, max, std, median]；',
  Groupby_input4: 'var为离散变量时，默认支持 mode（众数）统计。',
  Groupby_output: '连续变量或离散变量',
  Groupby_example: 'Groupby(@duration, [@job], [sum, median])',
  Groupby_example1: 'Groupby(@duration, [@job, @education], [mean, min])',
  Groupby_example2: 'Groupby(@job, [@education])',
  Minimum:'最小值',
  Maximum:'最大值',
  TargetMore2Unique:"目标变量类别数量超过2个",
  Areyousuretodeletethismodeldeployment:'您确定要删除此模型部署吗？ 此操作无法恢复。',
  DropTheRows:'删除整行',
  Mapping:"映射",
  value:'值',
  SelectFeature: '选择特征预处理',
  errorparams:'错误参数',
  ResidualRate:'残差率',
  ResidualPercent:'误差百分比',
  InputRanges:'输入范围',
  ZoomRegion:'区域缩放',

};

export default ZH_LAN;

