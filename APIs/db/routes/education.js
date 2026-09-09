import { Router } from "express";
import { connect } from './../db.js'
import { checkToken } from "./gameboard.js";

const routeEdu = Router();

routeEdu.get('/knowledge_areas', checkToken, async (req, res) => {
   let db;
   try {
      db = await connect();
      const [rows] = await db.query(`SELECT id, description, details FROM edu_knowledge_areas ORDER BY id`);
      res.status(200).json(rows);
   } catch (err) {
      res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
   } finally {
      if (db) await db.end();
   }
});

routeEdu.get('/disciplines', checkToken, async (req, res) => {
   let db;
   try {
      db = await connect();
      const [rows] = await db.query(`SELECT id, id_knowledge_area, description, details FROM edu_disciplines ORDER BY id_knowledge_area, id`);
      res.status(200).json(rows);
   } catch (err) {
      res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
   } finally {
      if (db) await db.end();
   }
});

routeEdu.get('/levels', checkToken, async (req, res) => {
   let db;
   try {
      db = await connect();
      const [rows] = await db.query(`SELECT id, description FROM edu_levels ORDER BY id`);
      res.status(200).json(rows);
   } catch (err) {
      res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
   } finally {
      if (db) await db.end();
   }
});

routeEdu.get('/topics', checkToken, async (req, res) => {
   let db;
   try {
      db = await connect();
      const [rows] = await db.query(`SELECT id, id_discipline, id_level, description, details FROM edu_topics ORDER BY id_discipline, id`);
      res.status(200).json(rows);
   } catch (err) {
      res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
   } finally {
      if (db) await db.end();
   }
});

routeEdu.post('/topics', checkToken, async (req, res) => {
   let db;
   try {
      db = await connect();
      const { id_discipline, id_level, description, details } = req.body;
      const [rows] = await db.query(`INSERT INTO edu_topics (id_discipline, id_level, description, details, created_by) VALUES (${id_discipline}, ${id_level}, '${description}', '${details}', ${req.idUser})`);
      res.status(200).json({ message: "Topic added successfully", insertId: rows.insertId });
   } catch (err) {
      res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
   } finally {
      if (db) await db.end();
   }
});

routeEdu.get('/subtopics', checkToken, async (req, res) => {
   let db;
   try {
      db = await connect();
      const [rows] = await db.query(`SELECT id, id_topic, description, details FROM edu_subtopics ORDER BY id_topic, id`);
      res.status(200).json(rows);
   } catch (err) {
      res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
   } finally {
      if (db) await db.end();
   }
});

routeEdu.post('/subtopics', checkToken, async (req, res) => {
   let db;
   try {
      db = await connect();
      const { id_topic, description, details } = req.body;
      const [rows] = await db.query(`INSERT INTO edu_subtopics (id_topic, description, details, created_by) VALUES (${id_topic}, '${description}', '${details}', ${req.idUser})`);
      res.status(200).json({ message: "Subtopic added successfully", insertId: rows.insertId });
   } catch (err) {
      res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
   } finally {
      if (db) await db.end();
   }
});


routeEdu.get('/custom-subtopics', checkToken, async (req, res) => {
   let db;
   try {
      db = await connect();
      const fields = 'group_name, creator_fullname, creator_email, creator_username, id_subtopic, knowledge_area, knowledge_area_detail, color, discipline, discipline_detail, level, topic, topic_detail, subtopic, subtopic_detail';
      const [rows] = await db.query(`SELECT DISTINCT ${fields} FROM vw_custom_subtopics WHERE id_user_participant=${req.idUser} OR id_user_owner=${req.idUser}`);
      res.status(200).json(rows);
   } catch (err) {
      res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
   } finally {
      if (db) await db.end();
   }
});

routeEdu.get('/custom-subtopics/:idsubtopic/:idUser', async (req, res) => {
   let db;
   try {
      const { idsubtopic, idUser } = req.params;
      db = await connect();
      const fields = 'group_name, creator_fullname, creator_email, creator_username, id_subtopic, knowledge_area, knowledge_area_detail, color, discipline, discipline_detail, level, topic, topic_detail, subtopic, subtopic_detail';
      const query = `SELECT DISTINCT ${fields} FROM vw_custom_subtopics WHERE id_subtopic=${idsubtopic} AND (id_user_participant=${idUser} OR id_user_owner=${idUser})`
      const [rows] = await db.query(query);
      res.status(200).json(rows);
   } catch (err) {
      res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
   } finally {
      if (db) await db.end();
   }
});



routeEdu.get('/info-and-questions', checkToken, async (req, res) => {
   let db;
   try {
      db = await connect();
      const [rows] = await db.query(`SELECT id, id_subtopic, information, question, answer_1, answer_2, answer_3, answer_4, answer_ok, is_true_or_false, created_by FROM edu_info_and_questions`);
      res.status(200).json(rows);
   } catch (err) {
      res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
   } finally {
      if (db) await db.end();
   }
});

routeEdu.get('/info-and-questions/:idsubtopic', async (req, res) => {
   let db;
   try {
      db = await connect();
      const [rows] = await db.query(`SELECT id, id_subtopic, information, question, answer_1, answer_2, answer_3, answer_4, answer_ok, is_true_or_false, created_by FROM edu_info_and_questions WHERE id_subtopic=${req.params.idsubtopic}`);
      res.status(200).json(rows);
   } catch (err) {
      res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
   } finally {
      if (db) await db.end();
   }
});

routeEdu.post('/info-and-questions', checkToken, async (req, res) => {
   let db;
   try {
      db = await connect();
      const { id_subtopic, information, question, answer_1, answer_2, answer_3, answer_4, answer_ok } = req.body;
      //let query = `CALL SP_ADD_EDUCATION_DATA('${generation}', '${theme}', '${information}', '${question}', '${answer_1}', '${answer_2}', '${answer_3}', '${answer_4}', ${answer_ok}, ${id})`;
      const query = `INSERT INTO edu_info_and_questions (id_subtopic, information, question, answer_1, answer_2, answer_3, answer_4, answer_ok, created_by) 
                  VALUES (${id_subtopic}, '${information}', '${question}', '${answer_1}', '${answer_2}', '${answer_3}', '${answer_4}', ${answer_ok}, ${req.idUser})`;
      const [result] = await db.execute(query);
      res.status(200).json({ message: 'Datos educativos agregados correctamente', id: result.insertId })
   } catch (err) {
      //console.log(err)
      return res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" })
   } finally {
      if (db) await db.end();
   }

});

routeEdu.put('/info-and-questions', checkToken, async (req, res) => {
   let db;
   try {
      db = await connect();
      const { id, id_subtopic, information, question, answer_1, answer_2, answer_3, answer_4, answer_ok } = req.body;
      //let query = `CALL SP_EDIT_EDUCATION_DATA(${id}, ${generation}, '${theme}', '${information}', '${question}', '${answer_1}', '${answer_2}', '${answer_3}', '${answer_4}', ${answer_ok})`;
      const query = `UPDATE edu_info_and_questions SET id_subtopic=${id_subtopic}, information='${information}', question='${question}', answer_1='${answer_1}', answer_2='${answer_2}', answer_3='${answer_3}', answer_4='${answer_4}', answer_ok=${answer_ok} WHERE id=${id}`;
      const [result] = await db.execute(query);
      res.status(200).json({ message: 'Datos educativos modificados correctamente' })
   } catch (err) {
      //console.log(err)
      return res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" })
   } finally {
      if (db) await db.end();
   }
});

routeEdu.delete('/info-and-questions/:id', checkToken, async (req, res) => {
   let db;
   try {
      db = await connect();
      const query = `DELETE FROM edu_info_and_questions WHERE id = ${req.params.id}`;
      const [result] = await db.execute(query);
      res.status(200).json({ message: 'Datos educativos eliminados correctamente' })
   } catch (err) {
      //console.log(err)
      return res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" })
   } finally {
      if (db) await db.end();
   }
});


export { routeEdu }