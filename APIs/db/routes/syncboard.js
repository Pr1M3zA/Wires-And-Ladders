import { Router } from "express";
import { ProfanityEngine } from '@coffeeandfun/google-profanity-words';
import { connect } from './../db.js'

const routeSync = Router();

routeSync.get('/lastupdate', async (req, res) => {
	let db;
	try {
		db = await connect();
		const [rows] = await db.query(`	`);
		res.status(200).json(rows);
	} catch (err) {
		res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
	} finally {
		if (db) await db.end();
	}
});

routeSync.get('/board-backgrounds/:afterOf', async (req, res) => {
	let db;
	try {
		const afterOf = req.params.afterOf;
		db = await connect();
		const [rows] = await db.query(`SELECT id, background_name, rect_width, rect_height, color_rect, color_path1, color_path2, path1, path2 FROM board_backgrounds WHERE updated_at > '${afterOf}'`);
		res.status(200).json(rows);
	} catch (err) {
		res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
	} finally {
		if (db) await db.end();
	}
});

routeSync.get('/boards/:afterOf', async (req, res) => {
	let db;
	try {
		const afterOf = req.params.afterOf;
		db = await connect();
		const [rows] = await db.query(`SELECT id, board_name, board_description, id_background, width, height, 1 AS education FROM boards WHERE updated_at > '${afterOf}'`);
		res.status(200).json(rows);
	} catch (err) {
		res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
	} finally {
		if (db) await db.end();
	}
});

routeSync.get('/tiles/:afterOf', async (req, res) => {
	let db;
	try {
		const afterOf = req.params.afterOf;
		db = await connect();
		const [rows] = await db.query(`SELECT t.id, id_board, num_tile, pos_x, pos_y, tile_type, rotation, radius, border_width, direction, tt.effect_name FROM tiles t INNER JOIN tile_types tt ON t.tile_type=tt.id WHERE t.updated_at > '${afterOf}' ORDER BY id_board, num_tile`);
		res.status(200).json(rows);
	} catch (err) {
		res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
	} finally {
		if (db) await db.end();
	}
});

routeSync.get('/shortcuts/:afterOf', async (req, res) => {
	let db;
	try {
		const afterOf = req.params.afterOf;
		db = await connect();
		const [rows] = await db.query(`SELECT id, id_board, from_tile, to_tile FROM shortcuts WHERE updated_at > '${afterOf}'`);
		res.status(200).json(rows);
	} catch (err) {
		res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
	} finally {
		if (db) await db.end();
	}
});

routeSync.get('/tile-types/:afterOf', async (req, res) => {
	let db;
	try {
		const afterOf = req.params.afterOf;
		db = await connect();
		const [rows] = await db.query(`SELECT id, id_effect, effect_name, color_fill, color_border, color_path1, color_path2, path1, path2, paths_x, paths_y, paths_scale FROM tile_types WHERE updated_at > '${afterOf}'`);
		res.status(200).json(rows);
	} catch (err) {
		res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
	} finally {
		if (db) await db.end();
	}
});

routeSync.get('/dices/:afterOf', async (req, res) => {
	let db;
	try {
		const afterOf = req.params.afterOf;
		db = await connect();
		const [rows] = await db.query(`SELECT id, dice_name, color_faceup, color_faceleft, color_faceright, color_dots, color_border, border_width, scale FROM dices WHERE updated_at > '${afterOf}'`);
		res.status(200).json(rows);
	} catch (err) {
		res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
	} finally {
		if (db) await db.end();
	}
});

routeSync.get('/profanity-words', async (req, res) => {
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


routeSync.get('/education', async (req, res) => {
	let db;
	try {
		db = await connect();
		const [rows] = await db.query(`SELECT id, generation, theme, information, question, answer_1, answer_2, answer_3, answer_4, answer_ok, created_by FROM education`);
		res.status(200).json(rows);
	} catch (err) {
		res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
	} finally {
		if (db) await db.end();
	}
});

routeSync.get('/edu-knowledge-areas/:afterOf', async (req, res) => {
	let db;
	try {
		const afterOf = req.params.afterOf;
		db = await connect();
		const [rows] = await db.query(`SELECT id, description, details, color, material_design_icon FROM edu_knowledge_areas WHERE updated_at > '${afterOf}'`);
		res.status(200).json(rows);
	} catch (err) {
		res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
	} finally {
		if (db) await db.end();
	}
});

routeSync.get('/edu-disciplines/:afterOf', async (req, res) => {
	let db;
	try {
		const afterOf = req.params.afterOf;
		db = await connect();
		const [rows] = await db.query(`SELECT id, id_knowledge_area, description, details FROM edu_disciplines WHERE updated_at > '${afterOf}'`);
		res.status(200).json(rows);
	} catch (err) {
		res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
	} finally {
		if (db) await db.end();
	}
});

routeSync.get('/edu-levels/:afterOf', async (req, res) => {
	let db;
	try {
		const afterOf = req.params.afterOf;
		db = await connect();
		const [rows] = await db.query(`SELECT id, description FROM edu_levels WHERE updated_at > '${afterOf}'`);
		res.status(200).json(rows);
	} catch (err) {
		res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
	} finally {
		if (db) await db.end();
	}
});

routeSync.get('/edu-topics/:afterOf', async (req, res) => {
	let db;
	try {
		const afterOf = req.params.afterOf;
		db = await connect();
		const [rows] = await db.query(`SELECT id, id_discipline, id_level, description, details FROM edu_topics WHERE updated_at > '${afterOf}'`);
		res.status(200).json(rows);
	} catch (err) {
		res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
	} finally {
		if (db) await db.end();
	}
});

routeSync.get('/edu-subtopics/:afterOf', async (req, res) => {
	let db;
	try {
		const afterOf = req.params.afterOf;
		db = await connect();
		const [rows] = await db.query(`SELECT id, id_topic, description, details FROM edu_subtopics WHERE updated_at > '${afterOf}'`);
		res.status(200).json(rows);
	} catch (err) {
		res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
	} finally {
		if (db) await db.end();
	}
});


routeSync.get('/edu-info-questions/:afterOf', async (req, res) => {
	let db;
	try {
		const afterOf = req.params.afterOf;
		db = await connect();
		const [rows] = await db.query(`SELECT iq.id, iq.id_subtopic, st.description subtopic, iq.information, iq.question, iq.answer_1, iq.answer_2, iq.answer_3, iq.answer_4, iq.answer_ok, iq.is_true_or_false FROM edu_info_and_questions iq INNER JOIN edu_subtopics st ON iq.id_subtopic=st.id WHERE iq.updated_at > '${afterOf}'`);
		res.status(200).json(rows);
	} catch (err) {
		res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
	} finally {
		if (db) await db.end();
	}
});

routeSync.get('/board-backgrounds', (req, res) => { res.redirect('/sync/board-backgrounds/1970-01-01') });
routeSync.get('/boards', (req, res) => { res.redirect('/sync/boards/1970-01-01') });
routeSync.get('/tiles', (req, res) => { res.redirect('/sync/tiles/1970-01-01') });
routeSync.get('/tile/:id', async (req, res) => {
	let db;
	try {
		const { id } = req.params;
		db = await connect();
		const [rows] = await db.query(`SELECT t.id, id_board, num_tile, pos_x, pos_y, tile_type, rotation, radius, border_width, direction, tt.effect_name FROM tiles t INNER JOIN tile_types tt ON t.tile_type=tt.id WHERE t.id = ${id}`);
		res.status(200).json(rows);
	} catch (err) {
		res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
	} finally {
		if (db) await db.end();
	}
});
routeSync.get('/shortcuts', (req, res) => { res.redirect('/sync/shortcuts/1970-01-01') });
routeSync.get('/tile-types', (req, res) => { res.redirect('/sync/tile-types/1970-01-01') });
routeSync.get('/dices', (req, res) => { res.redirect('/sync/dices/1970-01-01') });
routeSync.get('/edu-knowledge-areas', (req, res) => { res.redirect('/sync/edu-knowledge-areas/1970-01-01') });
routeSync.get('/edu-disciplines', (req, res) => { res.redirect('/sync/edu-disciplines/1970-01-01') });
routeSync.get('/edu-levels', (req, res) => { res.redirect('/sync/edu-levels/1970-01-01') });
routeSync.get('/edu-topics', (req, res) => { res.redirect('/sync/edu-topics/1970-01-01') });
routeSync.get('/edu-subtopics', (req, res) => { res.redirect('/sync/edu-subtopics/1970-01-01') });
routeSync.get('/edu-info-questions', (req, res) => { res.redirect('/sync/edu-info-questions/1970-01-01') });
routeSync.get('/update-apk', (req, res) => { res.redirect(process.env.URL_UPDATE_APK) });

export { routeSync }