const projects = [
  {
    title: 'Portfolio Refresh',
    description:
      'A routed personal portfolio with reusable sections, theme switching, and responsive layout styling.',
    stack: ['React', 'React Router', 'CSS'],
  },
  {
    title: 'ML Study Companion',
    description:
      'A small prototype for tracking experiments, models, and study notes in one clean dashboard.',
    stack: ['Python', 'Data Analysis', 'UI Prototyping'],
  },
  {
    title: 'Student Task Tracker',
    description:
      'A productivity app concept focused on assignment planning, reminders, and daily progress checks.',
    stack: ['React', 'State Management', 'Form UX'],
  },
];

function Projects() {
  return (
    <section className="hero-card">
      <div>
        <p className="eyebrow">Projects</p>
        <h2>Selected Work</h2>
        <p className="muted">
          Each project card shows a different idea while keeping the same visual
          pattern, which is the point of reusable components.
        </p>
      </div>

      <div className="grid-list">
        {projects.map((project) => (
          <article key={project.title} className="project-card">
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <ul className="stack-list">
              {project.stack.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Projects;