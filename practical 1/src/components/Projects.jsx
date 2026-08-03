import React from 'react';

function Projects({ projects }) {
  const list = projects || [];

  return (
    <section id="projects" className="section">
      <h2 className="section-title">Featured Projects</h2>
      <div className="projects-grid">
        {list.map((project, idx) => (
          <div key={idx} className="glass-card project-card">
            <div>
              <h3 className="project-title">{project.title}</h3>
              <p className="project-desc">{project.description}</p>
            </div>
            <div className="project-tech">
              {project.tech.map((techItem) => (
                <span key={techItem} className="project-tech-tag">
                  {techItem}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Projects;
