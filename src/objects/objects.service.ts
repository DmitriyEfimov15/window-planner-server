import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Objects } from './objects.model';
import { AuthService } from 'src/auth/auth.service';
import { Op } from 'sequelize';

@Injectable()
export class ObjectsService {
  constructor(
    @InjectModel(Objects) private objectsRepository: typeof Objects,
    private authService: AuthService,
  ) {}

  async getAllObjects(search: string, authHeader: string) {
    const user = await this.authService.getUserFromToken(authHeader);
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    const where: any = { user_id: user.id };

    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }

    const objects = await this.objectsRepository.findAll({
      where,
      attributes: ['id', 'name', 'number'],
    });

    return { objects };
  }

  async createObject(name: string, number: number, authHeader: string) {
    const user = await this.authService.getUserFromToken(authHeader);
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    const candidate = await this.objectsRepository.findOne({
      where: {
        [Op.or]: [{ name }, { number }],
      },
    });
    if (candidate) {
      throw new HttpException(
        'Проект с таким номером или названием уже существует',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.objectsRepository.create({
      user_id: user.id,
      name,
      number,
    });

    return {
      statusCode: 200,
      message: 'Объект успешно создан',
    };
  }

  async updateObject(
    objectId: string,
    authHeader: string,
    name?: string,
    number?: number,
  ) {
    const user = await this.authService.getUserFromToken(authHeader);
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }
    const candidate = await this.objectsRepository.findOne({
      where: {
        [Op.or]: [{ name }, { number }],
        id: { [Op.ne]: objectId },
      },
    });
    if (candidate) {
      throw new HttpException(
        'Проект с таким номером или названием уже существует',
        HttpStatus.BAD_REQUEST,
      );
    }
    const object = await this.objectsRepository.findOne({
      where: { id: objectId },
    });

    if (!object) {
      throw new HttpException('Проект не найден', HttpStatus.BAD_REQUEST);
    }

    if (object.user_id !== user.id) {
      throw new HttpException('Проект создан не вами', HttpStatus.BAD_REQUEST);
    }

    await object.update({ name, number });

    return {
      statusCode: 200,
      message: 'Объект успешно обновлен',
    };
  }

  async deleteObject(objectId: string, authHeader: string) {
    const user = await this.authService.getUserFromToken(authHeader);
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }
    const object = await this.objectsRepository.findOne({
      where: { id: objectId },
    });

    if (!object) {
      throw new HttpException('Проект не найден', HttpStatus.BAD_REQUEST);
    }

    if (object.user_id !== user.id) {
      throw new HttpException('Проект создан не вами', HttpStatus.BAD_REQUEST);
    }

    await object.destroy();

    return {
      statusCode: 200,
      message: 'Объект успешно удален',
    };
  }
  async getObjectById (objectId: string) {
    const object = await this.objectsRepository.findOne({where: {id: objectId}, attributes: ['name', 'number', 'id']})
    return object;
  }
}

