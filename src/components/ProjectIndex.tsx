import { projects } from "@/data/projects";

export function ProjectIndex() {
  return (
    <ol className="project-index">
      {projects.map((project) => (
        <li key={project.number} className="project-row">
          <span className="project-number" aria-hidden="true">{project.number}</span>
          <article>
            <div className="project-heading">
              <h2>{project.title}</h2>
              <p className="project-area">{project.area}</p>
            </div>
            <p className="project-description">{project.description}</p>
            {project.repository ? (
              <a className="project-link" href={project.repository} target="_blank" rel="noreferrer">
                View repository<span aria-hidden="true"> ↗</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : null}
          </article>
        </li>
      ))}
    </ol>
  );
}
