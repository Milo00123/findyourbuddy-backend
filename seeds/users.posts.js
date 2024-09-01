const usersData = require('../seed-data/users');
const postsData = require('../seed-data/posts');

exports.seed = async function(knex) {
  await knex('post').del();
  await knex('user').del();
  await knex('user').insert(usersData);
  await knex('post').insert(postsData);
};