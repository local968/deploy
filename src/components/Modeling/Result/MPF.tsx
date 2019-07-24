import React from 'react';

import ModelProcessFlow from './ModelProcessFlow'
import ModelProcessFlow_Logistic from './ModelProcessFlow_Logistic'
import MPF_UL from './MPF_UL'
import EN from '../../../constant/en';

export default function MPF(props) {
  const { modelId = '' } = props;
  const mismatchArray =  [{
    value: 'mode',
    label: EN.Replacewithmostfrequentvalue
  }, {
    value: 'drop',
    label: EN.Deletetherows
  }, {
    value: 'ignore',//Categorical
    label: EN.Replacewithauniquevalue
  }, {
    value: 'ignore',
    label: EN.DoNothing
  },{
    value: 'mean',
    label: EN.Replacewithmeanvalue
  },{
    value: 'min',
    label: EN.Replacewithminvalue
  }, {
    value: 'max',
    label: EN.Replacewithmaxvalue
  }, {
    value: 'median',
    label: EN.Replacewithmedianvalue
  }, {
    value: 'zero',
    label: EN.ReplaceWith0
  }, {
    value: 'others',
    label: EN.Replacewithothers
  },{
    value: 'respective',
    label: EN.ReplaceRespective
  },{
    value: 'column',
    label: EN.Deletethecolumn
  }];
  if (modelId.includes('Logistic')) {
    return <ModelProcessFlow_Logistic {...props} mismatchArray={mismatchArray} />
  } else if (modelId) {
    return <ModelProcessFlow {...props} mismatchArray={mismatchArray} />
  }
  //非监督
  return <MPF_UL {...props} mismatchArray={mismatchArray} />
}
