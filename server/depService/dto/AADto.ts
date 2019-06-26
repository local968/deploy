import { AA } from '../entity/AA';

export type AADto = Omit<AA, 'id'>;
