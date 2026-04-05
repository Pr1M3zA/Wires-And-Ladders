import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect, useRef, use } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Switch, Image } from 'react-native';
import BottomDesign from '@/components/BottomDesign';
import { io } from 'socket.io-client';
import { useContextProvider } from '@/utils/ContextProvider';
import Toast from 'react-native-toast-message';
import { getHour } from '@/utils/utils';
import Loading from '@/components/Loading';
import Icon from '@expo/vector-icons/Feather';

const Gato = require('@/assets/images/GatoSalvaje.webp');

interface UserInGroup {
	socketId: string; // El ID de socket del usuario
	dbUserId: number;   // El ID de la base de datos del usuario
	userName: string;
	profileImage?: string | null;
}

export default function GamersGroup() {
	const InitCallHour = new Date();
	const router = useRouter();
	const params = useLocalSearchParams<{ mode: string; roomCode: string }>();
	const { mode, roomCode } = params;
	const { idUser, setIdUser, userRow, setUserRow, defBoard, apiURL, socketURL, socket, setSocket, boards, isDarkMode, fontScale, playingUsers, setPlayingUsers } = useContextProvider();
	const [usersInGroup, setUsersInGroup] = useState<UserInGroup[]>([]);
	const [currentRoomCode, setCurrentRoomCode] = useState(roomCode);
	const [isLoading, setIsLoading] = useState(false);
	const [isCreator, setIsCreator] = useState(mode === '0');
	const [idBoardGame, setIdBoardGame] = useState(defBoard);
	const [idxBoardGame, setIdxBoardGame] = useState(0)
	const usersInGroupRef = useRef(usersInGroup);
	const idBoardRef = useRef(idBoardGame);

	useEffect(() => {
		idBoardRef.current = idBoardGame;
		if (boards.length > 0) setIdxBoardGame(boards.findIndex(b => b.id === idBoardGame))
	}, [idBoardGame]);


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

	useEffect(() => {
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
				newSocket.emit('createRoom', { roomCode: currentRoomCode, user: { id: idUser, userName: userRow.username, profileImage: userRow.profile_image }, idBoardGame: 1 });
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
		newSocket.on('roomCreated', ({ roomCode, users, isCreator: creatorStatus }: { roomCode: string; users: UserInGroup[], isCreator: boolean }) => {
			setCurrentRoomCode(roomCode);
			setUsersInGroup(users);
			setIsCreator(creatorStatus);
			setIsLoading(false);
			const EndCallHour = new Date();
			if (userRow.is_admin)
				Toast.show({ type: 'info', text1: 'Sala creada', text2: `API SOCKETS (roomCreated): respuesta en ${EndCallHour.getTime() - InitCallHour.getTime()} ms`, position: "bottom", visibilityTime: 5000 });
			else
				Toast.show({ type: 'success', text1: 'Sala Creada', text2: `Código: ${roomCode}` });
		});

		newSocket.on('joinedRoom', ({ roomCode, users }: { roomCode: string; users: UserInGroup[] }) => {
			setCurrentRoomCode(roomCode);
			setUsersInGroup(users);
			setIsLoading(false);
			const EndCallHour = new Date();
			if (userRow.is_admin)
				Toast.show({ type: 'info', text1: 'Te uniste a la sala', text2: `API SOCKETS (joinedRoom): Respuesta en ${EndCallHour.getTime() - InitCallHour.getTime()} ms`, position: "bottom", visibilityTime: 5000 });
			else
				Toast.show({ type: 'success', text1: 'Te Uniste a la Sala', text2: `Código: ${roomCode}` });
		});

		newSocket.on('groupUpdate', ({ users, idBoard }: { users: UserInGroup[], idBoard: number }) => {
			setUsersInGroup(users);
			setIdBoardGame(idBoard);
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

		newSocket.on('gameStarting', ({ gameId }: { gameId: string }) => { // gameId podría ser útil
			Toast.show({ type: 'info', text1: '¡Comenzando Partida!', text2: `Uniéndose al juego ${currentRoomCode}` });
			router.push({
				pathname: '/BoardGame',
				params: {
					gameId, // El ID único de esta partida
					roomCode: currentRoomCode,
					players: JSON.stringify(usersInGroupRef.current.map(u => ({ dbUserId: u.dbUserId, socketId: u.socketId }))), // Serializa el array de UserInGroup, solo con los datos necesarios para el juego
					idBoard: idBoardRef.current,
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
		if (socket && currentRoomCode && isCreator) {
			if (usersInGroup.length < 2) { // Mínimo 2 jugadores para empezar (o el número que definas)
				Toast.show({ type: 'info', text1: 'Jugadores Insuficientes', text2: 'Se necesitan al menos 2 jugadores.' });
				return;
			}
			socket.emit('startGame', { roomCode: currentRoomCode });
		}
	};

	const nextBoardGame = () => {
		setIdxBoardGame((idxBoardGame + 1) % boards.length)
	}

	const prevBoardGame = () => {
		setIdxBoardGame(idxBoardGame === 0 ? boards.length - 1 : idxBoardGame - 1)
	}

	useEffect(() => {
		if (idxBoardGame >= 0 && idxBoardGame < boards.length && socket && currentRoomCode && isCreator && boards.length > 0)
			socket.emit('setBoard', { roomCode: currentRoomCode, idBoard: boards[idxBoardGame].id })
	}, [idxBoardGame])

	if (isLoading) {
		return (
			<Loading />
		);
	}

	return (
		<View style={[styles.container, { backgroundColor: isDarkMode ? '#3C709A' : '#6599c3' }]}>
			<View style={[styles.titleContainer, { backgroundColor: isDarkMode ? '#1F3344' : 'white' }]}>
				<Text style={[styles.title, { color: isDarkMode ? '#578BB6' : '#365C80' }]}>Sala de Espera</Text>
				{currentRoomCode && <Text style={styles.roomCodeText}>{currentRoomCode}</Text>}
			</View>
			{/* Selección de tablero */}
			<View style={[styles.boardCointainer, { backgroundColor: isDarkMode ? '#1F3344' : 'white' }]}>
				<Text style={{ color: isDarkMode ? '#578BB6' : '#365C80', fontSize: 14 * fontScale }}>Generación:</Text>
				<View style={[styles.selBoardCointainer, { paddingHorizontal: 50 / fontScale }]}>
					<View style={styles.arrowsSelBoard}>
						{isCreator && (
							<TouchableOpacity onPress={prevBoardGame}>
								<Icon name='arrow-left-circle' size={24 * fontScale} color={isDarkMode ? '#1F3344' : 'white'} />
							</TouchableOpacity>
						)}
					</View>
					<View style={[styles.boardName]}>
						<Text style={[styles.boardNameText, { fontSize: 18 * fontScale }]}>{boards.length === 0 ? ' Cargando....' : boards[idxBoardGame].board_name}</Text>
					</View>
					<View style={styles.arrowsSelBoard}>
						{isCreator && (
							<TouchableOpacity onPress={(nextBoardGame)}>
								<Icon name='arrow-right-circle' size={24 * fontScale} color={isDarkMode ? '#1F3344' : 'white'} />
							</TouchableOpacity>
						)}
					</View>
				</View>
			</View>
			<View style={[styles.playersContainer, { backgroundColor: isDarkMode ? '#1F3344' : 'white', paddingHorizontal: 50 / fontScale }]}>
				<Text style={[styles.usersTitle, { color: isDarkMode ? '#578BB6' : '#365C80', fontSize: 18 * fontScale }]}>Jugadores ({playingUsers.length}/6):</Text>
				<FlatList
					data={playingUsers}
					keyExtractor={(item) => item.socketId}
					renderItem={({ item }) => (
						<View style={[styles.userItem, { backgroundColor: isDarkMode ? '#1F3344' : 'white', flexDirection: 'row', alignItems: 'center' }]}>
							<Image style={styles.profileImage} source={item.profile_image ? { uri: 'data:image/webp;base64,' + item.profile_image } : Gato} />
							<Text style={[styles.userName, { color: isDarkMode ? '#578BB6' : '#365C80', fontSize: 16 * fontScale }]}>{item.username} {item.socketId === socket?.id ? "(Tú)" : ""}{playingUsers[0]?.socketId === item.socketId ? " (Host)" : ""}</Text>
						</View>
					)}
					ListEmptyComponent={<Text style={styles.emptyListText}>Esperando jugadores...</Text>}
					style={styles.userList}
				/>
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

		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
	},
	titleContainer: {
		flex: 18,
		paddingTop: 50,
		alignItems: 'center',
		height: '100%',
		width: '100%',
	},
	boardCointainer: {
		flex: 10,
		//backgroundColor: 'white',
		alignItems: 'center',
		justifyContent: 'center',
		height: '100%',
		width: '100%',
	},
	selBoardCointainer: {
		width: '100%',
		flexDirection: 'row',
	},
	arrowsSelBoard: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'steelblue',
	},
	boardName: {
		flex: 5,
		alignItems: 'center',
		justifyContent: 'center',
		borderColor: '#6599C3',
		borderWidth: 1,
	},
	boardNameText: {
		color: '#6599C3',
		fontFamily: 'Manrope_400Regular',
	},

	playersContainer: {
		flex: 45,
		alignItems: 'center',
		height: '100%',
		width: '100%',
		justifyContent: 'center',
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
		alignSelf: 'flex-start',
		fontFamily: 'Manrope_600SemiBold',
		textAlign: 'center',
	},
	userList: {
		width: '100%',
		marginBottom: 10,
	},
	userItem: {
		padding: 5,
		borderRadius: 10,
		marginBottom: 10,
		borderColor: '#E0E0E0',
		borderWidth: 1,
	},
	profileImage: {
		width: 30,
		height: 30,
		borderRadius: 15,
		marginRight: 10,
		borderWidth: 1,
		borderColor: '#365C80',
	},
	userName: {
		fontFamily: 'Manrope_500Medium',
		textAlign: 'center',
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
