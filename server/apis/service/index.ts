// module.exports = {
// 	userService:require('./userService'),
// 	planService:require('./planService'),
// 	imgService:require('./imgService'),
// 	projectService:require('./projectService'),
// };

const userService = require('./userService');
const planService = require('./planService');
const projectService = require('./projectService');
const imgService = require('./imgService');
const groupService = require('./groupService');


export {
	userService,
	planService,
	imgService,
	projectService,
	groupService,
}
