import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import fs from 'fs';
import path from 'path';
import { Application } from 'express';

// Define swagger options
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "BookHub API",
            version: "1.0.0",
            description: "Documentación de mi API modular",
        },
        servers: [
            {
                url: "http://localhost:5000/api",
                description: "Servidor de desarrollo",
            },
        ],
    },
    apis: ["./src/app/**/*.controller.ts", "./src/server/api/api.ts"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export function setupSwagger(app: Application) {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

export { swaggerSpec };

const outputJsonPath = path.join(__dirname, '../../swagger/swagger.json');
fs.writeFileSync(outputJsonPath, JSON.stringify(swaggerSpec, null, 2));

import { stringify } from 'yaml';
const outputYamlPath = path.join(__dirname, '../../swagger/swagger.yaml');
fs.writeFileSync(outputYamlPath, stringify(swaggerSpec));