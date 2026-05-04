import { memo } from 'react';

type Point = { x: number; y: number };
interface wireProps {
   from: Point; to: Point;
   width: number;
   scaleColor: { fill: string; border: string; }
}

const Wire: React.FC<wireProps> = (props) => {
   function getAngle(from: Point, to: Point) {
      return -90 - (Math.atan(-(to.y - from.y) / (to.x - from.x)) * (180 / Math.PI)) + ((to.x - from.x) < 0 ? 180 : 0)
   }
   function getSnakePath(head: Point, queue: Point) {
      const snakeLength = queue.y - head.y
      const segments = Math.round(snakeLength / 250)
      const segmentLength = snakeLength / segments;
      let path = `M${head.x},${head.y}`
      for (let segment = 0; segment < segments; segment++) {
         const middle: Point = { x: head.x, y: head.y + segment * segmentLength + segmentLength / 2 };
         const curveRef: Point = { x: head.x - (Math.sqrt((segmentLength / 2) ** 2 - (segmentLength / 4) ** 2)), y: head.y + (segment * segmentLength) + segmentLength / 4 }
         path += ` Q${curveRef.x}, ${curveRef.y} ${middle.x},${middle.y} T${middle.x},${head.y + (segment * segmentLength) + segmentLength}`
      }
      //console.log(`segment Lenght: ${segmentLength}, segments: ${segments}`);
      return path;
   }

   const length = Math.sqrt((props.to.x - props.from.x) ** 2 + (props.to.y - props.from.y) ** 2);

   const virtualTo: Point = { x: props.from.x, y: props.from.y + length };


   return (
      <g>
         <g transform={`rotate(${getAngle(props.from, props.to)}, ${props.from.x}, ${props.from.y})`}>
            <defs>
               <pattern id="escamas" patternUnits="userSpaceOnUse" width="40" height="30">
                  <rect width="40" height="30" fill={props.scaleColor.fill} fillOpacity="0.4" />
                  <path fill="none" stroke={props.scaleColor.border} stroke-width="1"
                     d="M-10-10A10 10 0 0 0-20 0a10 10 0 0 0 10 10A10 10 0 0 1 0 0a10 10 0 0 0-10-10zm20 0A10 10 0 0 0 0 0a10 10 0 0 1 10 10A10 10 0 0 1 20 0a10 10 0 0 0-10-10zm20 0A10 10 0 0 0 20 0a10 10 0 0 1 10 10A10 10 0 0 1 40 0a10 10 0 0 0-10-10zm-40 20a10 10 0 0 0-10 10 10 10 0 0 0 10 10A10 10 0 0 1 0 20a10 10 0 0 0-10-10zm20 0A10 10 0 0 0 0 20a10 10 0 0 1 10 10 10 10 0 0 1 10-10 10 10 0 0 0-10-10zm20 0a10 10 0 0 0-10 10 10 10 0 0 1 10 10 10 10 0 0 1 10-10 10 10 0 0 0-10-10z"
                  />
               </pattern>
            </defs>
            <path d={getSnakePath(props.from, virtualTo)} stroke="url(#escamas)" fill="none" strokeWidth={props.width} />
            {/* snake head */}
            <g transform={`rotate(55, ${props.from.x}, ${props.from.y})`}>
               <rect x={props.from.x - 10} y={props.from.y} width={20} height={10} fill='white' stroke='black' strokeWidth={2} />
               <rect x={props.from.x - 15} y={props.from.y + 10} width={30} height={30} />
            </g>
            {/* snake queue */}
            <g transform={`rotate(55, ${virtualTo.x}, ${virtualTo.y})`}>
               <rect x={virtualTo.x - 10} y={virtualTo.y - 10} width={20} height={10} fill='white' stroke='black' strokeWidth={2} />
               <rect x={virtualTo.x - 15} y={virtualTo.y - 40} width={30} height={30} />
            </g>
         </g>
      </g>
   );
};
export default memo(Wire);
