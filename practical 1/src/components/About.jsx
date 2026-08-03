import React from 'react';

function About() {
  return (
    <section id="about" className="section">
      <h2 className="section-title">About Me</h2>
      <div className="glass-card about-grid">
        <div>
          <p className="about-text">
            I am an aspiring <span className="about-highlight">Frontend Engineer & Web Developer</span> currently pursuing my degree in Computer Science. 
            I love translating complex problems into beautiful, intuitive, and performant user interfaces. 
            My journey into web development started when I wanted to build interactive experiences for the browser, and since then, I've fell in love with React and modern CSS systems.
          </p>
          <p className="about-text">
            Outside of coding, I participate in hackathons, contribute to open-source projects, and keep myself updated with modern software engineering trends. 
            I am always eager to learn new technologies and apply best practices in component-driven UI architecture.
          </p>
        </div>
      </div>
    </section>
  );
}

export default About;
