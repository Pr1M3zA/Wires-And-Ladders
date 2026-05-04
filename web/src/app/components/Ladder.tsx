import { type FC, memo } from 'react';

type Point = { x: number; y: number };
interface ladderProps {
   from: Point; to: Point;
   scale: number,
   color: { rung: string; base: string; }
}

const Ladder: FC<ladderProps> = (props) => {
   function getAngle(from: Point, to: Point) {
      return -90 - (Math.atan(-(to.y - from.y) / (to.x - from.x)) * (180 / Math.PI)) + ((to.x - from.x) < 0 ? 180 : 0)
   }
   const length = Math.sqrt((props.to.x - props.from.x) ** 2 + (props.to.y - props.from.y) ** 2);
   //const virtualTo:Point = { x: props.from.x, y: props.from.y + length };

   let ladderRungs = [15]
   for (let i = 40; i < length - 15; i += 25) {
      ladderRungs.push(i)
   }

   return (
      <g transform={`scale(${props.scale}) translate(${props.from.x - 27.5}, ${props.from.y}) rotate(${getAngle(props.from, props.to)}, 27.5, 0)`} fillOpacity={0.5}>
         <circle cx="11.5" cy="5" r="5" fill={props.color.base} />
         <circle cx="11.5" cy={length - 5} r="5" fill={props.color.base} />
         <rect x="6.5" y="5" width="10" height={length - 10} fill={props.color.base} />

         <circle cx="43.5" cy="5" r="5" fill={props.color.base} />
         <circle cx="43.5" cy={length - 5} r="5" fill={props.color.base} />
         <rect x="38.5" y="5" width="10" height={length - 10} fill={props.color.base} />

         <defs>
            <g id='rung'>
               <circle cx="5" cy="5" r="5" fill={props.color.rung} />
               <circle cx="50" cy="5" r="5" fill={props.color.rung} />
               <rect x="5" y="0" width="45" height="10" fill={props.color.rung} />
               <circle cx="11.5" cy="5" r="1.5" fill={props.color.base} />
               <circle cx="43.5" cy="5" r="1.5" fill={props.color.base} />
            </g>
         </defs>
         {ladderRungs.map((point, index) => {
            return (
               <use key={index} href="#rung" y={point} />
            );
         })}
      </g>
   );
};

export default memo(Ladder);