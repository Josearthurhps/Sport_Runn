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

// Função de pesquisa
document.getElementById("searchButton").addEventListener("click", function() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase(); // Captura o termo de pesquisa
  filterParticipants(searchTerm);
});

function filterParticipants(searchTerm) {
  const tableBody = document.querySelector('#participantTable tbody');
  const rows = tableBody.querySelectorAll('tr');

  rows.forEach(row => {
    const name = row.querySelector('td:nth-child(1)').textContent.toLowerCase(); // Pega o nome da coluna
    const kit = row.querySelector('td:nth-child(2)').textContent.toLowerCase();  // Pega a coluna kit
    const number = row.querySelector('td:nth-child(3)').textContent.toLowerCase(); // Pega a coluna número
    const tshirt = row.querySelector('td:nth-child(4)').textContent.toLowerCase();  // Pega a coluna camiseta
    const gender = row.querySelector('td:nth-child(5)').textContent.toLowerCase();  // Pega a coluna gênero

    // Verifica se algum dado da linha contém o termo de pesquisa
    if (name.includes(searchTerm) || kit.includes(searchTerm) || number.includes(searchTerm) || tshirt.includes(searchTerm) || gender.includes(searchTerm)) {
      row.style.display = '';  // Exibe a linha
    } else {
      row.style.display = 'none';  // Esconde a linha
    }
  });
}



// Função para exibir os participantes na tabela com limite de 5 linhas iniciais
function displayParticipants(participants) {
  const tableBody = document.querySelector('#participantTable tbody');
  tableBody.innerHTML = '';

  if (!Array.isArray(participants) || participants.length === 0) return;

  participants.forEach((participant, index) => {
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

    // Esconde todas as linhas acima da 5ª
    if (index >= 5) {
      tr.style.display = "none";
    }

    tableBody.appendChild(tr);
  });


  const mostrarMaisBtn = document.getElementById("mostrarMais");
  const mostrarMenosBtn = document.getElementById("mostrarMenos");

  if (participants.length > 5) {
    mostrarMaisBtn.style.display = "block";
    mostrarMenosBtn.style.display = "none";
  } else {
    mostrarMaisBtn.style.display = "none";
    mostrarMenosBtn.style.display = "none";
  }
}


document.getElementById("mostrarMais").addEventListener("click", function() {
  let linhas = document.querySelectorAll("#participantTable tbody tr");
  
  linhas.forEach(linha => {
    linha.style.display = "table-row"; 
  });

  this.style.display = "none"; 
  document.getElementById("mostrarMenos").style.display = "block";
});

document.getElementById("mostrarMenos").addEventListener("click", function() {
  let linhas = document.querySelectorAll("#participantTable tbody tr");

  linhas.forEach((linha, index) => {
    if (index >= 5) {
      linha.style.display = "none"; 
    }
  });

  this.style.display = "none"; 
  document.getElementById("mostrarMais").style.display = "block";
});

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
