import React from 'react';

import ModelProcessFlow from './ModelProcessFlow'
import ModelProcessFlow_Logistic from './ModelProcessFlow_Logistic'

export default function MPF(props){
    if(props.modelId.includes('Logistic')){
      return <ModelProcessFlow_Logistic {...props}/>
    }
    return <ModelProcessFlow {...props}/>
}
