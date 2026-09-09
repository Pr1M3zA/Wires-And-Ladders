import { Router } from "express";
import jwt from 'jsonwebtoken';
import { connect } from './../db.js'

const routeGame = Router();

routeGame.post('/game-stats', checkToken, async (req, res) => {
	let db;
	try {
		db = await connect();
		const { startTime, endTime, winnerUserId, players } = req.body;
		//console.log(startTime, endTime, winnerUserId, players)
		const query = `INSERT INTO game_logs (date_time_start, date_time_end, winner_user_id) VALUES ('${startTime}', '${endTime}', ${winnerUserId})`
		const [result] = await db.execute(query);
		const gameLogId = result.insertId;
		for (const player of players) {
			if (player.dbUserId > 0) {  // Ignoramos a los guest
				let idPlatform = 1; // ios
				if (player.platform === 'android') idPlatform = 2; // android
				if (player.platform === 'web') idPlatform = 3; // web
				const query = `INSERT INTO gamer_logs (id_game, id_user, platform, rolled_dice, points_earned, ladders, wires, ok_question_tiles, special_tiles, positive_tiles, negative_tiles, info_tiles, question_tiles)
							VALUES (${gameLogId}, ${player.dbUserId}, ${idPlatform}, ${player.diceRolls}, ${player.pointsAccumulated}, ${player.laddersTaken}, ${player.snakesTaken}, ${player.correctAnswers},
									${player.landedOnTileCounter.Especial}, ${player.landedOnTileCounter.Positivo}, ${player.landedOnTileCounter.Negativo}, ${player.landedOnTileCounter.Informativo}, ${player.landedOnTileCounter.Pregunta})`
				await db.execute(query);
			}
		}
		res.status(200).json({ message: 'Juego registrado correctamente' })
	} catch (err) {
		//console.log(err)
		return res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" })
	} finally {
		if (db) await db.end();
	}

});

routeGame.get('/board-backgrounds/:id', async (req, res) => {
	let db;
	try {
		db = await connect();
		const [rows] = await db.query(`SELECT id, background_name, rect_width, rect_height, color_rect, color_path1, color_path2, path1, path2 FROM board_backgrounds WHERE id= ${req.params.id}'`);
		res.status(200).json(rows);
	} catch (err) {
		res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
	} finally {
		if (db) await db.end();
	}
});

routeGame.get('/boards', async (req, res) => {
	let db;
	try {
		db = await connect();
		const [rows] = await db.query(`SELECT b.id, board_name, width, height, rect_width, rect_height, path1, path2, color_rect, color_path1, color_path2 FROM boards b INNER JOIN board_backgrounds bb ON b.id_background=bb.id ORDER BY b.id`);
		res.status(200).json(rows);
	} catch (err) {
		res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
	} finally {
		if (db) await db.end();
	}
});

routeGame.get('/boards/:id', async (req, res) => {
	let db;
	try {
		db = await connect();
		const [rows] = await db.query(`SELECT b.id, board_name, width, height, rect_width, rect_height, path1, path2, color_rect, color_path1, color_path2 FROM boards b INNER JOIN board_backgrounds bb ON b.id_background=bb.id WHERE b.id = ${req.params.id}`);
		res.status(200).json(rows[0] || null);
	} catch (err) {
		res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
	} finally {
		if (db) await db.end();
	}
});

routeGame.get('/tiles/:idboard', async (req, res) => {
	let db;
	try {
		db = await connect();
		const [rows] = await db.query(`SELECT t.id, id_board, num_tile, pos_x, pos_y, tile_type, rotation, radius, border_width, direction, tt.effect_name FROM tiles t INNER JOIN tile_types tt ON t.tile_type=tt.id WHERE t.id_board = ${req.params.idboard} ORDER BY num_tile`);
		res.status(200).json(rows);
	} catch (err) {
		res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
	} finally {
		if (db) await db.end();
	}
});

routeGame.get('/shortcuts/:idboard', async (req, res) => {
	let db;
	try {
		db = await connect();
		const [rows] = await db.query(`SELECT id, id_board, from_tile, to_tile FROM shortcuts WHERE id_board = ${req.params.idboard}`);
		res.status(200).json(rows);
	} catch (err) {
		res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
	} finally {
		if (db) await db.end();
	}
});



function checkToken(req, res, next) {
	const token = req.headers['authorization'];
	if (typeof token === 'undefined')
		res.sendStatus(403)
	else {
		const tokenData = jwt.verify(token, process.env.SECRET, (err, data) => {
			if (err)
				res.sendStatus(403);
			else
				req.idUser = data.idUser
		})
		next();
	}
}

export { routeGame, checkToken }
