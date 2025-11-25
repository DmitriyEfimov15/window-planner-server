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
import { Rooms } from 'src/rooms/rooms.model';
import { Users } from 'src/user/user.model';

export interface ObjectsCreationAttr {
  user_id: string
  name: string
  number: number
}

@Table({ tableName: 'objects' })
export class Objects extends Model<Objects, ObjectsCreationAttr> {
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

  @BelongsTo(() => Users)
  users: Users;

  @HasMany(() => Rooms)
  rooms: Rooms[]
}
