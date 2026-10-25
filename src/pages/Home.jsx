import { Link } from 'react-router-dom';
import heroImg from '../assets/hero.png';

const skills = [
  'Artificial Intelligence',
  'Machine Learning',
  'Web Development',
  'UI Experiments',
  'Problem Solving',
  'Python',
];

function Home() {
  return (
    <div className="front-page">
      {/* Hero / name card */}
      <section className="front-hero">
        <div className="front-name-row">
          <span className="my-name-label">my name is</span>
        </div>

        <div className="front-name-box">
          <h1>JIYA</h1>
        </div>

        <div className="front-tag-row">
          <span className="tag tag-yellow">AI/ML Student 🎓</span>
          <span className="tag tag-mint">● OPEN TO NEW PROJECTS AND GOOD IDEAS</span>
          <span className="tag tag-green">India ✨</span>
        </div>

        <h2 className="front-headline">
          I turn random ideas into <span className="underline">working projects</span> 🎯
        </h2>

        <Link to="/contact" className="front-cta">CONTACT ME</Link>
      </section>

      {/* Intro / about */}
      <section className="front-about">
        <p className="front-about-label">about me!</p>
        <div className="front-whatsup">what's up</div>

        <div className="front-intro-grid">
          <figure className="polaroid">
            <img src={heroImg} alt="Jiya" />
            <figcaption>Jiya</figcaption>
          </figure>

          <p className="front-intro">
            I'm an AI/ML student who gets way too excited about turning random
            ideas into working projects. I like solving problems with AI,
            designing experiences, experimenting with new tools, and occasionally
            making things way more complicated than they need to be. 🙃
          </p>

          <figure className="polaroid polaroid-small">
            <div className="polaroid-placeholder">💡</div>
            <figcaption>my workspace</figcaption>
          </figure>
        </div>

        <div className="front-skills">
          {skills.map((skill, i) => (
            <span key={skill} className={`skill-chip skill-chip-${i % 4}`}>
              {skill} {i % 2 === 0 ? '✨' : '🛠️'}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
