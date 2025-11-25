import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { ConvaItem } from 'src/conva-items/conva-items.model';
import { Rooms } from 'src/rooms/rooms.model';
import { Users } from 'src/user/user.model';

export interface PlansCreationAttrs {
  name: string;
  number: number;
  user_id: string;
  room_id: string;
}

@Table({ tableName: 'plans' })
export class Plans extends Model<Plans, PlansCreationAttrs> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID })
  id: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING })
  name: string;

  @AllowNull(false)
  @Column({ type: DataType.INTEGER })
  number: number;

  @AllowNull(false)
  @ForeignKey(() => Users)
  @Column({ type: DataType.UUID })
  user_id: string;

  @AllowNull(false)
  @ForeignKey(() => Rooms)
  @Column({ type: DataType.UUID })
  room_id: string;

  @BelongsTo(() => Users)
  users: Users;

  @BelongsTo(() => Rooms)
  room: Rooms;

  @HasMany(() => ConvaItem)
  conva_items: ConvaItem[]
}
