const projectGrid = document.getElementById("projectGrid");
const allProjectGrid = document.getElementById("allProjectGrid");
const activeProjectGrid = allProjectGrid || projectGrid;
const filterButtons = document.querySelectorAll(".filter-button");
const scriptUrl = document.currentScript.src;
const siteRoot = new URL("./", scriptUrl);
const projectsUrl = new URL("./data/projects.json", scriptUrl);

let allProjects = [];

function getProjectCategories(project) {
    return Array.isArray(project.category) ? project.category : [project.category];
}

async function loadProjects() {
    if (!activeProjectGrid) {
        return;
    }

    try {
        const response = await fetch(projectsUrl);
        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        allProjects = data.projects;
        displayProjects(allProjects);
    } catch (error) {
        console.error("Could not load projects:", error);
        activeProjectGrid.textContent = "Projects could not be loaded.";
    }
}

function displayWorkProjects(projects) {
    activeProjectGrid.replaceChildren();

    projects.forEach((project) => {
        const card = document.createElement("article");
        card.className = "work-project-card";

        const artwork = document.createElement("div");
        artwork.className = `work-project-art work-project-art--${project.artStyle}`;
        artwork.style.backgroundColor = project.background;
        artwork.setAttribute("aria-hidden", "true");
        artwork.textContent = project.artwork;

        if (project.image) {
            const image = document.createElement("img");
            image.className = "work-project-image";
            image.src = new URL(project.image, siteRoot).href;
            image.alt = "";
            image.addEventListener("load", () => {
                artwork.textContent = "";
                artwork.append(image);
            }, { once: true });
        }

        const info = document.createElement("div");
        info.className = "work-project-info";

        const title = document.createElement("h2");
        title.textContent = project.title;

        const details = document.createElement("div");
        details.className = "work-project-details";

        const category = document.createElement("span");
        category.textContent = getProjectCategories(project).join(" / ");

        const year = document.createElement("span");
        year.textContent = project.year;

        details.append(category, year);
        info.append(title, details);
        card.append(artwork, info);
        activeProjectGrid.append(card);
    });
}

function displayHomeProjects(projects) {
    projectGrid.innerHTML = "";

    projects.forEach((project) => {
        const card = document.createElement("article");
        card.classList.add("project-card");
        card.innerHTML = `
            <div class="project-image">
                <img src="${project.image}" alt="${project.title}">
            </div>
            <div class="project-info">
                <div>
                    <h3>${project.title}</h3>
                    <p>${getProjectCategories(project).join(" / ")} / ${project.year}</p>
                </div>
            </div>
        `;
        projectGrid.appendChild(card);
    });
}

function displayProjects(projects) {
    if (allProjectGrid) {
        displayWorkProjects(projects);
    } else if (projectGrid) {
        displayHomeProjects(projects);
    }
}

filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        filterButtons.forEach((filterButton) => {
            filterButton.classList.remove("active");
            filterButton.setAttribute("aria-pressed", "false");
        });

        button.classList.add("active");
        button.setAttribute("aria-pressed", "true");
        const category = button.dataset.filter;
        const filteredProjects = category === "All"
            ? allProjects
            : allProjects.filter((project) => getProjectCategories(project).includes(category));
        displayProjects(filteredProjects);
    });
});

loadProjects();
