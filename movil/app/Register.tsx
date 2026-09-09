import Icon from '@expo/vector-icons/Feather';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImgPicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TextInput, TouchableOpacity, View, Platform, Switch } from 'react-native';
import BottomDesign from '@/components/BottomDesign';
import Toast from 'react-native-toast-message';
import { useContextProvider } from '@/utils/ContextProvider'
//import { getHour } from '@/utils/utils';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator'

const Gato = require('@/assets/images/GatoSalvaje.webp');
const IMAGE_SIZE_LIMIT = 4500000;

export default function Register() {
	const router = useRouter();
	const params = useLocalSearchParams<{ mode: string }>();
	const editMode = params.mode === 'edit';

	const { apiURL, token, userRow, setUserRow, isDarkMode, fontScale } = useContextProvider();
	const [userName, setUserName] = useState('');
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
	const [image, setImage] = useState(Platform.OS === 'web' ? Gato : Image.resolveAssetSource(Gato).uri);
	const [status, requestPermission] = ImgPicker.useMediaLibraryPermissions();
	const [loading, setLoading] = useState(false);
	const [errUserName, setErrUserName] = useState('');
	const [errFirstName, setErrFirstName] = useState('');
	const [errLastName, setErrLastName] = useState('');
	const [errEmail, setErrEmail] = useState('');
	const [errPassword, setErrPassword] = useState('');
	const [errConfirmPassword, setErrConfirmPassword] = useState('');
	const [activeButton, setActiveButton] = useState(true);

	useEffect(() => {
		if (editMode) {  // Leer datos actuales del usuario
			const InitCallHour = new Date();
			//getUserData();
			setUserName(userRow.username);
			setFirstName(userRow.first_name)
			setLastName(userRow.last_name)
			setEmail(userRow.email)
			if (userRow.profile_image != null)
				setImage('data:image/webp;base64,' + userRow.profile_image)
			const EndCallHour = new Date();
			if (userRow.is_admin)
				Toast.show({ type: 'info', text1: 'Obtener userData', text2: `Respuesta en ${EndCallHour.getTime() - InitCallHour.getTime()} ms}`, position: "bottom", visibilityTime: 5000 });

		}
		if (status === null) requestPermission();
	}, []);

	const getUserData = async () => {
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
				setUserName(data.userRow[0].username);
				setFirstName(data.userRow[0].first_name)
				setLastName(data.userRow[0].last_name)
				setEmail(data.userRow[0].email)
				if (data.userRow[0].profile_image != null)
					setImage('data:image/png;base64,' + data.userRow[0].profile_image)
			})
			.catch(error => {
				Toast.show({ type: 'error', text1: "Error", text2: error, position: 'top', visibilityTime: 3000 })
			});
		setLoading(false);
	}

	const addUser = async () => {
		const InitCallHour = new Date();
		//console.log(`Agregar usuario: API POST: ${apiURL}/user: Inicio llamada a las ${getHour(InitCallHour)}`)
		setLoading(true);
		let sizeOk = true;
		let base64img = null;
		if (image != (Platform.OS === 'web' ? Gato : Image.resolveAssetSource(Gato).uri)) {
			base64img = await FileSystem.readAsStringAsync(image, { encoding: FileSystem.EncodingType.Base64 });
			sizeOk = base64img.length < IMAGE_SIZE_LIMIT;
		}
		if (sizeOk) {
			await fetch(apiURL + '/users/user', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					username: userName,
					first_name: firstName,
					last_name: lastName,
					email: email,
					password: password,
					profile_image: base64img,
				}),
			})
				.then(response => response.json())
				.then(data => {
					const EndCallHour = new Date();
					//console.log(`Agregar usuario: API POST: ${apiURL}/user: Respuesta obtenida a las ${getHour(EndCallHour)}`)
					if (data.hasOwnProperty('affectedRows') && data.affectedRows == 1) {
						if (userRow.is_admin)
							Toast.show({ type: 'info', text1: 'Agregar usuario', text2: `Respuesta obtenida en ${EndCallHour.getTime() - InitCallHour.getTime()} ms	`, position: "bottom", visibilityTime: 5000 });
						else
							Toast.show({ type: 'success', text1: 'Correcto', text2: `Usuario creado con exito`, position: 'top', visibilityTime: 3000 });
						router.back();
					}
					if (data.hasOwnProperty('message'))
						Toast.show({ type: 'error', text1: 'API Error', text2: data.message, position: 'top', visibilityTime: 3000 });
				})
				.catch(error => {
					console.log(error)
					Toast.show({ type: 'error', text1: 'Error', text2: error.message, position: 'top', visibilityTime: 3000 });
				});

		}
		else {
			Toast.show({ type: 'error', text1: 'Imagen no soportada', text2: 'La imagen de perfil es muy grande.. eliga otra', position: 'top', visibilityTime: 3000 });
		}
		setLoading(false);
	}

	const updateUser = async () => {
		const InitCallHour = new Date();
		//console.log(`Actualizar usuario: API PUT: ${apiURL}/user: Inicio llamada a las ${getHour(InitCallHour)}`)
		setLoading(true);
		let base64img = null;
		if (image != Image.resolveAssetSource(Gato).uri)
			base64img = await FileSystem.readAsStringAsync(image, { encoding: FileSystem.EncodingType.Base64 });
		await fetch(apiURL + '/users/user', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'authorization': token
			},
			body: JSON.stringify({
				first_name: firstName,
				last_name: lastName,
				password: password,
				profile_image: base64img,
			}),
		})
			.then(response => response.json())
			.then(data => {
				setUserRow({
					...userRow,
					first_name: firstName,
					last_name: lastName,
					profile_image: base64img,
				})
				const EndCallHour = new Date();
				//console.log(`Actualizar usuario: API PUT: ${apiURL}/user: Respuesta obtenida a las ${getHour(EndCallHour)}`)
				if (data.hasOwnProperty('message'))
					Toast.show({ type: 'error', text1: 'Error', text2: data.message, position: 'top', visibilityTime: 3000 });
				if (data.hasOwnProperty('affectedRows') && data.affectedRows == 1)
					if (userRow.is_admin)
						Toast.show({ type: 'info', text1: 'Actualizar usuario', text2: `Respuesta en ${EndCallHour.getTime() - InitCallHour.getTime()} ms`, position: "bottom", visibilityTime: 5000 });
					else
						Toast.show({ type: 'success', text1: 'Correcto', text2: `Usuario actualizado con éxito`, position: 'top', visibilityTime: 3000 });
			})
			.catch(error => {
				console.log(error)
				Toast.show({ type: 'error', text1: 'Error', text2: `${error}`, position: 'top', visibilityTime: 3000 });
			});
		setLoading(false);
	}
	const validateUserName = () => {
		setUserName(prev => prev.trim())
		if (userName.trim().length === 0)
			setErrUserName('El nombre de usuario es requerido');
		else if (userName.length > 25)
			setErrUserName('El nombre de usuario no puede tener más de 25 caracteres');
		else {
			const regex = /^[a-zA-Z0-9_-]+$/;
			if (!regex.test(userName.trim()))
				setErrUserName('El nombre de usuario solo puede contener letras, números, - y _');
			else
				setErrUserName('');
		}
	}

	const validateFirstName = () => {
		setFirstName(prev => prev.trim())
		if (firstName.length === 0)
			setErrFirstName('El nombre es requerido');
		else if (firstName.length > 30)
			setErrFirstName('El nombre no puede tener más de 30 caracteres');
		else {
			const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/;
			if (!regex.test(firstName))
				setErrFirstName('El nombre solo puede contener letras y espacios');
			else
				setErrFirstName('');
		}
	}

	const validateLastName = () => {
		setLastName(prev => prev.trim())
		if (lastName.length === 0)
			setErrLastName('El apellido es requerido');
		else if (lastName.length > 30)
			setErrLastName('El apellido no puede tener más de 30 caracteres');
		else {
			const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/;
			if (!regex.test(lastName))
				setErrLastName('El apellido solo puede contener letras y espacios');
			else
				setErrLastName('');
		}
	}

	const validateEmail = () => {
		setEmail(prev => prev.trim())
		if (email.length === 0)
			setErrEmail('El correo electrónico es requerido');
		else if (email.length > 100)
			setErrEmail('El correo electrónico no puede tener más de 50 caracteres');
		else {
			const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
			if (!regex.test(email))
				setErrEmail('El correo electrónico no es válido');
			else
				setErrEmail('');
		}
	}

	const validatePassword = () => {
		setPassword(prev => prev.trim())
		if (password.length === 0)
			setErrPassword('La contraseña es requerida');
		else if (password.length < 8)
			setErrPassword('La contraseña debe tener al menos 8 caracteres');
		else if (password.length > 20)
			setErrPassword('La contraseña no puede tener más de 20 caracteres');
		else {
			const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
			if (!regex.test(password))
				setErrPassword('La contraseña debe contener al menos una letra mayúscula, una letra minúscula y un número');
			else
				setErrPassword('');
		}
	}

	const validateConfirmPassword = () => {
		if (confirmPassword.length === 0)
			setErrConfirmPassword('La confirmación de la contraseña es requerida');
		else if (confirmPassword !== password)
			setErrConfirmPassword('Las contraseñas no coinciden');
		else
			setErrConfirmPassword('');
	}

	const MAX_IMG_SIZE = 150;

	const resizeAndConvertImage = async (uri: string): Promise<string> => {
		const ctx = ImageManipulator.manipulate(uri);
		ctx.resize({ width: MAX_IMG_SIZE, height: MAX_IMG_SIZE });
		const img = await ctx.renderAsync();
		const result = await img.saveAsync({ format: SaveFormat.WEBP, compress: 0.85 });
		return result.uri;
	};

	const pickImage = async (from: 'gallery' | 'camera') => {
		let result: ImgPicker.ImagePickerResult | undefined;
		if (from === 'gallery') {
			result = await ImgPicker.launchImageLibraryAsync({
				mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 1,
			});
		} else {
			result = await ImgPicker.launchCameraAsync({
				allowsEditing: true, aspect: [1, 1], quality: 1,
			});
		}
		if (!result.canceled) {
			const resizedUri = await resizeAndConvertImage(result.assets[0].uri);
			setImage(resizedUri);
		}
	};



	useEffect(() => {
		//console.log(`${errUserName} ${errFirstName} ${errLastName} ${errEmail} ${errPassword} ${errConfirmPassword} ${editMode}`)
		if (errUserName.length == 0 && errFirstName.length == 0 && errLastName.length == 0 && errEmail.length == 0 && (editMode || errPassword.length == 0) && (editMode || errConfirmPassword.length == 0)) {
			//console.log('Sin errores')
			setActiveButton(true);
		}
		else
			setActiveButton(false);
	}, [errUserName, errFirstName, errLastName, errEmail, errPassword, errConfirmPassword, editMode]);

	return (
		<View style={[styles.container, { backgroundColor: isDarkMode ? '#3C709A' : '#6599c3' }]}>
			<View style={[styles.topBarContainer, { backgroundColor: isDarkMode ? '#1F3344' : 'white' }]}></View>
			<View style={[styles.topContainer, { backgroundColor: isDarkMode ? '#1F3344' : 'white' }]}>
				<View style={styles.backContainer}>
					<TouchableOpacity onPress={() => router.back()} style={{ padding: 10 }}>
						<Icon name='arrow-left' size={40} color={'#6599C3'} />
					</TouchableOpacity>
				</View>
				<View style={styles.profileContainer}>
					<TouchableOpacity onPress={() => pickImage('gallery')} onLongPress={() => pickImage('camera')}>
						{image && <Image source={{ uri: image }} style={[styles.profileImage, { borderColor: isDarkMode ? '#A7CFEB' : '#294270' }]} />}
					</TouchableOpacity>
				</View>
				<View style={styles.emptyContainer}></View>
			</View>
			<View style={[styles.fieldsContainer, { backgroundColor: isDarkMode ? '#1F3344' : 'white' }]}>
				{/* Username */}
				<View>
					<TextInput placeholder="Nombre de usuario" placeholderTextColor={'#365C80'} value={userName} onChangeText={setUserName} onEndEditing={validateUserName} editable={!editMode}
						style={[styles.fieldInput, userName.length > 0 ? styles.fieldFilled : styles.fieldEmpty,
						{
							borderColor: errUserName.length === 0 ? (isDarkMode ? '#A7CFEB' : '#294270') : '#B05151',
							color: isDarkMode ? '#A7CFEB' : '#365C80', fontSize: 12 * fontScale
						}
						]}
					/>
					<Text style={styles.errText}>{errUserName}</Text>
				</View>

				{/* Nombre(s) / first name */}
				<View>
					<TextInput placeholder="Nombre(s)" placeholderTextColor={'#365C80'} value={firstName} onChangeText={setFirstName} onEndEditing={validateFirstName}
						style={[styles.fieldInput, firstName.length > 0 ? styles.fieldFilled : styles.fieldEmpty,
						{
							borderColor: errFirstName.length === 0 ? (isDarkMode ? '#A7CFEB' : '#294270') : '#B05151',
							color: isDarkMode ? '#A7CFEB' : '#365C80', fontSize: 12 * fontScale
						}
						]}
					/>
					<Text style={styles.errText}>{errFirstName}</Text>
				</View>
				{/* Apellido(s) / last name */}
				<View>
					<TextInput placeholder="Apellido(s)" placeholderTextColor={'#365C80'} value={lastName} onChangeText={setLastName} onEndEditing={validateLastName}
						style={[styles.fieldInput, lastName.length > 0 ? styles.fieldFilled : styles.fieldEmpty,
						{
							borderColor: errLastName.length === 0 ? (isDarkMode ? '#A7CFEB' : '#294270') : '#B05151',
							color: isDarkMode ? '#A7CFEB' : '#365C80', fontSize: 12 * fontScale
						}
						]}
					/>
					<Text style={styles.errText}>{errLastName}</Text>
				</View>
				{/* Correo electrónico / email */}
				<View>
					<TextInput placeholder="Correo electrónico" placeholderTextColor={'#365C80'} value={email} onChangeText={setEmail} onEndEditing={validateEmail} editable={!editMode}
						style={[styles.fieldInput, email.length > 0 ? styles.fieldFilled : styles.fieldEmpty,
						{
							borderColor: errEmail.length === 0 ? (isDarkMode ? '#A7CFEB' : '#294270') : '#B05151',
							color: isDarkMode ? '#A7CFEB' : '#365C80', fontSize: 12 * fontScale
						}
						]}
					/>
					<Text style={styles.errText}>{errEmail}</Text>
				</View>
				{/* Contraseña / password */}
				<View>
					<View style={[styles.fieldInput, styles.fieldPassword, { borderColor: errPassword.length === 0 ? (isDarkMode ? '#A7CFEB' : '#294270') : '#B05151' }]}>
						<TextInput secureTextEntry={!isPasswordVisible} placeholder="Contraseña" placeholderTextColor={'#365C80'} value={password} onChangeText={setPassword} onEndEditing={validatePassword}
							style={[password.length > 0 ? styles.fieldFilled : styles.fieldEmpty, { flex: 1, color: isDarkMode ? '#A7CFEB' : '#365C80', fontSize: 12 * fontScale }]}
						/>
						<TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
							<Icon name={isPasswordVisible ? 'eye-off' : 'eye'} size={24} color={'#6599C3'} />
						</TouchableOpacity>
					</View>
					<Text style={styles.errText}>{errPassword}</Text>
				</View>
				{/* Confirmar contraseña / confirm password */}
				<View>
					<View style={[styles.fieldInput, styles.fieldPassword, { borderColor: errConfirmPassword.length === 0 ? (isDarkMode ? '#A7CFEB' : '#294270') : '#B05151' }]}>
						<TextInput secureTextEntry={!isConfirmPasswordVisible} placeholder="Confirma tu contraseña" placeholderTextColor={'#365C80'} value={confirmPassword} onChangeText={setConfirmPassword} onEndEditing={validateConfirmPassword}
							style={[confirmPassword.length > 0 ? styles.fieldFilled : styles.fieldEmpty, { flex: 1, color: isDarkMode ? '#A7CFEB' : '#365C80', fontSize: 12 * fontScale }]} />
						<TouchableOpacity onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}>
							<Icon name={isConfirmPasswordVisible ? 'eye-off' : 'eye'} size={24} color={'#6599C3'} />
						</TouchableOpacity>
					</View>
					<Text style={styles.errText}>{errConfirmPassword}</Text>
				</View>
			</View>
			<View style={[styles.buttonContainer, { backgroundColor: isDarkMode ? '#1F3344' : 'white' }]}>
				{loading && (<ActivityIndicator size='large' color="#6599C3" />)}
				{!loading && (<TouchableOpacity style={styles.registerButton} onPress={editMode ? updateUser : addUser} disabled={!activeButton}>
					<Text style={[styles.registerText, { fontSize: 20 * fontScale, color: isDarkMode ? '#1F3344' : 'white' }]}>{editMode ? 'Actualizar' : 'Crear cuenta'}</Text>
				</TouchableOpacity>)}
			</View>

			<BottomDesign allowRanking={false} />

		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
	},
	topBarContainer: {
		flex: 5,
	},
	topContainer: {
		flex: 15,
		flexDirection: 'row',
	},
	fieldsContainer: {
		flex: 50,
		paddingHorizontal: '7%',
		justifyContent: 'space-evenly',
	},
	buttonContainer: {
		flex: 5,
		paddingHorizontal: '10%',
		justifyContent: 'flex-start',
		gap: 50,
	},
	backContainer: {
		flex: 15
	},
	profileContainer: {
		flex: 70,
		alignItems: 'center',
	},
	profileImage: {
		width: 100,
		height: 100,
		borderRadius: 50,
		borderWidth: 2,
		borderColor: '#294270',
	},
	emptyContainer: {
		flex: 15
	},
	fieldInput: {
		borderWidth: 1.3,
		borderStyle: 'solid',
		borderRadius: 10,
		paddingHorizontal: 10,
	},
	fieldFilled: {
		fontFamily: 'Manrope_600SemiBold',
	},
	fieldEmpty: {
		fontFamily: 'Manrope_400Regular'
	},
	fieldPassword: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	registerButton: {
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#6599c3',
		borderRadius: 10,
		paddingBottom: 5,
	},
	registerText: {
		fontFamily: 'Manrope_800ExtraBold'
	},
	errText: {
		fontSize: 11,
		color: '#B05151',
		alignSelf: 'flex-start',
		marginLeft: 10,
		marginTop: 5
	}
})


