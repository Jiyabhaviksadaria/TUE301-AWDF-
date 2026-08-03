import React from 'react';

function Skills({ skillList }) {
  // Provide a safe default in case no list is supplied
  const list = skillList || [];

  return (
    <section id="skills" className="section">
      <h2 className="section-title">Skills & Technologies</h2>
      <div className="glass-card">
        <p className="about-text" style={{ marginBottom: '1.5rem' }}>
          Here are some of the core libraries, technologies, and tools that I specialize in:
        </p>
        <div className="skills-container">
          {list.map((skill) => (
            <div key={skill} className="skill-tag">
              <span className="skill-icon"></span>
              {skill}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Skills;
