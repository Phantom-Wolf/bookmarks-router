// imports

const app = require('./app');
const { PORT } = require('./config');

// server

app.listen(PORT, () => {
	console.log(`Server listening at http://localhost:${PORT}`);
});
