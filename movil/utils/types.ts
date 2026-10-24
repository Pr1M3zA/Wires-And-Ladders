type BoardType = {
	id: number,
	board_name: string,
	board_description: string,
	id_background: number,
	background_name: string,
	width: number,
	height: number,
	rect_width: number,
	rect_height: number,
	path1: string,
	path2: string,
	color_rect: string,
	color_path1: string,
	color_path2: string,
	sin_efecto: number,
	positivas: number,
	negativas: number,
	informativas: number,
	preguntas: number,
	especiales: number
}

type DiceType = {
	id: number,
	dice_name: string,
	color_faceup: string,
	color_faceleft: string,
	color_faceright: string,
	color_dots: string,
	color_border: string,
	border_width: number,
	scale: number
}

type EducationType = {
	id: number,
	generation: number,
	theme: string, information: string, question: string,
	answer_1: string, answer_2: string, answer_3: string, answer_4: string, answer_ok: number
}

type EduKnowledgeAreaType = {
	id: number,
	description: string, details: string
}

type EduDsciplinesType = {
	id: number,
	id_knowledge_area: number,
	description: string, details: string
}

type EduLevels = {
	id: number,
	description: string
}

type EduTopics = {
	id: number,
	id_discipline: number, id_level: number,
	description: string, details: string
}

type EduSubTopics = {
	id: number,
	id_topic: number,
	description: string, details: string
}

type EduInfoQuestionsType = {
	id: number,
	id_subtopic: number,
	information: string, question: string,
	answer_1: string, answer_2: string, answer_3: string, answer_4: string, answer_ok: number,
	is_true_or_false: boolean
}

type CustomSubtopicType = {
	id_subtopic: number,
	group_name: string,
	creator_fullname?: string,
	creator_email?: string,
	creator_username: string,
	knowledge_area: string,
	knowledge_area_detail: string,
	color: string,
	discipline: string,
	discipline_detail: string,
	level: string,
	topic: string,
	topic_detail: string,
	subtopic: string,
	subtopic_detail: string,
}

type TileType = {
	id: number,
	id_board: number,
	id_effect: number,
	num_tile: number,
	pos_x: number,
	pos_y: number,
	tile_type: number,
	rotation: number,
	radius: number,
	border_width: number,
	effect_name: string,
	direction: number
}

type EffectType = {
	id: number,
	id_effect: number,
	effect_name: string,
	color_fill: string, color_border: string, color_path1: string, color_path2: string,
	path1: string, path2: string,
	paths_x: number, paths_y: number, paths_scale: number
}

type ShortCutType = {
	id: number; id_board: number;
	from_tile: number; to_tile: number;
}

type PlayerInfoFromLobby = {   // Información del usuario que envía el Lobby
	socketId: string;
	dbUserId: number;
	userName: string;
	idBoard: number;
	profileImage?: string | null;
}

type PlayerGameState = {  // Para llevar estadísticas del jugador en el desarrollo del juego
	dbUserId: number;
	//userName: string;
	//profileImage?: string | null;
	color: { fill: string; border: string; eyes: string }
	platForm: string;
	currentTile: number;
	targetTile: number;
	diceRolls: number;
	pointsAccumulated: number;
	shortcutsTaken: number;
	laddersTaken: number;
	snakesTaken: number;
	landedOnTileCounter: { [key: string]: number }
	correctAnswers: number;
	//landedOnSquareType: { [squareType: string]: number };
}

type GameOverallStats = {   // Estadísticas del juego
	gameId: string | null;
	roomCode: string | null;
	startTime: Date;
	endTime: Date | null;
	winnerUserId: number | null;
}

type GameBoardParams = {
	gameId: string;
	roomCode: string;
	players: string;
	idBoard: string;
	idSubtopic: string;
	subtopicName: string;
	isCreator: string;
}

type BoardBackgroundType = {
	id: number,
	background_name: string,
	rect_width: number, rect_height: number,
	color_rect: string, color_path1: string, color_path2: string,
	path1: string, path2: string
}

type DbBoardType = {
	id: number,
	board_name: string, board_description: string,
	id_background: number, width: number, height: number,
	//education: number,
}

type LastUpdate = {
	table_name: string,
	last_update: string
}

type UserRowType = {
	id: number,
	username: string,
	first_name: string,
	last_name: string,
	email: string,
	profile_image: string | null,
	is_admin: boolean,
	id_board: number,
	id_subtopic: number,
	id_dice: number,
}

type PlayingUserType = {
	id: number,
	username: string,
	profile_image: string | null | undefined,
	socketId: string,
}

export type {
	BoardType, DiceType, EducationType, TileType, ShortCutType, EffectType, LastUpdate,
	PlayerInfoFromLobby, PlayerGameState, GameOverallStats, GameBoardParams,
	BoardBackgroundType, DbBoardType, UserRowType, PlayingUserType,
	EduKnowledgeAreaType, EduDsciplinesType, EduLevels, EduTopics, EduSubTopics, EduInfoQuestionsType,
	CustomSubtopicType
}
