import { Request, Response } from 'express';

import db from '../database/connection';

import convertHourToMinutes from '../utils/convertHourToMinutes';

interface ScheduleItem {
    week_day: number,
    from: string,
    to: string
}

export default class ClassesController {

    async index(req: Request, res: Response) {
        const filters = req.query;

        const subject = filters.subject as string;
        const week_day = filters.week_day as string;
        const time = filters.time as string;

        if(!filters.week_day || !filters.subject || !filters.time) {
            return res.status(400).json({ 
                error: "Filtros inválidos"
            });
        }

        const timeInMinutes = convertHourToMinutes(time);

        const classes = await db('classes')
            .whereExists(function() {
                this.select('class_schedule.*')
                    .from('class_schedule')
                    .whereRaw('`class_schedule`.`class_id` = `classes`.`id`')
                    .whereRaw('`class_schedule`.`week_day` = ??', [Number(week_day)])
                    .whereRaw('`class_schedule`.`from` <= ??', [timeInMinutes])
                    .whereRaw('`class_schedule`.`to` > ??', [timeInMinutes])
            })
            .where('classes.subject', '=', subject) 
            .join('users', 'classes.user_id', '=', 'users_id')
            .select(['classes.*', 'users.*']);

        return res.json();
    }

    async create(req: Request, res: Response) {
        const {
            name,
            avatar,
            whatsapp,
            bio,
            subject,
            cost,
            schedule
        } = req.body;
    
        const trx = await db.transaction(); // Realizar a criação de users, classes e schedule ao mesmo tempo. Assim, caso haja algum problema é só desfazer toda a operação criada
    
        try {
            const insertedUserIds =  await trx('users').insert({ 
                name,
                avatar,
                whatsapp,
                bio,
            });
        
            // id do usário
            const user_id = insertedUserIds[0];
        
            const InsertedClassesIds = await trx('classes').insert({
                subject,
                cost,
                user_id,
            });
        
            // id da classe
            const class_id = InsertedClassesIds[0];
        
            const classSchedule = schedule.map((scheduleItem: ScheduleItem) => {
                return {
                    class_id,
                    week_day: scheduleItem.week_day,
                    from: convertHourToMinutes(scheduleItem.from),
                    to: convertHourToMinutes(scheduleItem.to)
                };
            });
        
            await trx('class_schedule').insert(classSchedule);
        
            await trx.commit(); // Enviando as alterações para o banco de dados. Caso não haja nenhum erro verificado pelo trx.transaction()
        
            res.status(201).send();
        } catch (err) {
            await trx.rollback(); // Desfazer qualquer alteração feita pela operação que causou o erro
    
            res.status(400).json({ 
                error: "Erro inesperado ao criar uma nova classe"
             });
        }
    }
}