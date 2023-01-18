#!/usr/bin/env node

import { program } from "commander";
import { processEvents } from "./index";

program
  .version("0.0.1")
  .option("-f, --yml <string>", "YML file to load")
  .action((props, options) => { 
    processEvents(props);
  });

program.parse(process.argv);
