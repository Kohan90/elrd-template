import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ThirdPartyService } from './third-party.service';
import { ApiConfigService } from 'src/common/api-config/api.config.service';

@Controller('third-party')
export class ThirdPartyController {
    constructor(
        private readonly thirdPartyService: ThirdPartyService,
        private readonly apiConfigService: ApiConfigService
    ) {
        this.thirdPartyService.apiConfig = this.apiConfigService.getThirdPartyApiConfig('firstApi');
    }

    /**
     * 
     * @param client_id 
     * @returns 
     */
    @Get("/first-scenario/:client_id")
    @ApiResponse({
        status: 200,
        description: 'Start the first cryptography scenario',
    })
    async startFirstScenario(
        @Param('client_id') client_id: string,
    ): Promise<any> {
        return this.thirdPartyService.startFirstScenario(client_id);
    }

    /**
     * 
     * @param client_id 
     * @param force 
     * @returns 
     */
    @Get("/second-scenario/:client_id")
    @ApiResponse({
        status: 200,
        description: 'Start the second cryptography scenario',
    })
    async startSecondScenario(
        @Param('client_id') client_id: string,
        @Query('force') force?: boolean
    ): Promise<any> {
        return this.thirdPartyService.startSecondScenario(client_id, force);
    }
}
