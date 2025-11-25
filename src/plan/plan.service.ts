import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Plans } from './plan.model';
import { AuthService } from 'src/auth/auth.service';
import { Op } from 'sequelize';
import { RoomsService } from 'src/rooms/rooms.service';
import { CreatePlanDto } from './dto/createPlan.dto';
import { UpdatePlanDto } from './dto/updatePlan.dto';
import { ObjectsService } from 'src/objects/objects.service';

@Injectable()
export class PlanService {
  constructor(
    @InjectModel(Plans) private plansRepository: typeof Plans,
    private authService: AuthService,
    private roomService: RoomsService,
    private objectsService: ObjectsService,
  ) {}

  async getAllPlans(
    roomId: string,
    objectId: string,
    authHeader: string,
    search?: string,
  ) {
    const user = await this.authService.getUserFromToken(authHeader);
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    const where: any = { user_id: user.id, room_id: roomId };
    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }

    const plans = await this.plansRepository.findAll({ where });
    const room = await this.roomService.getRoomById(roomId);
    const object = await this.objectsService.getObjectById(objectId);

    return {
      room,
      plans,
      object,
    };
  }

  async createPlan(createDto: CreatePlanDto, authHeader: string) {
    const user = await this.authService.getUserFromToken(authHeader);
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    const { name, number, roomId } = createDto;
    const candidate = await this.plansRepository.findOne({
      where: {
        [Op.or]: [{ name }, { number }],
        room_id: roomId,
      },
    });

    if (candidate) {
      throw new HttpException(
        'Чертёж с таким названием или номером уже существует',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.plansRepository.create({
      name,
      number,
      user_id: user.id,
      room_id: roomId,
    });

    return {
      statusCode: 200,
      message: 'Чертёж создан',
    };
  }

  async updatePlan(
    updateDto: UpdatePlanDto,
    planId: string,
    authHeader: string,
  ) {
    const user = await this.authService.getUserFromToken(authHeader);
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    const { name, number, roomId } = updateDto;
    const candidate = await this.plansRepository.findOne({
      where: {
        [Op.or]: [{ name }, { number }],
        id: { [Op.ne]: planId },
        room_id: roomId,
      },
    });

    if (candidate) {
      throw new HttpException(
        'Чертёж с таким названием или номером уже существует',
        HttpStatus.BAD_REQUEST,
      );
    }

    const plan = await this.plansRepository.findByPk(planId);
    if (!plan) {
      throw new HttpException('Чертёж не найден', HttpStatus.BAD_REQUEST);
    }

    if (user.id !== plan.user_id) {
      throw new HttpException('Чертёж создан не вами', HttpStatus.BAD_REQUEST);
    }

    await plan.update({ name, number });
    return {
      statusCode: 200,
      message: 'Чертёж обновлен',
    };
  }

  async deletePlan(planId: string, authHeader: string) {
    const user = await this.authService.getUserFromToken(authHeader);
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    const plan = await this.plansRepository.findByPk(planId);
    if (!plan) {
      throw new HttpException('Чертёж не найден', HttpStatus.BAD_REQUEST);
    }

    if (plan.user_id !== user.id) {
      throw new HttpException('Чертёж создан не вами', HttpStatus.BAD_REQUEST);
    }

    await plan.destroy();
    return {
      statusCode: 200,
      message: 'Чертёж удален',
    };
  }

  async getPlanById(planId: string) {
    const plan = await this.plansRepository.findByPk(planId);
    return plan;
  }

  async getObjectAndRoom(planId: string) {
    const plan = await this.plansRepository.findOne({where: {id: planId}, attributes: ['room_id']})
    if (!plan) {
      throw new HttpException('Чертеж не найден', HttpStatus.BAD_REQUEST)
    }

    const room = await this.roomService.getRoomWithObject(plan.room_id)
    if (!room) {
      throw new HttpException('Помещение не найдено', HttpStatus.BAD_REQUEST)
    }

    const object = await this.objectsService.getObjectById(room.object_id)
    if (!object) {
      throw new HttpException('Объект не найден', HttpStatus.BAD_REQUEST)
    }

    return {
      object,
      room,
    }
  }
}
