import { type FC, memo } from 'react';
import Hexagon from "./Hexagon"
import { useBoardContext } from "../../store/BoardProvider.tsx";
import type { TileType } from "../../utils/types.ts"


const HexTile: FC<TileType> = (props) => {
   const { tileTypes } = useBoardContext();
   const sqrt = Math.sqrt(3) * props.radius / 2
   console.log(JSON.stringify(props))
   return (
      <g transform={`translate(${props.pos_x}, ${props.pos_y})`} >
         <Hexagon
            pos={{ x: 0, y: 0 }}
            radius={props.radius}
            rotation={props.rotation}
            colors={{ fill: tileTypes[props.tile_type].color_fill, border: tileTypes[props.tile_type].color_border }}
            borderWidth={props.border_width}
         />
         <g transform={`translate(${tileTypes[props.tile_type].paths_x}, ${tileTypes[props.tile_type].paths_y}) scale(${tileTypes[props.tile_type].paths_scale})`}>
            <path fill={tileTypes[props.tile_type].color_path1} fillRule='evenodd' clipRule='evenodd'
               d={tileTypes[props.tile_type].path1} />
            <path fill={tileTypes[props.tile_type].color_path2} fillRule='evenodd' clipRule='evenodd'
               d={tileTypes[props.tile_type].path2} />
         </g>

         <text
            x={0} y={-props.radius / 3} textAnchor='middle' fontSize={20} fill='white'
            style={{ fontFamily: "'Jomhuria', serif", fontSize: "24px" }}
         >
            {props.num_tile}
         </text>

         {props.direction !== 0 && (
            <g transform={`rotate(${-props.direction})`}>
               <polygon
                  points={`0 ${-props.radius / 4} ${-props.radius / 4} 0 ${props.radius / 4} 0`}
                  fill={tileTypes[props.tile_type].color_border}
                  stroke={tileTypes[props.tile_type].color_fill}
                  strokeWidth={1}
                  transform={`translate(${sqrt - props.border_width}, 0) rotate(90)`}
               />
            </g>
         )}
      </g>
   );
}

export default memo(HexTile)