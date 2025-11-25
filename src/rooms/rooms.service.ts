import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Rooms } from './rooms.model';
import { AuthService } from 'src/auth/auth.service';
import { Op } from 'sequelize';
import { CreateRoomDto } from './dto/createRoom.dto';
import { UpdateRoomDto } from './dto/udpateRoom.dto';
import { ObjectsService } from 'src/objects/objects.service';

@Injectable()
export class RoomsService {
  constructor(
    @InjectModel(Rooms) private roomsRepository: typeof Rooms,
    private authService: AuthService,
    private objectsService: ObjectsService,
  ) {}

  async getAllRooms(search: string, objectId: string, authHeader: string) {
    const user = await this.authService.getUserFromToken(authHeader);
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    const where: any = { user_id: user.id, object_id: objectId };

    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }

    const rooms = await this.roomsRepository.findAll({
      where,
      attributes: ['id', 'name', 'number'],
    });

    const object = await this.objectsService.getObjectById(objectId);

    return { rooms, object };
  }

  async createRoom(createDto: CreateRoomDto, authHeader: string) {
    const user = await this.authService.getUserFromToken(authHeader);
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    const { name, number, objectId } = createDto;

    const candidate = await this.roomsRepository.findOne({
      where: {
        [Op.or]: [{ name }, { number }],
        object_id: objectId,
      },
    });
    if (candidate) {
      throw new HttpException(
        'Помещение с таким номером или названием уже существует',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.roomsRepository.create({
      object_id: objectId,
      name,
      number,
      user_id: user.id,
    });

    return {
      statusCode: 200,
      message: 'Помещение создано',
    };
  }

  async updateRoom(
    updateRoomDto: UpdateRoomDto,
    roomId: string,
    authHeader: string,
  ) {
    const user = await this.authService.getUserFromToken(authHeader);
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    const { name, number, objectId } = updateRoomDto;

    const candidate = await this.roomsRepository.findOne({
      where: {
        [Op.or]: [{ name }, { number }],
        id: { [Op.ne]: roomId },
        object_id: objectId,
      },
    });
    if (candidate) {
      throw new HttpException(
        'Помещение с таким номером или названием уже существует',
        HttpStatus.BAD_REQUEST,
      );
    }

    const room = await this.roomsRepository.findByPk(roomId);
    if (!room) {
      throw new HttpException('Помещение не найдено', HttpStatus.BAD_REQUEST);
    }

    if (room.user_id !== user.id) {
      throw new HttpException(
        'Помещение создано не вами',
        HttpStatus.BAD_REQUEST,
      );
    }

    await room.update({ name, number });
    return {
      statusCode: 200,
      message: 'Помещение обновлено',
    };
  }

  async deleteRoom(roomId: string, authHeader: string) {
    const user = await this.authService.getUserFromToken(authHeader);
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    const room = await this.roomsRepository.findByPk(roomId);
    if (!room) {
      throw new HttpException('Помещение не найдено', HttpStatus.BAD_REQUEST);
    }

    if (room.user_id !== user.id) {
      throw new HttpException(
        'Помещение создано не вами',
        HttpStatus.BAD_REQUEST,
      );
    }

    await room.destroy();
    return {
      statusCode: 200,
      message: 'Помещение удалено',
    };
  }
  async getRoomById(roomId: string) {
    const room = await this.roomsRepository.findOne({
      where: { id: roomId },
      attributes: ['id', 'name', 'number'],
    });
    return room;
  }

  async getRoomWithObject(roomId: string) {
    const room = await this.roomsRepository.findOne({
      where: { id: roomId },
      attributes: ['object_id', 'id', 'name', 'number'],
    });
    return room;
  }
}
