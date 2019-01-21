import React, { Component ,Fragment} from "react";
import styles from "./styles.module.css";
import Waypoint from 'react-waypoint';

export default class Article extends Component {
    
    changeHash(hash){
        this.props.changeSelectedKeys(hash)
    }

    one(){
        return <Fragment>
            <Waypoint
                onEnter={this.changeHash.bind(this,'1')}
            >
                <a href='javascript:;' name="1" className={styles.h1}>1. Overview</a>
            </Waypoint>
            
            R2-Learn helps companies turn data into machine learning models quickly without needing AI (artificial intelligence) expertise. Built with cutting edge technology, R2-Learn uses AI to guide you through the process of creating, deploying, and keeping up-to-date custom machine learning models using data that you already have.
            This section introduces the key concepts of machine learning and how they relate to R2-Learn.
            <Waypoint
                onEnter={this.changeHash.bind(this,'1.1')}
            >
                <a href='javascript:;' name="1.1" className={styles.h2}>1.1. Machine learning</a>
            </Waypoint>
            Machine learning is a branch of AI where computers are trained to learn from data using complex learning algorithms. With ever increasing computing power, machine learning is able to discover patterns and relations hidden in massive amounts of data that would be difficult for humans to identify and use. Machine learning models are being developed today to classify objects, detect anomalies, predict outcomes, and augment human capacity in general.
            <p className={styles.p}>
                Businesses that use machine learning to help them make business decisions with data usually employ a machine learning workflow similar to the following:
            </p>
            <dl>
                <dd><strong>1. Define the problem:</strong> Decide what problem you want to solve with data.</dd>
                <dd><strong>2. Acquire dataset for the training model:</strong> Get the data that you will use to train your machine learning models.</dd>
                <dd><strong>3. Check and fix data quality:</strong> Inspect the dataset for missing data and inconsistencies, and fix the dataset where appropriate to improve its quality.</dd>
                <dd><strong>4. Explore data:</strong> Explore your data to get a sense of what shape the data is, and identify significant patterns for further analysis.</dd>
                <dd><strong>5. Pre-process data:</strong> Modify the shape of your dataset so that it fits the parameters of the machine learning tools that you’ll be using to generate your model.</dd>
                <dd><strong>6. Train model with data:</strong> Feed your data into the machine learning tools that will generate your machine learning model for you.</dd>
                <dd><strong>7. Validate and analyze modeling results:</strong> Check that resulting model is able to make the predictions that you expect.</dd>
                <dd><strong>8. Deploy model:</strong> Deploying your model generally means making your model available for use. Usually, this takes the form of deploying the model as a REST API endpoint that you can send new input data to and receive a response containing the resulting prediction.</dd>
                <dd><strong>9. Monitor model:</strong> Once you have your machine learning model, it is important to monitor its performance to make sure that your predictions are always within an acceptable performance range. Machine learning models suffer from model drift over time, meaning that the predictions made with a machine learning model will become less accurate as it ages.</dd>
            </dl>
            <img src="/support1.png" alt=""/>
            A well-trained data scientist is usually responsible for the workflow illustrated above. It has many steps and decision points. Making the correct decision at each point is critical to the quality of the machine learning model, which in turn determines how accurate predictions made with this model are. Data scientists today largely rely on their experience and intuition to find the best model for the task at hand, which can be very slow, tedious, expensive and flawed process.
    
            <Waypoint
                onEnter={this.changeHash.bind(this,'1.2')}
            >
                <a href='javascript:;' name="1.2" className={styles.h2}>1.2. Machine learning with R2-Learn</a>
            </Waypoint>
            R2-Learn makes it easier for businesses to work with machine learning by using AI to automate large portions of the standard machine learning workflow, reducing the amount of work and human-error that usually comes with the process.
            <p className={styles.p}>
                The R2-Learn machine learning workflow is as follows:
            </p>
            <img src="/support2.png" alt=""/>
            <dl>
                <dd><strong>1.	Create a project:</strong> Start a project in R2-Learn to begin building a machine learning model.</dd>
                <dd><strong>2.	Describe your business problem:</strong> Describe the business problem that you’re trying to solve. This helps document the intent of the project and its desired outcome.</dd>
                <dd><strong>3.	Working with your data: </strong>Upload your training dataset to R2-Learn. R2-Learn uses machine learning to assist you in checking and cleaning your dataset.</dd>
                <dd>
                    <strong>4.	Modeling:</strong> Once your dataset has been loaded into R2-Learn, you can select one of the following modeling modes to use:
                    <ul>
                        <li> –	<strong>Automatic Modeling:</strong>R2-Learn automatically creates machine learning models based on the training data you’ve uploaded.</li>
                        <li> –	<strong>Advanced Modeling:</strong> Advanced modeling allows users to override some default decisions made by R2-Learn and derive new variables to shape the resulting model such that it can better meet stated business goals.</li>
                    </ul>
                </dd>
                <dd>
                    <strong>5.	Deployment: </strong>Once you’ve created your machine learning model, R2-Learn automatically deploys the model on its servers and allows you to:
                    <ul>
                        <li> –	<strong>Predict with data source:</strong> Connect R2-Learn to your database or upload a CSV file containing your input data to run predictions on this data.</li>
                        <li >–	<strong>Predict with API:</strong> Use R2-Learn’s REST API to make predictions on your input data with your R2-Learn machine learning models.</li>
                    </ul>
                </dd>
            </dl>
            Once deployed, you can monitor your model’s predictive performance and update models when they fall below a specified threshold.
        </Fragment>
    }

    two(){
         return <Fragment>
             <Waypoint
                 onEnter={this.changeHash.bind(this,'2')}
             >
                <a name="2"  href="javascript:;" className={styles.h1}>2. Getting started with R2-Learn</a>
             </Waypoint>
             This section of the manual helps you get started with your first R2-Learn project.
             To get started with your first project, head on over to Starting a new project.
             <Waypoint
                 onEnter={this.changeHash.bind(this,'2.1')}
             >
                <a href="javascript:;" name="2.1" className={styles.h2}>2.1. Software requirements</a>
             </Waypoint>
             R2-Learn is a web application that can be run in your browser.
             We recommend that you use:
             <div>•	Google Chrome version 65 and newer.</div>
             <Waypoint
                 onEnter={this.changeHash.bind(this,'2.2')}
             >
                <a href="javascript:;" name="2.2" className={styles.h2}>2.2. Importing data into R2-Learn</a>
             </Waypoint>
             You can import data into R2-Learn for:
             <div>•	Building machine learning models, and</div>
             <div>•	Making predictions on the imported data.</div>
             R2-Learn supports the following methods for importing data:
             <div>•	Importing data from a database</div>
             <div>•	Importing a local file</div>
    
             <Waypoint
                 onEnter={this.changeHash.bind(this,'2.2.1')}
             >
                <a href="javascript:;" name="2.2.1" className={styles.h2}>2.2.1. Importing data from a database</a>
             </Waypoint>
             R2-Learn supports importing data from the following databases:
             <div>•	Oracle Database 11G</div>
             <div>•	MySQL</div>
             Your database must support ODBC 11.2 connections.
             <img src="/support3.png" alt=""/>
             <Waypoint
                 onEnter={this.changeHash.bind(this,'2.2.2')}
             >
                <a href="javascript:;" name="2.2.2" className={styles.h2}>2.2.2. Importing a local file</a>
             </Waypoint>
             You can import a UTF-8 encoded CSV file containing your training or input data into R2-Learn.
             Your CSV file must:
             <div>•	Have a header row.</div>
             <div>•	Be UTF-8 encoded.</div>
             [Note] If you are importing a CSV file to be used for model deployment or to make predictions on, that CSV file must fulfill the following:
             <div>•	It must contain all the variables required by the deployed model, and</div>
             <div>•	Names of variables contained in the CSV file must be the same as the variable names that are used in the training dataset.</div>
    
             <Waypoint
                 onEnter={this.changeHash.bind(this,'2.3')}
             >
                <a href="javascript:;" name="2.3" className={styles.h2}>2.3. Project home</a>
             </Waypoint>
             
             When you sign in to R2-Learn, you’ll land on the project home page:
             <img src="/support4.png" alt=""/>
             On the project home page, you can:
             <dl>
                 <dd>1.	<strong>Create</strong> new projects.</dd>
                 <dd>2.	<strong>Open</strong> and <strong>edit</strong> an existing project.</dd>
                 <dd>3.	<strong>Delete</strong> a project.</dd>
                 <dd>4.	<strong>Search</strong> for a project.</dd>
                 <dd>5.	<strong>Sort</strong> projects.</dd>
             </dl>
             Click Deploy in the navigation menu at the bottom of the side bar to go to the model deployment home page.
             <Waypoint
                 onEnter={this.changeHash.bind(this,'2.4')}
             >
                 <a href="javascript:;" name="2.4" className={styles.h2}>2.4. Model deployment home page</a>
             </Waypoint>
             The model deployment home page shows all the projects you’ve created, and the deployment/validation status of these projects:
             <img src="/support5.png" alt=""/>
             <ul>
                 <li><strong>Deployment/validation status:</strong> Shows the current status of a deployment or validation task. Possible values are:</li>
                 <li>•	<strong>Running:</strong> A task is currently running.</li>
                 <li>•	<strong>Idle:</strong> Project has no tasks that are running.</li>
                 <li>•	<strong>Issue:</strong> Project has run into an issue while running a task. Please create a new case.</li>
                 <li>•	<strong>Canceled:</strong> Case under a project is canceled.</li>
             </ul>
             Click on a project to open it:
             <img src="/support6.png" alt=""/>
             For more information on how to deploy models, see Deploying your models.
         </Fragment>
    }

    three(){
         return <Fragment>
             <Waypoint
                 onEnter={this.changeHash.bind(this,'3')}
             >
                <a href="javascript:;" name="3" className={styles.h1}>3. Starting a new project</a>
             </Waypoint>
             This section will walk you through how to start a new machine learning project, using R2-Learn’s automatic modeling features.
    
             <Waypoint
                 onEnter={this.changeHash.bind(this,'3.1')}
             >
                <a href="javascript:;" name="3.1" className={styles.h2}>3.1. Create a project</a>
             </Waypoint>
             When you first sign in on R2-Learn, you’ll be greeted with an empty project home page. Click on <strong>Create New Project</strong> to start a new project.
             <img src="/support7.png" alt=""/>
             <dl>
                 <dd>You’ll be brought to the <strong>Project</strong> section, where you’ll be asked to:</dd>
                 <dd>•	<strong>Name your project.</strong> Each project is given a default name of project {'<DD/MM/YYY, HH:MM:SS>'}. Modify the project name to suit your needs.</dd>
                 <dd>•	<strong>Describe your project (optional). </strong>Enter a general project description. This helps document the high-level intent and scope of the project for future reference. Low-level specifics of the project should be documented as the Problem Statement in the <strong>Business Problem</strong> section that follows.</dd>
             </dl>
             Once done, click <strong>Continue.</strong>
             <Waypoint
                 onEnter={this.changeHash.bind(this,'3.2')}
             >
                <a href="javascript:;" name="3.2" className={styles.h2}>3.2. Describe your business problem</a>
             </Waypoint>
             In the <strong>Problem</strong> section, you’ll be entering your project’s <strong>Problem Description</strong> and <strong>Problem Type.</strong>
             <p>The project’s <strong>Problem Description</strong> (optional) asks you for a <strong>Problem Statement</strong> and a <strong>Business Value </strong>to be documented. Both of these are not used directly to building your machine learning model, but are important for keeping track of projects and making sure that business units that eventually take over the projects are made aware of the kinds of problems that this project’s models are intended to solve.</p>
             <dl>
                 <dd>The <strong>Problem Type</strong> asks you to specify the type of predictions you expect the project’s models to come up with:</dd>
                 <dd>•	<strong>True or False (Binary Classification): </strong>The project’s models should predict if an event is likely to happen or not. For example, if a customer will purchase a product or not; or if someone is likely to develop Type 2 diabetes or not.</dd>
                 <dd>•	<strong>Continuous Values (Regression):</strong> To predict a continuous/numeric value. For example, how much a product would cost given a set of variables.</dd>
             </dl>
             Once you’ve set your Business Problem and your Problem Type, click Continue to move on to loading your data into R2-Learn.
    
             <Waypoint
                 onEnter={this.changeHash.bind(this,'3.3')}
             >
                <a href="javascript:;" name="3.3" className={styles.h2}>3.3. Working with your data</a>
             </Waypoint>
             Now, we’ll start working with your data. The <strong>Data</strong> section walks you through:
             <dl>
                 <dd>1.	Uploading your data in the <strong>Data Connect</strong> tab.</dd>
                 <dd>2.	Cleaning your data in the <strong>Data Schema</strong> tab</dd>
                 <dd>3.	Control your data quality in the <strong>Data Quality tab</strong></dd>
             </dl>
             Your training dataset needs to contain as much information as possible that is related to the study goal. Good datasets are thorough, focused on the study goal, and contain as large a sample size as possible. If possible, have a domain expert verify that your training data is suitable for the business problem. Once you have a good dataset, R2-Learn takes care of the rest.
            <p>
                Once the user loads data via R2-Learn’s data connecting interface, R2-Learn detects the data types, checks the data quality and fixes the minor issues automatically or prompts the user to fix them manually.
            </p>
    
             <Waypoint
                 onEnter={this.changeHash.bind(this,'3.3.1')}
             >
                <a href="javascript:;" name="3.3.1" className={styles.h2}>3.3.1. Data Connect</a>
             </Waypoint>
             The <strong>Data Connect</strong> tab allows you to select what dataset to use for your machine learning model.
             <img src="/support8.png" alt=""/>
             Here, you’re loading your training dataset into R2-Learn. You can either:
             <dl>
                 <dd>•	Connect a database, or</dd>
                 <dd>•	Upload a local file.</dd>
             </dl>
             If you’re just getting to know R2-Learn, you can use one of the sample datasets provided instead.
             <div>After loading your dataset, you can <strong>hange the maximum number of rows</strong>c or records that R2-Learn will use to develop your machine learning model.</div>
             [Important]The dataset that you load into R2-Learn must have a header row.
    
             <Waypoint
                 onEnter={this.changeHash.bind(this,'3.3.2')}
             >
                <a href="javascript:;" name="3.3.2" className={styles.h2}>3.3.2. Data Schema</a>
             </Waypoint>
             Once you’ve loaded your training dataset, R2-Learn displays a sample of your data in the <strong>Data Schema </strong>tab for you to inspect. Here, you can:
             <dl>
                 <dd>•	1. <strong>Edit</strong> your header row if necessary.</dd>
                 <dd>•	2. <strong>Verify the Data Type</strong> assigned to each column in your dataset</dd>
                 <dd>•	3. <strong>Select Your Target Variable</strong></dd>
             </dl>
             [Important]You must make sure that all column headers each have a unique value before R2-Learn will allow you to proceed.
             <img src="/support9.png" alt=""/>

             When you’ve finished verifying and editing your header row values, R2-Learn asks you to inspect and verify the <strong>Data Type</strong> assigned to each column in your dataset. If the data type for a column is incorrect, select the correct data type from the dropdown menu for that column to change it.
             <dl>
                 <dd>There are two possible data types for each column:</dd>
                 <dd>•	<strong>Numerical:</strong> Data in column should be treated as a series of numerical values.</dd>
                 <dd>•	<strong>Categorical:</strong> Data in column should be treated as distinct categories.</dd>
             </dl>
             [Important]	Accurately identifying the data type contained in each column will significantly affect your machine learning model. Consult the owner of the dataset if you are unsure how to classify the type of data the columns contain.

             <dl>
                 <dd>R2-Learn attempts to automatically identify the data types of each column depending on where you’ve loaded your data from:</dd>
                 <dd>•	If you’ve loaded your dataset by connecting to a database, data type information for each column is captured from the database and displayed here.</dd>
                 <dd>•	If you’ve loaded your dataset by uploading a local file, data type information is automatically inferred for each column and displayed here.</dd>
             </dl>

             When you’ve finished verifying and editing your column data types, select <strong>Target Variable</strong> that we want our machine learning model to predict. The target variable should contain a data type that matches the Problem Type you’ve set when determining your Business Problem.
             <p>Click on the <strong>Target Variable</strong> dropdown menu and select a variable or column header to set as the target variable for your machine learning model.</p>
             You can also click on <strong>Select Undesirable Variables></strong> and remove columns or variables from the dataset used to train your machine learning model. You should consider removing variables that have a fixed one-to-one mapping to the target variable, such as:
             <dl>
                 <dd>•	ID numbers.</dd>
                 <dd>•	Names of people.</dd>
                 <dd>•	Product names.</dd>
                 <dd>•	Variables directly derived from the target variable.</dd>
                 <dd>•	Variables that the target variable is directly derived from.</dd>
             </dl>
             For example, in a dataset for training a model to predict the yearly income of a person, we can safely remove a variable that contains the monthly income of a person. Columns are dimmed in the main display when removed from your model.
             <p>When you’ve selected your target variable and removed any unwanted columns or variables from your dataset, click Continue to move on to Data Quality.</p>
    
             <Waypoint
                 onEnter={this.changeHash.bind(this,'3.3.3')}
             >
                <a href="javascript:;" name="3.3.3" className={styles.h2}>3.3.3. Data Quality</a>
             </Waypoint>
            When you get to the <strong>Data Quality</strong> tab, R2-Learn attempts to detect possible issues that would prevent accurate modeling. It checks for data quality issues at two levels:
             <dl>
                 <dd>•	1. Target Variable Quality: Here, R2-Learn analyzes and flags any issues that it encounters with your target variable.</dd>
                 <dd>•	2. All Data Quality: After R2-Learn has resolved issues with your target variable, it then examines the rest of your dataset for any possible issues.</dd>
             </dl>
             <img src="/support10.png" alt=""/>
             <dl>
                 <dt>Common Issues with Data</dt>
                 <Waypoint
                     onEnter={this.changeHash.bind(this,'3.3.3.1')}
                 >
                     <a href="javascript:;" name="3.3.3.1" className={styles.h2}/>
                 </Waypoint>
                 <dd>Two possible issue types that R2-Learn identifies and fixes are:</dd>
                 <dd>
                     •	<strong>Your Target Variable has more than 2 Unique Values:</strong> When working with a True or False (Binary Classification) business problem type, your target variable must have only 2 different unique values (typically, "true" and "false").
                     <img src="/support11.png" alt=""/>
                 </dd>
                  <dd>•	<strong>Data Type Mismatch:</strong> When a variable’s data type doesn’t match what R2-Learn expects, it issues a <strong>Data Type Mismatch</strong> warning. For example, R2-Learn issues a <strong>Data Type Mismatch</strong> warning if it thinks that a variable should be a numerical data type but contains text values instead.</dd>
                  <dd>•	<strong>Missing Value:</strong> Missing values in your dataset can be either due to an error in data collection or that a data point contains a null value.</dd>
                  <dd>[Note]A null value represents an absence of data ("no value"), and is different from "zero value".</dd>
                  <dd>•	<strong>Outlier:</strong> When working with continuous values, a data point is considered an outlier if is outside the expected range for the given dataset. It is important to inspect data points that are outliers, and determine if they are genuine deviations from the trend shown in the data, or bad data points.</dd>
             </dl>
             A list of available fixes for these issues can be found in Appendix: Data Quality Fixes.
             <dl>
                 <dt>Target Variable Quality</dt>
                 <Waypoint
                     onEnter={this.changeHash.bind(this,'3.3.3.2')}
                 >
                     <a href="javascript:;" name="3.3.3.2" className={styles.h2}/>
                 </Waypoint>
                 <dd>In the <strong>Target Variable Quality</strong> section, R2-Learn identifies and attempts to fix any issues it finds with your target variable.</dd>
             </dl>
             <p>When R2-Learn finds an issue that it can automatically fix, it displays these issues in the <strong>Data Quality</strong> tab:</p>
             <img src="/support12.png" alt=""/>
             <dl>
                 <dd>Doing nothing to have R2-Learn automatically fix issues with your target variable, or manually fix it by:</dd>
                 <dd>•	Click <strong>Fix it</strong> to modify how R2-Learn fixes issues in your target variable. See Appendix: Data Quality Fixes for a list of common fixes available.</dd>
                 <dd>•	Click <strong>Reselect Target Variable</strong> to go back to the Target Variable tab and select a new target variable.</dd>
                 <dd>•	Click <strong>Load a New Dataset</strong> to go back to the Data Connect tab and select a fresh dataset to work with. (To cancel loading a new dataset, click on the Data Quality tab.)</dd>
             </dl>
             <dl>
                 <dt>All Data Quality</dt>
                 <Waypoint
                     onEnter={this.changeHash.bind(this,'3.3.3.3')}
                 >
                     <a href="javascript:;" name="3.3.3.3" className={styles.h2}/>
                 </Waypoint>
                 <dd>Once you’ve resolved all issues with your target variable, R2-Learn then examines the quality of all the independent variables in your dataset, and displays a summary of its findings here.</dd>
             </dl>
             <img src="/support13.png" alt=""/>
             R2-Learn automatically provides default fixes. To override the default fixes, you can select one of the following:
             <dl>
                 <dd>•	Click <strong>Load a New Dataset</strong> mentioned in Target Variable Quality to go back to the Data Connect tab and select a fresh dataset to work with. (To cancel loading a new dataset, click on the <strong>Data Quality</strong> tab.)</dd>
                 <dd> Select <strong>Edit the Fixes.</strong> This brings up a dialog box that allows you to choose how you want to fix your data.</dd>
             </dl>
             <img src="/support14.png" alt=""/>
             See Appendix: Data Quality Fixes for a list of common fixes available.
             <div>[Note]	Saving the changes to your data may take a minute or two. Please be patient.</div>
             Once you’re done with verifying and fixing the quality of your data, click <strong>Continue</strong> to start Modeling your data.
    
             <Waypoint
                 onEnter={this.changeHash.bind(this,'3.4')}
             >
                <a href="javascript:;" name="3.4" className={styles.h2}>3.4. Modeling</a>
             </Waypoint>
             You’re ready to start building your machine learning model!
             <div>You can choose to build your machine learning model using:</div>
             <dl>
                 <dd> •	<strong>Automatic Modeling</strong>, or</dd>
                 <dd> •	<strong>Advanced Modeling</strong></dd>
             </dl>
             <Waypoint
                 onEnter={this.changeHash.bind(this,'3.4.1')}
             >
                <a href="javascript:;" name="3.4.1" className={styles.h2}>3.4.1. Automatic Modeling</a>
             </Waypoint>
             <strong>Automatic Modeling</strong> automatically builds your machine learning model for you, based on the training dataset that you’ve loaded and cleaned in the steps leading up to this point.
             <div>Click <strong>Automatic Modeling</strong> and R2-Learn will start building your model for you.</div>
             <Waypoint
                 onEnter={this.changeHash.bind(this,'3.4.2')}
             >
                <a href="javascript:;" name="3.4.2" className={styles.h2}>3.4.2. Advanced Modeling</a>
             </Waypoint>
             Selecting <strong>Advanced Modeling</strong> gives you more control over the modeling process.
             <div>For information on Advanced modeling, see Appendix: Advanced Modeling.</div>
             <Waypoint
                 onEnter={this.changeHash.bind(this,'3.4.3')}
             >
                <a href="javascript:;" name="3.4.3" className={styles.h2}>3.4.3. Building your model</a>
             </Waypoint>
             <Waypoint
                 onEnter={this.changeHash.bind(this,'3.4.3.1')}
             >
                 <a href="javascript:;" name="3.4.3.1" className={styles.h2}/>
             </Waypoint>
             <p>Once you’ve selected and finished configuring your modeling mode, R2-Learn will start building your machine learning model.</p>
             There is a possibility that the model training process will fail if R2-Learn is unable to train a sufficiently performant machine learning model from the given training dataset. If model training fails, you have to either reconfigure your project to fix dataset quality issues, or choose a new or larger dataset.
             <dl>
                 <dt>Model Selection</dt>
                 <dd>After your model training completes, R2-Learn displays a summary of your model training results in the Model Selection section. You’ll be shown different charts, depending on the <strong>Problem Statement</strong> that you’ve set:</dd>
                 <dd>•	Appendix: Model selection for Binary Classification problems</dd>
                 <dd>•	Appendix: Model selection for Regression problems</dd>
                 <dd>Once you’re done selecting your model, click <strong>Deploy the Model</strong> to deploy your model.</dd>
             </dl>
         </Fragment>
    }

    four(){
         return <Fragment>
             <Waypoint
                 onEnter={this.changeHash.bind(this,'4')}
             >
                <a href="javascript:;" name="4" className={styles.h1}>4. Deploying your models</a>
             </Waypoint>
             Deploying your models allow you to make predictions on a new set of input data. This usually involves publishing a REST API endpoint to which you can send data to and receive predictions from.
            <p>R2-Learn handles model deployment for you automatically. Once you’ve successfully created a machine learning model, you can access the deployed model by clicking on its containing project:</p>
             <img src="/support15.png" alt=""/>
             In an open project, you have the following tabs:
             <dl>
                 <dd>•	Deployment</dd>
                 <dd>•	Operation Monitor</dd>
                 <dd>•	Performance Monitor</dd>
                 <dd>•	Performance Status</dd>
             </dl>
             In addition, you can access the following options:
             <img src="/support16.png" alt=""/>
             <dl>
                 <dd>•	<strong>The model being used: </strong>Select a model to run a deployment or other operations on.</dd>
                 <dd>•	<strong>Deployment Data Definition:</strong> Click <strong>Download</strong> to download a text file containing a comma-separated list of the variables used by your model.</dd>
                 <dd>•	<strong>Email to Receive Alert:</strong> Click to enter an email address to send deployment-related alerts to.</dd>
             </dl>
             <Waypoint
                 onEnter={this.changeHash.bind(this,'4.1')}
             >
                <a href="javascript:;" name="4.1" className={styles.h2}>4.1. Deployment</a>
             </Waypoint>
             When you open a project in the Model deployment home page, you’ll be brought to the deployment tab. Here, you can select how you want to use your deployed machine learning models:
             <dl>
                 <dd>•	Predict with data source: Predict using data from a local file, or from a database.</dd>
                 <dd>•	Predict with API: Predict by sending data to R2-Learn using R2-Learn’s REST API.</dd>
             </dl>
             [Important]	Imported data must have the same variables as the machine learning model used. To download a file containing a list of variables required in your imported dataset, click <strong>Download</strong> next to <strong>Deployment Data Definition</strong>.
    
             <Waypoint
                 onEnter={this.changeHash.bind(this,'4.1.1')}
             >
                <a href="javascript:;" name="4.1.1" className={styles.h2}>4.1.1. Predict with data source</a>
             </Waypoint>
             To make a prediction on data imported from a data source:
             <div>1.	Click on <strong>Predict with Data Source</strong>.</div>
             <div>2.	Select the data source to import data from:</div>
             <dl className={styles.pl1}>
                 <dd>–	<strong>Database</strong>: Provide connection details to a database that contains data you want to run predictions on. For more information, see Importing data from a database.</dd>
                 <dd>–	<strong>Local File</strong>: Uploads a file to R2-Learn that contains data you want to run predictions on. For more information, see Importing a local file.</dd>
             </dl>
             3.	Select <strong>Result Location</strong>, where the <strong>Result Location</strong> is where your model’s predictions are saved:
             <dl className={styles.pl1}>
                 <dd> –	<strong>In App</strong>: Saves and displays the results in R2-Learn.</dd>
                 <dd> –	<strong>Upload to Database</strong>: Writes the results to a given database.</dd>
             </dl>
             4.	Select <strong>Deploy Frequency</strong>. This tells R2-Learn how to schedule the deployment:
             <dl className={styles.pl1}>
                 <dd >–	<strong>One Time</strong>: Sets your deployment to run a prediction on the data source once.</dd>
                 <dd> –	<strong>Auto Repeat</strong>: Sets your deployment to run predictions on the data source according to a set schedule.</dd>
             </dl>
             <img src="/support18.png" alt=""/>
             <dl>
                 <dd> –	<strong>Auto disable if any issue occurs:</strong> Select this option to stop the deployment if R2-Learn encounters an issue.</dd>
             </dl>
    
             <Waypoint
                 onEnter={this.changeHash.bind(this,'4.1.2')}
             >
                <a href="javascript:;" name="4.1.2" className={styles.h2}>4.1.2. Predict with API</a>
             </Waypoint>
             When you deploy your machine learning model in R2-Learn, a REST API endpoint is automatically generated for you to make requests to.
             <dl>
                 <dd>To make a prediction with R2-Learn’s REST API, you need:</dd>
                 <dd>•	An R2-Learn API KEY.</dd>
                 <dd>•	Your R2-Learn user name.</dd>
                 <dd>•	Your R2-Learn project name. For example, project 11/09/2018, 18:04:13.</dd>
                 <dd>•	Your R2-Learn model name. For example, Ridge1.auto.09.11.2018_18:05:24.</dd>
             </dl>
             <div>To run a prediction using R2-Learn’s REST API with cURL and save the results to output.csv, run the following command in your terminal:</div>
             <code>curl -F 'data=@path/to/local/file' http://service2.newa-tech.com/api/user_name/project_name/model_name/api_key -o output.csv</code>
             <div>You will need to write the URL encoded version of your project name and model name into the request. For example, project 11/09/2018, 18:04:13 as a URL encoded string is project%2011%2F09%2F2018%2C%2018%3A04%3A13, and Ridge1.auto.09.11.2018_18:05:24 as a URL encoded string is Ridge1.auto.09.11.2018_18%3A05%3A24.</div>
             <div>Your resulting cURL API request should look something like this:</div>
             <code>curl -F 'data=@/home/r2user/input_data.csv' http://service2.newa-tech.com/api/r2user/project%2011%2F09%2F2018%2C%2018%3A04%3A13/Ridge1.auto.09.11.2018_18%3A05%3A24/apikey912ec803b2ce49e4a -o /home/r2user/output.csv</code>
             <div>You can also write the API request in Python:</div>
             <code>
                 # API code
                 <div>import requests</div>
                 # Make predictions on your data
                 <div>data = {`"file": open('/path/to/your/data.csv', 'rb')`}</div>
                 {
                     `Response = requests.post('http://service2.newa-tech.com/api/<user_name>/<project_namr>/<model_name>/<api_key>', data)`
                 }
             </code>
             <Waypoint
                 onEnter={this.changeHash.bind(this,'4.2')}
             >
                <a href="javascript:;" name="4.2" className={styles.h2}>4.2. Monitor your deployed models</a>
             </Waypoint>
             <dl>
                 <dd>You can monitor and fine-tune the performance of your deployed models in the following tabs:</dd>
                 <dd>•	Operation Monitor</dd>
                 <dd>•	Performance Monitor</dd>
                 <dd>•	Performance Status</dd>
             </dl>
             <Waypoint
                 onEnter={this.changeHash.bind(this,'4.2.1')}
             >
                <a href="javascript:;" name="4.2.1" className={styles.h2}>4.2.1. Operation Monitor</a>
             </Waypoint>
             <dl>
                 <dd>This page displays information about any ongoing or completed operations for your models. For each operation, the operation monitor shows:</dd>
                 <dd>•	Model Name: The name of the model being run on the input data.</dd>
                 <dd>•	Start Time: Time at which the operation started.</dd>
                 <dd>•	End Time: Time at which the operation ended.</dd>
                 <dd>•	Deployment Style: The method by which R2-Learn connects to the input data: through a database connection, an uploaded local file, or through an API request.</dd>
                 <dd>•	Status: Status of the operation.</dd>
                 <dd>•	Results: Result of the operation.</dd>
                 <dd>In addition, the following options are available for each operation:</dd>
                 <dd>•	Download Result: After an operation completes, you can download the result dataset. The results are appended with an extra column named {`"<target_variable_name>_pred"`} that contains the predicted value for each data point.</dd>
                 <dd>•	Cancel Ongoing Deployment: Stops an ongoing operation.</dd>
             </dl>
    
             <Waypoint
                 onEnter={this.changeHash.bind(this,'4.2.2')}
             >
                <a href="javascript:;" name="4.2.2" className={styles.h2}>4.2.2. Performance Monitor</a>
             </Waypoint>
             Here, you can upload a validation dataset to run with a model on to validate the performance of that model.
             <dl>
                 <dd>You can connect R2-Learn to a validation dataset to run your model on by:</dd>
                 <dd>•	Importing data from a database</dd>
                 <dd> •	Importing a local file</dd>
                 <dd>The following options are available:</dd>
                 <dd>•	Measurement Metric: Select the measurement metric to use when running your model on the validation dataset. You can select one of the performance metrics based on your preference.</dd>
                 <dd>–	For Binary Classification models: Select either Accuracy or AUC as your measurement metric.</dd>
                 <dd> –	For Regression models: Select either RMSE or R² as your measurement metric.</dd>
                 <dd>•	Metric Threshold: This is the threshold which you can set for notifications of the performance of your deployed data. If the performance of the deployed data is worse than this threshold, R2-Learn displays an alert.</dd>
                 <dd>•	Deploy Frequency: You can schedule repeating operations here.</dd>
                 <dd>•	Auto Disable if any issue occurs: Enabling this option sets the operation to terminate if it encounters any issues.</dd>
             </dl>
    
             <Waypoint
                 onEnter={this.changeHash.bind(this,'4.2.3')}
             >
                <a href="javascript:;" name="4.2.3" className={styles.h2}>4.2.3. Performance Status</a>
             </Waypoint>
             <dl>
                 <dd>Here, you can monitor the status of any ongoing or completed operations. Displayed here is the following information:</dd>
                 <dd>•	Model Name: The name of the model being run on the input data.</dd>
                 <dd>•	Start Time: Time at which the operation started.</dd>
                 <dd>•	End Time: Time at which the operation ended.</dd>
                 <dd>•	Performance: Displays model performance.</dd>
                 <dd> –	For Regression models, it displays your model’s R² and RMSE.</dd>
                 <dd>–	For Binary Classification models, it displays your model’s AUC and Accuracy.</dd>
                 <dd>•	Threshold: The threshold you’ve set under Performance Setting</dd>
                 <dd>•	Results: After an operation completes, you can download the result dataset. The results are appended with an extra column named {'"<target_variable_name>_pred"'} that contains the predicted value for each data point.</dd>
             </dl>
         </Fragment>
    }

    five(){
         return <Fragment>
             <Waypoint
                 onEnter={this.changeHash.bind(this,'a')}
             >
                <a href="javascript:;" name="a" className={styles.h1}>Appendix A: Data Quality Fixes</a>
             </Waypoint>
             <dl>
                 <dd>Some of the issues with data quality that R2-Learn may flag are:</dd>
                 <dd>•	Data Type Mismatch: When a variable’s data type doesn’t match what R2-Learn expects given what it has inferred from the dataset, it issues a Data Type Mismatch warning. For example, if R2-Learn expects a variable to be categorical, but is labeled as numerical.</dd>
                 <dd>•	Missing Value: Missing values in your data can be either due to an error in data collection or a null value.</dd>
                 <dd>[Note]	 	A null value represents an absence of data ("no value"), and is different from "zero value".</dd>
                 <dd>•	Outlier: The data point is outside the expected range for the given dataset. It is important to inspect data points that are outliers, and determine if they are genuine deviations from the trend shown in the data or bad data points.</dd>
                 <dd>In the Data Quality tab, R2-Learn helps you fix these issues with the following tools:</dd>
                 <dd>•	Fixing outliers</dd>
                 <dd>•	Fixing missing values</dd>
                 <dd>•	Fixing data type mismatch</dd>
             </dl>
             <Waypoint
                 onEnter={this.changeHash.bind(this,'a.1')}
             >
                <a href="javascript:;" name="a.1" className={styles.h2}>A.1. Fixing outliers</a>
             </Waypoint>
             <dl>
                 <dd>•	Valid Range Editing</dd>
                 <dd>–	With our rule engine, our system automatically extrapolates from your dataset a reasonable range for a variable, and treats values outside the range as outliers. Editing the Valid Range manually expands or contracts the range of values that R2-Learn will accept for that variable.</dd>
                 <dd>•	Replace with Boundaries</dd>
                 <dd>–	Replace outlier values with the boundary value.</dd>
                 <dd>–	Applicable only to numerical variables.</dd>
                 <dd>–	For example, if a column has values [1, 50, 60, 70, 1000] and has a reasonable range of (40, 80), selecting Replace with Boundaries will replace the outliers [1] and [1000] with the respective boundary values, giving us the values [40, 50, 60, 70, 80].</dd>
                 <dd>•	Do Nothing</dd>
                 <dd>–	Leave the outlier value as is.</dd>
                 <dd>–	Applicable only to numerical variables.</dd>
                 <dd>•	Replace with mean value</dd>
                 <dd>–	Replace the outlier value with a value th</dd>
                 <dd> at is the average of all the values within the valid range in that column.</dd>
                 <dd>–	Applicable to only numerical variables.</dd>
                 <dd>–	For example, if a column has values [1, 50, 60, 70, 1000] with a valid range of (40,80) then the outlier values [1] and [1000] will be replaced with the value [60], giving us a resulting dataset of [60, 50, 60, 70, 60].</dd>
                 <dd>•	Replace with median value</dd>
                 <dd>–	Replace the outlier value with a value that is the median of all the values within the valid range in that column.</dd>
                 <dd>–	Applicable to only numerical variables.</dd>
                 <dd>–	For example, if a column has values [1, 6, 5, 8, 50] with a valid range of (3,10), then the outlier values [1] and [50] will be replaced with the value [6], giving us a resulting dataset of [6, 6, 5, 8, 6].</dd>
                 <dd>•	Drop the Rows</dd>
                 <dd> –	Removes the row that contains the outlier value.</dd>
                 <dd>•	Replace with 0</dd>
                 <dd>–	Replace the outlier value with 0.</dd>
                 <dd>–	Applicable only to numerical variables.</dd>
             </dl>
             <Waypoint
                 onEnter={this.changeHash.bind(this,'a.2')}
             >
                <a href="javascript:;" name="a.2" className={styles.h2}>A.2. Fixing missing values</a>
             </Waypoint>
             <dl>
                 <dd>•	Replace with most frequent value</dd>
                 <dd>–	Replace the missing value with the value that appears the most frequently for that column.</dd>
                 <dd>–	Applicable to only categorical variables.</dd>
                 <dd>–	For example, if a column has values [1, 2, 5, 3, 2], then all missing values will be set to category 2.</dd>
                 <dd>•	Replace with a new unique value</dd>
                 <dd> –	Replace the missing value with a new unique value that will function as a new category.</dd>
                 <dd> –	Applicable to only categorical variables.</dd>
                 <dd>•	Replace with mean value</dd>
                 <dd>–	Replace the missing values with the average of the remaining values in the column.</dd>
                 <dd>–	Applicable to only numerical variables.</dd>
                 <dd>–	For example, if a column has the following non-missing values [4, 6, 8], then all missing values will be replaced with the value 6.</dd>
                 <dd>•	Replace with median value</dd>
                 <dd> –	Replace missing values with the median of the remaining values in the column</dd>
                 <dd>–	Applicable to only numerical variables</dd>
                 <dd>–	For example, if a column has the following non-missing values [6, 5, 8], then all missing values will be replaced with the value 6.</dd>
                 <dd>•	Drop the rows</dd>
                 <dd>–	Removes the row that contains the missing value.</dd>
                 <dd>•	Replace with 0</dd>
                 <dd>–	Replaces the missing values with 0.</dd>
                 <dd>–	Applicable only to numerical variables.</dd>
                 <dd> •	Why Missing?</dd>
                 <dd> –	Alternatively, you can ask R2-Learn to fix the missing values for you. Select one of the following three options to tell R2-Learn why the value is missing, and let R2-Learn automatically fix the missing value:</dd>
                 <dd>•	"I don’t know"</dd>
                 <dd>•	"Left on blank on purpose"</dd>
                 <dd>•	"Failed to collect data"</dd>
             </dl>
             <Waypoint
                 onEnter={this.changeHash.bind(this,'a.3')}
             >
                <a href="javascript:;" name="a.3" className={styles.h2}>A.3. Fixing data type mismatch</a>
             </Waypoint>
             <dl>
                 <dd>•	Replace with mean value</dd>
                 <dd>–	Replace mismatched data values with the average of the remaining values in the column.</dd>
                 <dd> –	Applicable to only numerical variables.</dd>
                 <dd> –	For example, if a column has the following  values [4, 6, 8], then all mismatched values will be replaced with the value 6.</dd>
                 <dd>•	Delete the row</dd>
                 <dd>–	Removes the row that contains the mismatched value.</dd>
                 <dd>•	Replace with min value</dd>
                 <dd> –	Replace mismatched data values with the minimum of the remaining values in the column.</dd>
                 <dd>–	Applicable to only numerical variables.</dd>
                 <dd>–	For example, if a column has the following values [4, 6, 8], then all mismatched values will be replaced with the value 4.</dd>
                 <dd>•	Replace with max value</dd>
                 <dd>–	Replace mismatched data values with the maximum of the remaining values in the column.</dd>
                 <dd>–	Applicable to only numerical variables.</dd>
                 <dd>–	For example, if a column has the following values [4, 6, 8], then all mismatched values will be replaced with the value 8.</dd>
                 <dd>•	Replace with max+1 value</dd>
                 <dd>–	Replace mismatched data values with the maximum+1 of the remaining values in the column.</dd>
                 <dd>–	Applicable to only numerical variables.</dd>
                 <dd> –	For example, if a column has the following values [4, 6, 8], then all mismatched values will be replaced with the value 9.</dd>
                 <dd>•	Replace with most frequent value</dd>
                 <dd>–	Replace the mismatched data values with the value that appears the most frequently for that column.</dd>
                 <dd>–	Applicable to only categorical variables.</dd>
                 <dd>–	For example, if a column has values [1, 2, 5, 3, 2], then all mismatched values will be set to category 2.</dd>
                 <dd>•	Replace with median value</dd>
                 <dd>–	Replace mismatched values with the median of the remaining values in the column</dd>
                 <dd>–	Applicable to only numerical variables</dd>
                 <dd>–	For example, if a column has the following values [6, 5, 8], then all mismatched values will be replaced with the value 6.</dd>
             </dl>
         </Fragment>
    }

    six(){
        return <Fragment>
            <Waypoint
                onEnter={this.changeHash.bind(this,'b')}
            >
              <a href="javascript:;" name="b" className={styles.h1}>Appendix B: Advanced Modeling</a>
            </Waypoint>
            When you select Advanced Modeling, you can configure the following settings:
            <Waypoint
                onEnter={this.changeHash.bind(this,'b.1')}
            >
                <a href="javascript:;" name="b.1" className={styles.h2}>B.1. Advanced Variable Settings</a>
            </Waypoint>
            <dl>
                <dd>Under this section, you can modify the variables in your data to alter your model. You can change the following in Advanced Variable Settings:</dd>
                <dd>•	Selecting/Deselecting Variables: You can select additional variables or remove variables from your dataset. After your machine learning model has been built, you can see how the change in your variable selection affects your model in the Model Selection section.</dd>
                <dd>•	Check Correlation Matrix: Click Check Correlation Matrix to display a small graph that shows the correlational strength between 15 variables with the strongest correlational relationships in your dataset. The stronger the correlation, the cooler (closer to blue) the color. Cool colors (shades of blue) represent a positive correlation, while warm colors (shades of red) represents a negative correlation.</dd>
            </dl>
            <img src="/support19.png" alt=""/>
            <dl>
                <dd>•	Create New Variable: Click Create New Variable to add a new variable to your model. This new variable can be a combination of existing variables, or an operation performed on an existing variable. To create a new variable:</dd>
                <dd>a.	Click on Create New Variable.</dd>
                <dd> b.	Enter a unique name for your new variable.</dd>
                <dd> c.	Click on the field after the equal ("=") sign to open a dropdown menu listing all possible operations. You can perform the following operations on your existing variables to create your new variable:</dd>
                <dd>•	Groupby and compute</dd>
                <dd>•	Combine Variables</dd>
                <dd>•	Compare Values</dd>
                <dd>•	Accumulate Values</dd>
                <dd>•	log()</dd>
                <dd>•	Other operators: +,-,*,/</dd>
                <dd>[Note]	For more information on each of these operations, click on See Tips when selecting the operation.</dd>
                <dd>•	Histogram/Bar Chart: Clicking on a variable’s "Histogram" displays a graph that shows the distribution of all the values for the variable. Numerical variables are shown as a histogram while categorical variables are shown as a bar chart.</dd>
            </dl>
            <img src="/support20.png" alt=""/>
            •	<strong>Univariant Plot:</strong> Clicking on a variable’s "Univariant Plot" displays a graph that shows a distribution of the values for that variable.
            <img src="/support21.png" alt=""/>
            •	<strong>Variable Importance:</strong>  The variable importance section represents the statistical significance of a predictor for the target variable; the higher the "Importance" of a variable, the more a change in this variable would affect the predicted target variable. Variables displayed in Advance Variable Settings are by default sorted from highest to lowest "Importance".
            <Waypoint
                onEnter={this.changeHash.bind(this,'b.2')}
            >
                <a href="javascript:;" name="b.2" className={styles.h2}>B.2. Advanced Modeling Setting</a>
            </Waypoint>
            Here you are able to configure other settings for model building:
            <Waypoint
                onEnter={this.changeHash.bind(this,'b.2.1')}
            >
                <a href="javascript:;" name="b.2.1" className={styles.h2}>B.2.1. Create/Edit Model Setting By default</a>
            </Waypoint>
            <dl>
                <dd>When you click on Advanced Modeling, R2-Learn creates a new "Model Setting". In the Advanced Modeling Settings tab, your new model setting is:</dd>
                <dd>1.	Given the default name "custom.{"<MM.DD.YYY_HH:MM:SS>"}"</dd>
                <dd>2.	Sets the {'{select}'} field to this new model setting.</dd>
            </dl>
            You can build on a previously defined "Model Setting" by selecting it in the {'{select}'} field. Change the name in the "Name Your Model Settings" field to save your modified model settings as a new model setting.
            <Waypoint
                onEnter={this.changeHash.bind(this,'b.2.2')}
            >
                <a href="javascript:;" name="b.2.2" className={styles.h2}>B.2.2. Select Algorithm</a>
            </Waypoint>
            By default, R2-Learn builds models for each project using all available classifier algorithms. You can remove classifiers from this list to reduce the amount of time modeling takes. The following is a table of classifiers and the problem types they are compatible with:
            <dl className={styles.table}>
                <dt>
                    <ul>
                        <li>Algorithm</li>
                        <li>Binary Classification</li>
                        <li>Regression</li>
                    </ul>
                </dt>
                <dd>
                    <ul>
                        <li>Adaboost</li>
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
                        <li>Gaussian Naive Bayes</li>
                        <li>✓</li>
                        <li/>
                    </ul>
                </dd>
                <dd>
                    <ul>
                        <li>Gaussian Process</li>
                        <li/>
                        <li>✓</li>
                    </ul>
                </dd>
                <dd>
                    <ul>
                        <li>Gradient Boosting</li>
                        <li>✓</li>
                        <li>✓</li>
                    </ul>
                </dd>
                <dd>
                    <ul>
                        <li>K Nearest Neighbor</li>
                        <li>✓</li>
                        <li>✓</li>
                    </ul>
                </dd>
                <dd>
                    <ul>
                        <li>Linear Discriminant Analysis</li>
                        <li>✓</li>
                        <li/>
                    </ul>
                </dd>
                <dd>
                   <ul>
                       <li>Multinomial Naive Bayes</li>
                       <li>✓</li>
                       <li/>
                   </ul>
                </dd>
                <dd>
                    <ul>
                        <li>Passive Aggressive</li>
                        <li>✓</li>
                        <li/>
                    </ul>
                </dd>
                <dd>
                    <ul>
                        <li>Quadratic Discriminant Analysis</li>
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
                       <li>SGD (Stochastic Gradient Descent)</li>
                       <li>✓</li>
                       <li>✓</li>
                   </ul>
                </dd>
                <dd>
                    <ul>
                        <li>Logistic Regression</li>
                        <li>✓</li>
                        <li/>
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
            <Waypoint
                onEnter={this.changeHash.bind(this,'b.2.3')}
            >
                <a href="javascript:;" name="b.2.3" className={styles.h2}>B.2.3. Set Max Model Ensemble Size</a>
            </Waypoint>
            This is the maximum number of sub-models you R2-Learn that can be combined to form one machine learning model, or an ensemble model For example, if the Max Model Ensemble Size is set to 3, then the resulting ensemble can be made up of a maximum number of 3 sub-models.
            <div>The actual number of sub-models in the resulting ensemble would depend on the allotted training time.</div>
            <Waypoint
                onEnter={this.changeHash.bind(this,'b.2.4')}
            >
                <a href="javascript:;" name="b.2.4" className={styles.h2}>B.2.4. Train Validation Holdout and Cross Validation</a>
            </Waypoint>
            You can choose to build your machine learning models using:
            •	Train Validation Holdout: This constructs a machine learning model by partitioning your training dataset into the three subsets:
            <dl className={styles.pl1}>
                <dd>–	Training set: This is used to build the machine learning model.</dd>
                <dd> –	Validation set: This is used to tune the hyper parameters of classifiers for better accuracy.</dd>
                <dd>–	Holdout set: This set of data helps assess the performance of the final model; it does not play any role in model building, but is used for validating the built model.</dd>
                <dd>You are able to set the percentage of your dataset to use for each subset by dragging the circle at the intersection of any two sets.</dd>
            </dl>
            •	K-fold Cross Validation Holdout: This constructs a machine learning model by:
            <dl className={styles.pl1}>
                <dd>a.	Partitioning your training dataset into 'k' number of "folds", or 'k' number of equally sized subsamples.</dd>
                <dd>b.	Running a modeling process where each of the 'k' subsamples is in turn used as the validation set while the remaining subsamples are used as training set.</dd>
                <dd>c.	This process is repeated for each of the 'k' subsamples, giving us 'k' number of models.</dd>
                <dd>d.	We then find the average of the 'k' number of models to attain a single model.</dd>
                <dd>This method takes much longer than the Train Validation Holdout. You are able to set the number of folds and the holdout percentage.</dd>
            </dl>
            <Waypoint
                onEnter={this.changeHash.bind(this,'b.2.5')}
            >
                <a href="javascript:;" name="b.2.5" className={styles.h2}>B.2.5. Resampling Setting</a>
            </Waypoint>
            [Note]	Only available for Binary Classification models.
            <div>If the target variable shows an uneven distribution of sample sizes for each outcome, then you have an unbalanced dataset.</div>
            R2-Learn can balance out your dataset by upsampling or downsampling your training dataset. For both upsampling and downsampling, you can adjust the ratio of one category to another.
            <Waypoint
                onEnter={this.changeHash.bind(this,'b.2.6')}
            >
                <a href="javascript:;" name="b.2.6" className={styles.h2}>B.2.6. Set Measurement Metric</a>
            </Waypoint>
            You can change the measurement metric used to judge the effectiveness of the machine learning model.
            <div>For Binary Classification models, you can select:</div>
            <dl className={styles.pl1}>
                <dd>•	AUC (area under the curve) (default)</dd>
                <dd>•	Accuracy</dd>
                <dd>•	F1</dd>
            </dl>
            For Regression models, you can select:
            <dl>
                <dd>•	MSE (mean square error) (default)</dd>
                <dd>•	R²</dd>
            </dl>
            <Waypoint
                onEnter={this.changeHash.bind(this,'b.2.7')}
            >
                <a href="javascript:;" name="b.2.7" className={styles.h2}>B.2.7. Set Max Optimization Time</a>
            </Waypoint>
            You can set the maximum optimization time for optimizing the model building parameters. The longer the time allotted for optimization, the better the performance of the resulting machine learning model. For larger training datasets, we recommend you to set a higher maximum optimization time.
            <div>For any dataset, you should set an optimization time of at least 9 minutes.</div>
            <Waypoint
                onEnter={this.changeHash.bind(this,'b.2.8')}
            >
                <a href="javascript:;" name="b.2.8" className={styles.h2}>B.2.8. Random Seed</a>
            </Waypoint>
            This seeds any random numbers generated while training your machine learning models. Setting the seed allows you to reproduce your modeling process by using the same random seed to build similar models.
        </Fragment>
    }

    seven(){
        return <Fragment>
            <Waypoint
                onEnter={this.changeHash.bind(this,'c')}
            >
                <a href="javascript:;" name="c" className={styles.h1}>Appendix C: Model selection for Binary Classification problems</a>
            </Waypoint>
            <Waypoint
                onEnter={this.changeHash.bind(this,'c.1')}
            >
                <a href="javascript:;" name="c.1" className={styles.h2}>C.1. Simplified view</a>
            </Waypoint>
            <img src="/support22.png" alt=""/>
            <dl>
                <dd>When in the Model Selection tab for Binary Classification problems, the following is displayed:</dd>
                <dd>•	Modeling Results: A general grade indicating the general performance levels of the trained models.</dd>
                <dd>•	Selected Model: Your currently selected machine learning model. This is selected from the list of trained machine learning models displayed below.</dd>
                <dd>•	Target: The Target Variable that is being predicted by the machine learning model.</dd>
                <dd>•	Performance: Shows the performance of the selected model. This is usually AUC (area under the curve) for Binary Classification models.</dd>
                <dd>•	Accuracy: Shows the accuracy of the predictions made by the selected model.</dd>
                <dd>•	Select your model based on your own criteria: R2-Learn automatically selects a model that it thinks is the most suitable for your business problem from the list of trained models. You modify the means by which it picks its recommendation by selecting one of the following options:</dd>
            </dl>
            <dl className={styles.pl1}>
                <dd>–	R2-Learn’s Default Recommendation: R2-Learn makes a recommendation based on a balance between execution time and performance.</dd>
                <dd>–	Cost Based: Here, you can quantify the business costs incurred for false positives (Type I errors) and false negatives (Type II errors), and the benefits gained from correct positive and negative predictions. R2-Learn will recommend a model to use based on this data.</dd>
                <dd><img src="/support23.png" alt=""/></dd>
            </dl>
            •	Table of trained models: This section also shows a list of models that have been built with the training data. The listed models each have a:
            <dl className={styles.pl1}>
                <dd>–	Model Name: The name of this model. This is usually {'"<algorithm_name>.<model_setting_name>"'}, where {'<model_setting_name>'} is automatically determined if you have selected Automatic Modeling, or is set when configuring your Advanced Modeling Setting.</dd>
                <dd>–	Accuracy: Shows the proportion of predictions the model makes that match actual outcomes. The higher this value is, the more likely a prediction the model makes is correct.</dd>
                <dd>–	Performance: Shows the performance metric for this model. This is usually AUC (area under the curve) for Binary Classification models, and MSE (mean square error) for Regression models.</dd>
                <dd>–	Execution Speed: The amount of time the model will take to process a given number of rows in a dataset.</dd>
                <dd>–	Variable Impact: Click on check to see the impact each of the model’s variables has on the target variable. Displays the impacts each variable in the model has on the predicted target variable. The higher this value is, the larger the effect a change in this variable has on the outcome predicted by the model.</dd>
                <dd>–	Model Process Flow: Click on check to display a step-by-step breakdown on how this model is built.</dd>
            </dl>
            <Waypoint
                onEnter={this.changeHash.bind(this,'c.2')}
            >
                <a href="javascript:;" name="c.2" className={styles.h2}>C.2. Advanced View</a>
            </Waypoint>
            <dd><img src="/support24.png" alt=""/></dd>
            Users can use the Advanced View to view more detailed information about the models available for deployment.
            <Waypoint
                onEnter={this.changeHash.bind(this,'c.2.1')}
            >
                <a href="javascript:;" name="c.2.1" className={styles.h2}>C.2.1. Top Section</a>
            </Waypoint>
            <dl>
                <dd>The top of the section displays the following:</dd>
                <dd>•	Modeling Results: A general grade indicating the general performance levels of the trained models.</dd>
                <dd>•	Model Name Contains: Allows you to filter the model name by algorithm and by Model Setting name.</dd>
                <dd>•	Model Comparison Charts: Charts the performance of each model for the following performance comparisons:</dd>
            </dl>
            <dl className={styles.pl1}>
                <dd>–	Speed v.s. Accuracy: Charts the speed v.s. accuracy tradeoff for each model.</dd>
                <dd>–	Lifts Chart: The Lift Chart is used to determine the effectiveness of a model by showing the ratio between results obtained with and without using the predictive model.</dd>
                <dd>–	ROC Curves: Charts the diagnostic ability of the binary classifier as its threshold varies.</dd>
            </dl>
            <Waypoint
                onEnter={this.changeHash.bind(this,'c.2.2')}
            >
                <a href="javascript:;" name="c.2.2" className={styles.h2}>C.2.2. Table of Models</a>
            </Waypoint>
            <dl>
                <dd>The table below displays all the models trained with the dataset. Each listed model has a:</dd>
                <dd>•	Model Name: The name of this model. This is usually {'"<algorithm_name>.<model_setting_name>"'}, where {'<model_setting_name>'} is automatically determined if you have selected Automatic Modeling, or is set when configuring your Advanced Modeling Setting.</dd>
                <dd>•	F1-Score: This score is a measure of test set accuracy: F1 = 2 * precision * recall / (precision + recall).</dd>
                <dd>•	Precision: The proportion of all predictions (including true and false positives) that are true positives. Precision = TP/(TP+FP).</dd>
                <dd>•	Recall: The proportion of positives that the classification model correctly labels as positives. Recall =TP/(TP+FN).</dd>
                <dd>•	Cutoff Threshold: Many classifiers are able to produce a probability distribution over a set of classes (e.g. 1 or 0). Cut-off threshold is a probability value which can be used to determine whether an observation belongs to a particular class.</dd>
                <dd>•	Variable List: Shows which of the variables in the training dataset are included in the model.</dd>
                <dd>•	Validation/Cross Validation: The Validation/Cross Validation dataset is the data that is set aside to fine-tune an initial model to see if relationships between variables are correctly manipulated to create the best model possible.</dd>
                <dd>•	Holdout: Holdout is the proportion of the original dataset that has been set aside for the final testing of finished models. The data set aside for holdout is not used in the construction or tuning of the initial model, but is instead used to evaluate how well the model performs.</dd>
            </dl>
            <Waypoint
                onEnter={this.changeHash.bind(this,'c.2.3')}
            >
                <a href="javascript:;" name="c.2.3" className={styles.h2}>C.2.3. Additional Model Details</a>
            </Waypoint>
            To view additional model details, click on the + next to the Model Name to expand the model selection.
            <img src="/support25.png" alt=""/>
            <dl>
                <dd>This displays a panel with the following charts:</dd>
                <dd>1.	Error/Confusion Matrix: This displays a matrix comparing predicted values with actual values, and shows the number of True Positives (TP), False Positives (FP), True Negatives (TN), and False Negatives (FN) predicted by this model.</dd>
                <dd>2.	ROC Curves (adjustable): Charts the diagnostic ability of the binary classifier as its threshold varies. Click on the slider to adjust the ratio of these values.</dd>
                <dd>3.	Prediction Distribution (adjustable): This plots Probability Threshold against Probability Density. Click on the slider to adjust the ratio of these values.</dd>
                <dd>4.	Precision Recall Tradeoff (adjustable): This plots Recall (TP/(TP+FN)) against Precision (TP/(TP+FP)), showing us how accurate the model’s predictions are. Click on the slider to adjust the ratio of these values.</dd>
                <dd>5.	Lift Chart: The Lift Chart is used to determine the effectiveness of a model by showing the ratio between results obtained with and without using the predictive model.</dd>
                <dd>6.	Model Process Flow: Shows a step-by-step breakdown on how this model is built.</dd>
                <dd>7.	Variable Impact: Displays the impacts each variable in the model has on the predicted target variable. The higher this value is, the larger the effect a change in this variable has on the outcome predicted by the model.</dd>
            </dl>
        </Fragment>
    }

    eight(){
        return <Fragment>
            <Waypoint
                onEnter={this.changeHash.bind(this,'d')}
            >
                <a href="javascript:;" name="d" className={styles.h1}>Appendix D: Model selection for Regression problems</a>
            </Waypoint>
            <Waypoint
                onEnter={this.changeHash.bind(this,'d.1')}
            >
                <a href="javascript:;" name="d.1" className={styles.h2}>D.1. Simplified View</a>
            </Waypoint>
            <img src="/support26.png" alt=""/>
            When in the Model Selection tab for Regression problems, the following is displayed:
            <div>•	Selected Model: Your currently selected machine learning model. This is selected from the list of trained machine learning models displayed below.</div>
            •	Normalized RMSE (Root Mean Square Error): This value will help you compare model performance: the smaller the Normalized RMSE, the better the model predicts data.
            <div>•	Quality of fit (R²): R² is a statistical measure of how close the regression line fits the given data. The higher the R² value is, the closer the model fits the data.</div>
            <div className={styles.pl1}>–	Variable Impact: Displays the impacts each variable in the model has on the predicted target variable. The higher this value is, the larger the effect a change in this variable has on the outcome predicted by the model.</div>
            •	Predicted v.s. Actual Plot (Sorted): Shows how close the values predicted by your models are to actual values. You can change the number of data points shown by clicking on Edit under the chart.
            <div>•	Table of trained models: This section also shows a list of models that have been built with the training data. The listed models each have a:</div>
            <dl className={styles.pl1}>
                <dd>–	Model Name: The name of this model. This is usually {'"<algorithm_name>.<model_setting_name>"'}, where {'<model_setting_name>'} is automatically determined if you have selected Automatic Modeling, or is set when configuring your Advanced Modeling Setting.</dd>
                <dd>–	Error (Normalised RMSE): RMSE (root of mean square error) is square root of the standard error of the model, and is a measure of how close your model’s predictions are to the actual target variable values.</dd>
                <dd>–	Execution Speed: The amount of time the model will take to process a given number of rows in a dataset.</dd>
                <dd>–	Variable Impact: Click on check to see the impact each of the model’s variables has on the target variable. The higher this value is, the larger the effect a change in this variable has on the outcome predicted by the model.</dd>
                <dd>–	Model Process Flow: Click on check to display a step-by-step breakdown on how this model is built.</dd>
            </dl>
            <Waypoint
                onEnter={this.changeHash.bind(this,'d.2')}
            >
                <a href="javascript:;" name="d.2" className={styles.h2}>D.2. Advanced View</a>
            </Waypoint>
            <img src="/support27.png" alt=""/>
            Users can use the Advanced View to view more detailed information about the models available for deployment.
            <Waypoint
                onEnter={this.changeHash.bind(this,'d.2.1')}
            >
                <a href="javascript:;" name="d.2.1" className={styles.h2}>D.2.1. Top Section</a>
            </Waypoint>
            The top of the section displays the following:
            <div>•	Model Name Contains: Allows you to filter the model name by algorithm and by Model Setting name.</div>
            <Waypoint
                onEnter={this.changeHash.bind(this,'d.2.2')}
            >
            <a href="javascript:;" name="d.2.2" className={styles.h2}>D.2.2. Table of Models</a>
            </Waypoint>
            <dl>
                <dd>The table below displays all the models trained with the dataset. Each listed model has a:</dd>
                <dd>•	Model Name: The name of this model. This is usually {'"<algorithm_name>.<model_setting_name>"'}, where {'<model_setting_name>'} is automatically determined if you have selected Automatic Modeling, or is set when configuring your Advanced Modeling Setting.</dd>
                <dd>•	RMSE (Root Mean Square Error): RMSE is the square root of MSE. Usually used to compare the likelihood of predictive errors across different models</dd>
                <dd>•	RMLSE (Root Mean Logarithmic Square Error): This is the square root of the logarithmic value of MSE.</dd>
                <dd>•	MSE (Mean Square Error): MSE measures the prediction error of the model. It is the sum of the difference between values predicted by the model and actual values, divided by the total number of data points.</dd>
                <dd>•	MAE (Mean Absolute Error): This measures the prediction error of the model. It is the sum of absolute value of the difference between values predicted by the model and actual values.</dd>
                <dd>•	R²: R² is a statistical measure of how close the regression line fits the given data. The higher the R² value is, the closer the model fits the data.</dd>
                <dd>•	R² Adjusted: An Adjusted R² is a modified version of R² which has been adjusted for the number of predictors in the model. It is always lower than R².</dd>
                <dd>•	Variable List: Shows which of the variables in the training dataset are included in the model.</dd>
                <dd>•	Validation/Cross Validation: The Validation/Cross Validation dataset is the set of data that is set aside from the original dataset to fine-tune an initial model to see if relationships between variables are correctly manipulated to create the best model possible.</dd>
                <dd>•	Holdout: The holdout is the proportion of the original dataset that has been set aside for the final testing of finished models. The data set aside for holdout is not used in the construction or tuning of the initial model, but is instead used to evaluate how well the model performs.</dd>
            </dl>
            <Waypoint
                onEnter={this.changeHash.bind(this,'d.2.3')}
            >
                <a href="javascript:;" name="d.2.3" className={styles.h2}>D.2.3. Additional Model Details</a>
            </Waypoint>
            To view additional model details, click on the + next to the Model Name to expand the model selection.
            <img src="/support28.png" alt=""/>
            This displays a panel with the following charts:
            <div>1.	Fit plot: The fit plot charts the predictive accuracy of a model by plotting actual target variable values in the dataset (x-axis) against predicted target variable values (y-axis). A straight line (y = x) is drawn on the graph, showing all the points on the graph where a predicted target variable value is equal to its corresponding actual target variable value. The more points on the graph that are close to or on the line, the better the predictive performance of the model.</div>
            2.	Residual plot: A "residual" is the difference between the actual target variable value and the predicted target variable value for a given data point. The residual plot charts actual target variable values (y-axis) against their corresponding residuals (x-axis) to show possible issues with applying the model to the given dataset.
            Click on Diagnose to get R2-Learn to make recommendations on how to improve your model by comparing the shape of your current model’s residual plot to known residual plot shapes. In the dialog box that opens, select from the following a residual plot shape that most closely resembles your model’s residual plot:
            <dl className={styles.pl1}>
                <dd>–	Randomly distributed residual plot.</dd>
                <dd>–	Y-axis unbalanced residual plot.</dd>
                <dd>–	X-axis unbalanced residual plot.</dd>
                <dd>–	Outliers residual plot.</dd>
                <dd>–	Nonlinear residual plot.</dd>
                <dd>–	Heteroscedasticity residual plot.</dd>
                <dd>–	Large Y-axis data points residual plot.</dd>
            </dl>
            3.	Model Process Flow: Shows a step-by-step breakdown on how this model is built.
            <div>4.	Variable Impact: Displays the impacts each variable in the model has on the predicted target variable. The higher this value is, the larger the effect a change in this variable has on the outcome predicted by the model.</div>
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
