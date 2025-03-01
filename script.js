// Alternar entre modo claro e escuro
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
  const currentTheme = document.body.dataset.theme;
  document.body.dataset.theme = currentTheme === 'dark' ? '' : 'dark';
});

// Função para carregar os participantes do arquivo Excel
document.getElementById('loadParticipantsButton').addEventListener('change', function(event) {
  loadParticipants(event);
});

function loadParticipants(event) {
  if (typeof XLSX === "undefined") {
    console.error("Biblioteca XLSX não carregada.");
    return;
  }

  const file = event.target.files[0];
  if (!file) {
    console.error("Nenhum arquivo selecionado.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const data = e.target.result;
    try {
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      let participants = json.slice(1).map(row => ({
        name: row[0] || '',
        kit: row[1] || '',
        number: row[2] || '',
        tshirt: row[3] || '',
        gender: row[4] || '',
        time: row[5] || ''
      }));

      saveParticipantsToLocalStorage(participants);
      displayParticipants(participants);
    } catch (error) {
      console.error("Erro ao ler o arquivo:", error);
    }
  };

  reader.readAsArrayBuffer(file);
}

// Função para exibir os participantes na tabela
function displayParticipants(participants) {
  const tableBody = document.querySelector('#participantTable tbody');
  tableBody.innerHTML = ''; // Limpa a tabela antes de exibir novos dados

  if (!Array.isArray(participants) || participants.length === 0) return;

  participants.forEach(participant => {
    const { name, kit, number, tshirt, gender, time } = participant;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td contenteditable="true">${name}</td>
      <td contenteditable="true">${kit}</td>
      <td contenteditable="true">${number}</td>
      <td contenteditable="true">${tshirt}</td>
      <td contenteditable="true">${gender}</td>
      <td contenteditable="true">${time}</td>
    `;
    tableBody.appendChild(tr);
  });
}

// Função para adicionar um novo participante
function addParticipant() {
  const name = document.getElementById('newName').value.trim();
  const kit = document.getElementById('newKit').value.trim();
  const number = document.getElementById('newNumber').value.trim();
  const tshirt = document.getElementById('newTshirt').value.trim();
  const gender = document.getElementById('newGender').value.trim();

  if (!name || !number || !gender) {
    alert("Preencha todos os campos obrigatórios.");
    return;
  }

  let participants = getParticipantsFromLocalStorage();
  participants.push({ name, kit, number, tshirt, gender, time: '' });

  saveParticipantsToLocalStorage(participants);
  displayParticipants(participants);

  document.getElementById('newName').value = '';
  document.getElementById('newKit').value = '';
  document.getElementById('newNumber').value = '';
  document.getElementById('newTshirt').value = '';
  document.getElementById('newGender').value = '';
}

// Função para salvar os participantes no localStorage
function saveParticipantsToLocalStorage(participants) {
  localStorage.setItem('participants', JSON.stringify(participants));
}

// Função para carregar os participantes do localStorage
function loadParticipantsFromLocalStorage() {
  const storedParticipants = localStorage.getItem('participants');
  if (storedParticipants) {
    const participants = JSON.parse(storedParticipants);
    displayParticipants(participants);
  }
}

// Obter os participantes do localStorage
function getParticipantsFromLocalStorage() {
  const storedParticipants = localStorage.getItem('participants');
  return storedParticipants ? JSON.parse(storedParticipants) : [];
}

// Carregar dados ao iniciar a página
window.onload = function() {
  loadParticipantsFromLocalStorage();
};

// 🔹 Funções do Cronômetro
let stopwatchInterval;
let elapsedTime = 0;

function startStopwatch() {
  clearInterval(stopwatchInterval);
  stopwatchInterval = setInterval(() => {
    elapsedTime++;
    document.getElementById('display').textContent = formatTime(elapsedTime);
  }, 1000);
}

function stopStopwatch() {
  clearInterval(stopwatchInterval);
}

function resetStopwatch() {
  clearInterval(stopwatchInterval);
  elapsedTime = 0;
  document.getElementById('display').textContent = '00:00:00';
}

function formatTime(seconds) {
  const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
}

// 🔹 Registrar Tempo do Corredor
function registerTime() {
  const number = document.getElementById('runnerNumber').value.trim();
  const tableBody = document.querySelector('#participantTable tbody');
  const rows = Array.from(tableBody.querySelectorAll('tr'));

  const row = rows.find(tr => tr.children[2].textContent === number);

  if (row) {
    const time = formatTime(elapsedTime);
    row.children[5].textContent = time;

    let participants = getParticipantsFromLocalStorage();
    const participant = participants.find(p => p.number === number);
    if (participant) {
      participant.time = time;
      saveParticipantsToLocalStorage(participants);
    }
  } else {
    alert("Número do corredor não encontrado!");
  }
}

// 🔹 Gerar Planilha Excel
function generateExcel() {
  const table = document.getElementById('participantTable');
  const workbook = XLSX.utils.table_to_book(table, { sheet: "Corrida" });
  XLSX.writeFile(workbook, 'corrida_resultados.xlsx');
}

// 🔹 Resetar Página sem Apagar LocalStorage
function resetAll() {
  document.querySelector('#participantTable tbody').innerHTML = ''; 
  document.getElementById('newName').value = '';
  document.getElementById('newKit').value = '';
  document.getElementById('newNumber').value = '';
  document.getElementById('newTshirt').value = '';
  document.getElementById('runnerNumber').value = '';
  resetStopwatch();
}
