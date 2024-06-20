// The file is where we place helper/util functions, constants, etc...

export const TEMPERATURE_API_URL = 'https://api.open-meteo.com/v1/forecast?latitude={{LATITUDE}}&longitude={{LONGITUDE}}&current=temperature_2m';

export const HUMIDITY_API_URL = 'https://api.open-meteo.com/v1/forecast?latitude={{LATITUDE}}&longitude={{LONGITUDE}}&current=relative_humidity_2m';
