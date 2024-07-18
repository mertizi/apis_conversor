"use strict";

const API_URL = "https://mindicador.cl/api/";
const moneyExchangeContainer = document.getElementById(
  "money-exchange-container"
);
const amountInput = document.getElementById("amount-input");
const convertButton = document.getElementById("convert-button");
const fetchDataButton = document.getElementById("fetch-data-button");
const conversionText = document.getElementById("conversion-text");
const showChart = document.getElementById("show-chart");
const chartContainer = document.getElementById("chart-container");
let chartRef = null;

const fetchMoneyExchange = async (url) => {
  try {
    const dataJson = await fetch(url);
    const moneyExchangeData = await dataJson.json();

    const coins = [];
    for (const key in moneyExchangeData) {
      if (moneyExchangeData[key]["unidad_medida"] === "Pesos") {
        const { codigo, nombre, valor } = moneyExchangeData[key];
        coins.push({ codigo, nombre, valor });
      }
    }
    renderMoney(coins, moneyExchangeContainer);
  } catch (error) {
    const message = error.message;
    console.log(message);
  }
};

const renderMoney = (coins, container) => {
  const selectItem = document.createElement("select");
  selectItem.className = "select-money-exchange";
  selectItem.id = "select-money-exchange";

  let defaultOption = document.createElement("option");
  defaultOption.textContent = "Selecciona una opción";
  defaultOption.disabled = true;
  defaultOption.selected = true;
  selectItem.appendChild(defaultOption);

  coins.forEach(({ codigo, nombre, valor }) => {
    let moneyTypeOption = document.createElement("option");
    moneyTypeOption.textContent = nombre;
    moneyTypeOption.setAttribute("data-value", valor);
    moneyTypeOption.value = codigo;
    selectItem.appendChild(moneyTypeOption);
  });

  container.innerHTML = "";
  container.appendChild(selectItem);
};

const fetchCoinDetails = async (url, coinId) => {
  try {
    const dataJson = await fetch(`${url}${coinId}`);
    const { serie } = await dataJson.json();
    const labels = [];
    const data = [];

    serie.slice(0, 10).forEach(({ fecha, valor }) => {
      labels.push(fecha.split("T")[0]);
      data.push(valor);
    });

    return {
      labels,
      data,
    };
  } catch (error) {
    const message = error.message;
    console.log(message);
  }
};

const renderChart = (coinsData, container) => {
  chartRef = new Chart(container, {
    type: "line",
    data: {
      labels: coinsData.labels,
      datasets: [
        {
          label: "Fechas",
          data: coinsData.data,
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {},
    },
  });
};

showChart.addEventListener("click", async () => {
  try {
    const selectElement = document.getElementById("select-money-exchange");
    const coinId = selectElement.value;
    if (coinId) {
      const coinsDetails = await fetchCoinDetails(API_URL, coinId);
      if (chartRef) chartRef.destroy();
      renderChart(coinsDetails, chartContainer);
      console.log(chartRef);
    } else {
      alert("Selecciona una opción antes de mostrar el gráfico.");
    }
  } catch (error) {
    const message = error.message;
    console.log(message);
  }
});

const convertCurrency = () => {
  const amount = parseInt(amountInput.value);
  const selectElement = document.getElementById("select-money-exchange");
  const selectedOption = selectElement.options[selectElement.selectedIndex];
  const conversionRate = parseInt(selectedOption.getAttribute("data-value"));

  const convertedAmount = amount * conversionRate;
  conversionText.textContent = `El monto convertido es: ${convertedAmount} CLP`;
};

convertButton.addEventListener("click", convertCurrency);

fetchMoneyExchange(API_URL);