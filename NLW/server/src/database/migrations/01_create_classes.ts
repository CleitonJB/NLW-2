import Knex from 'knex';

export async function up(knex: Knex){
    return knex.schema.createTable('classes', table => {
        table.increments('id').primary();
        table.string('subject').notNullable();
        table.decimal('cost').notNullable();

        //Quem é o professor que criou esta classe (Criando um relacionamento entre tabelas (chave estrangeira))
        table.integer('user_id')   
            .notNullable()
            .references('id')
            .inTable('users')
            .onDelete('CASCADE') // Apaga todas as aulas daquele professor automaticamente, caso o mesmo seja excluído
            .onUpdate('CASCADE'); 
    });
}

export async function down(knex: Knex){
    return knex.schema.dropTable('classes');
}