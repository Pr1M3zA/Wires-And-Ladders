import Toast from 'react-native-toast-message';
import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as offline from '@/utils/offline.json';
import * as education from '@/utils/education.json';
import type { LastUpdate, BoardBackgroundType, DbBoardType, BoardType, TileType, DiceType, EducationType, EffectType, ShortCutType, EduKnowledgeAreaType, EduDsciplinesType, EduLevels, EduInfoQuestionsType, CustomSubtopicType } from '@/utils/types';

const DB_NAME = 'wlDbOffline.db';
const DB_INITIALIZED_KEY = 'LOCAL_DB_INITIALIZED';

/*-----------------------------
   CREACION DE TABLAS LOCALES
------------------------------*/
const DbCreateTables = async (db: SQLite.SQLiteDatabase) => {
   await db.execAsync(`PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS board_backgrounds (
         id INTEGER PRIMARY KEY NOT NULL,
         background_name VARCHAR(30) NOT NULL,
         rect_width SMALLINT NOT NULL,
         rect_height SMALLINT NOT NULL,
         path1 TEXT,
         path2 TEXT,
         color_rect VARCHAR(30) NOT NULL,
         color_path1 VARCHAR(30),
         color_path2 VARCHAR(30)
      );

      CREATE TABLE IF NOT EXISTS boards (
         id SMALLINT NOT NULL PRIMARY KEY,
         board_name VARCHAR(30) NOT NULL UNIQUE,
         board_description TEXT,
         id_background SMALLINT NOT NULL,
         width SMALLINT NOT NULL DEFAULT 0,
         height SMALLINT NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS tile_types_groups (
         id INTEGER PRIMARY KEY NOT NULL,
         group_name VARCHAR(50)
      );

      CREATE TABLE IF NOT EXISTS tile_types (
         id INTEGER NOT NULL PRIMARY KEY,
         id_tile_type_group INT NOT NULL,
         id_effect TINYINT NOT NULL,
         effect_name  VARCHAR(15) NOT NULL,
         color_fill VARCHAR(30) NOT NULL,
         color_border VARCHAR(30) NOT NULL,
         color_path1 VARCHAR(30) NOT NULL,
         color_path2 VARCHAR(30) NOT NULL,
         path1 TEXT NOT NULL,
         path2 TEXT NOT NULL,
         paths_x SMALLINT NOT NULL,
         paths_y SMALLINT NOT NULL,
         paths_scale DECIMAL(3,1) NOT NULL DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS tiles (
         id SMALLINT NOT NULL PRIMARY KEY,
         id_board SMALLINT NOT NULL,
         num_tile SMALLINT NOT NULL,
         pos_x SMALLINT  NOT NULL,
         pos_y SMALLINT NOT NULL,
         tile_type INT NOT NULL,
         rotation SMALLINT NOT NULL,
         radius TINYINT NOT NULL,
         border_width TINYINT NOT NULL,
         direction SMALLINT NOT NULL DEFAULT 0
      ); 

      CREATE TABLE IF NOT EXISTS shortcuts (
         id INTEGER NOT NULL PRIMARY KEY,
         id_board SMALLINT NOT NULL,
         from_tile SMALLINT NOT NULL,
         to_tile SMALLINT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS dices (
         id SMALLINT NOT NULL PRIMARY KEY,
         dice_name VARCHAR(30) NOT NULL UNIQUE,
         color_faceup VARCHAR(30) NOT NULL,
         color_faceleft VARCHAR(30) NOT NULL,
         color_faceright VARCHAR(30) NOT NULL,
         color_dots VARCHAR(30) NOT NULL,
         color_border VARCHAR(30) NOT NULL,
         border_width TINYINT NOT NULL,
         scale TINYINT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS edu_knowledge_areas (
         id INTEGER NOT NULL PRIMARY KEY,
         description VARCHAR(100),
         details VARCHAR(255),
         color VARCHAR(30)
      );

      CREATE TABLE IF NOT EXISTS edu_disciplines (
         id INTEGER NOT NULL PRIMARY KEY,
         id_knowledge_area TINYINT,
         description VARCHAR(100),
         details VARCHAR(255)
      );

      CREATE TABLE IF NOT EXISTS edu_levels (
         id INTEGER NOT NULL PRIMARY KEY,
         description VARCHAR(100)
      );

      CREATE TABLE IF NOT EXISTS edu_topics (
         id INTEGER NOT NULL PRIMARY KEY,
         id_discipline INT NOT NULL,
         id_level TINYINT NOT NULL,
         description VARCHAR(100),
         details VARCHAR(255)
      );

      CREATE TABLE IF NOT EXISTS edu_subtopics (
         id INTEGER NOT NULL PRIMARY KEY,
         id_topic INT NOT NULL,
         description VARCHAR(100),
         details VARCHAR(255)
      );

      CREATE TABLE IF NOT EXISTS edu_info_and_questions (
         id INTEGER NOT NULL PRIMARY KEY,
         id_subtopic INT NOT NULL,
         information VARCHAR(150),
         question VARCHAR(150),
         answer_1 VARCHAR(50),
         answer_2 VARCHAR(50),
         answer_3 VARCHAR(50),
         answer_4 VARCHAR(50),
         answer_ok TINYINT,
         is_true_or_false TINYINT NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS profanity_words (
         word VARCHAR(30) NOT NULL UNIQUE
      );
      `
   )
      .catch(error => {
         Toast.show({ type: 'error', text1: 'Error (create local tables)', text2: error.message })
      });
}

/*-----------------------------
   BORRADO DE TABLAS LOCALES
------------------------------*/
const DbDropTables = async (db: SQLite.SQLiteDatabase) => {
   await db.execAsync(`
      PRAGMA journal_mode = WAL;
      DROP TABLE IF EXISTS board_backgrounds;
      DROP TABLE IF EXISTS boards;
      DROP TABLE IF EXISTS tile_types;
      DROP TABLE IF EXISTS tile_types_groups;
      DROP TABLE IF EXISTS tiles;
      DROP TABLE IF EXISTS shortcuts;
      DROP TABLE IF EXISTS dices;
      DROP TABLE IF EXISTS education;
      DROP TABLE IF EXISTS edu_knowledge_areas;
      DROP TABLE IF EXISTS edu_disciplines;
      DROP TABLE IF EXISTS edu_levels;
      DROP TABLE IF EXISTS edu_topics;
      DROP TABLE IF EXISTS edu_subtopics;
      DROP TABLE IF EXISTS edu_info_and_questions;
      DROP TABLE IF EXISTS profanity_words;`
   )
      .catch(error => {
         console.log(error.message)
         Toast.show({ type: 'error', text1: 'Error (drop local tables)', text2: error.message })
      });
}

/*-----------------------------
   POBLADO DE TABLAS LOCALES
------------------------------*/
const DbSeedOffline = async (db: SQLite.SQLiteDatabase) => {
   await db.withTransactionAsync(async () => {
      await db.runAsync(
         `INSERT OR REPLACE INTO tile_types_groups (id, group_name) VALUES (?, ?)`,
         [1, 'Default']
      );

      for (const bb of (offline as any).boardBackgrounds) {
         await db.runAsync(
            `INSERT OR REPLACE INTO board_backgrounds (id, background_name, rect_width, rect_height, path1, path2, color_rect, color_path1, color_path2) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [bb.id, bb.background_name, bb.rect_width, bb.rect_height, bb.path1, bb.path2, bb.color_rect, bb.color_path1, bb.color_path2]
         );
      }

      for (const tt of (offline as any).tileTypes) {
         await db.runAsync(
            `INSERT OR REPLACE INTO tile_types (id, id_tile_type_group, id_effect, effect_name, color_fill, color_border, color_path1, color_path2, path1, path2, paths_x, paths_y, paths_scale) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [tt.id, tt.id_tile_type_group, tt.id_effect, tt.effect_name, tt.color_fill, tt.color_border, tt.color_path1, tt.color_path2, tt.path1, tt.path2, tt.paths_x, tt.paths_y, parseFloat(tt.paths_scale)]
         );
      }

      for (const b of (offline as any).boards) {
         await db.runAsync(
            `INSERT OR REPLACE INTO boards (id, board_name, board_description, id_background, width, height) VALUES (?, ?, ?, ?, ?, ?)`,
            [b.id, b.board_name, b.board_description, b.id_background, b.width, b.height]
         );
      }

      for (const d of (offline as any).dices) {
         await db.runAsync(
            `INSERT OR REPLACE INTO dices (id, dice_name, color_faceup, color_faceleft, color_faceright, color_dots, color_border, border_width, scale) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [d.id, d.dice_name, d.color_faceup, d.color_faceleft, d.color_faceright, d.color_dots, d.color_border, d.border_width, d.scale]
         );
      }

      for (const t of (offline as any).tiles) {
         await db.runAsync(
            `INSERT OR REPLACE INTO tiles (id, id_board, num_tile, pos_x, pos_y, tile_type, rotation, radius, border_width, direction) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [t.id, t.id_board, t.num_tile, t.pos_x, t.pos_y, t.tile_type, t.rotation, t.radius, t.border_width, t.direction]
         );
      }

      for (const s of (offline as any).shortcuts) {
         await db.runAsync(
            `INSERT OR REPLACE INTO shortcuts (id, id_board, from_tile, to_tile) VALUES (?, ?, ?, ?)`,
            [s.id, s.id_board, s.from_tile, s.to_tile]
         );
      }

      for (const ka of (education as any).knowledgeAreas) {
         await db.runAsync(
            `INSERT OR REPLACE INTO edu_knowledge_areas (id, description, details, color) VALUES (?, ?, ?, ?)`,
            [ka.id, ka.description, ka.details, ka.color]
         );
      }

      for (const d of (education as any).disciplines) {
         await db.runAsync(
            `INSERT OR REPLACE INTO edu_disciplines (id, id_knowledge_area, description, details) VALUES (?, ?, ?, ?)`,
            [d.id, d.id_knowledge_area, d.description, d.details]
         );
      }

      for (const l of (education as any).levels) {
         await db.runAsync(
            `INSERT OR REPLACE INTO edu_levels (id, description) VALUES (?, ?)`,
            [l.id, l.description]
         );
      }

      for (const t of (education as any).topics) {
         await db.runAsync(
            `INSERT OR REPLACE INTO edu_topics (id, id_discipline, id_level, description, details) VALUES (?, ?, ?, ?, ?)`,
            [t.id, t.id_discipline, t.id_level, t.description, t.details]
         );
      }

      for (const st of (education as any).subtopics) {
         await db.runAsync(
            `INSERT OR REPLACE INTO edu_subtopics (id, id_topic, description, details) VALUES (?, ?, ?, ?)`,
            [st.id, st.id_topic, st.description, st.details]
         );
      }

      for (const q of (education as any).infoAndQuestions) {
         await db.runAsync(
            `INSERT OR REPLACE INTO edu_info_and_questions (id, id_subtopic, information, question, answer_1, answer_2, answer_3, answer_4, answer_ok, is_true_or_false) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [q.id, q.id_subtopic, q.information, q.question, q.answer_1, q.answer_2, q.answer_3, q.answer_4, q.answer_ok, q.is_true_or_false ? 1 : 0]
         );
      }
   });
}

/*-----------------------------
   INICIALIZACION DE BD LOCAL
------------------------------*/
let initPromise: Promise<void> | null = null;

const InitOfflineDb = (): Promise<void> => {
   if (initPromise) return initPromise;
   initPromise = (async () => {
      try {
         const isInitialized = await AsyncStorage.getItem(DB_INITIALIZED_KEY);
         if (isInitialized === 'true') return;

         const db = await SQLite.openDatabaseAsync(DB_NAME);
         await DbCreateTables(db);
         await DbSeedOffline(db);
         await db.closeAsync();
         await AsyncStorage.setItem(DB_INITIALIZED_KEY, 'true');
         Toast.show({ type: 'success', text1: 'BD local', text2: 'Base de datos local inicializada' });
      } catch (error: any) {
         initPromise = null;
         console.log('InitOfflineDb:', error.message);
         Toast.show({ type: 'error', text1: 'Error (init local DB)', text2: error.message });
      }
   })();
   return initPromise;
}

/*-----------------------------
   LECTURA DE TABLAS LOCALES
------------------------------*/
const loadLocalDices = async (): Promise<DiceType[]> => {
   await InitOfflineDb();
   try {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      const rows = await db.getAllAsync<any>(
         `SELECT id, dice_name, color_faceup, color_faceleft, color_faceright, color_dots, color_border, border_width, scale FROM dices ORDER BY id`
      );
      await db.closeAsync();
      return rows.map(r => ({
         id: Number(r.id),
         dice_name: r.dice_name,
         color_faceup: r.color_faceup,
         color_faceleft: r.color_faceleft,
         color_faceright: r.color_faceright,
         color_dots: r.color_dots,
         color_border: r.color_border,
         border_width: Number(r.border_width),
         scale: Number(r.scale),
      }));
   } catch (error: any) {
      console.log('loadLocalDices:', error.message);
      Toast.show({ type: 'error', text1: 'Error (load local dices)', text2: error.message });
      return [];
   }
}

const loadLocalTileTypes = async (): Promise<EffectType[]> => {
   await InitOfflineDb();
   try {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      const rows = await db.getAllAsync<any>(
         `SELECT id, id_effect, effect_name, color_fill, color_border, color_path1, color_path2, path1, path2, paths_x, paths_y, paths_scale FROM tile_types ORDER BY id`
      );
      await db.closeAsync();
      return rows.map(r => ({
         id: Number(r.id),
         id_effect: Number(r.id_effect),
         effect_name: r.effect_name,
         color_fill: r.color_fill,
         color_border: r.color_border,
         color_path1: r.color_path1,
         color_path2: r.color_path2,
         path1: r.path1,
         path2: r.path2,
         paths_x: Number(r.paths_x),
         paths_y: Number(r.paths_y),
         paths_scale: parseFloat(r.paths_scale),
      }));
   } catch (error: any) {
      console.log('loadLocalTileTypes:', error.message);
      Toast.show({ type: 'error', text1: 'Error (load local tile types)', text2: error.message });
      return [];
   }
}

const loadLocalBoard = async (idboard: number): Promise<BoardType | null> => {
   await InitOfflineDb();
   try {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      const rows = await db.getAllAsync<any>(
         `SELECT b.id, b.board_name, b.width, b.height, bb.rect_width, bb.rect_height, bb.path1, bb.path2, bb.color_rect, bb.color_path1, bb.color_path2
          FROM boards b
          INNER JOIN board_backgrounds bb ON b.id_background = bb.id
          WHERE b.id = ?
          LIMIT 1`,
         [idboard]
      );
      await db.closeAsync();
      if (rows.length === 0) return null;
      const r = rows[0];
      return {
         id: Number(r.id),
         board_name: r.board_name,
         width: Number(r.width),
         height: Number(r.height),
         rect_width: Number(r.rect_width),
         rect_height: Number(r.rect_height),
         path1: r.path1,
         path2: r.path2,
         color_rect: r.color_rect,
         color_path1: r.color_path1,
         color_path2: r.color_path2,
      };
   } catch (error: any) {
      console.log('loadLocalBoard:', error.message);
      Toast.show({ type: 'error', text1: 'Error (load local board)', text2: error.message });
      return null;
   }
}

const loadLocalTiles = async (idboard: number): Promise<TileType[]> => {
   await InitOfflineDb();
   try {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      const rows = await db.getAllAsync<any>(
         `SELECT t.id, t.id_board, t.num_tile, t.pos_x, t.pos_y, t.tile_type, t.rotation, t.radius, t.border_width, t.direction, tt.effect_name, tt.id_effect
          FROM tiles t
          INNER JOIN tile_types tt ON t.tile_type = tt.id
          WHERE t.id_board = ?
          ORDER BY t.num_tile`,
         [idboard]
      );
      await db.closeAsync();
      return rows.map(r => ({
         id: Number(r.id),
         id_board: Number(r.id_board),
         num_tile: Number(r.num_tile),
         pos_x: Number(r.pos_x),
         pos_y: Number(r.pos_y),
         tile_type: Number(r.tile_type),
         id_effect: Number(r.id_effect),
         rotation: Number(r.rotation),
         radius: Number(r.radius),
         border_width: Number(r.border_width),
         direction: Number(r.direction),
         effect_name: r.effect_name,
      }));
   } catch (error: any) {
      console.log('loadLocalTiles:', error.message);
      Toast.show({ type: 'error', text1: 'Error (load local tiles)', text2: error.message });
      return [];
   }
}

const loadLocalShortcuts = async (idboard: number): Promise<ShortCutType[]> => {
   await InitOfflineDb();
   try {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      const rows = await db.getAllAsync<any>(
         `SELECT id, id_board, from_tile, to_tile FROM shortcuts WHERE id_board = ?`,
         [idboard]
      );
      await db.closeAsync();
      return rows.map(r => ({
         id: Number(r.id),
         id_board: Number(r.id_board),
         from_tile: Number(r.from_tile),
         to_tile: Number(r.to_tile),
      }));
   } catch (error: any) {
      console.log('loadLocalShortcuts:', error.message);
      Toast.show({ type: 'error', text1: 'Error (load local shortcuts)', text2: error.message });
      return [];
   }
}

const mapCustomSubtopicRow = (r: any): CustomSubtopicType => ({
   id_subtopic: Number(r.id_subtopic),
   group_name: 'Local',
   creator_username: 'local',
   knowledge_area: r.knowledge_area,
   knowledge_area_detail: r.knowledge_area_detail ?? '',
   color: r.color ?? '#6599C3',
   discipline: r.discipline,
   discipline_detail: r.discipline_detail ?? '',
   level: r.level,
   topic: r.topic,
   topic_detail: r.topic_detail ?? '',
   subtopic: r.subtopic,
   subtopic_detail: r.subtopic_detail ?? '',
});

const CUSTOM_SUBTOPIC_SELECT = `
   SELECT
      st.id AS id_subtopic,
      ka.description AS knowledge_area,
      ka.details AS knowledge_area_detail,
      ka.color AS color,
      d.description AS discipline,
      d.details AS discipline_detail,
      l.description AS level,
      t.description AS topic,
      t.details AS topic_detail,
      st.description AS subtopic,
      st.details AS subtopic_detail
   FROM edu_subtopics st
   INNER JOIN edu_topics t ON st.id_topic = t.id
   INNER JOIN edu_levels l ON t.id_level = l.id
   INNER JOIN edu_disciplines d ON t.id_discipline = d.id
   INNER JOIN edu_knowledge_areas ka ON d.id_knowledge_area = ka.id
`;

const loadLocalCustomSubtopicById = async (idsubtopic: number): Promise<CustomSubtopicType | null> => {
   await InitOfflineDb();
   try {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      const rows = await db.getAllAsync<any>(
         `${CUSTOM_SUBTOPIC_SELECT} WHERE st.id = ? LIMIT 1`,
         [idsubtopic]
      );
      await db.closeAsync();
      if (rows.length === 0) return null;
      return mapCustomSubtopicRow(rows[0]);
   } catch (error: any) {
      console.log('loadLocalCustomSubtopicById:', error.message);
      Toast.show({ type: 'error', text1: 'Error (load local custom subtopic)', text2: error.message });
      return null;
   }
}

const loadLocalCustomSubtopics = async (): Promise<CustomSubtopicType[]> => {
   await InitOfflineDb();
   try {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      const rows = await db.getAllAsync<any>(
         `${CUSTOM_SUBTOPIC_SELECT} ORDER BY ka.id, d.id, t.id, st.id`
      );
      await db.closeAsync();
      return rows.map(mapCustomSubtopicRow);
   } catch (error: any) {
      console.log('loadLocalCustomSubtopics:', error.message);
      Toast.show({ type: 'error', text1: 'Error (load local custom subtopics)', text2: error.message });
      return [];
   }
}

const loadLocalInfoAndQuestions = async (idsubtopic: number): Promise<EduInfoQuestionsType[]> => {
   await InitOfflineDb();
   try {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      const rows = await db.getAllAsync<any>(
         `SELECT id, id_subtopic, information, question, answer_1, answer_2, answer_3, answer_4, answer_ok, is_true_or_false
          FROM edu_info_and_questions
          WHERE id_subtopic = ?`,
         [idsubtopic]
      );
      await db.closeAsync();
      return rows.map(r => ({
         id: Number(r.id),
         id_subtopic: Number(r.id_subtopic),
         information: r.information,
         question: r.question,
         answer_1: r.answer_1,
         answer_2: r.answer_2,
         answer_3: r.answer_3,
         answer_4: r.answer_4,
         answer_ok: Number(r.answer_ok),
         is_true_or_false: Number(r.is_true_or_false) === 1,
      }));
   } catch (error: any) {
      console.log('loadLocalInfoAndQuestions:', error.message);
      Toast.show({ type: 'error', text1: 'Error (load local info & questions)', text2: error.message });
      return [];
   }
}

export { DbCreateTables, DbDropTables, DbSeedOffline, InitOfflineDb, loadLocalDices, loadLocalTileTypes, loadLocalBoard, loadLocalTiles, loadLocalShortcuts, loadLocalCustomSubtopicById, loadLocalCustomSubtopics, loadLocalInfoAndQuestions };
