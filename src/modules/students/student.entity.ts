import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('estudiantes')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  nombre: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  apellido: string;

  @Column({ type: 'varchar', length: 50, nullable: false, unique: true })
  codigo: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  fechaCreacion: Date;
}
