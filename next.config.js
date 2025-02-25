require("dotenv").config();
const webpack = require("webpack");

const apiKey = JSON.stringify(process.env.SHOPIFY_API_KEY);

module.exports = {
  future: {
    webpack5: true,
  },
  webpack: (config) => {
    const env = { API_KEY: apiKey };
    config.plugins.push(new webpack.DefinePlugin(env));
    return config;
  },
};
