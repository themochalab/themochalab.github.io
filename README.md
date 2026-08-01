# MOCHA Lab

This is the website for the **MOCHA Lab** (Multi-agent, Observational, Cognitive, Human-AI & Aesthetics Lab) in the Department of Computer Science at Furman University, led by **Dr. Saugat Pandey**.

The lab studies visualization literacy, perception, and cognition, and how those human abilities meet AI — including trust and aesthetics in data visualization, human-AI teaming, and applications in accessibility (BLV communities), medical/genomic visualization, and environmental data science.

🔗 Live site: [themochalab.github.io](https://themochalab.github.io/)

## Structure

Static site — plain HTML, CSS, and vanilla JS, no build step required.

```
.
├── index.html          # Home
├── people.html         # Lab members
├── publications.html   # Publications, grouped by research theme
├── contact.html        # Contact form (Formspree) + direct contact info
├── css/style.css        # Design system and styles
├── js/main.js            # Nav toggle, scroll reveals, contact form handling
└── assets/images/        # Logo, favicon, and photos
```

## Local development

No dependencies — just serve the folder and open it in a browser:

```
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Contact

For collaborations or questions, see the [contact page](https://themochalab.github.io/contact.html) or reach out to spandey2@furman.edu.
