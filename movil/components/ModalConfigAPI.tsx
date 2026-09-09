import { FC, useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useContextProvider } from '@/utils/ContextProvider';
import { isUrlActive, EXPECTED_API_RESPONSE, EXPECTED_SOCKET_RESPONSE } from '@/utils/utils';

const DEFAULT_API_URL = 'https://wires-and-ladders-api.vercel.app';
const DEFAULT_SOCKET_URL = 'https://wires-and-ladders-websocket.onrender.com';

interface modalCfgApiProps {
	isModalVisible: boolean,
	handleModalClose: () => void,
}

const ModalConfigAPI: FC<modalCfgApiProps> = ({ isModalVisible, handleModalClose }) => {
	const { apiURL, socketURL, setApiURL, setSocketURL } = useContextProvider();
	const [draftApi, setDraftApi] = useState(apiURL);
	const [draftSocket, setDraftSocket] = useState(socketURL);
	const [isChecking, setIsChecking] = useState(false);

	useEffect(() => {
		if (isModalVisible) {
			setDraftApi(apiURL);
			setDraftSocket(socketURL);
		}
	}, [isModalVisible]);

	const isValidUrl = (s: string) => /^https?:\/\/.+\..+/.test(s.trim());

	const handleSave = async () => {
		if (!isValidUrl(draftApi)) {
			Alert.alert('URL inválida', 'La API Base de Datos debe empezar con http:// o https://');
			return;
		}
		if (!isValidUrl(draftSocket)) {
			Alert.alert('URL inválida', 'La API de sockets debe empezar con http:// o https://');
			return;
		}

		setIsChecking(true);
		const [apiRes, sockRes] = await Promise.all([
			isUrlActive(draftApi.trim(), { expectedText: EXPECTED_API_RESPONSE }),
			isUrlActive(draftSocket.trim(), { expectedText: EXPECTED_SOCKET_RESPONSE }),
		]);
		setIsChecking(false);

		if (!apiRes.active) {
			Alert.alert('API Base de Datos no responde', apiRes.error ?? 'Sin respuesta');
			return;
		}
		if (!sockRes.active) {
			Alert.alert('API de Sockets no responde', sockRes.error ?? 'Sin respuesta');
			return;
		}

		setApiURL(draftApi.trim());
		setSocketURL(draftSocket.trim());
		handleModalClose();
	};

	const handleResetDefaults = () => {
		setDraftApi(DEFAULT_API_URL);
		setDraftSocket(DEFAULT_SOCKET_URL);
	};

	return (
		<Modal animationType="slide" transparent={true} visible={isModalVisible} onRequestClose={handleModalClose}>
			<View style={styles.modalCenteredView}>
				<View style={styles.modalView}>
					<Text style={styles.label}>API Base de Datos:</Text>
					<TextInput
						style={styles.fieldInput}
						value={draftApi}
						onChangeText={setDraftApi}
						autoCapitalize="none"
						autoCorrect={false}
						keyboardType="url"
					/>
					<Text style={styles.label}>API Sockets:</Text>
					<TextInput
						style={styles.fieldInput}
						value={draftSocket}
						onChangeText={setDraftSocket}
						autoCapitalize="none"
						autoCorrect={false}
						keyboardType="url"
					/>
					<View style={styles.buttonRow}>
						<TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={handleModalClose} disabled={isChecking}>
							<Text style={styles.buttonText}>Cancelar</Text>
						</TouchableOpacity>
						<TouchableOpacity style={[styles.actionButton, styles.saveButton, isChecking && styles.disabledButton]} onPress={handleSave} disabled={isChecking}>
							{isChecking
								? <ActivityIndicator color="white" />
								: <Text style={styles.buttonText}>Guardar</Text>
							}
						</TouchableOpacity>
					</View>
					<TouchableOpacity onPress={handleResetDefaults} style={styles.resetButton} disabled={isChecking}>
						<Text style={styles.resetText}>Restablecer defaults</Text>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	modalCenteredView: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: 'rgba(0,0,0,0.5)',
	},
	modalView: {
		margin: 20,
		backgroundColor: "lightsteelblue",
		borderRadius: 20,
		padding: 15,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
		width: '90%',
	},
	label: {
		alignSelf: 'flex-start',
		marginTop: 10,
		marginBottom: 4,
		color: '#365C80',
		fontFamily: 'Manrope_600SemiBold',
	},
	fieldInput: {
		width: '100%',
		backgroundColor: '#FFFFFF',
		borderWidth: 1.3,
		borderStyle: 'solid',
		borderRadius: 10,
		paddingHorizontal: 10,
		paddingVertical: 8,
		fontFamily: 'Manrope_600SemiBold',
		color: '#365C80',
	},
	buttonRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		width: '100%',
		marginTop: 20,
	},
	actionButton: {
		flex: 1,
		paddingVertical: 12,
		paddingHorizontal: 20,
		borderRadius: 10,
		elevation: 2,
		marginHorizontal: 5,
		alignItems: 'center',
		justifyContent: 'center',
		minHeight: 44,
	},
	cancelButton: {
		backgroundColor: '#888',
	},
	saveButton: {
		backgroundColor: '#6599C3',
	},
	disabledButton: {
		opacity: 0.6,
	},
	buttonText: {
		color: 'white',
		fontWeight: 'bold',
		textAlign: 'center',
		fontSize: 16,
	},
	resetButton: {
		marginTop: 12,
		paddingVertical: 6,
	},
	resetText: {
		color: '#365C80',
		textDecorationLine: 'underline',
		fontFamily: 'Manrope_500Medium',
	},
});

export default ModalConfigAPI;
