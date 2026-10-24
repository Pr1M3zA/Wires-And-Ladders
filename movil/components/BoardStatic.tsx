import React, { FC, memo, useMemo } from 'react';
import Svg from 'react-native-svg';
import Background from '@/components/Background';
import HexTile from '@/components/HexTile';
import StartFinishLine from '@/components/StartFinishLine';
import Wire from '@/components/Wire';
import Ladder from '@/components/Ladder';
import type { BoardType, TileType, ShortCutType } from '@/utils/types';

interface BoardStaticProps {
	width: number;
	height: number;
	canvasWidth: number;
	canvasHeight: number;
	board: BoardType | null;
	hexTiles: TileType[];
	wires: (ShortCutType & { type: string })[];
	ladders: (ShortCutType & { type: string })[];
}

const WIRE_SCALE_COLOR = { fill: 'green', border: 'black' };
const LADDER_COLOR = { base: 'sandybrown', rung: 'saddlebrown' };

const BoardStatic: FC<BoardStaticProps> = ({
	width,
	height,
	canvasWidth,
	canvasHeight,
	board,
	hexTiles,
	wires,
	ladders,
}) => {
	const bgColors = useMemo(() => ({
		color1: board ? board.color_rect : 'white',
		color2: board ? board.color_path1 : 'linen',
		color3: board ? board.color_path2 : 'mintcream',
	}), [board?.color_rect, board?.color_path1, board?.color_path2]);

	return (
		<Svg
			width={width}
			height={height}
			viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
			preserveAspectRatio="xMidYMid meet"
		>
			<Background
				width={canvasWidth}
				height={canvasHeight}
				patternWidth={board ? board.rect_width : 60}
				patternHeight={board ? board.rect_height : 36}
				colors={bgColors}
				svgPath1={board ? board.path1 : ''}
				svgPath2={board ? board.path2 : ''}
			/>

			{hexTiles.map((item, index) => {
				if (item.effect_name === 'Inicio' || item.effect_name === 'Meta') {
					return (
						<StartFinishLine
							key={item.id ?? index}
							pos={{ x: item.pos_x, y: item.pos_y }}
							size={{ width: canvasWidth - item.pos_x, height: item.radius }}
							tileType={item.tile_type}
							titleText={item.effect_name === 'Inicio' ? 'SALIDA' : 'META'}
						/>
					);
				}
				return <HexTile {...item} key={item.id ?? index} />;
			})}

			{wires.map((wire, index) => {
				const fromTile = hexTiles[wire.from_tile];
				const toTile = hexTiles[wire.to_tile];
				if (!fromTile || !toTile) return null;
				return (
					<Wire
						key={wire.id ?? index}
						width={10}
						scaleColor={WIRE_SCALE_COLOR}
						from={{ x: fromTile.pos_x, y: fromTile.pos_y }}
						to={{ x: toTile.pos_x, y: toTile.pos_y }}
					/>
				);
			})}

			{ladders.map((ladder, index) => {
				const fromTile = hexTiles[ladder.from_tile];
				const toTile = hexTiles[ladder.to_tile];
				if (!fromTile || !toTile) return null;
				return (
					<Ladder
						key={ladder.id ?? index}
						scale={1}
						color={LADDER_COLOR}
						from={{ x: fromTile.pos_x, y: fromTile.pos_y }}
						to={{ x: toTile.pos_x, y: toTile.pos_y }}
					/>
				);
			})}
		</Svg>
	);
};

export default memo(BoardStatic);
