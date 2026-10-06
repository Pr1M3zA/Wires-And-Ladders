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

routeSync.get('/board-backgrounds', async (req, res) => {
	let db;
	try {
		db = await connect();
		const [rows] = await db.query(`SELECT id, background_name, rect_width, rect_height, color_rect, color_path1, color_path2, path1, path2 FROM board_backgrounds`);
		res.status(200).json(rows);
	} catch (err) {
		res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
	} finally {
		if (db) await db.end();
	}
});

routeSync.get('/boards', async (req, res) => {
	let db;
	try {
		db = await connect();
		const [rows] = await db.query(`SELECT id, board_name, board_description, id_background, width, height, 1 AS education FROM boards`);
		res.status(200).json(rows);
	} catch (err) {
		res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
	} finally {
		if (db) await db.end();
	}
});

routeSync.get('/tiles', async (req, res) => {
	let db;
	try {
		db = await connect();
		const [rows] = await db.query(`SELECT t.id, id_board, num_tile, pos_x, pos_y, tile_type, rotation, radius, border_width, direction, tt.effect_name FROM tiles t INNER JOIN tile_types tt ON t.tile_type=tt.id`);
		res.status(200).json(rows);
	} catch (err) {
		res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
	} finally {
		if (db) await db.end();
	}
});

routeSync.get('/shortcuts', async (req, res) => {
	let db;
	try {
		db = await connect();
		const [rows] = await db.query(`SELECT id, id_board, from_tile, to_tile FROM shortcuts`);
		res.status(200).json(rows);
	} catch (err) {
		res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
	} finally {
		if (db) await db.end();
	}
});

routeSync.get('/tile-types', async (req, res) => {
	let db;
	try {
		db = await connect();
		const [rows] = await db.query(`SELECT id, id_effect, effect_name, color_fill, color_border, color_path1, color_path2, path1, path2, paths_x, paths_y, paths_scale FROM tile_types`);
		res.status(200).json(rows);
	} catch (err) {
		res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
	} finally {
		if (db) await db.end();
	}
});

routeSync.get('/dices', async (req, res) => {
	let db;
	try {
		db = await connect();
		const [rows] = await db.query(`SELECT id, dice_name, color_faceup, color_faceleft, color_faceright, color_dots, color_border, border_width, scale FROM dices`);
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

routeSync.get('/edu-knowledge-areas', async (req, res) => {
	let db;
	try {
		db = await connect();
		const [rows] = await db.query(`SELECT id, description, details, color, material_design_icon FROM edu_knowledge_areas`);
		res.status(200).json(rows);
	} catch (err) {
		res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
	} finally {
		if (db) await db.end();
	}
});

routeSync.get('/edu-disciplines', async (req, res) => {
	let db;
	try {
		db = await connect();
		const [rows] = await db.query(`SELECT id, id_knowledge_area, description, details FROM edu_disciplines`);
		res.status(200).json(rows);
	} catch (err) {
		res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
	} finally {
		if (db) await db.end();
	}
});

routeSync.get('/edu-levels', async (req, res) => {
	let db;
	try {
		db = await connect();
		const [rows] = await db.query(`SELECT id, description FROM edu_levels`);
		res.status(200).json(rows);
	} catch (err) {
		res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
	} finally {
		if (db) await db.end();
	}
});

routeSync.get('/edu-topics', async (req, res) => {
	let db;
	try {
		db = await connect();
		const [rows] = await db.query(`SELECT id, id_discipline, id_level, description, details FROM edu_topics`);
		res.status(200).json(rows);
	} catch (err) {
		res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
	} finally {
		if (db) await db.end();
	}
});

routeSync.get('/edu-subtopics', async (req, res) => {
	let db;
	try {
		db = await connect();
		const [rows] = await db.query(`SELECT id, id_topic, description, details FROM edu_subtopics`);
		res.status(200).json(rows);
	} catch (err) {
		res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
	} finally {
		if (db) await db.end();
	}
});


routeSync.get('/edu-info-questions', async (req, res) => {
	let db;
	try {
		db = await connect();
		const [rows] = await db.query(`SELECT iq.id, iq.id_subtopic, st.description subtopic, iq.information, iq.question, iq.answer_1, iq.answer_2, iq.answer_3, iq.answer_4, iq.answer_ok, iq.is_true_or_false FROM edu_info_and_questions iq INNER JOIN edu_subtopics st ON iq.id_subtopic=st.id`);
		res.status(200).json(rows);
	} catch (err) {
		res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
	} finally {
		if (db) await db.end();
	}
});

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

routeSync.get('/update-apk', (req, res) => { res.redirect(process.env.URL_UPDATE_APK) });

export { routeSync }