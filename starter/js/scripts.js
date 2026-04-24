const ABOUT_ME_URL = './starter/data/aboutMeData.json';
const PROJECTS_URL = './starter/data/projectsData.json';
const CARD_PLACEHOLDER = './starter/images/card_placeholder_bg.webp';
const SPOTLIGHT_PLACEHOLDER = './starter/images/spotlight_placeholder_bg.webp';
const HEADSHOT_PLACEHOLDER = './starter/images/headshot.webp';

async function init() {
    try {
        await loadAboutMe();
        await loadProjects();
        initForm();
    } catch (error) {
        console.error('Initialization error:', error);
    }
}

async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load ${url} — status ${response.status}`);
    return response.json();
}


async function loadAboutMe() {
    const data = await fetchJson(ABOUT_ME_URL);
    renderAboutMe(data);
}

function renderAboutMe(data) {
    const section = document.getElementById('aboutMe');
    if (!section) { console.warn('About section not found.'); return; }

    while (section.firstChild) {
        section.removeChild(section.firstChild);
    }

    const text = data?.aboutMe ?? 'About information is not available right now.';
    const src  = getImageUri(data?.headshot ?? null, 'headshot');

    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    section.appendChild(paragraph);

    const headshotContainer = document.createElement('div');
    headshotContainer.className = 'headshotContainer';

    const headshotImg = document.createElement('img');
    headshotImg.src = src;
    headshotImg.alt = 'About me headshot';
    headshotImg.loading = 'lazy';

    headshotContainer.appendChild(headshotImg);
    section.appendChild(headshotContainer);
}

async function loadProjects() {
    const projects = await fetchJson(PROJECTS_URL);
    renderProjects(projects);
}

function renderProjects(projects) {
    if (!Array.isArray(projects) || projects.length === 0) {
        console.warn('No project data available.'); return;
    }

    const projectList     = document.getElementById('projectList');
    const spotlightEl     = document.getElementById('projectSpotlight');
    const spotlightTitles = document.getElementById('spotlightTitles');

    if (!projectList || !spotlightEl || !spotlightTitles) {
        console.warn('Project elements missing from DOM.'); return;
    }

    const normalizedProjects = projects.map((p) => ({
        project_id:        p.project_id        ?? `project_${Math.random().toString(36).slice(2)}`,
        project_name:      p.project_name      ?? 'Untitled Project',
        short_description: p.short_description ?? 'No description available.',
        long_description:  p.long_description  ?? 'More information will be available soon.',
        card_image:        getImageUri(p.card_image,      'card'),
        spotlight_image:   getImageUri(p.spotlight_image, 'spotlight'),
        url:               p.url               ?? '#',
    }));

    const fragment = document.createDocumentFragment();

    normalizedProjects.forEach((p) => {
        const card = document.createElement('div');
        card.className = 'projectCard';
        card.id = p.project_id;
        card.style.backgroundImage = `url('${p.card_image}')`;
        card.style.backgroundSize = 'cover';
        card.style.backgroundPosition = 'center';

        const title = document.createElement('h4');
        title.textContent = p.project_name;

        const desc = document.createElement('p');
        desc.textContent = p.short_description;

        card.appendChild(title);
        card.appendChild(desc);
        fragment.appendChild(card);
    });

    while (projectList.firstChild) {
        projectList.removeChild(projectList.firstChild);
    }
    projectList.appendChild(fragment);

    projectList.addEventListener('click', (e) => {
        const card = e.target.closest('.projectCard');
        if (!card) return;
        const project = normalizedProjects.find((p) => p.project_id === card.id);
        if (!project) return;
        updateSpotlight(project, spotlightEl, spotlightTitles);
        updateActiveCard(card.id, projectList);
    });

    updateSpotlight(normalizedProjects[0], spotlightEl, spotlightTitles);
    updateActiveCard(normalizedProjects[0].project_id, projectList);
    initProjectNavigation(projectList);
}

function updateSpotlight(project, spotlightEl, titlesEl) {
    spotlightEl.style.backgroundImage = `url('${project.spotlight_image}')`;
    spotlightEl.style.backgroundSize = 'cover';
    spotlightEl.style.backgroundPosition = 'center';

    while (titlesEl.firstChild) {
        titlesEl.removeChild(titlesEl.firstChild);
    }

    const title = document.createElement('h3');
    title.textContent = project.project_name;
    titlesEl.appendChild(title);

    const description = document.createElement('p');
    description.textContent = project.long_description;
    titlesEl.appendChild(description);

    const link = document.createElement('a');
    link.href = project.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'Click here to see more...';
    titlesEl.appendChild(link);
}

function updateActiveCard(activeId, projectList) {
    projectList.querySelectorAll('.projectCard').forEach((card) => {
        const isActive = card.id === activeId;
        card.className = `projectCard ${isActive ? 'active' : 'inactive'}`;
    });
}

function initProjectNavigation(projectList) {
    const leftArrow  = document.querySelector('.arrow-left');
    const rightArrow = document.querySelector('.arrow-right');
    if (!leftArrow || !rightArrow) return;

    const desktop = window.matchMedia('(min-width: 1024px)');
    const scrollDist = () => desktop.matches
        ? projectList.clientHeight * 0.75
        : projectList.clientWidth  * 0.75;

    let pending = false;
    const throttledScroll = (opts) => {
        if (pending) return;
        pending = true;
        requestAnimationFrame(() => { projectList.scrollBy(opts); pending = false; });
    };

    leftArrow.addEventListener('click', () =>
        throttledScroll(desktop.matches
            ? { top: -scrollDist(), behavior: 'smooth' }
            : { left: -scrollDist(), behavior: 'smooth' })
    );

    rightArrow.addEventListener('click', () =>
        throttledScroll(desktop.matches
            ? { top: scrollDist(), behavior: 'smooth' }
            : { left: scrollDist(), behavior: 'smooth' })
    );
}

function initForm() {
    const emailInput   = document.getElementById('contactEmail');
    const messageInput = document.getElementById('contactMessage');
    const emailError   = document.getElementById('emailError');
    const messageError = document.getElementById('messageError');
    const charsLeft    = document.getElementById('charactersLeft');
    const form         = document.getElementById('formSection');

    if (!emailInput || !messageInput || !form || !emailError || !messageError || !charsLeft) {
        console.warn('Contact form elements missing.'); return;
    }

    const illegalChars = /[^a-zA-Z0-9@._-]/;
    const validEmail   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const updateCount = () => {
        const currentLength = messageInput.value.length;
        charsLeft.textContent = `Characters: ${currentLength}/300`;
        
        if (currentLength > 300) {
            charsLeft.classList.add('error');
        } else {
            charsLeft.classList.remove('error');
        }
    };

    messageInput.addEventListener('input', updateCount);
    updateCount();

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const email   = emailInput.value.trim();
        const message = messageInput.value.trim();
        let valid = true;

        emailError.textContent   = '';
        messageError.textContent = '';

        if (!email) {
            emailError.textContent = 'Email is required.';
            valid = false;
        } else if (!validEmail.test(email)) {
            emailError.textContent = 'Enter a valid email address.';
            valid = false;
        } else if (illegalChars.test(email)) {
            emailError.textContent = 'Email contains invalid characters. Only letters, numbers, @, ., _, and - are allowed.';
            valid = false;
        }

        if (!message) {
            messageError.textContent = 'Message is required.';
            valid = false;
        } else if (illegalChars.test(message)) {
            messageError.textContent = 'Message contains invalid characters. Only letters, numbers, @, ., _, and - are allowed.';
            valid = false;
        } else if (message.length > 300) {
            messageError.textContent = 'Message must be 300 characters or fewer.';
            valid = false;
        }

        if (valid) {
            alert('Form validation passed. Thank you!');
            form.reset();
            updateCount();
        }
    });
}


function getImageUri(imagePath, type = 'generic') {
    const placeholder = type === 'card'      ? CARD_PLACEHOLDER
                      : type === 'spotlight' ? SPOTLIGHT_PLACEHOLDER
                      :                        HEADSHOT_PLACEHOLDER;

    if (!imagePath || typeof imagePath !== 'string') return placeholder;
    const p = imagePath.trim();
    if (!p) return placeholder;

    if (p.startsWith('../images/'))  return `./starter/images/${p.slice('../images/'.length)}`;
    if (p.startsWith('./images/'))   return `./starter/images/${p.slice('./images/'.length)}`;
    if (p.startsWith('/starter/images/') || p.startsWith('./starter/images/') || p.startsWith('starter/images/'))
        return p;

    return placeholder;
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

document.addEventListener('DOMContentLoaded', init);