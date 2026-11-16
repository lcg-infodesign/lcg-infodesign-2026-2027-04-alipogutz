
let tabella;
let fiumeId;

let maxLung = 0;
let maxPortata = 0;
let minTemp = 100;
let maxTemp = -100;

let totFiumi;

let continente;
let totContinente = 0;

// fiumi piccoli
let mouseId = null;
let mouseNome = "";

// box torna
let boxX = 0;
let boxY = 0;
let boxL = 0;

let colFreddo;
let colMedio;
let colCaldo;


async function setup() {
  tabella = await loadTable("assets/rivers.csv", ",", "header");

  let params = getURLParams();
  fiumeId = params.river;

  createCanvas(windowWidth, windowHeight);
  totFiumi = tabella.getRowCount();

  // cerca max e min 
  for (let i = 0; i < totFiumi; i++) {
    let lung = tabella.getNum(i, "length");
    if (lung > maxLung) maxLung = lung;

    let portata = tabella.getNum(i, "discharge");
    if (portata > maxPortata) maxPortata = portata;

    let temp = tabella.getNum(i, "avg_temp");
    if (temp < minTemp) minTemp = temp;
    if (temp > maxTemp) maxTemp = temp;
  }

  // continente e suoi fiumi
  let riga = tabella.findRow(fiumeId, "id");
  if (riga) {
    continente = riga.getString("continent");

    for (let i = 0; i < totFiumi; i++) {
      if (tabella.getString(i, "continent") == continente) {
        totContinente++;
      }
    }
  }

  colFreddo = color(80, 180, 235);
  colMedio = color(250, 210, 100);
  colCaldo = color(240, 110, 20);
}



function draw() {
  background(240, 242, 245);

  let riga = tabella.findRow(fiumeId, "id");

  // dati fiume
  let nome = pulisciNome(riga.getString("name"));
  let sbocco = riga.getString("outflow");
  let lung = riga.getNum("length");
  let portata = riga.getNum("discharge");
  let temp = riga.getNum("avg_temp");
  let colore = coloreTemp(temp);

  // layout
  let areaL = min(960, width - 60);
  let areaA = min(height - 60, 620);
  let inizioX = (width - areaL) / 2;
  let inizioY = (height - areaA) / 2;

  let glifoX = inizioX;
  let glifoMaxL = 200;
  let destraX = inizioX + 280;
  let destraL = areaL - 280;

  let baseY = inizioY + areaA - 50;
  let glifoMaxA = baseY - (inizioY + 110);

  // glifo
  let glifoA = max(map(lung, 0, maxLung, 0, glifoMaxA), 12);
  let glifoL = max(map(portata, 0, maxPortata, 0, glifoMaxL), 6);

  // dim max grigia
  noFill();
  stroke(180, 188, 198);
  rect(glifoX, baseY - glifoMaxA, glifoMaxL, glifoMaxA);

  // Rettangolo colorato del fiume
  noStroke();
  fill(colore);
  rect(glifoX, baseY - glifoA, glifoL, glifoA);

  // Linea nera di base
  stroke(35, 45, 60);
  strokeWeight(2);
  line(glifoX, baseY + 1, glifoX + glifoMaxL, baseY + 1);
  strokeWeight(1);

  // titolo
  noStroke();
  fill(35, 45, 60);
  textAlign(LEFT, TOP);
  textFont("Georgia");
  textStyle(BOLD);
  textSize(34);
  text(nome, inizioX, inizioY);

  textFont("sans-serif");
  textStyle(NORMAL);
  textSize(14);
  fill(80, 90, 105);
  text(continente + " · sfocia in: " + sbocco, inizioX, inizioY + 50);

  // barre di confronto
  let barreY = inizioY + 110;

  disegnaBarra("Lunghezza",
    formatta(lung) + " km",
    lung, 0, maxLung, destraX, barreY, destraL, colore);

  disegnaBarra("Portata",
    formatta(portata) + " m³/s",
    portata, 0, maxPortata, destraX, barreY + 64, destraL, colore);

  disegnaBarra("Temperatura media",
    formatta(temp) + " °C",
    temp, minTemp, maxTemp, destraX, barreY + 128, destraL, colore);

  // legenda
  let legendaY = barreY + 200;
  noStroke();
  fill(35, 45, 60);
  textAlign(LEFT, TOP);
  textStyle(BOLD);
  textSize(14);
  text("Legenda", destraX, legendaY);
  textStyle(NORMAL);
  textSize(12);
  fill(80, 90, 105);
  text("Altezza = lunghezza (max " + formatta(maxLung) + " km)", destraX, legendaY + 22);
  text("Larghezza = portata (max " + formatta(maxPortata) + " m³/s)", destraX, legendaY + 40);
  text("Colore = temperatura media · rettangolo grigio = massimo del dataset", destraX, legendaY + 58);

  // Barra temperatura
  let barraTempL = 220;
  for (let i = 0; i < barraTempL; i++) {
    let t = map(i, 0, barraTempL - 1, minTemp, maxTemp);
    stroke(coloreTemp(t));
    line(destraX + i, legendaY + 80, destraX + i, legendaY + 90);
  }
  noStroke();
  fill(80, 90, 105);
  textSize(11);
  textAlign(LEFT, TOP);
  text(formatta(minTemp) + " °C", destraX, legendaY + 94);
  textAlign(RIGHT, TOP);
  text(formatta(maxTemp) + " °C", destraX + barraTempL, legendaY + 94);

  // altri fiumi 
  let maxBarrettaA = 80;

  textAlign(LEFT, TOP);
  textSize(13);
  fill(35, 45, 60);
  text("Altri fiumi: " + continente, destraX, baseY - maxBarrettaA - 24);

  let barrettaL = constrain((destraL - 3 * (totContinente - 1)) / totContinente, 2, 16);

  mouseId = null;
  let posX = destraX;

  for (let i = 0; i < totFiumi; i++) {
    if (tabella.getString(i, "continent") == continente) {

      let id = tabella.getString(i, "id");
      let l = tabella.getNum(i, "length");
      let t = tabella.getNum(i, "avg_temp");
      let barrettaA = max(map(l, 0, maxLung, 0, maxBarrettaA), 4);

      // Controlla se il mouse è sopra questa barretta
      let sopra = mouseX >= posX && mouseX < posX + barrettaL &&
                  mouseY >= baseY - maxBarrettaA && mouseY <= baseY;
      if (sopra) {
        mouseId = id;
        mouseNome = pulisciNome(tabella.getString(i, "name"));
      }

      fill(coloreTemp(t));
      if (id == fiumeId || sopra) {
        stroke(35, 45, 60);
        strokeWeight(2);
      } else {
        noStroke();
      }
      rect(posX, baseY - barrettaA, barrettaL, barrettaA);
      strokeWeight(1);

      posX += barrettaL + 3;
    }
  }

  // nome del fiume a destra
  if (mouseId != null) {
    noStroke();
    fill(35, 45, 60);
    textStyle(BOLD);
    textSize(13);
    textAlign(RIGHT, TOP);
    text(mouseNome, destraX + destraL, baseY - maxBarrettaA - 24);
    textStyle(NORMAL);
  }

  // torna a tutti i fiumi
  boxX = inizioX;
  boxY = baseY + 18;
  textSize(13);
  boxL = textWidth("← Torna a tutti i fiumi") + 24;

  fill(238, 238, 238);
  stroke(200, 200, 200);
  rect(boxX, boxY, boxL, 30, 8);

  noStroke();
  textAlign(LEFT, CENTER);
  fill(20);
  text("← Torna a tutti i fiumi", boxX + 12, boxY + 15);

}


// barra orizzontale completa
function disegnaBarra(titolo, testo, val, minVal, maxVal, x, y, largh, colore) {
  noStroke();
  textSize(15);
  fill(35, 45, 60);
  textAlign(LEFT, TOP);
  textStyle(BOLD);
  text(titolo, x, y);
  textStyle(NORMAL);
  textSize(14);
  fill(80, 90, 105);
  textAlign(RIGHT, TOP);
  text(testo, x + largh, y);

  fill(220, 224, 230);
  rect(x, y + 26, largh, 20, 10);

  let riempimento = map(val, minVal, maxVal, 0, largh);
  fill(colore);
  rect(x, y + 26, max(riempimento, 8), 20, 10);
}


function pulisciNome(testo) {
  return testo.split('/')[0].split('(')[0].trim();
}


function coloreTemp(temp) {
  let t = map(temp, minTemp, maxTemp, 0, 1);

  if (t < 0.5) {
    return lerpColor(colFreddo, colMedio, t * 2);
  } else {
    return lerpColor(colMedio, colCaldo, (t - 0.5) * 2);
  }
}

// punto alle migliaia
function formatta(val) {
  return val.toLocaleString("de-DE");
}

function mousePressed() {
  if (mouseId != null && mouseId != fiumeId) {
    window.location.href = "detail.html?river=" + mouseId;
  }

  if (mouseX > boxX && mouseX < boxX + boxL &&
      mouseY > boxY && mouseY < boxY + 30) {
    window.location.href = "index.html";
  }
}