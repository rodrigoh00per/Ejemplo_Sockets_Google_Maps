import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { Lugares } from "src/app/interface/lugares";
import { HttpClient } from "@angular/common/http";
import { WebsocketService } from "src/app/services/websocket.service";

@Component({
  selector: "app-mapa",
  templateUrl: "./mapa.component.html",
  styleUrls: ["./mapa.component.css"]
})
export class MapaComponent implements OnInit {
  @ViewChild("mapa") mapaElemento: ElementRef;
  mapita: google.maps.Map;

  lugares: Lugares[] = [];

  marcadores: google.maps.Marker[];

  infoWindows: google.maps.InfoWindow[];

  constructor(private _http: HttpClient, private _wsService: WebsocketService) {
    this.marcadores = [];
    this.infoWindows = [];
  }

  ngOnInit() {
    this._http
      .get("http://localhost:5000/api/mapa")
      .subscribe((lugares: any) => {
        this.lugares = lugares;
        this.cargarMapa();
        console.log(this.lugares);
      });
    this.escucharSockets();
  }

  escucharSockets() {
    //escuchar el socket de cuando se agregar

    this._wsService.listen("nuevo-marcador").subscribe((marcador: any) => {
      console.log("entre al socket de nuevo marcador");
      this.agregarMarcadores(marcador);
    });

    this._wsService.listen("eliminarMarcador").subscribe((id_marcador: any) => {
      console.log("entre al socket de eliminar marcador");
      for (let i = 0; i < this.marcadores.length; i++) {
        if (this.marcadores[i].getTitle() === id_marcador) {
          this.marcadores[i].setMap(null);
        }
      }
    });

    this._wsService
      .listen("modificar-marcador")
      .subscribe((marcadormodificado: any) => {
        console.log("SE MODIFICO EL MARCADOR");
        for (const i in this.marcadores) {
          if (this.marcadores[i].getTitle() === marcadormodificado.id) {
            let latylong = new google.maps.LatLng(
              marcadormodificado.lat,
              marcadormodificado.long
            );
            this.marcadores[i].setPosition(latylong);
          }
        }
      });
  }

  //ESTE METODO EJECUTA POR PRIMERA VEZ ALA EJECUTAR LA APLICACION
  cargarMapa() {
    let latlong = new google.maps.LatLng(19.4646402, -99.114158);

    let options: google.maps.MapOptions = {
      center: latlong,
      zoom: 18,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    this.mapita = new google.maps.Map(this.mapaElemento.nativeElement, options);

    this.mapita.addListener("click", coors => {
      let nuevomarcador1: Lugares = {
        id: new Date().toISOString(),
        nombre: "Nuevo Marcador",
        lat: coors.latLng.lat(),
        long: coors.latLng.lng()
      };
      this.agregarMarcadores(nuevomarcador1);
      //de aqui vamos a lanzar un respectivo socket

      this._wsService.emit("nuevo-marcador", nuevomarcador1);
    });

    this.lugares.forEach((lugarsillo: Lugares) => {
      this.agregarMarcadores(lugarsillo);
    });
  }

  agregarMarcadores(lugares: Lugares) {
    let latylong = new google.maps.LatLng(lugares.lat, lugares.long);

    let nuevomarcador = new google.maps.Marker({
      map: this.mapita,
      animation: google.maps.Animation.DROP,
      position: latylong,
      draggable: true,
      title: lugares.id
    });

    this.marcadores.push(nuevomarcador);

    let infoWindow = new google.maps.InfoWindow({ content: lugares.nombre });
    this.infoWindows.push(infoWindow);

    //evento para mostar el infowindow de cada marcador
    google.maps.event.addDomListener(nuevomarcador, "click", () => {
      this.infoWindows.forEach(infwin => {
        infwin.close();
      });
      infoWindow.open(this.mapita, nuevomarcador);
      console.log(this.infoWindows);
    });
    //evento para borrar el marcador
    google.maps.event.addDomListener(nuevomarcador, "dblclick", () => {
      this._wsService.emit("eliminarMarcador", nuevomarcador.getTitle());
      nuevomarcador.setMap(null);
    });

    google.maps.event.addDomListener(nuevomarcador, "drag", coords => {
      /*   console.log(coords); */
      let nuevomarcadorsito = {
        id: nuevomarcador.getTitle(),
        nombre: lugares.nombre,
        lat: coords.latLng.lat(),
        long: coords.latLng.lng()
      };
      console.log(nuevomarcadorsito);

      this._wsService.emit("modificar-marcador", nuevomarcadorsito);
    });
  }
}
