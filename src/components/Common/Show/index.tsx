import React from 'react';
import { inject } from 'mobx-react';

interface ShowProps {
  userStore?:any
  name:string
  children:any
}

function Show(props:ShowProps){
  const {name,userStore,children} = props;
  const show = userStore.info.role[name];

  if(show!==false){
      return children;
  }
  return null
}



export default inject('userStore')(Show)
