# Krsna

This is my personal portfolio.

**Live:** https://krsna-supreme-personality-of-godhead.vercel.app/

I'm Omprakash Sahani. I'm a software engineer interested in machine learning and the systems behind it.

I like understanding how things actually work — how models are evaluated, why performance changes, what happens inside distributed systems, how search quality is measured, and how data affects what a robot can learn.

I started with a Diploma in Computer Engineering and later completed my B.Tech in Computer Science and Engineering. A lot of what I know has also come from building things on my own.

When something interests me, I usually try to go deeper into it. I build something, measure how it behaves, find where it breaks or falls short, and then try to improve it.

Over time, that pulled me toward ML systems, search evaluation, distributed systems, AI evaluation, and robot learning.

I care about building software that is technically interesting, but I also want it to be useful. I think good engineering should help people, make difficult things easier to understand, and solve meaningful problems.

I still have a lot to learn, and I genuinely enjoy that part.

## Things I'm working on

- [LeRobot State Atlas](https://github.com/OmprakashSahani/lerobot-state-atlas)
- [SearchEval Lab](https://github.com/OmprakashSahani/searcheval-lab)
- [EvidencePatch](https://github.com/OmprakashSahani/evidencepatch)
- [Atlas AI](https://github.com/OmprakashSahani/atlas-ai)

Right now I'm mainly interested in ML systems, robot learning, AI evaluation, and distributed systems.

## About this repository

This repository contains the source code for my portfolio.

It's built with Next.js, React, and TypeScript and deployed on Vercel.

I'll keep changing it as I learn new things, build more projects, and figure out what I want to explore next.

### Local development

Use Node.js `^20.19.0 || ^22.13.0 || >=24.0.0`, as required by the current application and test tooling.

```sh
npm install
npm test
npm run lint
npx tsc --noEmit
npm run build
```

Run `npm run dev` to develop locally, or `npm start` to serve a production build.

### Production contact form

The contact form requires three server-only environment variables. Set them in the deployment environment, or in an untracked `.env.local` file for local delivery:

- `RESEND_API_KEY`: the server-only Resend API key.
- `CONTACT_TO_EMAIL`: the fixed recipient for all notes.
- `CONTACT_FROM_EMAIL`: a sender accepted/verified by the configured Resend account for that deployment.

Never expose these variables with `NEXT_PUBLIC_` prefixes. Delivery remains unavailable until all three are configured.

Production deployments using the contact form require a Vercel Firewall rule matching the exact path `/api/contact` and method `POST`, with a rate limit of **3 requests per 600 seconds**, key/source **IP**, and excess requests receiving HTTP `429`.

This rate-limit configuration lives in Vercel infrastructure, not in this Git repository. Ensure the rule is in place when deploying to another Vercel project and remains enabled. The application-level `Origin` / `Sec-Fetch-Site` checks are not a substitute for rate limiting because direct HTTP clients can omit or forge those headers.

## License

The source code in this repository is available under the MIT License.

Personal content, biography, résumé information, and original portfolio text are not covered by that license.
