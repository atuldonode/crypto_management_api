import express from 'express';
import axios from 'axios';
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { HumanMessage } from "@langchain/core/messages";
import Cors from 'cors';
const app = express();
const PORT = 3000;
const cors = Cors
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';
const CHATOLLAMA_API_URL = 'http://localhost:11434';

const chat = new ChatOllama({
  baseUrl: CHATOLLAMA_API_URL,
  model: "mistral",
});

// Enable CORS for all routes
app.use(cors());

// Route to fetch the list of all coins
// app.get('/coins', async (req, res) => {
//   try {
//     // Make a GET request to the CoinGecko API to fetch the list of coins
//     const response = await axios.get(`${COINGECKO_API_URL}/coins/list`);
//     // Extract the list of coins from the response data
//     const coinList = response.data;
//     // Send the list of coins as JSON response
//     res.json(coinList);
//   } catch (error) {
//     console.error('Error fetching coin list:', error);
//     res.status(500).json({ error: 'Error fetching coin list' });
//   }
// });

// All active coins
app.get('/active/coins', async (req, res) => {
  try {
    const params = {
      vs_currency: 'usd', // Use USD as the base currency
      per_page: '100',
      page: '1',           // Page number (1-based index)
      sparkline: 'false',
      price_change_percentage: '1h,24h,7d'
    };
    const response = await axios.get(`${COINGECKO_API_URL}/coins/markets`, { params });
    // Extract the list of coins from the response data
    const coinList = response.data;
    res.json(coinList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching coin list' });
  }
});

app.get('/coin/:id', async (req, res) => {
  const coinId = req.params.id; // Extract coinId from the URL parameter
  try {
    const response = await axios.get(`${COINGECKO_API_URL}/coins/${coinId}`);
    const coinDetails = response.data;
    res.json(coinDetails);
  } catch (error) {
    console.error(`Error fetching details for coin ${coinId}:`, error);
    res.status(500).json({ error: `Error fetching details for coin ${coinId}` });
  }
});

app.get('/price/:id', async (req, res) => {
  const cryptoId = req.params.id; // Extract coinId from the URL parameter
  try {
    const response = await axios.get(`${COINGECKO_API_URL}/simple/price?ids=${cryptoId}&vs_currencies=usd`);
    const coinDetails = response.data;
    res.json(coinDetails);
  } catch (error) {
    console.error(`Error fetching details for coin ${cryptoId}:`, error);
    res.status(500).json({ error: `Error fetching details for coin ${cryptoId}` });
  }
});

app.get('/predict/:coinId', async (req, res) => {
  const coinId = req.params.coinId; // Extract coinId from the URL parameter
  try {
    const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart/range?vs_currency=usd&from=1681486501&to=1713022501&precision=daily`);
      // let result = JSON.parse(JSON.stringify(response.data));
      // const priceData = result.prices;
      // const input = `Predict the price of ${coinId} based on historical price data ${JSON.stringify(result)}`;
      // const response2 = await chat.invoke([
      //   new HumanMessage({
      //     content: [
      //       {
      //         type: "text",
      //         text: input,
      //       },
      //     ],
      //   }),
      // ]);
      // const prediction = response2.content[0].text;
    res.status(200).json({
      data: JSON.parse(JSON.stringify(response.data))
    });
  } catch (error) {
    console.error(`Error fetching or predicting price data for coin ${coinId}:`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
