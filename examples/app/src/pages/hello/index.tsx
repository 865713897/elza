import React from 'react';
import { Link } from 'react-router-dom';

const Hello = () => {
  const [text, setText] = React.useState('home');
  return (
    <>
      <p
        onClick={() => {
          setText('Hi!');
        }}
      >
        {' '}
        {text}{' '}
      </p>
      <Link to='/users'>go to users</Link>
    </>
  );
};

export default Hello;
