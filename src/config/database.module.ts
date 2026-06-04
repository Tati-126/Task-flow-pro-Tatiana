import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, isAbsolute } from 'node:path';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbPort = Number(configService.get<string>('DB_PORT') ?? 3306);
        const dbUsername =
          configService.get<string>('DB_USERNAME') ??
          configService.getOrThrow<string>('DB_USER');
        const dbDatabase =
          configService.get<string>('DB_DATABASE') ??
          configService.getOrThrow<string>('DB_NAME');
        const nodeEnv = configService.get<string>('NODE_ENV') ?? 'development';

        const dbSslMode =
          configService.get<string>('DB_SSL_MODE')?.toUpperCase() ?? '';
        const dbSslSelfSigned =
          configService.get<string>('DB_SSL_SELF_SIGNED')?.toLowerCase() === 'true';
        const dbSslCa = configService.get<string>('DB_SSL_CA');
        const dbSslCaPath = configService.get<string>('DB_SSL_CA_PATH');
        const useSsl =
          dbSslMode === 'REQUIRED' ||
          dbSslMode === 'TRUE' ||
          dbSslMode === 'ENABLED';

        let ca: string | undefined;
        if (dbSslCaPath) {
          const caPath = isAbsolute(dbSslCaPath)
            ? dbSslCaPath
            : resolve(process.cwd(), dbSslCaPath);
          if (existsSync(caPath)) {
            ca = readFileSync(caPath, 'utf8');
          }
        }
        if (!ca && dbSslCa) {
          ca = dbSslCa.replace(/\\n/g, '\n');
        }

        const sslOptions: Record<string, any> | undefined = useSsl
          ? {
              rejectUnauthorized: !dbSslSelfSigned,
              ...(ca ? { ca } : {}),
            }
          : undefined;

        return {
          type: 'mysql',
          host: configService.get<string>('DB_HOST') ?? 'localhost',
          port: Number.isNaN(dbPort) ? 3306 : dbPort,
          username: dbUsername,
          password: configService.getOrThrow<string>('DB_PASSWORD'),
          database: dbDatabase,
          ssl: sslOptions,
          autoLoadEntities: true,
          // En desarrollo, sincronizar automáticamente. En producción, usar migraciones
          synchronize: nodeEnv === 'development',
          logging: nodeEnv === 'development',
        };
      },
    }),
  ],
})
export class DatabaseModule {}
