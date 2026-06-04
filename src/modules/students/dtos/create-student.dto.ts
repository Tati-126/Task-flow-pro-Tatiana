import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  apellido: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  codigo: string;
}
