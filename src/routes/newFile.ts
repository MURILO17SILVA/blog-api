import { Request, Response } from 'express';
import { getParams } from '../types/Params';
import { redisClient } from '../config/cache';
import { postRouter, postCtrl } from './posts';

postRouter.get('/user/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params;


  const userIdNumber = parseInt(userId);
  if (!isNaN(userIdNumber)) {
    const params = getParams(req.query);

    const cacheKey = `byUserId_${userId}_${params.page}_${params.perPage}`;
    const cachedPosts = await redisClient.get(cacheKey);

    if (cachedPosts) return res.json({ contacts: JSON.parse(cachedPosts) });

    const posts = await postCtrl.findAllByUserId(userIdNumber, params);
    redisClient.set(cacheKey, JSON.stringify(posts), { EX: Number(process.env.CACHE_LIFE_TIME) });

    return res.status(200).json({ posts });
  }

  return res.status(400).json({ message: 'Invalid user id' });
});
