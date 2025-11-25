import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Plans } from 'src/plan/plan.model';

@Table({ tableName: 'conva_items' })
export class ConvaItem extends Model {
  @PrimaryKey
  @Column({ type: DataType.UUID })
  id: string;

  @Column({ type: DataType.STRING, allowNull: false })
  type: string;

  @Column({ type: DataType.FLOAT, allowNull: false })
  x: number;

  @Column({ type: DataType.FLOAT, allowNull: false })
  y: number;

  @Column({ type: DataType.FLOAT, allowNull: false })
  width: number;

  @Column({ type: DataType.FLOAT, allowNull: false })
  height: number;

  @Column({ type: DataType.STRING, allowNull: false })
  fill: string;

  @Column({ type: DataType.STRING, allowNull: true })
  text: string;

  @Column({ type: DataType.INTEGER, allowNull: true })
  fontSize: number;

  @ForeignKey(() => Plans)
  @Column({ type: DataType.UUID, allowNull: false })
  plan_id: string;

  @BelongsTo(() => Plans)
  plan: Plans;
}
