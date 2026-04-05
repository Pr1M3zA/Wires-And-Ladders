import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Platform, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useContextProvider } from '@/utils/ContextProvider';
import Svg, { Circle, G, Rect } from 'react-native-svg';
import Icon from '@expo/vector-icons/Feather';
import Cube from '@/components/Cube'
import Figure from '@/components/Figure';
import * as UIElements from '@/utils/ui-elements.json';
import { SyncBoardData } from '@/utils/db';
import Loading from '@/components/Loading';
import Toast from 'react-native-toast-message';
import * as SQLite from 'expo-sqlite';
import { BoardType, EffectType, TileType, ShortCutType, DiceType } from '@/utils/types';
import ModalConfigAPI from '@/components/ModalConfigAPI';
import ModalConfig from '@/components/ModalConfig';


const darkColors: { [key: string]: string } = UIElements.start.dark_colors;

export default function Start() {
	const { token, setToken, userRow, setUserRow, apiURL, setTileTypes, setTiles, setShortcuts, setBoards, setDices, isDarkMode, setIsDarkMode, fontScale, setFontScale, dices } = useContextProvider();
	const router = useRouter();
	const [layoutBottom, setLayoutBottom] = useState({ x: 0, y: 0, width: 0, height: 0 });
	const [layoutTop, setLayoutTop] = useState({ x: 0, y: 0, width: 0, height: 0 });
	const [isLoading, setIsLoading] = useState(false);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [isCfgModalVisible, setIsCfgModalVisible] = useState(false);
	const [isDbLoaded, setIsDbLoaded] = useState(false);
	const [volMusic, setVolMusic] = useState(1);
	const [volEffects, setVolEffects] = useState(1);
	const [idxDice, setIdxDice] = useState(0);	//const [forceSyncDb, setForceSyncDb] = useState(false)
	const handleLayoutBottom = (event: any) => { setLayoutBottom(event.nativeEvent.layout) };
	const handleLayoutTop = (event: any) => { setLayoutTop(event.nativeEvent.layout) };

	const SyncAndLoadDbData = async (forceSyncDb: boolean) => {
		const InitCallHour = new Date()
		const db = await SQLite.openDatabaseAsync('WiresAndLadders.db');
		try {
			setIsLoading(true)
			await SyncBoardData(apiURL, db, forceSyncDb);
			await GetLocalDbBoardElements(db);
		} catch (error: any) {
			console.log(error.message)
			Toast.show({ type: 'error', text1: 'Error', text2: error.message })
		} finally {
			await db.closeAsync();

			const EndCallHour = new Date();
			if (userRow.is_admin)
				Toast.show({ type: 'info', text1: 'DB local Sync', text2: `API GET: respuesta en ${EndCallHour.getTime() - InitCallHour.getTime()} ms`, position: "bottom", visibilityTime: 5000 });

			setIsLoading(false)
		}

	}
	useEffect(() => {
		SyncAndLoadDbData(false)
	}, [])

	const handleCloseModal = async () => {
		setIsModalVisible(false)
		await SyncAndLoadDbData(true)
	}

	const handleCloseCfgModal = (volEff: number, volMusica: number, idxDice: number, darkMode: boolean, fScale: number) => {
		setIsCfgModalVisible(false);
		setVolEffects(volEff);
		setVolMusic(volMusica);
		setIdxDice(idxDice);
		setIsDarkMode(darkMode);
		setFontScale(fScale);
	}

	const logOut = () => {
		setToken('');
		setUserRow({ id: 0, username: 'guest', first_name: 'Invitado', last_name: '', email: '', profile_image: null, is_admin: false });
		//router.replace('/Login');
	}

	/*-----------------------------------------------------------
			CARGA DE TABLEROS, CASILLAS, ATAJOS Y TIPOS DE CASILLAS
		------------------------------------------------------------*/
	const GetLocalDbBoardElements = async (db: SQLite.SQLiteDatabase) => {
		// Get Shortcuts
		await db.getAllAsync('SELECT id, id_board, from_tile, to_tile FROM shortcuts ORDER BY id_board')
			.then(data => {
				//console.log(`Shortcuts: ${data.length}`)
				setShortcuts(data as ShortCutType[])
			})
			.catch(error => {
				console.log(error.message)
				Toast.show({ type: 'error', text1: 'Error (Get Shortcuts local)', text2: error.message })
			});
		// Get Boards
		await db.getAllAsync('SELECT b.id, board_name, width, height, rect_width, rect_height, path1, path2, color_rect, color_path1, color_path2, education FROM boards b INNER JOIN board_backgrounds bb ON b.id_background=bb.id ORDER BY b.id')
			.then(data => {
				//console.log(`Boards: ${data.length}`)
				setBoards(data as BoardType[])
			})
			.catch(error => {
				console.log(error.message)
				Toast.show({ type: 'error', text1: 'Error (Get Boards local)', text2: error.message })
			});
		// Get Tiles
		await db.getAllAsync('SELECT t.id, id_board, num_tile, pos_x, pos_y, tile_type, rotation, radius, border_width, tt.effect_name, direction FROM tiles t INNER JOIN tile_types tt ON t.tile_type=tt.id ORDER BY id_board, num_tile')
			.then(data => {
				//console.log(`Tiles: ${data.length}`)
				setTiles(data as TileType[])
			})
			.catch(error => {
				console.log(error.message)
				Toast.show({ type: 'error', text1: 'Error (Get Tiles local)', text2: error.message })
			});
		// Get Tile Types
		await db.getAllAsync('SELECT id, effect_name, color_fill, color_border, color_path1, color_path2, path1, path2, paths_x, paths_y, paths_scale FROM tile_types ORDER BY id')
			.then(data => {
				//console.log(`Tile Types: ${data.length}`)
				setTileTypes(data as EffectType[])
			})
			.catch(error => {
				console.log(error.message)
				Toast.show({ type: 'error', text1: 'Error (Get Tile Types local)', text2: error.message })
			});

		// Get Dices
		await db.getAllAsync('SELECT id, dice_name, color_faceup, color_faceleft, color_faceright, color_dots, color_border, border_width, scale FROM dices ORDER BY id')
			.then(data => {
				//console.log(`Dices: ${data.length}`)
				setDices(data as DiceType[])
			})
			.catch(error => {
				console.log(`dices: ${error.message}`)
				Toast.show({ type: 'error', text1: 'Error (Get Dices local)', text2: error.message })
			});

		setIsDbLoaded(true);
		//await db.closeAsync();
		if (userRow.is_admin)
			Toast.show({ type: 'success', text1: 'Sync Local DB', text2: "Base de datos local sincronizada" })
	}

	if (isLoading) return (
		<Loading />
	)

	return (
		<View style={[styles.container, { backgroundColor: isDarkMode ? '#1F3344' : 'white' }]}>
			<View style={styles.titleContainer} onLayout={handleLayoutTop}>
				<View style={styles.titleSides}>
					{token.length > 0 &&
						<TouchableOpacity onPress={logOut} >
							<Icon name='log-out' size={40} color={'red'} />
						</TouchableOpacity>
					}
				</View>
				<View style={styles.titleCenter}>
					<Svg height='100%' width='100%'>
						<G x={layoutTop.width * 0.7 / 2 - 88} y={0} scale={1}>
							<Cube
								x={0} y={0} scale={1}
								colors={{
									faceUp: isDarkMode ? '#3C709A' : '#6599c3',
									faceLeft: isDarkMode ? '#578BB6' : '#78bdf6',
									faceRight: isDarkMode ? '#578BB6' : '#78bdf6',
									line: isDarkMode ? '#A7CFEB' : 'white'
								}}
								lineWidth={2}
							/>
							{UIElements.start.circles.map((item, index) => {
								item.fill = isDarkMode ? "#BFDEF7" : 'white';
								return (<Circle {...item} key={index} />)
							})}
							<Rect x={0} y={105} width={275} height={40} fill={isDarkMode ? '#1F3344' : 'white'}></Rect>
						</G>
					</Svg>
					<Text style={[styles.titleText, { color: isDarkMode ? '#578BB6' : '#6599c3' }]}>Wires&Ladders</Text>
				</View>
				<View style={styles.titleSides}>
					<TouchableOpacity onPress={() => setIsCfgModalVisible(true)} disabled={!isDbLoaded}>
						<Icon name='settings' size={40} color={isDbLoaded ? isDarkMode ? 'lightgray' : 'steelblue' : 'gray'} />
					</TouchableOpacity>
					{userRow.is_admin &&
						<TouchableOpacity onPress={() => setIsModalVisible(true)} >
							<Icon name='link' size={40} color={'gray'} />
						</TouchableOpacity>}

				</View>
			</View>
			<View style={styles.buttonsContainer}>
				<TouchableOpacity style={[styles.loginButton, { backgroundColor: isDarkMode ? '#3C709A' : '#6599C3' }]} onPress={() => router.push(token.length > 0 ? '/Lobby' : '/Login')}>
					<Text style={[styles.loginText, { fontSize: 20 * fontScale, color: isDarkMode ? '#1F3344' : 'white' }]}>{token.length > 0 ? 'Continuar' : 'Iniciar sesión'}</Text>
				</TouchableOpacity>

				{token.length == 0 &&
					<TouchableOpacity style={[styles.registerButton, { borderColor: isDarkMode ? '#578BB6' : '#6599C3' }]} onPress={() => router.push('/Register')}>
						<Text style={[styles.registerText, { fontSize: 20 * fontScale, color: isDarkMode ? '#578BB6' : '#6599C3' }]}>Crear cuenta</Text>
					</TouchableOpacity>}

				{token.length == 0 &&
					<TouchableOpacity style={styles.guestButton} onPress={() => router.navigate('/Lobby')}>
						<Text style={[styles.guestText, { fontSize: 12 * fontScale, color: isDarkMode ? '#578BB6' : '#365C80' }]}>o, continuar como Invitado</Text>
					</TouchableOpacity>}

				{token.length > 0 && userRow.is_admin &&
					<TouchableOpacity style={styles.dashboard} onPress={() => router.navigate('/Dashboard')} >
						<Icon name='bar-chart-2' size={32} color={'green'} />
						<Icon name='pie-chart' size={32} color={'purple'} />
					</TouchableOpacity>
				}

			</View>
			<View style={[styles.designContainer, { backgroundColor: isDarkMode ? '#3C709A' : '#6599c3' }]} onLayout={handleLayoutBottom}>
				<Svg height='100%' width='100%'>
					<G scale={layoutBottom.width * 0.00236} y={layoutBottom.height - 310 - (Platform.OS === 'ios' ? 40 : 0)}>
						{UIElements.start.cubes.map((item, index) => {
							const i = structuredClone(item);
							i.colors.faceUp = isDarkMode ? darkColors[item.colors.faceUp] : item.colors.faceUp;
							i.colors.faceLeft = isDarkMode ? darkColors[item.colors.faceLeft] : item.colors.faceLeft;
							i.colors.faceRight = isDarkMode ? darkColors[item.colors.faceRight] : item.colors.faceRight;
							return (<Cube {...i} key={index} />)
						})}
						{UIElements.start.figures.map((item, index) => {
							item.colors.bodyColor = isDarkMode ? (item.colors.bodyColor === '#FFFFFF' ? '#385873' : item.colors.bodyColor) : (item.colors.bodyColor === '#385873' ? '#FFFFFF' : item.colors.bodyColor);
							item.colors.headColor = isDarkMode ? (item.colors.headColor === '#FFFFFF' ? '#385873' : item.colors.headColor) : (item.colors.headColor === '#385873' ? '#FFFFFF' : item.colors.headColor);
							return (<Figure {...item} key={index} />)
						})}
					</G>
				</Svg>
			</View>
			<ModalConfigAPI isModalVisible={isModalVisible} handleModalClose={handleCloseModal} />
			<ModalConfig
				isModalVisible={isCfgModalVisible}
				handleModalClose={handleCloseCfgModal}
				currVolMusic={volMusic}
				currVolEffects={volEffects}
				currIdxDice={idxDice}
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
		justifyContent: 'center',
		paddingTop: 50,
	},
	text: {
		fontSize: 20,
		color: '#000'
	},
	titleContainer: {
		height: '100%',
		width: '100%',
		flex: 30,
		flexDirection: 'row',
	},
	titleCenter: {
		flex: 70,
		alignItems: 'center',
	},
	titleSides: {
		flex: 15,
	},

	titleText: {
		fontSize: 55,
		//color: '#6599c3',
		fontFamily: 'Jomhuria_400Regular',
		position: 'absolute',
		top: 80,
		textAlign: 'center',
	},
	buttonsContainer: {
		marginTop: 30,
		flex: 30,
		paddingHorizontal: '10%',
		gap: 50,
		justifyContent: 'center',
		//alignItems: 'center',
	},
	loginButton: {
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 10,
		paddingBottom: 5,
		//borderColor: '#6599C3',
		//borderWidth: 2,
	},
	loginText: {
		fontSize: 20,
		color: '#FFFFFF',
		fontFamily: 'Manrope_800ExtraBold'
	},
	registerButton: {
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'transparent',
		borderWidth: 1.3,
		borderStyle: 'solid',
		borderRadius: 10,
		paddingBottom: 5,
	},
	registerText: {
		fontSize: 20,
		color: '#6599C3',
		fontFamily: 'Manrope_800ExtraBold'
	},
	guestButton: {
		marginTop: -40,
		alignSelf: 'flex-end',
	},
	guestText: {
		fontSize: 12,
		color: '#365C80',
		fontFamily: 'Manrope_800ExtraBold',
		borderBottomColor: '#365C80',
		borderBottomWidth: 2
	},
	dashboard: {
		backgroundColor: 'white',
		borderColor: 'red',
		borderWidth: 2,
		borderRadius: 30,
		flexDirection: 'row',
		gap: 10,
		padding: 10,
		justifyContent: 'center',
		marginLeft: '60%',

	},
	designContainer: {
		flex: 40,
		width: '100%',
	},
})

