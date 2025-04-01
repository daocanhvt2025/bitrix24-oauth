const axios = require('axios');

const call = async (action, payload = {}, accessToken, domain) => {
  try {
    const response = await axios.post(
      `https://${domain}/rest/${action}`,
      payload,
      {
        params: { auth: accessToken },
        timeout: 10000, // Timeout 10s
      }
    );

    if (response.data.error === 'expired_token') {
      throw new Error('Token expired');
    }

    return response.data;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout');
    } else if (error.response) {
      throw new Error(error.response.data.error_description || error.response.data.error);
    } else {
      throw new Error('Network error');
    }
  }
};

module.exports = { call };