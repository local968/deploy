import EN_LAN from './en_lan'
import ZH_LAN from './zh_lan'
import config from 'config'

const isEN = config.isEN;
let EN;
isEN ? EN = EN_LAN : EN = ZH_LAN;

export default EN;
