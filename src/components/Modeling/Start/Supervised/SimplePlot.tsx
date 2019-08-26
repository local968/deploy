import { observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import request from 'components/Request'

interface Interface {
  path:string
  isNew:boolean
  children?: any
}

const SimplePlot = observer((props:Interface)=>{
  const {path,isNew,children} = props;
  const [visible,upVisible] = useState(false);
  const [result,upResult] = useState();

  useEffect(()=>{
    if (isNew && path) {
      request
        .post({
          url: '/graphics/new',
          data: {
            url: path,
          },
        })
        .then(res => {
          upResult(res);
          upVisible(true);
        });
    }
  },[path,isNew]);

  if(!visible&&path){
    return null
  }

  if (!isNew) {
    return children;
  }
  const cloneEl = el => React.cloneElement(el, { ...result });
  return Array.isArray(children) ? children.map(cloneEl) : cloneEl(children);
});

export default SimplePlot;
