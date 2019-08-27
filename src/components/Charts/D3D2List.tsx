import React, { ReactElement, useState } from 'react';
import {Select} from 'antd';
import styles from './charts.module.css';
import EN from '../../constant/en';
const {Option} = Select;

interface Interface {
  featuresLabel:Array<string>
  mapHeader:Array<string>
  update:any
}

export default function D3D2List(props:Interface):ReactElement{
  const {featuresLabel,mapHeader,update} = props;

  const [x_name,y_name,z_name] = featuresLabel;

  const [show_name,upShow_name] = useState({
    x_name,
    y_name,
    z_name,
  });

  function selection(order):ReactElement{
    const disable = Object.values(show_name).filter(itm=>itm !== show_name[order]);
    const options:Array<ReactElement> = featuresLabel.map(itm=><Option key={itm} disabled={disable.includes(itm)} title={mapHeader[itm]||itm} value={itm}>
      {mapHeader[itm]||itm}
    </Option>);
    options.unshift(<Option key='-000' disabled={disable.includes('')} value=''>none</Option>);
    return <Select
      defaultValue={show_name[order]}
      style={{ width: 120 }}
      getPopupContainer={() => document.getElementById(order)}
      onChange={name=>{
        upShow_name({
          ...show_name,
          [order]:name
        });
      }}>
      {
        options
      }
    </Select>
  }
  return <>
    {
      ['x_name','y_name','z_name'].map((itm,index)=><dd key={itm} id={itm}>Var{index+1}:{selection(itm)}</dd>)
    }
    <dd>
      <button className={styles.button} onClick={update.bind(this,show_name)}>
        <span>{EN.Save}</span>
      </button>
    </dd>
  </>
}
