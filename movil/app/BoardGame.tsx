import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Dimensions, Platform, View, Text, StyleSheet, BackHandler, Alert, Image } from 'react-native';
import Animated, { useAnimatedRef } from 'react-native-reanimated';
import { useContextProvider } from '@/utils/ContextProvider';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Svg, { Path, G } from 'react-native-svg';
import Toast from 'react-native-toast-message';
import Background from '@/components/Background';
import HexTile from '@/components/HexTile';
import Wire from '@/components/Wire';
import Ladder from '@/components/Ladder';
import Cube from '@/components/Cube';
import Hexagon from '@/components/Hexagon';
import Dice from '@/components/Dice';
import Player from '@/components/Player';
import StartFinishLine from '@/components/StartFinishLine';
import * as gameItems from '@/utils/gameitems.json';
//import educationData from '@/utils/education.json'; 
import ModalEducation from '@/components/modalEducation';
import ModalGameStats from '@/components/GameStatisticsModal';
import ModalConfig from '@/components/ModalConfig';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { getHour } from '@/utils/utils';
import { getBoardElements, getInfoAndQuestions } from '@/utils/fetchAndSet';
import type { EduInfoQuestionsType, DiceType, GameBoardParams, PlayerInfoFromLobby, PlayerGameState, GameOverallStats, BoardType, TileType, ShortCutType } from '@/utils/types';

import musicSrc from '@/assets/sounds/game-music-loop-20.mp3';
import bonusSrc from '@/assets/sounds/game-bonus.mp3'
import failSrc from '@/assets/sounds/cartoon-fail-trumpet.mp3'
import funnySrc from '@/assets/sounds/funny-cartoon-sound.mp3'
import crySrc from '@/assets/sounds/cry.mp3'
import badSrc from '@/assets/sounds/failfare.mp3'
import correctSrc from '@/assets/sounds/correct.mp3'
import Loading from '@/components/Loading';

const playerColors = gameItems.playerColors;
const wireScaleColor = { fill: 'green', border: 'black' };
const ladderColor = { base: 'sandybrown', rung: 'saddlebrown' };

export default function BoardGame() {
	const InitCallHour = new Date()
	// Inicializa sonidos
	const correct = useAudioPlayer(correctSrc);
	const fail = useAudioPlayer(failSrc);
	const bonus = useAudioPlayer(bonusSrc);
	const bad = useAudioPlayer(badSrc);
	const cry = useAudioPlayer(crySrc);
	const funny = useAudioPlayer(funnySrc);

	// Constantes del juego
	const router = useRouter();
	const params = useLocalSearchParams<GameBoardParams>();
	const { token, apiURL, socket, idUser, dices, userRow, isDarkMode, setIsDarkMode, fontScale, setFontScale, playingUsers } = useContextProvider();
	const idBoard = parseInt(params.idBoard, 10);
	const idSubtopic = parseInt(params.idSubtopic, 10) || 1;
	const [board, setBoard] = useState<BoardType | null>(null);
	const [tiles, setTiles] = useState<TileType[]>([]);
	const [shortcuts, setShortcuts] = useState<ShortCutType[]>([]);
	const [isBoardLoading, setIsBoardLoading] = useState(false);
	// Derivaciones del tablero - memoizadas para referencias estables (evitan re-animar Players)
	const hexTiles = useMemo(() => tiles.filter(t => t.id_board === idBoard), [tiles, idBoard]);
	const shortCuts = useMemo(() => shortcuts.filter(s => s.id_board === idBoard), [shortcuts, idBoard]);
	const canvas_width = !board ? 0 : board.width === 0 ? Dimensions.get('window').width : board.width;
	const canvas_height = !board ? 0 : board.height;
	const [layoutBottom, setLayoutBottom] = useState({ x: 0, y: 0, width: 0, height: 0 });

	// Estados del juego
	const [playersState, setPlayersState] = useState<PlayerGameState[]>([]);
	const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
	const [gameOverallStats, setGameOverallStats] = useState<GameOverallStats>({
		gameId: params.gameId, roomCode: params.roomCode, startTime: new Date(), endTime: null, winnerUserId: null,
	});
	const [lastDiceResult, setLastDiceResult] = useState(1);
	const isTakingShortCutRef = useRef(false); // Ref en vez de state para no causar re-renders que re-disparen animaciones
	const [isMyTurn, setIsMyTurn] = useState(false);
	const [gameEnded, setGameEnded] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isSocketLoading, setIsSocketLoading] = useState(false);
	const [currentActionLog, setCurrentActionLog] = useState<string>('');

	// Estados para las ventanas sobrepuestas
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [isCfgModalVisible, setIsCfgModalVisible] = useState(false);
	const [isGameStatsModalVisible, setIsGameStatsModalVisible] = useState(false);
	const [currentEducationItem, setCurrentEducationItem] = useState<EduInfoQuestionsType | null>(null);
	const [modalType, setModalType] = useState<'Informativo' | 'Pregunta' | null>(null);
	const [educationData, setEducationData] = useState<EduInfoQuestionsType[]>([])

	const [volMusic, setVolMusic] = useState(1);
	const [volEffects, setVolEffects] = useState(1);
	const [dice, setDice] = useState<DiceType>(dices[0]);

	useEffect(() => {
		getInfoAndQuestions(apiURL, idSubtopic, setEducationData);
	}, [idSubtopic, apiURL]);

	useEffect(() => {
		setIsBoardLoading(true);
		getBoardElements(idBoard, apiURL, setBoard, setTiles, setShortcuts)
			.finally(() => setIsBoardLoading(false));
	}, []);

	useEffect(() => {   // Control de abandono de partida
		const backAction = () => {   // Cuando se presione el botón back o el gesto equivalente
			Alert.alert('Cuidado!', 'Abandonarás la partida. ¿Estás seguro?', [
				{ text: 'No, cancelar', onPress: () => null, style: 'cancel', },
				{ text: 'Si, salir', onPress: () => PlayerLeaveGame(idUser, playersState, currentPlayerIndex) },
			]);
			return true;
		};
		const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
		return () => backHandler.remove();
	}, [playersState, currentPlayerIndex]);

	const wires = useMemo(() => shortCuts.filter(item => item.from_tile > item.to_tile).map(wire => ({ ...wire, type: 'wire' })), [shortCuts]);
	const ladders = useMemo(() => shortCuts.filter(item => item.to_tile > item.from_tile).map(ladder => ({ ...ladder, type: 'ladder' })), [shortCuts]);
	const allShortcuts = useMemo(() => [...wires, ...ladders], [wires, ladders]);
	const allTilesCoords = useMemo(() => hexTiles.map(b => ({ x: b.pos_x, y: b.pos_y })), [hexTiles]);

	/*---------------------------------------------------
		ACTUALIZAR CASILLA AL TERMINAR DE GIRAR EL DADO
	----------------------------------------------------*/
	const handleDiceSpinComplete = useCallback((diceValue: number) => {
		setLastDiceResult(diceValue);
		const newLog = `🎲 ${diceValue}`
		setCurrentActionLog(newLog);
		const updatedPlayer = { ...playersState[currentPlayerIndex] }; // Copia del jugador actual
		updatedPlayer.diceRolls++;
		updatedPlayer.targetTile = Math.min(updatedPlayer.currentTile + diceValue, hexTiles.length - 1);
		const stateWithDice = playersState.map((player, index) => index === currentPlayerIndex ? updatedPlayer : player);
		setPlayersState(stateWithDice);
		if (socket) {
			socket.emit('broadcastGameState', {
				roomCode: params.roomCode,
				gameState: { playersState: stateWithDice, currentPlayerIndex, gameEnded: false, winnerUserId: null, lastDiceResult: diceValue, currentActionLog: newLog }
			});
		}

	}, [playersState, currentPlayerIndex, socket, params.roomCode, hexTiles]);

	/*---------------------------------------------------
		CUANDO EL JUGADOR LLEGUE A SU CASILLA DESTINO
	----------------------------------------------------*/
	const handlePlayerMoveComplete = useCallback((landedTileIndex: number, movedPlayerId: number) => {
		if (gameEnded || playersState.length === 0 || !isMyTurn) return;
		const playerIdx = playersState.findIndex(p => p.dbUserId === movedPlayerId);
		if (playerIdx === -1 || playerIdx !== currentPlayerIndex) {
			//console.warn("handlePlayerMoveComplete: Event for non-current player or player not found.", { movedPlayerId, currentPlayerId: playersState[currentPlayerIndex]?.dbUserId, playerIdx });
			return;
		}
		let finalLandedTile = landedTileIndex;
		const currentPlayerSnapshot = playersState[currentPlayerIndex];
		const updatedPlayer = { ...currentPlayerSnapshot };
		const tileEffect = hexTiles[landedTileIndex].effect_name;
		updatedPlayer.landedOnTileCounter[tileEffect] += 1;
		updatedPlayer.currentTile = landedTileIndex;
		if (updatedPlayer.platForm.length === 0) updatedPlayer.platForm = Platform.OS;
		const shortcut = allShortcuts.find(s => s.from_tile === landedTileIndex);
		if (!isTakingShortCutRef.current && shortcut && shortcut.to_tile !== landedTileIndex) {   // Aterrizó en un atajo
			isTakingShortCutRef.current = true;
			finalLandedTile = shortcut.to_tile;
			updatedPlayer.shortcutsTaken += 1;
			let logAppend = '';
			if (shortcut.type === "ladder") {
				updatedPlayer.laddersTaken += 1;
				logAppend = ', 🪜 Atajo';
			}
			if (shortcut.type === "wire") {
				updatedPlayer.snakesTaken += 1;
				logAppend = ', 🐍 Atajo';
			}
			const newLog = currentActionLog + logAppend;
			setCurrentActionLog(newLog);
			updatedPlayer.targetTile = finalLandedTile;
			const newPlayersStateWithShortcutTarget = playersState.map((player, idx) => idx === currentPlayerIndex ? updatedPlayer : player);
			setPlayersState(newPlayersStateWithShortcutTarget);
			if (socket) {
				socket.emit('broadcastGameState', {
					roomCode: params.roomCode,
					gameState: { playersState: newPlayersStateWithShortcutTarget, currentPlayerIndex, gameEnded: false, winnerUserId: null, lastDiceResult, currentActionLog: newLog }
				});
			}
			return; // El jugador se moverá de nuevo debido al atajo
		}
		if (!isTakingShortCutRef.current && tileEffect === 'Especial') {  //Casilla especial! no sabemos qué pasará
			const pointsOrTiles = Math.floor(Math.random() * 2);  // devuelve 0 o 1
			const positiveOrNegative = Math.floor(Math.random() * 2);  // devuelve 0 o 1
			const howMany = Math.floor(Math.random() * 10) + 1;  // devuelve un entero entre 1 y 10
			if (pointsOrTiles === 0) {   // Puntos
				if (positiveOrNegative === 0) {   // Positivos
					Toast.show({ type: 'success', text1: '¡Casilla especial! 🎭', text2: `Que suerte! obtuviste ${howMany} puntos extra 🎉` });
					updatedPlayer.pointsAccumulated += howMany;
					setCurrentActionLog(prev => prev + `, 🎭 Especial, +${howMany} pts`);
				}
				else {  // Negativos
					Toast.show({ type: 'error', text1: '¡Casilla especial! 🎭', text2: `Lo siento! perdiste ${howMany} puntos... !mas suerte para la próxima! 😔` });
					updatedPlayer.pointsAccumulated -= howMany;
					setCurrentActionLog(prev => prev + `, 🎭 Especial, -${howMany} pts`);
				}
			}
			else {  // se moverá a otra casilla...
				isTakingShortCutRef.current = true;
				if (positiveOrNegative === 0) { // hacia adelante
					finalLandedTile += howMany;
					if (finalLandedTile > hexTiles.length - 1) finalLandedTile = hexTiles.length - 1;
					Toast.show({ type: 'success', text1: '¡Casilla especial! 🎭', text2: `Felicidades! la suerte te hace avanzar ${howMany} casillas... 🎉` });
				}
				else { // hacia atrás
					Toast.show({ type: 'error', text1: '¡Casilla especial! 🎭', text2: `Oh no! Retrocederás ${howMany} casillas; mejor suerte para la próxima! 😔` });
					finalLandedTile -= howMany;
					if (finalLandedTile < 0) finalLandedTile = 0;
				}
				const newLog = currentActionLog + `, 🎭 Especial`;
				setCurrentActionLog(newLog);
				updatedPlayer.targetTile = finalLandedTile;
				const newPlayersStateWithSpecialTarget = playersState.map((player, idx) => idx === currentPlayerIndex ? updatedPlayer : player);
				setPlayersState(newPlayersStateWithSpecialTarget);
				if (socket) {
					socket.emit('broadcastGameState', {
						roomCode: params.roomCode,
						gameState: { playersState: newPlayersStateWithSpecialTarget, currentPlayerIndex, gameEnded: false, winnerUserId: null, lastDiceResult, currentActionLog: newLog }
					});
				}
				return; // El jugador se moverá de nuevo debido a la suerte de la casilla especial
			}
		}

		let newLog = currentActionLog;
		if (!isTakingShortCutRef.current && tileEffect === 'Positivo') {  // Le daremos 1 punto al jugador
			bonus.seekTo(0);
			bonus.play();
			updatedPlayer.pointsAccumulated += 2;
			Toast.show({ type: 'success', text1: '¡Efecto positivo! 😺', text2: 'Obtuviste 2 puntos por llegar a esta casilla' });
			newLog += ', +2 pts';
		}
		if (!isTakingShortCutRef.current && tileEffect === 'Negativo') {  // Le quitaremos 1 punto al jugador
			bad.seekTo(0);
			bad.play();
			updatedPlayer.pointsAccumulated -= 2;
			Toast.show({ type: 'error', text1: 'Efecto negativo... 😿', text2: 'Perdiste 2 puntos por llegar a esta casilla' });
			newLog += ', -2 pts';
		}
		// Actualizar la posición final y verificar ganador
		isTakingShortCutRef.current = false;
		updatedPlayer.currentTile = landedTileIndex;
		const newPlayersStateAfterLanding = playersState.map((player, idx) => idx === currentPlayerIndex ? updatedPlayer : player);
		setPlayersState(newPlayersStateAfterLanding);

		if (tileEffect === 'Informativo' || tileEffect === 'Pregunta') {
			const randomThemeIdx = Math.floor(Math.random() * educationData.length);
			const selectedItem = educationData[randomThemeIdx];
			setCurrentEducationItem(selectedItem);
			setModalType(tileEffect as 'Informativo' | 'Pregunta');
			setIsModalVisible(true);
			newLog += (tileEffect === 'Informativo') ? ', viendo ℹ️' : ', respond❓';
			setCurrentActionLog(newLog);
			// We emit the intermediate state here before they answer/close modal
			if (socket) {
				socket.emit('broadcastGameState', {
					roomCode: params.roomCode,
					gameState: { playersState: newPlayersStateAfterLanding, currentPlayerIndex, gameEnded: false, winnerUserId: null, lastDiceResult, currentActionLog: newLog }
				});
			}
		}
		else {
			setCurrentActionLog(newLog);
			finalizeTurnAndProceed(updatedPlayer, landedTileIndex, newPlayersStateAfterLanding, newLog);
		}

	}, [currentPlayerIndex, playersState, gameEnded, isMyTurn, allShortcuts, hexTiles, educationData, lastDiceResult, socket, params.roomCode, currentActionLog]);

	// Wrapper estable para onMoveComplete: Player solo re-anima cuando targetTile cambia,
	// no cuando el callback se recrea por cambios en playersState/currentPlayerIndex.
	const handlePlayerMoveCompleteRef = useRef(handlePlayerMoveComplete);
	useEffect(() => { handlePlayerMoveCompleteRef.current = handlePlayerMoveComplete; }, [handlePlayerMoveComplete]);

	const stableOnMoveComplete = useCallback((tile: number, id: number) => {
		handlePlayerMoveCompleteRef.current(tile, id);
	}, []);

	// Resetear el log de acciones cada vez que cambia el turno
	useEffect(() => { setCurrentActionLog(''); }, [currentPlayerIndex]);

	/*---------------------------------------------------
		FINALIZAR TURNO Y PROCEDER A SIGUIENTE JUGADOR
	----------------------------------------------------*/
	const finalizeTurnAndProceed = (playerWhoMoved: PlayerGameState, finalTileIdx: number, allPlayersArray: PlayerGameState[], customActionLog?: string) => {
		let isGameNowOver = false;
		let winnerOfGame: number | null = null;
		const logToEmit = customActionLog ?? currentActionLog;

		if (finalTileIdx === hexTiles.length - 1) {
			isGameNowOver = true;
			const playerFinishGame = playerWhoMoved.dbUserId;
			const playerFinishGameIndex = allPlayersArray.findIndex(p => p.dbUserId === playerFinishGame);
			const profileFinishGameIdx = playingUsers.findIndex(p => p.id === playerFinishGame)
			if (playerFinishGameIndex !== -1) {
				allPlayersArray[playerFinishGameIndex].pointsAccumulated += 25;
				Toast.show({ type: 'info', text1: '¡Bono de llegada a la meta!', text2: `${playingUsers[profileFinishGameIdx].username} gana 25 puntos extra.` });
			}
			const arrayOrdenado = [...allPlayersArray].sort((a, b) => b.pointsAccumulated - a.pointsAccumulated);
			const playerWithMostPoints = arrayOrdenado[0];
			winnerOfGame = playerWithMostPoints.dbUserId;
			const winnerPlayerIndex = allPlayersArray.findIndex(p => p.dbUserId === winnerOfGame);
			const profileWinnerIdx = playingUsers.findIndex(p => p.id === winnerOfGame)

			const newGameOverallStats = { ...gameOverallStats, winnerUserId: winnerOfGame, endTime: new Date() };
			setGameOverallStats(newGameOverallStats);
			setGameEnded(true);
			setIsMyTurn(false);
			Toast.show({ type: 'success', text1: '¡Fin del Juego!', text2: `${playingUsers[profileWinnerIdx].username} es el ganador.` });
			setIsGameStatsModalVisible(true);
		}

		const nextPlayerTurnIdx = (currentPlayerIndex + 1) % allPlayersArray.length;

		if (socket) {
			socket.emit('broadcastGameState', {
				roomCode: params.roomCode,
				gameState: { playersState: allPlayersArray, currentPlayerIndex: nextPlayerTurnIdx, gameEnded: isGameNowOver, winnerUserId: winnerOfGame, lastDiceResult, currentActionLog: logToEmit }
			});
		}
		if (!isGameNowOver) {
			setCurrentPlayerIndex(nextPlayerTurnIdx);
			const nextPlayer = allPlayersArray[nextPlayerTurnIdx];
			if (nextPlayer) {
				setIsMyTurn(nextPlayer.dbUserId === idUser);
			} else {
				console.warn("El siguiente jugador es indefinido, no se puede establecer isMyTurn");
				setIsMyTurn(false);
			}
		}
	};
	/*---------------------------------------------------
		UN JUGADOR ABANDONÓ LA PARTIDA
	-----------------------------------------------------*/
	const PlayerLeaveGame = (userId: number, currentPlayers: PlayerGameState[], currPlayerIdx: number) => {
		if (socket) {
			const remainingPlayers = currentPlayers.filter(p => p.dbUserId !== userId);
			if (currPlayerIdx >= remainingPlayers.length) {
				currPlayerIdx = remainingPlayers.length - 1;
			} else if (currentPlayers[currentPlayerIndex].dbUserId === userId) {
				currPlayerIdx = currentPlayerIndex % remainingPlayers.length;
			}
			// Emitir el nuevo estado del juego
			socket.emit('broadcastGameState', {
				roomCode: params.roomCode,
				gameState: {
					playersState: remainingPlayers,
					currentPlayerIndex: currPlayerIdx,
					gameEnded: remainingPlayers.length < 2 || params.isCreator === '1', // Terminar si quedan menos de 2 jugadores o el creador se fué
					winnerUserId: remainingPlayers.length < 2 || params.isCreator === '1' ? remainingPlayers[0]?.dbUserId : null,
					lastDiceResult
				}
			});
		}
		router.back();
	}
	/*---------------------------------------------------
		INICIALIZAR ESTADÍSTICAS DEL JUEGO AL ENTRAR 
	----------------------------------------------------*/
	useEffect(() => {
		if (params.players && params.gameId && params.roomCode) {
			try {
				const parsedPlayers: PlayerInfoFromLobby[] = JSON.parse(params.players);
				const initialPlayersState: PlayerGameState[] = parsedPlayers.map((p, index) => ({
					dbUserId: p.dbUserId, userName: p.userName, platForm: '', profileImage: p.profileImage,
					color: playerColors[index % playerColors.length],
					currentTile: 0, targetTile: 0, diceRolls: 0, pointsAccumulated: 0,
					shortcutsTaken: 0, laddersTaken: 0, snakesTaken: 0, correctAnswers: 0,
					landedOnTileCounter: { Inicio: 0, Ninguno: 0, Positivo: 0, Negativo: 0, Informativo: 0, Pregunta: 0, Especial: 0, Meta: 0 },
				}));
				setPlayersState(initialPlayersState);
				setGameOverallStats({ gameId: params.gameId, roomCode: params.roomCode, startTime: new Date(), endTime: null, winnerUserId: null });
				setCurrentPlayerIndex(0);
				setIsMyTurn(initialPlayersState[0]?.dbUserId === idUser);
				//console.log("Juego inicializado para:", initialPlayersState.map(p => p.userName).join(', '));
			} catch (error) {
				Toast.show({ type: 'error', text1: 'Error de Juego', text2: 'No se pudo cargar la información de la partida.' });
				router.back();
			}
		} else {
			Toast.show({ type: 'error', text1: 'Error de Configuración', text2: 'Faltan datos para iniciar la partida.' });
			router.back();
		}
	}, []);
	/*---------------------------------------------------
		GUARDAR ESTADÍSTICAS DEL JUEGO EN BDD AL FINALIZAR
	----------------------------------------------------*/
	const saveGameStats = async () => {

		const finalPlayersState = playersState; // Usar el estado más reciente
		const finalGameStats = { ...gameOverallStats, endTime: gameOverallStats.endTime || new Date() };
		if (!finalGameStats.gameId || !finalGameStats.startTime || !finalGameStats.endTime || finalGameStats.winnerUserId === null) {
			Toast.show({ type: 'error', text1: 'Error Interno', text2: 'Faltan datos para guardar estadísticas.' });
			return;
		}

		const gameDataToSave = {
			gameId: finalGameStats.gameId,
			roomCode: finalGameStats.roomCode,
			startTime: finalGameStats.startTime.toISOString().slice(0, 19).replace('T', ' '),
			endTime: finalGameStats.endTime.toISOString().slice(0, 19).replace('T', ' '),
			winnerUserId: finalGameStats.winnerUserId,
			players: finalPlayersState.map(p => ({
				dbUserId: p.dbUserId,
				platform: p.platForm,
				diceRolls: p.diceRolls,
				pointsAccumulated: p.pointsAccumulated,
				shortcutsTaken: p.shortcutsTaken,
				laddersTaken: p.laddersTaken,
				snakesTaken: p.snakesTaken,
				landedOnTileCounter: p.landedOnTileCounter,
				finalTile: p.currentTile,
				correctAnswers: p.correctAnswers,
			})),
		};

		await fetch(apiURL + '/game/game-stats', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'authorization': token,
			},
			body: JSON.stringify(gameDataToSave),
		})
			.then(response => response.json())
			.then(data => {
				Toast.show({ type: 'success', text1: 'Juego Guardado', text2: 'Las estadísticas del juego han sido guardadas con éxito.' });
			})
			.catch(error => Toast.show({ type: 'error', text1: 'Error al guardar estadísticas', text2: error.message }))
	};
	/*----------------------------------------------
		// DEFINICIÓN DEL SOCKET PARA MULTIJUGADOR
	------------------------------------------------*/
	useEffect(() => {
		if (!socket || isSocketLoading) return

		setIsSocketLoading(true);

		socket.on('gameStateUpdated', (receivedGameState: {
			playersState: PlayerGameState[];
			currentPlayerIndex: number;
			gameEnded: boolean;
			winnerUserId: number | null;
			lastDiceResult: number;
			currentActionLog?: string;
		}) => {
			setPlayersState(receivedGameState.playersState);
			setCurrentPlayerIndex(receivedGameState.currentPlayerIndex);
			setGameEnded(receivedGameState.gameEnded);
			setLastDiceResult(receivedGameState.lastDiceResult);
			if (receivedGameState.currentActionLog) {
				setCurrentActionLog(receivedGameState.currentActionLog);
			}
			if (receivedGameState.winnerUserId) {
				setGameOverallStats(prev => ({ ...prev, winnerUserId: receivedGameState.winnerUserId, endTime: prev.endTime || new Date() }));
			}
			if (receivedGameState.gameEnded) {
				setIsGameStatsModalVisible(true); // Mostrar modal a todos los jugadores cuando el juego termina
				setIsMyTurn(false); // Nadie tiene el turno si el juego terminó
			} else {
				// Recalcular isMyTurn basado en el estado recibido solo si el juego no ha terminado
				setIsMyTurn(receivedGameState.playersState[receivedGameState.currentPlayerIndex]?.dbUserId === idUser);
			}
			setIsSocketLoading(false);
		});
	}, [isSocketLoading, socket]);
	/*---------------------------------------------------
		HANDLE MODAL ACTIONS
	----------------------------------------------------*/
	const handleModalClose = (playersStateAfterQuestion?: PlayerGameState[], logFromAnswer?: string) => {    // el Modal de Información o Pregunta se cerró
		setIsModalVisible(false);
		const effectivePlayersState = modalType === 'Pregunta' ? playersStateAfterQuestion || playersState : playersState;
		const playerFinalizingTurn = effectivePlayersState[currentPlayerIndex];
		const finalLandedTileForThisPlayer = playerFinalizingTurn.currentTile;

		setCurrentEducationItem(null);
		setModalType(null);

		finalizeTurnAndProceed(playerFinalizingTurn, finalLandedTileForThisPlayer, effectivePlayersState, logFromAnswer);
	};
	const handleAnswer = (selectedAnswer: number) => {    // Evaluamos la respuesta del Modal de pregunta
		let newPlayersState = [...playersState];
		let newLog = currentActionLog;
		if (currentEducationItem) {
			const okAnswer = currentEducationItem.answer_ok
			const updatedPlayer = { ...playersState[currentPlayerIndex] };
			if (selectedAnswer === okAnswer) {
				// Dar 5 puntos porque respondió correctamente
				correct.seekTo(0);
				correct.play();
				updatedPlayer.pointsAccumulated += 5;
				updatedPlayer.correctAnswers += 1;
				newLog += ', +5 pts';
				Toast.show({ type: 'success', text1: '¡Correcto!', text2: 'Respuesta acertada. ¡Has ganado 5 puntos!' });
			} else {
				// Quitar 5 puntos porque falló la respuesta
				fail.seekTo(0);
				fail.play();
				updatedPlayer.pointsAccumulated -= 5;
				newLog += ', -5 pts';
				const answers = [currentEducationItem.answer_1, currentEducationItem.answer_2, currentEducationItem.answer_3, currentEducationItem.answer_4]
				Toast.show({ type: 'error', text1: 'Incorrecto', text2: `La respuesta correcta era la opción ${answers[okAnswer - 1]}; Pierdes 5 puntos.` });
			}
			newPlayersState = playersState.map((player, index) =>
				index === currentPlayerIndex ? updatedPlayer : player
			);
			setPlayersState(newPlayersState);
			setCurrentActionLog(newLog);
		}
		handleModalClose(newPlayersState, newLog);
	};
	// Handlers for Game Stats Modal
	const handleOpenGameStatsModal = () => { setIsGameStatsModalVisible(true); };

	const handleCloseGameStatsModal = () => {
		setIsGameStatsModalVisible(false);
		if (gameOverallStats.winnerUserId) {
			if (idUser === playingUsers[0].id) saveGameStats();
			router.back();
		}
	};

	const handleOpenConfigModal = () => { setIsCfgModalVisible(true) }

	const handleCloseCfgModal = (volEff: number, volMusica: number, idxDice: number, darkMode: boolean, fScale: number) => {
		setIsCfgModalVisible(false)
		console.log(`Dado seleccionado: ${dices[idxDice].dice_name}`)
		setVolEffects(volEff);
		setVolMusic(volMusica);
		setDice(dices[idxDice]);
		setIsDarkMode(darkMode);
		setFontScale(fScale);
	}

	/* -------------------------------------------------
		LOOP DE MUSICA DE FONDO
	---------------------------------------------------*/
	const music = useAudioPlayer(musicSrc);
	const statusBgMusic = useAudioPlayerStatus(music);

	useEffect(() => {
		music.volume = volMusic;
		if (!statusBgMusic.playing) {
			music.seekTo(0);
			music.play();
		}
	}, [statusBgMusic.playing, volMusic]);

	useEffect(() => {
		cry.volume = volEffects
		funny.volume = volEffects
		bonus.volume = volEffects
		bad.volume = volEffects
		correct.volume = volEffects
		fail.volume = volEffects
	}, [volEffects])

	/*---------------------------------------------------
		MOSTRAR PANTALLA DE CARGA
	---------------------------------------------------*/
	if (isLoading || isBoardLoading || !board || playersState.length === 0) {
		return (
			<Loading />
		);
	}

	return (
		<View style={styles.container}>
			<Animated.View style={[styles.gameArea, { height: canvas_height, width: canvas_width }]}>
				<Animated.ScrollView >
					<Svg width="100%" height={canvas_height} >
						<Background
							width={canvas_width} height={canvas_height} patternWidth={board ? board.rect_width : 60} patternHeight={board ? board.rect_height : 36}
							colors={{ color1: board ? board.color_rect : "white", color2: board ? board.color_path1 : "linen", color3: board ? board.color_path2 : "mintcream" }}
							svgPath1={board ? board.path1 : ''} svgPath2={board ? board.path2 : ''}
						/>
						{hexTiles.map((item, index) => {
							if (item.effect_name === 'Inicio' || item.effect_name === 'Meta')
								return (
									<StartFinishLine key={index}
										pos={{ x: item.pos_x, y: item.pos_y }}
										size={{ width: canvas_width - item.pos_x, height: item.radius }}
										tileType={item.tile_type}
										titleText={item.effect_name === 'Inicio' ? 'SALIDA' : 'META'}
									/>);
							else {
								return (<HexTile {...item} key={index} />);
							}

						})}
						{wires.map((wire, index) => {
							return (
								<Wire key={index} width={10} scaleColor={wireScaleColor}
									from={{ x: hexTiles[wire.from_tile].pos_x, y: hexTiles[wire.from_tile].pos_y }}
									to={{ x: hexTiles[wire.to_tile].pos_x, y: hexTiles[wire.to_tile].pos_y }}
								/>)
						})}
						{ladders.map((ladder, index) => {
							return (
								<Ladder key={index} scale={1} color={ladderColor}
									from={{ x: hexTiles[ladder.from_tile].pos_x, y: hexTiles[ladder.from_tile].pos_y }}
									to={{ x: hexTiles[ladder.to_tile].pos_x, y: hexTiles[ladder.to_tile].pos_y }}
								/>)
						})}
						{/* Renderizar un Player por cada jugador */}
						{playersState.map((player, idx) => (
							<Player
								key={`player-${player.dbUserId}`}
								playerId={player.dbUserId}
								//playerName={player.userName.length > 10 ? player.userName.substring(0, 10) + '...' : player.userName}
								targetTile={player.targetTile}
								initialTile={player.currentTile}
								scale={0.8}
								color={player.color}
								playerIndex={idx}
								onMoveComplete={stableOnMoveComplete}
								tilesCoords={allTilesCoords}
							/>
						))}
					</Svg>
				</Animated.ScrollView>
			</Animated.View>

			<View style={styles.controlArea} onLayout={(event: any) => { setLayoutBottom(event.nativeEvent.layout) }}>
				{/* Hexágono contenedor del dado */}
				<View style={[styles.diceContainer, { left: layoutBottom.width / 2 - 72 }]}>
					<Svg width="100%" height={layoutBottom.height + 85}>
						<Hexagon
							pos={{ x: 72, y: 83.14 }} radius={83.14} rotation={30} borderWidth={0}
							colors={{ fill: '#6599C3', border: 'black' }}
						/>
					</Svg>
				</View>

				{/* Dado */}
				<Animated.View style={[styles.diceContainer, { left: layoutBottom.width / 2 - 72 }]}>
					{isMyTurn && (
						<Svg width="100%" height={layoutBottom.height + 85}>
							<Dice
								initialValue={1} // Dice always starts at 1 visually
								onSpinComplete={handleDiceSpinComplete} // Callback for when spin ends
								position={{ x: 33, y: 20 }}
								scale={dice.scale} lineWidth={dice.border_width}
								colors={{ faceUpColor: dice.color_faceup, faceLeftColor: dice.color_faceleft, faceRightColor: dice.color_faceright, line: dice.color_border, dots: dice.color_dots }}
								isAnimated={true}
							/>
						</Svg>
					)}
					{/* Mostrar quien tiene el turno cuando no es mi turno  */}
					{!isMyTurn && <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginBottom: -70 }}>
						<Text style={styles.turnOf}>Turno de</Text>
						{/*}
						{playersState[currentPlayerIndex].profileImage ? (
							<Image 
								source={{ uri: playersState[currentPlayerIndex].profileImage }} 
								style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'white', marginBottom: 5 }} 
							/>
						) : null} */}
						<Text style={styles.currentPlayer}>{playingUsers.find(p => p.id === playersState[currentPlayerIndex].dbUserId)?.username || '?'}</Text>
						<Text style={styles.turnOf}>{currentActionLog || `⏳`}</Text>
					</View>}
				</Animated.View>

				<Animated.View style={{ zIndex: 1 }}>
					<Svg>
						{/* Linea de cubos inferior */}
						{Array.from({ length: (layoutBottom.width / (176 * 0.38)) + 1 }, (_, i) => i).map((item, index) => {
							return (
								<Cube
									key={index}
									x={item * 176 * 0.38 - 15} y={layoutBottom.height - 37}
									scale={0.38} lineWidth={1}
									colors={{ faceUp: '#6599C3', faceLeft: '#6599C3', faceRight: '#6599C3', line: 'white' }}
								/>
							)
						})}
						{ /* Hex con trofeo   handleOpenGameStatsModal */}
						<G onPressIn={handleOpenGameStatsModal}>
							<Hexagon
								pos={{ x: 52, y: layoutBottom.height - 55 }} radius={37} rotation={30} borderWidth={0}
								colors={{ fill: 'white', border: 'white' }}
							/>
							<Path d={gameItems.trophyIcon} x={26} y={layoutBottom.height - 77} fillRule="evenodd" clipRule="evenodd" fill='#6599C3' scale={3} />
						</G>
						{/* Hex config */}
						<G onPressIn={handleOpenConfigModal}>
							<Hexagon
								pos={{ x: 320, y: layoutBottom.height - 55 }} radius={37} rotation={30} borderWidth={0}
								colors={{ fill: 'white', border: 'white' }}
							/>
							<Path d={gameItems.configIcon} x={295} y={layoutBottom.height - 80} fill='#6599C3' scale={1} />
						</G>
					</Svg>
				</Animated.View>
			</View>
			<ModalEducation
				educationItem={currentEducationItem}
				modalType={modalType}
				isModalVisible={isModalVisible}
				handleModalClose={handleModalClose}
				handleAnswer={handleAnswer}
				subtopicName={params.subtopicName ?? ''}
			/>
			<ModalGameStats
				isVisible={isGameStatsModalVisible}
				onClose={handleCloseGameStatsModal}
				startTime={gameOverallStats.startTime}
				players={playersState}
				roomCode={params.roomCode}
				creatorId={playingUsers[0].id}
				winnerUserId={gameOverallStats.winnerUserId}
				myActualDbUserId={idUser}
			/>
			<ModalConfig
				isModalVisible={isCfgModalVisible}
				handleModalClose={handleCloseCfgModal}
				currVolMusic={volMusic}
				currVolEffects={volEffects}
				currIdxDice={dices.findIndex(d => d.id === dice.id)}
				dices={dices}
				currIsDarkMode={isDarkMode}
				currFontScale={fontScale}
			/>
		</View>
	)

}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		//width: Platform.OS === "web" ? 400 : "100%",
		backgroundColor: '#6599C3',
		alignItems: "center",
		justifyContent: "center",
		width: '100%',
		height: '100%',
	},
	gameArea: {
		flex: 85,
		//width: "100%",
		//height: "300%",
		backgroundColor: 'white',
	},
	controlArea: {
		flex: 15,
		backgroundColor: 'transparent',
		width: "100%",
	},
	diceContainer: {
		top: -50,
		width: 144,
		height: 50,
		position: 'absolute',
	},
	turnOf: {
		fontSize: 16,
		color: 'white',
		fontFamily: 'Manrope_600SemiBold'
	},
	currentPlayer: {
		fontSize: 24,
		color: 'white',
		fontFamily: 'Manrope_800ExtraBold'
	},
})