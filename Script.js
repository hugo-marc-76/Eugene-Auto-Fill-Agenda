// ==UserScript==
// @name         Auto-fill Agenda
// @namespace    http://hugo-marc.fr/
// @version      2.0
// @description  Remplir automatiquement l'agenda sur clic avec options dynamiques et mise à jour des tâches
// @author       Freyzi76
// @match        https://*/planning
// @match        https://*/planning/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Récupérer les sélections depuis localStorage ou définir des valeurs par défaut
    let autoFillEnabled = localStorage.getItem('autoFillEnabled') !== 'false';
    let selectedDossier = localStorage.getItem('selectedDossier');
    let selectedTache = localStorage.getItem('selectedTache');
    let selectedHour = localStorage.getItem('selectedHour') || '07';
    let selectedMinute = localStorage.getItem('selectedMinute') || '00';

    // Créer un bouton pour activer/désactiver le script
    let button = document.createElement('button');
    button.innerHTML = 'Toggle Auto-fill';
    button.style.position = 'fixed';
    button.style.top = '10px';
    button.style.right = '10px';
    button.style.zIndex = '10000';
    button.style.backgroundColor = autoFillEnabled ? 'green' : '';
    document.body.appendChild(button);

    // Créer un formulaire pour configurer les options
    let form = document.createElement('div');
    form.style.position = 'fixed';
    form.style.top = '50px';
    form.style.right = '10px';
    form.style.backgroundColor = 'white';
    form.style.padding = '10px';
    form.style.border = '1px solid black';
    form.style.zIndex = '10000';
    form.innerHTML = `
        <label>Dossier: <select id="dossierSelect"></select></label><br>
        <label>Tâche: <select id="tacheSelect"></select></label><br>
        <label>Heure: <input type="text" id="hourInput" value="${selectedHour}" size="2"></label> :
        <label>Minute: <input type="text" id="minuteInput" value="${selectedMinute}" size="2"></label><br>
        <button id="saveConfig">Enregistrer</button>
    `;
    document.body.appendChild(form);

    // Fonction pour remplir les sélecteurs de formulaire avec les options du site
    function populateSelectors() {
        // Récupérer et remplir les options de dossier
        let dossierSelect = document.getElementById('dossierSelect');
        let dossierOptions = document.querySelectorAll('#App_planning_details_0_dossier option');
        dossierOptions.forEach(option => {
            let newOption = document.createElement('option');
            newOption.value = option.value;
            newOption.textContent = option.textContent;
            if (option.value === selectedDossier) {
                newOption.selected = true;
            }
            dossierSelect.appendChild(newOption);
        });

        // Remplir les options de tâche en fonction du dossier sélectionné
        dossierSelect.addEventListener('change', updateTacheOptions);
        updateTacheOptions();
    }

    // Fonction pour mettre à jour les options de tâche en fonction du dossier sélectionné
    function updateTacheOptions() {
        let dossierSelect = document.getElementById('dossierSelect');
        let tacheSelect = document.getElementById('tacheSelect');
        tacheSelect.innerHTML = '';

        // Simuler le changement du sélecteur sur le site pour déclencher la mise à jour des options de tâche
        let dossierSelectSite = document.querySelector('#App_planning_details_0_dossier');
        dossierSelectSite.value = dossierSelect.value;
        let event = new Event('change');
        dossierSelectSite.dispatchEvent(event);

        // Attendre un court instant pour que le site mette à jour les options de tâche
        setTimeout(() => {
            let tacheOptions = document.querySelectorAll('#App_planning_details_0_tache option');
            tacheOptions.forEach(option => {
                let newOption = document.createElement('option');
                newOption.value = option.value;
                newOption.textContent = option.textContent;
                if (option.value === selectedTache) {
                    newOption.selected = true;
                }
                tacheSelect.appendChild(newOption);
            });
        }, 500); // Ajuster ce délai si nécessaire pour votre site
    }

    // Appeler la fonction pour remplir les sélecteurs de formulaire
    populateSelectors();

    // Sauvegarder les options configurées
    document.getElementById('saveConfig').addEventListener('click', () => {
        selectedDossier = document.getElementById('dossierSelect').value;
        selectedTache = document.getElementById('tacheSelect').value;
        selectedHour = document.getElementById('hourInput').value;
        selectedMinute = document.getElementById('minuteInput').value;

        localStorage.setItem('selectedDossier', selectedDossier);
        localStorage.setItem('selectedTache', selectedTache);
        localStorage.setItem('selectedHour', selectedHour);
        localStorage.setItem('selectedMinute', selectedMinute);

        alert('Configuration enregistrée !');
    });

    button.addEventListener('click', toggleAutoFill);

    function toggleAutoFill() {
        autoFillEnabled = !autoFillEnabled;
        localStorage.setItem('autoFillEnabled', autoFillEnabled);
        button.style.backgroundColor = autoFillEnabled ? 'green' : '';
    }

    // Vérifier si une action est déjà en cours
    let actionInProgress = localStorage.getItem('actionInProgress') === 'true';

    // Fonction pour remplir automatiquement le formulaire
    function autoFill() {
        let dossierSelect = document.querySelector('#App_planning_details_0_dossier');
        if (dossierSelect) {
            dossierSelect.value = selectedDossier;
            let event = new Event('change');
            dossierSelect.dispatchEvent(event);
        }

        setTimeout(() => {
            let tacheSelect = document.querySelector('#App_planning_details_0_tache');
            if (tacheSelect) {
                tacheSelect.value = selectedTache;
                let event = new Event('change');
                tacheSelect.dispatchEvent(event);
            }

            let hourInput = document.querySelector('#App_planning_details_0_duree_hour');
            let minuteInput = document.querySelector('#App_planning_details_0_duree_minute');
            if (hourInput && minuteInput) {
                hourInput.value = selectedHour;
                minuteInput.value = selectedMinute;
            }

            // Réinitialiser l'état d'action en cours avant d'enregistrer
            localStorage.setItem('actionInProgress', 'false');

            let saveButton = document.querySelector('button[type="submit"]');
            if (saveButton) {
                saveButton.click();
            }
        }, 500); // Attendre pour que le champ tâche soit mis à jour
    }

    // Ajouter un écouteur d'événements pour cliquer sur n'importe quel <td>
    document.addEventListener('click', (event) => {
        console.log('Click event detected:', event.target); // Debug message
        let target = event.target.closest('td');
        if (target && target.hasAttribute('data-date')) {
            console.log('Matched target:', target); // Debug message
            console.log('Target classes:', target.className); // Debug message
            console.log('Target data-date:', target.dataset.date); // Debug message

            if (autoFillEnabled && !actionInProgress) {
                console.log('Condition passed for autoFillEnabled and !actionInProgress'); // Debug message
                // Marquer l'action comme en cours
                localStorage.setItem('actionInProgress', 'true');
                let date = target.dataset.date;
                if (date) {
                    console.log('Navigating to date:', date); // Debug message
                    window.location.href = `/planning/${date}`;
                }
            }
        }
    });

    // Remplir automatiquement le formulaire si l'URL correspond au schéma prévu
    if (window.location.pathname.match(/^\/planning\/\d{4}-\d{2}-\d{2}$/)) {
        console.log('URL matched for auto-fill'); // Debug message
        if (autoFillEnabled && actionInProgress) {
            autoFill();
        } else {
            // Réinitialiser l'état d'action en cours si l'URL a changé sans action en cours
            localStorage.setItem('actionInProgress', 'false');
        }
    }
})();
