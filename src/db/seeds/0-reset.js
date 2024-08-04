exports.seed = async (knex) => {
    // Clean up existing data
    await knex('bet').del();
    await knex('event').del();
    await knex('odds').del();
    await knex('user').del();
};
