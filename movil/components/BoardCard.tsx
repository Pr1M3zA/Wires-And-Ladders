import { FC, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TouchableOpacity, Animated } from 'react-native';
import Icon from '@expo/vector-icons/Feather';
import Svg from 'react-native-svg';
import Background from '@/components/Background';
import HexTile from '@/components/HexTile';
import Wire from '@/components/Wire';
import Ladder from '@/components/Ladder';
import StartFinishLine from '@/components/StartFinishLine';
import type { BoardType, TileType, ShortCutType } from '@/utils/types';

interface BoardCardProps {
	board: BoardType | null;
	tiles: TileType[];
	shortcuts: ShortCutType[];
	isDarkMode: boolean;
	isCurrentBoard: boolean;
	onPress?: () => void;
	height?: number;
	fontScale?: number;
	style?: any;
}

const wireScaleColor = { fill: 'green', border: 'black' };
const ladderColor = { base: 'sandybrown', rung: 'saddlebrown' };

const TILE_BADGE_CONFIG = [
	{ key: 'positivas', label: 'Positivas', color: '#6CB46B', effectNames: ['Positivo', 'Positivas'] },
	{ key: 'negativas', label: 'Negativas', color: '#B46B6B', effectNames: ['Negativo', 'Negativas'] },
	{ key: 'informativas', label: 'Informativas', color: '#946BB4', effectNames: ['Informativo', 'Informativas'] },
	{ key: 'preguntas', label: 'Preguntas', color: '#6B93B4', effectNames: ['Pregunta', 'Preguntas'] },
	{ key: 'especiales', label: 'Especiales', color: '#B3B46B', effectNames: ['Especial', 'Especiales'] },
	{ key: 'sin_efecto', label: 'Sin efecto', color: '#A8A8A8', effectNames: ['Ninguno', 'Sin efecto', 'Normal'] },
];

const NAME_HEIGHT = 34;

const BoardCard: FC<BoardCardProps> = ({
	board,
	tiles = [],
	shortcuts = [],
	isDarkMode,
	isCurrentBoard,
	onPress,
	height,
	fontScale = 1,
	style,
}) => {
	const PREVIEW_HEIGHT = height || 150;
	const TOTAL_HEIGHT = PREVIEW_HEIGHT + NAME_HEIGHT;

	const [flipped, setFlipped] = useState(false);
	const [cardWidth, setCardWidth] = useState(0);

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
		setFlipped(f => !f);
	};

	if (!board) {
		return (
			<View
				style={[
					styles.card,
					{
						width: '100%',
						height: TOTAL_HEIGHT,
						backgroundColor: isDarkMode ? '#1F3344' : 'white',
						borderColor: isCurrentBoard ? (isDarkMode ? '#BFDEF7' : '#365C80') : (isDarkMode ? '#578BB6' : '#6599C3'),
					},
					style,
				]}
			>
				<View style={[styles.previewContainer, { height: PREVIEW_HEIGHT, justifyContent: 'center', alignItems: 'center' }]}>
					<Text style={{ color: isDarkMode ? '#BFDEF7' : '#365C80', textAlign: 'center' }}>Cargando…</Text>
				</View>
			</View>
		);
	}

	const viewBoxWidth = tiles.length > 0 ? Math.max(...tiles.map(t => t.pos_x + t.radius)) : 0;

	const getBadgeCount = (key: string, effectNames: string[]): number => {
		const val = (board as any)?.[key];
		if (val !== undefined && val !== null && Number(val) > 0) {
			return Number(val);
		}
		if (tiles && tiles.length > 0) {
			return tiles.filter(t => effectNames.includes(t.effect_name)).length;
		}
		return Number(val) || 0;
	};

	const visibleBadges = TILE_BADGE_CONFIG.map(cfg => ({
		...cfg,
		count: getBadgeCount(cfg.key, cfg.effectNames),
	})).filter(b => b.count > 0);

	const laddersCount = shortcuts ? shortcuts.filter(s => s.from_tile < s.to_tile).length : 0;
	const wiresCount = shortcuts ? shortcuts.filter(s => s.from_tile > s.to_tile).length : 0;

	const renderNameContainer = () => (
		<Pressable
			onPress={onPress}
			onLongPress={handleLongPress}
			delayLongPress={350}
			style={[
				styles.nameContainer,
				{
					backgroundColor: isDarkMode ? '#1F3344' : 'white',
					borderTopColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
				},
			]}
		>
			<Text
				numberOfLines={1}
				style={[styles.boardName, { color: isDarkMode ? '#BFDEF7' : '#365C80', fontSize: 12 * fontScale }]}
			>
				{board.board_name}
			</Text>
		</Pressable>
	);

	return (
		<View
			onLayout={e => {
				const w = e.nativeEvent.layout.width;
				if (w > 0) setCardWidth(w);
			}}
			style={[
				styles.card,
				{
					width: '100%',
					height: TOTAL_HEIGHT,
					backgroundColor: isDarkMode ? '#1F3344' : 'white',
					borderColor: isCurrentBoard ? (isDarkMode ? '#BFDEF7' : '#365C80') : (isDarkMode ? '#578BB6' : '#6599C3'),
				},
				isCurrentBoard && styles.currentCard,
				style,
			]}
		>
			{/* CARA FRONTAL: Tablero SVG con scroll */}
			<Animated.View
				pointerEvents={flipped ? 'none' : 'auto'}
				style={[
					styles.face,
					{ transform: [{ perspective: 1000 }, { rotateY: frontInterpolate }] },
				]}
			>
				<View style={[styles.previewContainer, { height: PREVIEW_HEIGHT }]}>
					<ScrollView
						style={{ width: '100%', height: '100%' }}
						showsVerticalScrollIndicator={true}
						nestedScrollEnabled={true}
						keyboardShouldPersistTaps="handled"
					>
						<Pressable
							onPress={onPress}
							onLongPress={handleLongPress}
							delayLongPress={350}
						>
							<Svg
								width={cardWidth}
								height={cardWidth > 0 && viewBoxWidth > 0 ? cardWidth * (board.height / viewBoxWidth) : 0}
								viewBox={`0 0 ${viewBoxWidth} ${board.height}`}
								preserveAspectRatio="xMidYMin meet"
							>
								<Background
									width={viewBoxWidth}
									height={board.height}
									patternWidth={board.rect_width}
									patternHeight={board.rect_height}
									colors={{ color1: board.color_rect, color2: board.color_path1, color3: board.color_path2 }}
									svgPath1={board.path1}
									svgPath2={board.path2}
								/>

								{tiles.map(tile => {
									if (tile.effect_name === 'Inicio' || tile.effect_name === 'Meta') {
										return (
											<StartFinishLine
												key={tile.id}
												pos={{ x: tile.pos_x, y: tile.pos_y }}
												size={{ width: viewBoxWidth - tile.pos_x, height: tile.radius }}
												tileType={tile.tile_type}
												titleText={tile.effect_name === 'Inicio' ? 'SALIDA' : 'META'}
											/>
										);
									}
									return <HexTile key={tile.id} {...tile} />;
								})}

								{shortcuts.map(shortcut => {
									const fromTile = tiles.find(t => t.num_tile === shortcut.from_tile);
									const toTile = tiles.find(t => t.num_tile === shortcut.to_tile);
									if (!fromTile || !toTile) return null;
									const fromPoint = { x: fromTile.pos_x, y: fromTile.pos_y };
									const toPoint = { x: toTile.pos_x, y: toTile.pos_y };
									const isWire = shortcut.from_tile > shortcut.to_tile;
									if (isWire) {
										return <Wire key={shortcut.id} width={10} scaleColor={wireScaleColor} from={fromPoint} to={toPoint} />;
									}
									return <Ladder key={shortcut.id} scale={1} color={ladderColor} from={fromPoint} to={toPoint} />;
								})}
							</Svg>
						</Pressable>
					</ScrollView>
				</View>

				{renderNameContainer()}
			</Animated.View>

			{/* CARA TRASERA: Pills de casillas y atajos con scroll */}
			<Animated.View
				pointerEvents={flipped ? 'auto' : 'none'}
				style={[
					styles.face,
					{ transform: [{ perspective: 1000 }, { rotateY: backInterpolate }] },
				]}
			>
				<View style={[styles.previewContainer, { height: PREVIEW_HEIGHT }]}>
					<TouchableOpacity
						style={[styles.flipIconBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)' }]}
						onPress={handleLongPress}
						hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
					>
						<Icon name="rotate-cw" size={13} color={isDarkMode ? '#BFDEF7' : '#365C80'} />
					</TouchableOpacity>

					<ScrollView
						style={{ width: '100%', height: '100%' }}
						contentContainerStyle={styles.backScrollContent}
						showsVerticalScrollIndicator={true}
						persistentScrollbar={true}
						nestedScrollEnabled={true}
						keyboardShouldPersistTaps="handled"
					>
						<Pressable
							onPress={onPress}
							onLongPress={handleLongPress}
							delayLongPress={350}
							style={{ width: '100%', alignItems: 'center' }}
						>
							{board.board_description ? (
								<Text
									style={[
										styles.boardDescText,
										{ color: isDarkMode ? '#BFDEF7' : '#365C80', fontSize: 11 * fontScale },
									]}
								>
									{board.board_description}
								</Text>
							) : null}

							<View style={styles.pillsContainer}>
								{visibleBadges.map(badge => (
									<View key={badge.key} style={[styles.pill, { backgroundColor: badge.color }]}>
										<Text style={[styles.pillText, { fontSize: 10.5 * fontScale }]}>
											{badge.label} {badge.count}
										</Text>
									</View>
								))}
								{visibleBadges.length === 0 && tiles.length > 0 && (
									<View style={[styles.pill, { backgroundColor: '#A8A8A8' }]}>
										<Text style={[styles.pillText, { fontSize: 10.5 * fontScale }]}>
											Casillas {tiles.length}
										</Text>
									</View>
								)}
								<View style={[styles.pill, styles.shortcutPillLadder]}>
									<Text style={[styles.pillText, { fontSize: 10.5 * fontScale }]}>
										Escaleras {laddersCount}
									</Text>
								</View>
								<View style={[styles.pill, styles.shortcutPillWire]}>
									<Text style={[styles.pillText, { fontSize: 10.5 * fontScale }]}>
										Wires {wiresCount}
									</Text>
								</View>
							</View>
						</Pressable>
					</ScrollView>
				</View>

				{renderNameContainer()}
			</Animated.View>
		</View>
	);
};

const styles = StyleSheet.create({
	card: {
		borderWidth: 2,
		borderRadius: 12,
		overflow: 'hidden',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.15,
		shadowRadius: 4,
		elevation: 3,
	},
	currentCard: {
		borderWidth: 3,
		elevation: 5,
	},
	face: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backfaceVisibility: 'hidden',
	},
	previewContainer: {
		width: '100%',
	},
	flipIconBtn: {
		position: 'absolute',
		top: 6,
		right: 6,
		zIndex: 10,
		width: 22,
		height: 22,
		borderRadius: 11,
		alignItems: 'center',
		justifyContent: 'center',
	},
	backScrollContent: {
		flexGrow: 1,
		paddingHorizontal: 8,
		paddingVertical: 10,
		alignItems: 'center',
	},
	boardDescText: {
		textAlign: 'center',
		marginBottom: 8,
		paddingHorizontal: 4,
		fontStyle: 'italic',
	},
	pillsContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'center',
		alignItems: 'center',
		gap: 5,
	},
	pill: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 999,
		alignItems: 'center',
		justifyContent: 'center',
		margin: 2,
	},
	pillText: {
		color: '#ffffff',
		fontFamily: 'Manrope_600SemiBold',
		fontWeight: '700',
	},
	shortcutPillLadder: {
		backgroundColor: '#D97706',
	},
	shortcutPillWire: {
		backgroundColor: '#1E824C',
	},
	nameContainer: {
		height: NAME_HEIGHT,
		paddingVertical: 6,
		paddingHorizontal: 8,
		alignItems: 'center',
		justifyContent: 'center',
		borderTopWidth: 1,
	},
	boardName: {
		fontSize: 12,
		fontFamily: 'Manrope_600SemiBold',
		textAlign: 'center',
	},
});

export default BoardCard;
