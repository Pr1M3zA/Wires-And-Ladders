import { ActivityIndicator, View, Text, StyleSheet, Dimensions } from "react-native"
import { useContextProvider } from '@/utils/ContextProvider';
import Svg from "react-native-svg"
import UABCS from "@/components/UABCS"

const Loading = () => {
   const canvas_width = Dimensions.get('window').width;
	const canvas_height = Dimensions.get('window').height;
	const { isDarkMode, fontScale } = useContextProvider();


   return (
      <View style={[styles.container, { backgroundColor:  isDarkMode ? '#1F3344' : 'white' }]}>
         <View style={styles.centeredLoading}>
            <ActivityIndicator style={{marginTop: 30}} size="large" color="#6599C3" />
            <Text style={[styles.loadingText, { fontSize: 16 * fontScale }]}>Un momento por favor...</Text>
         </View>
			<View style={[styles.logo]}>
				<Svg width="100%" height="100%">
					<UABCS x = { (canvas_width - 210) / 2 } y = { (canvas_height - 250) /2 } scale={0.2}/>
				</Svg>
			</View>
      </View>
   )
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		width: '100%',
		height: '100%',
	},
	logo: {
		width: Dimensions.get('window').width,
		height: Dimensions.get('window').height,
		top: 0,
		left: 0,
		position: 'absolute',
	},
	centeredLoading: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	loadingText: {
		paddingTop: 150,
		fontSize: 16,
		color: '#6599C3',
		fontFamily: 'Manrope_600SemiBold',
	},
})

export default Loading;
