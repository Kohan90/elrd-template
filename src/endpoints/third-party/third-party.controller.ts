import { Controller, Get } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ThirdPartyService } from './third-party.service';
import { ApiConfigService } from 'src/common/api-config/api.config.service';
import Crypto = require('crypto');
import {
    UserWallet,
    UserSecretKey,
} from "@elrondnetwork/erdjs";

@Controller('third-party')
export class ThirdPartyController {
    private secretKey?: UserSecretKey;
    private wallet?: UserWallet;

    constructor(
        private readonly thirdPartyService: ThirdPartyService,
        private readonly apiConfigService: ApiConfigService
    ) {
        if (!this.wallet) {
            this.secretKey = new UserSecretKey(Buffer.from(Crypto
                .randomBytes(32)
                .toString('base64')
                .slice(0, 32)));

            this.wallet = new UserWallet(this.secretKey, Crypto.randomBytes(16).toString('base64'));
        }

        this.thirdPartyService.apiConfig = this.apiConfigService.getThirdPartyApiConfig('firstApi');
    }

    /**
     * 
     * @param client_id 
     * @returns 
     */
    @Get("/first-scenario/")
    @ApiResponse({
        status: 200,
        description: 'Start the first cryptography scenario',
    })
    async startFirstScenario(
    ): Promise<any> {
        if (this.wallet && this.secretKey)
            return this.thirdPartyService.startFirstScenario(this.wallet, this.secretKey);
    }

    /**
     * 
     * @param client_id 
     * @param force 
     * @returns 
     */
    @Get("/second-scenario/")
    @ApiResponse({
        status: 200,
        description: 'Start the second cryptography scenario',
    })
    async startSecondScenario(): Promise<any> {
        if (this.wallet && this.secretKey)
            return this.thirdPartyService.startSecondScenario(this.wallet, this.secretKey);
    }
}
