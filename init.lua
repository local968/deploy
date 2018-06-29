package.path = package.path ..';./plugins/deploy2/?.lua';

local function get(self)
  local result = self.data
  result.message = 'space or index not exist.';
  result.status = 404;
  if box.space[result.space] and box.space[result.space].index[result.index] then
    result.result = box.space[result.space].index[result.index]:select(result.args)
    result.status = 200;
    result.message = 'ok';
  end
  return self:render{
    data = result
  }
end

local function insert(self)
  local result = self.data
  result.message = 'space not exist.';
  result.status = 404;
  if box.space[result.space] then
    result.result = box.space[result.space]:insert(result.tuple)
    result.status = 200;
    result.message = 'ok';
  end
  return self:render{
    data = result
  }
end

local function update(self)
  local result = self.data
  result.message = 'space or index not exist.';
  result.status = 404;
  if box.space[result.space] and box.space[result.space].index[result.index] then
    result.result = box.space[result.space].index[result.index]:update(result.key, result.modifier)
    result.status = 200;
    result.message = 'ok';
  end
  return self:render{
    data = result
  }
end

local function upsert(self)
  local result = self.data
  result.message = 'space or index not exist.';
  result.status = 404;
  if box.space[result.space] then
    result.result = box.space[result.space]:upsert(result.tuple, result.modifier)
    result.status = 200;
    result.message = 'ok';
  end
  return self:render{
    data = result
  }
end

local function replace(self)
  local result = self.data
  result.message = 'space not exist.';
  result.status = 404;
  if box.space[result.space] then
    result.result = box.space[result.space]:replace(result.tuple)
    result.status = 200;
    result.message = 'ok';
  end
  return self:render{
    data = result
  }
end

local function delete(self)
  local result = self.data
  result.message = 'space not exist.';
  result.status = 404;
  if box.space[result.space] then
    result.result = box.space[result.space]:delete(result.key)
    result.status = 200;
    result.message = 'ok';
  end
  return self:render{
    data = result
  }
end

local function watch(self)
  return self:render{
    data = self.data
  }
end

local function unwatch(self)
  return self:render{
    data = self.data
  }
end

function init(server)
  server:addMessage({type='get'},get)
  server:addMessage({type='insert'},insert)
  server:addMessage({type='update'},update)
  server:addMessage({type='upsert'},upsert)
  server:addMessage({type='replace'},replace)
  server:addMessage({type='delete'},delete)
  server:addMessage({type='watch'},watch)
  server:addMessage({type='unwatch'},unwatch)
end

init(app.webServer)