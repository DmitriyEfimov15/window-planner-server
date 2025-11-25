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
import { Objects } from 'src/objects/objects.model';
import { Plans } from 'src/plan/plan.model';
import { Users } from 'src/user/user.model';

export interface RoomsCreationAttr {
  user_id: string;
  name: string;
  number: number;
  object_id: string;
}

@Table({ tableName: 'rooms' })
export class Rooms extends Model<Rooms, RoomsCreationAttr> {
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
  @ForeignKey(() => Objects)
  @Column({ type: DataType.UUID })
  object_id: string;

  @BelongsTo(() => Users)
  users: Users;

  @BelongsTo(() => Objects)
  object: Objects;

  @HasMany(() => Plans)
  plans: Plans[];
}
