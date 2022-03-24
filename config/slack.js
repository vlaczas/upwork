const { WebClient } = require('@slack/web-api');

const slack = new WebClient(process.env.SLACK);

module.exports = slack;
