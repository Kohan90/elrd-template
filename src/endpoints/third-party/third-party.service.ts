import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, map } from 'rxjs';
import { MessageDto } from './entities/dto/message.dto';
import { SignatureDto } from './entities/dto/signature.dto';
import { ApiConfigDto } from './entities/dto/apiConfig.dto';
import { UserSecretKey, UserWallet } from '@elrondnetwork/erdjs/out';

@Injectable()
export class ThirdPartyService {
    private _apiConfig?: ApiConfigDto | undefined;

    public get apiConfig(): ApiConfigDto | undefined {
        return this._apiConfig;
    }
    public set apiConfig(value: ApiConfigDto | undefined) {
        this._apiConfig = value;
    }

    constructor(
        private httpService: HttpService
    ) { }

    /**
     * 
     * @param client_id 
     * @returns 
     */
    async startFirstScenario(wallet: UserWallet, secretKey: UserSecretKey): Promise<any> {
        try {
            const signatureObject = await this.getTokenSignature(wallet, secretKey);

            return await this.performThirdPartyAction(signatureObject.token, signatureObject.signature);
        } catch (error: any) {
            console.log(error);
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                error: error.response?.data,
            }, error.response?.status);
        }
    }

    /**
     * 
     * @param client_id 
     * @param forceRegeneration 
     * @returns 
     */
    async startSecondScenario(wallet: UserWallet, secretKey: UserSecretKey): Promise<any> {
        try {
            const jwt = await this.generateThirdPartyCredentials(wallet, secretKey);

            for (let i = 0; i < 10; i++) {
                console.log('Performing action ' + i + ' for jwt ' + jwt.jwt);

                await this.performThirdPartyCredentialsAction(jwt.jwt);
            }

            return '<h2>Second scenario finished!</h2>';
        } catch (error: any) {
            console.log(error);
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                error: error.response?.data,
            }, error.response?.status);
        }
    }

    /**
     * 
     * @param client_id 
     * @param forceRegeneration 
     * @returns 
     */
    async generateThirdPartyCredentials(wallet: UserWallet, secretKey: UserSecretKey): Promise<any> {
        try {
            const signatureObject = await this.getTokenSignature(wallet, secretKey);

            return await this.getThirdPartyCredentials(signatureObject.token, signatureObject.signature);
        } catch (error: any) {
            console.log(error);
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                error: error.response?.data,
            }, error.response?.status);
        }
    }

    /**
     * 
     * @param client_id 
     * @returns 
     */
    async getTokenSignature(wallet: UserWallet, secretKey: UserSecretKey): Promise<SignatureDto> {
        const token = await this.getThirdPartyToken(wallet.toJSON().bech32);

        const signature = secretKey.sign(Buffer.from(token.data.token, 'base64'));

        return {
            token: token.data.token,
            signature: signature.toString('base64'),
        };
    }

    /**
     * 
     * @param client_id 
     * @returns 
    */
    async getThirdPartyToken(client_id: string): Promise<any> {
        const message = new MessageDto();

        message.client_id = client_id;

        if (this.apiConfig) {
            return await firstValueFrom(this.httpService.post(this.apiConfig.baseUrl + this.apiConfig.endpoints.token, message));
        }
    }

    /**
     * 
     * @param token 
     * @param signature 
     * @returns 
     */
    async performThirdPartyAction(token: string, signature: string): Promise<any> {
        const headersRequest = {
            'Authorization': `Bearer ` + token,
            'Signature': `Bearer ` + signature,
        };

        if (this.apiConfig) {
            return await firstValueFrom(this.httpService.post(this.apiConfig.baseUrl + this.apiConfig.endpoints.action, {}, { headers: headersRequest }).pipe(
                map(response => response.data),
            ));
        }
    }

    /**
     * 
     * @param token 
     * @param signature 
     * @returns 
     */
    async performThirdPartyCredentialsAction(jwt: string): Promise<any> {
        const headersRequest = {
            'Authorization': `Bearer ` + jwt,
        };

        if (this.apiConfig) {
            return await firstValueFrom(this.httpService.post(this.apiConfig.baseUrl + this.apiConfig.endpoints.authAction, {}, { headers: headersRequest }).pipe(
                map(response => response.data),
            ));
        }
    }

    /**
     * 
     * @param token 
     * @param signature 
     * @returns 
     */
    async getThirdPartyCredentials(token: string, signature: string): Promise<any> {
        const headersRequest = {
            'Authorization': `Bearer ` + token,
            'Signature': `Bearer ` + signature,
        };

        if (this.apiConfig) {
            return await firstValueFrom(this.httpService.post(this.apiConfig.baseUrl + this.apiConfig.endpoints.credentials, {}, { headers: headersRequest }).pipe(
                map(response => response.data),
            ));
        }
    }
}