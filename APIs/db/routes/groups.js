import { Router } from "express";
import { connect } from "../db.js";
import { checkToken } from "./gameboard.js";

const routeGroups = Router();

function parseIds(value, fieldName) {
   if (!Array.isArray(value)) {
      const error = new Error(`${fieldName} debe ser una lista`);
      error.status = 400;
      throw error;
   }

   const ids = [...new Set(value.map(Number))];
   if (ids.some((id) => !Number.isSafeInteger(id) || id <= 0)) {
      const error = new Error(`${fieldName} contiene identificadores inválidos`);
      error.status = 400;
      throw error;
   }
   return ids;
}

function parsePositiveId(value, fieldName) {
   const id = Number(value);
   if (!Number.isSafeInteger(id) || id <= 0) {
      const error = new Error(`${fieldName} inválido`);
      error.status = 400;
      throw error;
   }
   return id;
}

function validateTitle(value) {
   const title = typeof value === "string" ? value.trim() : "";
   if (!title || title.length > 100) {
      const error = new Error("El nombre del grupo es obligatorio y debe tener máximo 100 caracteres");
      error.status = 400;
      throw error;
   }
   return title;
}

async function validateReferences(db, ownerId, participantIds, subtopicIds) {
   if (participantIds.length) {
      const placeholders = participantIds.map(() => "?").join(", ");
      const [users] = await db.execute(
         `SELECT id FROM users WHERE id IN (${placeholders})`,
         participantIds
      );
      if (users.length !== participantIds.length) {
         const error = new Error("Uno o más integrantes no existen en users");
         error.status = 400;
         throw error;
      }
   }

   if (subtopicIds.length) {
      const placeholders = subtopicIds.map(() => "?").join(", ");
      const [subtopics] = await db.execute(
         `SELECT id FROM edu_subtopics WHERE id IN (${placeholders}) AND (created_by = ? OR created_by = 1)`,
         [...subtopicIds, ownerId]
      );
      if (subtopics.length !== subtopicIds.length) {
         const error = new Error("Uno o más subtemas no existen o no están disponibles para este usuario");
         error.status = 400;
         throw error;
      }
   }
}

async function insertRelations(db, groupId, participantIds, subtopicIds) {
   if (participantIds.length) {
      const values = participantIds.map(() => "(?, ?)").join(", ");
      await db.execute(
         `INSERT INTO edu_students_groups_participants (id_student_group, id_user_participant) VALUES ${values}`,
         participantIds.flatMap((id) => [groupId, id])
      );
   }

   if (subtopicIds.length) {
      const values = subtopicIds.map(() => "(?, ?)").join(", ");
      await db.execute(
         `INSERT INTO edu_students_groups_subtopics (id_student_group, id_subtopic) VALUES ${values}`,
         subtopicIds.flatMap((id) => [groupId, id])
      );
   }
}

routeGroups.get("/", checkToken, async (req, res) => {
   let db;
   try {
      db = await connect();
      const [groups] = await db.execute(
         "SELECT id, title, updated_at FROM edu_students_groups WHERE id_user_owner = ? ORDER BY title, id",
         [req.idUser]
      );

      if (groups.length === 0) return res.status(200).json([]);

      const groupIds = groups.map((group) => group.id);
      const placeholders = groupIds.map(() => "?").join(", ");
      const [participants] = await db.execute(
         `SELECT p.id_student_group AS group_id, u.id, u.username, u.first_name, u.last_name, u.email
          FROM edu_students_groups_participants p
          INNER JOIN users u ON u.id = p.id_user_participant
          WHERE p.id_student_group IN (${placeholders})
          ORDER BY u.username, u.email`,
         groupIds
      );
      const [subtopics] = await db.execute(
         `SELECT gs.id_student_group AS group_id, s.id, s.id_topic, s.description,
                 t.description AS topic, d.description AS discipline
          FROM edu_students_groups_subtopics gs
            INNER JOIN edu_subtopics s ON s.id = gs.id_subtopic
            INNER JOIN edu_topics t ON t.id = s.id_topic
            INNER JOIN edu_disciplines d ON d.id = t.id_discipline
          WHERE gs.id_student_group IN (${placeholders})
          ORDER BY d.description, t.description, s.description`,
         groupIds
      );

      const result = groups.map((group) => ({
         ...group,
         participants: participants
            .filter((participant) => participant.group_id === group.id)
            .map(({ group_id, ...participant }) => participant),
         subtopics: subtopics
            .filter((subtopic) => subtopic.group_id === group.id)
            .map(({ group_id, ...subtopic }) => subtopic),
      }));
      res.status(200).json(result);
   } catch (err) {
      res.status(err.status || 500).json({ message: err.status ? err.message : (db ? err.sqlMessage : "DB connection issue") });
   } finally {
      if (db) await db.end();
   }
});

routeGroups.get("/users", checkToken, async (req, res) => {
   let db;
   try {
      const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
      if (search.length < 2) return res.status(200).json([]);

      db = await connect();
      const term = `%${search}%`;
      const [rows] = await db.execute(
         `SELECT id, username, first_name, last_name, email
          FROM users
          WHERE username LIKE ? OR email LIKE ?
          ORDER BY username, email
          LIMIT 20`,
         [term, term]
      );
      res.status(200).json(rows);
   } catch (err) {
      res.status(500).json({ message: db ? err.sqlMessage : "DB connection issue" });
   } finally {
      if (db) await db.end();
   }
});

routeGroups.delete("/:id", checkToken, async (req, res) => {
   let db;
   let transactionStarted = false;
   try {
      const groupId = parsePositiveId(req.params.id, "Identificador de grupo");
      db = await connect();
      await db.beginTransaction();
      transactionStarted = true;

      const [groups] = await db.execute(
         "SELECT id FROM edu_students_groups WHERE id = ? AND id_user_owner = ? FOR UPDATE",
         [groupId, req.idUser]
      );
      if (groups.length === 0) {
         await db.rollback();
         transactionStarted = false;
         return res.status(404).json({ message: "No se encontró el grupo" });
      }

      const [[participantCount]] = await db.execute(
         "SELECT COUNT(*) AS total FROM edu_students_groups_participants WHERE id_student_group = ?",
         [groupId]
      );
      const [[subtopicCount]] = await db.execute(
         "SELECT COUNT(*) AS total FROM edu_students_groups_subtopics WHERE id_student_group = ?",
         [groupId]
      );
      if (Number(participantCount.total) > 0 || Number(subtopicCount.total) > 0) {
         await db.rollback();
         transactionStarted = false;
         return res.status(409).json({ message: "Solo se pueden eliminar grupos vacíos" });
      }

      await db.execute(
         "DELETE FROM edu_students_groups WHERE id = ? AND id_user_owner = ?",
         [groupId, req.idUser]
      );
      await db.commit();
      transactionStarted = false;
      res.status(200).json({ message: "Grupo eliminado correctamente" });
   } catch (err) {
      if (db && transactionStarted) {
         try { await db.rollback(); } catch { /* preserve the original error */ }
      }
      res.status(err.status || 500).json({ message: err.status ? err.message : (db ? (err.sqlMessage || err.message) : "DB connection issue") });
   } finally {
      if (db) await db.end();
   }
});

routeGroups.delete("/:id/participants/:participantId", checkToken, async (req, res) => {
   let db;
   let transactionStarted = false;
   try {
      const groupId = parsePositiveId(req.params.id, "Identificador de grupo");
      const participantId = parsePositiveId(req.params.participantId, "Identificador de integrante");
      db = await connect();
      await db.beginTransaction();
      transactionStarted = true;

      const [groups] = await db.execute(
         "SELECT id FROM edu_students_groups WHERE id = ? AND id_user_owner = ? FOR UPDATE",
         [groupId, req.idUser]
      );
      if (groups.length === 0) {
         await db.rollback();
         transactionStarted = false;
         return res.status(404).json({ message: "No se encontró el grupo" });
      }

      const [result] = await db.execute(
         "DELETE FROM edu_students_groups_participants WHERE id_student_group = ? AND id_user_participant = ?",
         [groupId, participantId]
      );
      if (result.affectedRows === 0) {
         await db.rollback();
         transactionStarted = false;
         return res.status(404).json({ message: "El integrante no pertenece al grupo" });
      }

      await db.commit();
      transactionStarted = false;
      res.status(200).json({ message: "Integrante quitado del grupo" });
   } catch (err) {
      if (db && transactionStarted) {
         try { await db.rollback(); } catch { /* preserve the original error */ }
      }
      res.status(err.status || 500).json({ message: err.status ? err.message : (db ? (err.sqlMessage || err.message) : "DB connection issue") });
   } finally {
      if (db) await db.end();
   }
});

routeGroups.delete("/:id/subtopics/:subtopicId", checkToken, async (req, res) => {
   let db;
   let transactionStarted = false;
   try {
      const groupId = parsePositiveId(req.params.id, "Identificador de grupo");
      const subtopicId = parsePositiveId(req.params.subtopicId, "Identificador de subtema");
      db = await connect();
      await db.beginTransaction();
      transactionStarted = true;

      const [groups] = await db.execute(
         "SELECT id FROM edu_students_groups WHERE id = ? AND id_user_owner = ? FOR UPDATE",
         [groupId, req.idUser]
      );
      if (groups.length === 0) {
         await db.rollback();
         transactionStarted = false;
         return res.status(404).json({ message: "No se encontró el grupo" });
      }

      const [result] = await db.execute(
         "DELETE FROM edu_students_groups_subtopics WHERE id_student_group = ? AND id_subtopic = ?",
         [groupId, subtopicId]
      );
      if (result.affectedRows === 0) {
         await db.rollback();
         transactionStarted = false;
         return res.status(404).json({ message: "El subtema no pertenece al grupo" });
      }

      await db.commit();
      transactionStarted = false;
      res.status(200).json({ message: "Subtema quitado del grupo" });
   } catch (err) {
      if (db && transactionStarted) {
         try { await db.rollback(); } catch { /* preserve the original error */ }
      }
      res.status(err.status || 500).json({ message: err.status ? err.message : (db ? (err.sqlMessage || err.message) : "DB connection issue") });
   } finally {
      if (db) await db.end();
   }
});

routeGroups.post("/:id/participants", checkToken, async (req, res) => {
   let db;
   let transactionStarted = false;
   try {
      const groupId = parsePositiveId(req.params.id, "Identificador de grupo");
      const participantId = parsePositiveId(req.body?.participantId, "Identificador de integrante");

      db = await connect();
      await db.beginTransaction();
      transactionStarted = true;

      const [groups] = await db.execute(
         "SELECT id FROM edu_students_groups WHERE id = ? AND id_user_owner = ? FOR UPDATE",
         [groupId, req.idUser]
      );
      if (groups.length === 0) {
         await db.rollback();
         transactionStarted = false;
         return res.status(404).json({ message: "No se encontró el grupo" });
      }

      const [users] = await db.execute("SELECT id FROM users WHERE id = ?", [participantId]);
      if (users.length === 0) {
         const error = new Error("El integrante no existe en users");
         error.status = 400;
         throw error;
      }

      const [existing] = await db.execute(
         "SELECT id FROM edu_students_groups_participants WHERE id_student_group = ? AND id_user_participant = ? LIMIT 1",
         [groupId, participantId]
      );
      if (existing.length > 0) {
         await db.commit();
         transactionStarted = false;
         return res.status(200).json({ alreadyMember: true, message: "El usuario ya pertenece al grupo" });
      }

      await db.execute(
         "INSERT INTO edu_students_groups_participants (id_student_group, id_user_participant) VALUES (?, ?)",
         [groupId, participantId]
      );
      await db.commit();
      transactionStarted = false;
      res.status(201).json({ alreadyMember: false, message: "Integrante agregado correctamente" });
   } catch (err) {
      if (db && transactionStarted) {
         try { await db.rollback(); } catch { /* preserve the original error */ }
      }
      res.status(err.status || 500).json({ message: err.status ? err.message : (db ? (err.sqlMessage || err.message) : "DB connection issue") });
   } finally {
      if (db) await db.end();
   }
});

routeGroups.post("/:id/subtopics", checkToken, async (req, res) => {
   let db;
   let transactionStarted = false;
   try {
      const groupId = parsePositiveId(req.params.id, "Identificador de grupo");
      const subtopicId = parsePositiveId(req.body?.subtopicId, "Identificador de subtema");

      db = await connect();
      await db.beginTransaction();
      transactionStarted = true;

      const [groups] = await db.execute(
         "SELECT id FROM edu_students_groups WHERE id = ? AND id_user_owner = ? FOR UPDATE",
         [groupId, req.idUser]
      );
      if (groups.length === 0) {
         await db.rollback();
         transactionStarted = false;
         return res.status(404).json({ message: "No se encontró el grupo" });
      }

      const [subtopics] = await db.execute(
         "SELECT id FROM edu_subtopics WHERE id = ? AND (created_by = ? OR created_by = 1)",
         [subtopicId, req.idUser]
      );
      if (subtopics.length === 0) {
         const error = new Error("El subtema no existe o no está disponible para este usuario");
         error.status = 400;
         throw error;
      }

      const [existing] = await db.execute(
         "SELECT id FROM edu_students_groups_subtopics WHERE id_student_group = ? AND id_subtopic = ? LIMIT 1",
         [groupId, subtopicId]
      );
      if (existing.length > 0) {
         await db.commit();
         transactionStarted = false;
         return res.status(200).json({ alreadyAssigned: true, message: "El subtema ya pertenece al grupo" });
      }

      await db.execute(
         "INSERT INTO edu_students_groups_subtopics (id_student_group, id_subtopic) VALUES (?, ?)",
         [groupId, subtopicId]
      );
      await db.commit();
      transactionStarted = false;
      res.status(201).json({ alreadyAssigned: false, message: "Subtema agregado correctamente" });
   } catch (err) {
      if (db && transactionStarted) {
         try { await db.rollback(); } catch { /* preserve the original error */ }
      }
      res.status(err.status || 500).json({ message: err.status ? err.message : (db ? (err.sqlMessage || err.message) : "DB connection issue") });
   } finally {
      if (db) await db.end();
   }
});

routeGroups.post("/", checkToken, async (req, res) => {
   let db;
   let transactionStarted = false;
   try {
      const title = validateTitle(req.body?.title);
      const participantIds = parseIds(req.body?.participantIds ?? [], "participantIds");
      const subtopicIds = parseIds(req.body?.subtopicIds ?? [], "subtopicIds");

      db = await connect();
      await db.beginTransaction();
      transactionStarted = true;
      await validateReferences(db, req.idUser, participantIds, subtopicIds);
      const [result] = await db.execute(
         "INSERT INTO edu_students_groups (id_user_owner, title) VALUES (?, ?)",
         [req.idUser, title]
      );
      await insertRelations(db, result.insertId, participantIds, subtopicIds);
      await db.commit();
      transactionStarted = false;
      res.status(201).json({ id: result.insertId, message: "Grupo creado correctamente" });
   } catch (err) {
      if (db && transactionStarted) {
         try { await db.rollback(); } catch { /* preserve the original error */ }
      }
      res.status(err.status || 500).json({ message: err.status ? err.message : (db ? (err.sqlMessage || err.message) : "DB connection issue") });
   } finally {
      if (db) await db.end();
   }
});

routeGroups.put("/:id", checkToken, async (req, res) => {
   let db;
   let transactionStarted = false;
   try {
      const id = Number(req.params.id);
      if (!Number.isSafeInteger(id) || id <= 0) {
         return res.status(400).json({ message: "Identificador de grupo inválido" });
      }
      const title = validateTitle(req.body?.title);
      db = await connect();
      await db.beginTransaction();
      transactionStarted = true;
      const [groups] = await db.execute(
         "SELECT id FROM edu_students_groups WHERE id = ? AND id_user_owner = ? FOR UPDATE",
         [id, req.idUser]
      );
      if (groups.length === 0) {
         await db.rollback();
         transactionStarted = false;
         return res.status(404).json({ message: "No se encontró el grupo" });
      }

      await db.execute("UPDATE edu_students_groups SET title = ? WHERE id = ?", [title, id]);
      await db.commit();
      transactionStarted = false;
      res.status(200).json({ id, message: "Grupo actualizado correctamente" });
   } catch (err) {
      if (db && transactionStarted) {
         try { await db.rollback(); } catch { /* preserve the original error */ }
      }
      res.status(err.status || 500).json({ message: err.status ? err.message : (db ? (err.sqlMessage || err.message) : "DB connection issue") });
   } finally {
      if (db) await db.end();
   }
});

export { routeGroups };
