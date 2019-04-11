import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { AppComponent } from "./app.component";
import { MapaComponent } from "./components/mapa/mapa.component";
import { SocketIoModule, SocketIoConfig } from "ngx-socket-io";
import { HttpClientModule } from "@angular/common/http";

const config: SocketIoConfig = { url: "http://localhost:5000", options: {} };
@NgModule({
  declarations: [AppComponent, MapaComponent],
  imports: [BrowserModule, SocketIoModule.forRoot(config), HttpClientModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
