import "dotenv/config";

import {
  inquirerMenu,
  leerInput,
  listadoLugares,
  pausa,
} from "./helpers/inquirer.js";
import { Busquedas } from "./models/busquedas.js";

const main = async () => {
  const busquedas = new Busquedas();
  let opt;

  do {
    opt = await inquirerMenu();

    switch (opt) {
      case 1:
        // Mostrar mensaje
        const lugar = await leerInput("Ciudad: ");
        // Buscar lugares
        const lugares = await busquedas.ciudad(lugar);
        // Seleccionar lugar
        const id = await listadoLugares(lugares);
        if (id === "0") continue;

        const lugarSeleccionado = lugares.find((lugar) => lugar.id === id);

        // Guardar en DB
        busquedas.agregarHistorial(lugarSeleccionado.name);

        console.log(lugarSeleccionado);

        // Clima
        const clima = await busquedas.climaLugar(
          lugarSeleccionado.lat,
          lugarSeleccionado.lng
        );

        // Mostrar resultados
        console.clear();
        console.log("\nInformacion de lugar\n".green);
        console.log("Ciudad:", lugarSeleccionado.name.green);
        console.log("Lat:", lugarSeleccionado.lat);
        console.log("Lng:", lugarSeleccionado.lng);
        console.log("Temperatura:", clima.temp);
        console.log("Minima:", clima.min);
        console.log("Maxima:", clima.max);
        console.log("Cómo está el clima:", clima.desc.green);
        break;

      case 2:
        busquedas.historialCapitalizado.forEach((lugar, i) => {
          const idx = `${i + 1}`.green;
          console.log(`${idx} ${lugar}`);
        });
        break;
    }

    if (opt !== 0) await pausa();
  } while (opt !== 0);
};

main();
