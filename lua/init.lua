local tables = require('deploy2.lua.tables');
local projects = require('deploy2.lua.projects');
local approaches = require('deploy2.lua.approaches');
local request = require('deploy2.lua.request');

return function(server)
    tables();
    projects(server)
    approaches(server)
    request(server)
end