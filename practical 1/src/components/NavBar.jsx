import React from 'react';
import { NavLink } from 'react-router-dom';

function NavBar({ isLightTheme, setIsLightTheme }) {
  const navItems = [
    { to: '/', label: 'Home' },
    { to: '/projects', label: 'Projects' },
    { to: '/contact', label: 'Contact' }
  ];

  return (
    <nav className="navbar">
      <div className="nav-left">
        <NavLink to="/" className="nav-logo">PORTFOLIO</NavLink>
        <ul className="nav-links">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
      <button 
        className="theme-btn"
        onClick={() => setIsLightTheme(!isLightTheme)}
      >
        {isLightTheme ? '🌙 Dark Theme' : '☀️ Light Theme'}
      </button>
    </nav>
  );
}

export default NavBar;
