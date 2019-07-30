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
      if(linearData){
        let {data,intercept} = result;

        if(intercept>0){
          intercept = '+' + intercept;
        }
        let list = '';
        data.forEach((itm,ind)=>{
          const dt = itm[1].replace(/_/g,'\\_');
          if(ind>1000)return;
          list+=`${itm[0]}*${dt}\\\\`
        });
        console.log(11,list)
        katex.render(`Z=\\Sigma \\allowbreak\t
      \\begin{Bmatrix} 
         ${list}
      \\end{Bmatrix}
     \\allowbreak\t ${intercept}`,
          dom.current, {
            throwOnError: false,
            maxExpand:Infinity,
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
