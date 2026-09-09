import { FC, memo } from 'react';
import { G, Path, Text as SvgText, Polygon } from 'react-native-svg';
import Hexagon from "./Hexagon";
import { useContextProvider } from '@/utils/ContextProvider';
import type { TileType } from '@/utils/types';

const HexTile: FC<TileType> = (props) => {
	const { tileTypes } = useContextProvider();
	const tileTypeData = tileTypes.find(t => t.id === props.tile_type);
	if (!tileTypeData) return null;

	const sqrt = Math.sqrt(3) * props.radius / 2
	return (
		<G x={props.pos_x} y={props.pos_y} >
			<Hexagon
				pos={{ x: 0, y: 0 }}
				radius={props.radius}
				rotation={props.rotation}
				colors={{ fill: tileTypeData.color_fill, border: tileTypeData.color_border }}
				borderWidth={props.border_width}
			/>
			<Path
				d={tileTypeData.path1}
				fill={tileTypeData.color_path1} fillRule='evenodd' clipRule='evenodd'
				scale={tileTypeData.paths_scale} x={tileTypeData.paths_x} y={tileTypeData.paths_y}
			/>
			<Path
				d={tileTypeData.path2}
				fill={tileTypeData.color_path2} fillRule='evenodd' clipRule='evenodd'
				scale={tileTypeData.paths_scale} x={tileTypeData.paths_x} y={tileTypeData.paths_y}
			/>
			<SvgText x={0} y={-props.radius / 3} textAnchor='middle' fontFamily='Jomhuria_400Regular' fontSize={30} fill='white' >{props.num_tile}</SvgText>
			{props.direction !== 0 && (
				<G rotation={-props.direction}>
					<Polygon
						points={`0 ${-props.radius / 4} ${-props.radius / 4} 0 ${props.radius / 4} 0`}
						fill={tileTypeData.color_border}
						stroke={tileTypeData.color_fill}
						strokeWidth={1}
						x={sqrt - props.border_width}
						rotation={90}
					/>
				</G>
			)}
		</G>
	);
}

export default memo(HexTile)
