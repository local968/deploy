import * as React from 'react';
import NetworkDiagram from './NetworkDiagram';
import ScatterPlot from './ScatterPlot';

interface Interface {
  type:number
  state:{
    graph:Object
    plot:{
      supports:Array<number>
      confidences:Array<number>
      lifts:Array<number>
    }
  }
}
export default function SPND(props:Interface){
  const {type,state:{graph,plot}} = props;
  if(type === 1){
      return <ScatterPlot
        data={plot}
      />
  }

  if(type === 2){
    return <NetworkDiagram
      data = {graph}
    />
  }

  return null;
}
