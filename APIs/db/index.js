import express from "express";
import cors from 'cors'
import { routeGame } from './routes/gameboard.js'
import { routeDash } from './routes/dashboard.js'
import { routeSync } from './routes/syncboard.js'
import { routeEdu } from './routes/education.js'
import { routeUser } from './routes/user.js'
import { routeGroups } from './routes/groups.js'
import { routePush } from './routes/push.js'

const API_VERSION = "3.3.0"

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const allowedOrigins = new Set([
  process.env.PWA_ORIGIN,
  ...(process.env.VERCEL === '1' ? [] : [
    'http://localhost:5501',
    'http://127.0.0.1:5501',
  ]),
].filter(Boolean));

const corsOptions = {
  origin(origin, callback) {
    callback(null, !origin || allowedOrigins.has(origin));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'authorization'],
  maxAge: 86400,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use('/game', routeGame)
app.use('/dashboard', routeDash)
app.use("/sync", routeSync)
app.use("/education", routeEdu)
app.use("/users", routeUser)
app.use("/groups", routeGroups)
app.use('/push', routePush)

app.get("/", (req, res) => res.send(`API DB de Wires&Ladders v${API_VERSION}`));

app.set('port', process.env.PORT || 3000);

// Vercel importa la app como handler; en local se mantiene el servidor de desarrollo.
if (process.env.VERCEL !== '1') {
	app.listen(app.get('port'), '0.0.0.0', () => {
		console.log(`Wires&Ladders DB API v${API_VERSION} escuchando en el puerto ${app.get('port')}`);
	});
}

export default app;
