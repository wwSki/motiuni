async function populateOptions() {
    await populateDropdown('themeSelect', 'themesOptions.json');
    await populateDropdown('typeSelect', 'typesOptions.json');
    await populateDropdown('infosSelect', 'infosOptions.json');
    await populateDropdown('levelSelect', 'levelOptions.json');
    await populateDropdown('languageSelect', 'languageOptions.json');
}

async function populateDropdown(selectId, jsonFile) {
    try {
        const select = document.getElementById(selectId);

        const response = await fetch(jsonFile);
        const options = await response.json();

        if (!options || !options.options || !Array.isArray(options.options)) {
            console.error(`Invalid structure in ${jsonFile}.`);
            return;
        }

        options.options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            select.appendChild(optionElement);
        });
    } catch (error) {
        console.error(`Error fetching or processing JSON from ${jsonFile}:`, error);
    }
}

window.onload = populateOptions;

async function getRandomMotion() {
    try {
        const themeSelect = document.getElementById('themeSelect');
        const selectedTheme = themeSelect.value;

        const typeSelect = document.getElementById('typeSelect');
        const selectedType = typeSelect.value.toLowerCase();

        const infosSelect = document.getElementById('infosSelect');
        const selectedInfos = infosSelect.value.toLowerCase();

        const levelSelect = document.getElementById('levelSelect');
        const selectedLevel = levelSelect.value.toLowerCase();
        
        const languageSelect = document.getElementById('languageSelect');
        const selectedLanguage = languageSelect.value.toLowerCase();

        const tsvUrl = 'motions.tsv';

        const response = await fetch(tsvUrl);
        const data = await response.text();

        const tsvRows = data.split('\n');
        const motions = [];

        for (let i = 1; i < tsvRows.length; i++) {
            const columns = tsvRows[i].split('\t');

            if (columns.length >= 20) {
                const motion = columns[4].trim();
                const type = columns[8].trim();
                const infos = columns[5].trim();
                const level = columns[10].trim();
                const language = columns[11].trim();

                if (motion && type && level && language) {
                    motions.push({ motion, type, infos, themes: columns.slice(16, 19).map(theme => theme.trim()), level, language });
                }
            }
        }

        let filteredMotions = motions;

        if (selectedTheme !== 'toate') {
            filteredMotions = filteredMotions.filter(motion =>
                motion.themes.includes(selectedTheme)
            );
        }

        if (selectedType !== 'toate') {
            filteredMotions = filteredMotions.filter(motion =>
                motion.type.toLowerCase() === selectedType
            );
        }

        if (selectedInfos !== 'toate') {
            filteredMotions = filteredMotions.filter(motion => {
                if (selectedInfos === 'da') {
                    return motion.infos !== '';
                } else if (selectedInfos === 'nu') {
                    return motion.infos === '';
                } else {
                    return true;
                }
            });
        }

        if (selectedLevel !== 'toate') {
            filteredMotions = filteredMotions.filter(motion =>
                motion.level.toLowerCase() === selectedLevel
            );
        }
        
        if (selectedLanguage !== 'toate') {
            filteredMotions = filteredMotions.filter(motion =>
                motion.language.toLowerCase() === selectedLanguage
            );
        }

        if (filteredMotions.length === 0) {
            const motionOutput = document.getElementById('motionOutput');
            motionOutput.innerText = 'Nici o moțiune';
            return;
        }

        const randomIndex = Math.floor(Math.random() * filteredMotions.length);
        const randomMotion = filteredMotions[randomIndex];

        const motionOutput = document.getElementById('motionOutput');
        motionOutput.innerText = `Moțiune: ${randomMotion.motion}`;

        if (randomMotion.infos) {
            const infosParagraph = document.createElement('p');
            infosParagraph.innerText = `Infoslide: ${randomMotion.infos}`;
            motionOutput.appendChild(infosParagraph);
        }

    } catch (error) {
        console.error('Error fetching or processing data:', error);
    }
}

function toggleDarkMode() {
    const body = document.body;
    const darkModeToggle = document.querySelector('.dark-mode-toggle');
    const darkModeIcon = document.getElementById('darkModeIcon');

    body.classList.toggle('dark-mode-active');

    darkModeToggle.classList.toggle('dark-mode-active');

    const isDarkMode = body.classList.contains('dark-mode-active');
    darkModeIcon.innerText = isDarkMode ? '☀️' : '🌙';
}
