import EN_LAN from './en_lan'
import ZH_LAN from './zh_lan'
import config from 'config'

const isEN = config.isEN;

export default isEN ? EN_LAN : ZH_LAN;
