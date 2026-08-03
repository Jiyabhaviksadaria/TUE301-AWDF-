import React from 'react';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="footer" className="footer">
      <div className="footer-content">
        <div className="footer-socials">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="footer-link">GitHub</a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="footer-link">LinkedIn</a>
          <a href="mailto:student@example.com" className="footer-link">Email</a>
        </div>
        <p className="footer-copyright">
          &copy; {currentYear} Student Portfolio. All rights reserved.
        </p>
        <p className="footer-copyright" style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
          Built with React & Vite • Practical 1 Evaluation
        </p>
      </div>
    </footer>
  );
}

export default Footer;
