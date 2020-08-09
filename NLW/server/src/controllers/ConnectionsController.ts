import { Response, Request } from 'express';
import db from '../database/connection';

export default class ConnectionsController {
    async index(req: Request, res: Response) {
        const totalConnections = await db('connections').count('* as total');

        const { total } = totalConnections[0];

        return res.json({ total });
    }

    async create(req: Request, res: Response) {
        const { user_id } = req.body;

        await db('Connections').insert({
            user_id,
        });
        
        res.status(201).json();
    }
}