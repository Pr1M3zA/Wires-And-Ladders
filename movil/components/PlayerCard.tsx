import { FC } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useContextProvider } from '@/utils/ContextProvider';

const Gato = require('@/assets/images/GatoSalvaje.webp');
const CatBot = require('@/assets/images/catbot.jpg');

interface PlayerColor {
	fill: string;
	border: string;
	eyes: string;
}

interface PlayerCardProps {
	image: string | null | undefined;
	name: string;
	color: PlayerColor;
	size?: number;
	isHost?: boolean;
	isMe?: boolean;
	isBot?: boolean;
}

const PlayerCard: FC<PlayerCardProps> = ({ image, name, color, size = 80, isHost, isMe, isBot }) => {
	const badgeFontSize = size * 0.13;
	const nameBadgeHeight = badgeFontSize * 1.8;
	const { isDarkMode } = useContextProvider()
	const source = image === 'catbot' ? CatBot
		: image ? { uri: 'data:image/webp;base64,' + image }
		: Gato;
	const badges: string[] = [];
	if (isMe) badges.push('(Tú)');
	if (isHost) badges.push('(Host)');
	if (isBot) badges.push('(BOT)');

	return (
		<View style={styles.container}>
			<View style={[styles.avatarWrap, { width: size, height: size }]}>
				<View style={[styles.avatarCircle, {
					width: size,
					height: size,
					borderRadius: size / 2,
					borderColor: color.border,
				}]}>
					<Image
						style={[styles.avatarImg, { width: size, height: size, borderRadius: size / 2 }]}
						source={source}
						resizeMode="cover"
					/>
				</View>
				<View style={[styles.nameBadge, {
					backgroundColor: color.fill, borderColor: color.border,
					minWidth: size * 0.85, maxWidth: size * 1.4,
					paddingHorizontal: 8, paddingVertical: 3, borderRadius: size / 3,
					bottom: -nameBadgeHeight / 2
				}]}>
					<Text numberOfLines={1} style={[styles.nameBadgeText, { fontSize: badgeFontSize, color: color.border }]}>{name}</Text>
				</View>
			</View>
			{badges.length > 0 && (
				<Text style={[styles.roleText, { color: isDarkMode ? color.fill : color.border }]}>
					{badges.join(' ')}
				</Text>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		alignItems: 'center',
	},
	avatarWrap: {
		position: 'relative',
		alignItems: 'center',
		justifyContent: 'center',
	},
	avatarCircle: {
		borderWidth: 3,
		overflow: 'hidden',
		alignItems: 'center',
		justifyContent: 'center',
	},
	avatarImg: {},
	nameBadge: {
		position: 'absolute',
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 2,
	},
	nameBadgeText: {
		fontFamily: 'Manrope_700Bold',
		fontWeight: 'bold',
		textAlign: 'center',
	},
	roleText: {
		fontFamily: 'Manrope_600SemiBold',
		fontSize: 11,
		textAlign: 'center',
		marginTop: 6,
	},
});

export default PlayerCard;
