import express from "express";
import cors from 'cors'
import { routeGame } from './routes/gameboard.js'
import { routeDash } from './routes/dashboard.js'
import { routeSync } from './routes/syncboard.js'
import { routeEdu } from './routes/education.js'
import { routeUser } from './routes/user.js'

const API_VERSION = "3.2.3"

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({ origin: '*' }));
app.options('*', cors()); // responder preflight

app.use('/game', routeGame)
app.use('/dashboard', routeDash)
app.use("/sync", routeSync)
app.use("/education", routeEdu)
app.use("/users", routeUser)

app.get("/", (req, res) => res.send(`API DB de Wires&Ladders v${API_VERSION}`));

app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'), '0.0.0.0', () => {
	console.log(`Wires&Ladders DB API v${API_VERSION} escuchando en el puerto ${app.get('port')}`);
});
