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
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/createRoom.dto';
import { UpdateRoomDto } from './dto/udpateRoom.dto';

@Controller('rooms')
export class RoomsController {
  constructor(private roomsService: RoomsService) {}

  @Get('/')
  @UseGuards(JwtAuthGuard)
  getAllRooms(
    @Query('search') search: string,
    @Query('objectId') objectId: string,
    @Headers('authorization') authHeader: string,
  ) {
    return this.roomsService.getAllRooms(search, objectId, authHeader);
  }

  @Post('/')
  @UseGuards(JwtAuthGuard)
  createRoom(
    @Body() createRoomDto: CreateRoomDto,
    @Headers('authorization') authHeader: string,
  ) {
    return this.roomsService.createRoom(createRoomDto, authHeader);
  }

  @Put('/')
  @UseGuards(JwtAuthGuard)
  updateRoom(
    @Body() updateRoomDto: UpdateRoomDto,
    @Query('roomId') roomId: string,
    @Headers('authorization') authHeader: string,
  ) {
    return this.roomsService.updateRoom(updateRoomDto, roomId, authHeader);
  }

  @Delete('/')
  @UseGuards(JwtAuthGuard)
  deleteRoom(
    @Query('roomId') roomId: string,
    @Headers('authorization') authHeader: string,
  ) {
    return this.roomsService.deleteRoom(roomId, authHeader)
  }
}
