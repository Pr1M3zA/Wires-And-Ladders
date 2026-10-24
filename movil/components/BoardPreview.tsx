import { FC, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, useWindowDimensions, Pressable } from 'react-native';
import Svg from 'react-native-svg';
import Background from '@/components/Background';
import HexTile from '@/components/HexTile';
import Wire from '@/components/Wire';
import Ladder from '@/components/Ladder';
import StartFinishLine from '@/components/StartFinishLine';
import type { BoardType, TileType, ShortCutType } from '@/utils/types';

interface BoardPreviewProps {
	board: BoardType | null;
	tiles: TileType[];
	shortcuts: ShortCutType[];
	isDarkMode: boolean;
	onPress?: () => void;
}

const wireScaleColor = { fill: 'green', border: 'black' };
const ladderColor = { base: 'sandybrown', rung: 'saddlebrown' };

const BoardPreview: FC<BoardPreviewProps> = ({ board, tiles, shortcuts, isDarkMode, onPress }) => {
	if (!board) {
		return (
			<View style={styles.placeholder}>
				<Text style={styles.placeholderText}>Cargando…</Text>
			</View>
		);
	}

	const viewBoxWidth = tiles.length > 0 ? Math.max(...tiles.map(t => t.pos_x + t.radius)) : 0;
	const aspectRatio = viewBoxWidth > 0 && board.height > 0 ? viewBoxWidth / board.height : 1;
	const windowWidth = useWindowDimensions().width;
	const [containerWidth, setContainerWidth] = useState(windowWidth);
	const calculatedHeight = containerWidth > 0 ? containerWidth / aspectRatio : 150;

	return (
		<View
			style={[styles.outerContainer, { borderColor: isDarkMode ? '#578BB6' : '#6599C3' }]}
			onLayout={e => {
				const w = e.nativeEvent.layout.width;
				if (w > 0) setContainerWidth(w);
			}}
		>
			<ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator>
				<Pressable onPress={onPress}>
					<View style={{ width: '100%', height: calculatedHeight }}>
					<Svg
						width={containerWidth}
						height={calculatedHeight}
						viewBox={`0 0 ${viewBoxWidth} ${board.height}`}
						preserveAspectRatio="xMidYMin meet"
					>
						<Background width={viewBoxWidth} height={board.height} patternWidth={board.rect_width} patternHeight={board.rect_height}
							colors={{ color1: board.color_rect, color2: board.color_path1, color3: board.color_path2, }}
							svgPath1={board.path1} svgPath2={board.path2} />

						{tiles.map((tile) => {
							if (tile.effect_name === 'Inicio' || tile.effect_name === 'Meta') {
								return (
									<StartFinishLine key={tile.id} pos={{ x: tile.pos_x, y: tile.pos_y }} size={{ width: viewBoxWidth - tile.pos_x, height: tile.radius }}
										tileType={tile.tile_type} titleText={tile.effect_name === 'Inicio' ? 'SALIDA' : 'META'} />
								);
							}
							return <HexTile key={tile.id} {...tile} />;
						})}

						{shortcuts.map((shortcut) => {
							const fromTile = tiles.find(t => t.num_tile === shortcut.from_tile);
							const toTile = tiles.find(t => t.num_tile === shortcut.to_tile);
							if (!fromTile || !toTile) return null;
							const fromPoint = { x: fromTile.pos_x, y: fromTile.pos_y };
							const toPoint = { x: toTile.pos_x, y: toTile.pos_y };
							const isWire = shortcut.from_tile > shortcut.to_tile;
							if (isWire) {
								return (
									<Wire key={shortcut.id} width={10} scaleColor={wireScaleColor} from={fromPoint} to={toPoint} />
								);
							}
							return (
								<Ladder key={shortcut.id} scale={1} color={ladderColor} from={fromPoint} to={toPoint}
								/>
							);
						})}
					</Svg>
				</View>
				</Pressable>
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	outerContainer: {
		width: '100%',
		height: 150,
		borderWidth: 1,
		borderRadius: 12,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.15,
		shadowRadius: 4,
		elevation: 3,
	},
	scroll: {
		flex: 1,
	},
	scrollContent: {
		flexGrow: 0,
	},
	innerContainer: {
		width: '100%',
	},
	placeholder: {
		width: '100%',
		height: 150,
		backgroundColor: 'rgba(101, 153, 195, 0.15)',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 12,
	},
	placeholderText: {
		color: '#578BB6',
		fontSize: 12,
		fontFamily: 'Manrope_600SemiBold',
	},
});

export default BoardPreview;
