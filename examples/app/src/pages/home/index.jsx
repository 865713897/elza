import React from 'react';
import * as ss from './index.less';

console.log(ss, 'ss');

export default function Home() {
  return (
    <div className={ss.root}>
      <h1>This is home page!</h1>
    </div>
  )
}