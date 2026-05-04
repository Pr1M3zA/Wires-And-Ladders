import express from "express";
import cors from 'cors'
import { routeGame } from './routes/gameboard.js'
import { routeDash } from './routes/dashboard.js'
import { routeSync } from './routes/syncboard.js'

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({ origin: '*' }));
app.options('*', cors()); // responder preflight

app.use('/', routeGame)
app.use('/dashboard', routeDash)
app.use("/sync", routeSync)

app.get("/", (req, res) => res.send("MyAPI"));

app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'), '0.0.0.0', () => {
    console.log(`app escuchando en el puerto ${app.get('port')}`);
});
