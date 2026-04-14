const aboutMeURL = './starter/data/aboutMeData.json';
const projectsURL = './starter/data/projectsData.json';
const cardPlaceholder = './starter/images/card_placeholder_bg.webp';
const headshotPlaceholder = './starter/images/headshot.webp'

async function init() {
    try{
        await loadAboutMe();
        await loadProjects();
        initForm();
    }
    catch (error){ console.error('Initilization error: ', error);
    }
}

async function fetchJson(url) {
    const response = await fetch(url);
    if(!response.ok) throw new Error(`Failed to load ${url} - status ${response.status}`);
    return response.json();
}

async function loadAboutMe() {
    const data = await fetchJson(aboutMeURL);
    renderAboutMe(data);
}

function renderAboutMe(data) {
    const section = document.getElementById('aboutMe');
    if (!section) {
        console.warn('About section not found. ');
        return;
    }

    const text = data?.aboutMe ?? 'About information is not available right now. ';
    const src = getImage(data?.headshot ?? null, 'headshot');

    section.innerHTML = 
    `
    <p>${escapeHtml(text)}</p>
    <div class="headshotContainer">
        <img src="${src}" alt="About me headshot" loading="lazy">
    </div>
    `;
}

async function loadProjects() {
    const projects = await fetchJson(projectsURL);
    renderProjects(projects);
}

function renderProjects(projects){
    if(!Array.isArray(projects) || projects.length ===0){
        console.warn('No project data available. ');
        return;
    }

    const projectList = document.getElementById('projectList');
    const spotlight = document.getElementById('projectSpotlight');
    const spotlightTitles = document.getElementById('spotlightTitles');

    if(!projectList || !spotlight || !spotlightTitles){
        console.warn('Project elements missing. ');
        return;
    }

    const normalizedProjects = projects.map(
        (p)=>(
            {
                project_id: p.project_id ?? ``
            }
        )
    )

}



