import { FC, useState, useCallback, useRef, useEffect } from 'react'
import { View, Text, Modal, StyleSheet, TouchableOpacity, Dimensions, Switch } from 'react-native'
import Animated from 'react-native-reanimated';
import Svg from 'react-native-svg';
import Icon from '@expo/vector-icons/Feather';
import Slider from '@react-native-community/slider';
import Dice from '@/components/Dice';
import type { DiceType } from '@/utils/types';

interface modalCfgProps {
	isModalVisible: boolean,
   currVolEffects: number,
   currVolMusic: number,
	currIdxDice: number,
	dices: DiceType[],
	currIsDarkMode: boolean,
	currFontScale: number,
	handleModalClose: (volEffects: number, volMusic: number, idxDice: number, isDarkMode: boolean, fontScale: number) => void,
}

const screenWidth = Dimensions.get('window').width;

const ModalConfig: FC<modalCfgProps> = (props) => {
   const [volEffects, setVolEffects] = useState(props.currVolEffects);
   const [volMusic, setVolMusic] = useState(props.currVolMusic);
	const [idxDice, setIdxDice] = useState(props.currIdxDice);
	const [isDarkMode, setIsDarkMode] = useState(props.currIsDarkMode);
	const [fontScale, setFontScale] = useState(props.currFontScale);
	const handleDiceSpinComplete = useCallback((diceValue: number) => { }, [])

	const prevDice = () => {
		setIdxDice(idxDice === 0 ? props.dices.length-1 : idxDice-1);
	}

	const nextDice = () => {
		setIdxDice((idxDice + 1) % props.dices.length)
	}

	return (
      <View>
         <Modal animationType="slide" transparent={true} visible={props.isModalVisible} onRequestClose={() => props.handleModalClose(volEffects, volMusic, idxDice, isDarkMode, fontScale)}>
            <View style={styles.modalCenteredView}>
               <View style={[styles.modalView, {backgroundColor:  isDarkMode ? '#1F3344' : 'white', borderColor: isDarkMode ? '#3C709A' : '#6599C3'}]}>
                  <Text style={[styles.modalTitle, {color: isDarkMode ? '#578BB6' : '#365C80', fontSize: 20 * fontScale}]}>Configuración</Text>
						{ /* Volumen de la música */ }
                  <View style={styles.controlRow}>
                     <Text style={[styles.sectionLabel, {color: isDarkMode ? '#578BB6' : '#365C80', fontSize: 14 * fontScale}]}>Volumen de la música</Text>
                     <Text style={[styles.valueLabel, {color: isDarkMode ? '#578BB6' : '#365C80', fontSize: 10 * fontScale}]}>{(volMusic * 100).toFixed(0)}%</Text>
                  </View>
                  <Slider
                     style={styles.slider}
                     minimumValue={0} maximumValue={1} step={0.01} 
                     value={volMusic} 
                     onValueChange={(value) => setVolMusic(value)} 
                     minimumTrackTintColor="#5E81AC" maximumTrackTintColor="#D8DEE9"
                     thumbTintColor="#4C566A"
                  />
						{ /* Volumen de los efectos */}
                  <View style={styles.controlRow}>
                     <Text style={[styles.sectionLabel, {color: isDarkMode ? '#578BB6' : '#365C80', fontSize: 14 * fontScale}]}>Volumen de los efectos</Text>
                     <Text style={[styles.valueLabel, {color: isDarkMode ? '#578BB6' : '#365C80', fontSize: 10 * fontScale}]}>{(volEffects * 100).toFixed(0)}%</Text>
                  </View>
                  <Slider
                     style={styles.slider}
                     minimumValue={0} maximumValue={1} step={0.01} 
                     value={volEffects} 
                     onValueChange={(value) => setVolEffects(value)} 
                     minimumTrackTintColor="#5E81AC" maximumTrackTintColor="#D8DEE9"
                     thumbTintColor="#4C566A"
                  />
						{ /* Modo oscuro */}
                  <View style={styles.controlRow}>
                     <Text style={[styles.sectionLabel, {color: isDarkMode ? '#578BB6' : '#365C80', fontSize: 14 * fontScale}]}>Modo oscuro</Text>
                     <Switch
                        value={isDarkMode}
                        onValueChange={(value) => setIsDarkMode(value)}
                        thumbColor={isDarkMode ? '#88C0D0' : '#D08770'}
                        trackColor={{ false: '#A3BE8C', true: '#81A1C1' }}
                     />
                  </View>
						{ /* Tamaño de letra */}
                  <View style={styles.controlRow}>
                     <Text style={[styles.sectionLabel, {color: isDarkMode ? '#578BB6' : '#365C80', fontSize: 14 * fontScale}]}>Tamaño de letras</Text>
                     <Text style={[styles.valueLabel, {color: isDarkMode ? '#578BB6' : '#365C80', fontSize: 10 * fontScale}]}>{fontScale.toFixed(1)}x</Text>
                  </View>
                  <Slider
                     style={styles.slider}
                     minimumValue={0.5} maximumValue={1.5} step={0.1} 
                     value={fontScale} 
                     onValueChange={(value) => setFontScale(value)} 
                     minimumTrackTintColor="#5E81AC" maximumTrackTintColor="#D8DEE9"
                     thumbTintColor="#4C566A"
                  />
						{ /* Selecciona tu estilo de dado */}
						<Text style={[styles.sectionLabel, {color: isDarkMode ? '#578BB6' : '#365C80', fontSize: 14 * fontScale}]}>Selecciona tu estilo de dado:</Text>
						<View style={styles.diceSelContainer}>
							<View style={{flex: 3, alignItems: 'flex-end', justifyContent: 'center'}}>
								<TouchableOpacity onPress={prevDice} disabled={props.dices.length === 0}>
									<Icon name='arrow-left-circle' size={40} color={props.dices.length === 0 ? 'gray' : '#6599C3'} />
								</TouchableOpacity>
							</View>
							<View style={{flex: 4}}>
								{props.dices.length > 0 && props.dices[idxDice] && (
									<Animated.View>
										<Svg width="100%" height={105}>
											<Dice 
												initialValue={1} 
												onSpinComplete={handleDiceSpinComplete} 
												position={{ x: ((screenWidth * 0.92-40) * 0.4*.5)-39, y: 10 }}
												scale={props.dices[idxDice].scale} lineWidth={props.dices[idxDice].border_width}
												colors={{ faceUpColor: props.dices[idxDice].color_faceup, faceLeftColor: props.dices[idxDice].color_faceleft, faceRightColor: props.dices[idxDice].color_faceright, line: props.dices[idxDice].color_border, dots: props.dices[idxDice].color_dots }}
												isAnimated={true}
											/>
										</Svg>
									</Animated.View> 
								)}
								<Text style={[styles.valueLabel, {color: isDarkMode ? '#578BB6' : '#365C80', fontSize: 10 * fontScale, textAlign: 'center'}]}>
									{props.dices.length > 0 && props.dices[idxDice] ? 'Dado: ' + props.dices[idxDice].dice_name : 'Cargando dados...'}
								</Text>
							</View>
							<View style={{flex: 3,alignItems: 'flex-start', justifyContent: 'center'}}>
								<TouchableOpacity onPress={nextDice} disabled={props.dices.length === 0}>
									<Icon name='arrow-right-circle' size={40} color={props.dices.length === 0 ? 'gray' : '#6599C3'} />
								</TouchableOpacity>
							</View>
						</View>
                  <TouchableOpacity style={styles.closeButton} onPress={() => props.handleModalClose(volEffects, volMusic, idxDice, isDarkMode, fontScale)}>
                     <Text style={styles.closeButtonText}>Aplicar</Text>
                  </TouchableOpacity>
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
	},
	modalView: {
		margin: 20,
		//backgroundColor: "#1E2834",
		borderRadius: 20,
		padding: 20,
		alignItems: "stretch",
		shadowColor: "#000",
		shadowOffset: {width: 0, height: 4},
		shadowOpacity: 0.35,
		shadowRadius: 10,
		elevation: 8,
		width: '92%',
		maxWidth: 420
	},
	modalTitle: {
		//fontSize: 20,
		fontWeight: '700',
		//color: '#ECEFF4',
		marginBottom: 12,
		textAlign: 'center'
	},
	sectionLabel: {
		//fontSize: 14,
		//color: '#D8DEE9',
		//marginBottom: 3,
		fontWeight: '500'
	},
	valueLabel: {
		//fontSize: 12,
		//color: '#88C0D0',
		fontWeight: '500'
	},
	controlRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 5
	},
	slider: {
		width: '100%',
		height: 20,
		marginBottom: 20,
	},
	closeButton: {
		backgroundColor: '#81A1C1',
		borderRadius: 12,
		paddingVertical: 14,
		paddingHorizontal: 28,
		elevation: 3,
		marginTop: 20,
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.25,
		shadowRadius: 6
	},
	closeButtonText: {
		color: 'white',
		fontWeight: 'bold',
		textAlign: 'center',
		fontSize: 16,
	},
	diceSelContainer: {
		flexDirection: 'row'
	}
 })

 export default ModalConfig;
