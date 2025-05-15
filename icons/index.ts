import {
  faUser,
  faCoins,
  faFire,
  faArrowUp,
  faCopy,
  faCheck,
  faPlus,
  faChevronLeft,
  faChevronRight,
  faChevronUp,
  faChevronDown,
  faStar,
  faHammer, // Using faHammer instead of faSwords
  faRocket,
  faGift,
  faBolt,
  faTrophy,
  faInfoCircle,
  faHeart,
  faGamepad,
  faExternalLinkAlt,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons"

import {
  faXmark,
  faHourglassStart,
  faAngleDoubleUp,
  faArrowRight,
  faClock,
  faQuestion,
  faHome,
  faUserGroup,
  faSignal,
} from "@fortawesome/free-solid-svg-icons"

// Create the icons object
export const icons = {
  coins: faCoins,
  times: faXmark, // Using the newer faXmark instead of faTimes
  star: faStar,
  chevronLeft: faChevronLeft,
  chevronRight: faChevronRight,
  chevronUp: faChevronUp,
  chevronDown: faChevronDown,
  check: faCheck,
  hourglassStart: faHourglassStart,
  angleDoubleUp: faAngleDoubleUp,
  arrowRight: faArrowRight,
  bolt: faBolt,
  rocket: faRocket,
  clock: faClock,
  infoCircle: faInfoCircle,
  question: faQuestion,
  gift: faGift,
  externalLinkAlt: faExternalLinkAlt,
  copy: faCopy,
  home: faHome,
  userGroup: faUserGroup,
  swords: faHammer, // Using faHammer as a replacement for faSwords
  heart: faHeart,
  signal: faSignal,
  gamepad: faGamepad,
  arrowUp: faArrowUp,
  fire: faFire,
  plus: faPlus,
  trophy: faTrophy,
  user: faUser,
}

// Export the icons object as the default export as well
export default { icons }
