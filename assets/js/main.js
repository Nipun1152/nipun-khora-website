
/* =========================================
   INTERACTIVE SYSTEMS INTELLIGENCE MAP
   ========================================= */

const networkDetails = {
    sources: {
        category: "SYSTEM COMPONENT / 01",
        title: "Data Sources",
        description:
            "Reports, datasets, observations, and other inputs " +
            "provide the raw material for investigation."
    },
    research: {
        category: "SYSTEM COMPONENT / 02",
        title: "Research",
        description:
            "Research examines the origin, quality, and context " +
            "of information before drawing conclusions."
    },
    systems: {
        category: "SYSTEM COMPONENT / 03",
        title: "Systems",
        description:
            "Systems thinking explores how people, technologies, " +
            "organizations, and processes influence one another."
    },
    analysis: {
        category: "SYSTEM COMPONENT / 04",
        title: "Analysis",
        description:
            "Analysis connects evidence, tests hypotheses, " +
            "and identifies patterns, relationships, and risks."
    },
    models: {
        category: "SYSTEM COMPONENT / 05",
        title: "Models & Tools",
        description:
            "Models and software turn an idea or method into " +
            "something that can be tested and used."
    },
    intelligence: {
        category: "SYSTEM COMPONENT / 06",
        title: "Intelligence",
        description:
            "Intelligence combines relevant evidence and context " +
            "to produce useful, decision-oriented understanding."
    },
    decisions: {
        category: "SYSTEM COMPONENT / 07",
        title: "Decisions",
        description:
            "Decision-making applies analysis to a real problem, " +
            "while accounting for uncertainty and constraints."
    },
    outcomes: {
        category: "SYSTEM COMPONENT / 08",
        title: "Outcomes",
        description:
            "Outcomes are evaluated against evidence. The findings " +
            "can improve future research and system design."
    }
};

const networkNodes = document.querySelectorAll(".network-node");

function selectNetworkNode(node) {
    const details = networkDetails[node.dataset.node];

    if (!details) return;

    networkNodes.forEach((item) => {
        const selected = item === node;

        item.classList.toggle("is-selected", selected);
        item.setAttribute("aria-pressed", String(selected));
    });

    document.getElementById("node-category").textContent =
        details.category;

    document.getElementById("node-title").textContent =
        details.title;

    document.getElementById("node-description").textContent =
        details.description;
}

networkNodes.forEach((node) => {
    node.setAttribute(
        "aria-pressed",
        String(node.classList.contains("is-selected"))
    );

    node.addEventListener("click", () => {
        selectNetworkNode(node);
    });

    node.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            selectNetworkNode(node);
        }
    });
});

/* =========================================
   SYSTEMS EXPLORER
   ========================================= */

const explorerSystems = {
    cybersecurity: {
        category: "SYSTEM / 01",
        title: "Cybersecurity",
        description:
            "Study how assets, identities, networks, and security " +
            "controls work together. Investigate attack surfaces, " +
            "potential vulnerabilities, and defensive strategies.",
        components: [
            "Assets & data",
            "Identity & access",
            "Networks",
            "Security controls"
        ],
        risk:
            "Weak access controls, unpatched software, or exposed services.",
        opportunity:
            "Map assets, strengthen authentication, and prioritize remediation.",
        relationships: [
    {
        from: "Identity & access",
        to: "Assets & data",
        explanation:
            "Access controls determine who can reach protected information."
    },
    {
        from: "Networks",
        to: "Security controls",
        explanation:
            "Network visibility helps security controls detect suspicious activity."
    },
    {
        from: "Security controls",
        to: "Assets & data",
        explanation:
            "Effective controls can reduce the likelihood and impact of data exposure."
    }
  ]
},

    ai: {
        category: "SYSTEM / 02",
        title: "Artificial Intelligence",
        description:
            "Explore how data, models, computing infrastructure, " +
            "and human oversight combine to produce AI capabilities.",
        components: [
            "Data",
            "Models",
            "Computing infrastructure",
            "Human oversight"
        ],
        risk:
            "Poor data quality, unreliable outputs, or inadequate oversight.",
        opportunity:
            "Evaluate model performance, data quality, and safeguards.",

        relationships: [
    {
        from: "Data",
        to: "Models",
        explanation:
            "Training data influences model behavior and output quality."
    },
    {
        from: "Models",
        to: "Human oversight",
        explanation:
            "Review helps people identify unreliable or inappropriate outputs."
    },
    {
        from: "Computing infrastructure",
        to: "Models",
        explanation:
            "Available computing resources constrain model training and operation."
    }
]
    },

    infrastructure: {
        category: "SYSTEM / 03",
        title: "Industrial Infrastructure",
        description:
            "Investigate how energy, materials, equipment, logistics, " +
            "and control systems interact in industrial operations.",
        components: [
            "Energy & utilities",
            "Equipment",
            "Materials & logistics",
            "Operational controls"
        ],
        risk:
            "Supply disruptions, equipment failure, or energy constraints.",
        opportunity:
            "Identify bottlenecks, dependencies, and resilience improvements.",
        relationships: [
    {
        from: "Energy & utilities",
        to: "Equipment",
        explanation:
            "Equipment depends on reliable energy and utility services."
    },
    {
        from: "Materials & logistics",
        to: "Operations",
        explanation:
            "Material delays can disrupt production schedules."
    },
    {
        from: "Operational controls",
        to: "Equipment",
        explanation:
            "Monitoring and maintenance controls help manage equipment failure risks."
    }
]
    }
};

const explorerButtons = document.querySelectorAll(
    "#system-options button"
);


function showSystem(systemKey) {
    const system = explorerSystems[systemKey];

    if (!system) return;

    const relationshipList = document.getElementById("relationship-list");
relationshipList.replaceChildren();

system.relationships.forEach((relationship) => {
    const card = document.createElement("article");
    card.className = "relationship-card";

    const path = document.createElement("p");
    path.className = "relationship-path";
    path.textContent = `${relationship.from} → ${relationship.to}`;

    const explanation = document.createElement("p");
    explanation.textContent = relationship.explanation;

    card.append(path, explanation);
    relationshipList.appendChild(card);
});

    document.getElementById("system-category").textContent =
        system.category;

    document.getElementById("system-title").textContent =
        system.title;

    document.getElementById("system-description").textContent =
        system.description;

    // Build the component list from the selected system.
    const componentList = document.getElementById("system-components");
    componentList.replaceChildren();

    system.components.forEach((component) => {
        const item = document.createElement("li");
        item.textContent = component;
        componentList.appendChild(item);
    });

    document.getElementById("system-risk").textContent =
        system.risk;

    document.getElementById("system-opportunity").textContent =
        system.opportunity;

    explorerButtons.forEach((button) => {
        const selected = button.dataset.system === systemKey;

        button.setAttribute("aria-pressed", String(selected));
        button.classList.toggle("is-selected", selected);
    });
    renderDependencyMap(systemKey);
}


explorerButtons.forEach((button) => {
    button.addEventListener("click", () => {
        showSystem(button.dataset.system);
    });
});



/* =========================================
   INTERACTIVE DEPENDENCY MAP
   ========================================= */

const dependencyModels = {
    cybersecurity: {
        nodes: [
            { id: "identity", label: "Identity & Access",
              description: "Controls who can access systems and information." },
            { id: "network", label: "Networks",
              description: "Connect systems and carry information between them." },
            { id: "controls", label: "Security Controls",
              description: "Help detect, prevent, or limit security incidents." },
            { id: "data", label: "Assets & Data",
              description: "Information and resources that need protection." }
        ],
        edges: [
            ["identity", "data"],
            ["network", "controls"],
            ["controls", "data"]
        ]
    },

    ai: {
        nodes: [
            { id: "data", label: "Data",
              description: "Examples and information used to develop and evaluate models." },
            { id: "compute", label: "Computing",
              description: "Hardware and infrastructure used to run AI workloads." },
            { id: "models", label: "AI Models",
              description: "Systems that process inputs and generate outputs." },
            { id: "oversight", label: "Human Oversight",
              description: "Review, evaluation, and governance of AI outputs." }
        ],
        edges: [
            ["data", "models"],
            ["compute", "models"],
            ["models", "oversight"]
        ]
    },

    infrastructure: {
        nodes: [
            { id: "energy", label: "Energy & Utilities",
              description: "Power and utility services required for operations." },
            { id: "equipment", label: "Equipment",
              description: "Machinery and physical assets used in production." },
            { id: "logistics", label: "Materials & Logistics",
              description: "Supply and movement of materials and components." },
            { id: "operations", label: "Operations",
              description: "Processes that coordinate production and delivery." }
        ],
        edges: [
            ["energy", "equipment"],
            ["logistics", "operations"],
            ["equipment", "operations"]
        ]
    }
};

function renderDependencyMap(systemKey) {
    const model = dependencyModels[systemKey];
    if (!model) return;

    const nodeLayer = document.getElementById("dependency-nodes");
    const edgeLayer = document.getElementById("dependency-edges");

    nodeLayer.replaceChildren();
    edgeLayer.replaceChildren();

    const positions = [
        { x: 35, y: 35 },
        { x: 365, y: 35 },
        { x: 35, y: 195 },
        { x: 365, y: 195 }
    ];

    const nodeWidth = 220;
    const nodeHeight = 54;
    const nodePositions = {};

    model.nodes.forEach((node, index) => {
        const position = positions[index];
        nodePositions[node.id] = {
            x: position.x + nodeWidth / 2,
            y: position.y + nodeHeight / 2
        };
    });
    

    model.edges.forEach(([from, to]) => {
        const start = nodePositions[from];
        const end = nodePositions[to];

        const line = document.createElementNS(
            "http://www.w3.org/2000/svg", "line"
        );

        line.setAttribute("x1", start.x);
        line.setAttribute("y1", start.y);
        line.setAttribute("x2", end.x);
        line.setAttribute("y2", end.y);
        line.setAttribute("class", "dependency-edge");
        line.setAttribute("marker-end", "url(#dependency-arrow)");

        edgeLayer.appendChild(line);
    });

    model.nodes.forEach((node, index) => {
        const position = positions[index];

        const group = document.createElementNS(
            "http://www.w3.org/2000/svg", "g"
        );

        group.setAttribute("class", "dependency-node");
        group.setAttribute("tabindex", "0");
        group.setAttribute("role", "button");
        group.setAttribute("aria-label", node.label);
        group.dataset.node = node.id;

        const rect = document.createElementNS(
            "http://www.w3.org/2000/svg", "rect"
        );
        rect.setAttribute("x", position.x);
        rect.setAttribute("y", position.y);
        rect.setAttribute("width", nodeWidth);
        rect.setAttribute("height", nodeHeight);

        const text = document.createElementNS(
            "http://www.w3.org/2000/svg", "text"
        );
        text.setAttribute("x", position.x + nodeWidth / 2);
        text.setAttribute("y", position.y + nodeHeight / 2);
        text.textContent = node.label;

        group.append(rect, text);

        function selectNode() {
            nodeLayer.querySelectorAll(".dependency-node")
                .forEach((item) => {
                    const selected = item === group;
                    item.classList.toggle("is-selected", selected);
                    item.setAttribute("aria-pressed", String(selected));
                });

            document.getElementById("dependency-category").textContent =
                "COMPONENT / " + String(index + 1).padStart(2, "0");

            document.getElementById("dependency-title").textContent =
                node.label;

            document.getElementById("dependency-description").textContent =
                node.description;

            const connections = model.edges
                .filter(([from, to]) => from === node.id || to === node.id)
                .map(([from, to]) => {
                    const source = model.nodes.find(item => item.id === from);
                    const target = model.nodes.find(item => item.id === to);
                    return source.label + " → " + target.label;
                });

            document.getElementById("dependency-connections").textContent =
                connections.length
                    ? "Connected relationships: " + connections.join("; ")
                    : "No direct relationships are defined for this component.";
        }

        group.addEventListener("click", selectNode);
        group.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                selectNode();
            }
        });

        nodeLayer.appendChild(group);
    });

    // Select the first node by default.
    const firstNode = nodeLayer.querySelector(".dependency-node");
    if (firstNode) firstNode.dispatchEvent(new Event("click"));
}
// Initialize the Systems Explorer after all data and functions exist.
showSystem("cybersecurity");