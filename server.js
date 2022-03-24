const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const app = require('./app');
// const { connectDB } = require('./configs/mongo');
const http = require('http');

const server = http.createServer(app);
const port = process.env.PORT || 5000;

module.exports = (
  async () => {
//* Connect to the Database
//     await connectDB();
// start server
    server.listen(port, (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log('Server running at http://localhost:' + port);
      }
    });
    return server;
  }
)();
