import { ApiConfigEndpointsDto } from "./apiConfigEndpoints.dto";

export class ApiConfigDto {
  baseUrl!: string;
  endpoints!: ApiConfigEndpointsDto;
}