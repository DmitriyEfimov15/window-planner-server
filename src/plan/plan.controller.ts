import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PlanService } from './plan.service';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { CreatePlanDto } from './dto/createPlan.dto';
import { UpdatePlanDto } from './dto/updatePlan.dto';

@Controller('plan')
export class PlanController {
  constructor(private planService: PlanService) {}

  @Get('/')
  @UseGuards(JwtAuthGuard)
  getAllPlans(
    @Query('roomId') roomId: string,
    @Query('objectId') objectId: string,
    @Headers('authorization') authHeader: string,
    search?: string,
  ) {
    return this.planService.getAllPlans(roomId, objectId, authHeader, search);
  }

  @Post('/')
  @UseGuards(JwtAuthGuard)
  createPlan(
    @Body() createPlanDto: CreatePlanDto,
    @Headers('authorization') authHeader: string,
  ) {
    return this.planService.createPlan(createPlanDto, authHeader);
  }

  @Put('/')
  @UseGuards(JwtAuthGuard)
  uptadePlan(
    @Body() updatePlanDto: UpdatePlanDto,
    @Query('planId') planId: string,
    @Headers('authorization') authHeader: string,
  ) {
    return this.planService.updatePlan(updatePlanDto, planId, authHeader);
  }

  @Delete('/')
  @UseGuards(JwtAuthGuard)
  deletePlan(
    @Query('planId') planId: string,
    @Headers('authorization') authHeader: string,
  ) {
    return this.planService.deletePlan(planId, authHeader);
  }
}
