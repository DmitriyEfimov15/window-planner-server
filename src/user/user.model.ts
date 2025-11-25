import {
  AllowNull,
  Column,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';
import { Objects } from 'src/objects/objects.model';
import { Plans } from 'src/plan/plan.model';
import { Role } from 'src/role/role.model';
import { Rooms } from 'src/rooms/rooms.model';

interface UserCreationAttr {
  email: string;
  password: string;
  name: string;
  surname: string;
  activation_code: string;
  role_id: string;
}

@Table({ tableName: 'users' })
export class Users extends Model<Users, UserCreationAttr> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID })
  id: string;

  @Unique
  @Column({ type: DataType.STRING })
  email: string;

  @Column({ type: DataType.STRING })
  password: string;

  @Column({ type: DataType.STRING })
  surname: string;

  @Column({ type: DataType.STRING })
  name: string;

  @Column({ type: DataType.BOOLEAN })
  is_email_verified: boolean;

  @ForeignKey(() => Role)
  @Column({ type: DataType.UUID })
  role_id: string;

  @AllowNull(true)
  @Column({ type: DataType.STRING })
  activation_code: string | null;

  @AllowNull(true)
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID })
  activation_link: string | null;

  @HasMany(() => Objects)
  objects: Objects[];

  @HasMany(() => Rooms)
  rooms: Rooms[];

  @HasMany(() => Plans)
  plans: Plans[];
}
