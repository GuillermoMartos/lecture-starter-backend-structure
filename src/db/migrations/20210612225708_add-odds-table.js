exports.up = function (knex) {
    return knex.schema
        .createTable('odds', (table) => {
            table.uuid('id').defaultTo(knex.raw('gen_random_uuid()')).primary();
            table.float('home_win').notNullable();
            table.float('draw').notNullable();
            table.float('away_win').notNullable();
            table.timestamp('created_at').defaultTo(knex.fn.now());
            table.timestamp('updated_at').defaultTo(knex.fn.now());
        });
};

exports.down = function (knex) {
    return knex.schema.dropTable('odds');
};
