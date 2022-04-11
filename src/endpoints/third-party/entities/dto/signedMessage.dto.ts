export class SignedMessageDto {
  token: string | undefined;
  signature: string | undefined;
  publicKey: string | undefined;
  client_id: string | undefined;
}