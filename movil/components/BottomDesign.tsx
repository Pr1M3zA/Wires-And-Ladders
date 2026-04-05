import { useContextProvider } from '@/utils/ContextProvider';
import { useRouter } from 'expo-router';
import { FC } from 'react';
import { Dimensions, View, StyleSheet, TouchableOpacity } from "react-native";
import Svg, { G } from 'react-native-svg';
import * as UIElements from '@/utils/ui-elements.json';
import Cube from '@/components/Cube';
import Icon from '@expo/vector-icons/FontAwesome6';

interface designProps { allowRanking: boolean }
const darkColors: { [key: string]: string } = UIElements.register.dark_colors;

const BottomDesign: FC<designProps> = (props) => {
   const { isDarkMode } = useContextProvider();
	const { width, height } = Dimensions.get('window');
	const router = useRouter();
	return (
		<View style={styles.designContainer}>
			<View style={[styles.designTopContainer, { backgroundColor:  isDarkMode ? '#1F3344' : 'white' }]}>
				<View style={styles.cubesContainer}>
					<Svg height='100%' width='100%'>
						<G scale={height * 0.2 * 0.00558} x={width - (352 * height * 0.2 * 0.00558 * 0.825)} y={height * 0.2 * 0.0702}>
							{UIElements.register.cubes.map((item, index) => {
								const i = structuredClone(item);
								i.colors.faceUp = isDarkMode ? darkColors[item.colors.faceUp] : item.colors.faceUp;
								i.colors.faceLeft = isDarkMode ? darkColors[item.colors.faceLeft] : item.colors.faceLeft;
								i.colors.faceRight = isDarkMode ? darkColors[item.colors.faceRight] : item.colors.faceRight;
								i.colors.line = isDarkMode ? darkColors[item.colors.line] : item.colors.line;
								return (<Cube {...i} key={index} />)
							})}
						</G>
					</Svg>
				</View>
			</View>

			<View style={styles.designBottomContainer}>
				{props.allowRanking &&
				<TouchableOpacity onPress={() => router.navigate('/Ranking')} style={styles.rankingButton}>
					<Icon name={'ranking-star'} size={32} color={'goldenrod'} />
				</TouchableOpacity>}
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	designContainer: {
		flex: 25,
		width: '100%'
	},
	designTopContainer: {
		flex: 5,
		alignItems: 'center',
	},
	designBottomContainer: {
		flex: 20,
		justifyContent: 'flex-end',
		padding: 10,
	},
	cubesContainer: {
		position: 'absolute',
		height: '500%',
		width: '100%'
	},
	rankingButton: {
		borderColor: 'white',
		borderWidth: 2,
		borderRadius: 10,
		padding: 10,
		zIndex: 1,
		width: 60,
	}
})

export default BottomDesign;