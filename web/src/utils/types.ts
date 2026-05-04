export type UserType = {
   id: number;
   username: string;
   first_name: string;
   last_name: string;
   email: string;
   profile_image: string | null,
   isAdmin: boolean
}

export type LoginType = {
   identifier: string;
   password: string;
}

export type BoardType = {
   id: number,
   board_name: string,
   width: number,
   height: number,
   rect_width: number,
   rect_height: number,
   path1: string,
   path2: string,
   color_rect: string,
   color_path1: string,
   color_path2: string,
   education: number,
}

export type DiceType = {
   id: number,
   dice_name: string,
   color_faceup: string,
   color_faceleft: string,
   color_faceright: string,
   color_dots: string,
   color_border: string,
   border_width: number,
   scale: number
}

export type EducationType = {
   id: number,
   generation: number,
   theme: string, information: string, question: string,
   answer_1: string, answer_2: string, answer_3: string, answer_4: string, answer_ok: number
}

export type TileType = {
   id: number,
   id_board: number,
   num_tile: number,
   pos_x: number,
   pos_y: number,
   tile_type: number,
   rotation: number,
   radius: number,
   border_width: number,
   effect_name: string,
   direction: number
}

export type EffectType = {
   id: number,
   effect_name: string,
   color_fill: string, color_border: string, color_path1: string, color_path2: string,
   path1: string, path2: string,
   paths_x: number, paths_y: number, paths_scale: number
}

export type ShortCutType = {
   id: number; id_board: number;
   from_tile: number; to_tile: number;
}

export type DbBoardType = {
   id: number, id_background: number,
   board_name: string, board_description: string,
   width: number, height: number,
   education: number,
}

export type PlayingUserType = {
   id: number,
   username: string,
   profile_image: string | null | undefined,
   socketId: string,
}
