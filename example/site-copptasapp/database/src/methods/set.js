const set = require('lodash/set');
module.exports = function (db, params, options) {
  let fetched = db.prepare(`SELECT * FROM ${options.table} WHERE ID = (?)`).get(params.id);
  if (!fetched) {
    db.prepare(`INSERT INTO ${options.table} (ID,json) VALUES (?,?)`).run(params.id, '{}');
    fetched = db.prepare(`SELECT * FROM ${options.table} WHERE ID = (?)`).get(params.id)
  };
  fetched = JSON.parse(fetched.json);
  try { fetched = JSON.parse(fetched) } catch (e) { }
  if (typeof fetched === 'object' && params.ops.target) {
    params.data = JSON.parse(params.data);
    params.data = set(fetched, params.ops.target, params.data);
  } else if (params.ops.target) throw new Error('Cannot target a non-object.');
  params.data = JSON.stringify(params.data);
  db.prepare(`UPDATE ${options.table} SET json = (?) WHERE ID = (?)`).run(params.data, params.id);
  let newData = db.prepare(`SELECT * FROM ${options.table} WHERE ID = (?)`).get(params.id).json;
  if (newData === '{}') return null
  else {
    newData = JSON.parse(newData);
    try { newData = JSON.parse(newData) } catch (e) { };
    return newData
  }
}
