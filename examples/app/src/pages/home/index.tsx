import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './index.css';

const Hello = () => {
  const [text, setText] = useState('home');
  const [count, setCount] = useState(0);
  return (
    <div className='melza-home'>
      <p
        onClick={() => {
          setText('Hi!');
        }}
      >
        {' '}
        {text}{' '}
      </p>
      <p className='melza-home-count'>{count}</p>
      <p>
        <button onClick={() => setCount((count) => count + 1)}>
          {' '}
          Click Me! Add!
        </button>
      </p>
      <Link to='/users'>go to users</Link>
    </div>
  );
};

export default Hello;
