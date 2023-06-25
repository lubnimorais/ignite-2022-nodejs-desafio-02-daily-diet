// eslint-disable-next-line
import { Knex } from 'knex';

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string;
      name: string;
      email: string;
      password: string;
      created_at: string;
    };
    meals: {
      id: string;
      name: string;
      description: string;
      date: string;
      hour: string;
      inside_of_diet: boolean;
      user_id: string;
    };
  }
}
