import express from "express";
import { ProfanityEngine } from '@coffeeandfun/google-profanity-words';
import cors from 'cors'
import { connect } from './../db.js'

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({ origin: '*' }));
app.options('*', cors()); // responder preflight

app.get('/sync/board-backgrounds', async (req, res) => {
	let db;
	try {
		db = await connect();
		const [rows] = await db.query(`SELECT background_name, rect_width, rect_height, color_rect, color_path1, color_path2, path1, path2 FROM board_backgrounds`);
		res.status(200).json(rows);
	} catch (err) {
		res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
	} finally {
		if (db) await db.end();
	}
});

app.get('/sync/boards', async (req, res) => {
	let db;
	try {
		db = await connect();
		const [rows] = await db.query(`SELECT id, board_name, board_description, id_background, width, height, education FROM boards`);
		res.status(200).json(rows);
	} catch (err) {
		res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
	} finally {
		if (db) await db.end();
	}
});

app.get('/sync/tiles', async (req, res) => {
	let db;
	try {
		db = await connect();
		const [rows] = await db.query(`SELECT t.id, id_board, num_tile, pos_x, pos_y, tile_type, rotation, radius, border_width, direction, tt.effect_name FROM tiles t INNER JOIN tile_types tt ON t.tile_type=tt.id ORDER BY id_board, num_tile`);
		res.status(200).json(rows);
	} catch (err) {
		res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
	} finally {
		if (db) await db.end();
	}
});


app.get('/sync/shortcuts', async (req, res) => {
	let db;
	try {
		db = await connect();
		const [rows] = await db.query(`SELECT id, id_board, from_tile, to_tile FROM shortcuts ORDER BY id_board`);
		res.status(200).json(rows);
	} catch (err) {
		res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
	} finally {
		if (db) await db.end();
	}
});


app.get('/sync/tile-types', async (req, res) => {
	let db;
	try {
		db = await connect();
		const [rows] = await db.query(`SELECT id, effect_name, color_fill, color_border, color_path1, color_path2, path1, path2, paths_x, paths_y, paths_scale FROM tile_types`);
		res.status(200).json(rows);
	} catch (err) {
		res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
	} finally {
		if (db) await db.end();
	}
});

app.get('/sync/dices', async (req, res) => {
	let db;
	try {

		db = await connect();
		const [rows] = await db.query('SELECT id, dice_name, color_faceup, color_faceleft, color_faceright, color_dots, color_border, border_width, scale FROM dices');
		res.status(200).json(rows);
	} catch (err) {
		res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
	} finally {
		if (db) await db.end();
	}
});


app.get('/sync/education', async (req, res) => {
	let db;
	try {
		db = await connect();
		const [rows] = await db.query('SELECT id, generation, theme, information, question, answer_1, answer_2, answer_3, answer_4, answer_ok FROM education');
		res.status(200).json(rows);
	} catch (err) {
		res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
	} finally {
		if (db) await db.end();
	}
});

app.get('/sync/profanity-words', async (req, res) => {
	try {
		const profanity = new ProfanityEngine()
		const badWordsEng = await profanity.all()
		const profanityEsp = new ProfanityEngine({ language: 'es' });
		const badWordsEsp = await profanityEsp.all();
		const badWords = [...badWordsEng, ...badWordsEsp]
		//const badWords5 = badWords.filter(w => w.length === 5)
		const badWordsUnique = [...new Set(badWords)];
		res.status(200).json(badWordsUnique);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

export { app }