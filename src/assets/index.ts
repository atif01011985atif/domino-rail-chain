/**
 * Single entry point for the factory's fixed PNG contract.
 * Never reference an image name that is not declared here.
 */
export const assets = {
  bgGame: require('../../assets/bg_game.png'),
  logo: require('../../assets/logo.png'),
  iconHome: require('../../assets/icon_home.png'),
  iconPause: require('../../assets/icon_pause.png'),
  domino: require('../../assets/sprite_1.png'),
  ramp: require('../../assets/sprite_2.png'),
  bell: require('../../assets/sprite_3.png'),
  corner: require('../../assets/sprite_4.png'),
  fork: require('../../assets/sprite_5.png'),
  buttonRect: require('../../assets/button_rect.png'),
  buttonRound: require('../../assets/button_round.png'),
} as const;

/** Sprite per placeable type. `bridge` is drawn with inline SVG instead. */
export const PIECE_SPRITE = {
  domino: assets.domino,
  ramp: assets.ramp,
  corner: assets.corner,
  fork: assets.fork,
  bridge: null,
} as const;

export default assets;
