import React from 'react';

import ModelProcessFlow from './ModelProcessFlow'
import ModelProcessFlow_Logistic from './ModelProcessFlow_Logistic'
import MPF_UL from './MPF_UL'

export default function MPF(props) {
  const { modelId = '' } = props;
  if (modelId.includes('Logistic')) {
    return <ModelProcessFlow_Logistic {...props} />
  } else if (modelId) {
    return <ModelProcessFlow {...props} />
  }
  //非监督
  return <MPF_UL {...props} />
}
