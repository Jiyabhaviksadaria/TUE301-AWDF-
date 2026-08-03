import React from 'react';

function Header({ name, themeColor }) {
  // Use a fallback color if themeColor is not passed
  const customColor = themeColor || '#6366f1';

  return (
    <header id="home" className="header-hero">
      <div className="header-badge" style={{ borderColor: `${customColor}40`, color: customColor, backgroundColor: `${customColor}15` }}>
        Welcome to my Portfolio
      </div>
      <h1 className="header-name">
        Hi, I'm <span style={{ color: customColor }}>{name}</span>
      </h1>
      <p className="header-subtitle">
        A passionate Computer Science student building interactive web applications and solving real-world challenges.
      </p>
      <a 
        href="#about" 
        className="header-cta"
        style={{ 
          background: `linear-gradient(135deg, ${customColor}, #a855f7)`,
          boxShadow: `0 4px 15px ${customColor}4d` 
        }}
      >
        Learn More About Me
      </a>
    </header>
  );
}

export default Header;
