// @vitest-environment jsdom

import { cleanup, render, within } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import {
  ProjectExternalLink,
  ProjectIntro,
  ProjectPageHeader,
  ProjectRailSection,
  ProjectStorySection,
} from "./ProjectPage";

afterEach(cleanup);

it("preserves the caller's back navigation and introductory content", () => {
  const view = render(
    <>
      <ProjectPageHeader title="Example project" backHref="/projects" backLabel="Return to projects" />
      <ProjectIntro headingId="example-title" eyebrow="Project / Research" title="Example project" subtitle="An investigation">
        <p>Project-specific introduction.</p>
      </ProjectIntro>
    </>,
  );

  const back = view.getByRole("link", { name: "Return to projects" });
  expect(back.getAttribute("href")).toBe("/projects");
  expect(back.hasAttribute("target")).toBe(false);
  expect(view.getByRole("heading", { level: 1, name: "Example project" }).id).toBe("example-title");
  expect(view.getByText("Project-specific introduction.").tagName).toBe("P");
});

it("labels story and rail sections while retaining flexible semantic children", () => {
  const view = render(
    <>
      <ProjectStorySection headingId="findings" title="Findings">
        <p>A narrative finding.</p>
        <dl><div><dt>Observations</dt><dd>3</dd></div></dl>
      </ProjectStorySection>
      <ProjectRailSection headingId="methods" title="Methods" className="project-specific">
        <ul><li>Inspection</li><li>Evaluation</li></ul>
      </ProjectRailSection>
    </>,
  );

  const story = within(view.getByRole("region", { name: "Findings" }));
  expect(story.getByRole("heading", { level: 2, name: "Findings" }).id).toBe("findings");
  expect(story.getByRole("term").textContent).toBe("Observations");
  expect(story.getByRole("definition").textContent).toBe("3");
  const rail = view.getByRole("region", { name: "Methods" });
  expect(rail.classList.contains("project-specific")).toBe(true);
  expect(within(rail).getAllByRole("listitem").map((item) => item.textContent)).toEqual(["Inspection", "Evaluation"]);
});

it("announces external-link behavior without including the decorative arrow in its name", () => {
  const view = render(<ProjectExternalLink href="https://example.com/demo">Live demo</ProjectExternalLink>);
  const link = view.getByRole("link", { name: /^Live demo\s*\(opens in a new tab\)$/ });

  expect(link.getAttribute("href")).toBe("https://example.com/demo");
  expect(link.getAttribute("target")).toBe("_blank");
  expect(link.getAttribute("rel")?.split(" ")).toEqual(expect.arrayContaining(["noopener", "noreferrer"]));
  expect(within(link).getByText("↗").getAttribute("aria-hidden")).toBe("true");
});
