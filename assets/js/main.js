
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
