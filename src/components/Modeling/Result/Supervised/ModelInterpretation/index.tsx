import React, { useEffect, useRef, useState } from 'react';
import katex from 'katex'
import 'katex/dist/katex.css'
import styles from './styles.module.css'
import request from "components/Request";
import EN from '../../../../../constant/en';

export default function ModelInterpretation(props){
  const {linearData,treeData,modelName} = props;
  const dom = useRef(null);
  const [url,setUrl] = useState('');
  useEffect( ()=>{
    request.post({
      url: '/graphics/linearDataOrTreeData',
      data:{
        url:linearData||treeData,
      }
    }).then((result:any)=>{
      if(typeof result === 'object'){
        let {data,intercept} = result;

        if(intercept>0){
          intercept = '+' + intercept;
        }
        let list = '';
        data.forEach(itm=>list+=`${itm[0]}*${itm[1]}\\\\`);
        katex.render(`Z=\\Sigma \\allowbreak\t
      \\begin{Bmatrix} 
         ${list}
      \\end{Bmatrix}
     \\allowbreak\t ${intercept}`,
          dom.current, {
            throwOnError: false
          });
      }else{
        setUrl(result)
      }

    })
  },[]);

  if(linearData){
    return <div ref={dom} className={styles.ModelInterpretation}/>
  }
  return <section className={styles.treeData}>
    <a href={url} download={modelName+'.png'}><i/>{EN.PictureDownload}</a>
    <img src={url} alt=""/>
  </section>
}
