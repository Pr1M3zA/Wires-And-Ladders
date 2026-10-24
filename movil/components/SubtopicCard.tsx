import { FC, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import type { CustomSubtopicType } from '@/utils/types';

interface SubtopicCardProps {
	item: CustomSubtopicType;
	isDarkMode: boolean;
	fontScale?: number;
	onPress?: () => void;
	style?: any;
	height?: number;
}

const PREVIEW_HEIGHT = 150;
const NAME_HEIGHT = 34;
const TOTAL_HEIGHT = PREVIEW_HEIGHT + NAME_HEIGHT;

const SubtopicCard: FC<SubtopicCardProps> = ({ item, isDarkMode, fontScale = 1, onPress, style, height }) => {
	const PREVIEW_HEIGHT = height || 150;
	const TOTAL_HEIGHT = PREVIEW_HEIGHT + NAME_HEIGHT;
	const [flipped, setFlipped] = useState(false);
	const flipAnim = useRef(new Animated.Value(0)).current;
	const frontInterpolate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
	const backInterpolate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });

	const handleLongPress = () => {
		Animated.timing(flipAnim, { toValue: flipped ? 0 : 1, duration: 500, useNativeDriver: true, }).start();
		setFlipped((f) => !f);
	};

	const cardBg = isDarkMode ? '#1F3344' : 'white';
	const cardColor = item.color;
	const bodyBg = isDarkMode ? '#1F3344' : 'white';
	const subtopicColor = isDarkMode ? 'white' : '#365C80';
	const detailColor = isDarkMode ? '#BFDEF7' : '#365C80';

	const renderHeader = () => (
		<View style={[styles.topicHeader, { backgroundColor: cardColor }]}>
			<Text numberOfLines={1} style={[styles.topicText, { fontSize: 12 * fontScale }]}>{item.topic}</Text>
		</View>
	);

	const renderNameContainer = () => (
		<View style={[styles.nameContainer, { backgroundColor: isDarkMode ? '#1F3344' : 'white', borderTopColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}>
			<Text
				numberOfLines={1}
				style={[styles.nameText, { color: isDarkMode ? '#BFDEF7' : '#365C80' }]}
			>
				{item.subtopic}
			</Text>
		</View>
	);

	return (
		<TouchableOpacity onPress={onPress} onLongPress={handleLongPress} delayLongPress={350} activeOpacity={0.9}>
			<View style={[styles.card, { width: '100%', height: TOTAL_HEIGHT, backgroundColor: cardBg, borderColor: cardColor, }, style,]}>
				<Animated.View style={[styles.face, { transform: [{ perspective: 1000 }, { rotateY: frontInterpolate }], },]}>
					{renderHeader()}
					<View style={[styles.previewContainer, { backgroundColor: bodyBg, height: PREVIEW_HEIGHT - 30 }]}>
						<Text style={[styles.subtopicText, { color: subtopicColor, fontSize: 16 * fontScale }]} numberOfLines={3}>{item.subtopic}</Text>
					</View>
					{renderNameContainer()}
				</Animated.View>

				<Animated.View style={[styles.face, { transform: [{ perspective: 1000 }, { rotateY: backInterpolate }], },]}>
					{renderHeader()}
					<ScrollView style={[styles.previewContainer, { height: PREVIEW_HEIGHT - 30 }]} contentContainerStyle={[styles.scrollContent, { backgroundColor: bodyBg }]}>
						<Text style={[styles.detailText, { color: detailColor, fontSize: 13 * fontScale }]}>
							{item.subtopic_detail || 'Sin detalle disponible'}
						</Text>
					</ScrollView>
					{renderNameContainer()}
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
	previewContainer: {
		padding: 10,
	},
	scrollContent: {
		flexGrow: 1,
		justifyContent: 'center',
		padding: 10,
	},
	nameContainer: {
		height: NAME_HEIGHT,
		paddingVertical: 8,
		paddingHorizontal: 10,
		alignItems: 'center',
		justifyContent: 'center',
		borderTopWidth: 1,
	},
	nameText: {
		fontSize: 12,
		fontFamily: 'Manrope_600SemiBold',
		textAlign: 'center',
	},
	subtopicText: {
		fontWeight: '700',
		textAlign: 'center',
	},
	detailText: {
		textAlign: 'left',
		lineHeight: 18,
	},
});

export default SubtopicCard;
