import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ConvaItem } from './conva-items.model';
import { SavePlanDto } from './dto/savePlan.dto';
import { PlanService } from 'src/plan/plan.service';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class ConvaItemsService {
  constructor(
    @InjectModel(ConvaItem) private convaItemRepository: typeof ConvaItem,
    private planService: PlanService,
    private authService: AuthService,
  ) {}

  async savePlan(savePlanDto: SavePlanDto, planId: string, authHeader: string) {
    const { convaItems } = savePlanDto;

    const plan = await this.planService.getPlanById(planId);
    if (!plan)
      throw new HttpException('Чертеж не найден', HttpStatus.BAD_REQUEST);

    const user = await this.authService.getUserFromToken(authHeader);
    if (!user) throw new UnauthorizedException('Пользователь не найден');

    if (user.id !== plan.user_id) {
      throw new HttpException('Нет доступа', HttpStatus.FORBIDDEN);
    }

    const existing = await this.convaItemRepository.findAll({
      where: { plan_id: planId },
    });

    const incomingIds = convaItems.map((i) => i.id);

    const idsToDelete = existing
      .filter((item) => !incomingIds.includes(item.id))
      .map((item) => item.id);

    if (idsToDelete.length > 0) {
      await this.convaItemRepository.destroy({
        where: { id: idsToDelete },
      });
    }

    const itemsWithPlan = convaItems.map((item) => ({
      ...item,
      plan_id: planId,
    }));

    await this.convaItemRepository.bulkCreate(itemsWithPlan, {
      updateOnDuplicate: [
        'x',
        'y',
        'width',
        'height',
        'fill',
        'text',
        'fontSize',
      ],
    });

    return {
      statusCode: 200,
      message: 'Чертеж сохранен',
    };
  }

  async getConvaItems(planId: string, authHeader: string) {
    const plan = await this.planService.getPlanById(planId);

    if (!plan) {
      throw new HttpException('Чертеж не найден', HttpStatus.BAD_REQUEST);
    }

    const user = await this.authService.getUserFromToken(authHeader);
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    if (user.id !== plan.user_id) {
      throw new HttpException('Данный чертеж', HttpStatus.NOT_ACCEPTABLE);
    }

    const convaItems = await this.convaItemRepository.findAll({
      where: { plan_id: planId },
    });
    const objectAndRoom = await this.planService.getObjectAndRoom(planId);
    return {
      object: objectAndRoom.object,
      room: objectAndRoom.room,
      items: convaItems ?? [],
    };
  }
}
