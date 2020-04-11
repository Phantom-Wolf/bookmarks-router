// imports

const app = require('./app');
const { PORT, DB_URL } = require('./config');
const knex = require('knex');

// body

const db = knex({
	client: 'pg',
	connection: DB_URL,
});

app.set('db', db);

// server

app.listen(PORT, () => {
	console.log(`Server listening at http://localhost:${PORT}`);
});
