 import React, { Component ,Fragment} from "react";
import styles from "./styles.module.css";
import WayPoint from 'react-waypoint';

export default class Article extends Component {

  changeHash(hash){
    this.props.changeSelectedKeys(hash)
  }

  one(){
    return <Fragment>
      <WayPoint
        onEnter={this.changeHash.bind(this,'1')}
      >
        <a name="1" className={styles.h1}>1. 概览</a>
      </WayPoint>

      R2-Learn可帮助公司快速将数据转换为机器学习模型，而无需AI（人工智能）专业知识。 R2-Learn采用最先进的技术，用AI全程助您使用您的数据创建模型，部署模型，实时迭代模型。
      <div>本节介绍机器学习的关键概念及其与R2-Learn的关系。</div>
      <WayPoint
        onEnter={this.changeHash.bind(this,'1.1')}
      >
        <a name="1.1" className={styles.h2}>1.1. 机器学习</a>
      </WayPoint>
      机器学习是AI的一个分支，其本质是训练计算机从数据中学习。随着算力的提升，机器学习可发现海量数据中深藏的模式和关系。目前正在开发机器学习模型，以对物体进行分类，检测异常，预测结果，协助增加人的总体能力。现今机器学习模型已广泛地应用到物体分类，异常检测，预测结果，辅助增强人体能力等领域。
      <p className={styles.p}>
        如何用机器学习辅助业务决策？常见工作流程如下：
      </p>
      <dl>
        <dd><strong>1. 定义问题:</strong> 决定要用数据解决的问题。</dd>
        <dd><strong>2. 准备数据:</strong> 获取您要用于训练机器学习模型的数据集。</dd>
        <dd><strong>3. 清洗数据:</strong> 检查数据集中是否存在数据缺失和数据错误，用合适的方法修复数据集，提升数据质量。</dd>
        <dd><strong>4. 探索数据:</strong> 对数据有基本的了解，用于指导后续的分析和建模。</dd>
        <dd><strong>5. 预处理数据:</strong> 修改数据集的格式，使其适合后续生成机器学习模型。</dd>
        <dd><strong>6. 训练模型:</strong> 将数据用机器学习工具进行学习，生成模型。</dd>
        <dd><strong>7. 验证和分析建模结果:</strong> 检查生成的模型是否能达到预期的预测效果。</dd>
        <dd><strong>8. 部署模型:</strong> 模型达到可用标准后，将模型进行部署。模型部署通常会使用REST API端口进行部署。当您有新的数据希望预测时，您可调用此端口，它会为您返回预测结果。</dd>
        <dd><strong>9. 监控模型:</strong> 9.随着时间的推移，机器学习模型的表现会受到影响，从而影响其预测准确性。因此，您需要监控其性能，来确保预测结果的表现。</dd>
      </dl>
      <img src="/support1CH.png" alt=""/>
      一个经验丰富的数据科学家会经历以上所有流程。这些流程中每一步和每一个关键点做出的决策对于机器学习模型的质量都至关重要，模型的质量进而决定了预测的表现。目前的数据科学家们要靠经验和直觉找到最佳的模型，这个过程可能会非常的繁琐和缓慢，耗费极大，且可能会产生缺陷。

      <WayPoint
        onEnter={this.changeHash.bind(this,'1.2')}
      >
        <a name="1.2" className={styles.h2}>1.2. 使用R2-Learn进行机器学习</a>
      </WayPoint>
      R2-Learn 是一个用AI进行大规模，自动化，标准化机器学习建模的平台，使机器学习的业务落地更方便，快捷，准确。
      <p className={styles.p}>
        R2-Learn 机器学习工作流程如下：
      </p>
      <img style={{width:'55%'}} src="/supportCH2.png" alt=""/>
      <dl>
        <dd><strong>1.	创建一个项目：</strong> 1.在R2-Learn中新建一个项目。 </dd>
        <dd><strong>2.	描述您的业务问题：</strong> 2.描述您想解决的业务问题，帮助您理清项目目标和预期结果。</dd>
        <dd><strong>3.	使用您的数据： </strong>3.将您的训练数据集上传到R2-Learn。 R2-Learn使用机器学习来帮助您检查和清洗数据集。</dd>
        <dd>
          <strong>4.	建模:</strong> 4.数据集加载至R2-Learn平台后，您可选择以下方式进行建模：
          <ul>
            <li> –	<strong>自动建模:</strong>–R2-Learn使用训练集自动创建机器学习模型。</li>
            <li> –	<strong>A高级建模：</strong> –您可自行选择变量，创建新变量，选择算法等创建新模型。</li>
          </ul>
        </dd>
        <dd>
          <strong>5.	部署: </strong>机器学习模型创建后，R2-Learn将自动在您的服务器上部署模型，并允许您:
          <ul>
            <li> –	<strong>使用数据源预测:</strong> 将R2-Learn连接到您的数据库或上传CSV文件进行预测。</li>
            {/*<li >–	<strong>Predict with API:</strong> Use R2-Learn’s REST API to make predictions on your input data with your R2-Learn machine learning models.</li>*/}
          </ul>
        </dd>
      </dl>
      模型部署后，您可监控模型的预测性能，并在模型低于指定阈值时更新模型。
    </Fragment>
  }

  two(){
    return <Fragment>
      <WayPoint
        onEnter={this.changeHash.bind(this,'2')}
      >
        <a name="2"  className={styles.h1}>2. 2. R2-Learn产品入门</a>
      </WayPoint>
      本章将带您创建您的第一个R2-Learn项目。
      <div>要开始您的第一个项目，请点击新建项目。</div>
      <WayPoint
        onEnter={this.changeHash.bind(this,'2.1')}
      >
        <a name="2.1" className={styles.h2}>2.1. 软件要求</a>
      </WayPoint>
      R2-Learn是一个可以在浏览器中运行的Web应用程序。
      <div>我们建议您使用：</div>
      <div>• 谷歌Chorme浏览器65 或者更新版.</div>
      <WayPoint
        onEnter={this.changeHash.bind(this,'2.2')}
      >
        <a name="2.2" className={styles.h2}>2.2. 导入数据</a>
      </WayPoint>
      您可以将数据导入R2-Learn中，可用于:
      <div>•  构建机器学习模型,以及</div>
      <div>•	对导入的数据进行预测。</div>
      R2-Learn支持以下导入数据的方法：
      <div>•	从数据库导入数据</div>
      [备注]试用版、简易版、专业版仅支持导入本地文件，企业版&本地部署版同时支持导入本地文件和从数据库中导入数据。
      <div>•	导入本地文件</div>

      <WayPoint
        onEnter={this.changeHash.bind(this,'2.2.1')}
      >
        <a name="2.2.1" className={styles.h2}>2.2.1. 从数据库导入数据</a>
      </WayPoint>
      R2-Learn支持从以下数据库导入数据:
      <div>•	Oracle Database 11G（支持ODBC 11.2链接）</div>
      <div>•	MySQL（5.5及以上版本）</div>
      这些数据库目前仅支持utf-8编码。
      <img src="/support3.png" alt=""/>
      <WayPoint
        onEnter={this.changeHash.bind(this,'2.2.2')}
      >
        <a name="2.2.2" className={styles.h2}>2.2.2. 导入本地文件</a>
      </WayPoint>
      您可导入UTF-8编码的CSV文件。该文件为训练集或输入数据。
      <div>您的CSV文件必须满足以下条件：</div>
      <div>•	有一个标题行。</div>
      [备注]如果您导入一个用于模型部署的CSV文件，则该CSV文件需满足以下条件：
      <div>•	使用UTF-8编码。</div>
      <div>•	需包含已部署的模型所需的所有变量，以及</div>
      <div>•	文件中的变量名需要与训练集中的变量名相同。</div>

      <WayPoint
        onEnter={this.changeHash.bind(this,'2.3')}
      >
        <a name="2.3" className={styles.h2}>2.3. 项目主页</a>
      </WayPoint>

      当您登录到R2-Learn，呈现在您眼前的是项目主页：
      <img src="/support4.png" alt=""/>
      在项目主页里，您可以：
      <dl>
        <dd>1.	<strong>创建</strong>新项目</dd>
        <dd>2.	<strong>打开</strong> 和 <strong>编辑</strong> 已存在的项目</dd>
        <dd>3.	<strong>删除</strong>一个项目</dd>
        <dd>4.	<strong>查找</strong>一个项目</dd>
        <dd>5.	<strong>对项目</strong> 排序.</dd>
      </dl>
      点击页面顶端的 <strong>部署,</strong>您会进入模型部署主页。
      <WayPoint
        onEnter={this.changeHash.bind(this,'2.4')}
      >
        <a name="2.4" className={styles.h2}>2.4. 主页-模型部署</a>
      </WayPoint>
      模型部署主页显示您创建的所有项目以及这些项目的部署/验证状态：
      <img src="/support5.png" alt=""/>
      <ul>
        <li><strong>部署/验证状态：</strong> 显示部署或验证任务的当前状态。 会有：</li>
        <li>•	<strong>正在运行：</strong> 任务当前正在运行。</li>
        <li>•	<strong>空闲：</strong> 项目没有正在运行的任务。</li>
        <li>•	<strong>问题：</strong> 项目在运行任务时遇到问题。 请创建一个新案例。</li>
        <li>•	<strong>已取消：</strong> •项目下的案例已取消。</li>
      </ul>
      {/*Click on a project to open it:*/}
      {/*<img src="/support6.png" alt=""/>*/}
      有关如何部署模型的更多信息，请参阅 <strong>部署模型。</strong>.
    </Fragment>
  }

  three(){
    return <Fragment>
      <WayPoint
        onEnter={this.changeHash.bind(this,'3')}
      >
        <a name="3" className={styles.h1}>3. 开始一个新项目</a>
      </WayPoint>
      本章将向您介绍如何使用R2-Learn的自动建模功能建立一个新的机器学习项目。
      <WayPoint
        onEnter={this.changeHash.bind(this,'3.1')}
      >
        <a name="3.1" className={styles.h2}>3.1. 创建一个项目</a>
      </WayPoint>
      当您首次登陆R2-Learn时，您将看到一个空的项目主页。单击<strong>“创建项目”</strong> 以启动新项目。
      <img src="/support7.png" alt=""/>
      <dl>
        <dd>您会进入<strong>项目</strong> 部分， R2-Learn会指引您：</dd>
        <dd>•	<strong>命名您的项目</strong>: 每个项目都有一个默认的名称，其命名格式为《年/月/日，时：分，秒》，您可按需修改项目名称。</dd>
        <dd>•	<strong>描述您的项目（可选）</strong>: 请输入您的简要项目说明。这会帮助您明确该项目的目的。 </dd>
        <dd>•	<strong>陈述您的问题（可选）</strong>: 您可记录项目的细节，这些记录有助于相关部门的持续跟踪和评估。</dd>
        <dd>•	<strong>陈述业务价值（可选）</strong>: 您可记录该项目的业务价值，这些记录可帮助在对项目做整体评估时，评价模型是否实现了这些业务价值。</dd>
      </dl>
      完成后，请点击 <strong>继续</strong>按钮。
      <WayPoint
        onEnter={this.changeHash.bind(this,'3.2')}
      >
        <a name="3.2" className={styles.h2}>3.2. 选择您的问题类型e</a>
      </WayPoint>
      在 <strong>问题</strong> 部分， 您可选择希望项目模型 <strong>预测的类型。</strong>
      <p>在 <strong>问题类型</strong> 要求您指定您希望项目模型提出的预测类型：</p>
      <dl>
        <dd>•	<strong>对错（二分类）: </strong>项目建立的模型将用于预测时间是否会发生。例如客户是否会购买该产品。</dd>
        <dd>•	<strong>连续值（回归）:</strong> 预测连续值/数值。例如根据给定的变量，预测转化一个客户的成本是多少。</dd>
      </dl>
      一旦您设置好您的 <strong>业务问题和问题类型后</strong>， 点击 <strong>继续</strong> 进入下一步，将您的数据上传到R2-Learn上。

      <WayPoint
        onEnter={this.changeHash.bind(this,'3.3')}
      >
        <a name="3.3" className={styles.h2}>3.3. 处理您的数据</a>
      </WayPoint>
      现在我们开始处理您的数据，<strong>数据</strong> 部分将引导您一起完成：
      <dl>
        <dd>1.	首先在 <strong>数据连接</strong>中上传您的数据；</dd>
        <dd>2.	然后在 <strong>数据概览</strong>中查看您的数据；</dd>
        <dd>3.	在数据质量中 <strong>控制您的数据质量。</strong></dd>
      </dl>
      高质量的训练集对机器学习是至关重要的。您的训练集需包含尽量多的与目标相关的信息。它应只包含与业务问题相关的信息，且样本量尽可能大。您可请专家确认训练集的质量。R2-Learn可用高质量的数据集完成机器学习其他所有工作。
      <p>
        当您上传数据后，R2-Learn会检测数据类型，检查数据质量，并自动修复问题或提醒您手动修复。
      </p>

      <WayPoint
        onEnter={this.changeHash.bind(this,'3.3.1')}
      >
        <a name="3.3.1" className={styles.h2}>3.3.1. 上传您的数据</a>
      </WayPoint>
      您可在 <strong>数据连接</strong> 选项中上传数据集。“数据连接”选项允许您选择要用于机器学习模型的数据集。
      <img src="/support8.png" alt=""/>
      如上图所示，您可将训练集加载至R2-Learn中。您可以用以下方式完成：
      <dl>
        <dd>•	连接数据库，</dd>
        <dd>•	上传本地文件。</dd>
      </dl>
      若您刚开始了解R2-Learn，您可使用R2-Learn提供的训练数据集。
      [重要]您上传的数据集必须包含标题行。
      <div>
        <strong>[备注]	试用版、简易版、专业版仅支持导入本地文件，企业版&本地部署版同时支持导入本地文件和从数据库中导入数据。</strong>
      </div>

      <WayPoint
        onEnter={this.changeHash.bind(this,'3.3.2')}
      >
        <a name="3.3.2" className={styles.h2}>3.3.2. 数据概览</a>
      </WayPoint>
      训练集加载完成后，R2-Learn会在 <strong>数据概览</strong>中展示训练集中的数据供您检查数据质量。您可按需进行以下修改：
      <dl>
        <dd>•	1. <strong>编辑标题行</strong></dd>
        <dd>•	2. <strong>确认每一列数据的数据类型</strong></dd>
        <dd>•	3. <strong>选择您的目标变量</strong></dd>
      </dl>
      [重要]您必须确认每一列的列名都是 <strong>唯一</strong>的。
      <img src="/support9.png" alt=""/>
      当您编辑过或修改过标题行之后，您可以检查R2-Learn为训练集中每列数据自动检测的<strong>数据类型。</strong> 若某列数据类型有误，请从该列的下拉菜单中选择正确的数据类型。
      <dl>
        <dd>每列有2种可能的数据类型：</dd>
        <dd>•	<strong>数值型:</strong>当该列的数据为一系列数值时。</dd>
        <dd>•	<strong>分类型:</strong>当该列中的数据为不同的类别时。</dd>
      </dl>
      [重要]数据类型的精确识别会影响机器学习模型。当您不确定某列数据的类别时，请咨询数据集的提供者。

      <dl>
        <dd>R2-Learn会根据您上传数据方式的不同，用不同的方式识别数据类型：</dd>
        <dd>•	当您从数据库中上传数据时， <strong>R2-Learn</strong>, 将展示数据库中提供的数据类型。</dd>
        <dd>•	当您从本地上传数据时， <strong>R2-Learn</strong>, 会自动推断每列的数据。</dd>
      </dl>
      当您确认过每列的数据类型后，请您希望机器学习模型预测的变量。目标变量的数据类型应与您在<strong>业务问题</strong> 模块中设置的问题类型相匹配。
      <p>单击 <strong>选择目标变量</strong> 的下拉菜单，选择变量。</p>
      您可单击 <strong>反选不需要的变量，</strong> 该操作用于移除对目标变量没有贡献的变量，和与目标变量拥有一对一映射关系的变量，例如：
      <dl>
        <dd>•	ID</dd>
        <dd>•	人名</dd>
        <dd>•	产品名</dd>
        <dd>•	目标变量的衍生变量 </dd>
        <dd>•	直接生成目标变量的变量</dd>
      </dl>
      例如，在预测一个人的年收入的数据集中，我们可以直接移除人名，月收入。被移除的变量将变暗，并在后续模型训练中被移除。
      <p>完成以上操作后，单击 <strong>继续</strong> 检查数据质量。</p>
      <p>如果您确定数据集足够干净以跳过数据提取，转换和加载，则可以单击“跳过” <strong>数据质量检查</strong> 继续建模。</p>

      <WayPoint
        onEnter={this.changeHash.bind(this,'3.3.3')}
      >
        <a name="3.3.3" className={styles.h2}>3.3.3. 数据质量</a>
      </WayPoint>
      在 <strong>数据质量</strong> 中，R2-Learn会检测数据中影响建模的问题，它会从以下 两个方面检查数据质量：
      <dl>
        <dd>•	1. 目标变量质量: R2-Learn会分析处理并显示目标变量的问题。</dd>
        <dd>•	2. 自变量质量: 目标变量质量问题修复后，R2-Learn将会检查数据集的其他部分是否存在问题。</dd>
      </dl>
      <img src="/support10.png" alt=""/>
      <dl>
        <dt>数据的常见问题 </dt>
        <WayPoint
          onEnter={this.changeHash.bind(this,'3.3.3.1')}
        >
          <a name="3.3.3.1" className={styles.h2}> </a>
        </WayPoint>
        <dd>R2-Learn会识别和修复以下两种问题：</dd>
        <dd>
          •	<strong>目标变量有2个以上唯一值:</strong> •在二分类业务问题中，目标变量必须有且只有2个不同的唯一值（通常为“是”和“否”）。
          <img src="/support11.png" alt=""/>
        </dd>
        <dd>•	<strong>数据类型错配:</strong>当变量的数据类型与之前设置的数据类型不匹配时，会有数据类型错配警告。例如，某列标记为数值型的数据里有一些文本值。</dd>
        <dd>•	<strong>缺失值: </strong>产生缺失值的原因既可能是数据未搜集，也可能是该数据点包含空值。</dd>
        <dd>[注意] 空值表示缺少数据，没有数据存在，与0值不同。</dd>
        <dd>•	<strong>异常值:</strong>当某列为连续值时，若某数据点超出预期范围，会被认为是异常值。检查异常值是不良的数据点还是真正的偏差非常重要。</dd>
      </dl>
      以上这些问题的可修复方法，请参阅<a href="#a">附录A：数据质量修复。</a>
      <dl>
        <dt>目标变量质量 </dt>
        <WayPoint
          onEnter={this.changeHash.bind(this,'3.3.3.2')}
        >
          <a name="3.3.3.2" className={styles.h2}> </a>
        </WayPoint>
        <dd>当<strong>R2-Learn</strong> 发现目标变量中存在的问题是，它会这些问题展示在数据质量中：</dd>
      </dl>
      <img src="/support12.png" alt=""/>
      <div>如果您的问题是二分类问题，且您的数据集中目标变量的值多余2个唯一值，您需要：</div>
      <div>•	单击 <strong>编辑修复</strong>, 如下图所示的弹出窗口会引导您选择2个有效值，并处理其他值。 </div>
      <img src="/supportn1.png" alt=""/>
      <dl>
        <dd>如果您的数据集在目标变量方面仍有其他问题，您可单击<strong>下一步</strong>，R2-Learn会自动修复问题，或您可以用以下方法手动修复：</dd>
        <dd>•	单击 <strong>编辑修复</strong>，可修改R2-Learn修改目标变量中存在问题的方法。具体方法详见附录A：数据质量修复。</dd>
        <dd>•	单击 <strong>重新选择目标变量</strong>，将会返回目标变量选项中，您可选择新的目标变量。</dd>
        <dd>•	单击 <strong>上传新数据集</strong>•，将返回至数据连接，您可选择要使用的新数据集（要取消此操作，请单击数据质量即可返回至当前页面）。</dd>
      </dl>
      <dl>
      <dt>自变量质量 </dt>
    <WayPoint
      onEnter={this.changeHash.bind(this,'3.3.3.3')}
    >
      <a name="3.3.3.3" className={styles.h2}> </a>
    </WayPoint>
    <dd>目标变量质量问题解决后，R2-Learn会继续检查其余所有变量的质量问题，并在此处显示结果。</dd>
  </dl>
  <img src="/supportn2.png" alt=""/>
      R2-Learn以提供默认修复方法。当您要自定义修复方法时，可进行以下操作：
      <dl>
        <dd>•	单击在目标变量质量章节中出现的 <strong>加载新数据集</strong> •可返回至数据连接，您可选择要是使用的新数据集。（要取消加载新数据集，请单击 <strong>数据质量</strong> ）。</dd>
        <dd>•	选择 <strong>编辑修复</strong>，会打开一个对话框，您可以自行选择修复数据的方式。</dd>
      </dl>
      <img src="/support14.png" alt=""/>
      关于常见修复方法，请参阅附录A：数据质量修复。
      <div>[注意]	S保存对数据的更改可能会花1-2分钟，请耐心等待。</div>
      •	以上完成后，您可看到如下图所示的数据概览，以及R2-Learn如何修复数据。
      <img src="/supportn3.png" alt=""/>
      单击 <strong>继续</strong>，开始建模。
      <WayPoint
        onEnter={this.changeHash.bind(this,'3.4')}
      >
        <a name="3.4" className={styles.h2}>3.4. 建模</a>
      </WayPoint>
      您已准备好开始构建机器学习模型！
      <div>您可以选择使用以下方法构建机器学习模型：</div>
      <dl>
        <dd> •	<strong>自动建模</strong>，或</dd>
        <dd> •	<strong>高级建模</strong></dd>
      </dl>
      <WayPoint
        onEnter={this.changeHash.bind(this,'3.4.1')}
      >
        <a name="3.4.1" className={styles.h2}>3.4.1. 自动建模</a>
      </WayPoint>
      <strong>自动建模</strong>会根据您处理过得训练集，自动为您构建机器学习模型。单击自动建模，R2-Learn将为您构建模型。
      <div>单击 <strong>自动建模</strong> 和R2-Learn将开始为您构建您的模型。</div>
      <WayPoint
        onEnter={this.changeHash.bind(this,'3.4.2')}
      >
        <a name="3.4.2" className={styles.h2}>3.4.2. 高级建模</a>
      </WayPoint>
      当您选择 <strong>高级建模</strong>，您可以更详细的控制建模过程。
      <div>具体信息请参阅附录B：高级建模。</div>
      <WayPoint
        onEnter={this.changeHash.bind(this,'3.4.3')}
      >
        <a name="3.4.3" className={styles.h2}>3.4.3. 建立您的模型</a>
      </WayPoint>
      <WayPoint
        onEnter={this.changeHash.bind(this,'3.4.3.1')}
      >
        <a name="3.4.3.1" className={styles.h2}/>
      </WayPoint>
      <p>完成上述所有建模前的配置，R2-Learn将开始建造您的机器学习模型。</p>
      如果R2-Learn无法从给定的训练数据集中训练出足够高效的机器学习模型，则模型训练过程可能会失败。如果模型训练失败，则必须重新配置项目以修复数据集质量问题，或选择新的或更大的数据集。
      <dl>
        <dt>模型选择 </dt>
        <dd>模型训练完成后，在<strong>模型选择</strong>部分，R2-Learn会展示模型训练结果。根据您不同的问题陈述，您可看到不同的图表：</dd>
        <dd>•	附录C：二分类问题的模型选择</dd>
        <dd>•	附录D：回归问题的模型选择</dd>
        <dd>模型选择后，单击部署，进行 <strong>部署模型</strong>。</dd>
      </dl>
    </Fragment>
  }

  four(){
    return <Fragment>
      <WayPoint
        onEnter={this.changeHash.bind(this,'4')}
      >
        <a name="4" className={styles.h1}>4. 部署模型</a>
      </WayPoint>
      通过部署模型，您可以对新的数据进行预测。这经常涉及到REST API端口。您可以将数据发送到该端口，并从中接收预测。
      <p>R2-Learn为您自动处理模型部署。一旦您成功地创建了机器学习模型，您可以点击其中包含的项目来访问已部署的模型：</p>
      <img src="/support15.png" alt=""/>
      在开放的项目中，您可看到以下部分：
      <dl>
        <dd>•	部署</dd>
        <dd>•	操作监控</dd>
        <dd>•	性能监控</dd>
        <dd>•	表现状态</dd>
      </dl>
      此外，您可访问以下：
      <img src="/support16.png" alt=""/>
      <dl>
        <dd>•	<strong>正在使用的模型： </strong>选择要运行部署或其他操作的模型。</dd>
        <dd>•	<strong>部署数据定义：</strong> 单击 <strong>“下载”</strong>，可以下载包含模型使用的变量列表的CSV文件。</dd>
        <dd>•	<strong>电子邮件接收警报：</strong>单击可以输入电子邮件地址，可发送与部署相关的警报。</dd>
      </dl>
      <WayPoint
        onEnter={this.changeHash.bind(this,'4.1')}
      >
        <a name="4.1" className={styles.h2}>4.1. 部署</a>
      </WayPoint>
      当您在模型部署主页打开一个项目时，您会进入模型部署。您可以选择使用已部署模型的方式：
      <dl>
        <dd>•	使用数据源预测: 使用本地文件或数据库中的数据进行预测。</dd>
      </dl>
      [重要]导入的数据必须与所使用的机器学习模型具有相同的变量。要下载包含导入数据集中所需变量列表的文件，请单击<strong>部署数据定义</strong> 旁边的<strong>下载</strong>。
      <img src="/supportn4.png" alt=""/>
      <WayPoint
        onEnter={this.changeHash.bind(this,'4.1.1')}
      >
        <a name="4.1.1" className={styles.h2}>4.1.1. 用数据源预测</a>
      </WayPoint>
      要对从数据源导入的数据进行预测：
      <div>1.	单击 <strong>使用数据源预测</strong>。</div>
      <div>2.	选择要从以下位置导入数据的数据源：</div>
      <dl className={styles.pl1}>
        <dd>–	<strong>数据库</strong>: –请提供链接的详细信息。请参阅从数据库导入数据。</dd>
      </dl>
      [备注] 试用版、简易版、专业版仅支持导入本地文件，企业版&本地部署版同时支持导入本地文件和从数据库中导入数据。
      <dl className={styles.pl1}>
        <dd>–	<strong>本地文件</strong>: –将文件上载到R2-Learn，其中包含要在其上运行预测的数据。有关更多信息，请参阅导入本地文件。</dd>
      </dl>
      3.	选择 <strong>结果位置</strong>, 3.模型预测的结果会保存在结果位置上:
      <dl className={styles.pl1}>
        <dd> –	<strong>在App中</strong>: 在R2-Learn中保存并显示结果。</dd>
        <dd> –	<strong>上传到数据库</strong>: 将结果写入给定数据库。</dd>
      </dl>
      4.	选择 <strong>部署频率</strong>。 4.R2会根据此频率进行部署：这告诉R2-Learn如何安排部署：
      <dl className={styles.pl1}>
        <dd >–	<strong>一次性</strong>: 设置部署以对数据源运行一次预测。</dd>
        <dd> –	<strong>自动重复</strong>: 请为您的部署设置一个定期重复计划。</dd>
      </dl>
      <img src="/support18.png" alt=""/>
      <dl>
        <dd> –	<strong>故障时自动禁用</strong>: 若R2-Learn出现故障时，请选择此项，会停止部署。</dd>
      </dl>

      {/*<WayPoint*/}
      {/*onEnter={this.changeHash.bind(this,'4.1.2')}*/}
      {/*>*/}
      {/*<a name="4.1.2" className={styles.h2}>4.1.2. Predict with API</a>*/}
      {/*</WayPoint>*/}
      {/*When you deploy your machine learning model in R2-Learn, a REST API endpoint is automatically generated for you to make requests to.*/}
      {/*<dl>*/}
      {/*<dd>To make a prediction with R2-Learn’s REST API, you need:</dd>*/}
      {/*<dd>•	An R2-Learn API KEY.</dd>*/}
      {/*<dd>•	Your R2-Learn user name.</dd>*/}
      {/*<dd>•	Your R2-Learn project name. For example, project 11/09/2018, 18:04:13.</dd>*/}
      {/*<dd>•	Your R2-Learn model name. For example, Ridge1.auto.09.11.2018_18:05:24.</dd>*/}
      {/*</dl>*/}
      {/*<div>To run a prediction using R2-Learn’s REST API with cURL and save the results to output.csv, run the following command in your terminal:</div>*/}
      {/*<code>curl -F 'data=@path/to/local/file' //service2.newa-tech.com/api/user_name/project_name/model_name/api_key -o output.csv</code>*/}
      {/*<div>You will need to write the URL encoded version of your project name and model name into the request. For example, project 11/09/2018, 18:04:13 as a URL encoded string is project%2011%2F09%2F2018%2C%2018%3A04%3A13, and Ridge1.auto.09.11.2018_18:05:24 as a URL encoded string is Ridge1.auto.09.11.2018_18%3A05%3A24.</div>*/}
      {/*<div>Your resulting cURL API request should look something like this:</div>*/}
      {/*<code>curl -F 'data=@/home/r2user/input_data.csv' //service2.newa-tech.com/api/r2user/project%2011%2F09%2F2018%2C%2018%3A04%3A13/Ridge1.auto.09.11.2018_18%3A05%3A24/apikey912ec803b2ce49e4a -o /home/r2user/output.csv</code>*/}
      {/*<div>You can also write the API request in Python:</div>*/}
      {/*<code>*/}
      {/*# API code*/}
      {/*<div>import requests</div>*/}
      {/*# Make predictions on your data*/}
      {/*<div>data = {`"file": open('/path/to/your/data.csv', 'rb')`}</div>*/}
      {/*{*/}
      {/*`Response = requests.post('//service2.newa-tech.com/api/<user_name>/<project_namr>/<model_name>/<api_key>', data)`*/}
      {/*}*/}
      {/*</code>*/}
      <WayPoint
        onEnter={this.changeHash.bind(this,'4.2')}
      >
        <a name="4.2" className={styles.h2}>4.2. 监控已部署的模型</a>
      </WayPoint>
      <dl>
        <dd>您可使用以下功能监控和调整已部署的模型：</dd>
        <dd>•	运行监控</dd>
        <dd>•	性能监控</dd>
        <dd>•	性能状态</dd>
      </dl>
      <WayPoint
        onEnter={this.changeHash.bind(this,'4.2.1')}
      >
        <a name="4.2.1" className={styles.h2}>4.2.1. 运行监控</a>
      </WayPoint>
      <dl>
        <dd>此页面展示了所有与模型有关的运行信息。对于每次运行，都会显示以下信息：</dd>
        <dd>•	<strong>模型名称</strong>: 运营的模型名称；</dd>
        <dd>•	<strong>部署时间</strong>: 运行开始时间；</dd>
        <dd>•	<strong>结束时间</strong>: 运行结束时间； </dd>
        <dd>•	<strong>部署方式</strong>: R2-Learn如何连接到输入数据：通过数据库连接，或上传本地文件，或API请求；</dd>
        <dd>•	<strong>运行速度</strong>: 模型预测的速度；</dd>
        <dd>•	<strong>总行数</strong>: 用于预测的行数；</dd>
        <dd>•	<strong>状态</strong>: 运行状态；</dd>
        <dd>•	<strong>结果</strong>: 运行结果。</dd>
        <dd>此外，每个操作都有以下选项：</dd>
        <dd>•	<strong>下载结果</strong>: • 操作完成后，您可以下载结果数据。结果数据中附加了额外的列，其名字为"target_variable_name_pred"。它是对每个数据点的预测值。二分类模型的结果数据中还有一个额外的目标变量概率的列，其名字为”target_variable_name_probability_1”。</dd>
        <dd>•	<strong>取消正在进行的操作</strong>: 中止运行。</dd>
      </dl>

      <WayPoint
        onEnter={this.changeHash.bind(this,'4.2.2')}
      >
        <a name="4.2.2" className={styles.h2}>4.2.2. 性能监控</a>
      </WayPoint>
      您可以上载验证数据集来验证该模型的性能。
      <dl>
        <dd>您可用以下方式上传验证数据集：</dd>
        <dd>•	从数据库导入数据</dd>
        <dd>•	•导入本地文件</dd>
        <dd>验证指标有以下几种：</dd>
      </dl>
      <div>•	<strong>度量指标</strong>: •用验证数据集运行模型时，您可使用度量指标来衡量模型的表现</div>
      <dl className={styles.pl1}>
        <dd>–	二分类模型：选择精度或AUC作为度量指标。</dd>
        <dd>–	回归模型：选择RMSE或R²作为度量指标。</dd>
      </dl>
      <div>•	<strong>标准阈值</strong>: 您可为已部署数据的性能设置一个标准阈值。若验证模型的性能低于此阈值，则R2-Learn会发出警报。</div>
      <div>•	<strong>部署频率</strong>: 您可以在此处安排重复操作。您可以在此处安排重复操作。</div>
      [备注]试用版、简易版、专业版仅支持导入本地文件，企业版&本地部署版同时支持导入本地文件和从数据库中导入数据
      <div>•	<strong>故障时自动禁用</strong>: •启用此选项可将操作设置为在遇到任何问题时终止。</div>

      <WayPoint
        onEnter={this.changeHash.bind(this,'4.2.3')}
      >
        <a name="4.2.3" className={styles.h2}>4.2.3. 性能状态</a>
      </WayPoint>
      <dl>
        <dd>您可在此处监控任何正在运行或已完成的操作的状态。此处显示以下信息：</dd>
        <dd>•	<strong>模型名称</strong>: 运营的模型名称；</dd>
        <dd>•	<strong>部署时间</strong>: 运行开始时间；</dd>
        <dd>•	<strong>性能</strong>: 显示模型性能。</dd>
      </dl>
      <dl className={styles.pl1}>
        <dd> –	回归模型：显示模型的R² 和 RMSE.</dd>
        <dd> –	二分类模型：显示AUC和精度</dd>
      </dl>
      <div>•	<strong>阈值</strong>: 您在性能监控里设置的阈值；</div>
      <div> <strong>• 状态</strong>: 此次运行的状态；</div>
      <div>•	<strong>结果</strong>: 操作完成后，您可以下载结果数据。</div>
      <dl className={styles.pl1}>
        <dd>–	届过数据中附加了额外的列，其名字为"target_variable_name_pred"。它是对每个数据点的预测值。</dd>
      </dl>
    </Fragment>
  }

  five(){
    return <Fragment>
      <WayPoint
        onEnter={this.changeHash.bind(this,'a')}
      >
        <a name="a" className={styles.h1}>附录 A: 数据质量修复</a>
      </WayPoint>
      <dl>
        <dd>R2-Learn可能标记的数据质量问题包括：</dd>
        <dd>•	<strong>数据类型错配</strong>: •当变量的数据类型与之前标记的数据类型不匹配时，它会发出数据类型不匹配警告。例如，如果之前标记该变量为分类变量，但其实际为数字变量。</dd>
        <dd>•	<strong>缺失值</strong>: •数据中的缺失值可能是由于数据收集时的错误或空值。</dd>
        <dd>[注意]空值表示缺少数据（“无值”），与“零值”不同。</dd>
        <dd>•	<strong>异常值</strong>: •数据点超出给定数据集的预期范围。检查异常值的数据点并确定它们是否与数据或坏数据点中显示的趋势完全不同是很重要的。</dd>
        <dd>在数据质量中，R2-Learn可帮助您使用以下方法解决这些问题：</dd>
        <dd>•	修复异常值</dd>
        <dd>•	修复缺失值</dd>
        <dd>•	修复数据类型错配</dd>
      </dl>
      <WayPoint
        onEnter={this.changeHash.bind(this,'a.1')}
      >
        <a name="a.1" className={styles.h2}>A.1. 修复异常值</a>
      </WayPoint>
      <strong>•	编辑有效范围</strong>
      <dl className={styles.pl1}>
        <dd>–	使用我们的规则引擎，系统会自动的从数据集中推断出变量的合理范围，并将范围外的值视为异常值。手动编辑有效范围，可以扩展或收缩R2-Learn接受的值范围。</dd>
      </dl>
      {/*<strong>•	Replace with Boundaries</strong>*/}
      {/*<dl className={styles.pl1}>*/}
      {/*<dd>–	Replace outlier values with the boundary value.</dd>*/}
      {/*<dd>–	Applicable only to numerical variables.</dd>*/}
      {/*<dd>–	For example, if a column has values [1, 50, 60, 70, 1000] and has a reasonable range of (40, 80), selecting <strong>Replace with Boundaries </strong>will replace the outliers [1] and [1000] with the respective boundary values, giving us the values [40, 50, 60, 70, 80].</dd>*/}
      {/*</dl>*/}
      <strong>•	保留</strong>
      <dl className={styles.pl1}>
        <dd>–	保留异常值。.</dd>
        <dd>–	仅适用于数值变量。</dd>
      </dl>
      <strong>•	均值替换</strong>
      <dl className={styles.pl1}>
        <dd>–	将异常值替换为该列中有效范围内所有值的平均值。</dd>
        <dd>–	仅适用于数值变量。</dd>
        <dd>–	例如，如果有一列的值为[1,50,60,70,1000]，其有效范围为（40,80），则异常值[1]和[1000]将替换为值[60] ，则这列的值变成了 [60,50,60,70,60]。</dd>
      </dl>
      <strong>•	中值替换</strong>
      <dl className={styles.pl1}>
        <dd>–	将异常值替换为该列中有效范围内所有值的中位数值。</dd>
        <dd>–	仅适用于数值变量。</dd>
        <dd>–	例如，如果有一列的值为[1,6,5,8,50]，其有效范围为（3,10），则异常值[1]和[50]将替换为值[6 ]，则这列的值变成了[6,6,5,8,6]。</dd>
      </dl>

      <strong>•	删除行</strong>
      <dl className={styles.pl1}>
        <dd>– 删除包含异常值的行。</dd>
      </dl>
      <WayPoint
        onEnter={this.changeHash.bind(this,'a.2')}
      >
        <a name="a.2" className={styles.h2}>A.2. 修复缺失值</a>
      </WayPoint>
      <strong>•	替换最常见的值</strong>
      <dl className={styles.pl1}>
        <dd>–	仅适用于分类变量。</dd>
        <dd>–	例如，如果有一的值为[1,2,5,3,2]，则所有缺失值将设置为类别2。</dd>
      </dl>
      {/*<strong>•	Replace with a new unique value</strong>*/}
      {/*<dl className={styles.pl1}>*/}
      {/*<dd> –	Replace the missing value with a new unique value that will function as a new category.</dd>*/}
      {/*<dd> –	Applicable to only categorical variables.</dd>*/}
      {/*</dl>*/}
      <strong>•	平均值替换</strong>
      <dl className={styles.pl1}>
        <dd>–	将缺失值替换为列中剩余值的平均值。</dd>
        <dd>–	仅适用于数值变量。</dd>
        <dd>–	例如，如果有一列具有以下非缺失值[4,6,8]，则所有缺失值将替换为值6。</dd>
      </dl>
      <strong>•	中值替换</strong>
      <dl className={styles.pl1}>
        <dd> –	将缺失值替换为列中剩余值的中位数。</dd>
        <dd>–	将缺失值替换为列中剩余值的中位数。</dd>
        <dd>–	将缺失值替换为列中剩余值的中位数。</dd>
      </dl>
      <strong>•	删除行</strong>
      <dl className={styles.pl1}>
        <dd>–	删除包含缺失值的行。</dd>
      </dl>
      <strong>•	0值替换</strong>
      <dl className={styles.pl1}>
        <dd>–	用0替换缺失值。</dd>
      </dl>
      {/*<strong> •	Why Missing?</strong>*/}
      {/*<dl className={styles.pl1}>*/}
      {/*<dd> –	Alternatively, you can ask R2-Learn to fix the missing values for you. Select one of the following three options to tell R2-Learn why the value is missing, and let R2-Learn automatically fix the missing value:</dd>*/}
      {/*<dd>•	"I don’t know"</dd>*/}
      {/*<dd>•	"Left on blank on purpose"</dd>*/}
      {/*<dd>•	"Failed to collect data"</dd>*/}
      {/*</dl>*/}
      <WayPoint
        onEnter={this.changeHash.bind(this,'a.3')}
      >
        <a name="a.3" className={styles.h2}>A.3. 修复数据类型错配</a>
      </WayPoint>
      <strong>•	平均值替换</strong>
      <dl className={styles.pl1}>
        <dd>–	将错配值替换为列中剩余值的平均值。</dd>
        <dd> –	仅适用于数值变量。</dd>
        <dd> –	例如，如果有一列具有以下值[4,6,8]，则所有错配值将替换为值6。</dd>
      </dl>
      <strong>•	删除行</strong>
      <dl className={styles.pl1}>
        <dd>–	删除包含错配值的行。</dd>
      </dl>
      <strong>•	最小值替换</strong>
      <dl className={styles.pl1}>
        <dd>–	将错配值替换为列中剩余值的最小值。</dd>
        <dd>–	仅适用于数值变量。</dd>
        <dd>–	例如，如果有一列具有以下值[4,6,8]，则所有错配值将替换为值4。</dd>
      </dl>
      <strong>•	最大值替换</strong>
      <dl className={styles.pl1}>
        <dd>–	将错配值替换为列中剩余值的最大值。</dd>
        <dd>–	仅适用于数值变量。</dd>
        <dd>–	例如，如果有一列具有以下值[4,6,8]，则所有错配值将替换为值8。</dd>
      </dl>
      {/*<strong>•	Replace with max+1 value</strong>*/}
      {/*<dl className={styles.pl1}>*/}
      {/*<dd>–	Replace mismatched data values with the maximum+1 of the remaining values in the column.</dd>*/}
      {/*<dd>–	Applicable to only numerical variables.</dd>*/}
      {/*<dd>–	For example, if a column has the following values [4, 6, 8], then all mismatched values will be replaced with the value 9.</dd>*/}
      {/*</dl>*/}
      <strong>•	替换最常见的值</strong>
      <dl className={styles.pl1}>
        <dd>–	仅适用于分类变量。</dd>
        <dd>–	例如，如果有一的值为[1,2,5,3,2]，则所有缺失值将设置为类别2。</dd>
      </dl>
      <strong>•	中值替换</strong>
      <dl className={styles.pl1}>
        <dd>–	将缺失值替换为列中剩余值的中位数。</dd>
        <dd>–	仅适用于数值变量。</dd>
        <dd>–	例如，如果有一列具有以下非缺失值[6,5,8]，则所有缺失值将替换为值6。</dd>
      </dl>

      <strong>•	0值替换</strong>
      <dl className={styles.pl1}>
        <dd>–	用0替换缺失值。</dd>
      </dl>
    </Fragment>
  }

  six(){
    return <Fragment>
      <WayPoint
        onEnter={this.changeHash.bind(this,'b')}
      >
        <a name="b" className={styles.h1}>附录 B: 高级建模</a>
      </WayPoint>
    当您选择 <strong>高级建模</strong>时，可以配置以下设置：
      <WayPoint
        onEnter={this.changeHash.bind(this,'b.1')}
      >
        <a name="b.1" className={styles.h2}>B.1. 高级变量设置</a>
      </WayPoint>
      <dl>
        <dd>这里您可以修改数据中的变量以更改模型。您可以在<strong>高级变量设置</strong>中更改以下内容：</dd>
        <dd>•	<strong>选择/取消选择变量</strong>: 您可以选择其他变量或从数据集中删除变量。构建机器学习模型后，您可以在模型选择部分中查看变量选择的更改如何影响模型。</dd>
        <dd>•	<strong>检查关联矩阵</strong>: 单击 <strong>检查关联矩阵</strong> 以显示一个小图，该图显示数据集中具有最强相关关系的数值型变量之间的相关强度。</dd>
      </dl>
      <img src="/support19.png" alt=""/>
      <dl>
        <dd>•<strong>创建新变量</strong>: 单击 <strong>创建新变量</strong>向模型添加新变量。此新变量可以是现有变量的组合，也可以是对现有变量执行的操作。要创建新变量：</dd>
        <dd> a. 单击 <strong>创建新变量</strong>。</dd>
        <dd> b.	输入新变量的唯一名称。</dd>
        <dd> c.	单击等号（“=”）后面的字段，打开列出所有可能操作的下拉菜单。除con()函数可同时支持数值型和分类性的变量外，其余所有操作都只支持数值型变量。您可以对现有变量执行以下操作以创建新变量：</dd>
      </dl>

      <dl className={styles.pl1}>
        <dd>–	将不匹配的值替换为列中剩余值的中位数。</dd>
        <dd>–	仅适用于数值变量。</dd>
        <dd>–	例如，如果列具有以下值[6,5,8]，则所有不匹配的值将替换为值6。</dd>
      </dl>
      <dl className={styles.pl1}>
        <dd>•	数值运算：+, -, *, /, exp(), log2(), log10(), ln(), pow(), log(),</dd>
        <dd>•	对两个或更多变量计算最大值(Max),最小值(Min),均值(Mean),和(Sum). 当只选择一个变量是，这些函数将逐列计算：max(), min(), mean(), sum()</dd>
        <dd>•	组合变量：Concat()</dd>
        <dd>•	比较变量：Diff()</dd>
        <dd>•	累积值：Accumulate()</dd>
        <dd>•	对比两个及更多变量的统计量如最大值，最小值，均值，和：Combine()</dd>
      </dl>
      <dl>
        <dd>[注意]有关这些操作的详细信息，请在选择操作时单击<strong>“查看提示”</strong>。</dd>
        <dd>•   根据变量的值或频率将其分组：Quantile_bin()</dd>
      </dl>
      {/*<img src="/support20.png" alt=""/>*/}
      •	<strong>直方图/条形图:</strong> 单击变量的“直方图”会显示一个图形，显示变量的所有值的分布。数值变量显示为直方图，分类变量显示为条形图。
      <img src="/support21.png" alt=""/>
      •	<strong>单变量图:</strong>•单击变量的“单变量图”会显示一个图形，显示该变量值的分布。
      <WayPoint
        onEnter={this.changeHash.bind(this,'b.2')}
      >
        <a name="b.2" className={styles.h2}>B.2. 高级建模设置</a>
      </WayPoint>
      在这里，您可以为模型构建配置其他设置：
      <WayPoint
        onEnter={this.changeHash.bind(this,'b.2.1')}
      >
        <a name="b.2.1" className={styles.h2}>B.2.1. 默认状态下创建/编辑模型</a>
      </WayPoint>
      <dl>
        <dd>单击<strong>高级建模</strong>, R2-Learn会创建一个新的“模型设置”。 在 <strong>高级建模设置</strong>中，新模型设置为：</dd>
        <dd>1.	默认名称"custom.MM.DD.YYY_HH:MM:SS"</dd>
        <dd>2.	将select区域设定为此新模型的设置。</dd>
      </dl>
     您可在select字段中选择它来构建先前定义的“模型设置”。 在“命名模型设置”字段中更改名称，将修改后的模型设置另存为新模型设置。
      <WayPoint
        onEnter={this.changeHash.bind(this,'b.2.2')}
      >
        <a name="b.2.2" className={styles.h2}>B.2.2. 选择算法</a>
      </WayPoint>
    R2-Learn默认使用以下所有算法来构建模型。您可以删除一些算法，加快建模速度。以下是针对不同问题可选择的算法列表：
      <dl className={styles.table}>
        <dt>
          <ul>
            <li>算法</li>
            <li>二进制分类</li>
            <li>回归</li>
          </ul>
        </dt>

        <dd>
          <ul>
            <li>R2-solution-a</li>
            <li>✓</li>
            <li>✓</li>
          </ul>
        </dd>

        <dd>
          <ul>
            <li>R2-solution-b</li>
            <li>✓</li>
            <li>✓</li>
          </ul>
        </dd>

        <dd>
          <ul>
            <li>AdaBoost</li>
            <li>✓</li>
            <li>✓</li>
          </ul>
        </dd>

        <dd>
          <ul>
            <li>ARD (Automatic Relevance Determination) Regression</li>
            <li/>
            <li>✓</li>
          </ul>
        </dd>

        <dd>
          <ul>
            <li>NaiveBayes-Bernoulli</li>
            <li>✓</li>
            <li/>
          </ul>
        </dd>

        <dd>
          <ul>
            <li>Bernoulli Naive Bayes</li>
            <li>✓</li>
            <li/>
          </ul>
        </dd>

        <dd>
          <ul>
            <li>Decision Tree</li>
            <li>✓</li>
            <li>✓</li>
          </ul>
        </dd>

        <dd>
          <ul>
            <li>Extra Trees</li>
            <li>✓</li>
            <li>✓</li>
          </ul>
        </dd>

        <dd>
          <ul>
            <li>NaiveBayes-Gaussian</li>
            <li>✓</li>
            <li/>
          </ul>
        </dd>

        <dd>
          <ul>
            <li>GP Regression</li>
            <li/>
            <li>✓</li>
          </ul>
        </dd>

        <dd>
          <ul>
            <li>GBDT</li>
            <li>✓</li>
            <li>✓</li>
          </ul>
        </dd>

        <dd>
          <ul>
            <li>KNN</li>
            <li>✓</li>
            <li>✓</li>
          </ul>
        </dd>
        <dd>
          <ul>
            <li>LDA</li>
            <li>✓</li>
            <li/>
          </ul>
        </dd>
        <dd>
          <ul>
            <li>Linear SVM</li>
            <li>✓</li>
            <li>✓</li>
          </ul>
        </dd>
        <dd>
          <ul>
            <li>SVM</li>
            <li>✓</li>
            <li>✓</li>
          </ul>
        </dd>
        <dd>
          <ul>
            <li>NaiveBayes-Multinomial</li>
            <li>✓</li>
            <li/>
          </ul>
        </dd>

        <dd>
          <ul>
            <li>Online Passive Aggressive</li>
            <li>✓</li>
            <li/>
          </ul>
        </dd>

        <dd>
          <ul>
            <li>QDA</li>
            <li>✓</li>
            <li/>
          </ul>
        </dd>

        <dd>
          <ul>
            <li>Random Forest</li>
            <li>✓</li>
            <li>✓</li>
          </ul>
        </dd>

        <dd>
          <ul>
            <li>Linear Incremental Model</li>
            <li>✓</li>
            <li>✓</li>
          </ul>
        </dd>
        <dd>
          <ul>
            <li>Logistic</li>
            <li>✓</li>
            <li/>
          </ul>
        </dd>

        <dd>
          <ul>
            <li>XGBoost</li>
            <li>✓</li>
            <li>✓</li>
          </ul>
        </dd>

        <dd>
          <ul>
            <li>Ridge Regression</li>
            <li/>
            <li>✓</li>
          </ul>
        </dd>
      </dl>
      <WayPoint
        onEnter={this.changeHash.bind(this,'b.2.3')}
      >
        <a name="b.2.3" className={styles.h2}>B.2.3. 设置模型集成大小</a>
      </WayPoint>
    您可在此设置模型集成的算法数量。例如，当<strong>最大模型集成数量</strong> 设置为3时，最多会有3种算法集成在一个模型里。
      <WayPoint
        onEnter={this.changeHash.bind(this,'b.2.4')}
      >
        <a name="b.2.4" className={styles.h2}>B.2.4. 训练验证留出和交叉验证</a>
      </WayPoint>
     您可以选择使用以下方法构建机器学习模型：
      •	<strong>训练验证留出</strong>: 通过将训练数据集划分为三个子集来构建机器学习模型：
      <dl className={styles.pl1}>
        <dd>–	<strong>训练集</strong>: 用于构建机器学习模型；</dd>
        <dd>–	<strong>验证集</strong>: 用于调整分类器的超参数，以达到更高的准确性；</dd>
        <dd>–	<strong>留出集</strong>: 用于评估模型的准确性。它并不参与模型构建，只用于验证已构建的模型。</dd>
        <dd> 您可以拖动的方式设置每个子集占数据集的百分比。</dd>
      </dl>
      •	<strong>K-fold 交叉验证留出</strong>: 通过以下方法构建机器学习模型：
      <dl className={styles.pl1}>
        <dd>a.	将训练数据集划分为“k”个“折叠”或“k”个相同大小的子样本集；</dd>
        <dd>b.	在建模过程中，每个‘k’子样本集将作为验证集，其余‘k-1’个子样本集作为训练集；</dd>
        <dd>c.	建模过程将重复‘k’次，给出‘k’个模型；</dd>
        <dd>d.	我们会平均‘k’个模型，以生成单个模型。</dd>
        <dd>此方法会比 <strong>训练验证留出</strong>。  花费更长的时间。您可设置折叠数，和留出百分比。</dd>
      </dl>
      <WayPoint
        onEnter={this.changeHash.bind(this,'b.2.5')}
      >
        <a name="b.2.5" className={styles.h2}>B.2.5. 重采样设置</a>
      </WayPoint>
      [注意]	仅适用于二分类模型。
      <div>若目标变量的结果分布不均衡，则数据集不平衡。</div>
    R2-Learn可通过对训练集进行<strong>自动上采样</strong> 或 <strong>自动下采样</strong> 来平衡数据集。
      <WayPoint
        onEnter={this.changeHash.bind(this,'b.2.6')}
      >
        <a name="b.2.6" className={styles.h2}>B.2.6. 设置度量指标</a>
      </WayPoint>
    您可选择判断机器学习模型性能的度量指标。
      <div>二分类模型，您可选择：</div>
      <dl>
        <dd>•	<strong>AUC（曲线下面积）</strong> （默认）</dd>
        <dd>•	<strong>Accuracy</strong></dd>
        <dd>•	<strong>F1</strong></dd>
      </dl>
    回归模型，您可选择：
      <dl>
        <dd>•	<strong>R²</strong></dd>
        <dd>•	<strong>MSE （均方差）</strong> （默认）</dd>
        <dd>•	<strong>RMSE</strong></dd>
      </dl>
      <WayPoint
        onEnter={this.changeHash.bind(this,'b.2.7')}
      >
        <a name="b.2.7" className={styles.h2}>B.2.7. 设置速度和准确性</a>
      </WayPoint>
    您可根据自己的需要设置速度和准确性。R2将根据此设置自动计算训练时间。您设置的准确性越高，模型所需训练时间越长，模型的表现越好。
      <WayPoint
        onEnter={this.changeHash.bind(this,'b.2.8')}
      >
        <a name="b.2.8" className={styles.h2}>B.2.8. 随机种子</a>
      </WayPoint>
    训练机器学习模型时，将会在生成随机数时将随机数设置为您设定好的随机种子。此举可使模型可复现。
    </Fragment>
  }

  seven(){
    return <Fragment>
      <WayPoint
        onEnter={this.changeHash.bind(this,'c')}
      >
        <a name="c" className={styles.h1}>附录 C: 二分类问题的模型选择</a>
      </WayPoint>
      <WayPoint
        onEnter={this.changeHash.bind(this,'c.1')}
      >
        <a name="c.1" className={styles.h2}>C.1. 简化视图</a>
      </WayPoint>
      <img src="/support22.png" alt=""/>
      <dl>
        <dd>在二分类问题中的<strong>模型选择</strong>在二分类问题中的模型选择：</dd>
        <dd>•	<strong>建模结果</strong>: 显示了模型的性能水平。</dd>
        <dd>•	<strong>所选模型</strong>: 您当前选择的机器学习模型。这是从下面显示的经过训练的机器学习模型列表中选择的。</dd>
        <dd>•	<strong>目标</strong>: 机器学习模型预测的目标变量。</dd>
        <dd>•	<strong>性能</strong>: 显示所选模型的性能。二分类模型中通常是AUC（曲线下面积）。</dd>
        <dd>•	<strong>准确性</strong>: 显示所选模型预测的准确性。</dd>
        <dd>•	<strong>根据您自己的标准选择模型</strong>: R2-Learn从模型列表中自动选择最适合您业务问题的模型。您可以选择其他方式：通过选择以下选项之一来修改其选择推荐的方式：</dd>
      </dl>
      <dl className={styles.pl1}>
        <dd>–	<strong>R2-Learn的默认推荐</strong>: R2-Learn会根据执行时间和性能之间的平衡，给出推荐。</dd>
        <dd>–	<strong>基于成本</strong>: 此处，您可量化假阳性（第一类错误）和假阴性（第二类错误）会产生的业务损失，以及从真阳性和真阴性获得的收益。R2-Learn将据此给您推荐模型。</dd>
        <dd><img src="/support23.png" alt=""/></dd>
      </dl>
      •	<strong>训练模型列表</strong>: 此处还显示了使用训练数据构建的模型列表。列出的模型各有一个：
      <dl className={styles.pl1}>
        <dd>–	<strong>模型名称</strong>: 此模型的名字。通常为 "algorithm_name.model_setting_name"。若您选择自动建模时， model_setting_name会自动为您创建。若您选择了高级建模，您可自行设定名称。</dd>
        <dd>–	<strong>准确度</strong>: 显示模型预测结果与实际结果的匹配程度。准确度越高，模型预测的效果越好。</dd>
        <dd>–	<strong>性能</strong>: 显示此模型的性能指标。二分类模型通常为AUC（曲线下面积），回归模型通常为MSE（均方差）。</dd>
        <dd>–	<strong>执行速度</strong>: 每处理1000行数据，模型需要花费的时间。</dd>
        <dd>–	<strong>变量影响</strong>: 单击查看，可查看每个模型变量对目标变量的影响。 该值越高，说明该变量的变化对模型预测的结果的影响越大。</dd>
        <dd>–	<strong>模型流程</strong>: 单击查看，可看到此模型构建的每一步流程和详细处理方法。</dd>
      </dl>
      <WayPoint
        onEnter={this.changeHash.bind(this,'c.2')}
      >
        <a name="c.2" className={styles.h2}>C.2. 高级视图</a>
      </WayPoint>
      <dd><img src="/support24.png" alt=""/></dd>
      用户可以使用 <strong>高级视图</strong> 查看有关可用于部署的模型的更多详细信息。
      <WayPoint
        onEnter={this.changeHash.bind(this,'c.2.1')}
      >
        <a name="c.2.1" className={styles.h2}>C.2.1.顶部</a>
      </WayPoint>
      <dl>
        <dd>顶部显示以下内容：</dd>
        {/*<dd>•	<strong>Modeling Results</strong>: A general grade indicating the general performance levels of the trained models.</dd>*/}
        {/*<dd>•	<strong>Model Name Contains</strong>: Allows you to filter the model name by algorithm and by Model Setting name.</dd>*/}
        <dd>•	<strong>模型比较图表</strong>: 每个模型的表现，可用于进行模型性能比较：</dd>
      </dl>
      <dl className={styles.pl1}>
        <dd>–	<strong>速度v.s.准确性</strong>: 每个模型的速度和准确性的表。</dd>
        <dd>–	<strong>提升图</strong>: 通过比较使用模型和不是用模型预测结果的比率，可用于确定模型的有效性。</dd>
        <dd>–	<strong>ROC 曲线</strong>: 根据不同阈值，确定二分类模型的分类能力。</dd>
      </dl>
      <WayPoint
        onEnter={this.changeHash.bind(this,'c.2.2')}
      >
        <a name="c.2.2" className={styles.h2}>C.2.2. 模型表</a>
      </WayPoint>
      <dl>
        <dd>下表显示了使用数据集训练的所有模型。每个列出的模型都有：</dd>
        <dd>•	<strong>模型名字</strong>: 此模型的名字。通常为 "算法名称.模型设置名称"。若您选择自动建模时， 建模时间会自动为您创建。若您选择了高级建模，您可自行设定名称。</dd>
        <dd>•	<strong>F1值</strong>: F1值是一个综合指标，结合了准确率和召回率。当准确率和召回率都高时，F1值也会高。其计算方法为： F1 = 2 * 准确率 * 召回率/ (准确率 + 召回率)。</dd>
        <dd>•	<strong>准确率</strong>: 描述的是在被识别为正类别的样本中，确实为正类别的比例。其计算方法为：Precision = TP/(TP+FP)。</dd>
        <dd>•	<strong>召回率</strong>: 描述的是在所有正类别样本中，被正确识别为正类别的比例。其计算方法为： Recall =TP/(TP+FN)。</dd>
        <dd>•	<strong>对数损失函数</strong>: 描述的是分类器的对数损失，用于评估模型预测值与真实值不一致的程度。</dd>
        <dd>•	<strong>截止阈值</strong>: 一些模型会返回概率值，将这些值映射到二元类别时，需指定分类阈值。若值高于该阈值，则认为是正类别。若值低于该阈值，则认为是负类别。</dd>
        <dd>•	<strong>KS值</strong>: Kolmogoriv-Smirnov(KS)值反映了正类别和负类别分布的分离程度。</dd>
        <dd>•	<strong>变量列表</strong>: 显示训练数据集中的哪些变量包含在模型中。</dd>
        <dd>•	<strong>验证/交叉验证</strong>: 验证/交叉验证数据集是用于微调初始模型，可查看变量之间的关系是否正确操作，以创建可能的最佳模型的数据。</dd>
       <dd>•	<strong>留出</strong>: 留出集是为模型的最终测试留出的一部分原始数据，用于评估模型的执行情况。</dd>
        </dl>
      <WayPoint

      >
        <a name="c.2.3" className={styles.h2}>C.2.3. 其它模型细节</a>
      </WayPoint>
      要查看其他模型详细信息，请单击 <strong>模型名称</strong>旁边的+。
      <img src="/support25.png" alt=""/>
      <dl>
        <dd>上图显示以下图表：</dd>
        <dd>1.	<strong>误差/混淆矩阵</strong>: 此矩阵将预测值与真实值进行比较。是一个显示了真阳性（TP），假阳性（FP），真阴性（TN）和假阴性（FN）的数量的矩阵。</dd>
        <dd>2.	<strong>ROC 曲线 (可调整)</strong>: 随着阈值的调整，二分类模型的分类能力。单击滑块可调整阈值。</dd>
        <dd>3.	<strong>预测分布（可调整）</strong>: 这张图里是概率密度分布，概率阈值可调。</dd>
        <dd>4.	<strong>精确找回曲线（可调整）</strong>: 这张图是召回率和精确度的关系图。单击滑块可调整。</dd>
        <dd>5.	<strong>提升曲线</strong>: 提升曲线图反映了使用模型和不使用模型获得的结果的提升。反映了模型的有效性。</dd>
        <dd>6.	<strong>变量影响</strong>: 模型中的每个变量对预测目标的的实际影响。值越高，表示对模型预测的影响越大。</dd>
      </dl>
    </Fragment>
  }

  eight(){
    return <Fragment>
      <WayPoint
        onEnter={this.changeHash.bind(this,'d')}
      >
        <a name="d" className={styles.h1}>附录 D: 回归问题的模型选择</a>
      </WayPoint>
      <WayPoint
        onEnter={this.changeHash.bind(this,'d.1')}
      >
        <a name="d.1" className={styles.h2}>D.1. 简化视图</a>
      </WayPoint>
      <img src="/support26.png" alt=""/>
        在回归问题中的 <strong>模型选择</strong>中，会显示以下内容：
      <div>•	<strong>所选模型</strong>: 您当前选择的机器学习模型。这是从下面显示的经过训练的机器学习模型列表中选择的。</div>
      •	<strong>归一化RMSE（归一化均方根误差）</strong>: 可帮助您比较模型的性能。其值越小，模型预测的数据越好。
      <div>•	<strong>拟合质量（R2）</strong>:  R2是一个表示回归线与给定数据拟合程度的度量指标。R2值越高，模型越接近数据。</div>

      {/*<div className={styles.pl1}>–	<strong>Variable Impact</strong>: Displays the impacts each variable in the model has on the predicted target variable. The higher this value is, the larger the effect a change in this variable has on the outcome predicted by the model.</div>*/}

      •	<strong>预测v.s.实际（排序）</strong>: 显示模型预测值与实际值的接近程度。您可单击图表下的“编辑”更改显示的数据点。
      <div>•	<strong>训练模型列表</strong>: 此处还显示了使用训练数据构建的模型列表。列出的模型各有一个：</div>
      <dl className={styles.pl1}>
        <dd>–	<strong>模型名称</strong>: –此模型的名字。通常为r2-solution-version x。若您选择自动建模时， model_setting_name会自动为您创建。若您选择了高级建模，您可自行设定名称。</dd>
        <dd>–	<strong>误差（RMSE）</strong>: –RMSE（均方根误差）是模型标准误差的平方根，显示了模型预测值与实际目标变量值的接近程度。 </dd>
        <dd>–	<strong>R²</strong>:R²是回归线与给定数据的拟合程度的统计度量。 R²值越高，模型越接近数据。</dd>
        <dd>–	<strong>执行速度</strong>: 每处理1000行数据，模型需要花费的时间。</dd>
        <dd>–	<strong>变量影响</strong>: 单击<strong>查看</strong>，可查看每个模型变量对目标变量的影响。 该值越高，说明该变量的变化对模型预测的结果的影响越大。</dd>
        <dd>–	<strong>模型流程</strong>: 单击 <strong>查看 </strong>，可看到此模型构建的每一步流程和详细处理方法。</dd>
      </dl>
      <WayPoint
        onEnter={this.changeHash.bind(this,'d.2')}
      >
        <a name="d.2" className={styles.h2}>D.2. 高级视图</a>
      </WayPoint>
      <img src="/support27.png" alt=""/>
        用户可以使用<strong>高级视图</strong> 查看有关可用于部署的模型的更多详细信息。
      {/*<WayPoint*/}
      {/*onEnter={this.changeHash.bind(this,'d.2.1')}*/}
      {/*>*/}
      {/*<a name="d.2.1" className={styles.h2}>D.2.1. Table of Models</a>*/}
      {/*</WayPoint>*/}
      {/*The top of the section displays the following:*/}
      {/*<div>•	<strong>Model Name Contains</strong>: Allows you to filter the model name by algorithm and by Model Setting name.</div>*/}
      <WayPoint
        onEnter={this.changeHash.bind(this,'d.2.1')}
      >
        <a name="d.2.1" className={styles.h2}>D.2.1. 模型表</a>
      </WayPoint>
      <dl>
        <dd>下表显示了使用数据集训练的所有模型。每个列出的模型都有：</dd>
        <dd>•	<strong>模型名字</strong>: 此模型的名字。通常为 "algorithm_name.model_setting_name"。若您选择自动建模时， model_setting_name会自动为您创建。若您选择了高级建模，您可自行设定名称。</dd>
        <dd>•	<strong>RMSE （均方根误差）</strong>: RMSE是MSE的平方根，通常用于比较不同模型之间的预测误差。 </dd>
        <dd>•	<strong>MSLE（均方对数误差）</strong>: MSLE是预测值与真实值之间比例的对数之和的平均误差。</dd>
        <dd>•	<strong>RMLSE （均方根对数平方误差）</strong>: RMLSE是MSE对数值的平方根。</dd>
        <dd>•	<strong>MSE （均方误差）</strong>: MSE是模型预测值与实际值之间误差平方的平均值。</dd>
        <dd>•	<strong>MAE （平均绝对误差）</strong>: 模型预测值与实际值之差的绝对值的平均数。</dd>
        <dd>•	<strong>R²</strong>:  R2是一个表示回归线与给定数据拟合程度的度量指标。R2值越高，模型越接近数据。</dd>
        <dd>•	<strong>R² 调整</strong>: 调整后R²是R²的调整版，它对模型中的预测变量数进行了调整 。它总是低于R²。</dd>
        <dd>•	<strong>验证/交叉验证</strong>: 验证/交叉验证数据集是用于微调初始模型，可查看变量之间的关系是否正确操作，以创建可能的最佳模型的数据。</dd>
        <dd>•	<strong>留出</strong>: 留出集是为模型的最终测试留出的一部分原始数据，用于评估模型的执行情况。</dd>
      </dl>
      <WayPoint
        onEnter={this.changeHash.bind(this,'d.2.2')}
      >
        <a name="d.2.2" className={styles.h2}>D.2.2. 其它模型细节</a>
      </WayPoint>
        要查看其他模型详细信息，请单击模型名称。
      <img src="/support28.png" alt=""/>
        上图显示以下图表：
      <div>1.	<strong>拟合图</strong>: 拟合图显示了模型的预测精度。横轴为目标变量的实际值，纵轴为目标变量的预测值。45度线（y=x）表明所有的目标变量都被准确的预测了。图中接近或在45度线上的点越多，表示模型的预测性能越好。</div>
      2.	<strong>残差图</strong>: 残差是给定数据点目标变量的实际值和预测值之间的差值。横轴是残差，纵轴是实际目标变量值。观察残差图可发现当模型应用于给定数据集时可能会出现的问题。
      <div>点击<strong>诊断</strong>可将当前模型的残差图与数种常见的残差图进行比较，给您提供如何改进模型的思路。当您在打开的对话框种选中最接近模型残差图的残差图形状后，R2-Learn会给出修复方法：</div>
      <dl className={styles.pl1}>
        <dd>1.	随机分布的残差图</dd>
        <dd>2.	Y轴不平衡的残差图</dd>
        <dd>3.	X轴不平衡的残差图</dd>
        <dd>4.	异常值残差图</dd>
        <dd>5.	非线性残差图</dd>
        <dd>6.	异方差残差图</dd>
        <dd>7.	大Y轴数据点残差图</dd>
      </dl>
      {/*3.	<strong>Model Process Flow</strong>: Shows a step-by-step breakdown on how this model is built.*/}
      <div>3.	<strong>变量影响</strong>: 模型中的每个变量对预测目标的的实际影响。值越高，表示对模型预测的影响越大。</div>
    </Fragment>
  }

  render(){
    return <section>
      {this.one()}
      {this.two()}
      {this.three()}
      {this.four()}
      {this.five()}
      {this.six()}
      {this.seven()}
      {this.eight()}
    </section>
  }
}
