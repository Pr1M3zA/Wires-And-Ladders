import Toast from 'react-native-toast-message';
import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LastUpdate, BoardBackgroundType, DbBoardType, BoardType, TileType, DiceType, EducationType, EffectType, ShortCutType } from '@/utils/types';

/*-----------------------------------------------------------
      CARGA DE TABLEROS, CASILLAS, ATAJOS Y TIPOS DE CASILLAS
   ------------------------------------------------------------*/
const loadLocalDbData = async (db: SQLite.SQLiteDatabase, setters: {
   setTileTypes: (data: EffectType[]) => void,
   setTiles: (data: TileType[]) => void,
   setShortcuts: (data: ShortCutType[]) => void,
   setBoards: (data: BoardType[]) => void,
   setDices: (data: DiceType[]) => void
}) => {
   const { setTileTypes, setTiles, setShortcuts, setBoards, setDices } = setters;
   // Get Shortcuts
   await db.getAllAsync('SELECT id, id_board, from_tile, to_tile FROM shortcuts ORDER BY id_board')
      .then(data => { setShortcuts(data as ShortCutType[]) })
      .catch(error => { Toast.show({ type: 'error', text1: 'Error (Get Shortcuts local)', text2: error.message }) });
   // Get Boards
   await db.getAllAsync('SELECT b.id, board_name, width, height, rect_width, rect_height, path1, path2, color_rect, color_path1, color_path2, education FROM boards b INNER JOIN board_backgrounds bb ON b.id_background=bb.id ORDER BY b.id')
      .then(data => { setBoards(data as BoardType[]) })
      .catch(error => { Toast.show({ type: 'error', text1: 'Error (Get Boards local)', text2: error.message }) });
   // Get Tiles
   await db.getAllAsync('SELECT t.id, id_board, num_tile, pos_x, pos_y, tile_type, rotation, radius, border_width, tt.effect_name, direction FROM tiles t INNER JOIN tile_types tt ON t.tile_type=tt.id ORDER BY id_board, num_tile')
      .then(data => { setTiles(data as TileType[]) })
      .catch(error => { Toast.show({ type: 'error', text1: 'Error (Get Tiles local)', text2: error.message }) });
   // Get Tile Types
   await db.getAllAsync('SELECT id, effect_name, color_fill, color_border, color_path1, color_path2, path1, path2, paths_x, paths_y, paths_scale FROM tile_types ORDER BY id')
      .then(data => { setTileTypes(data as EffectType[]) })
      .catch(error => {
         Toast.show({ type: 'error', text1: 'Error (Get Tile Types local)', text2: error.message })
      });
   // Get Dices
   await db.getAllAsync('SELECT id, dice_name, color_faceup, color_faceleft, color_faceright, color_dots, color_border, border_width, scale FROM dices ORDER BY id')
      .then(data => { setDices(data as DiceType[]) })
      .catch(error => { Toast.show({ type: 'error', text1: 'Error (Get Dices local)', text2: error.message }) });
}

/*-----------------------------------------------------------
      SINCRONIZACIÓN DE BASE DE DATOS
------------------------------------------------------------*/
const getRemoteLastUpdate = async (apiURL: string): Promise<LastUpdate[]> => {
   return await fetch(`${apiURL}/sync/lastupdate`).then(res => res.json()).catch(error => { Toast.show({ type: 'error', text1: 'Error (getRemote LastUpdate)', text2: error.message }) });
}

const thereIsNewerData = (remoteLastUpdate: LastUpdate[], lastSyncDate: string, tableName: string) => {
   const maxDate = remoteLastUpdate.find(item => item.table_name === tableName)?.last_update;
   if (!maxDate) return false;
   return maxDate > lastSyncDate;
}

const SyncBoardData = async (db: SQLite.SQLiteDatabase, apiURL: string, lastRemoteUpdate: LastUpdate[]) => {
   const syncStartTime = new Date().toISOString();
   const lastSyncDate = await AsyncStorage.getItem('LAST_LOCAL_DB_DATA_SYNC').catch(() => null);
   const afterOf = lastSyncDate ?? '1970-01-01';

   // Sincronización incremental: solo registros modificados desde lastSyncDate
   let didItChange: boolean = false
   if (!lastSyncDate) await DbDropTables(db);    // Borra todo si no hay LastSyncDate
   await DbCreateTables(db);   // Si no existen, creamos la estructura de tablas, indices y vistas
   if (!lastSyncDate || thereIsNewerData(lastRemoteUpdate, afterOf, 'board_backgrounds')) {
      await GetRemoteBackgrounds(db, apiURL, afterOf);
      didItChange = true;
   }
   if (!lastSyncDate || thereIsNewerData(lastRemoteUpdate, afterOf, 'boards')) {
      await GetRemoteBoards(db, apiURL, afterOf);
      didItChange = true;
   }
   if (!lastSyncDate || thereIsNewerData(lastRemoteUpdate, afterOf, 'tiles')) {
      await GetRemoteTiles(db, apiURL, afterOf);
      didItChange = true;
   }
   if (!lastSyncDate || thereIsNewerData(lastRemoteUpdate, afterOf, 'shortcuts')) {
      await GetRemoteShortcuts(db, apiURL, afterOf);
      didItChange = true;
   }
   if (!lastSyncDate || thereIsNewerData(lastRemoteUpdate, afterOf, 'tile_types')) {
      await GetRemoteTileTypes(db, apiURL, afterOf);
      didItChange = true;
   }
   if (!lastSyncDate || thereIsNewerData(lastRemoteUpdate, afterOf, 'dices')) {
      await GetRemoteDices(db, apiURL, afterOf);
      didItChange = true;
   }
   if (!lastSyncDate || thereIsNewerData(lastRemoteUpdate, afterOf, 'education')) {
      await GetRemoteEducation(db, apiURL, afterOf);
      didItChange = true;
   }
   if (didItChange) await AsyncStorage.setItem('LAST_LOCAL_DB_DATA_SYNC', syncStartTime);
}

/* ------------------------------------------------------------------------------------------
   Obtiene datos de una URL y los inserta/actualiza en la BD local dentro de una transacción.
--------------------------------------------------------------------------------------------- */
const fetchAndUpsertAll = async <T>(
   db: SQLite.SQLiteDatabase,
   url: string,
   upsertFn: (db: SQLite.SQLiteDatabase, row: T) => Promise<void>
) => {
   const res = await fetch(url);
   if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
   const data: T[] = await res.json();
   if (data.length === 0) return;

   // Envolver todas las inserciones en una única transacción
   await db.withExclusiveTransactionAsync(async () => {
      for (const row of data) {
         await upsertFn(db, row);
      }
   });
};

/*-----------------
   BACKGROUNDS
----------------*/
const GetRemoteBackgrounds = async (db: SQLite.SQLiteDatabase, apiURL: string, afterOf: string) => {
   await fetchAndUpsertAll<BoardBackgroundType>(db, `${apiURL}/sync/board-backgrounds/${afterOf}`, UpsertLocalBackground)
      .catch(error => Toast.show({ type: 'error', text1: 'Error (get Remote bg)', text2: error.message }));
};

const UpsertLocalBackground = async (db: SQLite.SQLiteDatabase, row: BoardBackgroundType) => {
   const sql = `INSERT OR REPLACE INTO board_backgrounds (id, background_name, rect_width, rect_height, color_rect, color_path1, color_path2, path1, path2) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
   await db.runAsync(sql, row.id, row.background_name, row.rect_width, row.rect_height, row.color_rect, row.color_path1, row.color_path2, row.path1, row.path2)
      .catch(error => Toast.show({ type: 'error', text1: 'Error (Upsert Local Background)', text2: error.message }))
}
/*-----------------
   BOARDS
----------------*/
const GetRemoteBoards = async (db: SQLite.SQLiteDatabase, apiURL: string, afterOf: string) => {
   await fetchAndUpsertAll<DbBoardType>(db, `${apiURL}/sync/boards/${afterOf}`, UpsertLocalBoard)
      .catch(error => Toast.show({ type: 'error', text1: 'Error (get Remote boards)', text2: error.message }));
};
const UpsertLocalBoard = async (db: SQLite.SQLiteDatabase, row: DbBoardType) => {
   const sql = `INSERT OR REPLACE INTO boards (id, board_name, board_description, id_background, width, height, education) VALUES (?, ?, ?, ?, ?, ?, ?)`
   await db.runAsync(sql, row.id, row.board_name, row.board_description, row.id_background, row.width, row.height, row.education)
      .catch(error => Toast.show({ type: 'error', text1: 'Error (Upsert Local Board)', text2: error.message }))
}
/*-----------------
   TILES
----------------*/
const GetRemoteTiles = async (db: SQLite.SQLiteDatabase, apiURL: string, afterOf: string) => {
   await fetchAndUpsertAll<TileType>(db, `${apiURL}/sync/tiles/${afterOf}`, UpsertLocalTile)
      .catch(error => Toast.show({ type: 'error', text1: 'Error (get Remote tiles)', text2: error.message }));
};
const UpsertLocalTile = async (db: SQLite.SQLiteDatabase, row: TileType) => {
   const sql = `INSERT OR REPLACE INTO tiles (id, id_board, num_tile, pos_x, pos_y, tile_type, rotation, radius, border_width, direction) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
   await db.runAsync(sql, row.id, row.id_board, row.num_tile, row.pos_x, row.pos_y, row.tile_type, row.rotation, row.radius, row.border_width, row.direction)
      .catch(error => {
         Toast.show({ type: 'error', text1: 'Error (Upsert Local Tile)', text2: error.message })
      })
}
/*-----------------
   SHORTCUTS
----------------*/
const GetRemoteShortcuts = async (db: SQLite.SQLiteDatabase, apiURL: string, afterOf: string) => {
   await fetchAndUpsertAll<ShortCutType>(db, `${apiURL}/sync/shortcuts/${afterOf}`, UpsertLocalShortcut)
      .catch(error => Toast.show({ type: 'error', text1: 'Error (get Remote shortcuts)', text2: error.message }));
};
const UpsertLocalShortcut = async (db: SQLite.SQLiteDatabase, row: ShortCutType) => {
   const sql = `INSERT OR REPLACE INTO shortcuts (id, id_board, from_tile, to_tile) VALUES (?, ?, ?, ?)`
   await db.runAsync(sql, row.id, row.id_board, row.from_tile, row.to_tile)
      .catch(error => Toast.show({ type: 'error', text1: 'Error (Upsert Shortcut)', text2: error.message }))
}
/*-----------------
   TILE TYPES
----------------*/
const GetRemoteTileTypes = async (db: SQLite.SQLiteDatabase, apiURL: string, afterOf: string) => {
   await fetchAndUpsertAll<EffectType>(db, `${apiURL}/sync/tile-types/${afterOf}`, UpsertLocalTileType)
      .catch(error => Toast.show({ type: 'error', text1: 'Error (get Remote Tile Types)', text2: error.message }));
};
const UpsertLocalTileType = async (db: SQLite.SQLiteDatabase, row: EffectType) => {
   const sql = `INSERT OR REPLACE INTO tile_types (id, effect_name, color_fill, color_border, color_path1, color_path2, path1, path2, paths_x, paths_y, paths_scale) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
   await db.runAsync(sql, row.id, row.effect_name, row.color_fill, row.color_border, row.color_path1, row.color_path2, row.path1, row.path2, row.paths_x, row.paths_y, row.paths_scale)
      .catch(error => Toast.show({ type: 'error', text1: 'Error (Upsert Local TileType)', text2: error.message }))
}
/*-----------------
   DICES
----------------*/
const GetRemoteDices = async (db: SQLite.SQLiteDatabase, apiURL: string, afterOf: string) => {
   await fetchAndUpsertAll<DiceType>(db, `${apiURL}/sync/dices/${afterOf}`, UpsertLocalDice)
      .catch(error => Toast.show({ type: 'error', text1: 'Error (get Remote Dices)', text2: error.message }));
};
const UpsertLocalDice = async (db: SQLite.SQLiteDatabase, row: DiceType) => {
   const sql = `INSERT OR REPLACE INTO dices (id, dice_name, color_faceup, color_faceleft, color_faceright, color_dots, color_border, border_width, scale) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
   await db.runAsync(sql, row.id, row.dice_name, row.color_faceup, row.color_faceleft, row.color_faceright, row.color_dots, row.color_border, row.border_width, row.scale)
      .catch(error => {
         Toast.show({ type: 'error', text1: 'Error (Upsert Local Dice)', text2: error.message })
      })
}
/*-----------------
   EDUCATION
----------------*/
const GetRemoteEducation = async (db: SQLite.SQLiteDatabase, apiURL: string, afterOf: string) => {
   await fetchAndUpsertAll<EducationType>(db, `${apiURL}/sync/education/${afterOf}`, UpsertLocalEducation)
      .catch(error => Toast.show({ type: 'error', text1: 'Error (get Remote Education)', text2: error.message }));
};
const UpsertLocalEducation = async (db: SQLite.SQLiteDatabase, row: EducationType) => {
   const sql = `INSERT OR REPLACE INTO education (id, generation, theme, information, question, answer_1, answer_2, answer_3, answer_4, answer_ok) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
   await db.runAsync(sql, row.id, row.generation, row.theme, row.information, row.question, row.answer_1, row.answer_2, row.answer_3, row.answer_4, row.answer_ok)
      .catch(error => Toast.show({ type: 'error', text1: 'Error (Upsert Local Edu)', text2: error.message }))
}
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
         height SMALLINT NOT NULL DEFAULT 0,
         education SMALLINT NOT NULL DEFAULT 0
      );
      
      CREATE TABLE IF NOT EXISTS tile_types (
         id TINYINT NOT NULL PRIMARY KEY,
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
         tile_type TINYINT NOT NULL, 
         rotation SMALLINT NOT NULL,
         radius TINYINT NOT NULL,
         border_width TINYINT NOT NULL,
         direction SMALLINT NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS shortcuts (
         id INT NOT NULL PRIMARY KEY,
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
         scale  DECIMAL(3,1) NOT NULL DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS education (
         id INT NOT NULL PRIMARY KEY,
         generation TINYINT, 
         theme TEXT,
         information TEXT,
         question TEXT,
         answer_1 TEXT,
         answer_2 TEXT,
         answer_3 TEXT,
         answer_4 TEXT,
         answer_ok TINYINT
      );
      
      CREATE TABLE IF NOT EXISTS profanity_words (
         word VARCHAR(30) NOT NULL UNIQUE
      );`
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
      DROP TABLE IF EXISTS tiles;
      DROP TABLE IF EXISTS shortcuts;      
      DROP TABLE IF EXISTS dices;
      DROP TABLE IF EXISTS education;
      DROP TABLE IF EXISTS profanity_words;`
   )
      .catch(error => {
         console.log(error.message)
         Toast.show({ type: 'error', text1: 'Error (drop local tables)', text2: error.message })
      });
}

export { SyncBoardData, loadLocalDbData, getRemoteLastUpdate }
