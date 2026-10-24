import { FC } from 'react'
import { Modal, View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native'
import Ribbon from '@/components/Ribbon';
import Crown from '@/components/Crown';
import Svg, { G, Image as SvgImage, Defs, ClipPath, Circle } from 'react-native-svg';
import { useContextProvider } from '@/utils/ContextProvider';
import type { PlayerGameState, PlayingUserType } from '@/utils/types';
const Gato = require('@/assets/images/GatoSalvaje.webp');

interface ModalGameStatsProps {
	isVisible: boolean;
	onClose: () => void;
	startTime: Date;
	players: PlayerGameState[];
	roomCode: string;
	creatorId: number;
	winnerUserId: number | null;
	myActualDbUserId: number;
}

const screenWidth = Dimensions.get('window').width;
const middleModal = (screenWidth * 0.9 - 40) / 2;

const ModalGameStats: FC<ModalGameStatsProps> = (props) => {
	const { isDarkMode, setIsDarkMode, fontScale, playingUsers } = useContextProvider();
	//const [iAmWinner, setIAmWinner] = useState(false);
	if (!props.isVisible) return null;
	const sortedPlayers = [...props.players].sort((a, b) => b.pointsAccumulated - a.pointsAccumulated);
	const formatTime = props.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	let iAmWinner = false;
	let winner: PlayerGameState | undefined;
	if (props.winnerUserId !== null) {
		iAmWinner = (props.winnerUserId === props.myActualDbUserId);
		winner = sortedPlayers.find(p => p.dbUserId === props.winnerUserId);
	}
	const rankColors = [
		{ font: '#A1871F', background: '#f0e7cd' }, { font: '#505152', background: '#dedede' },
		{ font: '#986229', background: '#eedeca' }, { font: '#5185B1', background: 'transparent' },
		{ font: '#5185B1', background: 'transparent' }, { font: '#5185B1', background: 'transparent' },
	]
	const userInTop: PlayingUserType | undefined = playingUsers.find(p => p.id === sortedPlayers[0].dbUserId);

	return (
		<View>
			<Modal animationType="slide" transparent={true} visible={props.isVisible} onRequestClose={props.onClose}>
				<View style={styles.centeredView}>
					<View style={[styles.modalView, { backgroundColor: isDarkMode ? '#1F3344' : 'white', borderColor: isDarkMode ? '#3C709A' : '#6599C3' }]}>
						<Text style={[styles.modalTitle, { color: isDarkMode ? '#5398CF' : '#245680' }]}>
							{iAmWinner ? '¡Felicidades!' : props.winnerUserId ? 'Perdiste...' : 'Estadísticas'}
						</Text>
						<View style={{ borderTopColor: isDarkMode ? '#203e56' : '#bdccd9', borderTopWidth: 4, width: '80%', marginTop: -10 }}>
							<Text style={[styles.modalSubTitle, { color: isDarkMode ? '#5398CF' : '#5185B1' }]}>
								{iAmWinner ? '¡Haz ganado la partida!' : props.winnerUserId ? '¡Mejor suerte para la próxima!' : 'Código de sala:'}
							</Text>
						</View>
						{props.winnerUserId && <>
							<Svg width={"100%"} height={135} >
								<Defs>
									<ClipPath id="winnerAvatarClip">
										<Circle cx={middleModal} cy={85} r={50} />
									</ClipPath>
								</Defs>
								<Ribbon pos={{ x: middleModal - 128, y: 65 }} scale={1} color={{ front: '#a1871f', back: '#a1871f' }} />
								<G originX={middleModal} originY={100} rotation={-20}>
									<Crown pos={{ x: middleModal - 28, y: 0 }} scale={0.15} gradientColor={{ from: '#c5ae60', to: '#ffe17d' }} />
								</G>
								<SvgImage
									x={middleModal - 50} y={35} width={100} height={100}
									preserveAspectRatio='xMidYMid slice' clipPath="url(#winnerAvatarClip)"
									href={userInTop?.profile_image ? { uri: 'data:image/webp;base64,' + userInTop.profile_image } : Gato}
								/>
							</Svg>
							<View style={{ borderBottomColor: isDarkMode ? '#615e31' : '#e3dbbc', borderBottomWidth: 2, width: '70%' }}>
								<Text style={[styles.winnerName, { color: isDarkMode ? '#B49B35' : '#A1871F' }]}>{userInTop?.username || '?'}</Text>
							</View>
							<Text style={[styles.modalSubTitle, { color: isDarkMode ? '#B49B35' : '#A1871F', marginBottom: 20 }]}>{sortedPlayers[0].pointsAccumulated} puntos</Text>

						</>}

						{!props.winnerUserId && <>
							<View style={styles.roomCodeContainer}>
								<Text style={styles.roomCodeText} >{props.roomCode}</Text>
							</View>
							<View style={{ flexDirection: 'row', width: '100%', marginVertical: 20 }}>
								<View style={{ flex: 1 }}>
									<View style={{ borderBottomColor: isDarkMode ? '#203e56' : '#bdccd9', borderBottomWidth: 2, marginHorizontal: 10 }}>
										<Text style={[styles.modalSubTitle, { color: isDarkMode ? '#5398CF' : '#5185B1' }]}>Anfitrión</Text>
									</View>
									<Text style={[styles.infoText, { color: isDarkMode ? '#578BB6' : '#245680' }]}>{playingUsers.find(p => p.id === props.creatorId)?.username || '?'}</Text>
								</View>
								<View style={{ flex: 1 }}>
									<View style={{ borderBottomColor: isDarkMode ? '#203e56' : '#bdccd9', borderBottomWidth: 2, marginHorizontal: 10 }}>
										<Text style={[styles.modalSubTitle, { color: isDarkMode ? '#5398CF' : '#5185B1' }]}>Hora de inicio</Text>
									</View>
									<Text style={[styles.infoText, { color: isDarkMode ? '#578BB6' : '#245680' }]}>{formatTime}</Text>
								</View>
							</View>
						</>}

						{sortedPlayers.map((player, index) => (
							<View key={player.dbUserId} style={[styles.playerRankItem, { borderBlockColor: isDarkMode ? '#203e56' : '#bdccd9' }]}>
								<Text style={[styles.playerRankText, { flex: 2, color: rankColors[index].font, backgroundColor: rankColors[index].background }]}>
									{index + 1}°
								</Text>
								<Text style={[styles.playerRankText, { flex: 6, color: rankColors[index].font, backgroundColor: rankColors[index].background }]}>
									{playingUsers.find(p => p.id === player.dbUserId)?.username || '?'}
								</Text>
								<Text style={[styles.playerRankText, { flex: 2, color: rankColors[index].font, backgroundColor: rankColors[index].background }]}>
									{player.pointsAccumulated}
								</Text>
							</View>
						))}

						<TouchableOpacity style={styles.closeButton} onPress={props.onClose}>
							<Text style={styles.closeButtonText}>Cerrar</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		</View>
	);
};

const styles = StyleSheet.create({
	centeredView: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	modalView: {
		margin: 20,
		borderWidth: 10,
		padding: 10,
		alignItems: 'center',
		width: '90%',
		maxHeight: '80%',
	},
	modalTitle: {
		fontFamily: 'Jomhuria_400Regular',
		includeFontPadding: false,
		fontSize: 64,
		textAlign: 'center',
	},
	modalSubTitle: {
		fontFamily: 'Manrope_700Bold',
		includeFontPadding: false,
		fontSize: 18,
		textAlign: 'center',
	},
	profileImage: {
		width: 100,
		height: 100,
		borderRadius: 75,
		marginRight: 10,
		borderWidth: 2,
		borderColor: '#365C80',
	},
	winnerName: {
		fontFamily: 'Manrope_800ExtraBold',
		includeFontPadding: false,
		fontSize: 28,
		textAlign: 'center',
	},
	roomCodeContainer: {
		width: '50%',
		marginTop: 5,
		backgroundColor: '#6599C3',
		borderRadius: 50,
		paddingVertical: 10,
		elevation: 2,
	},
	roomCodeText: {
		fontFamily: 'Manrope_700Bold',
		includeFontPadding: false,
		fontSize: 24,
		textAlign: 'center',
		letterSpacing: 10,
		color: 'white',
	},
	infoText: {
		fontFamily: 'Manrope_700Bold',
		includeFontPadding: false,
		fontSize: 15,
		textAlign: 'center',
	},
	playerRankItem: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		width: '100%',
		paddingVertical: 5,
		paddingHorizontal: 15,
		borderBottomWidth: 1,
		borderTopWidth: 1,
	},
	playerRankText: {
		fontFamily: 'Manrope_700Bold',
		fontSize: 16,
		paddingVertical: 5,
		textAlign: 'center',
	},
	closeButton: {
		backgroundColor: '#6599C3',
		borderRadius: 10,
		paddingVertical: 12, // Más padding
		paddingHorizontal: 25, // Más padding
		elevation: 2,
		marginTop: 25, // Más espacio
	},
	closeButtonText: {
		color: 'white',
		fontWeight: 'bold',
		textAlign: 'center',
		fontSize: 16,
	},
});

export default ModalGameStats;