import { Module } from "@nestjs/common";
import { ExampleModule } from "./example/example.module";
import { TestSocketModule } from "./test-sockets/test.socket.module";
import { TokenModule } from "./tokens/token.module";
import { UsersModule } from "./users/user.module";
import { ThirdPartyModule } from "./third-party/third-party.module";

@Module({
  imports: [
    ExampleModule,
    TestSocketModule,
    UsersModule,
    TokenModule,
    ThirdPartyModule,
  ],
  exports: [
    ExampleModule, TestSocketModule, UsersModule, TokenModule, ThirdPartyModule,
  ],
})
export class EndpointsServicesModule { }