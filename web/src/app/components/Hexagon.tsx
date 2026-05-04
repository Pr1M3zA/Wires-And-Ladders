type HexagonProps = {
   pos: { x: number; y: number; };
   radius: number;
   rotation: number;
   colors: { fill: string; border: string; };
   borderWidth: number;
}

const Hexagon: React.FC<HexagonProps> = (props) => {
   const sqrt = Math.sqrt(3) * props.radius / 2
   let points = `${props.radius},0 ${props.radius / 2},${sqrt} ${-props.radius / 2},${sqrt} ${-props.radius},0 ${-props.radius / 2},${-sqrt} ${props.radius / 2},${-sqrt}`

   return (
      <g transform={`translate(${props.pos.x}, ${props.pos.y}) rotate(${props.rotation})`} >
         <polygon points={points} fill={props.colors.fill} stroke={props.colors.border} strokeWidth={props.borderWidth} />
      </g>
   )
}

export default Hexagon;