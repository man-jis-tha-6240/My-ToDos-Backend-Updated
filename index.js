const connectToMongo = require('./db');
const express = require('express')
var cors = require('cors')

connectToMongo();
const app = express()
const port = 5000;
app.use(express.json());
app.use(cors());
app.use(express.json())
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', 'http://localhost:3000'); // Allow any origin
	res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	next();
  });
app.use('/api/auth', require('./routes/auth.js'));
app.use('/api/notes', require('./routes/notes.js'))
app.listen(port, () => {
	console.log(`Listening on port http://localhost:${port}`);
})
