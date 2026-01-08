import React from 'react';

const Header = ({ date }) => {
  return (
    <header className="header">
      <h1>Daily Notes</h1>
      <div className="date-display">{date}</div>
    </header>
  );
};

export default Header;
