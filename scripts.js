class projectCategory extends HTMLElement {
    static get observedAttributes() {
        return ['json-link'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        let jsonLink = this.getAttribute('json-link') || 'projects.json';
        let shadowRoot = this.shadowRoot;
        fetch(jsonLink , { 
            method: 'GET'
            })
            .then(function(response) { return response.json();})
            .then(function(json)
                {
                    let categoryTitle = json.category;
                    let projects = json.projects;

                    shadowRoot.innerHTML =
                    `
                    <link rel="stylesheet" href="styles.css">
                    <div class="main-header">
                        <p>${categoryTitle}</p>
                    </div>
                    <div class="main-projects">   
                    </div>
                    `;

                    projects.forEach((element) => {
                        const host = shadowRoot.querySelector('.main-projects');
                        var project = document.createElement("project-element");

                        project.setAttribute("title", element.title);
                        project.setAttribute("thumbnail", element.thumbnail);
                        project.setAttribute("tags", element.tags);
                        project.setAttribute("link", element.link);
                        project.setAttribute("doc-source", element.docSource);
                        project.setAttribute("category", json.category);

                        host.appendChild(project);
                    });
                }
            )
    }
}

class projectElement extends HTMLElement {
    static get observedAttributes() {
        return ['title', 'thumbnail', 'tags', 'link', 'doc-source', 'category'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }  

    connectedCallback() {
        var title = this.getAttribute('title') || 'Project Title';
        var thumbnail = this.getAttribute('thumbnail') || 'images/placeholder.png';
        var tags = this.getAttribute('tags') || 'Tag1, Tag2, Tag3';
        var link = this.getAttribute('link') || '#';
        var docSource = this.getAttribute('doc-source') || '';
        var category = this.getAttribute('category') || '';
        var i = 0;
        this.shadowRoot.innerHTML = 
        `
            <link rel="stylesheet" href="styles.css">
            <div class="project">
                <a ${docSource ? `href="#${docSource}"` : `href="${link}"`}>
                    <img src="${thumbnail}" width="300" height="200"/>
                    <p><b>${title}</b></p>
                    <div class="project-tags">
                        ${tags.split(',').map(tag => `<span class="tag" id="${tag.trim().toLowerCase()}">${tag.trim()}</span>`).join('')}
                    </div>
                </a>
            </div>
        `

            this.shadowRoot.querySelector('a').addEventListener('click', (event) => {
                if (docSource) {
                    event.preventDefault();
                    openProjectDetails(docSource, `${category} / ${title}`);
                }
            });
    }
}

class projectOverview extends HTMLElement
{
    static get observedAttributes() {
        return ['title', 'doc-source'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }  

    async connectedCallback() {
        const projectContainer = document.querySelector('.main');
        const title = this.getAttribute('title') || "404"
        const docSource = this.getAttribute('docSource') || "pages/404.html"

        try 
        {
            const response = await fetch(docSource);
            var html = ``;

            if (!response.ok)
            {
                html = `404 - page not found.`
            }
            else
            {
                html = await response.text();
            }

            projectContainer.innerHTML = `
                <div class="project-view">
                    <div class="project-view-header">
                        <a id="back-button" href="#"><img src="images/backbutton.png" width="50%" height="auto" align="center"/></a>
                        <p>${title}</p>
                    </div>
                    <div class="project-view-content">
                    ${html}
                    </div>
                </div>
            `;

            projectContainer.querySelector('#back-button').addEventListener('click', () => {
                projectContainer.innerHTML = mainContent;
            });
        }
        catch{

        }
    }
}

var mainContent = null;

async function openProjectDetails(docSource, title) {
    const projectContainer = document.querySelector('.main');
    const body = document.querySelector('body');
    mainContent = projectContainer.innerHTML;
    body.id = "#showElement";

    projectContainer.innerHTML = `
        <project-overview title="${title}" docSource=${docSource}></project-overview>
    `;
}

customElements.define('project-category', projectCategory);
customElements.define('project-element', projectElement);
customElements.define('project-overview', projectOverview);