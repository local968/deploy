import { Component } from 'react';
import styles from './FuncTips.module.css';
import EN from '../../constant/en';
import { Table } from 'antd';
import React from 'react';

interface FunctionTipsProps {
  value: string;
}

export default class FunctionTips extends Component<FunctionTipsProps> {
  Concat() {
    return (
      <div className={styles.funcTips}>
        <div className={styles.funcTipsName}>
          <span>{EN.Concat}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Concatfunctionallowsyou}</span>
        </div>
        <div className={styles.funcTipsTitle}>
          <span>{EN.Syntax}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Concatvar1}</span>
        </div>
        <div className={styles.funcTipsTitle}>
          <span>{EN.Input}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>
            {EN.Var1var2var3}
            <br />
            {EN.Numberofvariables}
          </span>
        </div>
        <div className={styles.funcTipsTitle}>
          <span>{EN.Output}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Categoricalvariables}</span>
        </div>
        <div className={styles.funcTipsTitle}>
          <span>{EN.Examples}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Concatcolor}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Output}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <Table
            bordered={true}
            defaultExpandAllRows={true}
            pagination={false}
            size="small"
            dataSource={[
              { key: '1', 1: 'red_nature', 2: 'red_small', 3: 'nature_small' },
              {
                key: '2',
                1: 'blue_sports',
                2: 'blue_medium',
                3: 'sports_medium',
              },
            ]}
            columns={[
              {
                title: 'color_theme',
                dataIndex: '1',
                key: 1,
                className: styles.funcTipsCol,
              },
              {
                title: 'color_size',
                dataIndex: '2',
                key: 2,
                className: styles.funcTipsCol,
              },
              {
                title: 'theme_size',
                dataIndex: '3',
                key: 3,
                className: styles.funcTipsCol,
              },
            ]}
          />
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Concatolor3}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Output}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <Table
            bordered={true}
            defaultExpandAllRows={true}
            pagination={false}
            size="small"
            dataSource={[
              { key: '1', 1: 'red_nature_small' },
              { key: '2', 1: 'blue_sports_medium' },
            ]}
            columns={[
              {
                title: 'color_theme_size',
                dataIndex: '1',
                key: 1,
                className: styles.funcTipsCol,
              },
            ]}
          />
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Concat23}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Output}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <Table
            bordered={true}
            defaultExpandAllRows={true}
            pagination={false}
            size="small"
            dataSource={[
              {
                key: '1',
                1: 'red_nature',
                2: 'red_small',
                3: 'nature_small',
                4: 'red_nature_small',
              },
              {
                key: '2',
                1: 'blue_sports',
                2: 'blue_medium',
                3: 'sports_medium',
                4: 'blue_sports_medium',
              },
            ]}
            columns={[
              {
                title: 'color_theme',
                dataIndex: '1',
                key: 1,
                className: styles.funcTipsCol,
              },
              {
                title: 'color_size',
                dataIndex: '2',
                key: 2,
                className: styles.funcTipsCol,
              },
              {
                title: 'theme_size',
                dataIndex: '3',
                key: 3,
                className: styles.funcTipsCol,
              },
              {
                title: 'color_theme_size',
                dataIndex: '4',
                key: 4,
                className: styles.funcTipsCol,
              },
            ]}
          />
        </div>
        <div className={styles.funcTipsTitle}>
          <span>{EN.Notice}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Iftoomanynewvariablesarecreated}</span>
        </div>
      </div>
    );
  }

  Diff() {
    return (
      <div className={styles.funcTips}>
        <div className={styles.funcTipsName}>
          <span>{EN.Diff}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Difffunctionallowsyoutoeasily}</span>
        </div>
        <div className={styles.funcTipsTitle}>
          <span>{EN.Syntax}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.DIffrow1}</span>
        </div>
        <div className={styles.funcTipsTitle}>
          <span>{EN.Input}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>
            {EN.Ormorenumericalvariables}
            <br />
            {EN.Distancetobecalculated}
          </span>
        </div>
        <div className={styles.funcTipsTitle}>
          <span>{EN.Output}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Numericalvariable}</span>
        </div>
        <div className={styles.funcTipsTitle}>
          <span>{EN.Example}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Difftax}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Output}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <Table
            bordered={true}
            defaultExpandAllRows={true}
            pagination={false}
            size="small"
            dataSource={[
              { key: '1', 1: '200', 2: 'nan', 3: 'nan' },
              { key: '2', 1: '230', 2: '30', 3: 'nan' },
              { key: '3', 1: '280', 2: '50', 3: '80' },
              { key: '4', 1: '250', 2: '-30', 3: '20' },
            ]}
            columns={[
              {
                title: 'tax',
                dataIndex: '1',
                key: 1,
                className: styles.funcTipsCol,
              },
              {
                title: 'tax_diff_r1',
                dataIndex: '2',
                key: 2,
                className: styles.funcTipsCol,
              },
              {
                title: 'tax_diff_r2',
                dataIndex: '3',
                key: 3,
                className: styles.funcTipsCol,
              },
            ]}
          />
        </div>
        <div className={styles.funcTipsTitle}>
          <span>{EN.Notice}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Iftoomanynewvariablesarecreated}</span>
        </div>
      </div>
    );
  }

  Accumulate() {
    return (
      <div className={styles.funcTips}>
        <div className={styles.funcTipsName}>
          <span>{EN.Accumulate}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Accumulatefunction}</span>
        </div>
        <div className={styles.funcTipsTitle}>
          <span>{EN.Syntax}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Accumulatevar1var2}</span>
        </div>
        <div className={styles.funcTipsTitle}>
          <span>{EN.Input}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Morenumericalvariables}</span>
        </div>
        <div className={styles.funcTipsTitle}>
          <span>{EN.Output}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Numericalvariable}</span>
        </div>
        <div className={styles.funcTipsTitle}>
          <span>{EN.Example}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Accumulatedaily_sales}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Output}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <Table
            bordered={true}
            defaultExpandAllRows={true}
            pagination={false}
            size="small"
            dataSource={[
              { key: '1', 1: '1000', 2: '1000', 3: '200', 4: '200' },
              { key: '2', 1: '1500', 2: '2500', 3: '300', 4: '500' },
              { key: '3', 1: '1800', 2: '4300', 3: '350', 4: '850' },
            ]}
            columns={[
              {
                title: 'daily_sales',
                dataIndex: '1',
                key: 1,
                className: styles.funcTipsCol,
              },
              {
                title: 'daily_sales_accum',
                dataIndex: '2',
                key: 2,
                className: styles.funcTipsCol,
              },
              {
                title: 'daily_cost',
                dataIndex: '3',
                key: 3,
                className: styles.funcTipsCol,
              },
              {
                title: 'daily_cost_accum',
                dataIndex: '4',
                key: 4,
                className: styles.funcTipsCol,
              },
            ]}
          />
        </div>
        <div className={styles.funcTipsTitle}>
          <span>{EN.Notice}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Iftoomanynewvariablesarecreatedcsystem}</span>
        </div>
      </div>
    );
  }

  Quantile_bin() {
    return (
      <div className={styles.funcTips}>
        <div className={styles.funcTipsName}>
          <span>{EN.Quantile_bin}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Quantile_binfunctionallows}</span>
        </div>
        <div className={styles.funcTipsTitle}>
          <span>{EN.Syntax}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Quantile_binvar1var2}</span>
        </div>
        <div className={styles.funcTipsTitle}>
          <span>{EN.Input}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>
            {EN.Allvariablesneedtostartwith}
            <br />
            {EN.Numberofgroupstobedivided}
            <br />
            {EN.Type1type2}
            <br />
            {EN.Variableisdividedbyitspercentile}
            <br />
            {EN.Eachgroupiswiththesamevaluerange}
          </span>
        </div>
        <div className={styles.funcTipsTitle}>
          <span>{EN.Output}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Categoricalvariables}</span>
        </div>
        <div className={styles.funcTipsTitle}>
          <span>{EN.Example}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Quantile_binage}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Output}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <Table
            bordered={true}
            defaultExpandAllRows={true}
            pagination={false}
            size="small"
            dataSource={[
              { key: '1', 1: '19', 2: '0-25' },
              { key: '2', 1: '45', 2: '25-50' },
              { key: '3', 1: '60', 2: '50-75' },
            ]}
            columns={[
              {
                title: 'age',
                dataIndex: '1',
                key: 1,
                className: styles.funcTipsCol,
              },
              {
                title: EN.agevalb3,
                dataIndex: '2',
                key: 2,
                className: styles.funcTipsCol,
              },
            ]}
          />
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Quantile_binage1}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Output}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <Table
            bordered={true}
            defaultExpandAllRows={true}
            pagination={false}
            size="small"
            dataSource={[
              { key: '1', 1: '0-24', 2: '0-25', 3: '0-3', 4: '0-5' },
              { key: '2', 1: '24-50', 2: '25-40', 3: '3-9', 4: '5-8' },
              { key: '3', 1: '50-75', 2: '40-60', 3: '9-15', 4: '8-15' },
            ]}
            columns={[
              {
                title: 'age1_val_b4',
                dataIndex: '1',
                key: 1,
                className: styles.funcTipsCol,
              },
              {
                title: 'age1_fre_b4',
                dataIndex: '2',
                key: 2,
                className: styles.funcTipsCol,
              },
              {
                title: 'age2_val_b4',
                dataIndex: '3',
                key: 3,
                className: styles.funcTipsCol,
              },
              {
                title: 'age2_fre_b4',
                dataIndex: '4',
                key: 4,
                className: styles.funcTipsCol,
              },
            ]}
          />
        </div>
        <div className={styles.funcTipsTitle}>
          <span>{EN.Notice}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Iftoomanynewvariablesarecreated}</span>
        </div>
      </div>
    );
  }

  Custom_Quantile_bin() {
    return (
      <div className={styles.funcTips}>
        <div className={styles.funcTipsName}>
          <span>{EN.Custom_Quantile_bin}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Custom_Quantile_binfunction}</span>
        </div>
        <div className={styles.funcTipsTitle}>
          <span>{EN.Syntax}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Custom_Quantile_binrange_list1}</span>
        </div>
        <div className={styles.funcTipsTitle}>
          <span>{EN.Input}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Variableneedstostartwith}</span>
        </div>
        <div className={styles.funcTipsTitle}>
          <span>{EN.Output}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Categoricalvariables}</span>
        </div>
        <div className={styles.funcTipsTitle}>
          <span>{EN.Example}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Custom_Quantile_binage}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Output}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <Table
            bordered={true}
            defaultExpandAllRows={true}
            pagination={false}
            size="small"
            dataSource={[
              { key: '1', 1: '15', 2: '(<=25)', 3: '(<=20)' },
              { key: '2', 1: '40', 2: '(25-50)', 3: '(20-40)' },
              { key: '3', 1: '55', 2: '(>=50)', 3: '(40-60)' },
            ]}
            columns={[
              {
                title: 'age',
                dataIndex: '1',
                key: 1,
                className: styles.funcTipsCol,
              },
              {
                title: 'age_cus_b3',
                dataIndex: '2',
                key: 2,
                className: styles.funcTipsCol,
              },
              {
                title: 'age_cus_b4',
                dataIndex: '3',
                key: 3,
                className: styles.funcTipsCol,
              },
            ]}
          />
        </div>
        <div className={styles.funcTipsTitle}>
          <span>{EN.Notice}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Iftoomanynewvariablesarecreated}</span>
        </div>
      </div>
    );
  }

  Interactive() {
    return (
      <div className={styles.funcTips}>
        <div className={styles.funcTipsContent}>
          <span>{EN.Interactive}</span>
        </div>
        <div className={styles.funcTipsTitle}>
          <span>{EN.Syntax}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Interactive_descr}</span>
        </div>
        <div className={styles.funcTipsTitle}>
          <span>{EN.Input}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Allvariablesneedtostartwith}</span>
        </div>
        <div className={styles.funcTipsTitle}>
          <span>{EN.Output}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Interactive_output}</span>
        </div>
        <div className={styles.funcTipsTitle}>
          <span>{EN.Example}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Interactive_example}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Output}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <Table
            bordered={true}
            defaultExpandAllRows={true}
            pagination={false}
            size="small"
            dataSource={[
              { key: '1', 1: '25', 2: '20000', 3: '500000' },
              { key: '2', 1: '40', 2: '15000', 3: '600000' },
              { key: '3', 1: '35', 2: '25000', 3: '875000' },
            ]}
            columns={[
              {
                title: 'age',
                dataIndex: '1',
                key: 1,
                className: styles.funcTipsCol,
              },
              {
                title: 'income',
                dataIndex: '2',
                key: 2,
                className: styles.funcTipsCol,
              },
              {
                title: 'age_income_inter',
                dataIndex: '3',
                key: 3,
                className: styles.funcTipsCol,
              },
            ]}
          />
        </div>
        <div className={styles.funcTipsTitle}>
          <span>{EN.Notice}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Iftoomanynewvariablesarecreated}</span>
        </div>
      </div>
    );
  }

  Box_cox() {
    return (
      <div className={styles.funcTips}>
        <div className={styles.funcTipsContent}>
          <span>{EN.Box_cox}</span>
        </div>
        <div className={styles.funcTipsTitle}>
          <span>{EN.Syntax}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Box_cox_grammar}</span>
        </div>
        <div className={styles.funcTipsTitle}>
          <span>{EN.Input}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Box_cox_input}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Box_cox_input1}</span>
        </div>
        <div className={styles.funcTipsTitle}>
          <span>{EN.Output}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Box_cox_output}</span>
        </div>
        <div className={styles.funcTipsTitle}>
          <span>{EN.func_note}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Box_cox_note_txt}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Box_cox_note_txt1}</span>
        </div>
        <div className={styles.funcTipsTitle}>
          <span>{EN.Example}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Box_cox_example}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Box_cox_example1}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Output}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <Table
            bordered={true}
            defaultExpandAllRows={true}
            pagination={false}
            size="small"
            dataSource={[
              { key: '1', 1: '79', 2: '6.22', 3: '15.78' },
              { key: '2', 1: '199', 2: '8.15', 3: '26.21' },
              { key: '3', 1: '226', 2: '8.44', 3: '28.07' },
            ]}
            columns={[
              {
                title: 'duration',
                dataIndex: '1',
                key: 1,
                className: styles.funcTipsCol,
              },
              {
                title: 'duration_boxcox',
                dataIndex: '2',
                key: 2,
                className: styles.funcTipsCol,
              },
              {
                title: 'duration_boxcox_lambda',
                dataIndex: '3',
                key: 3,
                className: styles.funcTipsCol,
              },
            ]}
          />
        </div>
        <div className={styles.funcTipsTitle}>
          <span>{EN.Notice}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Iftoomanynewvariablesarecreated}</span>
        </div>
      </div>
    );
  }

  Number_extraction() {
    return (
      <div className={styles.funcTips}>
        <div className={styles.funcTipsContent}>
          <span>{EN.Number_extraction}</span>
        </div>
        <div className={styles.funcTipsTitle}>
          <span>{EN.Syntax}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Number_extraction_grammar}</span>
        </div>
        <div className={styles.funcTipsTitle}>
          <span>{EN.Input}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Number_extraction_input}</span>
        </div>
        <div className={styles.funcTipsTitle}>
          <span>{EN.Output}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Number_extraction_output}</span>
        </div>
        <div className={styles.funcTipsTitle}>
          <span>{EN.func_note}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Number_extraction_note_txt}</span>
        </div>
        <div className={styles.funcTipsTitle}>
          <span>{EN.Example}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Number_extraction_example}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Output}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <Table
            bordered={true}
            defaultExpandAllRows={true}
            pagination={false}
            size="small"
            dataSource={[
              { key: '1', 1: '23.319%', 2: '23.319' },
              { key: '2', 1: '23.311%', 2: '23.311' },
              { key: '3', 1: '23.35%', 2: '23.350' },
            ]}
            columns={[
              {
                title: 'percent',
                dataIndex: '1',
                key: 1,
                className: styles.funcTipsCol,
              },
              {
                title: 'percent_ext',
                dataIndex: '2',
                key: 2,
                className: styles.funcTipsCol,
              },
            ]}
          />
        </div>
        <div className={styles.funcTipsTitle}>
          <span>{EN.Notice}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Iftoomanynewvariablesarecreated}</span>
        </div>
      </div>
    );
  }

  Substring() {
    return (
      <div className={styles.funcTips}>
        <div className={styles.funcTipsContent}>
          <span>{EN.Substring}</span>
        </div>
        <div className={styles.funcTipsTitle}>
          <span>{EN.Syntax}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Substring_grammar}</span>
        </div>
        <div className={styles.funcTipsTitle}>
          <span>{EN.Input}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Substring_input}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Substring_input1}</span>
        </div>
        <div className={styles.funcTipsTitle}>
          <span>{EN.Output}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Substring_output}</span>
        </div>
        <div className={styles.funcTipsTitle}>
          <span>{EN.func_note}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Substring_note_txt}</span>
        </div>
        <div className={styles.funcTipsTitle}>
          <span>{EN.Example}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Substring_example}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Output}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <Table
            bordered={true}
            defaultExpandAllRows={true}
            pagination={false}
            size="small"
            dataSource={[
              { key: '1', 1: 'no.oct month', 2: 'oct' },
              { key: '2', 1: 'no.jun month', 2: 'jun' },
              { key: '3', 1: 'no.may month', 2: 'may' },
            ]}
            columns={[
              {
                title: 'month',
                dataIndex: '1',
                key: 1,
                className: styles.funcTipsCol,
              },
              {
                title: 'month_sub',
                dataIndex: '2',
                key: 2,
                className: styles.funcTipsCol,
              },
            ]}
          />
        </div>
        <div className={styles.funcTipsTitle}>
          <span>{EN.Notice}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Iftoomanynewvariablesarecreated}</span>
        </div>
      </div>
    );
  }

  Groupby() {
    return (
      <div className={styles.funcTips}>
        <div className={styles.funcTipsContent}>
          <span>{EN.Groupby}</span>
        </div>
        <div className={styles.funcTipsTitle}>
          <span>{EN.Syntax}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Groupby_grammar}</span>
        </div>
        <div className={styles.funcTipsTitle}>
          <span>{EN.Input}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Groupby_input}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Groupby_input1}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Groupby_input2}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Groupby_input3}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Groupby_input4}</span>
        </div>
        <div className={styles.funcTipsTitle}>
          <span>{EN.Output}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Groupby_output}</span>
        </div>
        <div className={styles.funcTipsTitle}>
          <span>{EN.Example}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Groupby_example}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Output}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <Table
            bordered={true}
            defaultExpandAllRows={true}
            pagination={false}
            size="small"
            dataSource={[
              { key: '1', 1: '79', 2: '8', 3: '38562', 4: '210.0' },
              { key: '2', 1: '199', 2: '0', 3: '252275', 4: '176.0' },
              { key: '3', 1: '266', 2: '1', 3: '263141', 4: '204.0' },
              { key: '41', 1: '141', 2: '0', 3: '252275', 4: '176.0' },
            ]}
            columns={[
              {
                title: 'duration',
                dataIndex: '1',
                key: 1,
                className: styles.funcTipsCol,
              },
              {
                title: 'job',
                dataIndex: '2',
                key: 2,
                className: styles.funcTipsCol,
              },
              {
                title: 'duration_sum',
                dataIndex: '3',
                key: 3,
                className: styles.funcTipsCol,
              },
              {
                title: 'duration_median',
                dataIndex: '4',
                key: 4,
                className: styles.funcTipsCol,
              },
            ]}
          />
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Groupby_example}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Output}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <Table
            bordered={true}
            defaultExpandAllRows={true}
            pagination={false}
            size="small"
            dataSource={[
              { key: '1', 1: '79', 2: '8', 3: '2', 4: '392.08', 5: '25' },
              { key: '2', 1: '199', 2: '0', 3: '1', 4: '261.25', 5: '4' },
              { key: '3', 1: '226', 2: '1', 3: '0', 4: '301.20', 5: '5' },
              { key: '4', 1: '141', 2: '0', 3: '1', 4: '261.25', 5: '4' },
            ]}
            columns={[
              {
                title: 'duration',
                dataIndex: '1',
                key: 1,
                className: styles.funcTipsCol,
              },
              {
                title: 'job',
                dataIndex: '2',
                key: 2,
                className: styles.funcTipsCol,
              },
              {
                title: 'education',
                dataIndex: '3',
                key: 3,
                className: styles.funcTipsCol,
              },
              {
                title: 'duration_mean',
                dataIndex: '4',
                key: 4,
                className: styles.funcTipsCol,
              },
              {
                title: 'duration_min',
                dataIndex: '5',
                key: 5,
                className: styles.funcTipsCol,
              },
            ]}
          />
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Groupby_example}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Output}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <Table
            bordered={true}
            defaultExpandAllRows={true}
            pagination={false}
            size="small"
            dataSource={[
              { key: '1', 1: '8', 2: '2', 3: '1' },
              { key: '2', 1: '0', 2: '1', 3: '0' },
              { key: '3', 1: '1', 2: '0', 3: '1' },
              { key: '4', 1: '0', 2: '1', 3: '0' },
            ]}
            columns={[
              {
                title: 'duration',
                dataIndex: '1',
                key: 1,
                className: styles.funcTipsCol,
              },
              {
                title: 'job',
                dataIndex: '2',
                key: 2,
                className: styles.funcTipsCol,
              },
              {
                title: 'job_mode',
                dataIndex: '3',
                key: 3,
                className: styles.funcTipsCol,
              },
            ]}
          />
        </div>
        <div className={styles.funcTipsTitle}>
          <span>{EN.Notice}</span>
        </div>
        <div className={styles.funcTipsContent}>
          <span>{EN.Iftoomanynewvariablesarecreated}</span>
        </div>
      </div>
    );
  }

  render() {
    const { value } = this.props;
    const key = value;
    if (!key || !this[key] || typeof this[key] !== 'function') return null;
    return this[key]();
  }
}
