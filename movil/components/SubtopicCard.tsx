import { FC, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import type { CustomSubtopicType } from '@/utils/types';

interface SubtopicCardProps {
	item: CustomSubtopicType;
	isDarkMode: boolean;
	fontScale?: number;
	onPress?: () => void;
	style?: any;
}

const CARD_HEIGHT = 150;

const SubtopicCard: FC<SubtopicCardProps> = ({
	item,
	isDarkMode,
	fontScale = 1,
	onPress,
	style,
}) => {
	const [flipped, setFlipped] = useState(false);
	const flipAnim = useRef(new Animated.Value(0)).current;

	const frontInterpolate = flipAnim.interpolate({
		inputRange: [0, 1],
		outputRange: ['0deg', '180deg'],
	});
	const backInterpolate = flipAnim.interpolate({
		inputRange: [0, 1],
		outputRange: ['180deg', '360deg'],
	});

	const handleLongPress = () => {
		Animated.timing(flipAnim, {
			toValue: flipped ? 0 : 1,
			duration: 500,
			useNativeDriver: true,
		}).start();
		setFlipped((f) => !f);
	};

	const cardBg = isDarkMode ? '#1F3344' : 'white';
	const cardColor = item.color;
	const bodyBg = isDarkMode ? '#1F3344' : 'white';
	const subtopicColor = isDarkMode ? 'white' : '#365C80';
	const detailColor = isDarkMode ? '#BFDEF7' : '#365C80';
	const footerColor = isDarkMode ? '#BFDEF7' : '#578BB6';

	const renderHeader = () => (
		<View style={[styles.topicHeader, { backgroundColor: cardColor }]}>
			<Text
				numberOfLines={1}
				style={[styles.topicText, { fontSize: 12 * fontScale }]}
			>
				{item.topic}
			</Text>
		</View>
	);

	const renderFooter = () => (
		<Text
			style={[
				styles.footerText,
				{ color: footerColor, fontSize: 11 * fontScale },
			]}
		>
			Creado por: {item.creator_username}
		</Text>
	);

	return (
		<TouchableOpacity
			onPress={onPress}
			onLongPress={handleLongPress}
			delayLongPress={350}
			activeOpacity={0.9}
		>
			<View
				style={[
					styles.card,
					{
						width: '100%',
						height: CARD_HEIGHT,
						backgroundColor: cardBg,
						borderColor: cardColor,
					},
					style,
				]}
			>
				<Animated.View
					style={[
						styles.face,
						{
							transform: [
								{ perspective: 1000 },
								{ rotateY: frontInterpolate },
							],
						},
					]}
				>
					{renderHeader()}
					<View style={[styles.body, { backgroundColor: bodyBg }]}>
						<Text
							style={[
								styles.subtopicText,
								{ color: subtopicColor, fontSize: 16 * fontScale },
							]}
							numberOfLines={3}
						>
							{item.subtopic}
						</Text>
					</View>
					{renderFooter()}
				</Animated.View>

				<Animated.View
					style={[
						styles.face,
						{
							transform: [
								{ perspective: 1000 },
								{ rotateY: backInterpolate },
							],
						},
					]}
				>
					{renderHeader()}
					<ScrollView
						style={{ flex: 1 }}
						contentContainerStyle={[
							styles.bodyContent,
							{ backgroundColor: bodyBg },
						]}
					>
						<Text
							style={[
								styles.detailText,
								{ color: detailColor, fontSize: 13 * fontScale },
							]}
						>
							{item.subtopic_detail || 'Sin detalle disponible'}
						</Text>
					</ScrollView>
				</Animated.View>
			</View>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	card: {
		borderWidth: 1,
		borderRadius: 12,
		overflow: 'hidden',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.15,
		shadowRadius: 4,
		elevation: 3,
	},
	face: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backfaceVisibility: 'hidden',
	},
	topicHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 6,
		paddingHorizontal: 10,
	},
	topicText: {
		flex: 1,
		color: 'white',
		fontWeight: '600',
	},
	body: {
		flex: 1,
		justifyContent: 'center',
		padding: 10,
	},
	bodyContent: {
		flexGrow: 1,
		justifyContent: 'center',
		padding: 10,
	},
	subtopicText: {
		fontWeight: '700',
		textAlign: 'center',
	},
	detailText: {
		textAlign: 'left',
		lineHeight: 18,
	},
	footerText: {
		paddingHorizontal: 10,
		paddingBottom: 6,
		fontStyle: 'italic',
	},
});

export default SubtopicCard;
