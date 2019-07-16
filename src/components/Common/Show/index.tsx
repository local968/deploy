import React from 'react';
import { inject } from 'mobx-react';

interface ShowProps {
  userStore?:any
  name:string
  children:any
}

function Show(props:ShowProps){
  const {name,userStore:{info:{role={}}},children} = props;
  const show = role[name];

  if(show!==false){
      return children;
  }
  return null
}



export default inject('userStore')(Show)
