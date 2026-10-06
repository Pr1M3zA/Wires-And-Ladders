import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect, useRef, use } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Switch, Image } from 'react-native';
import BottomDesign from '@/components/BottomDesign';
import PlayerCard from '@/components/PlayerCard';
import * as gameItems from '@/utils/gameitems.json';
import { io } from 'socket.io-client';
import { useContextProvider } from '@/utils/ContextProvider';
import Toast from 'react-native-toast-message';
import { getHour } from '@/utils/utils';
import Loading from '@/components/Loading';
import SubtopicSelector from '@/components/SubtopicSelector';
import SubtopicCard from '@/components/SubtopicCard';
import BoardPreview from '@/components/BoardPreview';
import { getBoardElements, getCustomSubtopicById } from '@/utils/fetchAndSet';
import { loadLocalBoard, loadLocalTiles, loadLocalShortcuts, loadLocalCustomSubtopicById } from '@/utils/dbOffline';
import type { CustomSubtopicType, BoardType, TileType, ShortCutType } from '@/utils/types';
import Icon from '@expo/vector-icons/Feather';
import MCI from '@expo/vector-icons/MaterialCommunityIcons';

const Gato = require('@/assets/images/GatoSalvaje.webp');

interface UserInGroup {
	socketId: string; // El ID de socket del usuario
	dbUserId: number;   // El ID de la base de datos del usuario
	userName: string;
	profileImage?: string | null;
}

const CAT_BOT: UserInGroup = {
	socketId: 'bot_catbot',
	dbUserId: -100,
	userName: 'CatBot',
	profileImage: 'catbot',
};

export default function GamersGroup() {
	const InitCallHour = new Date();
	const router = useRouter();
	const params = useLocalSearchParams<{ mode: string; roomCode: string }>();
	const { mode, roomCode } = params;
	const { idUser, setIdUser, userRow, setUserRow, selectSubTopic, apiURL, socketURL, socket, setSocket, isApiConnected, isSocketConnected, isDarkMode, fontScale, playingUsers, setPlayingUsers } = useContextProvider();
	const [usersInGroup, setUsersInGroup] = useState<UserInGroup[]>([]);
	const [currentRoomCode, setCurrentRoomCode] = useState(roomCode);
	const [isLoading, setIsLoading] = useState(false);
	const [isCreator, setIsCreator] = useState(mode === '0');
	const [idBoardGame, setIdBoardGame] = useState(1);
	const [idSubtopic, setIdSubtopic] = useState<number>(userRow.id_subtopic);
	const [selectedCustomSubtopic, setSelectedCustomSubtopic] = useState<CustomSubtopicType | null>(null);
	const [board, setBoard] = useState<BoardType | null>(null);
	const [tiles, setTiles] = useState<TileType[]>([]);
	const [shortcuts, setShortcuts] = useState<ShortCutType[]>([]);
	const [isBoardLoading, setIsBoardLoading] = useState(false);
	const [isSubtopicModalVisible, setIsSubtopicModalVisible] = useState(false);
	const offlineSockets = !isSocketConnected || (isCreator && userRow.id < 1);
	const isBotInRoom = usersInGroup.some(u => u.dbUserId === -100);
	const canAddBot = isCreator && !isBotInRoom && usersInGroup.length < 6;
	const usersInGroupRef = useRef(usersInGroup);
	const idBoardRef = useRef(idBoardGame);
	const idSubtopicRef = useRef(idSubtopic);
	const selectedCustomSubtopicRef = useRef(selectedCustomSubtopic);

	useEffect(() => { idSubtopicRef.current = idSubtopic; }, [idSubtopic]);

	useEffect(() => {
		idBoardRef.current = idBoardGame;
	}, [idBoardGame]);

	useEffect(() => {
		selectedCustomSubtopicRef.current = selectedCustomSubtopic;
	}, [selectedCustomSubtopic]);

	useEffect(() => {
		setIsBoardLoading(true);
		if (isApiConnected) {
			getBoardElements(idBoardGame, apiURL, setBoard, setTiles, setShortcuts)
				.finally(() => setIsBoardLoading(false));
		} else {
			Promise.all([
				loadLocalBoard(idBoardGame).then(setBoard),
				loadLocalTiles(idBoardGame).then(setTiles),
				loadLocalShortcuts(idBoardGame).then(setShortcuts),
			]).finally(() => setIsBoardLoading(false));
		}
	}, [idBoardGame, isApiConnected]);


	useEffect(() => {
		usersInGroupRef.current = usersInGroup
		if (idUser < 1) {
			const currentUserDetails = usersInGroup.find(u => u.socketId === socket?.id);
			if (currentUserDetails) {
				setIdUser(currentUserDetails.dbUserId);   // Actualiza idUser en el ContextProvider
				setUserRow({ ...userRow, id: currentUserDetails.dbUserId, username: currentUserDetails.userName });
			}
		}
		setPlayingUsers(usersInGroup.map(u => ({ id: u.dbUserId, username: u.userName, profile_image: u.profileImage, socketId: u.socketId })));
	}, [usersInGroup])

	const creatorIdUser = playingUsers[0]?.id ?? 0;
	useEffect(() => {
		if (!isApiConnected) {
			if (idSubtopic > 0) {
				loadLocalCustomSubtopicById(idSubtopic).then(setSelectedCustomSubtopic);
			}
			return;
		}
		const lookupId = creatorIdUser > 0 ? creatorIdUser : idUser;
		if (idSubtopic > 0 && lookupId > 0) {
			getCustomSubtopicById(apiURL, idSubtopic, lookupId, setSelectedCustomSubtopic);
		}
	}, [idSubtopic, creatorIdUser, idUser, apiURL, isApiConnected]);

	useEffect(() => {
		if (offlineSockets) {
			if (isCreator) {
				setUsersInGroup([{
					socketId: 'offline-self',
					dbUserId: idUser,
					userName: userRow.username,
					profileImage: userRow.profile_image,
				}]);
			}
			return;
		}

		const newSocket = io(socketURL, {
			query: {
				dbUserId: idUser,
				userName: userRow.username,
			},
			transports: ['websocket'],
		});
		setSocket(newSocket);
		setIsLoading(true);

		newSocket.on('connect', () => {
			if (isCreator) { // Creador
				//console.log('profile_image', userRow.profile_image)
				newSocket.emit('createRoom', { roomCode: currentRoomCode, user: { id: idUser, userName: userRow.username, profileImage: userRow.profile_image }, idBoardGame: 1, idSubtopic: selectSubTopic });
			} else { // Unirse
				newSocket.emit('joinRoom', { roomCode: currentRoomCode, user: { id: idUser, userName: userRow.username, profileImage: userRow.profile_image } });
			}

		});

		newSocket.on('disconnect', (reason) => {
			Toast.show({ type: 'info', text1: 'Desconectado', text2: 'Se perdió la conexión con el servidor.' });
		});

		newSocket.on('connect_error', (err) => {
			Toast.show({ type: 'error', text1: 'Error de Conexión', text2: 'No se pudo conectar al servidor del lobby.' });
			setIsLoading(false);
			router.back();
		});

		// Eventos del servidor
		newSocket.on('roomCreated', ({ roomCode, users, isCreator: creatorStatus, serverPort, idSubtopic: roomSubtopic }: { roomCode: string; users: UserInGroup[], isCreator: boolean, serverPort?: number, idSubtopic?: number }) => {
			setCurrentRoomCode(roomCode);
			setUsersInGroup(users);
			setIsCreator(creatorStatus);
			setIsLoading(false);
			if (typeof roomSubtopic === 'number') setIdSubtopic(roomSubtopic);
			const EndCallHour = new Date();
			if (userRow.is_admin)
				Toast.show({ type: 'info', text1: 'Sala creada', text2: `API SOCKETS (roomCreated): respuesta en ${EndCallHour.getTime() - InitCallHour.getTime()} ms`, position: "bottom", visibilityTime: 5000 });
			else
				Toast.show({ type: 'success', text1: 'Sala Creada', text2: `Código: ${roomCode} | Host: :${serverPort}` });
		});

		newSocket.on('joinedRoom', ({ roomCode, users, serverPort, idSubtopic: roomSubtopic }: { roomCode: string; users: UserInGroup[], serverPort?: number, idSubtopic?: number }) => {
			setCurrentRoomCode(roomCode);
			setUsersInGroup(users);
			setIsLoading(false);
			if (typeof roomSubtopic === 'number') setIdSubtopic(roomSubtopic);
			const EndCallHour = new Date();
			if (userRow.is_admin)
				Toast.show({ type: 'info', text1: 'Te uniste a la sala', text2: `API SOCKETS (joinedRoom): Respuesta en ${EndCallHour.getTime() - InitCallHour.getTime()} ms`, position: "bottom", visibilityTime: 5000 });
			else
				Toast.show({ type: 'success', text1: 'Te Uniste a la Sala', text2: `Código: ${roomCode} | Host: :${serverPort}` });
		});

		newSocket.on('groupUpdate', ({ users, idBoard, idSubtopic: groupSubtopic }: { users: UserInGroup[], idBoard: number, idSubtopic?: number }) => {
			setUsersInGroup(users);
			setIdBoardGame(idBoard);
			if (typeof groupSubtopic === 'number') setIdSubtopic(groupSubtopic);
		});

		newSocket.on('createRoomError', ({ message }: { message: string }) => {
			Toast.show({ type: 'error', text1: 'Error al Crear Sala', text2: message });
			setIsLoading(false);
			router.back();
		});

		newSocket.on('joinError', ({ message }: { message: string }) => {
			Toast.show({ type: 'error', text1: 'Error al Unirse', text2: message });
			setIsLoading(false);
			router.back();
		});

		newSocket.on('roomFull', ({ message }: { message: string }) => {
			Toast.show({ type: 'error', text1: 'Sala Llena', text2: message });
			setIsLoading(false);
			router.back();
		});

		newSocket.on('creatorLeft', ({ message }: { message: string }) => {
			Toast.show({ type: 'info', text1: 'El Creador se fue', text2: message });
			router.replace('/Lobby'); // O a la pantalla principal
		});

		newSocket.on('gameStarting', ({ gameId, idSubtopic: gameSubtopic }: { gameId: string, idSubtopic?: number }) => { // gameId podría ser útil
			if (typeof gameSubtopic === 'number') setIdSubtopic(gameSubtopic);
			Toast.show({ type: 'info', text1: '¡Comenzando Partida!', text2: `Uniéndose al juego ${currentRoomCode}` });
			router.push({
				pathname: '/BoardGame',
				params: {
					gameId, // El ID único de esta partida
					roomCode: currentRoomCode,
					players: JSON.stringify(usersInGroupRef.current.map(u => ({ dbUserId: u.dbUserId, socketId: u.socketId }))), // Serializa el array de UserInGroup, solo con los datos necesarios para el juego
					idBoard: idBoardRef.current,
					idSubtopic: idSubtopicRef.current,
					subtopicName: selectedCustomSubtopicRef.current?.subtopic ?? '',
					isCreator: isCreator ? '1' : '0',
				}
			});
		});

		return () => {
			newSocket.off('connect');
			newSocket.off('disconnect');
			newSocket.off('connect_error');
			newSocket.off('roomCreated');
			newSocket.off('joinedRoom');
			newSocket.off('groupUpdate');
			newSocket.off('createRoomError');
			newSocket.off('joinError');
			newSocket.off('roomFull');
			newSocket.off('creatorLeft');
			newSocket.off('gameStarting');
			newSocket.disconnect();
			setSocket(null);
		};
	}, []);

	const handleStartGame = () => {
		if (!isCreator) return;
		if (usersInGroup.length < 2) {
			Toast.show({ type: 'info', text1: 'Jugadores Insuficientes', text2: 'Se necesitan al menos 2 jugadores.' });
			return;
		}
		if (!offlineSockets) {
			socket?.emit('startGame', { roomCode: currentRoomCode });
		} else {
			Toast.show({ type: 'info', text1: '¡Comenzando Partida!', text2: `Iniciando partida local en ${currentRoomCode}` });
			router.push({
				pathname: '/BoardGame',
				params: {
					gameId: `local_${currentRoomCode}_${Date.now()}`,
					roomCode: currentRoomCode,
					players: JSON.stringify(usersInGroupRef.current.map(u => ({
						dbUserId: u.dbUserId,
						socketId: u.socketId,
						userName: u.userName,
						profileImage: u.profileImage,
					}))),
					idBoard: idBoardRef.current,
					idSubtopic: idSubtopicRef.current,
					subtopicName: selectedCustomSubtopicRef.current?.subtopic ?? '',
					isCreator: '1',
				},
			});
		}
	};

	const handleSelectSubtopic = (selectedId?: number, selectedItem?: CustomSubtopicType) => {
		setIsSubtopicModalVisible(false);
		if (selectedId && selectedItem) {
			setSelectedCustomSubtopic(selectedItem);
			setIdSubtopic(selectedId);
			if (socket && currentRoomCode && isCreator) {
				socket.emit('setSubtopic', { roomCode: currentRoomCode, idSubtopic: selectedId });
			}
		}
	};

	const handleAddBot = () => {
		if (!canAddBot) return;
		if (!offlineSockets) {
			socket?.emit('addBot', { roomCode: currentRoomCode });
		} else {
			setUsersInGroup(prev => prev.some(u => u.dbUserId === -100) ? prev : [...prev, CAT_BOT]);
		}
	};

	if (isLoading) {
		return (
			<Loading />
		);
	}

	return (
		<View style={[styles.container, { backgroundColor: isDarkMode ? '#3C709A' : '#6599c3' }]}>
			<View style={[styles.titleContainer, { backgroundColor: isDarkMode ? '#1F3344' : 'white' }]}>
				{currentRoomCode && <Text style={styles.roomCodeText}>{currentRoomCode}</Text>}
			</View>


			<View style={[styles.playersContainer, { backgroundColor: isDarkMode ? '#1F3344' : 'white', paddingHorizontal: 50 / fontScale }]}>
				<View style={styles.playersHeader}>
					<Text style={[styles.usersTitle, { color: isDarkMode ? '#578BB6' : '#365C80', fontSize: 18 * fontScale }]}>Jugadores ({playingUsers.length}/6):</Text>
					{canAddBot && (
						<TouchableOpacity
							style={styles.addBotIconBtn}
							onPress={handleAddBot}
							accessibilityLabel='Agregar CatBot'
						>
							<Text style={[styles.addBotPlus, { color: isDarkMode ? '#578BB6' : '#365C80', fontSize: 18 * fontScale }]}>+</Text>
							<MCI name='robot-happy-outline' size={20 * fontScale} color={isDarkMode ? '#578BB6' : '#365C80'} />
						</TouchableOpacity>
					)}
				</View>
				{playingUsers.length === 0 ? (
					<Text style={styles.emptyListText}>Esperando jugadores...</Text>
				) : (
					<View style={styles.playersGrid}>
						{[0, 1].map(row => (
							<View key={`row-${row}`} style={styles.playersRow}>
								{[0, 1, 2].map(col => {
									const idx = row * 3 + col;
									const user = playingUsers[idx];
									if (!user) return <View key={`empty-${row}-${col}`} style={styles.playerCell} />;
									const color = gameItems.playerColors[idx % gameItems.playerColors.length];
									const isMe = user.socketId === socket?.id;
									const isHost = playingUsers[0]?.socketId === user.socketId;
									return (
										<View key={user.socketId} style={styles.playerCell}>
											<PlayerCard
												image={user.profile_image}
												name={user.username}
												color={color}
												isHost={isHost}
												isMe={isMe}
												isBot={user.id === -100}
											/>
										</View>
									);
								})}
							</View>
						))}
					</View>
				)}
			</View>

			<View style={[styles.bottomCardsRow, { backgroundColor: isDarkMode ? '#1F3344' : 'white' }]}>
				<View style={{ flex: 1, paddingRight: 5 }}>
					<Text style={[styles.usersTitle, { color: isDarkMode ? '#578BB6' : '#365C80', fontSize: 18 * fontScale }]}>Tablero</Text>
					<BoardPreview board={board} tiles={tiles} shortcuts={shortcuts} isDarkMode={isDarkMode} />
				</View>
				<View style={{ flex: 1, paddingLeft: 5 }}>
					{selectedCustomSubtopic ? (
						<View style={styles.subtopicColumn}>
							<View style={styles.subtopicHeaderRow}>
								<Text style={[styles.usersTitle, { color: isDarkMode ? '#578BB6' : '#365C80', fontSize: 18 * fontScale, marginBottom: 0 }]}>
									Tema
								</Text>
								{isCreator && (
									<TouchableOpacity
										style={styles.changeSubtopicBtn}
										onPress={() => setIsSubtopicModalVisible(true)}
									>
										<Icon
											name='refresh-cw'
											size={14 * fontScale}
											color={isDarkMode ? '#578BB6' : '#365C80'}
										/>
									</TouchableOpacity>
								)}
							</View>
							<SubtopicCard
								item={selectedCustomSubtopic}
								isDarkMode={isDarkMode}
								fontScale={fontScale}
							/>
						</View>
					) : isCreator ? (
						<TouchableOpacity
							style={[styles.selectSubtopicBtn, { backgroundColor: isDarkMode ? '#3C709A' : '#6599C3' }]}
							onPress={() => setIsSubtopicModalVisible(true)}
						>
							<Icon name='plus-circle' size={20 * fontScale} color='white' />
							<Text style={{ color: 'white', fontSize: 12 * fontScale, marginLeft: 6 }}>Seleccionar tema</Text>
						</TouchableOpacity>
					) : null}
				</View>
			</View>


			<View style={[styles.buttonsContainer, { backgroundColor: isDarkMode ? '#1F3344' : 'white' }]}>
				{isCreator && (
					<TouchableOpacity style={[styles.button, playingUsers.length < 2 ? styles.buttonDisabled : {}]} onPress={handleStartGame} disabled={playingUsers.length < 2} >
						<Text style={[styles.buttonText, { fontSize: 18 * fontScale }]}>Iniciar Partida</Text>
					</TouchableOpacity>
				)}
				<TouchableOpacity style={[styles.button, styles.leaveButton]} onPress={() => router.back()} >
					<Text style={[styles.buttonText, { fontSize: 18 * fontScale }]}>Salir de la Sala</Text>
				</TouchableOpacity>
			</View>

			<BottomDesign allowRanking={false} />

			<SubtopicSelector
				isModalVisible={isSubtopicModalVisible}
				handleModalClose={handleSelectSubtopic}
			/>

		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
	},
	titleContainer: {
		flex: 10,
		paddingTop: 50,
		alignItems: 'center',
		height: '100%',
		width: '100%',
	},

	playersContainer: {
		flex: 40,
		//alignItems: 'center',
		height: '100%',
		width: '100%',
	},
	bottomCardsRow: {
		flex: 35,
		flexDirection: 'row',
		width: '100%',
		paddingHorizontal: 20,
	},
	selectSubtopicBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		//paddingVertical: 10,
		paddingHorizontal: 14,
		borderRadius: 10,
		elevation: 2,
	},
	subtopicColumn: {
		width: '100%',
	},
	subtopicHeaderRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 10,
		width: '100%',
	},
	changeSubtopicBtn: {
		paddingVertical: 4,
		paddingHorizontal: 6,
	},
	buttonsContainer: {
		flex: 15,
		alignItems: 'center',
		height: '100%',
		width: '100%',
	},
	title: {
		fontSize: 32,
		includeFontPadding: false,
		//fontWeight: 'bold',
		color: '#365C80',
		fontFamily: 'Manrope_800ExtraBold',
	},
	roomCodeText: {
		fontSize: 40,
		color: '#365C80',
		fontFamily: 'Manrope_800ExtraBold',
		textAlignVertical: 'center',
		includeFontPadding: false,
		letterSpacing: 15,
		backgroundColor: 'white',
		paddingHorizontal: 15,
		borderColor: 'steelblue',
		borderWidth: 3,
		borderRadius: 8,
	},
	usersTitle: {
		marginBottom: 10,
		//alignSelf: 'center',
		fontFamily: 'Manrope_600SemiBold',
		//textAlign: 'center',

	},
	playersHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		width: '100%',
		marginBottom: 6,
	},
	addBotIconBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 2,
		paddingHorizontal: 4,
		paddingVertical: 2,
	},
	addBotPlus: {
		fontWeight: 'bold',
		lineHeight: 20,
	},
	playersGrid: {
		width: '100%',
		alignItems: 'center',
	},
	playersRow: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		width: '100%',
		marginBottom: 8,
	},
	playerCell: {
		width: '33%',
		alignItems: 'center',
		paddingVertical: 4,
	},
	playerCellName: {
		fontFamily: 'Manrope_500Medium',
		textAlign: 'center',
		marginTop: 2,
	},
	emptyListText: {
		textAlign: 'center',
		fontSize: 16,
		color: '#777',
		marginTop: 20,
		fontFamily: 'Manrope_400Regular',
	},
	button: {
		backgroundColor: '#6599C3',
		paddingVertical: 5,
		paddingHorizontal: 30,
		borderRadius: 10,
		alignItems: 'center',
		width: '80%',
		marginBottom: 15,
		elevation: 3,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
	},
	buttonDisabled: {
		backgroundColor: '#B0C4DE', // Un color más claro para indicar deshabilitado
	},
	buttonText: {
		color: 'white',
		fontWeight: 'bold',
		fontFamily: 'Manrope_700Bold',
	},
	leaveButton: {
		backgroundColor: '#D9534F', // Un color rojo para salir
	}
});
