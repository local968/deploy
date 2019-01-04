import React, { Component } from "react";
import styles from "./styles.module.css";

export default class Article extends Component {
    render(){
        return <section>
            <a className={styles.h1}>1. Overview</a>
            R2-Learn helps companies turn data into machine learning models quickly without needing AI (artificial intelligence) expertise. Built with cutting edge technology, R2-Learn uses AI to guide you through the process of creating, deploying, and keeping up-to-date custom machine learning models using data that you already have.
            This section introduces the key concepts of machine learning and how they relate to R2-Learn.

            <a className={styles.h2}>1.1. Machine learning</a>
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
        </section>
    }
}
