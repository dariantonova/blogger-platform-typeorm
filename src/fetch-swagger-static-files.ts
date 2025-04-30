import { createWriteStream } from 'fs';
import { get } from 'http';

export const fetchSwaggerStaticFiles = (port: number) => {
  const serverUrl = 'http://localhost:' + port;

  get(`${serverUrl}/swagger/swagger-ui-bundle.js`, function (response) {
    response.pipe(createWriteStream('swagger-static/swagger-ui-bundle.js'));
    console.log(
      `Swagger UI bundle file written to: '/swagger-static/swagger-ui-bundle.js'`,
    );
  });

  get(`${serverUrl}/swagger/swagger-ui-init.js`, function (response) {
    response.pipe(createWriteStream('swagger-static/swagger-ui-init.js'));
    console.log(
      `Swagger UI init file written to: '/swagger-static/swagger-ui-init.js'`,
    );
  });

  get(
    `${serverUrl}/swagger/swagger-ui-standalone-preset.js`,
    function (response) {
      response.pipe(
        createWriteStream('swagger-static/swagger-ui-standalone-preset.js'),
      );
      console.log(
        `Swagger UI standalone preset file written to: '/swagger-static/swagger-ui-standalone-preset.js'`,
      );
    },
  );

  get(`${serverUrl}/swagger/swagger-ui.css`, function (response) {
    response.pipe(createWriteStream('swagger-static/swagger-ui.css'));
    console.log(
      `Swagger UI css file written to: '/swagger-static/swagger-ui.css'`,
    );
  });
};
