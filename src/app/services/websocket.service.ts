import { Injectable } from "@angular/core";
import { Socket } from "ngx-socket-io";

import { Router } from "@angular/router";

@Injectable({
  providedIn: "root"
})
export class WebsocketService {
  socketStatus: boolean;

  constructor(private socket: Socket) {
    this.socketStatus = false;

    this.checkStatus();
  }

  checkStatus() {
    this.socket.on("connect", () => {
      console.log("Conectado al servidor");
      this.socketStatus = true;
    }); //con esto verificamos si el servidor esta arriba o no

    this.socket.on("disconnect", () => {
      console.log("Desconectado del servidor");
      this.socketStatus = false;
    });
  }
  //este es un evento generico encargo de emitir eventos al back
  emit(evento: string, payload?: any, callback?: Function) {
    this.socket.emit(evento, payload, callback); //estamos aqui emitiendo el evento al backend
  }
  //este es para escuchar los eventos que nos manden apartir del backend
  listen(evento: string) {
    return this.socket.fromEvent(evento);
  }
  //este vamos a mandar los datos para configurar el nombre.
}
