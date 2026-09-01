// AI tools were used to generate this comment block, and Knock's project description.
// Append an object to this array to generate a new tile. The layout grid adapts automatically.
//
// Only the `title` property is mandatory. Omitting any other field simply hides its corresponding row.
//
//   {
//     title:   'Eosin',                          // mandatory
//     tagline: 'Next-generation WSI workbench',  // subtitle below the header
//     badge:   'open source',                    // top-right pill badge
//                                                //   alternative: { label: 'archived', color: '#8b9098' }
//     image:   { src: 'images/eosin.png', alt: 'Eosin viewing a slide' },
//     body:    'A paragraph or two of prose.',   // string or array of strings
//     tags:    ['rust', 'postgres'],             // auto-colored via tiles.js
//     links:   [{ label: 'GitHub', href: 'https://...' }]
//   }
//
// Tag colors are resolved via tiles.js. Unregistered tags receive a deterministic color
// based on their string value, eliminating the need for manual registration.
// To enforce a specific color: { label: 'cuda', color: '#76b900' }

export const projects = [
  {
    title: 'Residual Driving Agent',
    tagline: 'Hybrid imitation and reinforcement learning for autonomous control',
    image: { src: "attachments/Car.png", alt: "", fit: "contain" },
    badge: { label: 'embargoed', color: '#c99a3f' },
    body: [
      'An end-to-end perception and control pipeline combining behavioral cloning with a residual reinforcement learning agent, trained on human demonstration laps. The cloned policy manages standard driving scenarios while the residual agent focuses solely on corrective actions.',
      'Track geometries were built in Unreal Engine 5 using the Learning Agents plugin, allowing policies to train and validate against synthetic data at scale. An automated evaluation harness quantifies results using Firth-penalized logistic regression, Fisher exact tests, and Wilson confidence intervals.',
      'Complete methodology and results will be provided upon request after the publication embargo expires.'
    ],
    tags: ['python', 'pytorch', 'unreal engine', 'reinforcement learning']
  },
  {
    title: 'YOLO Look Once',
    tagline: 'Vehicle detection and seat belt classification on live interstate cameras',
    image: { src: "attachments/yolo.png", alt: "Adapted from Blog.paperspace.com", fit: "contain" },
    body: [
      'A YOLO-based computer vision pipeline that processes over 500 hours of streaming traffic camera footage, detecting: seatbelt usage, phone usage, speed, and distracted driving patterns',
      'Repository unavailable'
    ],
    tags: ['python', 'pytorch', 'opencv', 'yolo', 'docker', 'cuda']
  },
  {
    title: "Knock",
    badge: { label: "open source", color: "#8b9098" },
    tagline: "Blind date matchmaking for 195 people, solved as a graph problem",
    image: { src: "attachments/Knock.gif", alt: "Animation of the matching graph resolving into paired nodes", fit: "contain" },
    body: [
      "Survey responses from 195 Auburn students, gathered through fliers, Instagram ads, and word of mouth, become preference vectors across seven dimensions: emotion handling, conflict resolution, extraversion, lifestyle, communication, partner interaction, and humor. Hard dealbreakers on age, schedule, sexuality, height, tattoos, drinking, and religion cut the candidate pool first, and cosine similarity scores whatever survives.",
      "Everyone is then a node, every viable pair an edge weighted by compatibility, and NetworkX's maximum weight matching selects the final set. That choice has a real cost: maximum weight matching optimizes total compatibility across the pool, so some people end up unmatched rather than paired badly. For a first run it was the right trade, and it is the main thing a second version would need to solve.",
      "Built with Trey Hibbard."
    ],
    tags: ["python", "networkx", "pandas", "numpy", "matplotlib"],
    links: [{ label: 'Available on GitHub', href: 'https://github.com/Gartcart/knock-public' }]
  },
  {
    title: 'Wine Quality',
    tagline: 'A rigorous benchmarking pipeline for classical ML',
    image: { src: "attachments/Wine.png", alt: "", fit: "contain" },
    badge: 'open source',
    body: 'Six algorithms are compared under k-fold cross-validation within a single reproducible harness, with Random Forest achieving 95% accuracy. The analysis pinpointed specific chemicals which affect the quality of wine most.',
    tags: ['python', 'scikit-learn', 'pandas', 'numpy'],
    links: [{ label: 'Available on GitHub', href: 'https://github.com/Gartcart/Wine-Quality' }]
  },
  {
    title: 'This Website',
    tagline: 'Cool Animations',
    image: { src: "attachments/Website.png", alt: "Website Photograph", fit: "contain" },
    badge: 'open source',
    body: 'The homepage background features a live seismograph rendered directly to canvas. Navigation frames use SVG paths generated from wave functions instead of manual drawing, and the resume types itself from a simulated terminal before settling into a standard page layout. A scheduled workflow collects traffic data and plots it for later viewing. Special thanks to Will Humphlett for the idea for the analytics.',
    tags: ['javascript', 'html', 'css', 'github actions'],
    links: [{ label: 'Available on GitHub', href: 'https://github.com/Gartcart/gartcart.github.io' }]
  }
];
