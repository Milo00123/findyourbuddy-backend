exports.up = function(knex) {
    return knex.schema.createTable('chats', function(table) {
      table.increments('id').primary();
      table.integer('post_id').unsigned().notNullable().references('id').inTable('post');
      table.integer('user_id').unsigned().notNullable().references('id').inTable('user');
      table.text('message').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('chats');
  };