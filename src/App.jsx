import Header from "./components/Header";
import About from "./components/About";
import Skills from "./components/Skills";
import Footer from "./components/Footer";

function App() {
  const skills = [
    "HTML",
    "CSS",
    "JavaScript",
    "React",
    "Python",
    "Machine Learning",
  ];

  return (
    <>
      <Header
        name="Harshil Thakkar"
        role="AI & ML Student | Full Stack Developer"
      />

      <About
        title="About Me"
        description="I am passionate about Artificial Intelligence, Web Development, and creating impactful software solutions."
      />

      <Skills skills={skills} />

      <Footer
        email="harshilthakkar3435@gmail.com"
        copyright="© 2026 Harshil Thakkar"
      />
    </>
  );
}

export default App;