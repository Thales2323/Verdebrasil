const map = L.map('map').setView([-14.235, -51.9253], 4);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let cities = [];
let markers = [];

async function searchCity() {
  const cityName = document.getElementById('cityInput').value.trim();
  if (!cityName) return;

  const response = await fetch(`https://nominatim.openstreetmap.org/search?city=${cityName}&country=Brazil&format=json&addressdetails=1`);
  const data = await response.json();

  if (data.length === 0) {
    alert("Cidade não encontrada!");
    return;
  }

  const { lat, lon, address } = data[0];
  const coords = [parseFloat(lat), parseFloat(lon)];

  const nome = formatarNomeResumido(address);

  const marker = L.marker(coords, {
    icon: new L.Icon.Default()
  }).addTo(map).bindPopup(nome);
  markers.push(marker);

  cities.push({ name: nome, coords, marker });

  updateCityList();
  updateTotalDistance();
  salvarNoLocalStorage();
  map.setView(coords, 8);
  document.getElementById('cityInput').value = '';
}

function formatarNomeResumido(endereco) {
  const cidade = endereco.city || endereco.town || endereco.village || endereco.municipality || 'Cidade';
  const uf = endereco.state_code || 'UF';
  return `${cidade} - ${uf}`;
}

function updateCityList() {
  const list = document.getElementById('cityList');
  list.innerHTML = '';

  cities.forEach((city, index) => {
    const li = document.createElement('li');

    const span = document.createElement('span');
    span.textContent = city.name;
    span.onclick = () => changeMarkerColor(index);

    const remove = document.createElement('button');
    remove.className = 'remove-btn';
    remove.textContent = '🗑️';
    remove.onclick = () => removeCity(index);

    li.appendChild(span);
    li.appendChild(remove);
    list.appendChild(li);
  });
}

function removeCity(index) {
  map.removeLayer(cities[index].marker);
  cities.splice(index, 1);
  markers.splice(index, 1);
  updateCityList();
  updateTotalDistance();
  salvarNoLocalStorage();
}

function changeMarkerColor(index) {
  const city = cities[index];
  const currentIconUrl = city.marker.options.icon.options.iconUrl || '';

  const isRed = currentIconUrl.includes("red-dot.png");

  map.removeLayer(city.marker);

  const icon = isRed
    ? new L.Icon.Default()
    : new L.Icon({
        iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });

  const newMarker = L.marker(city.coords, { icon }).addTo(map).bindPopup(city.name);
  city.marker = newMarker;

  updateCityList();
  salvarNoLocalStorage();
}

function updateTotalDistance() {
  let distance = 0;
  for (let i = 1; i < cities.length; i++) {
    distance += getDistance(cities[i - 1].coords, cities[i].coords);
  }
  document.getElementById('totalDistance').textContent = `Distância total: ${distance.toFixed(2)} km`;
}

function getDistance(coord1, coord2) {
  const R = 6371;
  const dLat = toRad(coord2[0] - coord1[0]);
  const dLon = toRad(coord2[1] - coord1[1]);
  const lat1 = toRad(coord1[0]);
  const lat2 = toRad(coord2[0]);
  const a = Math.sin(dLat/2) ** 2 +
            Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon/2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text("Roteiro de Cidades", 20, 20);

  let y = 30;
  cities.forEach((city, index) => {
    doc.text(`${index + 1}. ${city.name}`, 20, y);
    y += 10;
  });

  const total = document.getElementById('totalDistance').textContent;
  doc.text(total, 20, y + 10);

  doc.save("roteiro-cidades.pdf");
}

function openRoutes() {
  if (cities.length < 2) {
    alert("Adicione pelo menos 2 cidades para gerar a rota.");
    return;
  }

  const base = "https://www.google.com/maps/dir/";
  const waypoints = cities.map(c => encodeURIComponent(c.name)).join('/');
  const url = base + waypoints;
  window.open(url, '_blank');
}

function salvarImagemDoMapa() {
  leafletImage(map, function(err, canvas) {
    if (err) {
      alert("Erro ao capturar o mapa.");
      return;
    }

    const img = document.createElement('a');
    img.href = canvas.toDataURL();
    img.download = 'mapa.png';
    img.click();
  });
}

function salvarNoLocalStorage() {
  const data = cities.map(c => ({ name: c.name, coords: c.coords }));
  localStorage.setItem('cidadesSalvas', JSON.stringify(data));
}

function carregarDoLocalStorage() {
  const data = localStorage.getItem('cidadesSalvas');
  if (data) {
    const carregadas = JSON.parse(data);
    carregadas.forEach(c => {
      const marker = L.marker(c.coords, { icon: new L.Icon.Default() })
        .addTo(map)
        .bindPopup(c.name);
      cities.push({ name: c.name, coords: c.coords, marker });
    });
    updateCityList();
    updateTotalDistance();
  }
}

document.getElementById('searchButton').addEventListener('click', searchCity);
carregarDoLocalStorage();
