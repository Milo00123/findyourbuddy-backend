/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema
      .createTable("user", (table) => {
        table.increments("id").primary();
        table.string("name").notNullable();
        table.string("last_name").notNullable();
        table.string("email").notNullable();
        table.string("password").notNullable();
        table.string("about").nullable();
        table.string("profile_image").nullable();
        table.string("riding_level").nullable();
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table
          .timestamp("updated_at")
          .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));
      })
      .createTable("post", (table) => {
        table.increments("id").primary();
        table.string("title").notNullable();
        table.string("content", 1000).notNullable();
        table.integer("likes").notNullable().defaultTo(0);
        table
          .integer("user_id")
          .unsigned()
          .references("user.id")
          .onUpdate("CASCADE")
          .onDelete("CASCADE");
        table.string("location").nullable();
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table
          .timestamp("updated_at")
          .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));
      });
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function (knex) {
    return knex.schema.dropTable("post").dropTable("user");
  };