import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react'
import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, Platform, ActivityIndicator, Switch } from 'react-native'
import Icon from '@expo/vector-icons/Feather';
import { useContextProvider } from '@/utils/ContextProvider';
import Toast from 'react-native-toast-message';
import BottomDesign from '@/components/BottomDesign';
import { getHour } from '@/utils/utils';

const Gato = require('@/assets/images/GatoSalvaje.webp');

export default function Lobby() {

	function makeCode(): string {
		let codigo = '';
		for (let i = 0; i < 5; i++) {
			const ascii = Math.floor(Math.random() * (90 - 65 + 1)) + 65;
			codigo += String.fromCharCode(ascii);
		}
		return codigo;
	}
	const router = useRouter();
	//let user = { id: 0, username: 'guest', first_name: 'Invitado', last_name: '', email: '', profile_image: null, isAdmin: false }
	const { token, apiURL, setIdUser, userRow, setUserRow, setDefDice, setDefBoard, isDarkMode, fontScale } = useContextProvider();
	//const [userRow, setUserRow] = useState(user);
	const [image, setImage] = useState(Platform.OS === 'web' ? Gato : Image.resolveAssetSource(Gato).uri);
	const [gameCode, setGameCode] = useState('');
	const [loading, setLoading] = useState(false);
	const guestMode = userRow.id < 1;

	useEffect(() => {
		if (token.length > 0 && userRow.email.length === 0) getUserData();
	}, [token]);

	useEffect(() => {
		if (userRow.profile_image != null) { // cargar la imagen si no es null
			setImage('data:image/webp;base64,' + userRow.profile_image)
		}
	}, [userRow])

	const getUserData = async () => {
		//console.log(`API GET: ${apiURL}/user: Inicio llamada a las ${getHour()}`)
		setLoading(true);
		await fetch(apiURL + '/users/user', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'authorization': token
			},
		})
			.then(response => response.json())
			.then(data => {
				//console.log(`API GET: ${apiURL}/user: Respuesta obtenida a las ${getHour()}`)
				if (data.hasOwnProperty('message')) throw new Error(data.message);
				setUserRow(data.userRow[0]);
				setIdUser(data.userRow[0].id);
				//setUserName(data.userRow[0].username);
				//setAdminUser(data.userRow[0].isAdmin === 1 ? true : false)
				setDefBoard(data.userRow[0].id_board)
				setDefDice(data.userRow[0].id_dice)
			})
			.catch(error => {
				Toast.show({ type: 'error', text1: "Error", text2: error })
			});
		setLoading(false);
	}

	return (
		<View style={[styles.container, { backgroundColor: isDarkMode ? '#3C709A' : '#6599c3' }]}>
			{/* Profile */}
			<View style={[styles.profileImgContainer, { backgroundColor: isDarkMode ? '#1F3344' : 'white' }]}>
				<View style={styles.profileSides}>
					<TouchableOpacity onPress={() => router.back()} style={{ padding: 10 }}>
						<Icon name='arrow-left' size={40} color={'#6599C3'} />
					</TouchableOpacity>
				</View>
				<View style={styles.profileCenter}>
					{loading && (<ActivityIndicator size='large' color="#6599C3" />)}
					{!loading && image && <Image source={{ uri: image }} style={styles.image} />}
				</View>
				<View style={styles.profileSides}>
					{!guestMode &&
						<TouchableOpacity style={{ padding: 20 }} onPress={() => router.push({ pathname: '/Register', params: { mode: 'edit' } })}  >
							<Icon name={'edit-3'} size={30} color={'#6599C3'} />
						</TouchableOpacity>
					}
				</View>
			</View>
			<View style={[styles.profileDataContainer, { backgroundColor: isDarkMode ? '#1F3344' : 'white' }]}>
				{!loading && <Text style={[styles.fullName, { fontSize: 24 * fontScale }]}>{userRow.first_name} {userRow.last_name}</Text>}
				{!loading && <Text style={[styles.username, { fontSize: 18 * fontScale }]}>{userRow.username}</Text>}
			</View>

			{/* Room make or join */}
			<View style={[styles.mainContainer, { backgroundColor: isDarkMode ? '#1F3344' : 'white' }]}>
				<TouchableOpacity
					disabled={guestMode}
					style={[styles.makeButton, { backgroundColor: guestMode ? '#B0C4DE' : '#6599c3' }]}
					onPress={() => router.push({ pathname: '/GamersGroup', params: { mode: 0, roomCode: makeCode() } })}
				>
					<Text style={[styles.makeText, { fontSize: 20 * fontScale, color: isDarkMode ? '#1F3344' : 'white' }]}>Crea una partida</Text>
				</TouchableOpacity>
				<View style={styles.joinContainer}>
					<Text style={[styles.joinText, { fontSize: 18 * fontScale }]}>o unirse a una partida existente:</Text>
					<View style={styles.codeInputContainer}>
						<TextInput
							style={[styles.codeInput, { color: isDarkMode ? 'white' : '#365C80', fontSize: 30 * fontScale }]}
							value={gameCode}
							onChangeText={(text) => setGameCode(text.toUpperCase())}
							maxLength={5}
							keyboardType="default"
							autoCapitalize="characters" // Asegura mayúsculas
							textAlign="center"
							caretHidden={true} // Hide cursor
						/>
					</View>
					<View style={styles.joinButtonContainer}>
						<TouchableOpacity style={styles.joinButton} onPress={() => router.push({ pathname: '/GamersGroup', params: { mode: 1, roomCode: gameCode } })}>
							<Text style={[styles.joinButtonText, { fontSize: 18 * fontScale, color: isDarkMode ? '#1F3344' : 'white' }]}>Unirse</Text>
							<Icon name={'users'} size={24} color={'white'} />
						</TouchableOpacity>
					</View>
				</View>
			</View>
			<BottomDesign allowRanking={true} />
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
	},
	profileImgContainer: {
		flex: 20,
		width: '100%',
		flexDirection: 'row',
		paddingTop: 50,
	},
	profileCenter: {
		flex: 70,
		alignItems: 'center',
		justifyContent: 'center',
		gap: 10,
	},
	profileSides: {
		flex: 30
	},
	image: {
		width: 150,
		height: 150,
		borderRadius: 75,
		borderColor: 'white',
		borderWidth: 2
	},
	profileDataContainer: {
		flex: 20,
		width: '100%',
		alignItems: 'center',
	},
	fullName: {
		color: '#6599C3',
		fontFamily: 'Manrope_800ExtraBold',
		textAlign: 'center',
		paddingHorizontal: '10%',
	},
	username: {
		color: '#6599C3',
		fontFamily: 'Manrope_200ExtraLight',
	},
	email: {
		fontSize: 16,
		color: '#6599C3',
		fontFamily: ' Manrope_400Regular',
	},
	mainContainer: {
		flex: 35,
		width: '100%',
		paddingHorizontal: '10%',
		justifyContent: 'flex-start',
		rowGap: 20,
	},
	makeButton: {
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 10,
		paddingBottom: 5,
		borderColor: '#6599C3',
		borderWidth: 2,
	},
	makeText: {
		fontFamily: 'Manrope_800ExtraBold',
	},
	joinContainer: {
		flex: 1,
		paddingHorizontal: '7%',
		justifyContent: 'center',
		alignItems: 'center',
		rowGap: 10,
	},
	joinText: {
		color: '#6599C3',
		fontFamily: 'Manrope_400Regular',
		textAlign: 'center'
	},
	joinButtonContainer: {
		width: '80%',
		flexDirection: 'row',
		alignItems: 'center',
	},
	joinButton: {
		width: '100%',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 10,
		borderRadius: 10,
		paddingBottom: 5,
		backgroundColor: '#6599c3',
		padding: 5,
		flexDirection: 'row'
	},
	joinButtonText: {
		fontFamily: 'Manrope_400Regular',
	},
	codeInputContainer: {
		width: '100%',
		maxWidth: 300,
		alignItems: 'center',
	},
	codeInput: {
		width: '80%',
		height: 60,
		borderWidth: 2,
		borderColor: '#6599C3',
		borderRadius: 8,
		letterSpacing: 10,
		paddingHorizontal: 10,
		fontFamily: 'Manrope_800ExtraBold',
		padding: 0,
		textAlignVertical: 'center',
	},

})
