import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, map } from 'rxjs';
import { MessageDto } from './entities/dto/message.dto';
import { SignedMessageDto } from './entities/dto/signedMessage.dto';
import { SignedJWTMessageDto } from './entities/dto/signedJWTMessage.dto';
import { SignatureDto } from './entities/dto/signature.dto';
import { ApiConfigDto } from './entities/dto/apiConfig.dto';
import { CachingService } from 'src/common/caching/caching.service';
import Crypto = require('crypto');
import { readFileSync } from 'fs';
import { join } from 'path';

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
        private httpService: HttpService,
        private cachingService: CachingService
    ) { }

    /**
     * 
     * @param client_id 
     * @returns 
     */
    async startFirstScenario(client_id: string): Promise<any> {
        try {
            const signatureObject = await this.getTokenSignature(client_id);

            return await this.performThirdPartyAction(signatureObject.token, signatureObject.signature);

        } catch (error: any) {
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
    async startSecondScenario(client_id: string, force?: boolean): Promise<any> {
        try {
            const jwt = await this.generateThirdPartyCredentials(client_id, force);

            for (let i = 0; i < 10; i++) {
                console.log('Performing action ' + i + ' for jwt ' + jwt);

                await this.performThirdPartyCredentialsAction(jwt, client_id, i);
            }

            return '<h2>Second scenario finished!</h2>';
        } catch (error: any) {
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
    async generateThirdPartyCredentials(client_id: string, force?: boolean): Promise<any> {
        try {
            const generatedJwt = await this.cachingService.getCacheRemote('elrond-' + client_id);

            if (generatedJwt) {
                return generatedJwt;
            } else {
                if (force) {
                    const signatureObject = await this.getTokenSignature(client_id);

                    const jwtToken = await this.getThirdPartyCredentials(signatureObject.token, signatureObject.signature, client_id);

                    return await this.cachingService.setCacheRemote('elrond-' + client_id, jwtToken.jwtToken, 3600);
                } else {
                    throw new UnauthorizedException('JWT not valid!');
                }
            }
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
    async getTokenSignature(client_id: string): Promise<SignatureDto> {
        const token = await this.getThirdPartyToken(client_id);

        const privateKey = readFileSync(join(__dirname, '..', '..', '..', '..', 'keys', 'private.pem'));

        const signature = Crypto.sign("sha256",
            Buffer.from(token.data.value),
            {
                key: privateKey,
                padding: Crypto.constants.RSA_PKCS1_PSS_PADDING,
            }
        );

        return {
            token: token.data.value,
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
        const publicKey = readFileSync(join(__dirname, '..', '..', '..', '..', 'keys', 'public.pem'), 'utf8');

        message.client_id = client_id;
        message.token_type = '1';
        message.public_key = publicKey;

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
        const message = new SignedMessageDto();

        message.token = token;
        message.signature = signature;

        if (this.apiConfig) {
            return await firstValueFrom(this.httpService.post(this.apiConfig.baseUrl + this.apiConfig.endpoints.action, message).pipe(
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
    async performThirdPartyCredentialsAction(jwt: string, client_id: string, increment: number): Promise<any> {
        const message = new SignedJWTMessageDto();

        message.jwt = jwt;
        message.client_id = client_id;

        if (this.apiConfig) {
            return await firstValueFrom(this.httpService.post(this.apiConfig.baseUrl + this.apiConfig.endpoints.authAction + '/' + increment, message).pipe(
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
    async getThirdPartyCredentials(token: string, signature: string, client_id: string): Promise<any> {
        const message = new SignedMessageDto();

        message.token = token;
        message.signature = signature;
        message.client_id = client_id;

        if (this.apiConfig) {
            return await firstValueFrom(this.httpService.post(this.apiConfig.baseUrl + this.apiConfig.endpoints.credentials, message).pipe(
                map(response => response.data),
            ));
        }
    }
}