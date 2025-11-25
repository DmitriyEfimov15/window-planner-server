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
import { ObjectsService } from './objects.service';
import { CreateObjectDto } from './dto/createObject.dto';
import { UpdateObjectDto } from './dto/updateObject.dto';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';

@Controller('objects')
export class ObjectsController {
  constructor(private objectsService: ObjectsService) {}

  @Get('/')
  @UseGuards(JwtAuthGuard)
  getAllObjects(
    @Headers('authorization') authHeader: string,
    @Query('search') search: string,
  ) {
    return this.objectsService.getAllObjects(search, authHeader);
  }

  @Post('/')
  @UseGuards(JwtAuthGuard)
  createObject(
    @Body() body: CreateObjectDto,
    @Headers('authorization') authHeader: string,
  ) {
    return this.objectsService.createObject(body.name, body.number, authHeader);
  }

  @Put('/')
  @UseGuards(JwtAuthGuard)
  updateObject(
    @Body() body: UpdateObjectDto,
    @Headers('authorization') authHeader: string,
    @Query('objectId') objectId: string,
  ) {
    return this.objectsService.updateObject(
      objectId,
      authHeader,
      body.name,
      body.number,
    );
  }

  @Delete('/')
  @UseGuards(JwtAuthGuard)
  deleteObject(
    @Query('objectId') objectId: string,
    @Headers('authorization') authHeader: string,
  ) {
    return this.objectsService.deleteObject(objectId, authHeader);
  }
}
