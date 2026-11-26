import { FC, useCallback, useEffect, useRef, useState } from 'react'
import { View, Text, Modal, StyleSheet, TouchableOpacity, Dimensions } from 'react-native'
import Animated from 'react-native-reanimated';
import type { EduInfoQuestionsType } from '@/utils/types';
import Dice from '@/components/Dice';

const MODAL_TIMEOUT_SECONDS = 20;
const COUNTDOWN_VISIBLE_SECONDS = 10;

interface modalProps {
	educationItem: EduInfoQuestionsType | null,
	modalType: 'Informativo' | 'Pregunta' | null,
	isModalVisible: boolean,
	handleModalClose: () => void,
	handleTimeout: () => void,
	handleAnswer: (selectedAnswer: number) => void,
	subtopicName: string,
}

const ModalEducation: FC<modalProps> = (props) => {
	const handleDiceSpinComplete = useCallback((diceValue: number) => { }, [])
	const width = Dimensions.get('window').width;
	const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
	const handleTimeoutRef = useRef(props.handleTimeout);
	handleTimeoutRef.current = props.handleTimeout;

	useEffect(() => {
		if (!props.isModalVisible || !props.educationItem || !props.modalType) {
			setSecondsRemaining(null);
			return;
		}

		let timeoutHandled = false;
		const deadline = Date.now() + MODAL_TIMEOUT_SECONDS * 1000;
		setSecondsRemaining(null);

		const interval = setInterval(() => {
			const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
			if (remaining <= COUNTDOWN_VISIBLE_SECONDS) {
				setSecondsRemaining(remaining);
			}
		}, 200);
		const timeout = setTimeout(() => {
			if (timeoutHandled) return;
			timeoutHandled = true;
			setSecondsRemaining(0);
			handleTimeoutRef.current();
		}, MODAL_TIMEOUT_SECONDS * 1000);

		return () => {
			clearInterval(interval);
			clearTimeout(timeout);
		};
	}, [props.educationItem?.id, props.isModalVisible, props.modalType]);

	return (
		<View>
			<Modal animationType="slide" transparent={true} visible={props.isModalVisible} onRequestClose={props.handleModalClose}>
				<View style={styles.modalCenteredView}>
					<View style={styles.modalView}>
						{secondsRemaining !== null && (
							<View
								pointerEvents="none"
								style={[
									styles.countdownBadge,
									secondsRemaining <= 3 && styles.countdownBadgeUrgent,
								]}
							>
								<Text style={[
									styles.countdownText,
									secondsRemaining <= 3 && styles.countdownTextUrgent,
								]}>
									{secondsRemaining}s
								</Text>
							</View>
						)}
						{props.educationItem && (
							<>
								<Animated.View style={{ width: '100%' }}>
									<View style={{ width: '100%', height: 90 }}>
										<Dice
											initialValue={1}
											onSpinComplete={handleDiceSpinComplete} // Callback for when spin ends
											position={{ x: ~~(((width * .9) - 120) / 2), y: 0 }}
											scale={1} lineWidth={2}
											colors={{ faceUpColor: "#6599C3", faceLeftColor: "#6599C3", faceRightColor: "#6599C3", line: "white", dots: "white" }}
											isAnimated={false}
										/>
									</View>
								</Animated.View>
								<Text style={styles.generation}>{props.modalType === 'Informativo' ? '¿Sabías que?' : '¡Pregunta!'}</Text>
								<Text style={styles.themeText}>{props.subtopicName}</Text>
								<View style={styles.separator} />

								{props.modalType === 'Informativo' && (
									<Text style={styles.modalText}>{props.educationItem.information}</Text>
								)}

								{props.modalType === 'Pregunta' && (
									<>
										<Text style={styles.modalText}>{props.educationItem.question}</Text>
										<View style={styles.modalButtonContainer}>
											<TouchableOpacity style={[styles.modalButton, styles.modalButtonOption1]} onPress={() => props.handleAnswer(1)} >
												<Text style={styles.modalButtonText}>{props.educationItem.answer_1}</Text>
											</TouchableOpacity>
											<TouchableOpacity style={[styles.modalButton, styles.modalButtonOption2]} onPress={() => props.handleAnswer(2)} >
												<Text style={styles.modalButtonText}>{props.educationItem.answer_2}</Text>
											</TouchableOpacity>
										</View>
										<View style={styles.modalButtonContainer}>
											<TouchableOpacity style={[styles.modalButton, styles.modalButtonOption3]} onPress={() => props.handleAnswer(3)} >
												<Text style={styles.modalButtonText}>{props.educationItem.answer_3}</Text>
											</TouchableOpacity>
											<TouchableOpacity style={[styles.modalButton, styles.modalButtonOption4]} onPress={() => props.handleAnswer(4)} >
												<Text style={styles.modalButtonText}>{props.educationItem.answer_4}</Text>
											</TouchableOpacity>
										</View>
									</>
								)}
							</>
						)}
						{/* Common close button if not a question (question is handled by answer buttons) */}
						{props.modalType === 'Informativo' && (
							<TouchableOpacity style={[styles.modalButton, styles.modalButtonClose]} onPress={props.handleModalClose} >
								<Text style={styles.modalButtonText}>Cerrar</Text>
							</TouchableOpacity>
						)}
					</View>
				</View>
			</Modal>
		</View>
	)
}

const styles = StyleSheet.create({
	modalCenteredView: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: 'rgba(0,0,0,0.5)',
		//borderColor: 'red',
		//borderWidth: 5,
	},
	modalView: {
		position: 'relative',
		margin: 20,
		backgroundColor: "white",
		//borderRadius: 20,
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
		borderColor: '#6599C3',
		borderWidth: 10,

	},
	countdownBadge: {
		position: 'absolute',
		top: 5,
		right: 5,
		zIndex: 2,
		minWidth: 38,
		height: 28,
		paddingHorizontal: 7,
		borderRadius: 14,
		backgroundColor: '#EAF1F7',
		alignItems: 'center',
		justifyContent: 'center',
	},
	countdownBadgeUrgent: {
		backgroundColor: '#FCE8E6',
	},
	countdownText: {
		color: '#365C80',
		fontSize: 13,
		fontWeight: 'bold',
	},
	countdownTextUrgent: {
		color: '#C0392B',
	},
	modalText: {
		//marginBottom: 10,
		textAlign: "center",
		fontFamily: 'Manrope_700Bold',
		fontSize: 20,
		color: '#5185B1',
	},
	generation: {
		textAlign: 'center',
		fontFamily: 'Jomhuria_400Regular',
		fontSize: 65,
		color: '#365C80',
		includeFontPadding: false,
	},
	themeText: {
		textAlign: 'center',
		fontFamily: 'Manrope_700Bold',
		fontSize: 15,
		color: '#5185B180'
	},
	separator: {
		height: 1,
		width: '80%',
		backgroundColor: '#ccc',
		marginVertical: 5,
	},
	modalButtonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		width: '100%',
		marginTop: 10,
	},
	modalButton: {
		borderRadius: 20,
		padding: 10,
		elevation: 2,
		minWidth: 100,
		width: Dimensions.get('window').width * 0.4,
		maxWidth: Dimensions.get('window').width * 0.4,
		alignItems: 'center',
		justifyContent: 'center',
	},
	modalButtonOption1: {
		backgroundColor: "#598DB8",
	},
	modalButtonOption2: {
		backgroundColor: "#B85C59",
	},
	modalButtonOption3: {
		backgroundColor: "#59B86D",
	},
	modalButtonOption4: {
		backgroundColor: "#B8AE59",
	},

	modalButtonClose: {
		backgroundColor: "#6c757d",
		marginTop: 20, // Increased margin
	},
	modalButtonText: {
		color: "white",
		fontWeight: "bold",
		textAlign: "center",
		fontFamily: 'Manrope_800ExtraBold',
		fontSize: 16, // Increased font size
		includeFontPadding: false,
	},
})

export default ModalEducation;
