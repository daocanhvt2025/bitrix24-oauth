const axios = require('axios');
const fs = require('fs-extra');
const bitrixApi = require('../utils/bitrixApi');

const CLIENT_ID = 'your_client_id'; // Thay bằng client_id từ Bitrix24
const CLIENT_SECRET = 'your_client_secret'; // Thay bằng client_secret từ Bitrix24
const REDIRECT_URI = 'http://localhost:3000/auth/callback'; // URL callback local
const TOKEN_FILE = './tokens.json';

// Lấy domain từ request (sẽ thay bằng ngrok domain sau)
let DOMAIN = 'cdigitrans.bitrix24.vn'; // Mặc định domain Bitrix24

// Xử lý sự kiện Install
const handleInstall = async (req, res) => {
  DOMAIN = req.query.domain || DOMAIN; // Lấy domain từ request
  const authUrl = `https://${DOMAIN}/oauth/authorize/?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}`;
  res.redirect(authUrl); // Chuyển hướng để authorize
};

// Xử lý callback sau khi authorize
const handleCallback = async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).send('Missing authorization code');
  }

  try {
    // Lấy access token và refresh token
    const response = await axios.get(`https://${DOMAIN}/oauth/token/`, {
      params: {
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code: code,
      },
    });

    const tokens = {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
      expires_in: response.data.expires_in,
      expires_at: Date.now() + response.data.expires_in * 1000, // Tính thời gian hết hạn
      domain: DOMAIN,
    };

    // Lưu token vào file (có thể thay bằng database)
    await fs.writeJson(TOKEN_FILE, tokens);
    res.send('Application installed successfully!');
  } catch (error) {
    console.error('Error during OAuth callback:', error.response?.data || error.message);
    res.status(500).send('Error during installation');
  }
};

// Refresh token khi hết hạn
const refreshToken = async () => {
  const tokens = await fs.readJson(TOKEN_FILE);
  try {
    const response = await axios.get(`https://${tokens.domain}/oauth/token/`, {
      params: {
        grant_type: 'refresh_token',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: tokens.refresh_token,
      },
    });

    const newTokens = {
      ...tokens,
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
      expires_in: response.data.expires_in,
      expires_at: Date.now() + response.data.expires_in * 1000,
    };

    await fs.writeJson(TOKEN_FILE, newTokens);
    return newTokens.access_token;
  } catch (error) {
    console.error('Error refreshing token:', error.response?.data || error.message);
    throw error;
  }
};

// Gọi API bất kỳ
const callApi = async (req, res) => {
  const { action, payload } = req.body;
  if (!action) {
    return res.status(400).send('Missing action');
  }

  try {
    let tokens = await fs.readJson(TOKEN_FILE);
    let accessToken = tokens.access_token;

    // Kiểm tra token hết hạn
    if (Date.now() >= tokens.expires_at) {
      accessToken = await refreshToken();
    }

    const result = await bitrixApi.call(action, payload, accessToken, tokens.domain);
    res.json(result);
  } catch (error) {
    console.error('API call error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  handleInstall,
  handleCallback,
  callApi,
};