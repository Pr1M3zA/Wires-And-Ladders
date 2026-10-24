import { Router } from "express";
import { connect } from './../db.js'
import { checkToken } from "./gameboard.js";

const routeEdu = Router();

routeEdu.get('/knowledge_area/:id', checkToken, async (req, res) => {
   let db;
   try {
      const { id } = req.params;
      db = await connect();
      const [rows] = await db.query(`SELECT id, description, details, color, material_design_icon FROM edu_knowledge_areas WHERE id = ${id}`);
      res.status(200).json(rows);
   } catch (err) {
      res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
   } finally {
      if (db) await db.end();
   }
});

routeEdu.get('/knowledge_areas', checkToken, async (req, res) => {
   let db;
   try {
      db = await connect();
      const [rows] = await db.query(`SELECT id, description, details, color, material_design_icon FROM edu_knowledge_areas ORDER BY id`);
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

routeEdu.get('/discipline/:id', checkToken, async (req, res) => {
   let db;
   try {
      const { id } = req.params;
      db = await connect();
      const [rows] = await db.query(`SELECT id, id_knowledge_area, description, details, color, knowledge_area, tot_topics FROM vw_disciplines_resumen WHERE id = ${id}`);
      res.status(200).json(rows);
   } catch (err) {
      res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
   } finally {
      if (db) await db.end();
   }
});


routeEdu.get('/disciplines/:idka', checkToken, async (req, res) => {
   let db;
   try {
      const { idka } = req.params;
      db = await connect();
      const [rows] = await db.query(`SELECT id, id_knowledge_area, description, details, color, knowledge_area, tot_topics FROM vw_disciplines_resumen WHERE id_knowledge_area = ${idka}`);
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

routeEdu.get('/topics/:id', checkToken, async (req, res) => {
   let db;
   try {
      const { id } = req.params;
      db = await connect();
      const [rows] = await db.query(`SELECT knowledge_area, discipline, color, id, id_knowledge_area, id_discipline, id_level, description, details, created_by FROM vw_topics_resumen WHERE id = ${id}`);
      res.status(200).json(rows);
   }
   catch (err) {
      res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
   } finally {
      if (db) await db.end();
   }
});

routeEdu.get('/topics/:iddiscipline/:idlevel', checkToken, async (req, res) => {
   let db;
   try {
      const { iddiscipline, idlevel } = req.params;
      db = await connect();
      const [rows] = await db.query(`SELECT knowledge_area, discipline, color, id, id_knowledge_area, id_discipline, id_level, description, details, created_by FROM vw_topics_resumen WHERE (created_by = ${req.idUser} OR created_by = 1) AND id_discipline = ${iddiscipline} AND id_level = ${idlevel}`);
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
      const [rows] = await db.query(
         "INSERT INTO edu_topics (id_discipline, id_level, description, details, created_by) VALUES (?, ?, ?, ?, ?)",
         [id_discipline, id_level, description, details, req.idUser]
      );
      res.status(200).json({ message: "Topic added successfully", insertId: rows.insertId });
   } catch (err) {
      res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
   } finally {
      if (db) await db.end();
   }
});

routeEdu.put('/topics', checkToken, async (req, res) => {
   let db;
   try {
      db = await connect();
      const { id, id_level, description, details } = req.body;
      const [rows] = await db.query(
         "UPDATE edu_topics SET id_level=?, description=?, details=? WHERE id=?",
         [id_level, description, details, id]
      );
      res.status(200).json({ message: "Topic updated successfully" });
   }
   catch (err) {
      res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
   } finally {
      if (db) await db.end();
   }
});

routeEdu.delete('/topics/:id', checkToken, async (req, res) => {
   let db;
   try {
      db = await connect();
      const { id } = req.params;
      const [rows] = await db.query(`DELETE FROM edu_topics WHERE id=${id}`);
      res.status(200).json({ message: "Topic deleted successfully" });
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

routeEdu.get('/subtopics/:idTopic', checkToken, async (req, res) => {
   let db;
   try {
      db = await connect();
      const { idTopic } = req.params;
      const [rows] = await db.query(`SELECT id, id_discipline, id_topic, description, details, created_by, tot_questions, knowledge_area, discipline, topic, color FROM vw_subtopics_resumen WHERE (created_by=${req.idUser} OR created_by=1) AND (id_topic = ${idTopic} OR ${idTopic} = 0) ORDER BY id`);
      res.status(200).json(rows);
   } catch (err) {
      res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
   } finally {
      if (db) await db.end();
   }
});

routeEdu.get('/subtopic/:id', checkToken, async (req, res) => {
   let db;
   try {
      db = await connect();
      const { id } = req.params;
      const [rows] = await db.query(`SELECT id, id_discipline, id_knowledge_area, id_topic, description, details, created_by, tot_questions, knowledge_area, discipline, topic, color FROM vw_subtopics_resumen WHERE id = ${id}`);
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
      const [rows] = await db.query(
         "INSERT INTO edu_subtopics (id_topic, description, details, created_by) VALUES (?, ?, ?, ?)",
         [id_topic, description, details, req.idUser]
      );
      res.status(200).json({ message: "Subtopic added successfully", insertId: rows.insertId });
   } catch (err) {
      res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
   } finally {
      if (db) await db.end();
   }
});

routeEdu.put('/subtopics', checkToken, async (req, res) => {
   let db;
   try {
      db = await connect();
      const { id, id_topic, description, details } = req.body;
      const [rows] = await db.query(
         "UPDATE edu_subtopics SET description=?, details=? WHERE id=?",
         [description, details, id]
      );
      res.status(200).json({ message: "Subtopic updated successfully" });
   } catch (err) {
      res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
   } finally {
      if (db) await db.end();
   }
});

routeEdu.delete('/subtopics/:id', checkToken, async (req, res) => {
   let db;
   try {
      db = await connect();
      const { id } = req.params;
      const [rows] = await db.query(
         "DELETE FROM edu_subtopics WHERE id=?",
         [id]
      );
      res.status(200).json({ message: "Subtopic deleted successfully" });
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

routeEdu.get('/info-and-questions-full/:idsubtopic', checkToken, async (req, res) => {
   let db;
   try {
      db = await connect();
      const [rows] = await db.query(`SELECT id, id_subtopic, id_discipline, id_knowledge_area, id_topic, information, question, answer_1, answer_2, answer_3, answer_4, answer_ok, is_true_or_false, created_by, knowledge_area, discipline, topic, subtopic, color FROM vw_info_question_fulldetails WHERE id_subtopic=${req.params.idsubtopic} AND (created_by=${req.idUser} OR created_by=1)`);
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
      const [result] = await db.execute(
         "INSERT INTO edu_info_and_questions (id_subtopic, information, question, answer_1, answer_2, answer_3, answer_4, answer_ok, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
         [id_subtopic, information, question, answer_1, answer_2, answer_3, answer_4, answer_ok, req.idUser]
      );
      res.status(200).json({ message: 'Datos educativos agregados correctamente', id: result.insertId })
   } catch (err) {
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
      const [result] = await db.execute(
         "UPDATE edu_info_and_questions SET id_subtopic=?, information=?, question=?, answer_1=?, answer_2=?, answer_3=?, answer_4=?, answer_ok=? WHERE id=?",
         [id_subtopic, information, question, answer_1, answer_2, answer_3, answer_4, answer_ok, id]
      );
      res.status(200).json({ message: 'Datos educativos modificados correctamente' })
   } catch (err) {
      return res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" })
   } finally {
      if (db) await db.end();
   }
});

routeEdu.delete('/info-and-questions/:id', checkToken, async (req, res) => {
   let db;
   try {
      db = await connect();
      const [result] = await db.execute(
         "DELETE FROM edu_info_and_questions WHERE id = ?",
         [req.params.id]
      );
      res.status(200).json({ message: 'Datos educativos eliminados correctamente' })
   } catch (err) {
      return res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" })
   } finally {
      if (db) await db.end();
   }
});


export { routeEdu }