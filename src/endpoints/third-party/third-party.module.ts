import { CacheModule, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DatabaseModule } from 'src/common/database/database.module';
import { ThirdPartyService } from './third-party.service';
import { ApiConfigService } from 'src/common/api-config/api.config.service';
import { ConfigService } from '@nestjs/config';
import { CachingService } from 'src/common/caching/caching.service';
import { ApiService } from 'src/common/network/api.service';
import { MetricsService } from 'src/common/metrics/metrics.service';

@Module({
    imports: [DatabaseModule, HttpModule, CacheModule.register()],
    providers: [ThirdPartyService, ApiConfigService, ConfigService, CachingService, ApiService, MetricsService],
    exports: [ThirdPartyService, ApiConfigService, ConfigService, CachingService, ApiService, MetricsService],

})
export class ThirdPartyModule { }
