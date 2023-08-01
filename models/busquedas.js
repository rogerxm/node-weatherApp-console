import fs from "fs";
import axios from "axios";
import { hasSubscribers } from "diagnostics_channel";

export class Busquedas {
  historial = [];
  dbPath = "./db/database.json";

  constructor() {
    // TODO: leer DB si existe
    this.leerDB();
  }

  get historialCapitalizado() {
    return this.historial.map((lugar) => {
      let palabras = lugar.split(" ");
      palabras = palabras.map((p) => p[0].toUpperCase() + p.substring(1));

      return palabras.join(" ");
    });
  }

  get paramsMapbox() {
    return {
      languaje: "es",
      access_token: process.env.MAPBOX_KEY,
    };
  }

  get paramsOpenWeather() {
    return {
      appid: process.env.OPENWEATHER_KEY,
      lang: "es",
      units: "metric",
    };
  }

  async ciudad(lugar) {
    try {
      const instance = axios.create({
        baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
        params: this.paramsMapbox,
      });

      const resp = await instance.get();

      return resp.data.features.map((lugar) => ({
        id: lugar.id,
        name: lugar.place_name,
        lng: lugar.center[0],
        lat: lugar.center[1],
      }));
    } catch (error) {
      return [];
    }
  }

  async climaLugar(lat, lon) {
    try {
      const key = process.env.OPENWEATHER_KEY;
      const instance = axios.create({
        baseURL: `https://api.openweathermap.org/data/2.5/weather`,
        params: { ...this.paramsOpenWeather, lat, lon },
      });

      const resp = await instance.get();
      const { weather, main } = resp.data;

      return {
        desc: weather[0].description,
        temp: main.temp,
        max: main.temp_max,
        min: main.temp_min,
      };
    } catch (error) {
      console.log(error);
    }
  }

  agregarHistorial(lugar) {
    if (this.historial.includes(lugar.toLowerCase())) {
      return;
    }

    this.historial.unshift(lugar.toLowerCase());

    this.guardarDB();
  }

  guardarDB() {
    const payload = {
      historial: this.historial,
    };
    fs.writeFileSync(this.dbPath, JSON.stringify(payload));
  }

  leerDB() {
    if (!fs.existsSync(this.dbPath)) return;

    const info = fs.readFileSync(this.dbPath, { encoding: "utf-8" });
    const data = JSON.parse(info);

    console.log(data);
    // this.historial = { ...this.historial, data };
    this.historial = data.historial;
  }
}
