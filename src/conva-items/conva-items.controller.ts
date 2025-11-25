import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ConvaItemsService } from './conva-items.service';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { SavePlanDto } from './dto/savePlan.dto';

@Controller('conva-items')
export class ConvaItemsController {
  constructor(private convaItemsService: ConvaItemsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/')
  getConvaItems(
    @Query('planId') planId: string,
    @Headers('authorization') authHeader: string,
  ) {
    return this.convaItemsService.getConvaItems(planId, authHeader);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/')
  savePlan(
    @Body() savePlanDto: SavePlanDto,
    @Query('planId') planId: string,
    @Headers('authorization') authHeader: string,
  ) {
    return this.convaItemsService.savePlan(savePlanDto, planId, authHeader);
  }
}
