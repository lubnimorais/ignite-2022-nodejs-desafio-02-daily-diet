import { FastifyInstance } from 'fastify';

import { randomUUID } from 'node:crypto';

import { z } from 'zod';

import { checkUserSession } from '../middlewares/check-user-session';

import { knex } from '../database';

export async function mealsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', checkUserSession);

  app.post('/', async (request, reply) => {
    const mealsBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      date: z.string(),
      hour: z.string(),
      inside_of_diet: z.boolean(),
    });

    const { name, description, date, hour, inside_of_diet } =
      mealsBodySchema.parse(request.body);

    const { sessionUserId } = request.cookies;

    const mealData = {
      id: randomUUID(),
      name,
      description,
      date,
      hour,
      inside_of_diet,
      user_id: sessionUserId,
    };

    const meal = await knex('meals').insert(mealData).returning('*');

    return reply.status(201).send({ meal });
  });

  // GETS
  app.get('/', async (request, reply) => {
    const { sessionUserId } = request.cookies;

    const meals = await knex('meals')
      .select('*')
      .where('user_id', sessionUserId)
      .returning('*');

    return reply.status(200).send({ meals });
  });

  app.get('/show/:id', async (request, reply) => {
    const { sessionUserId } = request.cookies;

    const showMealBodySchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = showMealBodySchema.parse(request.params);

    const meal = await knex('meals')
      .select('*')
      .where('id', id)
      .andWhere('user_id', sessionUserId)
      .first();

    if (!meal) {
      return reply.status(404).send({
        error: 'error',
        message: 'Meal not found!',
      });
    }

    return reply.status(200).send({ meal });
  });

  app.get('/metrics', async (request, reply) => {
    const { sessionUserId } = request.cookies;

    const meals = await knex('meals')
      .select('*')
      .where('user_id', sessionUserId)
      .returning('*');

    const totalMeals = meals.length;

    const totalMealsInsideDiet = meals.filter(
      (meal) => Number(meal.inside_of_diet) === 1,
    ).length;

    const totalMealsInOutsideDiet = meals.filter(
      (meal) => Number(meal.inside_of_diet) === 0,
    ).length;

    const mealsBetterSequence: Array<any> = [];

    meals.forEach((meal) => {
      const dateMealSplit = meal.date.split('/');

      const currentMonth = new Date().getMonth() + 2;

      if (
        dateMealSplit[1] === String(currentMonth).padStart(2, '0') &&
        Number(meal.inside_of_diet) === 1
      ) {
        mealsBetterSequence.push(meal);
      }
    });

    const totalMealBetterSequence = mealsBetterSequence.length;

    return reply.status(200).send({
      meals: {
        totalMeals,
        totalMealsInsideDiet,
        totalMealsInOutsideDiet,
        totalMealBetterSequence,
      },
    });
  });
  // END GETS

  app.put('/', async (request, reply) => {
    const { sessionUserId } = request.cookies;

    const mealsBodySchema = z.object({
      id: z.string().uuid(),
      name: z.string(),
      description: z.string(),
      date: z.string(),
      hour: z.string(),
      inside_of_diet: z.boolean(),
    });

    const { id, name, description, date, hour, inside_of_diet } =
      mealsBodySchema.parse(request.body);

    const meal = await knex('meals')
      .select('*')
      .where('id', id)
      .andWhere('user_id', sessionUserId)
      .first();

    if (!meal) {
      return reply.status(404).send({
        error: 'error',
        message: 'Meal not found!',
      });
    }

    meal.name = name;
    meal.description = description;
    meal.date = date;
    meal.hour = hour;
    meal.inside_of_diet = inside_of_diet;

    await knex('meals')
      .update(meal)
      .where('id', id)
      .andWhere('user_id', sessionUserId);

    return reply.status(201).send({ meal });
  });

  app.delete('/:id', async (request, reply) => {
    const { sessionUserId } = request.cookies;

    const deleteMealBodySchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = deleteMealBodySchema.parse(request.params);

    const meal = await knex('meals')
      .select('*')
      .where('id', id)
      .andWhere('user_id', sessionUserId)
      .first();

    if (!meal) {
      return reply.status(404).send({
        error: 'error',
        message: 'Meal not found!',
      });
    }

    await knex('meals')
      .delete()
      .where('id', id)
      .andWhere('user_id', sessionUserId);

    return reply.status(204).send();
  });
}
